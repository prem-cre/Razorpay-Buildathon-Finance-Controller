import React, { useState, useEffect, useMemo } from 'react';
import { Terminal, CheckCircle2, AlertTriangle, Clock, HelpCircle } from 'lucide-react';
import { ReconciledRecordView } from '@/types/reconciliation';
import { formatTruncatedId } from '@/lib/formatters';

interface TelemetryStreamProps {
  records: ReconciledRecordView[];
}

const STATUS_STYLE: Record<string, { color: string; bg: string; border: string; icon: React.ElementType; label: string }> = {
  matched: { color: 'var(--status-emerald)', bg: 'var(--status-emerald-bg)', border: 'var(--status-emerald-border)', icon: CheckCircle2, label: 'MATCHED' },
  awaiting_settlement: { color: 'var(--status-amber)', bg: 'var(--status-amber-bg)', border: 'var(--status-amber-border)', icon: Clock, label: 'AWAITING' },
  orphan_payment: { color: 'var(--rzp-purple)', bg: 'var(--rzp-purple-subtle)', border: 'var(--status-violet-border)', icon: AlertTriangle, label: 'ORPHAN' },
  unresolved: { color: 'var(--text-muted)', bg: 'var(--surface-interactive)', border: 'var(--border-subtle)', icon: HelpCircle, label: 'DEFERRED' },
};

/**
 * Engine Decision Log — replays THIS batch's actual Layer 1 decisions.
 * Every row is a real record: real payment id, the real rule that fired, the
 * real confidence band, the real status. No synthetic events, no fake latency.
 */
export function TelemetryStream({ records }: TelemetryStreamProps) {
  const ordered = useMemo(() => records.slice(0, 40), [records]);
  const [visibleCount, setVisibleCount] = useState(Math.min(8, ordered.length));

  useEffect(() => {
    setVisibleCount(Math.min(8, ordered.length));
    if (ordered.length <= 8) return;
    const interval = setInterval(() => {
      setVisibleCount((prev) => (prev >= ordered.length ? Math.min(8, ordered.length) : prev + 1));
    }, 1400);
    return () => clearInterval(interval);
  }, [ordered]);

  const shown = ordered.slice(0, visibleCount);

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px 28px',
      boxShadow: 'var(--shadow-card)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={16} style={{ color: 'var(--rzp-blue)' }} />
          <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Engine Decision Log
          </span>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
          Replaying this batch&apos;s actual Layer 1 decisions
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {shown.map((r) => {
          const s = STATUS_STYLE[r.match_status] || STATUS_STYLE.unresolved;
          const Icon = s.icon;
          return (
            <div
              key={r.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 16px',
                borderRadius: 'var(--radius-md)',
                background: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                fontSize: '12px',
                animation: 'fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                <span className='tabular-mono' style={{ color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700 }}>
                  {formatTruncatedId(r.payment_id)}
                </span>
                <span
                  className='tabular-mono'
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'var(--rzp-blue-subtle)',
                    color: 'var(--rzp-blue)',
                    border: '1px solid var(--rzp-blue-border)',
                    flexShrink: 0,
                  }}
                >
                  {r.rule_applied || 'DEFERRED'}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.order_name} · {r.payment_method.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
                  background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                }}>
                  <Icon size={11} /> {s.label}
                </span>
                <span className='tabular-mono' style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, width: '44px', textAlign: 'right' }}>
                  {r.confidence}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
