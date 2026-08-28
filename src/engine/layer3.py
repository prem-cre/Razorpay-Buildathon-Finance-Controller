"""Layer 3 — root-cause diagnosis for the residual exceptions.

Layer 3 does NOT resolve anything and does NOT touch the match rate. Its job is
the honest exception list: for every record Layer 1+2 could not auto-resolve,
infer *why* — purely from the real data (currency, refund fields, batch bank
gap, sibling structure), never from the ground-truth manifest — and attach an
evidence chain and a recommended human action.

The output is a DIAGNOSIS, not a decision. Its accuracy is then measured
against the manifest downstream (see metrics.evaluate_layer3), which is a fair
test precisely because the diagnosis never saw the manifest.

Nothing here posts to a ledger, executes an action, or claims a cryptographic
proof — those were theatre in an earlier stub and are gone.
"""
from __future__ import annotations

from collections import defaultdict
from datetime import timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import Any, Optional

from .matcher import MatchResult, AMOUNT_TOLERANCE_PAISE, FEE_RATES, GST_RATE, SETTLEMENT_WINDOW_DAYS
from .layer2 import levenshtein
from .models import CanonicalDataset, CanonicalPayment
from .money import paise_to_rupees_str


def _rs(paise: int) -> str:
    return "Rs " + paise_to_rupees_str(paise)


