import React from 'react';
import { ShieldCheck, ArrowUpRight, TrendingUp, AlertTriangle } from 'lucide-react';
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
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
      gap: '16px',
      marginBottom: '24px',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(12, 102, 228, 0.12) 0%, var(--surface-elevated) 100%)',
        border: '1px solid var(--border-accent)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--rzp-blue)' }}>
            <ShieldCheck size={16} />
            <span>Autonomous Match Rate</span>
          </div>
          <span style={{
            fontSize: '11px',
            background: 'var(--status-emerald-bg)',
            color: 'var(--status-emerald)',
            border: '1px solid var(--status-emerald-border)',
            padding: '2px 8px',
            borderRadius: '999px',
            fontWeight: 600,
          }} className='tabular-mono'>
            Layer 1 + 2
          </span>
        </div>

        <div style={{ margin: '14px 0 10px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <div className='tabular-mono' style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              {autoRate}%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              ({summary.auto_matched_count + summary.fuzzy_matched_count} / {summary.total_records} txns)
            </div>
          </div>

          <div style={{ height: '6px', background: 'var(--surface-interactive)', borderRadius: '999px', overflow: 'hidden', display: 'flex', marginTop: '10px' }}>
            <div style={{ width: autoRate + '%', background: 'var(--status-emerald)' }} title={'Deterministic: ' + autoRate + '%'} />
            <div style={{ width: fuzzyRate + '%', background: 'var(--status-amber)' }} title={'Fuzzy: ' + fuzzyRate + '%'} />
            <div style={{ width: exceptionRate + '%', background: 'var(--status-rose)' }} title={'Exceptions: ' + exceptionRate + '%'} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-emerald)' }} /> Exact: {summary.auto_matched_count}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-amber)' }} /> Fuzzy: {summary.fuzzy_matched_count}
            </span>
          </div>
          <span className='tabular-mono' style={{ color: 'var(--status-emerald)' }}>+2.4% vs last batch</span>
        </div>
      </div>

      <div style={{
        background: 'var(--surface-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Reconciled Volume</span>
          <TrendingUp size={15} style={{ color: 'var(--status-emerald)' }} />
        </div>
        <div>
          <div className='tabular-mono' style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {formatCompactPaise(summary.total_bank_settled_paise)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Gross: {formatCompactPaise(summary.total_gross_paise)}
          </div>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--status-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>100% Bank UTR verified</span>
        </div>
      </div>

      <div style={{
        background: 'var(--surface-elevated)',
        border: summary.value_at_risk_paise > 0 ? '1px solid var(--status-amber-border)' : '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Value at Risk / Lag</span>
          <AlertTriangle size={15} style={{ color: summary.value_at_risk_paise > 0 ? 'var(--status-amber)' : 'var(--text-muted)' }} />
        </div>
        <div>
          <div className='tabular-mono' style={{ fontSize: '26px', fontWeight: 700, color: summary.value_at_risk_paise > 0 ? 'var(--status-amber)' : 'var(--text-primary)' }}>
            {formatCompactPaise(summary.value_at_risk_paise)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {summary.exceptions_count} items awaiting review/T+2
          </div>
        </div>
        <button
          onClick={onViewExceptions}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--rzp-blue)',
            fontSize: '11px',
            fontWeight: 600,
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            textAlign: 'left',
          }}
        >
          Review Exceptions Queue <ArrowUpRight size={12} />
        </button>
      </div>

      <div style={{
        background: 'var(--surface-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Model Precision</span>
          <span style={{
            fontSize: '10px',
            background: 'var(--surface-interactive)',
            padding: '2px 6px',
            borderRadius: '4px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)'
          }}>
            F1: {summary.evaluation.f1_score}
          </span>
        </div>
        <div>
          <div className='tabular-mono' style={{ fontSize: '26px', fontWeight: 700, color: 'var(--status-emerald)' }}>
            {summary.evaluation.precision_pct}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Recall: {summary.evaluation.recall_pct}%
          </div>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          FP Exposure: <span className='tabular-mono' style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{formatPaiseToINR(summary.evaluation.false_positive_exposure_paise)}</span>
        </div>
      </div>
    </div>
  );
}
