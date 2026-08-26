import React from 'react';
import { Database, ShieldCheck, Zap, Bot, Landmark, CheckCircle2, Cpu, Circle } from 'lucide-react';
import { ReconciliationBatchSummary } from '@/types/reconciliation';

interface AgentPipelineCanvasProps {
  summary: ReconciliationBatchSummary;
}

export function AgentPipelineCanvas({ summary }: AgentPipelineCanvasProps) {
  const nodes = [
    {
      id: 'ingest', step: '01', title: 'Multi-Source Ingestion', agent: 'Schema normalizer',
      desc: 'Razorpay PG · HDFC statement · Shopify orders → canonical model',
      badge: `${summary.total_records} records`, badgeColor: 'var(--rzp-blue)', icon: Database,
      glow: 'rgba(12, 102, 228, 0.15)', status: 'live' as const,
    },
    {
      id: 'layer1', step: '02', title: 'Layer 1 · Deterministic', agent: 'Rules R1.1–R1.5',
      desc: 'Exact three-way link with ±₹1 amount tolerance',
      badge: `${summary.auto_matched_count} matched`, badgeColor: 'var(--status-emerald)', icon: ShieldCheck,
      glow: 'rgba(5, 150, 105, 0.15)', status: 'live' as const,
    },
    {
      id: 'layer2', step: '03', title: 'Layer 2 · Fuzzy', agent: 'Rules R2.1–R2.4',
      desc: 'UTR-variant, split-payment & refund-netting recovery',
      badge: 'planned', badgeColor: 'var(--text-muted)', icon: Zap,
      glow: 'rgba(148, 163, 184, 0.12)', status: 'planned' as const,
    },
    {
      id: 'layer3', step: '04', title: 'Layer 3 · LLM triage', agent: 'Rule R3.1',
      desc: 'Root-cause diagnosis for the residual exceptions',
      badge: 'planned', badgeColor: 'var(--text-muted)', icon: Bot,
      glow: 'rgba(148, 163, 184, 0.12)', status: 'planned' as const,
    },
    {
      id: 'settle', step: '05', title: 'Audit trail & export', agent: 'Journal dispatcher',
      desc: 'Immutable per-decision audit log · ERP journal entries',
      badge: 'per-decision log', badgeColor: 'var(--status-emerald)', icon: Landmark,
      glow: 'rgba(5, 150, 105, 0.15)', status: 'live' as const,
    },
  ];

  return (
    <div style={{
      background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)',
      padding: '24px 28px', boxShadow: 'var(--shadow-card)', marginBottom: '28px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={16} style={{ color: 'var(--rzp-blue)' }} />
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Reconciliation pipeline
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Layered engine from multi-source ingestion to an auditable bank-verified ledger
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px',
          background: 'var(--status-emerald-bg)', border: '1px solid var(--status-emerald-border)',
          borderRadius: '999px', fontSize: '11px', fontWeight: 700, color: 'var(--status-emerald)',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-emerald)' }} />
          <span>Layer 1 live · Layers 2–3 planned</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        {nodes.map((node) => {
          const Icon = node.icon;
          const planned = node.status === 'planned';
          return (
            <div
              key={node.id}
              style={{
                background: planned ? 'var(--surface-canvas-subtle)' : '#f8fafc',
                border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)',
                padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                opacity: planned ? 0.72 : 1, transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-accent)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px ' + node.glow;
                e.currentTarget.style.background = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = planned ? 'var(--surface-canvas-subtle)' : '#f8fafc';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: 'var(--radius-md)', background: '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: node.badgeColor,
                    border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-subtle)',
                  }}>
                    <Icon size={16} />
                  </div>
                  <span className='tabular-mono' style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>
                    {node.step}
                  </span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.3' }}>
                  {node.title}
                </div>
                <div style={{ fontSize: '11px', color: planned ? 'var(--text-muted)' : 'var(--rzp-blue)', fontWeight: 600, marginTop: '2px' }}>
                  {node.agent}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: '1.4' }}>
                  {node.desc}
                </div>
              </div>

              <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className='tabular-mono' style={{ fontSize: '11px', fontWeight: 700, color: node.badgeColor }}>
                  {node.badge}
                </span>
                {planned
                  ? <Circle size={13} style={{ color: 'var(--text-disabled)' }} />
                  : <CheckCircle2 size={13} style={{ color: 'var(--status-emerald)' }} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
