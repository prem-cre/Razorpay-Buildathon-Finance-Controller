import React from 'react';
import { Terminal } from 'lucide-react';

export function TelemetryStream() {
  const logs = [
    { time: '10:15:22.104', layer: 'L1-DET', text: 'Rule R1.1 verified 471 exact 3-way records. Zero amount delta.', status: 'success' },
    { time: '10:15:22.388', layer: 'L1-DET', text: 'Rule R1.5 computed MDR & GST deductions on corporate card transactions.', status: 'info' },
    { time: '10:15:22.512', layer: 'L2-FUZ', text: 'Rule R2.1 normalized UTR prefix variants (Levenshtein distance <= 2).', status: 'info' },
    { time: '10:15:22.840', layer: 'L3-LLM', text: 'LLM diagnosed 3 timing gaps (T+2 window) and 2 chargeback reserve holds.', status: 'warning' },
    { time: '10:15:22.910', layer: 'L3-ESC', text: 'Honest escalation: Record pay_00052 flagged as True Unknown (variance: ₹17,000).', status: 'escalate' },
  ];

  return (
    <div style={{
      background: 'var(--surface-elevated)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
          <Terminal size={14} style={{ color: 'var(--rzp-blue)' }} />
          <span>Autonomous Engine Execution Telemetry (CoT Decision Stream)</span>
        </div>
        <span style={{ fontSize: '10px', color: 'var(--status-emerald)', fontFamily: 'var(--font-mono)' }}>
          LIVE AUDIT LOG
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
        {logs.map((log, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <span style={{ color: 'var(--text-muted)' }}>{log.time}</span>
            <span style={{
              background: 'var(--surface-interactive)',
              padding: '1px 6px',
              borderRadius: '3px',
              fontSize: '10px',
              fontWeight: 600,
              color: log.status === 'success' ? 'var(--status-emerald)' : log.status === 'warning' ? 'var(--status-amber)' : log.status === 'escalate' ? 'var(--status-rose)' : 'var(--rzp-blue)'
            }}>
              {log.layer}
            </span>
            <span style={{ color: log.status === 'escalate' ? 'var(--status-rose)' : 'var(--text-primary)' }}>
              {log.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
