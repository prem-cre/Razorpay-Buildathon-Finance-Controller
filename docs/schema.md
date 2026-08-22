# Data Schemas — Multi-Source Reconciliation

Three data sources feed the reconciliation engine. This document defines their exact shapes. Every field, type, and quirk here is the contract the generator and the engine both build against.

**Amount precision rule (global):** all internal representation in **paise (integer)** to avoid float drift. Bank statements arrive in rupees (2-decimal float) — convert to paise on ingest, convert back to rupees only at display boundaries.

---

## 1. Razorpay Settlement Report (PG source)

Two related tables — **Settlements** (aggregated bank credits) and **Payments** (individual transactions that were rolled into a settlement).

### 1a. Settlements — `razorpay_settlements.csv`

| Column | Type | Example | Notes |
|---|---|---|---|
| `settlement_id` | string | `setl_MvR2k9Xa1Bc4Yz` | Razorpay's unique ID, prefix `setl_` + 14 alphanumeric |
| `utr` | string | `HDFC0001234567890` | **Unique Transaction Reference — the KEY for bank matching** |
| `amount_paise` | int | `11430000` | ₹1,14,300.00. Total credited to merchant bank |
| `fees_paise` | int | `240000` | ₹2,400 total fees deducted for this batch |
| `tax_paise` | int | `43200` | ₹432 = 18% GST on fees |
| `status` | enum | `processed` | `created` / `processed` / `failed` / `reversed` |
| `created_at` | ISO8601 | `2026-08-24T10:15:22+05:30` | When settlement was initiated by Razorpay |
| `settled_at` | ISO8601 | `2026-08-24T11:30:15+05:30` | Actual bank credit time |

### 1b. Payments — `razorpay_payments.csv`

Each row is one payment, tagged with the settlement it rolled into.

| Column | Type | Example | Notes |
|---|---|---|---|
| `payment_id` | string | `pay_MvR2k9Xa1Bc4Yz` | Prefix `pay_` + 14 alphanumeric |
| `order_id` | string | `order_MvR2k9Xa1Bc4Yz` | Razorpay's order ID (distinct from Shopify's) |
| `settlement_id` | string | `setl_MvR2k9Xa1Bc4Yz` | FK to settlements; blank if not yet settled |
| `amount_paise` | int | `100000` | ₹1,000.00 — customer-facing gross |
| `fee_paise` | int | `2000` | ₹20.00 (2% for cards, 0% for UPI, etc.) |
| `tax_paise` | int | `360` | ₹3.60 (18% GST on fee) |
| `settled_amount_paise` | int | `97640` | `amount - fee - tax` |
| `method` | enum | `upi` | `upi` / `card` / `netbanking` / `wallet` / `emi` |
| `currency` | string | `INR` | ISO 4217 |
| `status` | enum | `captured` | `authorized` / `captured` / `refunded` / `failed` |
| `captured_at` | ISO8601 | `2026-08-22T14:20:11+05:30` | |
| `refund_ids` | string | `rfnd_ABC\|rfnd_DEF` | Pipe-separated refund IDs, or empty |

---

## 2. Bank Statement

Two format variants supported.

### 2a. HDFC — `hdfc_bank_statement.csv`

| Column | Type | Example | Notes |
|---|---|---|---|
| `Date` | DD/MM/YY | `24/08/26` | Transaction date |
| `Narration` | string | `NEFT-HDFC0001234567890-RAZORPAY` | Contains UTR — parse it out via regex |
| `Chq/Ref No` | string | `001234567890` | Often blank; when present, may mirror part of UTR |
| `Value Dt` | DD/MM/YY | `24/08/26` | Value date (usually same as Date) |
| `Withdrawal Amt` | float | `` | Blank for credits |
| `Deposit Amt` | float | `114300.00` | The credit amount, in rupees |
| `Closing Balance` | float | `543210.55` | Must be arithmetically consistent line-to-line |

### 2b. ICICI — `icici_bank_statement.csv`

| Column | Type | Example | Notes |
|---|---|---|---|
| `S No.` | int | `42` | Row number |
| `Value Date` | DD-MM-YYYY | `24-08-2026` | |
| `Transaction Date` | DD-MM-YYYY | `24-08-2026` | |
| `Cheque Number` | string | `` | Often blank |
| `Transaction Remarks` | string | `RAZORPAY-HDFC0001234567890` | UTR embedded |
| `Withdrawal Amount (INR)` | float | `` | |
| `Deposit Amount (INR)` | float | `114300.00` | |
| `Balance (INR)` | float | `543210.55` | |

Bank files also contain **noise rows** — vendor payments, salary debits, unrelated credits. The engine must recognize these and ignore them (they don't belong to Razorpay's UTR namespace).

---

## 3. Shopify Order Export — `shopify_orders.csv`

| Column | Type | Example | Notes |
|---|---|---|---|
| `Name` | string | `#1042` | Human-readable order number |
| `Id` | string | `5987654321000` | Internal Shopify order ID |
| `Financial Status` | enum | `paid` | `paid` / `partially_refunded` / `refunded` / `voided` / `pending` |
| `Currency` | string | `INR` | |
| `Subtotal` | float | `847.46` | Pre-tax, rupees |
| `Taxes` | float | `152.54` | 18% GST |
| `Total` | float | `1000.00` | Customer charged |
| `Discount Amount` | float | `0.00` | |
| `Payment Reference` | string | `pay_MvR2k9Xa1Bc4Yz` | **Razorpay payment_id — KEY for PG matching** |
| `Payment Method` | string | `Razorpay` | |
| `Created At` | ISO8601 | `2026-08-22T14:20:11+05:30` | |
| `Processed At` | ISO8601 | `2026-08-22T14:20:15+05:30` | |
| `Refunded Amount` | float | `0.00` | Cumulative refund amount |

---

## The three-way match — key relationships

```
Shopify.Payment Reference   ⟷  Razorpay.Payments.payment_id
Razorpay.Settlements.utr    ⟷  Bank.Narration (UTR parsed out)
Σ Razorpay.settled_amount   ⟷  Bank.Deposit Amt (aggregated per settlement)
```

A perfect match requires all three links intact and amounts reconciling within ₹1 tolerance. In practice, records break at each link — the pattern of the break tells you which exception category the record belongs to.

---

## Confidence bands

| Band | Meaning |
|---|---|
| **HIGH** | Exact link on both sides. `payment_id` present in Shopify AND UTR matched in bank AND amounts reconcile within ₹1. |
| **MEDIUM** | One link fuzzy, or one amount off by exactly a known fee amount, or resolved via sum-aggregation. |
| **LOW** | LLM-inferred link, or missing link but amount coincidence. Always human-reviewable. |
