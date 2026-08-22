"""
Synthetic Reconciliation Data Generator
========================================
Generates three datasets (clean, messy, adversarial) for the
ReconBot multi-source reconciliation engine.

Merchant persona: "Ananya's Skincare" -- D2C on Shopify, HDFC bank,
Razorpay gateway. ~80-120 orders/day, AOV ₹800-2500.

Reconciliation batch runs morning of 2026-08-24.
Order date range: 7-day window (2026-08-17 to 2026-08-23).

All amounts stored internally as paise (integer). Bank outputs in rupees.
"""

import csv
import json
import os
import random
import string
import math
from datetime import datetime, timedelta
from typing import Optional

random.seed(42)  # Reproducible

# -------------------------------------------------------------
# Constants & Config
# -------------------------------------------------------------

TZ_OFFSET = "+05:30"
RECON_DATE = datetime(2026, 8, 24, 9, 0, 0)  # batch runs 9am IST
ORDER_START = datetime(2026, 8, 17, 8, 0, 0)
ORDER_END = datetime(2026, 8, 23, 22, 0, 0)
T_PLUS_2_DAYS = 2

# Fee structure (fraction of amount_paise)
FEE_RATES = {
    "upi": 0.0,
    "card": 0.02,
    "netbanking": 0.019,
    "wallet": 0.015,
    "emi": 0.02,
}
GST_RATE = 0.18  # 18% GST on fee

# Payment method distribution
METHOD_WEIGHTS = {
    "upi": 60,
    "card": 25,
    "netbanking": 10,
    "wallet": 5,
}

HDFC_OPENING_BALANCE = 50000000  # ₹5,00,000.00 in paise conceptually; we'll use rupees float

# -------------------------------------------------------------
# ID Generators
# -------------------------------------------------------------

_id_counters = {}

def _gen_id(prefix: str) -> str:
    """Generate a unique ID with prefix + 14 alphanumeric chars."""
    if prefix not in _id_counters:
        _id_counters[prefix] = 0
    _id_counters[prefix] += 1
    # Use a mix of letters and digits for realism
    base = f"{_id_counters[prefix]:05d}"
    padding = ''.join(random.choices(string.ascii_letters + string.digits, k=9))
    return f"{prefix}{base}{padding}"

def gen_payment_id() -> str:
    return _gen_id("pay_")

def gen_order_id() -> str:
    return _gen_id("order_")

def gen_settlement_id() -> str:
    return _gen_id("setl_")

def gen_refund_id() -> str:
    return _gen_id("rfnd_")

def gen_utr() -> str:
    """HDFC UTR: HDFC + 12 digits = 16 chars standard NEFT/RTGS format"""
    digits = ''.join(random.choices(string.digits, k=12))
    return f"HDFC{digits}"

def gen_shopify_id() -> str:
    return str(random.randint(5000000000000, 9999999999999))

# -------------------------------------------------------------
# Utility Functions
# -------------------------------------------------------------

def random_method() -> str:
    methods = list(METHOD_WEIGHTS.keys())
    weights = list(METHOD_WEIGHTS.values())
    return random.choices(methods, weights=weights, k=1)[0]

def compute_fee(amount_paise: int, method: str) -> tuple:
    """Returns (fee_paise, tax_paise) as integers."""
    rate = FEE_RATES.get(method, 0.0)
    fee_paise = round(amount_paise * rate)
    tax_paise = round(fee_paise * GST_RATE)
    return fee_paise, tax_paise

def random_amount_paise(low=80000, high=250000) -> int:
    """Random order amount in paise (₹800 to ₹2500)."""
    return random.randint(low, high)

def random_datetime_between(start: datetime, end: datetime) -> datetime:
    delta = end - start
    random_seconds = random.randint(0, int(delta.total_seconds()))
    return start + timedelta(seconds=random_seconds)

def iso_format(dt: datetime) -> str:
    return dt.strftime(f"%Y-%m-%dT%H:%M:%S{TZ_OFFSET}")

def hdfc_date_format(dt: datetime) -> str:
    return dt.strftime("%d/%m/%y")

def paise_to_rupees(paise: int) -> str:
    """Convert paise to rupees string with 2 decimals."""
    return f"{paise / 100:.2f}"

def shopify_subtotal_and_tax(total_paise: int) -> tuple:
    """Split total into subtotal + 18% GST such that subtotal + tax = total."""
    # total = subtotal * 1.18 => subtotal = total / 1.18
    subtotal_paise = round(total_paise / 1.18)
    tax_paise = total_paise - subtotal_paise
    return subtotal_paise, tax_paise

# -------------------------------------------------------------
# Core Data Structures
# -------------------------------------------------------------

class Payment:
    def __init__(self, amount_paise: int, method: str, captured_at: datetime,
                 order_id: str = None, status: str = "captured"):
        self.payment_id = gen_payment_id()
        self.order_id = order_id or gen_order_id()
        self.settlement_id = ""
        self.amount_paise = amount_paise
        self.method = method
        self.fee_paise, self.tax_paise = compute_fee(amount_paise, method)
        self.settled_amount_paise = amount_paise - self.fee_paise - self.tax_paise
        self.currency = "INR"
        self.status = status
        self.captured_at = captured_at
        self.refund_ids = ""

    def to_row(self) -> dict:
        return {
            "payment_id": self.payment_id,
            "order_id": self.order_id,
            "settlement_id": self.settlement_id,
            "amount_paise": self.amount_paise,
            "fee_paise": self.fee_paise,
            "tax_paise": self.tax_paise,
            "settled_amount_paise": self.settled_amount_paise,
            "method": self.method,
            "currency": self.currency,
            "status": self.status,
            "captured_at": iso_format(self.captured_at),
            "refund_ids": self.refund_ids,
        }

class Settlement:
    def __init__(self, payments: list, settled_at: datetime, utr: str = None,
                 status: str = "processed"):
        self.settlement_id = gen_settlement_id()
        self.utr = utr or gen_utr()
        self.status = status
        # Compute aggregates from payments
        self.amount_paise = sum(p.settled_amount_paise for p in payments)
        self.fees_paise = sum(p.fee_paise for p in payments)
        self.tax_paise = sum(p.tax_paise for p in payments)
        self.created_at = settled_at - timedelta(minutes=random.randint(30, 90))
        self.settled_at = settled_at
        # Link payments
        for p in payments:
            p.settlement_id = self.settlement_id

    def to_row(self) -> dict:
        return {
            "settlement_id": self.settlement_id,
            "utr": self.utr,
            "amount_paise": self.amount_paise,
            "fees_paise": self.fees_paise,
            "tax_paise": self.tax_paise,
            "status": self.status,
            "created_at": iso_format(self.created_at),
            "settled_at": iso_format(self.settled_at),
        }

