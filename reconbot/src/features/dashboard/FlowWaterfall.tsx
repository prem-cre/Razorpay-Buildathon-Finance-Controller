import React from 'react';
import { formatCompactPaise } from '@/lib/money';
import { ReconciliationBatchSummary } from '@/types/reconciliation';

interface FlowWaterfallProps {
  summary: ReconciliationBatchSummary;
}

export function FlowWaterfall({ summary }: FlowWaterfallProps) {
  const steps = [
    { label: 'Shopify Gross Orders', amount: summary.total_gross_paise, color: 'var(--text-primary)', desc: 'Total captured e-commerce checkouts' },
    { label: 'Less: MDR Gateway Fee', amount: -summary.total_fees_paise, color: 'var(--status-rose)', desc: 'Calculated merchant gateway commission' },
    { label: 'Less: 18% GST on Fee', amount: -summary.total_tax_paise, color: 'var(--status-rose)', desc: 'Statutory GST deduction on processing fee' },
    { label: 'Net Expected Settlement', amount: summary.total_net_expected_paise, color: 'var(--rzp-blue)', desc: 'Expected bank credit ledger total' },
    { label: 'Bank Statement Settled', amount: summary.total_bank_settled_paise, color: 'var(--status-emerald)', desc: 'MT940 verified bank deposits' },
  ];

  return (
    <div style={{
      background: 'var(--surface-elevated)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      marginBottom: '24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Reconciliation Waterfall & Fee Netting
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Mathematical reconciliation flow across Order Gross, Gateway Deductions, and Bank Credits
          </div>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--rzp-blue)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          3-WAY HASH VERIFIED
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        {steps.map((step, idx) => (
          <div
            key={idx}
            style={{
              background: 'var(--surface-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500, minHeight: '32px' }}>
              {step.label}
            </div>
            <div className='tabular-mono' style={{ fontSize: '18px', fontWeight: 700, color: step.color, margin: '8px 0 4px 0' }}>
              {step.amount < 0 ? ('- ' + formatCompactPaise(Math.abs(step.amount))) : formatCompactPaise(step.amount)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
              {step.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
