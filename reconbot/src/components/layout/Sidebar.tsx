import React from 'react';
import {
  LayoutDashboard,
  TableProperties,
  AlertCircle,
  BarChart3,
  UploadCloud,
} from 'lucide-react';
import { ReconciliationBatchSummary } from '@/types/reconciliation';

export type NavTab = 'dashboard' | 'reconciliation' | 'exceptions' | 'evaluation' | 'ingest';

export interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  summary?: ReconciliationBatchSummary;
  exceptionCount?: number;
  totalRecordsCount?: number;
}

export function Sidebar({ activeTab, onTabChange, summary, exceptionCount: expCountProp, totalRecordsCount: totalRecProp }: SidebarProps) {
  const exceptionCount = summary?.exceptions_count ?? expCountProp ?? 0;
  const totalRecords = summary?.total_records ?? totalRecProp ?? 0;

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Executive Radar', icon: LayoutDashboard, badge: null, isAlert: false },
    { id: 'reconciliation' as NavTab, label: '3-Way Recon Grid', icon: TableProperties, badge: totalRecords > 0 ? totalRecords.toString() : null, isAlert: false },
    { id: 'exceptions' as NavTab, label: 'Exception Triage', icon: AlertCircle, badge: exceptionCount > 0 ? exceptionCount.toString() : null, isAlert: true },
    { id: 'evaluation' as NavTab, label: 'Agent Benchmarks', icon: BarChart3, badge: summary?.evaluation ? summary.evaluation.precision_pct + '%' : '100%', isAlert: false },
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
      {/* Brand Identity with Modern Geometric Fintech Logo */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px 28px 8px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0c66e4 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(12, 102, 228, 0.25)',
          }}>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path d='M12 2L2 7L12 12L22 7L12 2Z' stroke='#ffffff' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
              <path d='M2 17L12 22L22 17' stroke='#ffffff' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' opacity='0.85'/>
              <path d='M2 12L12 17L22 12' stroke='#ffffff' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' opacity='0.6'/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
              Finance Controller
            </div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '2px' }}>
              Autonomous 3-Way Engine
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 12px 10px 12px' }}>
          Workspaces
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

      {/* Bottom Minimal Status */}
      <div style={{
        padding: '10px 12px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-interactive)',
        border: '1px solid var(--border-subtle)',
        fontSize: '11px',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-emerald)' }} />
          Status: <strong style={{ color: 'var(--status-emerald)' }}>Active</strong>
        </span>
        <span className='tabular-mono' style={{ fontWeight: 700 }}>v3.2</span>
      </div>
    </aside>
  );
}