class ShopifyOrder:
    def __init__(self, payment: Payment, order_number: int, discount_paise: int = 0,
                 financial_status: str = "paid", refunded_amount_paise: int = 0):
        self.name = f"#{order_number}"
        self.id = gen_shopify_id()
        self.financial_status = financial_status
        self.currency = "INR"
        self.total_paise = payment.amount_paise
        self.subtotal_paise, self.taxes_paise = shopify_subtotal_and_tax(self.total_paise)
        self.discount_paise = discount_paise
        self.payment_reference = payment.payment_id
        self.payment_method = "Razorpay"
        self.created_at = payment.captured_at - timedelta(seconds=random.randint(2, 10))
        self.processed_at = payment.captured_at
        self.refunded_amount_paise = refunded_amount_paise

    def to_row(self) -> dict:
        return {
            "Name": self.name,
            "Id": self.id,
            "Financial Status": self.financial_status,
            "Currency": self.currency,
            "Subtotal": paise_to_rupees(self.subtotal_paise),
            "Taxes": paise_to_rupees(self.taxes_paise),
            "Total": paise_to_rupees(self.total_paise),
            "Discount Amount": paise_to_rupees(self.discount_paise),
            "Payment Reference": self.payment_reference,
            "Payment Method": self.payment_method,
            "Created At": iso_format(self.created_at),
            "Processed At": iso_format(self.processed_at),
            "Refunded Amount": paise_to_rupees(self.refunded_amount_paise),
        }

class BankRow:
    def __init__(self, date: datetime, narration: str, deposit_paise: int = 0,
                 withdrawal_paise: int = 0, chq_ref: str = ""):
        self.date = date
        self.narration = narration
        self.chq_ref = chq_ref
        self.deposit_paise = deposit_paise
        self.withdrawal_paise = withdrawal_paise
        # Closing balance will be computed later
        self.closing_balance_paise = 0

    def to_row(self) -> dict:
        return {
            "Date": hdfc_date_format(self.date),
            "Narration": self.narration,
            "Chq/Ref No": self.chq_ref,
            "Value Dt": hdfc_date_format(self.date),
            "Withdrawal Amt": paise_to_rupees(self.withdrawal_paise) if self.withdrawal_paise > 0 else "",
            "Deposit Amt": paise_to_rupees(self.deposit_paise) if self.deposit_paise > 0 else "",
            "Closing Balance": paise_to_rupees(self.closing_balance_paise),
        }

# -------------------------------------------------------------
# Noise Row Generator (non-Razorpay bank transactions)
# -------------------------------------------------------------

NOISE_NARRATIONS = [
    ("NEFT-VENDOR-COSMETICS-SUPPLY-LTD", 0, random.randint(1500000, 3000000)),  # Vendor payment
    ("NEFT-RENT-BANGALORE-OFFICE", 0, random.randint(5000000, 8000000)),  # Rent
    ("SAL-AUG26-EMPLOYEE-PAYROLL", 0, random.randint(10000000, 25000000)),  # Salary
    ("GST-CHALLAN-AUGUST-2026", 0, random.randint(500000, 1500000)),  # GST payment
    ("IMPS-FREELANCER-DESIGN-WORK", 0, random.randint(200000, 500000)),  # Freelancer
    ("NEFT-AWS-CLOUD-SERVICES", 0, random.randint(300000, 800000)),  # Cloud hosting
    ("UPI-SWIGGY-TEAM-LUNCH", 0, random.randint(5000, 20000)),  # Team lunch
    ("INTEREST-CREDIT-HDFC-SAVINGS", random.randint(10000, 50000), 0),  # Interest credit
    ("NEFT-SHIPROCKET-LOGISTICS", 0, random.randint(1000000, 2500000)),  # Logistics
    ("UPI-ZOMATO-OFFICE-DINNER", 0, random.randint(8000, 25000)),  # Dinner
    ("NEFT-GOOGLE-ADS-PAYMENT", 0, random.randint(500000, 1500000)),  # Ads
    ("IMPS-META-ADS-PAYMENT", 0, random.randint(400000, 1200000)),  # Meta ads
    ("NEFT-PACKAGING-MATERIALS-CO", 0, random.randint(200000, 600000)),  # Packaging
    ("NEFT-INSURANCE-PREMIUM-ANNUAL", 0, random.randint(300000, 700000)),  # Insurance
    ("FD-MATURITY-CREDIT-HDFC", random.randint(5000000, 10000000), 0),  # FD maturity
]

def generate_noise_rows(count: int, date_range_start: datetime, date_range_end: datetime) -> list:
    """Generate non-Razorpay bank statement noise rows."""
    noise = []
    choices = random.sample(NOISE_NARRATIONS, min(count, len(NOISE_NARRATIONS)))
    for narr, dep, wd in choices[:count]:
        dt = random_datetime_between(date_range_start, date_range_end)
        # Re-randomize amounts for each instance
        if dep > 0:
            deposit = random.randint(10000, 10000000)
            noise.append(BankRow(date=dt, narration=narr, deposit_paise=deposit))
        else:
            withdrawal = random.randint(5000, 25000000)
            noise.append(BankRow(date=dt, narration=narr, withdrawal_paise=withdrawal))
    return noise

# -------------------------------------------------------------
# Bank narration builder
# -------------------------------------------------------------

NARRATION_PREFIXES = ["NEFT-", "RAZORPAY-", "IMPS-"]

def build_narration(utr: str, suffix: str = "RAZORPAY") -> str:
    prefix = random.choice(NARRATION_PREFIXES)
    return f"{prefix}{utr}-{suffix}"

# -------------------------------------------------------------
# Compute running balance for bank statement
# -------------------------------------------------------------

def compute_closing_balances(bank_rows: list, opening_balance_paise: int):
    """Sort by date and compute running balance."""
    bank_rows.sort(key=lambda r: r.date)
    balance = opening_balance_paise
    for row in bank_rows:
        balance += row.deposit_paise - row.withdrawal_paise
        row.closing_balance_paise = balance

