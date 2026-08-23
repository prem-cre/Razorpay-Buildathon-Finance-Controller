"""CLI entry point for the Layer 1 reconciliation engine.

    python -m src.engine.run --dataset clean
    python -m src.engine.run --dataset messy
    python -m src.engine.run --dataset all

Pipeline: ingest -> match (R1.1-R1.5) -> audit -> evaluate vs manifest.
Writes results, audit trail, and metrics JSON into outputs/.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# Allow running as a script (python src/engine/run.py) as well as a module.
_ROOT = Path(__file__).resolve().parents[2]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from src.engine.ingest import ingest_dataset
from src.engine.matcher import Layer1Matcher
from src.engine.metrics import evaluate_against_manifest, print_report

DATASETS = ("clean", "messy", "adversarial")


def run_one(dataset: str, root: Path) -> dict:
    data_dir = root / "data" / dataset
    out_dir = root / "outputs"
    out_dir.mkdir(exist_ok=True)

    data = ingest_dataset(data_dir)
    if data.malformed:
        print(f"[{dataset}] WARNING: {len(data.malformed)} malformed source rows surfaced:")
        for mr in data.malformed[:10]:
            print(f"   - {mr.source} row {mr.row_index}: {mr.reason}")

    matcher = Layer1Matcher(data)
    results = matcher.match()

    report = evaluate_against_manifest(results, data_dir / "manifest.json")
    print_report(dataset, report)

    (out_dir / f"{dataset}_results.json").write_text(
        json.dumps([r.to_dict() for r in results], indent=2), encoding="utf-8")
    (out_dir / f"{dataset}_audit.json").write_text(
        matcher.audit.to_json(), encoding="utf-8")
    (out_dir / f"{dataset}_metrics.json").write_text(
        json.dumps(report, indent=2), encoding="utf-8")

    return report


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description="Layer 1 reconciliation engine")
    ap.add_argument("--dataset", default="clean",
                    choices=(*DATASETS, "all"), help="dataset to reconcile")
    ap.add_argument("--strict-clean", action="store_true",
                    help="exit non-zero if the clean baseline is not 100%% matched / 0 exceptions")
    args = ap.parse_args(argv)

    root = _ROOT
    targets = DATASETS if args.dataset == "all" else (args.dataset,)
    reports = {ds: run_one(ds, root) for ds in targets}

    if args.strict_clean and "clean" in reports:
        h = reports["clean"]["headline"]
        m = reports["clean"]["matched_class_vs_manifest"]
        ok = (h["match_rate"] == 1.0 and h["unresolved_deferred"] == 0
              and m["false_positive"] == 0 and m["false_negative"] == 0)
        if not ok:
            print("\nCLEAN BASELINE FAILED — not 100% HIGH-confidence / 0 exceptions.")
            return 1
        print("\nCLEAN BASELINE PASSED — 100% matched, 0 exceptions, 0 false positives.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
