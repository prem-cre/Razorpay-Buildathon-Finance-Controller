"""Audit trail — immutable, machine-readable record of every decision.

The matcher does not print, format, or embed audit logic inline. It emits one
AuditRecord per decision into an AuditTrail. Records are frozen after creation;
the trail is append-only and exposes its contents as an immutable tuple.

An AuditRecord holds enough to reconstruct *why* a decision happened: the input
key, the rule applied, the decision, the confidence, and the evidence used.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Any, Optional


@dataclass(frozen=True)
class AuditRecord:
    record_key: str                 # primary key of the record being decided (payment_id)
    layer: int                      # 1 for this engine
    rule: Optional[str]             # e.g. "R1.1_exact_three_way"; None if no rule fired
    confidence: str                 # HIGH / MEDIUM / LOW / NONE
    match_status: str               # matched / awaiting_settlement / orphan_payment / unresolved
    evidence: dict[str, Any]
    llm_reasoning: Optional[str]    # always None in Layer 1
    timestamp: str                  # ISO-8601 UTC, when the decision was emitted

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class AuditTrail:
    """Append-only collector of AuditRecords."""

    def __init__(self) -> None:
        self._records: list[AuditRecord] = []

    def emit(
        self,
        *,
        record_key: str,
        rule: Optional[str],
        confidence: str,
        match_status: str,
        evidence: dict[str, Any],
        layer: int = 1,
        llm_reasoning: Optional[str] = None,
    ) -> AuditRecord:
        rec = AuditRecord(
            record_key=record_key,
            layer=layer,
            rule=rule,
            confidence=confidence,
            match_status=match_status,
            evidence=dict(evidence),
            llm_reasoning=llm_reasoning,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
        self._records.append(rec)
        return rec

    @property
    def records(self) -> tuple[AuditRecord, ...]:
        """Immutable view of everything emitted so far."""
        return tuple(self._records)

    def to_json(self, indent: int = 2) -> str:
        return json.dumps([r.to_dict() for r in self._records], indent=indent)

    def __len__(self) -> int:
        return len(self._records)