# -------------------------------------------------------------
# CSV Writers
# -------------------------------------------------------------

def write_csv(filepath: str, rows: list, fieldnames: list):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

def write_json(filepath: str, data):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# -------------------------------------------------------------
# DATASET A -- CLEAN (55 payments, zero defects)
# -------------------------------------------------------------

def generate_dataset_a(base_dir: str):
    print("Generating Dataset A (CLEAN)...")
    out_dir = os.path.join(base_dir, "data", "clean")

    payments = []
    orders = []
    manifest = []
    order_num = 1000

    # Generate 55 payments across the 7-day window
    capture_dates = []
    for i in range(55):
        dt = random_datetime_between(ORDER_START, ORDER_END)
        capture_dates.append(dt)
    capture_dates.sort()

    for i, cap_dt in enumerate(capture_dates):
        amt = random_amount_paise()
        method = random_method()
        p = Payment(amount_paise=amt, method=method, captured_at=cap_dt)
        payments.append(p)

        order_num += 1
        o = ShopifyOrder(payment=p, order_number=order_num)
        orders.append(o)

    # Group payments into settlements by day (T+2)
    # Group by capture date
    from collections import defaultdict
    day_groups = defaultdict(list)
    for p in payments:
        day_key = p.captured_at.date()
        day_groups[day_key].append(p)

    settlements = []
    bank_rows = []
    # Aggregate by capture-day groups into settlements
    sorted_days = sorted(day_groups.keys())

    # We want 3-5 settlements. Group consecutive days.
    settlement_groups = []
    group = []
    for i, day in enumerate(sorted_days):
        group.extend(day_groups[day])
        # Create a settlement every 2-3 days of orders
        if len(group) >= 10 or i == len(sorted_days) - 1:
            settlement_groups.append(list(group))
            group = []

    for grp in settlement_groups:
        # Settlement happens T+2 from the latest capture in the group
        latest_capture = max(p.captured_at for p in grp)
        settle_dt = latest_capture + timedelta(days=T_PLUS_2_DAYS, hours=random.randint(1, 4))
        utr = gen_utr()
        s = Settlement(payments=grp, settled_at=settle_dt, utr=utr)
        settlements.append(s)

        # Bank row for this settlement
        narration = build_narration(utr)
        br = BankRow(
            date=settle_dt,
            narration=narration,
            deposit_paise=s.amount_paise,
            chq_ref=utr[-12:],
        )
        bank_rows.append(br)

    # Compute bank closing balances
    compute_closing_balances(bank_rows, HDFC_OPENING_BALANCE)

    # Build manifest
    for p in payments:
        manifest.append({
            "record_key": p.payment_id,
            "expected_match_status": "matched",
            "injected_defect": None,
            "expected_confidence": "HIGH",
        })

    # Write files
    settlement_fields = ["settlement_id", "utr", "amount_paise", "fees_paise",
                         "tax_paise", "status", "created_at", "settled_at"]
    payment_fields = ["payment_id", "order_id", "settlement_id", "amount_paise",
                      "fee_paise", "tax_paise", "settled_amount_paise", "method",
                      "currency", "status", "captured_at", "refund_ids"]
    bank_fields = ["Date", "Narration", "Chq/Ref No", "Value Dt",
                   "Withdrawal Amt", "Deposit Amt", "Closing Balance"]
    shopify_fields = ["Name", "Id", "Financial Status", "Currency", "Subtotal",
                      "Taxes", "Total", "Discount Amount", "Payment Reference",
                      "Payment Method", "Created At", "Processed At", "Refunded Amount"]

    write_csv(os.path.join(out_dir, "razorpay_settlements.csv"),
              [s.to_row() for s in settlements], settlement_fields)
    write_csv(os.path.join(out_dir, "razorpay_payments.csv"),
              [p.to_row() for p in payments], payment_fields)
    write_csv(os.path.join(out_dir, "hdfc_bank_statement.csv"),
              [b.to_row() for b in bank_rows], bank_fields)
    write_csv(os.path.join(out_dir, "shopify_orders.csv"),
              [o.to_row() for o in orders], shopify_fields)
    write_json(os.path.join(out_dir, "manifest.json"), manifest)

    # Verify
    verify_dataset("A (CLEAN)", payments, settlements, bank_rows, orders, manifest, expect_clean=True)

    return payments, settlements, bank_rows, orders, manifest

# -------------------------------------------------------------
# DATASET B -- MESSY (80 payments, realistic defects)
# -------------------------------------------------------------

