import { RuleIdentifier, ExceptionCategory } from '@/types/reconciliation';

export const RULE_NAMES: Record<RuleIdentifier, { name: string; layer: number; desc: string }> = {
  'R1.1_exact_three_way': { name: 'Exact 3-Way Match', layer: 1, desc: 'Payment ID, UTR and net amount matched within ±₹1 tolerance.' },
  'R1.2_two_way_pg_order': { name: 'PG & Order Link (Pending Bank)', layer: 1, desc: 'Payment captured, awaiting settlement credit.' },
  'R1.3_two_way_pg_bank': { name: 'PG & Bank Link (Orphan Order)', layer: 1, desc: 'Settlement confirmed in bank without matching e-com order.' },
  'R1.4_sum_aggregation_batch': { name: 'Batch Sum Aggregation', layer: 1, desc: 'Multiple transactions sum precisely to single UTR deposit.' },
  'R1.5_fee_adjusted_amount': { name: 'Fee-Adjusted Calculation', layer: 1, desc: 'Net settlement matched calculated MDR & GST statutory deduction.' },
  'R2.1_utr_variant_fuzzy': { name: 'UTR Variant Fuzzy Match', layer: 2, desc: 'Normalized prefix stripping and Levenshtein OCR distance <= 2.' },
  'R2.2_ref_partial_prefix': { name: 'Partial Reference Match', layer: 2, desc: 'Matched on payment reference prefix (length >= 10).' },
  'R2.3_split_payment_reconstruction': { name: 'Split-Payment Reconstruction', layer: 2, desc: 'Aggregated multi-attempt payments matching order total.' },
  'R2.4_refund_netted_solver': { name: 'Refund Netting Reconstruction', layer: 2, desc: 'Back-solved gross settlement minus refund adjustments.' },
  'R3.1_llm_triage_diagnosis': { name: 'LLM Forensic Diagnosis', layer: 3, desc: 'Natural language root-cause attribution with evidence citations.' },
};

export const EXCEPTION_METADATA: Record<ExceptionCategory, { title: string; severity: 'high' | 'medium' | 'low'; actionText: string }> = {
  timing_gap: { title: 'Timing Window Drift (T+2)', severity: 'low', actionText: 'Auto-resolves on next batch cycle' },
  fee_discrepancy: { title: 'Fee Schedule Variance', severity: 'medium', actionText: 'Update fee configuration table' },
  chargeback_withheld: { title: 'Chargeback Hold Withheld', severity: 'medium', actionText: 'Verify against dispute log' },
  refund_netted: { title: 'Refund Netted in Settlement', severity: 'low', actionText: 'Sync refund status to Shopify' },
  partial_refund: { title: 'Partial Refund Split Required', severity: 'medium', actionText: 'Split reconciliation record' },
  duplicate_capture: { title: 'Potential Duplicate Charge', severity: 'high', actionText: 'Human review & confirmation required' },
  split_payment: { title: 'Multi-Payment Aggregation', severity: 'low', actionText: 'Auto-grouped by Order ID' },
  orphan_payment: { title: 'Orphan Transaction (No Order)', severity: 'high', actionText: 'Post suspense journal entry' },
  fx_delta: { title: 'Cross-Border FX Rate Delta', severity: 'medium', actionText: 'Apply daily FX rate table' },
  amount_unknown: { title: 'Unresolved Residual Variance', severity: 'high', actionText: 'Escalate to Senior Finance Ops' },
  noise_ignore: { title: 'Non-Razorpay Statement Noise', severity: 'low', actionText: 'Filtered by UTR namespace' },
};
