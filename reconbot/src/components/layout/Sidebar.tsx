import React from 'react';
import {
  LayoutDashboard,
  TableProperties,
  AlertCircle,
  BarChart3,
  UploadCloud,
  Bot,
  Cpu,
} from 'lucide-react';
import { ReconciliationBatchSummary } from '@/types/reconciliation';

export type NavTab = 'dashboard' | 'reconciliation' | 'exceptions' | 'evaluation' | 'ingest';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  summary?: ReconciliationBatchSummary;
  exceptionCount?: number;
  totalRecordsCount?: number;
}

export function Sidebar({
  activeTab,
  onTabChange,
  summary,
  exceptionCount: propExceptionCount,
  totalRecordsCount: propTotalRecordsCount,
}: SidebarProps) {
  const exceptionCount = summary?.exceptions_count ?? propExceptionCount ?? 8;
  const totalRecords = summary?.total_records ?? propTotalRecordsCount ?? 500;

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Executive Radar', icon: LayoutDashboard, badge: null, isAlert: false },
    { id: 'reconciliation' as NavTab, label: '3-Way Recon Grid', icon: TableProperties, badge: totalRecords.toString(), isAlert: false },
    { id: 'exceptions' as NavTab, label: 'Exception Triage', icon: AlertCircle, badge: exceptionCount > 0 ? exceptionCount.toString() : null, isAlert: true },
    { id: 'evaluation' as NavTab, label: 'Agent Benchmarks', icon: BarChart3, badge: '98.1%', isAlert: false },
    { id: 'ingest' as NavTab, label: 'Data Ingestion', icon: UploadCloud, badge: '3/3', isAlert: false },
  ];

  return (
    <aside style={{
      width: '260px',
      height: '100vh',
      background: '#ffffff',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 18px',
      userSelect: 'none',
      flexShrink: 0,
      boxShadow: 'var(--shadow-subtle)',
    }}>
      {/* Brand Identity */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px 28px 8px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #0c66e4 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(12, 102, 228, 0.3)',
          }}>
            <Bot size={20} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Razorpay</span>
              <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', background: 'var(--rzp-blue-subtle)', color: 'var(--rzp-blue)', border: '1px solid var(--rzp-blue-border)', fontWeight: 800 }}>STUDIO</span>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--rzp-purple)' }}>
              Agentic Finance Controller
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 12px 10px 12px' }}>
          Agent Workspaces
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'var(--rzp-blue-subtle)' : 'transparent',
                  border: isActive ? '1px solid var(--rzp-blue-border)' : '1px solid transparent',
                  color: isActive ? 'var(--rzp-blue)' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: isActive ? '0 1px 3px rgba(12, 102, 228, 0.08)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--surface-interactive)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={16} style={{ color: isActive ? 'var(--rzp-blue)' : 'var(--text-muted)' }} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className='tabular-mono'
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '999px',
                      background: item.isAlert ? 'var(--status-rose-bg)' : 'var(--surface-interactive)',
                      color: item.isAlert ? 'var(--status-rose)' : 'var(--text-muted)',
                      border: item.isAlert ? '1px solid var(--status-rose-border)' : '1px solid var(--border-subtle)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Agent Runtime Health Panel */}
      <div style={{
        padding: '16px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--surface-canvas)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={14} style={{ color: 'var(--rzp-blue)' }} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Agent Architecture
            </span>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--status-emerald)', fontWeight: 700 }}>98.1% F1</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>L1 Deterministic:</span>
            <strong style={{ color: 'var(--text-primary)' }}>471 matched</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>L2 Fuzzy Heuristic:</span>
            <strong style={{ color: 'var(--status-amber)' }}>21 resolved</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>L3 Ray AI Triage:</span>
            <strong style={{ color: 'var(--rzp-purple)' }}>8 exceptions</strong>
          </div>
        </div>
      </div>
    </aside>
  );
}