def generate_dataset_b(base_dir: str):
    print("Generating Dataset B (MESSY)...")
    out_dir = os.path.join(base_dir, "data", "messy")

    payments = []
    orders = []
    manifest = []
    order_num = 2000

    # We need ~80 payments. ~61 will be clean, rest will have injected defects.
    # First generate the clean base: 61 standard payments
    capture_dates = []
    for i in range(61):
        dt = random_datetime_between(ORDER_START, ORDER_END)
        capture_dates.append(dt)
    capture_dates.sort()

    clean_payments = []
    for cap_dt in capture_dates:
        amt = random_amount_paise()
        method = random_method()
        p = Payment(amount_paise=amt, method=method, captured_at=cap_dt)
        clean_payments.append(p)
        order_num += 1
        o = ShopifyOrder(payment=p, order_number=order_num)
        orders.append(o)
        payments.append(p)

    # -- Inject defect: 4x timing_gap --
    # Payments captured on Aug 23 (latest day), settlement NOT yet in bank
    timing_gap_payments = []
    for i in range(4):
        cap_dt = random_datetime_between(
            datetime(2026, 8, 23, 10, 0, 0),
            datetime(2026, 8, 23, 20, 0, 0)
        )
        amt = random_amount_paise()
        method = random_method()
        p = Payment(amount_paise=amt, method=method, captured_at=cap_dt)
        # These will NOT be assigned to any settlement (not yet settled)
        timing_gap_payments.append(p)
        payments.append(p)
        order_num += 1
        o = ShopifyOrder(payment=p, order_number=order_num)
        orders.append(o)
        manifest.append({
            "record_key": p.payment_id,
            "expected_match_status": "timing_gap",
            "injected_defect": "Payment captured Aug 23, T+2 settlement not due until Aug 25 -- not in bank yet",
            "expected_confidence": "HIGH",
        })

    # -- Inject defect: 3x fee_discrepancy --
    # Payment fee computed at 2.5% instead of 2% (simulating mid-batch pricing change)
    fee_discrepancy_payments = []
    for i in range(3):
        cap_dt = random_datetime_between(ORDER_START, ORDER_END - timedelta(days=2))
        amt = random_amount_paise()
        p = Payment(amount_paise=amt, method="card", captured_at=cap_dt)
        # Override fee to 2.5% instead of 2%
        p.fee_paise = round(amt * 0.025)
        p.tax_paise = round(p.fee_paise * GST_RATE)
        p.settled_amount_paise = amt - p.fee_paise - p.tax_paise
        fee_discrepancy_payments.append(p)
        payments.append(p)
        order_num += 1
        o = ShopifyOrder(payment=p, order_number=order_num)
        orders.append(o)
        manifest.append({
            "record_key": p.payment_id,
            "expected_match_status": "fee_discrepancy",
            "injected_defect": f"Card fee charged at 2.5% instead of standard 2%. Delta: {round(amt * 0.005)} paise + GST",
            "expected_confidence": "MEDIUM",
        })

    # -- Inject defect: 2x chargeback_withheld --
    # Payment exists, but bank credit is short by chargeback amount
    chargeback_payments = []
    for i in range(2):
        cap_dt = random_datetime_between(ORDER_START, ORDER_END - timedelta(days=3))
        amt = random_amount_paise(100000, 200000)
        method = "card"
        p = Payment(amount_paise=amt, method=method, captured_at=cap_dt)
        chargeback_payments.append(p)
        payments.append(p)
        order_num += 1
        o = ShopifyOrder(payment=p, order_number=order_num)
        orders.append(o)
        manifest.append({
            "record_key": p.payment_id,
            "expected_match_status": "chargeback_withheld",
            "injected_defect": f"Chargeback of ₹{amt/100:.2f} withheld from settlement. Bank credit short by this amount.",
            "expected_confidence": "MEDIUM",
        })

    # -- Inject defect: 3x refund_netted --
    # Razorpay shows refund, settlement netted, but Shopify still says "paid"
    refund_payments = []
    for i in range(3):
        cap_dt = random_datetime_between(ORDER_START, ORDER_END - timedelta(days=3))
        amt = random_amount_paise()
        method = random_method()
        p = Payment(amount_paise=amt, method=method, captured_at=cap_dt, status="refunded")
        p.refund_ids = gen_refund_id()
        refund_payments.append(p)
        payments.append(p)
        order_num += 1
        # Shopify still shows "paid" (sync gap)
        o = ShopifyOrder(payment=p, order_number=order_num, financial_status="paid")
        orders.append(o)
        manifest.append({
            "record_key": p.payment_id,
            "expected_match_status": "refund_netted",
            "injected_defect": "Razorpay shows refunded, settlement netted, but Shopify still shows 'paid' -- sync gap",
            "expected_confidence": "MEDIUM",
        })

    # -- Inject defect: 2x partial_refund --
    partial_refund_payments = []
    for i in range(2):
        cap_dt = random_datetime_between(ORDER_START, ORDER_END - timedelta(days=3))
        amt = random_amount_paise(120000, 200000)
        method = "card"
        p = Payment(amount_paise=amt, method=method, captured_at=cap_dt)
        refund_amount = round(amt * 0.4)  # 40% refund
        p.refund_ids = gen_refund_id()
        partial_refund_payments.append((p, refund_amount))
        payments.append(p)
        order_num += 1
        o = ShopifyOrder(payment=p, order_number=order_num,
                         financial_status="partially_refunded",
                         refunded_amount_paise=refund_amount)
        orders.append(o)
        manifest.append({
            "record_key": p.payment_id,
            "expected_match_status": "partial_refund",
            "injected_defect": f"Order partially refunded ₹{refund_amount/100:.2f} of ₹{amt/100:.2f}. Settlement should reflect net amount.",
            "expected_confidence": "MEDIUM",
        })

    # -- Inject defect: 1x duplicate_capture --
    cap_dt = random_datetime_between(ORDER_START, ORDER_END - timedelta(days=3))
    amt = random_amount_paise()
    method = "card"
    dup_order_id = gen_order_id()
    p1 = Payment(amount_paise=amt, method=method, captured_at=cap_dt, order_id=dup_order_id)
    p2 = Payment(amount_paise=amt, method=method,
                 captured_at=cap_dt + timedelta(seconds=3), order_id=dup_order_id)
    p2.order_id = p1.order_id  # Same order, captured twice
    payments.append(p1)
    payments.append(p2)
    order_num += 1
    o_dup = ShopifyOrder(payment=p1, order_number=order_num)
    orders.append(o_dup)
    manifest.append({
        "record_key": p1.payment_id,
        "expected_match_status": "matched",
        "injected_defect": "First capture of duplicate -- this is the legitimate one",
        "expected_confidence": "HIGH",
    })
    manifest.append({
        "record_key": p2.payment_id,
        "expected_match_status": "duplicate_capture",
        "injected_defect": "Second capture of same order (webhook retry race). Needs refund.",
        "expected_confidence": "LOW",
    })

    # -- Inject defect: 2x split_payment --
    for i in range(2):
        cap_dt = random_datetime_between(ORDER_START, ORDER_END - timedelta(days=3))
        total_amt = random_amount_paise(200000, 350000)
        split1_amt = round(total_amt * 0.6)
        split2_amt = total_amt - split1_amt
        shared_order_id = gen_order_id()
        sp1 = Payment(amount_paise=split1_amt, method="card", captured_at=cap_dt,
                      order_id=shared_order_id)
        sp2 = Payment(amount_paise=split2_amt, method="upi",
                      captured_at=cap_dt + timedelta(minutes=2),
                      order_id=shared_order_id)
        payments.append(sp1)
        payments.append(sp2)
        order_num += 1
        # Shopify order shows the full total
        o_split = ShopifyOrder(payment=sp1, order_number=order_num)
        o_split.total_paise = total_amt
        o_split.subtotal_paise, o_split.taxes_paise = shopify_subtotal_and_tax(total_amt)
        orders.append(o_split)
        manifest.append({
            "record_key": sp1.payment_id,
            "expected_match_status": "split_payment",
            "injected_defect": f"Split payment 1 of 2 for order total ₹{total_amt/100:.2f}. This part: ₹{split1_amt/100:.2f}",
            "expected_confidence": "MEDIUM",
        })
        manifest.append({
            "record_key": sp2.payment_id,
            "expected_match_status": "split_payment",
            "injected_defect": f"Split payment 2 of 2 for order total ₹{total_amt/100:.2f}. This part: ₹{split2_amt/100:.2f}",
            "expected_confidence": "MEDIUM",
        })

    # -- Inject defect: 2x orphan_payment --
    for i in range(2):
        cap_dt = random_datetime_between(ORDER_START, ORDER_END - timedelta(days=2))
        amt = random_amount_paise(50000, 150000)
        method = random_method()
        p = Payment(amount_paise=amt, method=method, captured_at=cap_dt)
        payments.append(p)
        # NO Shopify order created for this payment
        manifest.append({
            "record_key": p.payment_id,
            "expected_match_status": "orphan_payment",
            "injected_defect": "Payment via manual payment link -- no corresponding Shopify order exists",
            "expected_confidence": "LOW",
        })

    # -- Now group non-timing-gap, non-refunded payments into settlements --
    from collections import defaultdict

    settleable = [p for p in payments
                  if p not in timing_gap_payments
                  and p.status != "refunded"]

    day_groups = defaultdict(list)
    for p in settleable:
        day_key = p.captured_at.date()
        day_groups[day_key].append(p)

    settlements = []
    bank_rows = []
    sorted_days = sorted(day_groups.keys())

    # Create 5-8 settlements by grouping days
    settlement_groups = []
    group = []
    for i, day in enumerate(sorted_days):
        group.extend(day_groups[day])
        if len(group) >= 12 or i == len(sorted_days) - 1:
            if group:
                settlement_groups.append(list(group))
            group = []
    if group:
        settlement_groups.append(group)

    # Track chargeback amounts to deduct from bank credits
    chargeback_deductions = {}
    for cp in chargeback_payments:
        # Will be deducted from whichever settlement this payment lands in
        chargeback_deductions[cp.payment_id] = cp.settled_amount_paise

    for grp in settlement_groups:
        latest_capture = max(p.captured_at for p in grp)
        settle_dt = latest_capture + timedelta(days=T_PLUS_2_DAYS, hours=random.randint(1, 4))
        utr = gen_utr()
        s = Settlement(payments=grp, settled_at=settle_dt, utr=utr)
        settlements.append(s)

        # Compute chargeback deduction for this settlement's bank credit
        cb_deduction = 0
        for p in grp:
            if p.payment_id in chargeback_deductions:
                cb_deduction += chargeback_deductions[p.payment_id]

        # Also deduct refund netting
        refund_deduction = 0
        for rp in refund_payments:
            if rp.settlement_id == s.settlement_id:
                refund_deduction += rp.settled_amount_paise

        # Also deduct partial refunds
        partial_deduction = 0
        for prp, refund_amt in partial_refund_payments:
            if prp.settlement_id == s.settlement_id:
                # Deduct the refund portion's settled equivalent
                fee_rate = FEE_RATES.get(prp.method, 0.02)
                partial_deduction += round(refund_amt * (1 - fee_rate * (1 + GST_RATE)))

        bank_deposit = s.amount_paise - cb_deduction - refund_deduction - partial_deduction

        narration = build_narration(utr)
        br = BankRow(
            date=settle_dt,
            narration=narration,
            deposit_paise=max(bank_deposit, 0),
            chq_ref=utr[-12:],
        )
        bank_rows.append(br)

    # Add noise rows (10-15% of bank rows = ~2-3 noise rows)
    noise_count = max(2, round(len(bank_rows) * 0.15))
    noise_rows = generate_noise_rows(noise_count + 5, ORDER_START, RECON_DATE)
    # Add extra noise to reach 10-15% ratio of total bank rows
    bank_rows.extend(noise_rows[:noise_count + 3])

    # Add manifest entries for clean payments
    for p in clean_payments:
        manifest.append({
            "record_key": p.payment_id,
            "expected_match_status": "matched",
            "injected_defect": None,
            "expected_confidence": "HIGH",
        })

    # Compute bank closing balances
    compute_closing_balances(bank_rows, HDFC_OPENING_BALANCE)

    # Write files
    settlement_fields = ["settlement_id", "utr", "amount_paise", "fees_paise",
                         "tax_paise", "status", "created_at", "settled_at"]
    payment_fields = ["payment_id", "order_id", "settlement_id", "amount_paise",
                      "fee_paise", "tax_paise", "settled_amount_paise", "method",
                      "currency", "status", "captured_at", "refund_ids"]
    bank_fields = ["Date", "Narration", "Chq/Ref No", "Value Dt",
                   "Withdrawal Amt", "Deposit Amt", "Closing Balance"]
    shopify_fields = ["Name", "Id", "Financial Status", "Currency", "Subtotal",
                      "Taxes", "Total", "Discount Amount", "Payment Reference",
                      "Payment Method", "Created At", "Processed At", "Refunded Amount"]

    write_csv(os.path.join(out_dir, "razorpay_settlements.csv"),
              [s.to_row() for s in settlements], settlement_fields)
    write_csv(os.path.join(out_dir, "razorpay_payments.csv"),
              [p.to_row() for p in payments], payment_fields)
    write_csv(os.path.join(out_dir, "hdfc_bank_statement.csv"),
              [b.to_row() for b in bank_rows], bank_fields)
    write_csv(os.path.join(out_dir, "shopify_orders.csv"),
              [o.to_row() for o in orders], shopify_fields)
    write_json(os.path.join(out_dir, "manifest.json"), manifest)

    verify_dataset("B (MESSY)", payments, settlements, bank_rows, orders, manifest)

    return payments, settlements, bank_rows, orders, manifest

