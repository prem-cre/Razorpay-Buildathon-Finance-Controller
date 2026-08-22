# Matching Rules — Priority Ordered

Three layers, executed in order. A record is settled at the first layer that produces a HIGH-confidence match; otherwise it flows to the next layer.

---

## Layer 1 — Deterministic (targets 85-90% of records)

Rules in strict priority:

### R1.1 Exact three-way link
- `Shopify.Payment Reference == Razorpay.Payments.payment_id`, AND
- `Razorpay.Settlements.utr` found (case-insensitive substring, prefix-stripped) in `Bank.Narration`, AND
- `abs(Σ Razorpay.settled_amount_paise for payments in settlement - Bank.Deposit_paise) <= 100` (₹1 tolerance)

→ Confidence: **HIGH**

### R1.2 Two-way PG↔Order (bank not yet arrived)
- `payment_id` link intact
- Settlement not yet arrived in the current bank window (T+2 not elapsed)

→ Confidence: **HIGH**, status: `awaiting_settlement` (expected, not an exception)

### R1.3 Two-way PG↔Bank (no matching order)
- UTR matches bank, but no Shopify order carries this `payment_id`

→ Confidence: **MEDIUM**, exception category: `orphan_payment`

### R1.4 Sum-aggregation match
- Multiple Razorpay payments sum (net of fees/tax) to one bank deposit
- UTR matches
- This is the **normal case**: one bank credit typically batches many payments.

→ Confidence: **HIGH**

### R1.5 Fee-adjusted amount match
- `Bank.Deposit_paise == Σ Payment.amount_paise - known_fee_paise - known_gst_paise`
- Uses the fee config table (per payment method)

→ Confidence: **HIGH**

---

## Layer 2 — Fuzzy (targets residual 5-8%)

### R2.1 UTR variant matching
- Normalize casing, strip prefixes (`NEFT-`, `RAZORPAY-`, `IMPS-`, etc.)
- Allow Levenshtein distance ≤ 2 for OCR-style typos

### R2.2 Reference number partial
- Shopify `Payment Reference` may be truncated or reformatted
- Match on prefix if length ≥ 10

### R2.3 Split-payment reconstruction
- One order paid across multiple payments (partial captures, EMI, retries)
- Aggregate payments sharing the same `order_id`, then match sum to Shopify Total

### R2.4 Refund netting
- Settlement amount equals `Σ payments - Σ refunds` for the batch
- Back-solve refunds even if not explicitly tagged in Shopify

→ Confidence: **MEDIUM**

---

## Layer 3 — LLM diagnosis (residual exceptions only)

For records that fail Layers 1 and 2:

1. Classify into exception taxonomy (see `exception-taxonomy.md`)
2. Produce a natural-language root cause statement
3. Suggest one of: `auto_resolvable`, `human_review`, `escalate`
4. Attach evidence citations — which fields led to which conclusion

→ Confidence: **LOW** — always human-reviewable, never auto-book

The LLM never invents matches. If it cannot classify with evidence, output category `amount_unknown` and mark `escalate`.

---

## Audit trail — one record per decision

```json
{
  "record_key": "pay_MvR2k9Xa1Bc4Yz",
  "layer": 1,
  "rule": "R1.1_exact_three_way",
  "confidence": "HIGH",
  "match_status": "matched",
  "evidence": {
    "shopify_order": "#1042",
    "razorpay_payment": "pay_MvR2k9Xa1Bc4Yz",
    "settlement": "setl_...",
    "bank_row": 17,
    "amount_delta_paise": 0
  },
  "llm_reasoning": null,
  "timestamp": "2026-08-24T10:15:22+05:30"
}
```

Every audit-trail entry is queryable and exportable. This is what makes the system defensible in front of the panel: "for any match or non-match you point to, I can show you the rule that fired and the evidence it used."
