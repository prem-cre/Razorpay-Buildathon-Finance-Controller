import React from 'react';
import { Search, Sparkles, RefreshCw, Layers, ShieldCheck, Activity, Cpu, Bot, Zap } from 'lucide-react';
import { DatasetName, DATASET_META, DATASET_ORDER } from '@/lib/engineData';

interface NavbarProps {
  currentDataset: DatasetName;
  onDatasetChange: (ds: DatasetName) => void;
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
      height: '68px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--glass-nav)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      {/* Left: Active Batch Context & Agent Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: '#ffffff',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-subtle)',
        }}>
          <Layers size={14} style={{ color: 'var(--rzp-purple)' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Batch:</span>
          <select
            value={currentDataset}
            onChange={(e) => onDatasetChange(e.target.value as DatasetName)}
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
            {DATASET_ORDER.map((name) => (
              <option key={name} value={name} style={{ background: '#ffffff', color: '#090d14' }}>
                {DATASET_META[name].label}
              </option>
            ))}
          </select>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 12px',
          background: 'var(--status-emerald-bg)',
          border: '1px solid var(--status-emerald-border)',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--status-emerald)',
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: 'var(--status-emerald)',
            boxShadow: '0 0 6px rgba(5, 150, 105, 0.5)',
            animation: 'pulseGlow 2s infinite',
          }} />
          <span>Agent Studio Engine Online (0.4ms)</span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div style={{
        position: 'relative',
        width: '380px',
      }}>
        <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type='text'
          placeholder='Search payments, bank UTRs, order numbers, merchants...'
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            height: '38px',
            background: '#ffffff',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0 38px 0 38px',
            fontSize: '12px',
            color: 'var(--text-primary)',
            outline: 'none',
            boxShadow: 'var(--shadow-subtle)',
            transition: 'all 0.15s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--rzp-purple)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.12)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.boxShadow = 'var(--shadow-subtle)';
          }}
        />
        <span style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '10px',
          padding: '2px 6px',
          borderRadius: '4px',
          background: 'var(--surface-interactive)',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          border: '1px solid var(--border-subtle)',
        }}>
          /
        </span>
      </div>

      {/* Right: Studio Agent Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onOpenCopilot}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#ffffff',
            border: '1px solid var(--status-violet-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--rzp-purple)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(124, 58, 237, 0.08)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--rzp-purple)';
            e.currentTarget.style.background = 'var(--rzp-purple-subtle)';
            e.currentTarget.style.boxShadow = '0 0 16px rgba(124, 58, 237, 0.18)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--status-violet-border)';
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(124, 58, 237, 0.08)';
          }}
        >
          <Sparkles size={14} style={{ color: 'var(--rzp-purple)' }} />
          <span>Ray AI Copilot</span>
        </button>

        <button
          onClick={onTriggerRun}
          disabled={isReconciling}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            background: isReconciling ? 'var(--surface-interactive)' : 'linear-gradient(135deg, #7c3aed 0%, #0c66e4 100%)',
            border: '1px solid rgba(124, 58, 237, 0.4)',
            borderRadius: 'var(--radius-md)',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 700,
            cursor: isReconciling ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 10px rgba(124, 58, 237, 0.3)',
          }}
        >
          <RefreshCw size={13} style={{ animation: isReconciling ? 'spin 1s linear infinite' : 'none' }} />
          <span>{isReconciling ? 'Reconciling Agents...' : 'Run 3-Way Reconcile'}</span>
        </button>
      </div>
    </header>
  );
}