# -------------------------------------------------------------
# DATASET C -- ADVERSARIAL (60 payments, harder edge cases)
# -------------------------------------------------------------

def generate_dataset_c(base_dir: str):
    print("Generating Dataset C (ADVERSARIAL)...")
    out_dir = os.path.join(base_dir, "data", "adversarial")

    payments = []
    orders = []
    manifest = []
    order_num = 3000

    # 48 clean base payments
    capture_dates = []
    for i in range(48):
        dt = random_datetime_between(ORDER_START, ORDER_END)
        capture_dates.append(dt)
    capture_dates.sort()

    clean_payments = []
    for cap_dt in capture_dates:
        amt = random_amount_paise()
        method = random_method()
        p = Payment(amount_paise=amt, method=method, captured_at=cap_dt)
        clean_payments.append(p)
        payments.append(p)
        order_num += 1
        o = ShopifyOrder(payment=p, order_number=order_num)
        orders.append(o)
        manifest.append({
            "record_key": p.payment_id,
            "expected_match_status": "matched",
            "injected_defect": None,
            "expected_confidence": "HIGH",
        })

    # -- Adversarial: UTR typo (Levenshtein distance 1-2) -- 2 records --
    utr_typo_payments = []
    for i in range(2):
        cap_dt = random_datetime_between(ORDER_START, ORDER_END - timedelta(days=3))
        amt = random_amount_paise()
        method = random_method()
        p = Payment(amount_paise=amt, method=method, captured_at=cap_dt)
        utr_typo_payments.append(p)
        payments.append(p)
        order_num += 1
        o = ShopifyOrder(payment=p, order_number=order_num)
        orders.append(o)
        manifest.append({
            "record_key": p.payment_id,
            "expected_match_status": "matched",
            "injected_defect": f"UTR in bank narration has Levenshtein-{i+1} typo (tests fuzzy matching layer)",
            "expected_confidence": "MEDIUM",
        })

    # -- Adversarial: International payment (USD → INR with FX delta) -- 1 record --
    cap_dt = random_datetime_between(ORDER_START, ORDER_END - timedelta(days=3))
    fx_usd_amount = random.randint(20, 80)  # $20-$80
    fx_rate = 83.45  # USD to INR rate
    fx_inr_paise = round(fx_usd_amount * fx_rate * 100)
    # Higher fee for international: 3%
    fx_payment = Payment(amount_paise=fx_inr_paise, method="card", captured_at=cap_dt)
    fx_payment.fee_paise = round(fx_inr_paise * 0.03)  # 3% international fee
    fx_payment.tax_paise = round(fx_payment.fee_paise * GST_RATE)
    fx_payment.settled_amount_paise = fx_inr_paise - fx_payment.fee_paise - fx_payment.tax_paise
    fx_payment.currency = "USD"
    payments.append(fx_payment)
    order_num += 1
    fx_order = ShopifyOrder(payment=fx_payment, order_number=order_num)
    fx_order.currency = "USD"
    # Shopify total in USD
    fx_order.total_paise = fx_usd_amount * 100  # Store as USD cents
    fx_order.subtotal_paise = round(fx_order.total_paise / 1.18)
    fx_order.taxes_paise = fx_order.total_paise - fx_order.subtotal_paise
    orders.append(fx_order)
    manifest.append({
        "record_key": fx_payment.payment_id,
        "expected_match_status": "fx_delta",
        "injected_defect": f"International USD payment. Shopify shows ${fx_usd_amount}, Razorpay settled in INR at {fx_rate} rate with 3% intl fee.",
        "expected_confidence": "MEDIUM",
    })

    # -- Adversarial: 3-way EMI split across 2 settlements -- 1 order --
    cap_dt = random_datetime_between(ORDER_START, ORDER_END - timedelta(days=4))
    emi_total = random_amount_paise(300000, 500000)
    emi_part = round(emi_total / 3)
    emi_remainder = emi_total - 2 * emi_part
    shared_emi_order_id = gen_order_id()
    emi_payments = []
    for j, emi_amt in enumerate([emi_part, emi_part, emi_remainder]):
        ep = Payment(amount_paise=emi_amt, method="emi",
                     captured_at=cap_dt + timedelta(days=j),
                     order_id=shared_emi_order_id)
        emi_payments.append(ep)
        payments.append(ep)
        manifest.append({
            "record_key": ep.payment_id,
            "expected_match_status": "split_payment",
            "injected_defect": f"EMI installment {j+1}/3 of total ₹{emi_total/100:.2f}. Spread across 2 different settlements.",
            "expected_confidence": "MEDIUM",
        })
    order_num += 1
    emi_order = ShopifyOrder(payment=emi_payments[0], order_number=order_num)
    emi_order.total_paise = emi_total
    emi_order.subtotal_paise, emi_order.taxes_paise = shopify_subtotal_and_tax(emi_total)
    orders.append(emi_order)

    # -- Adversarial: Duplicate capture where BOTH show captured -- 1 record --
    cap_dt = random_datetime_between(ORDER_START, ORDER_END - timedelta(days=3))
    dup_amt = random_amount_paise()
    dup_oid = gen_order_id()
    dup1 = Payment(amount_paise=dup_amt, method="card", captured_at=cap_dt, order_id=dup_oid)
    dup2 = Payment(amount_paise=dup_amt, method="card",
                   captured_at=cap_dt + timedelta(seconds=5), order_id=dup_oid)
    payments.append(dup1)
    payments.append(dup2)
    order_num += 1
    dup_order = ShopifyOrder(payment=dup1, order_number=order_num)
    orders.append(dup_order)
    manifest.append({
        "record_key": dup1.payment_id,
        "expected_match_status": "matched",
        "injected_defect": "First capture of ambiguous duplicate -- both show status=captured",
        "expected_confidence": "HIGH",
    })
    manifest.append({
        "record_key": dup2.payment_id,
        "expected_match_status": "duplicate_capture",
        "injected_defect": "Second capture of same order, ALSO status=captured. Ambiguous -- which is real?",
        "expected_confidence": "LOW",
    })

    # -- Adversarial: Truncated Payment Reference in Shopify -- 1 record --
    cap_dt = random_datetime_between(ORDER_START, ORDER_END - timedelta(days=2))
    trunc_amt = random_amount_paise()
    trunc_payment = Payment(amount_paise=trunc_amt, method=random_method(), captured_at=cap_dt)
    payments.append(trunc_payment)
    order_num += 1
    trunc_order = ShopifyOrder(payment=trunc_payment, order_number=order_num)
    # Truncate last 4 chars of payment reference
    trunc_order.payment_reference = trunc_payment.payment_id[:-4]
    orders.append(trunc_order)
    manifest.append({
        "record_key": trunc_payment.payment_id,
        "expected_match_status": "matched",
        "injected_defect": f"Shopify Payment Reference truncated: '{trunc_order.payment_reference}' instead of '{trunc_payment.payment_id}'",
        "expected_confidence": "MEDIUM",
    })

    # -- Adversarial: Same amount, same day, different payments -- 2 records --
    cap_dt = random_datetime_between(ORDER_START, ORDER_END - timedelta(days=3))
    same_amt = 150000  # Exactly ₹1500.00
    sa_p1 = Payment(amount_paise=same_amt, method="upi", captured_at=cap_dt)
    sa_p2 = Payment(amount_paise=same_amt, method="upi",
                    captured_at=cap_dt + timedelta(hours=2))
    payments.append(sa_p1)
    payments.append(sa_p2)
    order_num += 1
    sa_o1 = ShopifyOrder(payment=sa_p1, order_number=order_num)
    orders.append(sa_o1)
    order_num += 1
    sa_o2 = ShopifyOrder(payment=sa_p2, order_number=order_num)
    orders.append(sa_o2)
    manifest.append({
        "record_key": sa_p1.payment_id,
        "expected_match_status": "matched",
        "injected_defect": "Same ₹1500 amount as another payment on same day. Must match by reference, not amount.",
        "expected_confidence": "HIGH",
    })
    manifest.append({
        "record_key": sa_p2.payment_id,
        "expected_match_status": "matched",
        "injected_defect": "Same ₹1500 amount as another payment on same day. Must match by reference, not amount.",
        "expected_confidence": "HIGH",
    })

    # -- Adversarial: Refund straddling two settlement batches -- 1 record --
    cap_dt = random_datetime_between(ORDER_START, ORDER_END - timedelta(days=4))
    straddle_amt = random_amount_paise(150000, 250000)
    straddle_p = Payment(amount_paise=straddle_amt, method="card", captured_at=cap_dt,
                         status="refunded")
    straddle_p.refund_ids = gen_refund_id()
    payments.append(straddle_p)
    order_num += 1
    straddle_o = ShopifyOrder(payment=straddle_p, order_number=order_num,
                              financial_status="refunded",
                              refunded_amount_paise=straddle_amt)
    orders.append(straddle_o)
    manifest.append({
        "record_key": straddle_p.payment_id,
        "expected_match_status": "refund_netted",
        "injected_defect": "Refund initiated after first settlement batch; deduction appears in second batch. Straddles two settlements.",
        "expected_confidence": "MEDIUM",
    })

    # -- Now create settlements --
    from collections import defaultdict

    settleable = [p for p in payments if p.status != "refunded"]
    day_groups = defaultdict(list)
    for p in settleable:
        day_key = p.captured_at.date()
        day_groups[day_key].append(p)

    settlements = []
    bank_rows = []
    sorted_days = sorted(day_groups.keys())

    settlement_groups = []
    group = []
    for i, day in enumerate(sorted_days):
        group.extend(day_groups[day])
        if len(group) >= 12 or i == len(sorted_days) - 1:
            if group:
                settlement_groups.append(list(group))
            group = []
    if group:
        settlement_groups.append(group)

    # Put EMI payments 0,1 in one settlement and 2 in another (straddle)
    # This happens naturally by date grouping since EMI payments are on consecutive days

    for grp_idx, grp in enumerate(settlement_groups):
        latest_capture = max(p.captured_at for p in grp)
        settle_dt = latest_capture + timedelta(days=T_PLUS_2_DAYS, hours=random.randint(1, 4))

        utr = gen_utr()

        # For UTR typo records: create settlement normally but modify bank narration
        has_typo_record = False
        typo_utr = utr
        for tp in utr_typo_payments:
            if tp in grp:
                has_typo_record = True
                break

        s = Settlement(payments=grp, settled_at=settle_dt, utr=utr)
        settlements.append(s)

        # Build bank narration
        if has_typo_record:
            # Introduce UTR typo in narration
            typo_utr_list = list(utr)
            # Swap one digit
            pos = random.randint(4, len(typo_utr_list) - 1)
            old_char = typo_utr_list[pos]
            new_char = str((int(old_char) + 1) % 10) if old_char.isdigit() else 'X'
            typo_utr_list[pos] = new_char
            typo_utr = ''.join(typo_utr_list)
            narration = build_narration(typo_utr)
        else:
            narration = build_narration(utr)

        # Deduct refund straddle from one settlement
        refund_deduction = 0
        if grp_idx == 1:  # Second settlement batch gets the refund deduction
            refund_deduction = straddle_p.settled_amount_paise

        br = BankRow(
            date=settle_dt,
            narration=narration,
            deposit_paise=max(s.amount_paise - refund_deduction, 0),
            chq_ref=utr[-12:],
        )
        bank_rows.append(br)

    # Add noise rows
    noise_count = max(3, round(len(bank_rows) * 0.15))
    noise_rows = generate_noise_rows(noise_count + 3, ORDER_START, RECON_DATE)
    bank_rows.extend(noise_rows[:noise_count + 2])

    # Compute bank closing balances
    compute_closing_balances(bank_rows, HDFC_OPENING_BALANCE)

    # Write files
    settlement_fields = ["settlement_id", "utr", "amount_paise", "fees_paise",
                         "tax_paise", "status", "created_at", "settled_at"]
    payment_fields = ["payment_id", "order_id", "settlement_id", "amount_paise",
                      "fee_paise", "tax_paise", "settled_amount_paise", "method",
                      "currency", "status", "captured_at", "refund_ids"]
    bank_fields = ["Date", "Narration", "Chq/Ref No", "Value Dt",
                   "Withdrawal Amt", "Deposit Amt", "Closing Balance"]
    shopify_fields = ["Name", "Id", "Financial Status", "Currency", "Subtotal",
                      "Taxes", "Total", "Discount Amount", "Payment Reference",
                      "Payment Method", "Created At", "Processed At", "Refunded Amount"]

    write_csv(os.path.join(out_dir, "razorpay_settlements.csv"),
              [s.to_row() for s in settlements], settlement_fields)
    write_csv(os.path.join(out_dir, "razorpay_payments.csv"),
              [p.to_row() for p in payments], payment_fields)
    write_csv(os.path.join(out_dir, "hdfc_bank_statement.csv"),
              [b.to_row() for b in bank_rows], bank_fields)
    write_csv(os.path.join(out_dir, "shopify_orders.csv"),
              [o.to_row() for o in orders], shopify_fields)
    write_json(os.path.join(out_dir, "manifest.json"), manifest)

    verify_dataset("C (ADVERSARIAL)", payments, settlements, bank_rows, orders, manifest)

    return payments, settlements, bank_rows, orders, manifest

