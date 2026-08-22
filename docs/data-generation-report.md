# Synthetic Reconciliation Data Generation — Deep Reasoning & Verification Report

**Track:** Track 04 — AI Finance Controller  
**Reconciliation Batch Run Date:** 2026-08-24 09:00:00 IST  
**Order Date Window:** 2026-08-17 08:00:00 IST to 2026-08-23 22:00:00 IST  
**Merchant Persona:** *Ananya's Skincare* (D2C skincare brand on Shopify, Bangalore, HDFC banking partner, Razorpay payment aggregator)  

---

## 1. PHASE 0 — Deep Domain Reasoning

### 1.1 The Indian Domestic Settlement Cycle (T+2 Settlement Physics)
In the Indian digital payments ecosystem regulated by the RBI and operated via NPCI / card payment gateways:
- Transactions authorized and captured on Day $T$ do not instantly reflect in a merchant's bank account. Under standard Razorpay domestic merchant settlement agreements, the baseline settlement cycle operates on a **$T+2$ business day rolling window**.
- When a payment is captured on Monday morning ($T$), Razorpay pools, clears, and initiates the bulk settlement payout on Wednesday ($T+2$). 
- The cutoff time for daily transaction aggregation is midnight IST ($23:59:59$). Transactions captured after cutoff roll over to the subsequent settlement batch.
- When our automated reconciliation engine executes on Monday morning (**2026-08-24 09:00 IST**), transactions captured on Saturday (Aug 22) and Sunday (Aug 23) are legally and operationally in the `awaiting_settlement` pipeline ($T+2$ due date is Aug 24 evening or Aug 25). 
- An intelligent reconciliation agent must recognize that unmatched transactions from Aug 23 are not accounting errors or lost revenue; they represent a valid `timing_gap` that will automatically close upon ingesting the subsequent bank statement.

### 1.2 Fee Structures, Merchant Discount Rate (MDR), and GST Mathematics
Payment Aggregators deduct transaction fees (MDR) before transferring funds to the nodal bank account. Furthermore, under Indian GST regulations (Schedule II of CGST Act), payment processing is a taxable financial service subject to **18% Goods and Services Tax (GST)** levied specifically on the fee component.

The exact monetary flow per transaction method is:
- **UPI:** 0.0% MDR $\rightarrow$ Fee = ₹0.00, GST = ₹0.00 $\rightarrow$ Net Settled = 100% of Gross.
- **Credit / Debit Cards:** 2.0% MDR $\rightarrow$ Fee = $\text{Gross} \times 0.02$, GST = $\text{Fee} \times 0.18$.
- **Netbanking:** 1.9% MDR $\rightarrow$ Fee = $\text{Gross} \times 0.019$, GST = $\text{Fee} \times 0.18$.
- **Wallets:** 1.5% MDR $\rightarrow$ Fee = $\text{Gross} \times 0.015$, GST = $\text{Fee} \times 0.18$.
- **Cross-Border / International:** 3.0% MDR + currency exchange conversion spread.

**Sample Computation (Standard Domestic Card Transaction):**
$$\text{Gross Customer Order} = ₹1,500.00 = 150,000\text{ paise}$$
$$\text{MDR Fee (2\%)} = 150,000 \times 0.02 = 3,000\text{ paise } (₹30.00)$$
$$\text{GST on Fee (18\%)} = 3,000 \times 0.18 = 540\text{ paise } (₹5.40)$$
$$\text{Total Deductions} = 3,000 + 540 = 3,540\text{ paise } (₹35.40)$$
$$\text{Net Settled Amount} = 150,000 - 3,540 = 146,460\text{ paise } (₹1,464.60)$$

**Crucial Engineering Precision Rule:** All internal transformations and comparisons are executed strictly in integer paise to eliminate floating-point representation drift ($0.1 + 0.2 \neq 0.3$).

### 1.3 The Lump-Sum Settlement Aggregation Pattern ($1:N$ Mapping)
A common mistake in naive reconciliation tools is expecting a $1:1$ credit in the bank statement for each storefront order. In reality, Razorpay batches all settled transactions for a cycle into a single bulk NEFT/RTGS payout:
$$\text{Bank Deposit (Deposit Amt)} = \sum_{i=1}^{k} \text{settled\_amount\_paise}_i - \sum \text{Chargeback Deductions} - \sum \text{Netted Refunds}$$
Each bulk payout is assigned a unique 16-17 character banking identifier known as the **Unique Transaction Reference (UTR)** (e.g., `HDFC3513963593378`). The bank statement embeds this UTR inside a string narration (e.g., `NEFT-HDFC3513963593378-RAZORPAY`). Reconciling the bank statement requires resolving the $1:N$ relationship between one bank row and dozens of constituent payment records.

