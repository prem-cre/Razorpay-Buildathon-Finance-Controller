"""Layer 2 — fuzzy & recovery matching (rules R2.1-R2.4).

Layer 2 only ever looks at payments Layer 1 left `unresolved`. It never
overturns a Layer 1 decision. Its job is to recover recall that Layer 1
conservatively gave up — WITHOUT sacrificing precision. Every Layer 2 match
still requires the order amount to agree with the payment amount, so anomalous
records (FX deltas, duplicate captures, chargebacks, true unknowns) are not
swept in.

Rules (each applied to a Layer-1 `unresolved` payment, in priority order):

  R2.1 Fuzzy UTR bank link — settlement UTR not found in bank verbatim, but a
       bank narration carries it within Levenshtein distance <= 2 (OCR / typo).
  R2.2 Partial reference link — the order's payment_reference is a truncated
       prefix of the real payment_id (>= 10 chars); relink, then match.
  R2.3 Split-payment reconstruction — several payments share an order_id and
       their gross sums to the order total; reconstruct the order and match.
  R2.4 Refund-netted residual — a settlement batch fails Layer 1's aggregate
       only because a refund was netted from the bank credit. Recover the
       refund amount from the order's refunded amount, subtract it, and if the
       batch then reconciles, release the clean (non-refunded) siblings.

Output confidence is MEDIUM (deterministic evidence, but a recovery inference).
"""
from __future__ import annotations

from collections import defaultdict
from typing import Optional

from decimal import Decimal, ROUND_HALF_UP

from .matcher import MatchResult, AMOUNT_TOLERANCE_PAISE, FEE_RATES, GST_RATE
from .audit import AuditTrail
from .models import CanonicalDataset, CanonicalPayment


def levenshtein(a: str, b: str, cap: int = 3) -> int:
    """Standard edit distance, short-circuiting once it exceeds `cap`."""
    if a == b:
        return 0
    la, lb = len(a), len(b)
    if abs(la - lb) > cap:
        return cap + 1
    prev = list(range(lb + 1))
    for i in range(1, la + 1):
        cur = [i] + [0] * lb
        best = cur[0]
        for j in range(1, lb + 1):
            cost = 0 if a[i - 1] == b[j - 1] else 1
            cur[j] = min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
            best = min(best, cur[j])
        if best > cap:
            return cap + 1
        prev = cur
    return prev[lb]


