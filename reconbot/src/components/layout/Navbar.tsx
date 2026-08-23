import React from 'react';
import { Search, Sparkles, RefreshCw, Layers, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentDataset: 'adversarial' | 'clean';
  onDatasetChange: (ds: 'adversarial' | 'clean') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCopilot: () => void;
  onTriggerRun: () => void;
  isReconciling: boolean;
}

export function Navbar({
  currentDataset,
  onDatasetChange,
  searchQuery,
  onSearchChange,
  onOpenCopilot,
  onTriggerRun,
  isReconciling,
}: NavbarProps) {
  return (
    <header style={{
      height: '64px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--glass-nav)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      {/* Left: Active Batch Context & Dataset Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          background: 'var(--surface-canvas)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}>
          <Layers size={14} style={{ color: 'var(--rzp-blue)' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Batch:</span>
          <select
            value={currentDataset}
            onChange={(e) => onDatasetChange(e.target.value as any)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value='adversarial' style={{ background: '#fff', color: '#090d14' }}>
              August 24 · Multi-Source Stress (500 txns)
            </option>
            <option value='clean' style={{ background: '#fff', color: '#090d14' }}>
              August 23 · Baseline Production (50 txns)
            </option>
          </select>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          background: 'var(--status-emerald-bg)',
          border: '1px solid var(--status-emerald-border)',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--status-emerald)',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-emerald)' }} />
          <span>Layer 1-3 Live Engine Active</span>
        </div>
      </div>

      {/* Center: Quick Search */}
      <div style={{
        position: 'relative',
        width: '340px',
      }}>
        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type='text'
          placeholder='Search payments, UTRs, orders, merchants (Press / to focus)'
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            height: '36px',
            background: 'var(--surface-canvas)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0 36px 0 34px',
            fontSize: '12px',
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'all 0.15s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--rzp-blue)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(12, 102, 228, 0.08)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        <span style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '10px',
          padding: '1px 5px',
          borderRadius: '4px',
          background: 'var(--surface-interactive)',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          border: '1px solid var(--border-subtle)',
        }}>
          /
        </span>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={onOpenCopilot}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            background: 'var(--surface-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: 600,
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
          <Sparkles size={14} style={{ color: 'var(--status-violet)' }} />
          <span>Ray AI Copilot</span>
        </button>

        <button
          onClick={onTriggerRun}
          disabled={isReconciling}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: isReconciling ? 'var(--text-muted)' : 'linear-gradient(180deg, #0c66e4 0%, #0052cc 100%)',
            border: '1px solid rgba(12, 102, 228, 0.4)',
            borderRadius: 'var(--radius-md)',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 700,
            cursor: isReconciling ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(12, 102, 228, 0.25)',
          }}
        >
          <RefreshCw size={13} style={{ animation: isReconciling ? 'spin 1s linear infinite' : 'none' }} />
          <span>{isReconciling ? 'Reconciling Stream...' : 'Run 3-Way Reconcile'}</span>
        </button>
      </div>
    </header>
  );
}
