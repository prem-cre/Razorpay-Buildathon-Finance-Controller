import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Bot,
  Sparkles,
  Play,
  Check,
  Cpu,
  ArrowRight,
  RefreshCw,
  Terminal,
  Lock,
  Layers
} from 'lucide-react';
import { formatCompactPaise, formatPaiseToINR } from '@/lib/money';
import { ReconciliationBatchSummary } from '@/types/reconciliation';

interface MatchRateHeroProps {
  summary: ReconciliationBatchSummary;
  onViewExceptions: () => void;
  onTriggerRun: () => void;
  isReconciling: boolean;
}

export function MatchRateHero({ summary, onViewExceptions, onTriggerRun, isReconciling }: MatchRateHeroProps) {
  const autoRate = summary.match_rate_percentage;
  const fuzzyRate = Number(((summary.fuzzy_matched_count / summary.total_records) * 100).toFixed(1));
  const exceptionRate = Number(((summary.exceptions_count / summary.total_records) * 100).toFixed(1));

  // Living AI Agent Workspace Simulation State
  const [activeStep, setActiveStep] = useState(0);
  const simSteps = [
    { label: 'Ingesting Multi-Source Streams', detail: 'Shopify #1001-#1500 + Razorpay PG Webhooks + HDFC MT940', status: 'COMPLETE', time: '0.1ms' },
    { label: 'Layer 1: Deterministic Checksums', detail: '471 exact 3-way hash matches verified with zero delta', status: 'COMPLETE', time: '0.3ms' },
    { label: 'Layer 2: Fuzzy OCR & UTR Linker', detail: '21 character-distance variances resolved (Levenshtein <= 2)', status: 'COMPLETE', time: '0.6ms' },
    { label: 'Layer 3: Ray AI Forensic Triage', detail: '8 exceptions isolated into Suspense Ledger with root-cause proof', status: 'ACTIVE', time: '1.2ms' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % simSteps.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Editorial Hero Header */}
      <div style={{ marginBottom: '28px', maxWidth: '860px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '999px', background: 'var(--rzp-purple-subtle)', border: '1px solid var(--status-violet-border)', marginBottom: '16px' }}>
          <Sparkles size={13} style={{ color: 'var(--rzp-purple)' }} />
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--rzp-purple)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            THE AUTONOMOUS RECONCILIATION PLATFORM
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 4vw, 3.4rem)',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.035em',
          lineHeight: '1.12',
          margin: '0 0 14px 0',
        }}>
          Turn financial chaos into{' '}
          <span className='serif-accent' style={{ color: 'var(--rzp-blue)', fontWeight: 400 }}>
            cryptographic truth.
          </span>
        </h1>

        <p style={{
          fontSize: '16px',
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
          margin: 0,
          maxWidth: '720px',
        }}>
          Deploy autonomous AI agents that normalize multi-source transaction streams, evaluate 3-way deterministic rules, triage fee variances, and seal immutable bank ledger entries in real time.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '20px' }}>
          <button
            onClick={onTriggerRun}
            disabled={isReconciling}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'linear-gradient(180deg, #0c66e4 0%, #0052cc 100%)',
              border: '1px solid rgba(12, 102, 228, 0.6)',
              borderRadius: 'var(--radius-md)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isReconciling ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(12, 102, 228, 0.25)',
            }}
          >
            <RefreshCw size={15} style={{ animation: isReconciling ? 'spin 1s linear infinite' : 'none' }} />
            <span>{isReconciling ? 'Reconciling Live Agents...' : 'Run 3-Way Reconcile →'}</span>
          </button>

          <button
            onClick={onViewExceptions}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 20px',
              background: '#ffffff',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-subtle)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--rzp-blue)';
              e.currentTarget.style.color = 'var(--rzp-blue)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-default)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
          >
            <span>Review Exceptions ({summary.exceptions_count})</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Living AI Agent Workspace (25% Dark Contrast Object in Bright Canvas) */}
      <div style={{
        background: 'var(--surface-dark-canvas)',
        borderRadius: 'var(--radius-2xl)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: 'var(--shadow-dark-workspace)',
        padding: '28px 32px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle atmospheric gradient light */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-100px',
          left: '-100px',
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(12, 102, 228, 0.20) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Workspace Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-dark)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #7c3aed 0%, #0c66e4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 12px rgba(124, 58, 237, 0.5)',
            }}>
              <Bot size={16} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Autonomous Agent Execution Stream</span>
                <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                  ACTIVE (0.4ms)
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dark-secondary)' }}>
                Target: Multi-Source Settlement Batch #2026-0824 · 500 Transactions
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className='tabular-mono' style={{ fontSize: '11px', color: 'var(--text-dark-secondary)' }}>
              Latency: <strong style={{ color: '#ffffff' }}>0.4ms</strong> · Proof: <strong style={{ color: '#a78bfa' }}>0x8F92...A71D</strong>
            </span>
          </div>
        </div>

        {/* 4-Step Animated Pipeline Sequence */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          {simSteps.map((step, idx) => {
            const isHighlighted = activeStep === idx;
            return (
              <div
                key={idx}
                style={{
                  background: isHighlighted ? 'rgba(124, 58, 237, 0.15)' : 'var(--surface-dark-card)',
                  border: isHighlighted ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid var(--border-dark)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  boxShadow: isHighlighted ? '0 0 20px rgba(124, 58, 237, 0.25)' : 'none',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className='tabular-mono' style={{ fontSize: '10px', fontWeight: 800, color: isHighlighted ? '#c4b5fd' : 'var(--text-dark-muted)' }}>
                    STEP 0{idx + 1}
                  </span>
                  <span className='tabular-mono' style={{ fontSize: '10px', color: '#34d399', fontWeight: 700 }}>
                    {step.time}
                  </span>
                </div>

                <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', lineHeight: '1.3' }}>
                  {step.label}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dark-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                  {step.detail}
                </div>

                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: isHighlighted ? '#a855f7' : '#10b981',
                    boxShadow: isHighlighted ? '0 0 8px #a855f7' : 'none',
                  }} />
                  <span style={{ fontSize: '10px', color: isHighlighted ? '#c084fc' : '#94a3b8', fontWeight: 700 }}>
                    {isHighlighted ? 'Evaluating...' : 'Verified'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4-Card Luminous Metric Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
        gap: '16px',
      }}>
        {/* 64px Match Rate Hero Anchor */}
        <div style={{
          background: 'linear-gradient(145deg, #eff6ff 0%, #f5f3ff 50%, #ffffff 100%)',
          border: '1px solid var(--rzp-blue-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 26px',
          boxShadow: 'var(--shadow-card), var(--shadow-glow-blue)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
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
              Layer 1 Exact + Layer 2 Fuzzy
            </span>
          </div>

          <div style={{ margin: '18px 0 14px 0' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <div className='tabular-mono' style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-primary)', lineHeight: 1 }}>
                {autoRate}%
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                ({summary.auto_matched_count + summary.fuzzy_matched_count} of {summary.total_records} auto-resolved)
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
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--status-emerald)' }} /> Exact: {summary.auto_matched_count}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--status-amber)' }} /> Fuzzy: {summary.fuzzy_matched_count}
              </span>
            </div>
            <span className='tabular-mono' style={{ color: 'var(--status-emerald)', fontWeight: 700 }}>+2.4% vs benchmark</span>
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

        {/* Metric 3: Value at Risk (Suspense) */}
        <div style={{
          background: '#ffffff',
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
              background: 'var(--rzp-purple-subtle)',
              padding: '2px 8px',
              borderRadius: '6px',
              color: 'var(--rzp-purple)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              border: '1px solid var(--status-violet-border)',
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
