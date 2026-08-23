import { ReconciledRecordView, ReconciliationBatchSummary, ExceptionGroupSummary } from '@/types/reconciliation';

export const mockCleanBatchSummary: ReconciliationBatchSummary = {
  batch_id: 'batch_2026_08_clean',
  dataset_name: 'Clean Production Baseline (50 Records)',
  total_records: 50,
  auto_matched_count: 50,
  fuzzy_matched_count: 0,
  exceptions_count: 0,
  match_rate_percentage: 100.0,
  total_gross_paise: 9540000,
  total_fees_paise: 190800,
  total_tax_paise: 34344,
  total_net_expected_paise: 9314856,
  total_bank_settled_paise: 9314856,
  value_at_risk_paise: 0,
  true_unknown_count: 0,
  true_unknown_paise: 0,
  evaluation: {
    dataset: 'clean',
    precision_pct: 100.0,
    recall_pct: 100.0,
    f1_score: 100.0,
    false_positive_exposure_paise: 0,
  },
};

export const mockAdversarialBatchSummary: ReconciliationBatchSummary = {
  batch_id: 'batch_2026_08_adversarial',
  dataset_name: 'Adversarial Multi-Source Stress Batch (500 Records)',
  total_records: 500,
  auto_matched_count: 471,
  fuzzy_matched_count: 21,
  exceptions_count: 8,
  match_rate_percentage: 94.2,
  total_gross_paise: 4829050000,
  total_fees_paise: 96581000,
  total_tax_paise: 17384580,
  total_net_expected_paise: 4715084420,
  total_bank_settled_paise: 4696684420,
  value_at_risk_paise: 18400000,
  true_unknown_count: 1,
  true_unknown_paise: 1700000,
  evaluation: {
    dataset: 'adversarial',
    precision_pct: 98.1,
    recall_pct: 96.7,
    f1_score: 97.4,
    false_positive_exposure_paise: 1240000,
  },
};

const merchants = [
  'Zomato Online', 'Swiggy Delivery Hub', 'Zepto Retail Hub', 'Blinkit Quick Mart',
  'Urban Company Services', 'Nykaa E-Commerce', 'Lenskart Optical', 'Boat Lifestyle Audio',
  'Mamaearth Wellness', 'Pepperfry Home Living', 'Khatabook Business', 'Razorpay Payroll Ops',
  'Cred Financial Services', 'Groww Direct Mutual Funds', 'PhysicsWallah Tech', 'Delhivery Logistics Hub'
];

export function getMockReconciliationRecords(): ReconciledRecordView[] {
  const records: ReconciledRecordView[] = [];
  const methods = ['upi', 'card', 'netbanking', 'corporate_card', 'upi'];
  
  for (let i = 1; i <= 60; i++) {
    const id = 'pay_000' + (i < 10 ? '0' + i : i) + 'XkL9v' + (i * 7);
    const orderName = '#' + (1000 + i);
    const merchant = merchants[i % merchants.length];
    const method = methods[i % methods.length];
    
    const gross_paise = (((i * 97) % 3500) + 150) * 10000;
    const fee_paise = Math.round(gross_paise * (method === 'upi' ? 0 : 0.02));
    const tax_paise = Math.round(fee_paise * 0.18);
    const net_paise = gross_paise - fee_paise - tax_paise;
    
    let status: 'matched' | 'awaiting_settlement' | 'orphan_payment' | 'unresolved' = 'matched';
    let exception_cat: any = null;
    let bank_credit = net_paise;
    let variance = 0;
    let confidence: any = 'HIGH';
    let confidence_score = 99.4;
    let rule_applied: any = 'R1.1_exact_three_way';
    let reason = 'Exact 3-Way match across Shopify Order, Razorpay Settlement and Bank Statement UTR.';
    let utr = 'HDFC3513' + (900000 + i);
    
    if (i === 7 || i === 21 || i === 35) {
      status = 'unresolved';
      exception_cat = 'fee_discrepancy';
      variance = 240;
      bank_credit = net_paise + variance;
      confidence = 'MEDIUM';
      confidence_score = 88.5;
      rule_applied = 'R1.5_fee_adjusted_amount';
      reason = 'MDR fee calculation drift of +₹2.40 detected on international corporate card. Auto-tolerated under rule threshold.';
    } else if (i === 12 || i === 26 || i === 44) {
      status = 'awaiting_settlement';
      exception_cat = 'timing_gap';
      bank_credit = 0;
      variance = -net_paise;
      confidence = 'HIGH';
      confidence_score = 94.0;
      rule_applied = 'R1.2_two_way_pg_order';
      reason = 'Payment captured Aug 23, T+2 settlement window not elapsed. Credit scheduled for tomorrow bank batch.';
    } else if (i === 18 || i === 38) {
      status = 'unresolved';
      exception_cat = 'chargeback_withheld';
      const holdAmount = 1000000;
      bank_credit = net_paise - holdAmount;
      variance = -holdAmount;
      confidence = 'MEDIUM';
      confidence_score = 86.2;
      rule_applied = 'R3.1_llm_triage_diagnosis';
      reason = 'Settlement withheld by Razorpay Risk Engine for active dispute DISP_2026_8819. Evidence submitted.';
    } else if (i === 52) {
      status = 'unresolved';
      exception_cat = 'amount_unknown';
      bank_credit = net_paise - 1700000;
      variance = -1700000;
      confidence = 'LOW';
      confidence_score = 42.1;
      rule_applied = null;
      reason = 'True residual variance of ₹17,000 unexplained by fee, tax, or timing rules. Escalated to Senior Finance Ops.';
      utr = 'UNVERIFIED_BANK_REF';
    }

    records.push({
      id,
      payment_id: id,
      order_name: orderName,
      merchant_customer: merchant,
      payment_method: method,
      gross_paise,
      fee_paise,
      tax_paise,
      net_paise,
      bank_credit_paise: bank_credit,
      variance_paise: variance,
      bank_utr: utr,
      settlement_id: 'setl_000' + (i < 10 ? '0' + i : i) + 'YPZTQGOAw',
      clearing_date: '2026-08-' + (20 + (i % 4)),
      rule_applied,
      confidence,
      confidence_score,
      match_status: status,
      exception_category: exception_cat,
      reasoning: reason,
      audit_record: {
        record_key: id,
        layer: confidence === 'HIGH' ? 1 : confidence === 'MEDIUM' ? 2 : 3,
        rule: rule_applied,
        confidence,
        match_status: status,
        exception_category: exception_cat,
        evidence: {
          shopify_order: orderName,
          razorpay_payment: id,
          settlement_id: 'setl_000' + (i < 10 ? '0' + i : i) + 'YPZTQGOAw',
          bank_utr: utr,
          bank_row: i,
          amount_delta_paise: variance,
        },
        llm_reasoning: exception_cat === 'amount_unknown' ? reason : null,
        timestamp: '2026-08-24T10:15:22+05:30',
      }
    });
  }
  return records;
}

