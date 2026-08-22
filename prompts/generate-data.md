# Prompt — Synthetic Reconciliation Data Generation

Paste the block below into a fresh chat with a long-context reasoning model (Claude Opus 5 or GPT-5). The prompt is self-contained — do not attach files.

If output truncates mid-generation, do NOT let the model shrink the datasets to fit. Ask it to continue from a named checkpoint (e.g., "continue Dataset B `razorpay_payments.csv` from row 41").

---

## THE PROMPT

You are acting in a dual role: a **domain-reasoning agent** with deep expertise in Indian payments operations (Razorpay, NPCI settlement rails, HDFC/ICICI bank statement formats, Shopify checkout), AND a **data-analysis agent** whose job is to construct rigorous synthetic datasets with verifiable ground truth for testing a multi-source reconciliation engine.

This data will be used to demo a finance-controller agent to a hiring panel at Razorpay. Realism, internal consistency, and accurate ground-truth labeling matter more than speed.

---

### PHASE 0 — Deep reasoning (mandatory, at least 500 words visible)

Before you produce any data, think through the problem in the open. Do not skip this phase. Cover, with rigor:

1. The **T+2 settlement cycle** for Indian domestic payments and how it interacts with a reconciliation window that runs on a specific day. When does a Monday payment show up in the bank? What about a Friday payment?
2. How Razorpay's **fee structure** (typically 2% for standard cards, 1.9% for netbanking, ~0% for UPI under current MDR waiver, 1.5% for wallets, plus 18% GST on that fee) combines with the payment amount to produce `settled_amount_paise`. Walk the math on one payment.
3. How **multiple payments aggregate into a single bank credit** via a shared UTR — the "one bank line = many payments" pattern that dominates real batches.
4. Every failure mode where the three-way link (Shopify order ↔ Razorpay payment ↔ Bank credit) can break, and how each break **manifests visibly in the raw records** (which field is off, and by how much).
5. The realistic **distribution of exception types** in a typical Indian D2C merchant's daily batch — timing gaps dominate (~50% of "exceptions"), fee discrepancies and refund-netting are common (~20-30%), chargebacks and duplicates are rare (~5-10%), true-unknown deltas are the smallest slice.
6. Design decisions you're about to make: merchant persona, date range, order volume, and the exact injection plan for each dataset.

**Verify your reasoning at the end of this phase** — restate any calculation you're unsure about and re-derive it. Only then move to Phase 1.

---

### PHASE 1 — Domain constraints (locked; do not deviate)

- **Amount precision**: all internal representation in **paise (integer)**. Bank statements arrive in rupees (2-decimal float). Any drift is a bug.
- **Payment methods & fees (simplified for synthetic use)**:
  - `upi`: 60% of payments, 0% fee
  - `card`: 25%, 2% fee
  - `netbanking`: 10%, 1.9% fee
  - `wallet`: 5%, 1.5% fee
  - GST 18% on every fee > 0
- **Settlement cycle**: T+2 baseline. Payment captured on day N settles on day N+2 (skip weekends only if you also model weekends realistically — safer to keep all days as business days for this synthetic set).
- **UTR format**: `<BANK_CODE><12 digits>`, e.g., `HDFC0001234567890`. Bank narration embeds UTR with a prefix like `NEFT-` or `RAZORPAY-` or `IMPS-`.
- **Merchant persona (pick one and stick with it)**: **"Ananya's Skincare"**, D2C skincare brand on Shopify, headquartered in Bangalore, banking with HDFC, ~80-120 orders/day, average order value ₹800-2,500. All amounts in INR unless a specific record is marked as cross-border.
- **Reconciliation batch runs**: morning IST on **2026-08-24**. Order date range: 7-day window ending that morning.

---

### PHASE 2 — Schemas (exact — do not add, remove, or rename columns)

**Razorpay Settlements** — `razorpay_settlements.csv`
Columns: `settlement_id, utr, amount_paise, fees_paise, tax_paise, status, created_at, settled_at`
- `settlement_id`: `setl_` + 14 alphanumeric chars
- `status` values: `processed | failed | reversed`
- Timestamps: ISO8601 with `+05:30` offset

**Razorpay Payments** — `razorpay_payments.csv`
Columns: `payment_id, order_id, settlement_id, amount_paise, fee_paise, tax_paise, settled_amount_paise, method, currency, status, captured_at, refund_ids`
- `payment_id`: `pay_` + 14 alphanumeric
- `order_id`: `order_` + 14 alphanumeric (this is Razorpay's, not Shopify's)
- `settlement_id`: FK; blank if not yet settled
- `status` values: `captured | refunded | failed | authorized`
- `refund_ids`: pipe-separated `rfnd_XXX` IDs, or empty
- `settled_amount_paise` = `amount_paise - fee_paise - tax_paise` (unless a defect is injected — note in manifest)

**HDFC Bank Statement** — `hdfc_bank_statement.csv`
Columns: `Date, Narration, Chq/Ref No, Value Dt, Withdrawal Amt, Deposit Amt, Closing Balance`
- Date format: `DD/MM/YY`
- Narration contains UTR with a prefix
- Withdrawal/Deposit: blank when N/A, else 2-decimal float in rupees
- Include **10-15% noise rows**: vendor payments (e.g., `NEFT-VENDOR-XYZ`), salary debits, GST payments, unrelated credits. These must NOT match any Razorpay UTR.
- `Closing Balance` must be arithmetically consistent line-to-line.

