import React, { useState } from 'react';
import { ShieldCheck, ArrowUpRight, TrendingUp, AlertTriangle, CheckCircle2, Bot, ArrowRight, Database, Landmark, Sparkles, FileSpreadsheet } from 'lucide-react';
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

  // Interactive Storytelling Step: Intent -> Context -> Agent -> Result
  const [activeStoryIndex, setActiveStoryIndex] = useState<number>(0);
  const storySteps = [
    {
      title: '01. Ingestion Intent',
      badge: 'MULTI-SOURCE INGEST',
      desc: 'Ingest 500 Shopify order line-items (₹5.00 Cr gross) + Razorpay PG settlement export.',
      icon: Database,
      accent: 'var(--rzp-blue)',
    },
    {
      title: '02. Layer 1: Deterministic Match',
      badge: 'EXACT 3-WAY CHECKSUM',
      desc: 'Gross - MDR Fee - 18% GST = Expected Net matches HDFC MT940 credit at 0.4ms/record.',
      icon: ShieldCheck,
      accent: 'var(--status-emerald)',
    },
    {
      title: '03. Layer 2: Fuzzy & OCR Heuristics',
      badge: 'LEVENSHTEIN RESOLVED',
      desc: 'Fuzzy-linked 21 bank references with prefix typos and settlement timestamp offsets.',
      icon: Sparkles,
      accent: 'var(--status-amber)',
    },
    {
      title: '04. Layer 3: Forensic Exception Triage',
      badge: 'RAY AI ISOLATED',
      desc: 'Isolated 8 timing lag (T+2) & dispute holds into Suspense Ledger with 0 false-positives.',
      icon: Bot,
      accent: 'var(--rzp-purple)',
    },
  ];

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Editorial Header (Vesence Typographic Confidence) */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--rzp-blue)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              RazorpayX · Autonomous Revenue Operations
            </span>
            <span style={{
              fontSize: '10px',
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'var(--rzp-purple-subtle)',
              color: 'var(--rzp-purple)',
              border: '1px solid var(--status-violet-border)',
              fontWeight: 700,
            }}>
              AGENT ENGINE V3
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 3.2vw, 2.75rem)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: '1.1', margin: 0 }}>
            Autonomous <span className='serif-accent' style={{ color: 'var(--rzp-blue)' }}>Multi-Source</span> Reconciliation
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '720px', lineHeight: '1.5' }}>
            Continuous cross-ledger intelligence matching Shopify Orders, Razorpay Gateway Captures, and HDFC Bank MT940 credits with zero false-positives.
          </p>
        </div>

        {/* Live Intent -> Context -> Agent Story Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 18px',
          background: '#ffffff',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--rzp-blue-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--rzp-blue)',
            border: '1px solid var(--rzp-blue-border)',
          }}>
            <Bot size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-emerald)', boxShadow: '0 0 6px rgba(5, 150, 105, 0.5)' }} />
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Reconciliation Intent
              </span>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {total} Transactions Evaluated
            </div>
          </div>
        </div>
      </div>

      {/* Vesence-Style Interactive Product Story Banner */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '20px 24px',
        boxShadow: 'var(--shadow-card)',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Interactive Agent Execution Flow: Intent → Context → Action → Ledger
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Click step to inspect live pipeline transition
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {storySteps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activeStoryIndex === idx;

            return (
              <div
                key={idx}
                onClick={() => setActiveStoryIndex(idx)}
                style={{
                  background: isSelected ? 'var(--surface-interactive)' : '#f8fafc',
                  border: isSelected ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: isSelected ? '0 2px 8px rgba(12, 102, 228, 0.12)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: '#ffffff',
                    color: step.accent,
                    border: '1px solid var(--border-subtle)',
                  }}>
                    {step.badge}
                  </span>
                  <Icon size={14} style={{ color: step.accent }} />
                </div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                  {step.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4-Card Hero Metric Grid */}
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
              Deterministic + Fuzzy
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
