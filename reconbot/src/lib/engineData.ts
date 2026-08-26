/**
 * Real engine data — imported from JSON produced by the Python data bridge
 * (src/engine/export_frontend.py). Every number here traces to the actual
 * Layer 1 engine run over the synthetic datasets. No fabricated metrics.
 *
 * Regenerate with:  python -m src.engine.export_frontend
 */
import cleanData from '@/data/clean.json';
import messyData from '@/data/messy.json';
import adversarialData from '@/data/adversarial.json';
import {
  ReconciledRecordView,
  ReconciliationBatchSummary,
  ExceptionGroupSummary,
} from '@/types/reconciliation';

export type DatasetName = 'clean' | 'messy' | 'adversarial';

export interface EvaluationReport {
  rule_counts: Record<string, number>;
  confidence_distribution: Record<string, number>;
  status_distribution: Record<string, number>;
  manifest_status_distribution: Record<string, number>;
  matched_class: {
    true_positive: number;
    false_positive: number;
    false_negative: number;
    precision: number;
    recall: number;
  };
  false_positive_records: Array<Record<string, unknown>>;
  totals: {
    records_processed: number;
    manifest_entries: number;
    covered: number;
    only_in_engine: string[];
    only_in_manifest: string[];
  };
}

export interface DatasetPayload {
  summary: ReconciliationBatchSummary;
  records: ReconciledRecordView[];
  exception_groups: ExceptionGroupSummary[];
  evaluation_report: EvaluationReport;
}

const DATASETS: Record<DatasetName, DatasetPayload> = {
  clean: cleanData as unknown as DatasetPayload,
  messy: messyData as unknown as DatasetPayload,
  adversarial: adversarialData as unknown as DatasetPayload,
};

export const DATASET_ORDER: DatasetName[] = ['clean', 'messy', 'adversarial'];

export const DATASET_META: Record<DatasetName, { label: string; sub: string }> = {
  clean: { label: 'Clean Production Baseline', sub: 'Deterministic sanity set' },
  messy: { label: 'Messy Realistic Batch', sub: 'Everyday reconciliation noise' },
  adversarial: { label: 'Adversarial Stress Batch', sub: 'Held-out — never tuned against' },
};

export function getDataset(name: DatasetName): DatasetPayload {
  return DATASETS[name];
}