### 1.4 Failure Modes and Record Manifestations
When the three-way link fails, each failure mode leaves an identifiable signature across the data sources:

| Failure Mode | How It Manifests in Raw Data | Diagnostic Rule |
|:---|:---|:---|
| **Timing Gap** | Payment is in `shopify_orders.csv` and `razorpay_payments.csv`, but `settlement_id` is empty and UTR is absent in `hdfc_bank_statement.csv`. | `captured_at` is within $T+2$ window of reconciliation run. |
| **Fee Discrepancy (MDR Drift)** | UTR and IDs link, but bank credit is short by an exact delta matching an unauthorized MDR rate increase (e.g., 2.5% instead of 2.0%). | $\Delta \text{Amount} = \text{Gross} \times (0.025 - 0.020) \times 1.18$. |
| **Chargeback Withheld** | Settlement report links to bank UTR, but bank deposit amount is less than total settlement amount by the exact value of a disputed transaction. | Bank Delta matches an active payment flagged under dispute. |
| **Refund Netted (Sync Gap)** | Razorpay payment shows `status=refunded` with a `refund_id`, and bank settlement amount is reduced accordingly, but Shopify order still displays `financial_status=paid`. | Discrepancy between storefront status and payment gateway status. |
| **Partial Refund** | Shopify order indicates `financial_status=partially_refunded` with `Refunded Amount > 0`. Three-way match requires splitting the transaction into settled vs refunded legs. | Net credit in bank matches `(Gross - Refund) - Fee(Gross - Refund)`. |
| **Duplicate Capture** | Two identical `payment_id` rows or two payments sharing the same Shopify order reference within seconds of each other (webhook retry race). | Redundant authorization ID requiring immediate merchant refund. |
| **Split Payment** | Multiple distinct payment IDs (e.g., card + UPI retry or EMI) sharing the same storefront order total. | $\sum \text{Payment Amounts} \equiv \text{Shopify Order Total}$. |
| **Orphan Payment** | Payment exists in Razorpay and bank statement, but `Payment Reference` does not exist in Shopify order export (e.g., manual payment link). | Missing storefront record requiring manual journal entry. |
| **FX Conversion Delta** | Cross-border USD purchase where Shopify total is in USD cents, but Razorpay settlement is in INR paise with conversion spread and international fee. | Multi-currency normalization delta. |

### 1.5 Real-World Exception Distribution
In healthy Indian e-commerce operations, the vast majority of orders (~75-90%) match deterministically without human intervention. True exceptions follow an asymmetric Pareto distribution:
- **`timing_gap` (40-50% of unmatched records):** Normal rolling settlement lag.
- **`fee_discrepancy` & `refund_netted` (20-30% of unmatched records):** Configuration or webhook sync delays.
- **`chargeback_withheld` & `split_payment` (10-15% of unmatched records):** Operational anomalies.
- **`duplicate_capture` & `orphan_payment` (5-10% of unmatched records):** Technical edge cases.
- **`amount_unknown` (<2%):** True unexplained residuals requiring executive escalation.

---

## 2. PHASE 1 & 2 — Data Contract & Schema Verification

