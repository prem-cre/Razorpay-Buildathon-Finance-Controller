import React from 'react';
import { ExceptionGroupSummary, ReconciledRecordView } from '@/types/reconciliation';
import { formatPaiseToINR } from '@/lib/money';
import { ChevronRight, AlertTriangle, Clock, ShieldAlert, CheckCircle2, Bot } from 'lucide-react';

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
      background: '#ffffff',
      border: isEscalate ? '1px solid var(--status-rose-border)' : '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xl)',
      padding: '26px',
      boxShadow: isEscalate ? '0 4px 16px rgba(225, 29, 72, 0.08)' : 'var(--shadow-card)',
      marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: isEscalate ? 'var(--status-rose)' : 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              {group.title}
            </span>
            <span
              className='tabular-mono'
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '999px',
                background: isAuto ? 'var(--status-emerald-bg)' : isEscalate ? 'var(--status-rose-bg)' : 'var(--status-amber-bg)',
                color: isAuto ? 'var(--status-emerald)' : isEscalate ? 'var(--status-rose)' : 'var(--status-amber)',
                border: '1px solid ' + borderCol,
              }}
            >
              {group.count} {group.count === 1 ? 'Record' : 'Records'}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', maxWidth: '740px', lineHeight: '1.5' }}>
            {group.explanation}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Unresolved Financial Impact</div>
          <div className='tabular-mono' style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {formatPaiseToINR(group.total_impact_paise)}
          </div>
        </div>
      </div>

      <div style={{
        background: '#f8fafc',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '18px',
      }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Agent Recommended Action: </strong>
          {group.recommended_action}
        </div>
        {isAuto && (
          <span style={{ fontSize: '12px', color: 'var(--status-emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <CheckCircle2 size={14} /> Auto-Resolvable Next Stream Batch
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
              padding: '12px 16px',
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-subtle)',
              transition: 'all 0.14s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--rzp-blue)';
              e.currentTarget.style.background = 'var(--rzp-blue-subtle)';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span className='tabular-mono' style={{ fontWeight: 700, color: 'var(--rzp-blue)' }}>{rec.payment_id}</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{rec.merchant_customer}</span>
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
