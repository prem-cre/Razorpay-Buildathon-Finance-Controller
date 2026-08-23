import React from 'react';
import { ExceptionGroupSummary, ReconciledRecordView } from '@/types/reconciliation';
import { formatPaiseToINR } from '@/lib/money';
import { ChevronRight, AlertTriangle, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ExceptionCategoryCardProps {
  group: ExceptionGroupSummary;
  onSelectRecord: (rec: ReconciledRecordView) => void;
}

export function ExceptionCategoryCard({ group, onSelectRecord }: ExceptionCategoryCardProps) {
  const isAuto = group.auto_resolvable;
  const isEscalate = group.resolution_type === 'escalate';

  const borderCol = isAuto ? 'var(--status-emerald-border)' : isEscalate ? 'var(--status-rose-border)' : 'var(--status-amber-border)';

  return (
    <div style={{
      background: 'var(--surface-primary)',
      border: isEscalate ? '1px solid var(--status-rose-border)' : '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px',
      boxShadow: 'var(--shadow-card)',
      marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '17px', fontWeight: 800, color: isEscalate ? 'var(--status-rose)' : 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              {group.title}
            </span>
            <span
              className='tabular-mono'
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: '999px',
                background: isAuto ? 'var(--status-emerald-bg)' : isEscalate ? 'var(--status-rose-bg)' : 'var(--status-amber-bg)',
                color: isAuto ? 'var(--status-emerald)' : isEscalate ? 'var(--status-rose)' : 'var(--status-amber)',
                border: '1px solid ' + borderCol,
              }}
            >
              {group.count} {group.count === 1 ? 'Record' : 'Records'}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', maxWidth: '720px', lineHeight: '1.5' }}>
            {group.explanation}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Unresolved Impact</div>
          <div className='tabular-mono' style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {formatPaiseToINR(group.total_impact_paise)}
          </div>
        </div>
      </div>

      <div style={{
        background: 'var(--surface-canvas)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Recommended Action: </strong>
          {group.recommended_action}
        </div>
        {isAuto && (
          <span style={{ fontSize: '12px', color: 'var(--status-emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} /> Auto-Resolvable Next Batch
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {group.records.slice(0, 3).map((rec) => (
          <div
            key={rec.id}
            onClick={() => onSelectRecord(rec)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: 'var(--surface-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--rzp-blue)';
              e.currentTarget.style.background = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.background = 'var(--surface-canvas)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span className='tabular-mono' style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{rec.payment_id}</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{rec.merchant_customer}</span>
              <span style={{ color: 'var(--text-muted)' }}>{rec.order_name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span className='tabular-mono' style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatPaiseToINR(rec.gross_paise)}</span>
              <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
