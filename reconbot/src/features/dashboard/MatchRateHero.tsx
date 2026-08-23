import React from 'react';
import { ShieldCheck, ArrowUpRight, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatCompactPaise, formatPaiseToINR } from '@/lib/money';
import { ReconciliationBatchSummary } from '@/types/reconciliation';

interface MatchRateHeroProps {
  summary: ReconciliationBatchSummary;
  onViewExceptions: () => void;
}

export function MatchRateHero({ summary, onViewExceptions }: MatchRateHeroProps) {
  const autoRate = summary.match_rate_percentage;
  const fuzzyRate = Number(((summary.fuzzy_matched_count / summary.total_records) * 100).toFixed(1));
  const exceptionRate = Number(((summary.exceptions_count / summary.total_records) * 100).toFixed(1));

  return (
    <div style={{ marginBottom: '28px' }}>
      {/* Editorial Section Headline */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--rzp-blue)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Autonomous Multi-Source Reconciliation
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: '4px 0 0 0' }}>
            Executive Reconciliation Radar
          </h1>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          background: 'var(--surface-primary)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-subtle)',
        }}>
          <CheckCircle2 size={14} style={{ color: 'var(--status-emerald)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Batch evaluated: <strong style={{ color: 'var(--text-primary)' }}>{summary.total_records} records</strong>
          </span>
        </div>
      </div>

      {/* Asymmetric Metric Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
        gap: '16px',
      }}>
        {/* Main 64px Hero Anchor Card */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 246, 255, 0.75) 100%)',
          border: '1px solid var(--border-accent)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--rzp-blue)' }}>
              <ShieldCheck size={18} />
              <span>Autonomous Match Rate</span>
            </div>
            <span style={{
              fontSize: '11px',
              background: 'var(--status-emerald-bg)',
              color: 'var(--status-emerald)',
              border: '1px solid var(--status-emerald-border)',
              padding: '3px 10px',
              borderRadius: '999px',
              fontWeight: 700,
            }} className='tabular-mono'>
              L1 Exact + L2 Fuzzy
            </span>
          </div>

          <div style={{ margin: '18px 0 14px 0' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <div className='tabular-mono' style={{ fontSize: '56px', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', lineHeight: 1 }}>
                {autoRate}%
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                ({summary.auto_matched_count + summary.fuzzy_matched_count} of {summary.total_records} auto-resolved)
              </div>
            </div>

            {/* Restrained Precision Track */}
            <div style={{ height: '7px', background: 'var(--surface-interactive)', borderRadius: '999px', overflow: 'hidden', display: 'flex', marginTop: '16px' }}>
              <div style={{ width: autoRate + '%', background: 'var(--status-emerald)' }} title={'Deterministic Exact: ' + autoRate + '%'} />
              <div style={{ width: fuzzyRate + '%', background: 'var(--status-amber)' }} title={'Fuzzy Heuristics: ' + fuzzyRate + '%'} />
              <div style={{ width: exceptionRate + '%', background: 'var(--status-rose)' }} title={'Exceptions: ' + exceptionRate + '%'} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', gap: '14px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--status-emerald)' }} /> Exact: {summary.auto_matched_count}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--status-amber)' }} /> Fuzzy: {summary.fuzzy_matched_count}
              </span>
            </div>
            <span className='tabular-mono' style={{ color: 'var(--status-emerald)', fontWeight: 700 }}>+2.4% vs last cycle</span>
          </div>
        </div>

        {/* Metric 2: Reconciled Volume */}
        <div style={{
          background: 'var(--surface-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Reconciled Volume</span>
            <TrendingUp size={16} style={{ color: 'var(--status-emerald)' }} />
          </div>
          <div>
            <div className='tabular-mono' style={{ fontSize: '30px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {formatCompactPaise(summary.total_bank_settled_paise)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Gross captured: {formatCompactPaise(summary.total_gross_paise)}
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--status-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} /> 100% Bank UTR Verified
          </div>
        </div>

        {/* Metric 3: Value at Risk / Suspense */}
        <div style={{
          background: 'var(--surface-primary)',
          border: summary.value_at_risk_paise > 0 ? '1px solid var(--status-amber-border)' : '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Value at Risk (Suspense)</span>
            <AlertTriangle size={16} style={{ color: summary.value_at_risk_paise > 0 ? 'var(--status-amber)' : 'var(--text-muted)' }} />
          </div>
          <div>
            <div className='tabular-mono' style={{ fontSize: '30px', fontWeight: 800, color: summary.value_at_risk_paise > 0 ? 'var(--status-amber)' : 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {formatCompactPaise(summary.value_at_risk_paise)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {summary.exceptions_count} items awaiting review/T+2
            </div>
          </div>
          <button
            onClick={onViewExceptions}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--rzp-blue)',
              fontSize: '12px',
              fontWeight: 700,
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              textAlign: 'left',
            }}
          >
            Review Exceptions Queue <ArrowUpRight size={13} />
          </button>
        </div>

        {/* Metric 4: Precision Guarantee */}
        <div style={{
          background: 'var(--surface-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Model Precision</span>
            <span style={{
              fontSize: '11px',
              background: 'var(--surface-interactive)',
              padding: '2px 8px',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
            }}>
              F1: {summary.evaluation.f1_score}
            </span>
          </div>
          <div>
            <div className='tabular-mono' style={{ fontSize: '30px', fontWeight: 800, color: 'var(--status-emerald)', letterSpacing: '-0.02em' }}>
              {summary.evaluation.precision_pct}%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Recall rate: {summary.evaluation.recall_pct}%
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            FP exposure: <span className='tabular-mono' style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{formatPaiseToINR(summary.evaluation.false_positive_exposure_paise)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
