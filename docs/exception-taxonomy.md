# Exception Taxonomy

Every unresolved record maps to exactly one category. The final exception list is **clustered by category**, not listed flat — a finance team acts by root cause, not one record at a time.

---

## Categories

### 1. `timing_gap` — expected, not an error
Record exists in one source but the corresponding record hasn't arrived in the settlement/bank window yet.
- **Example:** Payment captured Monday, settlement expected T+2, we're reconciling Wednesday morning before the batch has arrived.
- **Action:** Hold for next batch. **Auto-resolves** on next run.

### 2. `fee_discrepancy` — config drift
Amount mismatch equals a known fee amount or GST-on-fee delta.
- **Example:** Expected settlement based on 2% MDR, actual reflects 2.5% (mid-batch pricing change).
- **Action:** Flag for finance to update the fee config table.

### 3. `chargeback_withheld` — dispute pending
Payment settled but bank credit is short by exactly one or more chargeback amounts.
- **Example:** Expected ₹1,17,168 but got ₹1,16,168 — one ₹1,000 chargeback held.
- **Action:** Verify against chargeback dispute log. No book action until dispute resolves.

### 4. `refund_netted` — sync gap
Payment marked refunded in Razorpay, settlement amount netted, but Shopify still shows "paid".
- **Example:** Refund processed via Razorpay dashboard directly, not routed back to Shopify.
- **Action:** Sync refund status to Shopify. **Auto-resolvable**.

### 5. `partial_refund` — record needs split
Order refunded in part; three-way match fails unless the record is split.
- **Example:** ₹1,000 order, ₹400 refunded → expected settlement is ₹587.36, not ₹976.40.
- **Action:** Split reconciliation record into paid + refunded portions, match each side separately.

### 6. `duplicate_capture` — double-charge
Same payment captured twice — one legitimate, one erroneous (typically a webhook retry race).
- **Action:** Identify the duplicate, refund it. **Cannot auto-resolve**; requires human confirmation.

### 7. `split_payment` — multi-attempt
One order paid across multiple payment attempts (EMI, partial captures, retries).
- **Action:** Aggregate payments by `order_id`, match sum to order total.

### 8. `orphan_payment` — no matching order
Razorpay payment exists with no corresponding Shopify order (or vice versa).
- **Example:** Manual payment link outside the checkout flow, test transaction leaked into production, or Shopify order created but customer abandoned before Razorpay charge.
- **Action:** Human review; may require a journal-entry adjustment.

### 9. `fx_delta` — currency conversion
Cross-border payment; INR-settled amount differs from order total by exchange rate and conversion fee.
- **Action:** Apply FX rule from rate table. **Auto-resolvable** when rate table is current.

### 10. `amount_unknown` — true residual
No known rule explains the delta. This is the honest "engine gives up" bucket.
- **Action:** Escalate to finance ops. **This is the number the panel will read as the true residual exception count.**

### 11. `noise_ignore` — not our transaction
Bank row is a vendor payment, salary debit, or other non-Razorpay credit/debit.
- **Action:** Ignored by engine; not reported as exception. Verified by absence of UTR in Razorpay namespace.

---

## Clustering output — final report shape

```
EXCEPTION SUMMARY (Batch 2026-08-24)
─────────────────────────────────────
Total records processed:      215
Auto-matched (HIGH):          191   (88.8%)
Fuzzy-matched (MEDIUM):        14   ( 6.5%)
Exceptions (needs review):     10   ( 4.7%)

BY CATEGORY (desc):
  timing_gap             4   [auto-resolves next batch]
  refund_netted          2   [auto-resolvable]
  chargeback_withheld    2   [dispute log lookup]
  duplicate_capture      1   [human confirm]
  amount_unknown         1   [escalate]
```

Within each category, records are sorted by amount descending — largest financial impact first.
