"""Focused tests for the Layer 1 engine — correctness of the primitives and
determinism of the whole pipeline. Run:  python -m src.tests.test_layer1
"""
from __future__ import annotations

import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[2]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from src.engine.money import rupees_to_paise, paise_to_rupees_str, MoneyParseError
from src.engine.ingest import extract_utr, ingest_dataset
from src.engine.matcher import Layer1Matcher
from src.engine.metrics import evaluate_against_manifest

_failures: list[str] = []


def check(name: str, cond: bool) -> None:
    print(f"  {'PASS' if cond else 'FAIL'}  {name}")
    if not cond:
        _failures.append(name)


def test_money() -> None:
    print("money:")
    check("22227.60 -> 2222760 paise", rupees_to_paise("22227.60") == 2222760)
    check("no float drift on .10", rupees_to_paise("0.10") == 10)
    check("comma stripped", rupees_to_paise("1,234.50") == 123450)
    check("round-trip", paise_to_rupees_str(2222760) == "22227.60")
    try:
        rupees_to_paise("")
        check("empty raises", False)
    except MoneyParseError:
        check("empty raises", True)


def test_utr() -> None:
    print("utr extraction:")
    check("NEFT prefix", extract_utr("NEFT-HDFC351396359337-RAZORPAY") == "HDFC351396359337")
    check("IMPS prefix", extract_utr("IMPS-HDFC937191275575-RAZORPAY") == "HDFC937191275575")
    check("noise -> None", extract_utr("NEFT-AWS-CLOUD-SERVICES") is None)
    check("empty -> None", extract_utr("") is None)


def test_clean_baseline() -> None:
    print("clean baseline (100% / 0 exceptions / 0 FP):")
    data = ingest_dataset(_ROOT / "data" / "clean")
    results = Layer1Matcher(data).match()
    rep = evaluate_against_manifest(results, _ROOT / "data" / "clean" / "manifest.json")
    check("match rate == 1.0", rep["headline"]["match_rate"] == 1.0)
    check("0 unresolved", rep["headline"]["unresolved_deferred"] == 0)
    check("0 false positives", rep["matched_class_vs_manifest"]["false_positive"] == 0)
    check("all via R1.1", rep["rule_counts"].get("R1.1_exact_three_way") == 55)


def test_no_false_positives_anywhere() -> None:
    print("zero false positives on every dataset (precision guard):")
    for ds in ("clean", "messy", "adversarial"):
        data = ingest_dataset(_ROOT / "data" / ds)
        results = Layer1Matcher(data).match()
        rep = evaluate_against_manifest(results, _ROOT / "data" / ds / "manifest.json")
        check(f"{ds}: FP == 0", rep["matched_class_vs_manifest"]["false_positive"] == 0)


def test_determinism() -> None:
    print("determinism (two runs identical):")
    data = ingest_dataset(_ROOT / "data" / "messy")
    r1 = [r.to_dict() for r in Layer1Matcher(data).match()]
    r2 = [r.to_dict() for r in Layer1Matcher(data).match()]
    check("identical decisions across runs", r1 == r2)


def main() -> int:
    for t in (test_money, test_utr, test_clean_baseline,
              test_no_false_positives_anywhere, test_determinism):
        t()
    print(f"\n{'ALL PASSED' if not _failures else f'{len(_failures)} FAILURES: {_failures}'}")
    return 1 if _failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
