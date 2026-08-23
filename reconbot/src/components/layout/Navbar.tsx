import React from 'react';
import { Search, Sparkles, Terminal, Activity } from 'lucide-react';

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
      height: '60px',
      padding: '0 24px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--surface-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--surface-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          padding: '4px 10px',
          fontSize: '12px',
        }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Active Batch:</span>
          <select
            value={currentDataset}
            onChange={(e) => onDatasetChange(e.target.value as any)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '12px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value='adversarial' style={{ background: '#0d111a', color: '#fff' }}>Batch_2026_08 - Adversarial Stress Test (500 records)</option>
            <option value='clean' style={{ background: '#0d111a', color: '#fff' }}>Batch_2026_08_Clean - Baseline (50 records)</option>
          </select>
        </div>

        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder='Search by Payment ID, UTR, Order, Amount...'
            style={{
              width: '100%',
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 30px 6px 32px',
              fontSize: '12px',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onOpenCopilot}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--rzp-blue-subtle)',
            border: '1px solid var(--border-accent)',
            color: 'var(--rzp-blue)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Sparkles size={13} />
          Ray AI Copilot
        </button>

        <button
          onClick={onTriggerRun}
          disabled={isReconciling}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--rzp-blue)',
            color: '#ffffff',
            border: 'none',
            padding: '7px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: isReconciling ? 'not-allowed' : 'pointer',
            opacity: isReconciling ? 0.8 : 1,
            boxShadow: '0 2px 8px rgba(12, 102, 228, 0.35)',
          }}
        >
          {isReconciling ? (
            <>
              <Activity size={13} style={{ animation: 'spin 1s linear infinite' }} />
              Reconciling Engine...
            </>
          ) : (
            <>
              <Terminal size={13} />
              Run 3-Way Reconcile
            </>
          )}
        </button>
      </div>
    </header>
  );
}
