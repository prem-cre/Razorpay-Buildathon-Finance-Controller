import React, { useState, useEffect } from 'react';
import { Terminal, Shield, CheckCircle2, AlertTriangle, ArrowRight, Bot, Cpu, Sparkles } from 'lucide-react';

interface TelemetryEvent {
  id: string;
  timestamp: string;
  layer: string;
  event: string;
  status: 'SUCCESS' | 'WARNING' | 'INFO';
  confidence: number;
}

const mockEvents: TelemetryEvent[] = [
  { id: '1', timestamp: '10:14:02.112', layer: 'L1: Deterministic', event: 'Rule R1.1 Exact 3-Way Match executed for pay_00001XkL9v7 (Shopify #1001 vs HDFC3513900001)', status: 'SUCCESS', confidence: 99.8 },
  { id: '2', timestamp: '10:14:02.128', layer: 'L1: Deterministic', event: 'Rule R1.1 Exact 3-Way Match executed for pay_00002XkL9v14 (Shopify #1002 vs HDFC3513900002)', status: 'SUCCESS', confidence: 99.7 },
  { id: '3', timestamp: '10:14:02.145', layer: 'L2: Fuzzy OCR', event: 'Rule R2.1 Fuzzy UTR prefix match (HDFC3513... vs HDFC-3513) resolved within 1 character distance', status: 'SUCCESS', confidence: 92.4 },
  { id: '4', timestamp: '10:14:02.162', layer: 'L1: Deterministic', event: 'Rule R1.5 MDR Fee tolerance evaluation: +2.40 rounding delta accepted under 5 threshold', status: 'WARNING', confidence: 88.5 },
  { id: '5', timestamp: '10:14:02.180', layer: 'L3: Ray AI', event: 'Rule R3.1 LLM Anomaly diagnosis: T+2 settlement clearing window detected. No accounting adjustment required.', status: 'INFO', confidence: 94.0 },
  { id: '6', timestamp: '10:14:02.195', layer: 'L3: Ray AI', event: 'Dispute Hold DISP_2026_8819 isolated to Suspense Ledger. Zero false-positive auto-post prevented.', status: 'WARNING', confidence: 86.2 },
];

export function TelemetryStream() {
  const [events, setEvents] = useState<TelemetryEvent[]>(mockEvents);

  useEffect(() => {
    const interval = setInterval(() => {
      const newEvt: TelemetryEvent = {
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }) + '.' + Math.floor(Math.random() * 900 + 100),
        layer: Math.random() > 0.4 ? 'L1: Deterministic' : 'L2: Fuzzy Match',
        event: 'Stream packet verified for order #' + Math.floor(Math.random() * 800 + 1000) + ' via HDFC Gateway pipeline',
        status: 'SUCCESS',
        confidence: Number((Math.random() * 2 + 98).toFixed(1)),
      };
      setEvents((prev) => [newEvt, ...prev.slice(0, 6)]);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: 'var(--dark-workspace)',
      border: '1px solid var(--dark-border)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px 28px',
      boxShadow: 'var(--shadow-dark-card)',
      color: '#ffffff',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Terminal size={14} style={{ color: '#ffffff' }} />
          </div>
          <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--dark-text-primary)' }}>
            Real-Time Engine Telemetry & Chain-of-Thought Stream
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--status-emerald)', fontWeight: 700 }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--status-emerald)', boxShadow: '0 0 6px var(--status-emerald)' }} />
          <span>WebSocket Stream Connected (0.4ms latency)</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {events.map((evt) => (
          <div
            key={evt.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--dark-surface)',
              border: '1px solid var(--dark-border)',
              fontSize: '12px',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
              <span className='tabular-mono' style={{ color: 'var(--dark-text-muted)', fontSize: '11px', fontWeight: 600 }}>
                {evt.timestamp}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(124, 58, 237, 0.2)',
                  color: '#c4b5fd',
                  fontFamily: 'var(--font-mono)',
                  border: '1px solid rgba(124, 58, 237, 0.4)',
                }}
              >
                {evt.layer}
              </span>
              <span style={{ color: 'var(--dark-text-secondary)', fontWeight: 500 }}>
                {evt.event}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className='tabular-mono' style={{ fontSize: '11px', color: 'var(--status-emerald)', fontWeight: 700 }}>
                {evt.confidence}% conf
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
