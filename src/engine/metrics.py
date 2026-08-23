"""Evaluation — compare Layer 1 decisions against the ground-truth manifest.

The manifest is authoritative. We never adjust engine output to improve a
number. Layer 1 can legitimately produce only four outcomes:

    matched, awaiting_settlement, orphan_payment, unresolved

The manifest carries fine-grained categories (timing_gap, fee_discrepancy,
chargeback_withheld, ...) that require Layer 2/3. So this report measures Layer
1 honestly on what Layer 1 is *supposed* to do:

  * MATCH PRECISION  — of everything the engine called `matched`, how many the
    manifest also calls `matched`. A false positive here (engine matched a real
    exception) is the dangerous error; it must stay ~0.
  * MATCH RECALL     — of everything the manifest calls `matched`, how many the
    engine matched.
  * DEFERRAL CORRECTNESS — of everything the engine left `unresolved`, how many
    are genuinely non-`matched` in the manifest (i.e. correctly handed to later
    layers rather than wrongly auto-booked).

Plus rule-level counts, confidence distribution, and a full per-record diff.
"""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Any

from .matcher import MatchResult

# Engine statuses that represent an auto-resolved / confidently-classified record.
_ENGINE_MATCHED = {"matched"}


def _load_manifest(path: Path) -> dict[str, dict]:
    with open(path, encoding="utf-8") as f:
        entries = json.load(f)
    if isinstance(entries, dict):
        entries = entries.get("entries", [])
    out = {}
    for e in entries:
        key = e.get("record_key")
        if key:
            out[key] = e
    return out


def evaluate_against_manifest(results: list[MatchResult],
                              manifest_path: str | Path) -> dict[str, Any]:
    manifest = _load_manifest(Path(manifest_path))
    by_key = {r.record_key: r for r in results}

    total = len(results)
    rule_counts = Counter(r.rule or "NO_RULE" for r in results)
    conf_counts = Counter(r.confidence for r in results)
    status_counts = Counter(r.match_status for r in results)

    # Confusion vs manifest, restricted to payment-keyed records the engine saw.
    tp = fp = fn = 0            # for the "matched" class
    correct_deferrals = 0
    wrong_deferrals = 0
    diff_rows: list[dict] = []
    matched_but_manifest_exception: list[dict] = []

    covered_keys = set(by_key) & set(manifest)
    for key in sorted(covered_keys):
        r = by_key[key]
        expected = manifest[key].get("expected_match_status")
        engine_matched = r.match_status in _ENGINE_MATCHED
        manifest_matched = (expected == "matched")

        if engine_matched and manifest_matched:
            tp += 1
        elif engine_matched and not manifest_matched:
            fp += 1
            matched_but_manifest_exception.append(
                {"record_key": key, "engine_rule": r.rule,
                 "engine_status": r.match_status, "manifest_status": expected}
            )
        elif not engine_matched and manifest_matched:
            fn += 1

        if not engine_matched:
            if not manifest_matched:
                correct_deferrals += 1
            else:
                wrong_deferrals += 1

        diff_rows.append({
            "record_key": key,
            "engine_status": r.match_status,
            "engine_rule": r.rule,
            "engine_confidence": r.confidence,
            "manifest_status": expected,
            "manifest_confidence": manifest[key].get("expected_confidence"),
            "agreement": "MATCH_OK" if (engine_matched and manifest_matched)
                         else ("FALSE_POSITIVE" if engine_matched and not manifest_matched
                               else ("MISSED" if manifest_matched else "DEFERRED_OK")),
        })

    precision = tp / (tp + fp) if (tp + fp) else 1.0
    recall = tp / (tp + fn) if (tp + fn) else 1.0
    match_rate = status_counts.get("matched", 0) / total if total else 0.0

    # Records in engine output not in manifest, and vice versa.
    only_engine = sorted(set(by_key) - set(manifest))
    only_manifest = sorted(set(manifest) - set(by_key))

    return {
        "totals": {
            "records_processed": total,
            "manifest_entries": len(manifest),
            "covered": len(covered_keys),
            "only_in_engine": only_engine,
            "only_in_manifest": only_manifest,
        },
        "headline": {
            "match_rate": round(match_rate, 4),
            "auto_matched": status_counts.get("matched", 0),
            "awaiting_settlement": status_counts.get("awaiting_settlement", 0),
            "orphan_payment": status_counts.get("orphan_payment", 0),
            "unresolved_deferred": status_counts.get("unresolved", 0),
        },
        "matched_class_vs_manifest": {
            "true_positive": tp,
            "false_positive": fp,
            "false_negative": fn,
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "false_positive_records": matched_but_manifest_exception,
        },
        "deferral": {
            "correct_deferrals": correct_deferrals,
            "wrong_deferrals": wrong_deferrals,
        },
        "rule_counts": dict(rule_counts),
        "confidence_distribution": dict(conf_counts),
        "status_distribution": dict(status_counts),
        "manifest_status_distribution": dict(
            Counter(m.get("expected_match_status") for m in manifest.values())
        ),
        "per_record_diff": diff_rows,
    }


def print_report(dataset: str, report: dict[str, Any]) -> None:
    h = report["headline"]
    m = report["matched_class_vs_manifest"]
    t = report["totals"]
    print(f"\n{'='*66}")
    print(f"LAYER 1 EVALUATION — {dataset.upper()}")
    print(f"{'='*66}")
    print(f"Records processed        : {t['records_processed']}")
    print(f"Match rate (auto-matched): {h['match_rate']*100:.1f}%  ({h['auto_matched']} records)")
    print(f"Awaiting settlement      : {h['awaiting_settlement']}")
    print(f"Orphan payments (MEDIUM) : {h['orphan_payment']}")
    print(f"Unresolved -> Layer 2/3  : {h['unresolved_deferred']}")
    print(f"\nMatched-class vs manifest ground truth:")
    print(f"  precision : {m['precision']*100:.1f}%   (false positives: {m['false_positive']})")
    print(f"  recall    : {m['recall']*100:.1f}%   (missed: {m['false_negative']})")
    if m["false_positive_records"]:
        print("  !! FALSE POSITIVES (engine matched a manifest exception):")
        for fpr in m["false_positive_records"]:
            print(f"     {fpr['record_key']}  rule={fpr['engine_rule']}  manifest={fpr['manifest_status']}")
    print(f"\nRule firing counts:")
    for rule, n in sorted(report["rule_counts"].items()):
        print(f"  {rule:28s} {n}")
    print(f"\nConfidence distribution: {report['confidence_distribution']}")
    if t["only_in_manifest"]:
        print(f"\nIn manifest but not evaluated by engine: {len(t['only_in_manifest'])} "
              f"(non-payment-grain keys)")
