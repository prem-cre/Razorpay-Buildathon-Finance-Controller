"""Money handling — integer paise only.

Every monetary value in the engine is an int number of paise. Floating-point
rupee values are converted at the ingestion boundary using Decimal (never
binary float) so that no rounding drift can enter financial comparisons.

Rule: rupee strings from CSVs are parsed with Decimal, multiplied by 100, and
rounded HALF_UP to the nearest paise. Any value that cannot be parsed raises
MoneyParseError, which the ingestion layer surfaces explicitly rather than
silently coercing to zero.
"""
from __future__ import annotations

from decimal import Decimal, InvalidOperation, ROUND_HALF_UP


class MoneyParseError(ValueError):
    """Raised when a monetary string cannot be interpreted as a rupee amount."""


_PAISE = Decimal("1")
_HUNDRED = Decimal("100")


def rupees_to_paise(value: str | float | int | Decimal) -> int:
    """Convert a rupee amount to integer paise using Decimal arithmetic.

    Accepts strings like "22227.60", "1,234.50", numbers, or Decimals.
    Empty / whitespace-only input is invalid here — callers that allow blank
    (e.g. an empty Deposit column) must guard before calling.
    """
    if value is None:
        raise MoneyParseError("cannot parse None as a rupee amount")
    text = str(value).strip().replace(",", "")
    if text == "":
        raise MoneyParseError("empty string is not a valid rupee amount")
    try:
        rupees = Decimal(text)
    except (InvalidOperation, ValueError) as exc:
        raise MoneyParseError(f"not a valid rupee amount: {value!r}") from exc
    paise = (rupees * _HUNDRED).quantize(_PAISE, rounding=ROUND_HALF_UP)
    return int(paise)


def paise_to_rupees_str(paise: int) -> str:
    """Format integer paise as a 2-decimal rupee string for display only."""
    return f"{Decimal(paise) / _HUNDRED:.2f}"
