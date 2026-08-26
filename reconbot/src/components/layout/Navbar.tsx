import React from 'react';
import { Search, RefreshCw, Layers } from 'lucide-react';
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
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      {/* Left: Active Batch Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: 'var(--surface-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-subtle)',
        }}>
          <Layers size={14} style={{ color: 'var(--rzp-blue)' }} />
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
            {DATASET_ORDER.map((key) => (
              <option key={key} value={key} style={{ background: '#ffffff', color: '#090d14' }}>
                {DATASET_META[key].label} · {DATASET_META[key].sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div style={{
        position: 'relative',
        width: '360px',
      }}>
        <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type='text'
          placeholder='Search payments, bank UTRs, orders, merchants...'
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
            e.currentTarget.style.borderColor = 'var(--rzp-blue)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(12, 102, 228, 0.12)';
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

      {/* Right: Modern Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Modern AI Copilot Trigger */}
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
            color: 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(124, 58, 237, 0.08)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--rzp-purple)';
            e.currentTarget.style.background = 'var(--rzp-purple-subtle)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--status-violet-border)';
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {/* Modern AI Sparkles Prism SVG */}
          <div style={{
            width: '18px',
            height: '18px',
            borderRadius: '5px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #0c66e4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width='11' height='11' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path d='M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z' fill='#ffffff'/>
            </svg>
          </div>
          <span style={{ fontWeight: 700 }}>AI Copilot</span>
        </button>

        <button
          onClick={onTriggerRun}
          disabled={isReconciling}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            background: isReconciling ? 'var(--surface-interactive)' : 'linear-gradient(180deg, #0c66e4 0%, #0052cc 100%)',
            border: '1px solid rgba(12, 102, 228, 0.5)',
            borderRadius: 'var(--radius-md)',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 700,
            cursor: isReconciling ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(12, 102, 228, 0.25)',
          }}
        >
          <RefreshCw size={13} style={{ animation: isReconciling ? 'spin 1s linear infinite' : 'none' }} />
          <span>{isReconciling ? 'Reconciling...' : 'Run 3-Way Reconcile'}</span>
        </button>
      </div>
    </header>
  );
}