# -------------------------------------------------------------
# Verification Engine
# -------------------------------------------------------------

def verify_dataset(name: str, payments, settlements, bank_rows, orders, manifest,
                   expect_clean=False):
    """Run all realism checks specified in the prompt."""
    print(f"\n{'='*60}")
    print(f"VERIFICATION REPORT -- Dataset {name}")
    print(f"{'='*60}")

    errors = []

    # 1. Row counts
    print(f"\nRow Counts:")
    print(f"  Payments:    {len(payments)}")
    print(f"  Settlements: {len(settlements)}")
    print(f"  Bank Rows:   {len(bank_rows)}")
    print(f"  Orders:      {len(orders)}")
    print(f"  Manifest:    {len(manifest)}")

    # 2. Sum check -- for every settlement, sum of settled_amounts should match
    print(f"\nSum Check (Settlement <-> Payments):")
    for s in settlements:
        payment_sum = sum(p.settled_amount_paise for p in payments
                         if p.settlement_id == s.settlement_id)
        if payment_sum != s.amount_paise:
            msg = f"  [!] Settlement {s.settlement_id}: payment sum {payment_sum} != settlement amount {s.amount_paise} (delta: {payment_sum - s.amount_paise})"
            print(msg)
            if expect_clean:
                errors.append(msg)
        else:
            print(f"  [OK] Settlement {s.settlement_id}: {payment_sum} paise matches")

    # 3. Balance check -- HDFC closing balance consistency
    print(f"\nBalance Check (Bank Statement):")
    sorted_rows = sorted(bank_rows, key=lambda r: r.date)
    balance_ok = True
    prev_balance = HDFC_OPENING_BALANCE
    for row in sorted_rows:
        expected = prev_balance + row.deposit_paise - row.withdrawal_paise
        if row.closing_balance_paise != expected:
            msg = f"  [!] Bank row {row.narration[:30]}...: balance mismatch (expected {expected}, got {row.closing_balance_paise})"
            print(msg)
            errors.append(msg)
            balance_ok = False
        prev_balance = row.closing_balance_paise
    if balance_ok:
        print(f"  [OK] All {len(bank_rows)} rows have consistent running balance")

    # 4. Timestamp check -- captured_at < settled_at < bank date
    print(f"\nTimestamp Check:")
    ts_ok = True
    for p in payments:
        if p.settlement_id:
            matching_s = [s for s in settlements if s.settlement_id == p.settlement_id]
            if matching_s:
                s = matching_s[0]
                if p.captured_at >= s.settled_at:
                    msg = f"  [!] Payment {p.payment_id}: captured_at >= settled_at (time travel)"
                    print(msg)
                    errors.append(msg)
                    ts_ok = False
    if ts_ok:
        print(f"  [OK] No time-travel violations detected")

    # 5. UTR uniqueness
    print(f"\nUTR Uniqueness Check:")
    utrs = [s.utr for s in settlements]
    if len(utrs) == len(set(utrs)):
        print(f"  [OK] All {len(utrs)} UTRs are unique")
    else:
        msg = f"  [!] Duplicate UTRs found!"
        print(msg)
        errors.append(msg)

    # 6. ID format check
    print(f"\nID Format Check:")
    id_ok = True
    for p in payments:
        if not p.payment_id.startswith("pay_") or len(p.payment_id) != 18:
            msg = f"  [!] Payment ID format: {p.payment_id} (expected pay_ + 14 chars)"
            print(msg)
            errors.append(msg)
            id_ok = False
    for s in settlements:
        if not s.settlement_id.startswith("setl_") or len(s.settlement_id) != 19:
            msg = f"  [!] Settlement ID format: {s.settlement_id} (expected setl_ + 14 chars)"
            print(msg)
            errors.append(msg)
            id_ok = False
    if id_ok:
        print(f"  [OK] All IDs match expected prefix + length patterns")

    # 7. Coverage check -- every non-noise payment has a manifest entry
    print(f"\nCoverage Check:")
    manifest_keys = {m["record_key"] for m in manifest}
    payment_ids = {p.payment_id for p in payments}
    missing = payment_ids - manifest_keys
    if missing:
        msg = f"  [!] {len(missing)} payments missing from manifest: {list(missing)[:5]}"
        print(msg)
        errors.append(msg)
    else:
        print(f"  [OK] All {len(payment_ids)} payments covered in manifest")

    # Defect summary
    print(f"\nDefect Distribution:")
    from collections import Counter
    status_counts = Counter(m["expected_match_status"] for m in manifest)
    for status, count in sorted(status_counts.items(), key=lambda x: -x[1]):
        print(f"  {status:25s} {count}")

    if errors:
        print(f"\n[FAIL] {len(errors)} verification errors found!")
    else:
        print(f"\n[PASS] All checks passed!")

    return errors

# -------------------------------------------------------------
# Main
# -------------------------------------------------------------

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    print(f"Base directory: {base_dir}")
    print(f"Generating synthetic reconciliation datasets...")
    print(f"Merchant: Ananya's Skincare")
    print(f"Recon batch: 2026-08-24 morning IST")
    print(f"Order window: 2026-08-17 to 2026-08-23")
    print()

    # Reset ID counters for reproducibility
    global _id_counters
    _id_counters = {}

    generate_dataset_a(base_dir)
    print()

    _id_counters = {}  # Reset for clean namespacing
    generate_dataset_b(base_dir)
    print()

    _id_counters = {}  # Reset
    generate_dataset_c(base_dir)

    print("\n" + "="*60)
    print("ALL DATASETS GENERATED SUCCESSFULLY")
    print("="*60)
    print(f"\nOutput directories:")
    print(f"  data/clean/       -- Dataset A (55 payments, zero defects)")
    print(f"  data/messy/       -- Dataset B (80 payments, realistic defects)")
    print(f"  data/adversarial/ -- Dataset C (60 payments, harder edge cases)")

if __name__ == "__main__":
    main()
