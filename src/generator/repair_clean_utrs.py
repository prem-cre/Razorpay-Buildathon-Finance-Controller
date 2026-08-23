"""Reproducible repair for a generation defect in the CLEAN dataset.

DEFECT
------
In data/clean, the bank-statement narration UTRs were generated independently
of the settlement UTRs, so settlement.utr never appears in any bank narration
(0/5 overlap). The settlement<->bank link only survives by amount. This is
inconsistent with data/messy (5/5 UTR overlap) and data/adversarial (3/4, the
4th being an intentional typo), both of which correctly use the UTR as the
bank-matching key exactly as docs/schema.md specifies.

Left unrepaired, the CLEAN dataset cannot satisfy the Layer-1 baseline
(100% HIGH-confidence via R1.1, which requires an exact UTR match) — not
because the engine is wrong, but because the data contradicts its own schema.

REPAIR (surgical, auditable, idempotent)
----------------------------------------
Each clean settlement amount is unique and equals exactly one bank credit's
deposit. Using that unambiguous amount link, rewrite each bank credit row's
narration UTR (and Chq/Ref No) to the corresponding settlement.utr. No amounts,
dates, balances, or non-credit rows are touched. Running twice is a no-op.

Run:  python -m src.generator.repair_clean_utrs
"""
from __future__ import annotations

import csv
import re
import sys
from decimal import Decimal
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[2]
CLEAN = _ROOT / "data" / "clean"
_UTR_RE = re.compile(r"[A-Z]{2,6}\d{9,}")


def _read(path: Path) -> tuple[list[str], list[dict]]:
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        return list(reader.fieldnames), list(reader)


def _write(path: Path, fields: list[str], rows: list[dict]) -> None:
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)


def _deposit_paise(row: dict) -> int | None:
    raw = (row.get("Deposit Amt", "") or "").strip()
    if not raw:
        return None
    return int((Decimal(raw) * 100).to_integral_value())


def repair() -> int:
    _, settlements = _read(CLEAN / "razorpay_settlements.csv")
    bank_fields, bank_rows = _read(CLEAN / "hdfc_bank_statement.csv")

    # amount(paise) -> settlement.utr, asserting amount uniqueness.
    amt_to_utr: dict[int, str] = {}
    for s in settlements:
        amt = int(str(s["amount_paise"]).strip())
        utr = s["utr"].strip().upper()
        if amt in amt_to_utr and amt_to_utr[amt] != utr:
            print(f"ABORT: settlement amount {amt} is not unique — cannot link safely.")
            return 2
        amt_to_utr[amt] = utr

    changed = 0
    for row in bank_rows:
        dep = _deposit_paise(row)
        if dep is None:
            continue                         # skip debits / non-credit rows
        utr = amt_to_utr.get(dep)
        if not utr:
            continue                         # credit not tied to a settlement (noise)
        old_narr = row.get("Narration", "")
        new_narr = _UTR_RE.sub(utr, old_narr, count=1)
        if _UTR_RE.search(old_narr) is None:
            # No UTR token to replace; wrap the raw narration with the UTR.
            new_narr = f"NEFT-{utr}-RAZORPAY"
        digits = re.sub(r"^[A-Z]+", "", utr)  # Chq/Ref carries the numeric part
        if row.get("Narration") != new_narr or row.get("Chq/Ref No", "") != digits:
            row["Narration"] = new_narr
            row["Chq/Ref No"] = digits
            changed += 1

    _write(CLEAN / "hdfc_bank_statement.csv", bank_fields, bank_rows)
    print(f"Repaired {changed} bank credit rows in data/clean (UTR aligned to settlement).")
    return 0


if __name__ == "__main__":
    sys.exit(repair())
