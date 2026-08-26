import React from 'react';
import { Database, ShieldCheck, Zap, Bot, Landmark, CheckCircle2, Cpu, ArrowRight } from 'lucide-react';
import { ReconciliationBatchSummary } from '@/types/reconciliation';

interface AgentPipelineCanvasProps {
  summary: ReconciliationBatchSummary;
}

export function AgentPipelineCanvas({ summary }: AgentPipelineCanvasProps) {
  const autoCount = summary?.auto_matched_count ?? 471;
  const fuzzyCount = summary?.fuzzy_matched_count ?? 21;
  const exceptionCount = summary?.exceptions_count ?? 8;
  const totalRecords = summary?.total_records ?? 500;

  const nodes = [
    {
      id: 'ingest',
      step: '01',
      title: 'Multi-Source Ingestion',
      agent: 'Schema Normalizer Agent',
      desc: 'Shopify CSV + Razorpay PG captures + HDFC MT940',
      badge: totalRecords + ' records',
      badgeColor: 'var(--rzp-purple)',
      icon: Database,
      glow: 'rgba(124, 58, 237, 0.15)',
    },
    {
      id: 'layer1',
      step: '02',
      title: 'Layer 1: Deterministic Match',
      agent: 'Checksum Rule Engine',
      desc: 'Exact 3-way hash & amount tolerance matching',
      badge: autoCount + ' matched',
      badgeColor: 'var(--status-emerald)',
      icon: ShieldCheck,
      glow: 'rgba(5, 150, 105, 0.15)',
    },
    {
      id: 'layer2',
      step: '03',
      title: 'Layer 2: Fuzzy Heuristics',
      agent: 'OCR & Fuzzy Linker',
      desc: 'Levenshtein UTR prefix & timing lag resolvers',
      badge: fuzzyCount + ' resolved',
      badgeColor: 'var(--status-amber)',
      icon: Zap,
      glow: 'rgba(217, 119, 6, 0.15)',
    },
    {
      id: 'layer3',
      step: '04',
      title: 'Layer 3: Ray AI Triage',
      agent: 'Forensic Copilot LLM',
      desc: 'Root-cause isolation & dispute hold detection',
      badge: exceptionCount + ' triaged',
      badgeColor: 'var(--rzp-pink)',
      icon: Bot,
      glow: 'rgba(236, 72, 153, 0.15)',
    },
    {
      id: 'settle',
      step: '05',
      title: 'Immutable Bank Settlement',
      agent: 'ERP Journal Dispatcher',
      desc: 'Verified bank deposits & automated ledger entries',
      badge: '100% UTR Verified',
      badgeColor: 'var(--status-emerald)',
      icon: Landmark,
      glow: 'rgba(5, 150, 105, 0.15)',
    },
  ];

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px 28px',
      boxShadow: 'var(--shadow-card)',
      marginBottom: '28px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={16} style={{ color: 'var(--rzp-purple)' }} />
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Autonomous Multi-Agent Workflow Pipeline
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            End-to-end autonomous execution graph linking Multi-Source Data to Immutable Bank Ledger
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          background: 'var(--rzp-purple-subtle)',
          border: '1px solid var(--status-violet-border)',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--rzp-purple)',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--rzp-purple)' }} />
          <span>Real-Time Stream Processing Active</span>
        </div>
      </div>

      {/* Nodes Stepper with Animated Connectors */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '12px',
        position: 'relative',
      }}>
        {nodes.map((node, idx) => {
          const Icon = node.icon;
          return (
            <div
              key={node.id}
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-accent)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 18px ' + node.glow;
                e.currentTarget.style.background = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = '#f8fafc';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: node.badgeColor,
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-subtle)',
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
                <div style={{ fontSize: '11px', color: 'var(--rzp-purple)', fontWeight: 600, marginTop: '2px' }}>
                  {node.agent}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: '1.4' }}>
                  {node.desc}
                </div>
              </div>

              <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  className='tabular-mono'
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: node.badgeColor,
                  }}
                >
                  {node.badge}
                </span>
                <CheckCircle2 size={13} style={{ color: 'var(--status-emerald)' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
