"""Ingestion layer — three CSV parsers producing one canonical dataset.

Responsibilities (and nothing else):
  * Parse each source CSV.
  * Normalize money to integer paise (Decimal-based, no float matching).
  * Normalize timestamps to timezone-aware UTC.
  * Extract UTRs from bank narration via regex.
  * Preserve original source values for auditability.
  * Surface malformed rows explicitly instead of silently mutating/dropping.

This module contains NO matching logic. Its output (CanonicalDataset) is
deterministic given the same input files.
"""
from __future__ import annotations

import csv
import re
from datetime import datetime, timezone, time, date
from pathlib import Path

from .models import (
    CanonicalPayment, CanonicalSettlement, CanonicalBankTxn, CanonicalOrder,
    MalformedRecord, CanonicalDataset,
)
from .money import rupees_to_paise, MoneyParseError

# A UTR embedded in bank narration: a bank code (2-6 upper letters) directly
# followed by >=9 digits. "NEFT-HDFC3513963593378-RAZORPAY" -> "HDFC3513963593378".
# Prefixes like NEFT-/IMPS-/RAZORPAY- are not followed by digits, so they are
# not mis-captured. Rows with no such token (e.g. "NEFT-AWS-CLOUD-SERVICES")
# yield None and are treated as non-Razorpay noise.
_UTR_RE = re.compile(r"[A-Z]{2,6}\d{9,}")

_IST = timezone.utc  # placeholder; we parse explicit +05:30 offsets from the data


def _normalize_utr(raw: str) -> str:
    return raw.strip().upper()


def extract_utr(narration: str) -> str | None:
    """Extract the first UTR-shaped token from a bank narration, normalized."""
    if not narration:
        return None
    match = _UTR_RE.search(narration.upper())
    return match.group(0) if match else None


def _parse_iso_utc(value: str) -> datetime | None:
    """Parse an ISO-8601 timestamp with offset (e.g. +05:30) into UTC-aware UTC."""
    text = (value or "").strip()
    if not text:
        return None
    # Python's fromisoformat handles "+05:30"; normalize a trailing "Z" too.
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    dt = datetime.fromisoformat(text)
    if dt.tzinfo is None:
        # No offset present: treat as IST (+05:30), the documented source tz.
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _parse_bank_date(value: str) -> datetime | None:
    """Bank dates are DD/MM/YY. Anchor at IST midnight, store as UTC."""
    text = (value or "").strip()
    if not text:
        return None
    for fmt in ("%d/%m/%y", "%d/%m/%Y", "%d-%m-%Y", "%d-%m-%y"):
        try:
            d = datetime.strptime(text, fmt).date()
            break
        except ValueError:
            d = None
    if d is None:
        raise ValueError(f"unrecognized bank date format: {value!r}")
    # IST midnight -> UTC (previous day 18:30). Offset +05:30 subtracted.
    naive = datetime.combine(d, time(0, 0))
    ist = timezone(_td_ist())
    return naive.replace(tzinfo=ist).astimezone(timezone.utc)


def _td_ist():
    from datetime import timedelta
    return timedelta(hours=5, minutes=30)


