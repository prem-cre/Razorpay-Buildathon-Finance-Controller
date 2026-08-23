"""Layer 1 — deterministic matcher (rules R1.1 -> R1.5, strict priority).

Reconciliation grain is the **payment**. For each payment the matcher resolves:
  * its order   (order.payment_reference == payment.payment_id)
  * its settlement (payment.settlement_id)
  * the bank credit for that settlement (settlement.utr found in a bank narration)

Rules are evaluated in documented priority order. The first rule whose
precondition holds decides the payment; evaluation stops there. Every payment
receives exactly one deterministic decision plus one audit record.

No fuzzy logic, no LLM, no heuristics. UTR matching here is EXACT (normalized
case, exact string) — approximate UTR matching belongs to Layer 2.

Config:
  * AMOUNT_TOLERANCE_PAISE = 100  (Rs 1, per spec R1.1)
  * SETTLEMENT_WINDOW_DAYS = 2    (T+2, for R1.2 awaiting-settlement)
  * FEE_RATES / GST_RATE          (for R1.5 fee-adjusted recomputation)
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import Any, Optional

from .audit import AuditTrail
from .models import (
    CanonicalDataset, CanonicalPayment, CanonicalSettlement, CanonicalBankTxn,
    CanonicalOrder,
)

AMOUNT_TOLERANCE_PAISE = 100
SETTLEMENT_WINDOW_DAYS = 2

# Simplified MDR config used only by R1.5 to recompute expected fees.
FEE_RATES = {"upi": Decimal("0.00"), "card": Decimal("0.02"),
             "netbanking": Decimal("0.019"), "wallet": Decimal("0.015")}
GST_RATE = Decimal("0.18")


@dataclass(frozen=True)
class MatchResult:
    record_key: str                 # payment_id
    layer: int
    rule: Optional[str]
    confidence: str                 # HIGH / MEDIUM / LOW / NONE
    match_status: str               # matched / awaiting_settlement / orphan_payment / unresolved
    evidence: dict[str, Any]

    def to_dict(self) -> dict[str, Any]:
        return {
            "record_key": self.record_key,
            "layer": self.layer,
            "rule": self.rule,
            "confidence": self.confidence,
            "match_status": self.match_status,
            "evidence": self.evidence,
        }


def _expected_fee_paise(payment: CanonicalPayment) -> int:
    """Recompute fee + GST for one payment from the MDR config (R1.5)."""
    rate = FEE_RATES.get(payment.method.lower())
    if rate is None:
        return payment.fee_paise + payment.tax_paise  # fall back to stated
    gross = Decimal(payment.amount_paise)
    fee = (gross * rate).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
    gst = (fee * GST_RATE).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
    return int(fee + gst)


class Layer1Matcher:
    def __init__(self, data: CanonicalDataset,
                 batch_cutoff=None) -> None:
        self.data = data
        self.audit = AuditTrail()

        # Indexes (built once, deterministic).
        self._orders_by_payref: dict[str, CanonicalOrder] = {
            o.payment_reference: o for o in data.orders if o.payment_reference
        }
        self._settlement_by_id: dict[str, CanonicalSettlement] = {
            s.settlement_id: s for s in data.settlements
        }
        self._payments_by_settlement: dict[str, list[CanonicalPayment]] = {}
        for p in data.payments:
            if p.settlement_id:
                self._payments_by_settlement.setdefault(p.settlement_id, []).append(p)

        # UTR -> list of bank credit rows carrying that UTR (exact, normalized).
        self._bank_by_utr: dict[str, list[CanonicalBankTxn]] = {}
        for b in data.bank_txns:
            if b.extracted_utr and b.is_credit:
                self._bank_by_utr.setdefault(b.extracted_utr, []).append(b)

        # Batch cutoff for the T+2 awaiting-settlement test (R1.2). Default:
        # the latest bank statement date + 1 day (i.e. "we reconcile just after
        # the last statement line we can see").
        if batch_cutoff is None:
            bank_dates = [b.date for b in data.bank_txns if b.date]
            batch_cutoff = (max(bank_dates) + timedelta(days=1)) if bank_dates else None
        self.batch_cutoff = batch_cutoff

    # ----- helpers ---------------------------------------------------------- #

    def _settlement_bank_rows(self, s: CanonicalSettlement) -> list[CanonicalBankTxn]:
        return self._bank_by_utr.get(s.utr, [])

    def _settlement_deposit_paise(self, s: CanonicalSettlement) -> Optional[int]:
        rows = self._settlement_bank_rows(s)
        if not rows:
            return None
        return sum(r.deposit_paise or 0 for r in rows)

    def _settlement_settled_sum(self, s: CanonicalSettlement) -> int:
        return sum(p.settled_amount_paise for p in self._payments_by_settlement.get(s.settlement_id, []))

    def _settlement_gross_minus_stated_fees(self, s: CanonicalSettlement) -> int:
        gross = sum(p.amount_paise for p in self._payments_by_settlement.get(s.settlement_id, []))
        return gross - s.fees_paise - s.tax_paise

    def _settlement_gross_minus_config_fees(self, s: CanonicalSettlement) -> int:
        pays = self._payments_by_settlement.get(s.settlement_id, [])
        gross = sum(p.amount_paise for p in pays)
        fees = sum(_expected_fee_paise(p) for p in pays)
        return gross - fees

    def _awaiting_window_open(self, payment: CanonicalPayment) -> bool:
        """True if T+2 has NOT yet elapsed at the batch cutoff -> legitimately awaiting."""
        if self.batch_cutoff is None or payment.captured_at is None:
            return True  # cannot prove it is overdue; treat as still-pending
        return payment.captured_at + timedelta(days=SETTLEMENT_WINDOW_DAYS) >= self.batch_cutoff

    # ----- main ------------------------------------------------------------- #

    def match(self) -> list[MatchResult]:
        results: list[MatchResult] = []
        for payment in self.data.payments:
            results.append(self._match_one(payment))
        return results

    def _match_one(self, p: CanonicalPayment) -> MatchResult:
        order = self._orders_by_payref.get(p.payment_id)
        has_order = order is not None
        settlement = self._settlement_by_id.get(p.settlement_id) if p.settlement_id else None
        bank_rows = self._settlement_bank_rows(settlement) if settlement else []
        utr_in_bank = len(bank_rows) > 0
        deposit = self._settlement_deposit_paise(settlement) if settlement else None

        # For an EXACT three-way link the order amount must also agree with the
        # payment's gross amount. This is what distinguishes a genuine 1:1 match
        # from an FX-converted order (INR total != charged amount) or a split
        # payment (one payment covers only part of the order total). Without it,
        # aggregate-only matching leaks those in as false positives.
        order_amount_ok = (
            has_order
            and abs(order.total_paise - p.amount_paise) <= AMOUNT_TOLERANCE_PAISE
        )

        base_ev: dict[str, Any] = {
            "payment_id": p.payment_id,
            "order": order.name if order else None,
            "order_total_paise": order.total_paise if order else None,
            "payment_amount_paise": p.amount_paise,
            "order_amount_ok": order_amount_ok,
            "settlement_id": p.settlement_id,
            "settlement_utr": settlement.utr if settlement else None,
            "bank_rows": [b.row_index for b in bank_rows],
            "bank_deposit_paise": deposit,
        }

        # ---- R1.1 Exact three-way link -----------------------------------
        if has_order and order_amount_ok and utr_in_bank and deposit is not None:
            settled_sum = self._settlement_settled_sum(settlement)
            delta = abs(settled_sum - deposit)
            if delta <= AMOUNT_TOLERANCE_PAISE:
                ev = {**base_ev, "settled_sum_paise": settled_sum,
                      "amount_delta_paise": settled_sum - deposit,
                      "strategy": "sum(settled_amount) vs bank deposit"}
                return self._decide(p.payment_id, "R1.1_exact_three_way", "HIGH", "matched", ev)

        # ---- R1.2 Two-way PG<->Order, bank not yet arrived ----------------
        if has_order and not utr_in_bank and self._awaiting_window_open(p):
            ev = {**base_ev, "reason": "order linked; settlement not yet credited in bank window (T+2 open)"}
            return self._decide(p.payment_id, "R1.2_awaiting_settlement", "HIGH", "awaiting_settlement", ev)

        # ---- R1.3 Two-way PG<->Bank, no matching order --------------------
        if utr_in_bank and not has_order:
            ev = {**base_ev, "reason": "settlement UTR present in bank, but no Shopify order carries this payment_id"}
            return self._decide(p.payment_id, "R1.3_orphan_payment", "MEDIUM", "orphan_payment", ev)

        # ---- R1.4 Sum-aggregation via settlement-declared fees ------------
        if has_order and order_amount_ok and utr_in_bank and deposit is not None:
            gross_net = self._settlement_gross_minus_stated_fees(settlement)
            if abs(gross_net - deposit) <= AMOUNT_TOLERANCE_PAISE:
                ev = {**base_ev, "expected_paise": gross_net,
                      "amount_delta_paise": gross_net - deposit,
                      "strategy": "sum(amount) - settlement.fees - settlement.tax vs bank deposit"}
                return self._decide(p.payment_id, "R1.4_sum_aggregation", "HIGH", "matched", ev)

        # ---- R1.5 Fee-adjusted amount match (recomputed from MDR config) --
        if has_order and order_amount_ok and utr_in_bank and deposit is not None:
            gross_net_cfg = self._settlement_gross_minus_config_fees(settlement)
            if abs(gross_net_cfg - deposit) <= AMOUNT_TOLERANCE_PAISE:
                ev = {**base_ev, "expected_paise": gross_net_cfg,
                      "amount_delta_paise": gross_net_cfg - deposit,
                      "strategy": "sum(amount) - config_fee(method) - GST vs bank deposit"}
                return self._decide(p.payment_id, "R1.5_fee_adjusted", "HIGH", "matched", ev)

        # ---- No deterministic rule fired: defer to later layers -----------
        ev = {**base_ev, "has_order": has_order, "utr_in_bank": utr_in_bank,
              "reason": "no Layer-1 rule matched; deferred to Layer 2/3"}
        return self._decide(p.payment_id, None, "NONE", "unresolved", ev)

    def _decide(self, key, rule, confidence, status, evidence) -> MatchResult:
        self.audit.emit(record_key=key, rule=rule, confidence=confidence,
                        match_status=status, evidence=evidence)
        return MatchResult(record_key=key, layer=1, rule=rule,
                           confidence=confidence, match_status=status, evidence=evidence)