export function getMockExceptionGroups(records: ReconciledRecordView[]): ExceptionGroupSummary[] {
  const groups: Record<string, ReconciledRecordView[]> = {};
  
  records.forEach(r => {
    if (r.exception_category) {
      if (!groups[r.exception_category]) groups[r.exception_category] = [];
      groups[r.exception_category].push(r);
    }
  });

  return [
    {
      category: 'timing_gap',
      title: 'Timing Window Drift (T+2 Settlement Lag)',
      count: groups['timing_gap']?.length || 3,
      total_impact_paise: groups['timing_gap']?.reduce((acc, curr) => acc + curr.gross_paise, 0) || 48200000,
      auto_resolvable: true,
      resolution_type: 'auto',
      explanation: 'Payments captured in the last 24-48 hours. Bank statement window has not yet rolled into credit cycle.',
      recommended_action: 'Hold for next automated batch run. Zero finance adjustment needed.',
      records: groups['timing_gap'] || [],
    },
    {
      category: 'fee_discrepancy',
      title: 'MDR Fee & Rounding Variance',
      count: groups['fee_discrepancy']?.length || 3,
      total_impact_paise: groups['fee_discrepancy']?.reduce((acc, curr) => acc + Math.abs(curr.variance_paise), 0) || 720,
      auto_resolvable: true,
      resolution_type: 'auto',
      explanation: 'Statutory GST & MDR rounding delta on international corporate cards. Variance within configured ±₹5 tolerance.',
      recommended_action: 'Auto-post adjusting journal entries to ERP Fee Variance ledger.',
      records: groups['fee_discrepancy'] || [],
    },
    {
      category: 'chargeback_withheld',
      title: 'Dispute Chargeback Reserve Withheld',
      count: groups['chargeback_withheld']?.length || 2,
      total_impact_paise: groups['chargeback_withheld']?.reduce((acc, curr) => acc + Math.abs(curr.variance_paise), 0) || 2000000,
      auto_resolvable: false,
      resolution_type: 'dispute_lookup',
      explanation: 'Razorpay Risk Engine withheld settlement pending dispute arbitration with acquiring bank.',
      recommended_action: 'Cross-reference with Merchant Dispute Desk log. Hold in Suspense.',
      records: groups['chargeback_withheld'] || [],
    },
    {
      category: 'amount_unknown',
      title: 'Unresolved Residual (True Unknown)',
      count: groups['amount_unknown']?.length || 1,
      total_impact_paise: groups['amount_unknown']?.reduce((acc, curr) => acc + Math.abs(curr.variance_paise), 0) || 1700000,
      auto_resolvable: false,
      resolution_type: 'escalate',
      explanation: 'No deterministic or fuzzy rule explains the delta. The engine honestly defers to human expertise.',
      recommended_action: 'Escalate ticket to Senior Finance Ops & Bank Relationship Manager.',
      records: groups['amount_unknown'] || [],
    }
  ];
}
