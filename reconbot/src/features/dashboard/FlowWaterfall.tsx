import React from 'react';
import { formatCompactPaise } from '@/lib/money';
import { ReconciliationBatchSummary } from '@/types/reconciliation';
import { Workflow, ArrowRight } from 'lucide-react';

interface FlowWaterfallProps {
  summary: ReconciliationBatchSummary;
}

export function FlowWaterfall({ summary }: FlowWaterfallProps) {
  const steps = [
    { label: '1. Shopify Gross Orders', amount: summary.total_gross_paise, color: 'var(--text-primary)', desc: 'Total captured checkouts across channels' },
    { label: '2. Less: MDR Gateway Fee', amount: -(summary.total_fees_paise), color: 'var(--status-rose)', desc: 'Calculated merchant gateway commission' },
    { label: '3. Less: 18% GST on Fee', amount: -(summary.total_tax_paise), color: 'var(--status-rose)', desc: 'Statutory GST on processing charges' },
    { label: '4. Expected Settlement Net', amount: summary.total_net_expected_paise, color: 'var(--rzp-blue)', desc: 'Expected bank credit ledger total' },
    { label: '5. Bank credit received', amount: summary.total_bank_settled_paise, color: 'var(--status-emerald)', desc: 'Statement deposits matched by UTR' },
  ];

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px 28px',
      boxShadow: 'var(--shadow-card)',
      marginBottom: '28px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Workflow size={16} style={{ color: 'var(--rzp-blue)' }} />
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Multi-Source Financial Flow & Netting Waterfall
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Mathematical reconciliation flow from Gross Order Value to Verified Bank Settlement
          </div>
        </div>
        <span style={{
          fontSize: '11px',
          color: 'var(--rzp-blue)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          background: 'var(--rzp-blue-subtle)',
          padding: '4px 12px',
          borderRadius: '999px',
          border: '1px solid var(--rzp-blue-border)',
        }}>
          UTR-VERIFIED
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
        {steps.map((step, idx) => (
          <div
            key={idx}
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, minHeight: '34px' }}>
              {step.label}
            </div>
            <div className='tabular-mono' style={{ fontSize: '20px', fontWeight: 800, color: step.color, margin: '10px 0 4px 0', letterSpacing: '-0.02em' }}>
              {step.amount < 0 ? ('- ' + formatCompactPaise(Math.abs(step.amount))) : formatCompactPaise(step.amount)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              {step.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
