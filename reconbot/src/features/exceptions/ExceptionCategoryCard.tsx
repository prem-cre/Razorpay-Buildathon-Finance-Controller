import React from 'react';
import { ExceptionGroupSummary, ReconciledRecordView } from '@/types/reconciliation';
import { formatPaiseToINR } from '@/lib/money';
import { ChevronRight } from 'lucide-react';

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
      background: 'var(--surface-elevated)',
      border: isEscalate ? '1px solid var(--status-rose-border)' : '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: isEscalate ? 'var(--status-rose)' : 'var(--text-primary)' }}>
              {group.title}
            </span>
            <span
              className='tabular-mono'
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '999px',
                background: isAuto ? 'var(--status-emerald-bg)' : isEscalate ? 'var(--status-rose-bg)' : 'var(--status-amber-bg)',
                color: isAuto ? 'var(--status-emerald)' : isEscalate ? 'var(--status-rose)' : 'var(--status-amber)',
                border: '1px solid ' + borderCol,
              }}
            >
              {group.count} {group.count === 1 ? 'Record' : 'Records'}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '700px', lineHeight: '1.4' }}>
            {group.explanation}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Financial Impact</div>
          <div className='tabular-mono' style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {formatPaiseToINR(group.total_impact_paise)}
          </div>
        </div>
      </div>

      <div style={{
        background: 'var(--surface-primary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
      }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Recommended Action: </strong>
          {group.recommended_action}
        </div>
        {isAuto && (
          <span style={{ fontSize: '11px', color: 'var(--status-emerald)', fontWeight: 600 }}>
            Automated Next Batch
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {group.records.slice(0, 3).map((rec) => (
          <div
            key={rec.id}
            onClick={() => onSelectRecord(rec)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              background: 'var(--surface-interactive)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'background 0.12s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className='tabular-mono' style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rec.payment_id}</span>
              <span style={{ color: 'var(--text-muted)' }}>{rec.merchant_customer}</span>
              <span style={{ color: 'var(--text-muted)' }}>{rec.order_name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className='tabular-mono' style={{ fontWeight: 600 }}>{formatPaiseToINR(rec.gross_paise)}</span>
              <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