def _read_csv(path: Path) -> list[dict]:
    with open(path, newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


# --------------------------------------------------------------------------- #
# Parsers
# --------------------------------------------------------------------------- #

def parse_settlements(path: Path) -> tuple[list[CanonicalSettlement], list[MalformedRecord]]:
    good, bad = [], []
    for i, row in enumerate(_read_csv(path), start=1):
        try:
            rec = CanonicalSettlement(
                settlement_id=row["settlement_id"].strip(),
                utr=_normalize_utr(row["utr"]),
                amount_paise=int(str(row["amount_paise"]).strip()),
                fees_paise=int(str(row["fees_paise"]).strip()),
                tax_paise=int(str(row["tax_paise"]).strip()),
                status=row["status"].strip(),
                created_at=_parse_iso_utc(row.get("created_at", "")),
                settled_at=_parse_iso_utc(row.get("settled_at", "")),
                source_row=dict(row),
            )
            good.append(rec)
        except (KeyError, ValueError, MoneyParseError) as exc:
            bad.append(MalformedRecord("settlements", i, str(exc), dict(row)))
    return good, bad


def parse_payments(path: Path) -> tuple[list[CanonicalPayment], list[MalformedRecord]]:
    good, bad = [], []
    for i, row in enumerate(_read_csv(path), start=1):
        try:
            settlement_id = row.get("settlement_id", "").strip() or None
            refunds = tuple(
                r for r in (row.get("refund_ids", "") or "").split("|") if r.strip()
            )
            rec = CanonicalPayment(
                payment_id=row["payment_id"].strip(),
                order_id=row["order_id"].strip(),
                settlement_id=settlement_id,
                amount_paise=int(str(row["amount_paise"]).strip()),
                fee_paise=int(str(row["fee_paise"]).strip()),
                tax_paise=int(str(row["tax_paise"]).strip()),
                settled_amount_paise=int(str(row["settled_amount_paise"]).strip()),
                method=row["method"].strip(),
                currency=row["currency"].strip(),
                status=row["status"].strip(),
                captured_at=_parse_iso_utc(row.get("captured_at", "")),
                refund_ids=refunds,
                source_row=dict(row),
            )
            good.append(rec)
        except (KeyError, ValueError, MoneyParseError) as exc:
            bad.append(MalformedRecord("payments", i, str(exc), dict(row)))
    return good, bad


def parse_bank(path: Path) -> tuple[list[CanonicalBankTxn], list[MalformedRecord]]:
    good, bad = [], []
    for i, row in enumerate(_read_csv(path), start=1):
        try:
            dep_raw = (row.get("Deposit Amt", "") or "").strip()
            wd_raw = (row.get("Withdrawal Amt", "") or "").strip()
            bal_raw = (row.get("Closing Balance", "") or "").strip()
            narration = row.get("Narration", "") or ""
            rec = CanonicalBankTxn(
                row_index=i,
                date=_parse_bank_date(row.get("Date", "")),
                narration=narration,
                extracted_utr=extract_utr(narration),
                deposit_paise=rupees_to_paise(dep_raw) if dep_raw else None,
                withdrawal_paise=rupees_to_paise(wd_raw) if wd_raw else None,
                closing_balance_paise=rupees_to_paise(bal_raw) if bal_raw else None,
                source_row=dict(row),
            )
            good.append(rec)
        except (KeyError, ValueError, MoneyParseError) as exc:
            bad.append(MalformedRecord("bank", i, str(exc), dict(row)))
    return good, bad


def parse_orders(path: Path) -> tuple[list[CanonicalOrder], list[MalformedRecord]]:
    good, bad = [], []
    for i, row in enumerate(_read_csv(path), start=1):
        try:
            pay_ref = (row.get("Payment Reference", "") or "").strip() or None
            rec = CanonicalOrder(
                name=row["Name"].strip(),
                order_ref_id=str(row.get("Id", "")).strip(),
                financial_status=row["Financial Status"].strip(),
                currency=row["Currency"].strip(),
                total_paise=rupees_to_paise(row["Total"]),
                refunded_amount_paise=(
                    rupees_to_paise(row["Refunded Amount"])
                    if str(row.get("Refunded Amount", "")).strip() else 0
                ),
                payment_reference=pay_ref,
                created_at=_parse_iso_utc(row.get("Created At", "")),
                source_row=dict(row),
            )
            good.append(rec)
        except (KeyError, ValueError, MoneyParseError) as exc:
            bad.append(MalformedRecord("orders", i, str(exc), dict(row)))
    return good, bad


def ingest_dataset(dataset_dir: str | Path) -> CanonicalDataset:
    """Load and normalize all four source files from a dataset directory."""
    d = Path(dataset_dir)
    settlements, m1 = parse_settlements(d / "razorpay_settlements.csv")
    payments, m2 = parse_payments(d / "razorpay_payments.csv")
    bank, m3 = parse_bank(d / "hdfc_bank_statement.csv")
    orders, m4 = parse_orders(d / "shopify_orders.csv")
    return CanonicalDataset(
        payments=tuple(payments),
        settlements=tuple(settlements),
        bank_txns=tuple(bank),
        orders=tuple(orders),
        malformed=tuple(m1 + m2 + m3 + m4),
    )
