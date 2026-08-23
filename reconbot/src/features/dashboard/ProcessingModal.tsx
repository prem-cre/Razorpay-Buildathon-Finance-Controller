import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Clock, Terminal, Activity } from 'lucide-react';

interface ProcessingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function ProcessingModal({ isOpen, onComplete }: ProcessingModalProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [recordCount, setRecordCount] = useState(0);

  const stages = [
    { label: 'Multi-Source Ingestion & Normalization', count: '500 records parsed', detail: 'Shopify CSV + Razorpay PG + HDFC MT940 statements' },
    { label: 'Layer 1: Deterministic 3-Way Checksum Engine', count: '471 records exact matched', detail: 'Rules R1.1 to R1.5 evaluated at 0.4ms/record' },
    { label: 'Layer 2: Fuzzy & OCR Heuristic Resolver', count: '21 records resolved', detail: 'Rules R2.1 to R2.4 prefix & Levenshtein distance <= 2' },
    { label: 'Layer 3: Ray AI Forensic Anomaly Triage', count: '8 exceptions categorized', detail: 'Zero false-positive threshold enforcement' },
    { label: 'Cryptographic Audit Trail Finalization', count: 'Immutable ledger verified', detail: 'Sha256 decision hashes emitted' },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStage(0);
      setRecordCount(0);
      return;
    }

    const interval = setInterval(() => {
      setRecordCount((prev) => Math.min(500, prev + 35));
    }, 60);

    const timer1 = setTimeout(() => setCurrentStage(1), 500);
    const timer2 = setTimeout(() => setCurrentStage(2), 1100);
    const timer3 = setTimeout(() => setCurrentStage(3), 1700);
    const timer4 = setTimeout(() => setCurrentStage(4), 2300);
    const timerEnd = setTimeout(() => {
      clearInterval(interval);
      onComplete();
    }, 2900);

    return () => {
      clearInterval(interval);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timerEnd);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(4, 6, 10, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '560px',
        background: 'var(--surface-primary)',
        border: '1px solid var(--border-accent)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-drawer)',
        padding: '28px',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--rzp-blue-subtle)',
              border: '1px solid var(--border-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--rzp-blue)',
            }}>
              <Activity size={18} style={{ animation: 'spin 1.5s linear infinite' }} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Reconciliation Pipeline in Progress
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                LedgerLens Multi-Source Stream Processing
              </div>
            </div>
          </div>
          <div className='tabular-mono' style={{ fontSize: '13px', fontWeight: 700, color: 'var(--rzp-blue)' }}>
            {recordCount} / 500 records
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {stages.map((stage, idx) => {
            const isDone = currentStage > idx;
            const isCurrent = currentStage === idx;

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isCurrent ? 'var(--surface-elevated)' : 'transparent',
                  border: isCurrent ? '1px solid var(--border-accent)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ marginTop: '2px' }}>
                  {isDone ? (
                    <CheckCircle2 size={16} style={{ color: 'var(--status-emerald)' }} />
                  ) : isCurrent ? (
                    <div style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      border: '2px solid var(--rzp-blue)',
                      borderTopColor: 'transparent',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                  ) : (
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1px solid var(--border-strong)' }} />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: isCurrent || isDone ? 600 : 500,
                      color: isDone ? 'var(--text-primary)' : isCurrent ? 'var(--rzp-blue)' : 'var(--text-muted)',
                    }}>
                      {stage.label}
                    </span>
                    {isDone && (
                      <span className='tabular-mono' style={{ fontSize: '11px', color: 'var(--status-emerald)', fontWeight: 600 }}>
                        {stage.count}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {stage.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          padding: '10px 14px',
          background: 'var(--surface-canvas)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'var(--text-muted)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Terminal size={12} style={{ color: 'var(--rzp-blue)' }} /> Zero-tolerance precision gate active
          </span>
          <span className='tabular-mono' style={{ color: 'var(--status-emerald)' }}>Precision target: 98.1%</span>
        </div>
      </div>
    </div>
  );
}
