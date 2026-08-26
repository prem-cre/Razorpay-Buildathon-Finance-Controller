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
from src.engine.layer2 import Layer2Matcher
from src.engine.metrics import evaluate_against_manifest, print_report, evaluate_layered

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
    l1_results = matcher.match()

    # Layer 2 — fuzzy / recovery over what Layer 1 could not resolve.
    l2 = Layer2Matcher(data, l1_results)
    final = l2.refine()

    report = evaluate_against_manifest(final, data_dir / "manifest.json")
    print_report(dataset, report)

    layered = evaluate_layered(final, data_dir / "manifest.json")
    print(f"\nLayered engine (L1 + L2), disposition-based:")
    print(f"  resolution rate     : {layered['resolution_rate']*100:.1f}%  "
          f"({layered['resolved_total']}/{layered['total']}  "
          f"L1={layered['layer1_matched']}  L2={layered['layer2_recovered']})")
    print(f"  safety precision    : {layered['safety_precision']*100:.1f}%  "
          f"(dangerous auto-resolutions: {layered['dangerous_false_positives']})")
    print(f"  resolvable recall   : {layered['resolvable_recall']*100:.1f}%")
    print(f"  exceptions flagged  : {layered['exceptions_flagged_correct']} correctly held for review")
    for d in layered["dangerous_records"]:
        print(f"     !! DANGEROUS: {d['record_key']} {d['rule']} -> {d['manifest']}")

    # Combined audit trail (L1 decisions + L2 recoveries).
    combined_audit = [a.to_dict() for a in matcher.audit.records] + [a.to_dict() for a in l2.audit.records]

    (out_dir / f"{dataset}_results.json").write_text(
        json.dumps([r.to_dict() for r in final], indent=2), encoding="utf-8")
    (out_dir / f"{dataset}_audit.json").write_text(
        json.dumps(combined_audit, indent=2), encoding="utf-8")
    (out_dir / f"{dataset}_metrics.json").write_text(
        json.dumps({"strict_layer1_view": report, "layered": layered}, indent=2), encoding="utf-8")

    return {**report, "layered": layered}


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