class Layer2Matcher:
    def __init__(self, data: CanonicalDataset, layer1_results: list[MatchResult]) -> None:
        self.data = data
        self.l1 = {r.record_key: r for r in layer1_results}
        self.audit = AuditTrail()

        self.order_by_payref = {o.payment_reference: o for o in data.orders if o.payment_reference}
        self.payment_by_id = {p.payment_id: p for p in data.payments}
        self.settlement_by_id = {s.settlement_id: s for s in data.settlements}

        self.pays_by_settlement: dict[str, list[CanonicalPayment]] = defaultdict(list)
        self.pays_by_orderid: dict[str, list[CanonicalPayment]] = defaultdict(list)
        for p in data.payments:
            if p.settlement_id:
                self.pays_by_settlement[p.settlement_id].append(p)
            self.pays_by_orderid[p.order_id].append(p)

        self.bank_credits = [b for b in data.bank_txns if b.is_credit and b.extracted_utr]
        self.bank_by_utr: dict[str, list] = defaultdict(list)
        for b in self.bank_credits:
            self.bank_by_utr[b.extracted_utr].append(b)

    # ---- helpers ----------------------------------------------------------
    def _order_amount_ok(self, order, p: CanonicalPayment) -> bool:
        return order is not None and abs(order.total_paise - p.amount_paise) <= AMOUNT_TOLERANCE_PAISE

    def _deposit_for_utr(self, utr: str) -> Optional[int]:
        rows = self.bank_by_utr.get(utr)
        if not rows:
            return None
        return sum(r.deposit_paise or 0 for r in rows)

    def _batch_settled_sum(self, settlement_id: str) -> int:
        return sum(p.settled_amount_paise for p in self.pays_by_settlement.get(settlement_id, []))

    def _config_fee_gst(self, method: str, amount_paise: int) -> tuple[int, int]:
        """Expected fee and GST for an amount, from the MDR config."""
        rate = FEE_RATES.get(method.lower())
        if rate is None:
            return -1, -1  # unknown method -> cannot verify
        fee = int((Decimal(amount_paise) * rate).quantize(Decimal("1"), rounding=ROUND_HALF_UP))
        gst = int((Decimal(fee) * GST_RATE).quantize(Decimal("1"), rounding=ROUND_HALF_UP))
        return fee, gst

    def _fee_clean(self, p: CanonicalPayment) -> bool:
        """True if the payment's stored fee+GST match the config (no fee drift)."""
        fee, gst = self._config_fee_gst(p.method, p.amount_paise)
        if fee < 0:
            return False
        return abs(p.fee_paise - fee) <= 2 and abs(p.tax_paise - gst) <= 2

    def _refund_bank_reduction(self, refunded_paise: int, method: str) -> int:
        """Net reduction to the bank credit for a refund: the refunded amount
        less the fee+GST that reverse with it."""
        fee, gst = self._config_fee_gst(method, refunded_paise)
        if fee < 0:
            return refunded_paise
        return refunded_paise - fee - gst

    # ---- public -----------------------------------------------------------
    def refine(self) -> list[MatchResult]:
        out: list[MatchResult] = []
        for p in self.data.payments:
            r = self.l1[p.payment_id]
            if r.match_status != "unresolved":
                out.append(r)
                continue
            recovered = (self._r21(p) or self._r22(p) or self._r23(p) or self._r24(p))
            out.append(recovered if recovered else r)
        return out

    def _decide(self, key, rule, status, evidence, confidence="MEDIUM") -> MatchResult:
        self.audit.emit(record_key=key, rule=rule, confidence=confidence,
                        match_status=status, evidence=evidence, layer=2)
        return MatchResult(record_key=key, layer=2, rule=rule, confidence=confidence,
                           match_status=status, evidence=evidence)

    # ---- R2.1 fuzzy UTR bank link ----------------------------------------
    def _r21(self, p: CanonicalPayment) -> Optional[MatchResult]:
        s = self.settlement_by_id.get(p.settlement_id) if p.settlement_id else None
        order = self.order_by_payref.get(p.payment_id)
        if not s or not order or not self._order_amount_ok(order, p):
            return None
        if self._deposit_for_utr(s.utr) is not None:
            return None  # exact link exists; not a Layer 2 case
        best = None
        for b in self.bank_credits:
            d = levenshtein(s.utr, b.extracted_utr, cap=2)
            if d <= 2 and (best is None or d < best[0]):
                best = (d, b)
        if not best:
            return None
        b = best[1]
        deposit = b.deposit_paise or 0
        settled_sum = self._batch_settled_sum(s.settlement_id)
        if abs(settled_sum - deposit) > AMOUNT_TOLERANCE_PAISE:
            return None
        ev = {"payment_id": p.payment_id, "order": order.name, "settlement_utr": s.utr,
              "bank_utr": b.extracted_utr, "utr_edit_distance": best[0],
              "bank_row": b.row_index, "bank_deposit_paise": deposit,
              "settled_sum_paise": settled_sum,
              "reason": f"UTR '{s.utr}' matched bank '{b.extracted_utr}' at edit distance {best[0]}"}
        return self._decide(p.payment_id, "R2.1_utr_variant_fuzzy", "matched", ev)

    # ---- R2.2 partial reference link -------------------------------------
    def _r22(self, p: CanonicalPayment) -> Optional[MatchResult]:
        if self.order_by_payref.get(p.payment_id):
            return None  # already has an exact order link
        match_order = None
        for ref, order in self.order_by_payref.items():
            if len(ref) >= 10 and (p.payment_id.startswith(ref) or ref.startswith(p.payment_id[:len(ref)])):
                if p.payment_id[:len(ref)] == ref:
                    match_order = order
                    break
        if not match_order or not self._order_amount_ok(match_order, p):
            return None
        s = self.settlement_by_id.get(p.settlement_id) if p.settlement_id else None
        if not s:
            return None
        deposit = self._deposit_for_utr(s.utr)
        if deposit is None:
            return None
        settled_sum = self._batch_settled_sum(s.settlement_id)
        if abs(settled_sum - deposit) > AMOUNT_TOLERANCE_PAISE:
            return None
        ev = {"payment_id": p.payment_id, "order": match_order.name,
              "matched_on": "truncated payment_reference prefix",
              "settlement_utr": s.utr, "bank_deposit_paise": deposit}
        return self._decide(p.payment_id, "R2.2_ref_partial_prefix", "matched", ev)

    # ---- R2.3 split-payment reconstruction -------------------------------
    def _r23(self, p: CanonicalPayment) -> Optional[MatchResult]:
        siblings = self.pays_by_orderid.get(p.order_id, [])
        if len(siblings) < 2:
            return None
        # find the Shopify order total via any sibling's payment_reference
        order = None
        for sib in siblings:
            o = self.order_by_payref.get(sib.payment_id)
            if o:
                order = o
                break
        if not order:
            return None
        gross_sum = sum(sib.amount_paise for sib in siblings)
        if abs(gross_sum - order.total_paise) > AMOUNT_TOLERANCE_PAISE:
            return None
        ev = {"payment_id": p.payment_id, "order": order.name,
              "order_id": p.order_id, "siblings": [sib.payment_id for sib in siblings],
              "reconstructed_gross_paise": gross_sum, "order_total_paise": order.total_paise,
              "reason": f"{len(siblings)} payments reconstruct order {order.name} total"}
        return self._decide(p.payment_id, "R2.3_split_payment_reconstruction", "matched", ev)

    # ---- R2.4 refund-netted residual reconciliation ----------------------
    def _r24(self, p: CanonicalPayment) -> Optional[MatchResult]:
        s = self.settlement_by_id.get(p.settlement_id) if p.settlement_id else None
        order = self.order_by_payref.get(p.payment_id)
        if not s or not order or not self._order_amount_ok(order, p):
            return None
        deposit = self._deposit_for_utr(s.utr)
        if deposit is None:
            return None
        # p itself must be a genuinely clean payment to be released: correct
        # fee, not refunded. A fee-drift payment fails here and stays flagged.
        if not self._fee_clean(p):
            return None
        p_order = self.order_by_payref.get(p.payment_id)
        if p_order and p_order.refunded_amount_paise > 0:
            return None  # p is the refunded record itself -> it's the exception, defer

        batch = self.pays_by_settlement.get(s.settlement_id, [])
        reduction_total = 0
        refunded_ids = []
        for q in batch:
            oq = self.order_by_payref.get(q.payment_id)
            refunded_amt = oq.refunded_amount_paise if oq else 0
            if refunded_amt > 0 or bool(q.refund_ids) or q.status == "refunded":
                reduction_total += self._refund_bank_reduction(refunded_amt, q.method)
                refunded_ids.append(q.payment_id)
        if reduction_total <= 0:
            return None
        expected = self._batch_settled_sum(s.settlement_id) - reduction_total
        if abs(expected - deposit) > AMOUNT_TOLERANCE_PAISE:
            return None  # gap not fully explained by refunds (e.g. also a chargeback) -> defer
        ev = {"payment_id": p.payment_id, "order": order.name, "settlement_utr": s.utr,
              "bank_deposit_paise": deposit, "batch_settled_paise": self._batch_settled_sum(s.settlement_id),
              "refund_bank_reduction_paise": reduction_total, "refunded_siblings": refunded_ids,
              "reason": "settlement batch reconciles once the fee-adjusted refund is netted; this fee-clean, non-refunded sibling is released"}
        return self._decide(p.payment_id, "R2.4_refund_netted_solver", "matched", ev)