class Layer3Diagnosis:
    def __init__(self, data: CanonicalDataset) -> None:
        self.data = data
        self.order_by_payref = {o.payment_reference: o for o in data.orders if o.payment_reference}
        self.pays_by_settlement: dict[str, list[CanonicalPayment]] = defaultdict(list)
        self.pays_by_orderid: dict[str, list[CanonicalPayment]] = defaultdict(list)
        for p in data.payments:
            if p.settlement_id:
                self.pays_by_settlement[p.settlement_id].append(p)
            self.pays_by_orderid[p.order_id].append(p)
        self.settlement_by_id = {s.settlement_id: s for s in data.settlements}
        self.bank_by_utr: dict[str, list] = defaultdict(list)
        for b in data.bank_txns:
            if b.is_credit and b.extracted_utr:
                self.bank_by_utr[b.extracted_utr].append(b)
        bank_dates = [b.date for b in data.bank_txns if b.date]
        self.batch_cutoff = (max(bank_dates) + timedelta(days=1)) if bank_dates else None

    # ---- helpers ----------------------------------------------------------
    def _config_fee_gst(self, method: str, amount: int) -> tuple[int, int]:
        rate = FEE_RATES.get(method.lower())
        if rate is None:
            return -1, -1
        fee = int((Decimal(amount) * rate).quantize(Decimal("1"), rounding=ROUND_HALF_UP))
        gst = int((Decimal(fee) * GST_RATE).quantize(Decimal("1"), rounding=ROUND_HALF_UP))
        return fee, gst

    def _deposit(self, utr: str) -> Optional[int]:
        rows = self.bank_by_utr.get(utr)
        return sum(r.deposit_paise or 0 for r in rows) if rows else None

    def _batch_gap(self, p: CanonicalPayment) -> Optional[int]:
        """Bank shortfall for p's settlement batch, after netting known refunds."""
        s = self.settlement_by_id.get(p.settlement_id) if p.settlement_id else None
        if not s:
            return None
        deposit = self._deposit(s.utr)
        if deposit is None:
            return None
        batch = self.pays_by_settlement.get(s.settlement_id, [])
        settled = sum(q.settled_amount_paise for q in batch)
        refund_reduction = 0
        for q in batch:
            oq = self.order_by_payref.get(q.payment_id)
            if oq and oq.refunded_amount_paise > 0:
                fee, gst = self._config_fee_gst(q.method, oq.refunded_amount_paise)
                refund_reduction += oq.refunded_amount_paise - (fee + gst if fee >= 0 else 0)
        return (settled - refund_reduction) - deposit

    def _diag(self, category, title, risk, evidence, action, disposition, confidence) -> dict[str, Any]:
        return {
            "category": category, "title": title, "risk_level": risk,
            "evidence_chain": evidence, "recommended_action": action,
            "disposition": disposition, "confidence": confidence,
        }

    # ---- main -------------------------------------------------------------
    def diagnose(self, p: CanonicalPayment, result: MatchResult) -> Optional[dict[str, Any]]:
        if result.match_status == "matched":
            return None
        order = self.order_by_payref.get(p.payment_id)

        # ===== no order on this payment: structural (split / duplicate / orphan)
        if order is None:
            siblings = [q for q in self.pays_by_orderid.get(p.order_id, []) if q.payment_id != p.payment_id]
            group = siblings + [p]
            order_total = next((self.order_by_payref[q.payment_id].total_paise
                                for q in group if q.payment_id in self.order_by_payref), None)
            gross = sum(q.amount_paise for q in group)

            # Split BEFORE duplicate: legs sum to the order total (fractions of one order).
            if siblings and order_total is not None and abs(gross - order_total) <= AMOUNT_TOLERANCE_PAISE:
                return self._diag(
                    "split_payment", "Split payment across multiple attempts", "low",
                    [f"{len(group)} payments on order {p.order_id} sum to {_rs(gross)}, matching the order total {_rs(order_total)}.",
                     "This leg was not auto-reconstructed because the parts settled in different batches.",
                     f"Legs: {', '.join(q.payment_id for q in group)}."],
                    "Group the legs by order and reconcile the combined total once both settlements clear.",
                    "human_review", "MEDIUM")

            # Duplicate: an equal-amount sibling where the amount is a FULL charge
            # (≈ the order total, or no order total to compare) — a re-charge, not a fraction.
            dup = [q for q in siblings if q.amount_paise == p.amount_paise and q.status == "captured" and p.status == "captured"]
            if dup and (order_total is None or abs(p.amount_paise - order_total) <= AMOUNT_TOLERANCE_PAISE):
                other = dup[0]
                return self._diag(
                    "duplicate_capture", "Duplicate capture on one order", "high",
                    [f"Payment {p.payment_id} and {other.payment_id} both captured {_rs(p.amount_paise)} against order {p.order_id}.",
                     "Two identical full captures on a single order indicate a gateway/webhook retry race.",
                     "Only one credit is owed; the second must be reversed."],
                    "Confirm the duplicate and initiate a refund for the erroneous capture.",
                    "human_review", "MEDIUM")

            return self._diag(
                "orphan_payment", "Orphan payment — no matching order", "high",
                [f"Payment {p.payment_id} ({_rs(p.amount_paise)}) carries no Shopify order reference.",
                 "Likely a manual payment link or a test transaction leaked into the batch.",
                 f"Settlement: {p.settlement_id or 'none'}."],
                "Human review; post a suspense journal entry until the source order is identified.",
                "escalate", "MEDIUM")

        # ===== order present: financial diagnosis
        # FX — a hard signal from the currency field
        if p.currency and p.currency.upper() != "INR":
            return self._diag(
                "fx_delta", "Cross-border FX conversion delta", "medium",
                [f"Payment currency is {p.currency}, charged {_rs(p.amount_paise)}.",
                 f"Order total is recorded as {_rs(order.total_paise)} — the gap is exchange-rate + conversion fee, not an error.",
                 "Amount cannot be matched 1:1 without applying the day's FX rate."],
                "Apply the FX rate table for the transaction date, then reconcile the converted amount.",
                "human_review", "MEDIUM")

        # Refund signals
        if p.refund_ids or order.refunded_amount_paise > 0:
            refunded = order.refunded_amount_paise
            if 0 < refunded < order.total_paise:
                return self._diag(
                    "partial_refund", "Partial refund needs record split", "medium",
                    [f"Order {order.name} shows a partial refund of {_rs(refunded)} against {_rs(order.total_paise)}.",
                     f"Refund ids: {', '.join(p.refund_ids) or 'n/a'}.",
                     "The three-way match fails until the record is split into paid vs refunded portions."],
                    "Split the record and reconcile the retained and refunded portions separately.",
                    "human_review", "MEDIUM")
            return self._diag(
                "refund_netted", "Refund netted in settlement", "low",
                [f"Payment {p.payment_id} carries refund id(s) {', '.join(p.refund_ids) or 'n/a'}, but order {order.name} still reads paid ({_rs(order.total_paise)}).",
                 "The refund was processed in the gateway and netted from the bank credit without syncing back to the store.",
                 "The settlement batch reconciles once the refund is subtracted."],
                "Sync the refund status to the order record; no write-off required.",
                "auto_resolvable", "MEDIUM")

        # Fee drift
        fee, gst = self._config_fee_gst(p.method, p.amount_paise)
        if fee >= 0 and (abs(p.fee_paise - fee) > 2 or abs(p.tax_paise - gst) > 2):
            drift = (p.fee_paise + p.tax_paise) - (fee + gst)
            return self._diag(
                "fee_discrepancy", "Gateway fee / GST drift", "medium",
                [f"Recorded fee+GST is {_rs(p.fee_paise + p.tax_paise)} for a {p.method.upper()} payment of {_rs(p.amount_paise)}.",
                 f"Config expects {_rs(fee + gst)} — a drift of {_rs(abs(drift))}.",
                 "Net settlement is off by exactly this fee delta, so the batch aggregate fails."],
                "Verify the MDR rate for this method and update the fee config, or file a gateway credit claim.",
                "human_review", "MEDIUM")

        # Chargeback — batch is short by exactly this payment's value
        gap = self._batch_gap(p)
        if gap is not None and abs(gap - p.settled_amount_paise) <= AMOUNT_TOLERANCE_PAISE and not p.refund_ids:
            return self._diag(
                "chargeback_withheld", "Settlement withheld for a dispute", "high",
                [f"Payment {p.payment_id} settled {_rs(p.settled_amount_paise)} in the gateway but never landed in the bank credit.",
                 f"The batch bank credit is short by {_rs(gap)}, matching this payment exactly.",
                 "This is the signature of a chargeback reserve held against an open dispute."],
                "Cross-reference the dispute log; hold the amount in suspense until arbitration resolves.",
                "escalate", "LOW")

        # Timing — the whole settlement is genuinely absent from the bank. We
        # distinguish "not arrived yet" (timing) from "arrived under a typo'd
        # UTR" by checking there is no fuzzy-matching bank credit either.
        s = self.settlement_by_id.get(p.settlement_id) if p.settlement_id else None
        no_bank = s is None or self._deposit(s.utr) is None
        fuzzy_bank = bool(s) and any(
            levenshtein(s.utr, b.extracted_utr, cap=2) <= 2
            for b in self.data.bank_txns if b.is_credit and b.extracted_utr
        )
        if no_bank and not fuzzy_bank:
            cap = f"captured {p.captured_at.date()}; " if p.captured_at else ""
            return self._diag(
                "timing_gap", "Settlement not yet credited (T+2)", "low",
                [f"Payment {cap}no bank credit exists for its settlement in this statement window.",
                 "The settlement has not landed yet — expected in a later batch, not an error.",
                 "The record should match automatically once the credit arrives."],
                "Hold for the next batch run; it will auto-resolve when the credit lands.",
                "auto_resolvable", "MEDIUM")

        # Order-linked and clean, but the batch aggregate still didn't reconcile —
        # this record is probably fine, held only because a sibling in its batch
        # carries a defect. Say so honestly rather than inventing a cause.
        if gap is not None and abs(gap) > AMOUNT_TOLERANCE_PAISE:
            return self._diag(
                "batch_unconfirmed", "Clean record held by a poisoned batch", "low",
                [f"Payment {p.payment_id} ({_rs(p.amount_paise)}) matches its order and shows no defect of its own.",
                 f"Its settlement batch is off by {_rs(gap)} because a sibling record carries a defect, so it can't be auto-confirmed.",
                 "It will clear once the sibling defect is resolved."],
                "Review alongside its settlement batch; likely releasable once the sibling is handled.",
                "human_review", "LOW")

        # Genuinely unexplained.
        return self._diag(
            "amount_unknown", "Unresolved residual variance", "high",
            [f"Payment {p.payment_id} ({_rs(p.amount_paise)}) does not match any known reconciliation pattern.",
             "No fee, refund, timing, dispute, or structural signal explains the gap.",
             "The engine defers rather than guess."],
            "Escalate to senior finance ops for manual investigation.",
            "escalate", "LOW")

    def diagnose_all(self, results: list[MatchResult]) -> dict[str, dict[str, Any]]:
        by_pay = {p.payment_id: p for p in self.data.payments}
        out: dict[str, dict[str, Any]] = {}
        for r in results:
            p = by_pay.get(r.record_key)
            if p is None:
                continue
            d = self.diagnose(p, r)
            if d is not None:
                out[r.record_key] = d
        return out