**Shopify Orders** — `shopify_orders.csv`
Columns: `Name, Id, Financial Status, Currency, Subtotal, Taxes, Total, Discount Amount, Payment Reference, Payment Method, Created At, Processed At, Refunded Amount`
- `Name`: `#1000` incrementing
- `Payment Reference`: Razorpay `payment_id` (may be blank for `pending` orders or truncated for adversarial cases)
- `Financial Status`: `paid | partially_refunded | refunded | voided | pending`

**Ground truth manifest** — `manifest.json`
For every generated record (not the noise rows), one entry:
```json
{
  "record_key": "pay_XXX or order_#1042 or bank_row_17",
  "expected_match_status": "matched | timing_gap | fee_discrepancy | chargeback_withheld | refund_netted | partial_refund | duplicate_capture | split_payment | orphan_payment | fx_delta | amount_unknown | noise_ignore",
  "injected_defect": "one-sentence description of what makes this record hard, or null",
  "expected_confidence": "HIGH | MEDIUM | LOW | NONE"
}
```
The manifest is the grader. The reconciliation engine's output will be diffed against it record-by-record.

---

### PHASE 3 — The three datasets to generate

#### Dataset A — CLEAN (baseline)
- **55 payments, 55 orders, 3-5 aggregated bank credits over 3 days**
- **Zero defects.** All UTRs align, all fees are correct, all timestamps consistent, all orders map cleanly to payments and payments to settlements.
- Expected engine output: **100% HIGH-confidence match, zero exceptions.**
- If the engine flags anything, either the engine is broken or the dataset is broken.

#### Dataset B — MESSY (realistic)
- **80 payments, 80 orders, 5-8 aggregated bank credits over 5 days**
- **Target auto-match rate: 85-95%.** Inject roughly:
  - 4× `timing_gap` (payments captured but settlement expected in next window)
  - 3× `fee_discrepancy` (2% vs 2.5% MDR drift on some records)
  - 2× `chargeback_withheld` (bank credit short by chargeback amount)
  - 3× `refund_netted` (Razorpay refund not reflected in Shopify)
  - 2× `partial_refund`
  - 1× `duplicate_capture`
  - 2× `split_payment` (one order, multiple payments)
  - 2× `orphan_payment` (Razorpay payment with no Shopify order)
  - 10-15% noise rows in the bank statement (non-Razorpay transactions)
- **Note:** several of these (`timing_gap`, `refund_netted`, `fee_discrepancy`) SHOULD auto-resolve with correct engine logic — the true residual `amount_unknown` count should be near zero. That's the point of measuring on this set.

#### Dataset C — ADVERSARIAL (held-out; do not tune the engine against this)
- **60 payments, 60 orders, 4-6 bank credits over 4 days**
- Harder cases, deliberately different from Dataset B (test generalization, not memorization):
  - UTR typos with Levenshtein distance 1-2 (tests fuzzy layer)
  - One international payment (USD → INR with FX delta and higher fee)
  - One order paid via 3 split EMI payments across 2 different settlements
  - One duplicate capture where **both** captures show `status=captured` (which is the real one?)
  - One Shopify `Payment Reference` truncated (last 4 chars missing)
  - Two different payments with the exact same amount on the same day (must use reference, not amount)
  - One refund that straddles two settlement batches
- Do NOT reuse the exact defect types from Dataset B. Dataset C exists to test whether the engine generalizes.

---

### PHASE 4 — Realism checks (apply before finalizing each dataset)

1. **Sum check** — For every settlement, `sum(settled_amount_paise for its payments) == settlement.amount_paise` unless a defect is documented in the manifest. Flag deviations.
2. **Balance check** — HDFC `Closing Balance` must be arithmetically consistent through the file (running balance).
3. **Timestamp check** — `captured_at < settled_at < bank Date`. No time travel.
4. **UTR uniqueness** — No two different settlements share a UTR unless deliberately injected as a defect.
5. **ID format check** — Every ID matches its prefix + length pattern.
6. **Coverage check** — Every non-noise record has a manifest entry.

If any check fails on data you generated, regenerate that portion — do not ship inconsistent data.

---

### PHASE 5 — Verification report (mandatory after all three datasets)

At the end, produce a markdown report:

- Row counts per file per dataset (must match specs)
- Total injected defects per category per dataset
- Any realism-check violations detected (target: zero unintentional)
- Confirmation that `manifest.json` covers every non-noise record
- One paragraph of self-critique: what's the weakest part of your synthetic data, and how would a suspicious reviewer catch it?

---

### PHASE 6 — Output format

Deliver one dataset at a time, in this exact structure:

```
=== DATASET A (CLEAN) ===
--- razorpay_settlements.csv ---
[full csv content, no truncation]

--- razorpay_payments.csv ---
[full csv content]

--- hdfc_bank_statement.csv ---
[full csv content]

--- shopify_orders.csv ---
[full csv content]

--- manifest.json ---
[full json content]

=== DATASET B (MESSY) ===
[...same structure...]

=== DATASET C (ADVERSARIAL) ===
[...same structure...]

=== VERIFICATION REPORT ===
[markdown]
```

---

### FINAL INSTRUCTION

Do not summarize. Do not truncate. Emit every row of every CSV in full.

If context runs low mid-generation, **pause and ask me to continue from a named checkpoint** — do NOT silently reduce the row counts to fit. The specs above are contractual; the datasets are the ground truth for a demo that goes in front of a hiring panel and will be diff-tested by an engine.

Begin with **Phase 0 — Deep reasoning** now.
