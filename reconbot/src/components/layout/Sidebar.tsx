import React from 'react';
import {
  LayoutDashboard,
  TableProperties,
  AlertCircle,
  BarChart3,
  UploadCloud,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'reconciliation' | 'exceptions' | 'evaluation' | 'ingest';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  exceptionCount: number;
  totalRecordsCount: number;
}

export function Sidebar({ activeTab, onTabChange, exceptionCount, totalRecordsCount }: SidebarProps) {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Executive Radar', icon: LayoutDashboard, badge: null },
    { id: 'reconciliation' as NavTab, label: '3-Way Recon Grid', icon: TableProperties, badge: totalRecordsCount.toString() },
    { id: 'exceptions' as NavTab, label: 'Exception Queue', icon: AlertCircle, badge: exceptionCount > 0 ? exceptionCount.toString() : null, isAlert: true },
    { id: 'evaluation' as NavTab, label: 'Model Benchmarks', icon: BarChart3, badge: '98.1%' },
    { id: 'ingest' as NavTab, label: 'Data Ingestion', icon: UploadCloud, badge: '3/3' },
  ];

  return (
    <aside style={{
      width: '240px',
      height: '100vh',
      background: 'var(--surface-primary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px 16px',
      userSelect: 'none',
      flexShrink: 0,
    }}>
      {/* Brand Identity */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px 24px 8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #0c66e4 0%, #0052cc 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(12, 102, 228, 0.3)',
          }}>
            <Zap size={18} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              RazorpayX
            </div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--rzp-blue)' }}>
              Finance Controller AI
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'var(--rzp-blue-subtle)' : 'transparent',
                  border: isActive ? '1px solid var(--rzp-blue-border)' : '1px solid transparent',
                  color: isActive ? 'var(--rzp-blue)' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
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

      {/* Engine Status Footer */}
      <div style={{
        padding: '14px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--surface-canvas)',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <ShieldCheck size={16} style={{ color: 'var(--status-emerald)' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Engine Integrity</span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Deterministic layer: <strong>100% precision</strong>. Zero-hallucination boundary.
        </div>
      </div>
    </aside>
  );
}
