import { ConfidenceLevel } from './canonical';

/**
 * Layer 3 diagnosis — inferred from the real data (currency, refund fields,
 * batch bank gap, sibling structure), never from ground truth. It explains an
 * exception and recommends a human action; it does NOT resolve or execute.
 */
export interface Layer3Diagnosis {
  category: string;
  title: string;
  risk_level: 'low' | 'medium' | 'high';
  evidence_chain: string[];
  recommended_action: string;
  disposition: 'auto_resolvable' | 'human_review' | 'escalate';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}

export type RuleIdentifier = 
  | 'R1.1_exact_three_way'
  | 'R1.2_two_way_pg_order'
  | 'R1.3_two_way_pg_bank'
  | 'R1.4_sum_aggregation_batch'
  | 'R1.5_fee_adjusted_amount'
  | 'R2.1_utr_variant_fuzzy'
  | 'R2.2_ref_partial_prefix'
  | 'R2.3_split_payment_reconstruction'
  | 'R2.4_refund_netted_solver'
  | 'R3.1_llm_triage_diagnosis';

export type MatchStatus = 
  | 'matched'
  | 'awaiting_settlement'
  | 'orphan_payment'
  | 'unresolved';

export type ExceptionCategory =
  | 'timing_gap'
  | 'fee_discrepancy'
  | 'chargeback_withheld'
  | 'refund_netted'
  | 'partial_refund'
  | 'duplicate_capture'
  | 'split_payment'
  | 'orphan_payment'
  | 'fx_delta'
  | 'amount_unknown'
  | 'noise_ignore';

export interface AuditRecord {
  record_key: string;
  layer: 1 | 2 | 3;
  rule: RuleIdentifier | null;
  confidence: ConfidenceLevel;
  match_status: MatchStatus;
  exception_category: ExceptionCategory | null;
  evidence: {
    shopify_order?: string;
    razorpay_payment: string;
    settlement_id?: string;
    bank_utr?: string;
    bank_row?: number;
    amount_delta_paise: number;
    fee_variance_paise?: number;
  };
  llm_reasoning: string | null;
  timestamp: string;
  /** Manifest ground-truth category — a Layer 2/3 target, NOT something Layer 1 diagnosed. */
  ground_truth_category?: ExceptionCategory | 'matched' | null;
  injected_defect?: string | null;
}

export interface ReconciledRecordView {
  id: string;
  payment_id: string;
  order_name: string;
  merchant_customer: string;
  payment_method: string;
  gross_paise: number;
  fee_paise: number;
  tax_paise: number;
  net_paise: number;
  bank_credit_paise: number;
  variance_paise: number;
  bank_utr: string;
  settlement_id: string;
  clearing_date: string;
  rule_applied: RuleIdentifier | null;
  confidence: ConfidenceLevel;
  confidence_score: number;
  match_status: MatchStatus;
  exception_category: ExceptionCategory | null;
  /** Manifest ground-truth category (null when truly matched). Clearly a Layer 2/3 target. */
  ground_truth_category?: ExceptionCategory | null;
  injected_defect?: string | null;
  reasoning: string;
  audit_record: AuditRecord;
  diagnosis?: Layer3Diagnosis | null;
  resolution_status?: string;
}

export interface ExceptionGroupSummary {
  category: ExceptionCategory;
  title: string;
  count: number;
  total_impact_paise: number;
  auto_resolvable: boolean;
  resolution_type: 'auto' | 'human_review' | 'dispute_lookup' | 'escalate';
  explanation: string;
  recommended_action: string;
  records: ReconciledRecordView[];
}

export interface ReconciliationBatchSummary {
  batch_id: string;
  dataset_name: string;
  total_records: number;
  auto_matched_count: number;
  fuzzy_matched_count: number;
  exceptions_count: number;
  match_rate_percentage: number;
  total_gross_paise: number;
  total_fees_paise: number;
  total_tax_paise: number;
  total_net_expected_paise: number;
  total_bank_settled_paise: number;
  value_at_risk_paise: number;
  true_unknown_count: number;
  true_unknown_paise: number;
  evaluation: {
    dataset: 'clean' | 'messy' | 'adversarial';
    precision_pct: number;
    recall_pct: number;
    f1_score: number;
    false_positive_exposure_paise: number;
  };
}
