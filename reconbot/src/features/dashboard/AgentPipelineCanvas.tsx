import React from 'react';
import { Database, ShieldCheck, Zap, Bot, FileCheck2, CheckCircle2, Cpu, Circle } from 'lucide-react';
import { ReconciliationBatchSummary } from '@/types/reconciliation';

interface AgentPipelineCanvasProps {
  summary: ReconciliationBatchSummary;
}

/**
 * Engine architecture. Layers 1 and 2 are built and report real counts from the
 * current batch; Layer 3 is not built yet and is labelled `planned` rather than
 * shown as if it ran.
 */
export function AgentPipelineCanvas({ summary }: AgentPipelineCanvasProps) {
  const nodes = [
    {
      id: 'ingest', step: '01', title: 'Ingestion', agent: 'Schema normalizer',
      desc: 'Gateway settlements, bank statement and order export into one canonical model (paise, UTC)',
      badge: summary.total_records + ' records', color: 'var(--rzp-blue)', icon: Database, live: true,
    },
    {
      id: 'layer1', step: '02', title: 'Layer 1 · Deterministic', agent: 'Rules R1.1–R1.5',
      desc: 'Exact three-way link, ±₹1 tolerance. Stops at the first rule that fires.',
      badge: summary.auto_matched_count + ' exact', color: 'var(--status-emerald)', icon: ShieldCheck, live: true,
    },
    {
      id: 'layer2', step: '03', title: 'Layer 2 · Recovery', agent: 'Rules R2.1–R2.4',
      desc: 'Fuzzy UTR, split payments and refund netting release batches Layer 1 held back.',
      badge: summary.fuzzy_matched_count + ' recovered', color: 'var(--rzp-blue)', icon: Zap, live: true,
    },
    {
      id: 'layer3', step: '04', title: 'Layer 3 · Triage', agent: 'Rule R3.1',
      desc: 'Root-cause diagnosis for chargebacks, duplicates and true unknowns.',
      badge: 'planned', color: 'var(--text-muted)', icon: Bot, live: false,
    },
    {
      id: 'audit', step: '05', title: 'Audit & export', agent: 'Decision log',
      desc: 'One immutable record per decision, with the evidence that produced it.',
      badge: 'per decision', color: 'var(--status-emerald)', icon: FileCheck2, live: true,
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
              How the engine reaches a decision
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Each layer only sees what the previous one could not resolve — and never overturns it
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px',
          background: 'var(--status-emerald-bg)', border: '1px solid var(--status-emerald-border)',
          borderRadius: '999px', fontSize: '11px', fontWeight: 700, color: 'var(--status-emerald)',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-emerald)' }} />
          <span>Layers 1–2 live · Layer 3 planned</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        {nodes.map((node) => {
          const Icon = node.icon;
          return (
            <div
              key={node.id}
              style={{
                background: node.live ? '#f8fafc' : 'var(--surface-canvas-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                opacity: node.live ? 1 : 0.66,
                transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-accent)';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-elevated)';
                e.currentTarget.style.background = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = node.live ? '#f8fafc' : 'var(--surface-canvas-subtle)';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: 'var(--radius-md)', background: '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: node.color,
                    border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-subtle)',
                  }}>
                    <Icon size={16} />
                  </div>
                  <span className='tabular-mono' style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-disabled)' }}>
                    {node.step}
                  </span>
                </div>

                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {node.title}
                </div>
                <div className='tabular-mono' style={{ fontSize: '10px', color: node.live ? 'var(--rzp-blue)' : 'var(--text-muted)', fontWeight: 600, marginTop: '3px' }}>
                  {node.agent}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.45 }}>
                  {node.desc}
                </div>
              </div>

              <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className='tabular-mono' style={{ fontSize: '11px', fontWeight: 700, color: node.color }}>
                  {node.badge}
                </span>
                {node.live
                  ? <CheckCircle2 size={13} style={{ color: 'var(--status-emerald)' }} />
                  : <Circle size={13} style={{ color: 'var(--text-disabled)' }} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