All three datasets strictly adhere to the column names, data types, and formatting conventions defined in [schema.md](file:///c:/Users/PremKumar/Documents/Razorpay%20Buildathon/docs/schema.md):

### Razorpay Settlements (`razorpay_settlements.csv`)
`settlement_id, utr, amount_paise, fees_paise, tax_paise, status, created_at, settled_at`

### Razorpay Payments (`razorpay_payments.csv`)
`payment_id, order_id, settlement_id, amount_paise, fee_paise, tax_paise, settled_amount_paise, method, currency, status, captured_at, refund_ids`

### HDFC Bank Statement (`hdfc_bank_statement.csv`)
`Date, Narration, Chq/Ref No, Value Dt, Withdrawal Amt, Deposit Amt, Closing Balance`

### Shopify Orders (`shopify_orders.csv`)
`Name, Id, Financial Status, Currency, Subtotal, Taxes, Total, Discount Amount, Payment Reference, Payment Method, Created At, Processed At, Refunded Amount`

### Ground Truth Manifest (`manifest.json`)
`record_key, expected_match_status, injected_defect, expected_confidence`

---

## 3. PHASE 3 — Dataset Inventory & Verification

### Dataset A — Clean Baseline ([`data/clean/`](file:///c:/Users/PremKumar/Documents/Razorpay%20Buildathon/data/clean))
- **Payments:** 55
- **Orders:** 55
- **Settlements:** 5
- **Bank Rows:** 5
- **Manifest Entries:** 55
- **Expected Match Rate:** **100.0% HIGH Confidence**
- **Injected Defects:** 0 (Clean baseline)

### Dataset B — Realistic Messy ([`data/messy/`](file:///c:/Users/PremKumar/Documents/Razorpay%20Buildathon/data/messy))
- **Payments:** 83
- **Orders:** 78
- **Settlements:** 5
- **Bank Rows:** 10 (5 settlement credits + 5 non-Razorpay noise rows)
- **Manifest Entries:** 83
- **Defect Breakdown:**
  - `matched`: 62 records (74.7%)
  - `timing_gap`: 4 records (Aug 23 captures pending T+2 settlement)
  - `split_payment`: 4 records (2 orders split into 2 payments each)
  - `fee_discrepancy`: 3 records (MDR rate changed from 2.0% to 2.5%)
  - `refund_netted`: 3 records (refunds processed in gateway, not synced to Shopify)
  - `chargeback_withheld`: 2 records (bank payout short by disputed amount)
  - `partial_refund`: 2 records (40% refund on order)
  - `orphan_payment`: 2 records (payment link transactions without Shopify order)
  - `duplicate_capture`: 1 record (webhook retry race duplicate)
  - `noise_ignore`: 5 bank rows (vendor payments, rent, salaries, GST challans)

### Dataset C — Adversarial Held-Out ([`data/adversarial/`](file:///c:/Users/PremKumar/Documents/Razorpay%20Buildathon/data/adversarial))
- **Payments:** 60
- **Orders:** 57
- **Settlements:** 4
- **Bank Rows:** 9 (4 settlement credits + 5 noise rows)
- **Manifest Entries:** 60
- **Adversarial Scenarios:**
  - `UTR OCR Typos`: Bank narration has Levenshtein-1/2 character mutation.
  - `International USD Order`: Cross-border currency conversion with 3% fee.
  - `3-Way EMI Split`: Single order paid across 3 days straddling 2 settlements.
  - `Dual-Captured Ambiguity`: Both duplicate records marked `status=captured`.
  - `Truncated Reference`: Shopify payment reference missing last 4 characters.
  - `Identical Amount Collision`: Two distinct payments of exactly ₹1,500 on the same date.
  - `Straddling Refund`: Refund initiated mid-cycle affecting subsequent settlement batch.

---

## 4. PHASE 4 & 5 — Realism Checks & Self-Critique

### Realism Checks Result
1. **Sum Check:** Passed (100% of settlement records equal the sum of their constituent payment settled amounts).
2. **Balance Continuity:** Passed (All bank rows maintain strict arithmetic balance continuity: $\text{Balance}_n = \text{Balance}_{n-1} + \text{Deposit} - \text{Withdrawal}$).
3. **Timestamp Validity:** Passed (Zero time-travel violations: `captured_at` < `settled_at` < `bank Date`).
4. **UTR Uniqueness:** Passed (All generated UTRs are unique and non-overlapping).
5. **ID Format Integrity:** Passed (All IDs adhere to standard prefixes: `pay_`, `setl_`, `order_`, `rfnd_`).
6. **Ground Truth Coverage:** Passed (100% of generated payments map to manifest entries).

### Self-Critique & Reviewer Vulnerabilities
*What is the weakest part of this synthetic dataset, and how would a strict reviewer scrutinize it?*
1. **Uniform Time Spacing:** In a live high-volume production environment, orders follow diurnal traffic curves (peaks between 8 PM - 11 PM IST, troughs between 3 AM - 6 AM). The current synthetic generator distributes timestamps somewhat evenly across daylight hours.
2. **Deterministic Bank Narration Syntax:** Real bank statements from Indian PSUs and private banks sometimes exhibit truncated narrations or non-standard delimiters (e.g., `CMS/RAZORPAY/0034/HDFC...`). While our Dataset C tests Levenshtein-distance fuzzy matching, production banking APIs can contain even messier OCR noise.
3. **Defense:** Our three-layer architecture (Deterministic $\rightarrow$ Fuzzy $\rightarrow$ LLM Diagnosis) is specifically designed to isolate and resolve these edge cases without corrupting the core accounting ledger.
