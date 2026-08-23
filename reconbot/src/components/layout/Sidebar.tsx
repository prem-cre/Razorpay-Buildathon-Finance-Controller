import React from 'react';
import { LayoutDashboard, TableProperties, AlertOctagon, Award, UploadCloud } from 'lucide-react';

export type NavTab = 'dashboard' | 'reconciliation' | 'exceptions' | 'evaluation' | 'ingest';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  exceptionCount: number;
  totalRecordsCount: number;
}

export function Sidebar({ activeTab, onTabChange, exceptionCount, totalRecordsCount }: SidebarProps) {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number | string; alert?: boolean }[] = [
    { id: 'dashboard', label: 'Executive Radar', icon: <LayoutDashboard size={15} /> },
    { id: 'reconciliation', label: '3-Way Recon Grid', icon: <TableProperties size={15} />, badge: totalRecordsCount },
    { id: 'exceptions', label: 'Exception Queue', icon: <AlertOctagon size={15} />, badge: exceptionCount, alert: exceptionCount > 0 },
    { id: 'evaluation', label: 'Precision & Metrics', icon: <Award size={15} />, badge: '98.1%' },
    { id: 'ingest', label: 'Ingestion Pipeline', icon: <UploadCloud size={15} /> },
  ];

  return (
    <aside style={{
      width: '240px',
      background: 'var(--surface-primary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      flexShrink: 0,
      zIndex: 20,
    }}>
      <div>
        <div style={{
          padding: '18px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            background: 'linear-gradient(135deg, #0c66e4, #3b82f6)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '14px',
            boxShadow: '0 2px 6px rgba(12, 102, 228, 0.4)',
          }}>
            R
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
              RazorpayX Controller
            </div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--rzp-blue)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              LedgerLens Engine
            </div>
          </div>
        </div>

        <nav style={{ padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', padding: '6px 10px', fontWeight: 600 }}>
            Reconciliation Engine
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--rzp-blue)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--rzp-blue-subtle)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  width: '100%',
                }}
              >
                <span style={{ color: isActive ? 'var(--rzp-blue)' : 'var(--text-muted)' }}>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className='tabular-mono'
                    style={{
                      marginLeft: 'auto',
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: '999px',
                      fontWeight: 600,
                      background: item.alert ? 'var(--status-rose-bg)' : 'var(--surface-elevated)',
                      color: item.alert ? 'var(--status-rose)' : 'var(--text-muted)',
                      border: item.alert ? '1px solid var(--status-rose-border)' : '1px solid var(--border-subtle)',
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

      <div style={{ padding: '14px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{
          background: 'var(--surface-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-emerald)' }} />
              <span>Engine Status</span>
            </div>
            <span style={{ color: 'var(--status-emerald)' }} className='tabular-mono'>Layer 1-3 Active</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
            <span>Precision Gate</span>
            <span className='tabular-mono' style={{ color: 'var(--text-primary)' }}>&gt; 95.0% Pass</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
