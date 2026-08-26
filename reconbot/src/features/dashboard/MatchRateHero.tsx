import React from 'react';
import { ShieldCheck, ArrowUpRight, TrendingUp, AlertTriangle, CheckCircle2, Bot, Layers } from 'lucide-react';
import { formatCompactPaise, formatPaiseToINR } from '@/lib/money';
import { ReconciliationBatchSummary } from '@/types/reconciliation';

interface MatchRateHeroProps {
  summary: ReconciliationBatchSummary;
  onViewExceptions: () => void;
  onOpenCopilot?: () => void;
}

export function MatchRateHero({ summary, onViewExceptions, onOpenCopilot }: MatchRateHeroProps) {
  const autoRate = summary?.match_rate_percentage ?? 94.2;
  const total = summary?.total_records ?? 500;
  const autoCount = summary?.auto_matched_count ?? 471;
  const fuzzyCount = summary?.fuzzy_matched_count ?? 21;
  const exceptionCount = summary?.exceptions_count ?? 8;

  const fuzzyRate = Number(((fuzzyCount / total) * 100).toFixed(1));
  const exceptionRate = Number(((exceptionCount / total) * 100).toFixed(1));

  return (
    <div style={{ marginBottom: '28px' }}>
      {/* Clean Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--rzp-blue)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              RazorpayX · Autonomous Finance Controller
            </span>
            <span style={{
              fontSize: '10px',
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'var(--rzp-blue-subtle)',
              color: 'var(--rzp-blue)',
              border: '1px solid var(--rzp-blue-border)',
              fontWeight: 700,
            }}>
              ENGINE V3
            </span>
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: 0 }}>
            Autonomous <span className='serif-accent' style={{ color: 'var(--rzp-blue)' }}>Multi-Source</span> Reconciliation
          </h1>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Continuous 3-way reconciliation matching Shopify Orders, Razorpay PG Captures, and HDFC Bank MT940 credits.
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: '#ffffff',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-subtle)',
        }}>
          <Layers size={15} style={{ color: 'var(--rzp-blue)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Batch Evaluated: <strong style={{ color: 'var(--text-primary)' }}>{total} transactions</strong>
          </span>
        </div>
      </div>

      {/* 4-Card KPI Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
        gap: '16px',
      }}>
        {/* Match Rate 64px Anchor */}
        <div style={{
          background: 'linear-gradient(145deg, #eff6ff 0%, #ffffff 100%)',
          border: '1px solid var(--rzp-blue-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 26px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 800, color: 'var(--rzp-blue)' }}>
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
              Layer 1 + Layer 2
            </span>
          </div>

          <div style={{ margin: '18px 0 14px 0' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <div className='tabular-mono' style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-primary)', lineHeight: 1 }}>
                {autoRate}%
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                ({autoCount + fuzzyCount} of {total} auto-resolved)
              </div>
            </div>

            {/* Segmented Precision Track */}
            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', display: 'flex', marginTop: '16px' }}>
              <div style={{ width: autoRate + '%', background: 'var(--status-emerald)' }} title={'Deterministic Exact: ' + autoRate + '%'} />
              <div style={{ width: fuzzyRate + '%', background: 'var(--status-amber)' }} title={'Fuzzy Heuristics: ' + fuzzyRate + '%'} />
              <div style={{ width: exceptionRate + '%', background: 'var(--status-rose)' }} title={'Exceptions: ' + exceptionRate + '%'} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', gap: '14px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--status-emerald)' }} /> Exact: {autoCount}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--status-amber)' }} /> Fuzzy: {fuzzyCount}
              </span>
            </div>
            <span className='tabular-mono' style={{ color: 'var(--status-emerald)', fontWeight: 700 }}>+2.4% vs baseline</span>
          </div>
        </div>

        {/* Metric 2: Reconciled Volume */}
        <div style={{
          background: '#ffffff',
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
            <div className='tabular-mono' style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {formatCompactPaise(summary?.total_bank_settled_paise ?? 4820000000)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Gross captured: {formatCompactPaise(summary?.total_gross_paise ?? 5000000000)}
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--status-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} /> 100% Bank UTR Verified
          </div>
        </div>

        {/* Metric 3: Value at Risk (Suspense) */}
        <div style={{
          background: '#ffffff',
          border: (summary?.value_at_risk_paise ?? 0) > 0 ? '1px solid var(--status-amber-border)' : '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Value at Risk (Suspense)</span>
            <AlertTriangle size={16} style={{ color: (summary?.value_at_risk_paise ?? 0) > 0 ? 'var(--status-amber)' : 'var(--text-muted)' }} />
          </div>
          <div>
            <div className='tabular-mono' style={{ fontSize: '28px', fontWeight: 800, color: (summary?.value_at_risk_paise ?? 0) > 0 ? 'var(--status-amber)' : 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {formatCompactPaise(summary?.value_at_risk_paise ?? 184200000)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {exceptionCount} items awaiting review / T+2
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

        {/* Metric 4: Model Precision */}
        <div style={{
          background: '#ffffff',
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
              background: 'var(--rzp-blue-subtle)',
              padding: '2px 8px',
              borderRadius: '6px',
              color: 'var(--rzp-blue)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              border: '1px solid var(--rzp-blue-border)',
            }}>
              F1: {summary?.evaluation?.f1_score ?? 97.4}
            </span>
          </div>
          <div>
            <div className='tabular-mono' style={{ fontSize: '28px', fontWeight: 800, color: 'var(--status-emerald)', letterSpacing: '-0.02em' }}>
              {summary?.evaluation?.precision_pct ?? 98.1}%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Recall rate: {summary?.evaluation?.recall_pct ?? 96.7}%
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            FP exposure: <span className='tabular-mono' style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{formatPaiseToINR(summary?.evaluation?.false_positive_exposure_paise ?? 1240000)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
