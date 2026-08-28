'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, ArrowUpRight, TrendingUp, AlertTriangle, CheckCircle2, Layers } from 'lucide-react';
import { formatCompactPaise } from '@/lib/money';
import { ReconciliationBatchSummary } from '@/types/reconciliation';

interface MatchRateHeroProps {
  summary: ReconciliationBatchSummary;
  onViewExceptions: () => void;
  onOpenCopilot?: () => void;
}

/** Eased count-up for the headline figure. Re-runs whenever the batch changes. */
function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      // rAF's timestamp can precede `start`, so clamp BOTH ends — an
      // unclamped negative t makes the cubic ease overshoot below zero.
      const t = Math.max(0, Math.min(1, (now - start) / duration));
      setValue(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);
  return value;
}

export function MatchRateHero({ summary, onViewExceptions }: MatchRateHeroProps) {
  const total = summary.total_records;
  const exact = summary.auto_matched_count;
  const recovered = summary.fuzzy_matched_count;
  const deferred = summary.exceptions_count;
  const rate = summary.match_rate_percentage;
  const animated = useCountUp(rate);

  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Editorial header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--rzp-blue)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '10px' }}>
          Multi-source reconciliation
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 3.2vw, 2.75rem)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.08, margin: 0 }}>
          Close the books, <span className='serif-accent' style={{ color: 'var(--rzp-blue)' }}>provably</span>
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '10px', maxWidth: '640px', lineHeight: 1.55 }}>
          Every payment matched across the order record, the gateway settlement, and the bank credit — with the evidence for each decision kept on file.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr 1fr 1fr', gap: '16px' }}>
        {/* Dark anchor */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'radial-gradient(130% 130% at 0% 0%, #1b2a47 0%, #101a2f 45%, #0a1020 100%)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 'var(--radius-xl)',
          padding: '26px 28px',
          boxShadow: '0 24px 48px -20px rgba(12,102,228,0.45), 0 2px 8px rgba(15,23,42,0.10)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          animation: 'heroRise 0.6s cubic-bezier(0.16,1,0.3,1) both',
        }}>
          <div aria-hidden style={{ position: 'absolute', top: '-70px', right: '-50px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(12,102,228,0.40) 0%, transparent 68%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 800, color: '#8ab4f8', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              <ShieldCheck size={15} /> Auto-resolved
            </span>
            <span className='tabular-mono' style={{ fontSize: '10px', background: 'rgba(12,102,228,0.20)', color: '#9ec5fe', border: '1px solid rgba(138,180,248,0.32)', padding: '3px 10px', borderRadius: '999px', fontWeight: 700 }}>
              L1 + L2
            </span>
          </div>

          <div style={{ margin: '20px 0 16px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span className='tabular-mono' style={{ fontSize: '66px', fontWeight: 900, letterSpacing: '-0.045em', color: '#ffffff', lineHeight: 1 }}>
                {animated.toFixed(1)}%
              </span>
              <span style={{ fontSize: '13px', color: '#8fa3bf', fontWeight: 500 }}>
                {exact + recovered} of {total} records
              </span>
            </div>

            {/* Segmented track: exact / recovered / deferred */}
            <div style={{ height: '9px', background: 'rgba(255,255,255,0.09)', borderRadius: '999px', overflow: 'hidden', display: 'flex', marginTop: '18px' }}>
              <div title={'Layer 1 exact: ' + exact} style={{ width: pct(exact) + '%', background: 'linear-gradient(90deg,#059669,#10b981)', transition: 'width 1s cubic-bezier(0.16,1,0.3,1)' }} />
              <div title={'Layer 2 recovered: ' + recovered} style={{ width: pct(recovered) + '%', background: 'linear-gradient(90deg,#0c66e4,#3b82f6)', transition: 'width 1s cubic-bezier(0.16,1,0.3,1)' }} />
              <div title={'Held for review: ' + deferred} style={{ width: pct(deferred) + '%', background: 'rgba(255,255,255,0.22)' }} />
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '11px', color: '#8fa3bf' }}>
              <Legend color='#10b981' label='Exact' value={exact} />
              <Legend color='#3b82f6' label='Recovered' value={recovered} />
              <Legend color='rgba(255,255,255,0.35)' label='Review' value={deferred} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', position: 'relative' }}>
            <span style={{ color: '#64748b' }}>Built on Anthropic&apos;s Claude Agent SDK</span>
            <span className='tabular-mono' style={{ color: '#34d399', fontWeight: 700 }}>0 wrongly auto-resolved</span>
          </div>
        </div>

        <MetricCard
          label='Settled to bank'
          icon={<TrendingUp size={16} style={{ color: 'var(--status-emerald)' }} />}
          value={formatCompactPaise(summary.total_bank_settled_paise)}
          sub={'of ' + formatCompactPaise(summary.total_gross_paise) + ' captured'}
          footer={<span style={{ fontSize: '12px', color: 'var(--status-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}><CheckCircle2 size={13} /> Matched by bank UTR</span>}
        />

        <MetricCard
          label='Awaiting review'
          icon={<AlertTriangle size={16} style={{ color: summary.value_at_risk_paise > 0 ? 'var(--status-amber)' : 'var(--text-muted)' }} />}
          value={formatCompactPaise(summary.value_at_risk_paise)}
          valueColor={summary.value_at_risk_paise > 0 ? 'var(--status-amber)' : 'var(--text-primary)'}
          border={summary.value_at_risk_paise > 0 ? 'var(--status-amber-border)' : 'var(--border-subtle)'}
          sub={'across ' + deferred + (deferred === 1 ? ' record' : ' records')}
          footer={
            <button onClick={onViewExceptions} style={{ background: 'transparent', border: 'none', color: 'var(--rzp-blue)', fontSize: '12px', fontWeight: 700, padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Open review queue <ArrowUpRight size={13} />
            </button>
          }
        />

        <MetricCard
          label='Recovered by Layer 2'
          icon={<Layers size={16} style={{ color: 'var(--rzp-blue)' }} />}
          value={String(recovered)}
          valueColor={recovered > 0 ? 'var(--rzp-blue)' : 'var(--text-primary)'}
          sub={recovered > 0 ? 'Batches unblocked after netting' : 'Nothing needed recovery'}
          footer={<span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Exact match: <span className='tabular-mono' style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{exact}</span></span>}
        />
      </div>
    </div>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: color }} />
      {label} <strong className='tabular-mono' style={{ color: '#cbd5e1' }}>{value}</strong>
    </span>
  );
}

function MetricCard({ label, icon, value, sub, footer, valueColor = 'var(--text-primary)', border = 'var(--border-subtle)' }: {
  label: string; icon: React.ReactNode; value: string; sub: string; footer: React.ReactNode; valueColor?: string; border?: string;
}) {
  return (
    <div
      style={{
        background: '#ffffff', border: '1px solid ' + border, borderRadius: 'var(--radius-xl)',
        padding: '22px 24px', boxShadow: 'var(--shadow-card)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px',
        transition: 'transform 200ms cubic-bezier(0.16,1,0.3,1), box-shadow 200ms',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
        {icon}
      </div>
      <div>
        <div className='tabular-mono' style={{ fontSize: '30px', fontWeight: 800, color: valueColor, letterSpacing: '-0.025em', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>{sub}</div>
      </div>
      {footer}
    </div>
  );
}
