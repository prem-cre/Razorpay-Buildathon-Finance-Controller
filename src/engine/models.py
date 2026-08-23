"""Canonical in-memory data model.

The three source CSVs are normalized into these frozen dataclasses so that all
downstream logic operates on one consistent representation rather than
source-specific column names. Every canonical record retains a ``source_row``
dict holding the original CSV values, so any decision can be traced back to the
exact bytes that produced it.

Monetary fields are integer paise. Timestamps are timezone-aware UTC datetimes.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass(frozen=True)
class CanonicalPayment:
    payment_id: str
    order_id: str
    settlement_id: Optional[str]        # None if not yet settled
    amount_paise: int                   # customer-facing gross
    fee_paise: int
    tax_paise: int
    settled_amount_paise: int           # amount - fee - tax (as stated by source)
    method: str
    currency: str
    status: str                         # captured / refunded / failed / authorized
    captured_at: Optional[datetime]     # UTC
    refund_ids: tuple[str, ...]
    source_row: dict = field(repr=False, default_factory=dict)


@dataclass(frozen=True)
class CanonicalSettlement:
    settlement_id: str
    utr: str                            # normalized: upper-case, stripped
    amount_paise: int                   # total credited to bank for this batch
    fees_paise: int
    tax_paise: int
    status: str
    created_at: Optional[datetime]      # UTC
    settled_at: Optional[datetime]      # UTC
    source_row: dict = field(repr=False, default_factory=dict)


@dataclass(frozen=True)
class CanonicalBankTxn:
    row_index: int                      # 1-based position in the statement file
    date: Optional[datetime]            # UTC (date at IST midnight -> UTC)
    narration: str
    extracted_utr: Optional[str]        # UTR parsed from narration, or None (noise)
    deposit_paise: Optional[int]        # credit; None if this is a debit row
    withdrawal_paise: Optional[int]     # debit; None if this is a credit row
    closing_balance_paise: Optional[int]
    source_row: dict = field(repr=False, default_factory=dict)

    @property
    def is_credit(self) -> bool:
        return self.deposit_paise is not None and self.deposit_paise > 0


@dataclass(frozen=True)
class CanonicalOrder:
    name: str                           # e.g. "#1042"
    order_ref_id: str                   # Shopify internal Id
    financial_status: str
    currency: str
    total_paise: int
    refunded_amount_paise: int
    payment_reference: Optional[str]    # Razorpay payment_id, or None if blank
    created_at: Optional[datetime]      # UTC
    source_row: dict = field(repr=False, default_factory=dict)


@dataclass(frozen=True)
class MalformedRecord:
    """A source row that could not be normalized. Surfaced, never silently dropped."""
    source: str                         # "payments" / "settlements" / "bank" / "orders"
    row_index: int
    reason: str
    raw: dict


@dataclass(frozen=True)
class CanonicalDataset:
    """Everything the matcher needs, already normalized."""
    payments: tuple[CanonicalPayment, ...]
    settlements: tuple[CanonicalSettlement, ...]
    bank_txns: tuple[CanonicalBankTxn, ...]
    orders: tuple[CanonicalOrder, ...]
    malformed: tuple[MalformedRecord, ...]
