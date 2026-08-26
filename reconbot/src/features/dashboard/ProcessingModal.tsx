import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Clock, Terminal, Activity, Bot, Cpu, Sparkles } from 'lucide-react';

interface ProcessingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function ProcessingModal({ isOpen, onComplete }: ProcessingModalProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [recordCount, setRecordCount] = useState(0);

  const stages = [
    { label: '01. Multi-Source Ingestion & Schema Normalization', count: '500 records parsed', detail: 'Shopify CSV + Razorpay PG Webhooks + HDFC MT940 statement streams' },
    { label: '02. Layer 1: Deterministic 3-Way Checksum Engine', count: '471 records exact matched', detail: 'Rules R1.1 to R1.5 evaluated at 0.4ms/record' },
    { label: '03. Layer 2: Fuzzy & OCR Heuristic Resolver', count: '21 records resolved', detail: 'Rules R2.1 to R2.4 Levenshtein distance <= 2' },
    { label: '04. Layer 3: Ray AI Forensic Anomaly Triage', count: '8 exceptions isolated', detail: 'Zero false-positive threshold enforcement' },
    { label: '05. Cryptographic Ledger Finalization', count: 'Immutable hash verified', detail: 'Sha256 decision hashes emitted to journal' },
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
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      zIndex: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '580px',
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-elevated)',
        padding: '32px',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #0c66e4 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(12, 102, 228, 0.3)',
            }}>
              <Activity size={20} className='agent-pulse' />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Razorpay Agent Studio Pipeline
              </div>
              <div style={{ fontSize: '12px', color: 'var(--rzp-blue)', fontWeight: 600 }}>
                Live Autonomous Stream Execution (5 Stages)
              </div>
            </div>
          </div>
          <div className='tabular-mono' style={{ fontSize: '14px', fontWeight: 800, color: 'var(--rzp-blue)', background: 'var(--rzp-blue-subtle)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--rzp-blue-border)' }}>
            {recordCount} / 500 records
          </div>
        </div>

        {/* Stages Stepper */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
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
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isCurrent ? 'var(--rzp-blue-subtle)' : '#f8fafc',
                  border: isCurrent ? '1px solid var(--rzp-blue-border)' : '1px solid var(--border-subtle)',
                  boxShadow: isCurrent ? '0 1px 3px rgba(12, 102, 228, 0.08)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ marginTop: '2px' }}>
                  {isDone ? (
                    <CheckCircle2 size={16} style={{ color: 'var(--status-emerald)' }} />
                  ) : isCurrent ? (
                    <div style={{
                      width: '15px',
                      height: '15px',
                      borderRadius: '50%',
                      border: '2px solid var(--rzp-blue)',
                      borderTopColor: 'transparent',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                  ) : (
                    <div style={{ width: '15px', height: '15px', borderRadius: '50%', border: '1px solid var(--border-strong)' }} />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: isCurrent || isDone ? 700 : 500,
                      color: isDone ? 'var(--text-primary)' : isCurrent ? 'var(--rzp-blue)' : 'var(--text-muted)',
                    }}>
                      {stage.label}
                    </span>
                    {isDone && (
                      <span className='tabular-mono' style={{ fontSize: '11px', color: 'var(--status-emerald)', fontWeight: 700 }}>
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

        {/* Footer info */}
        <div style={{
          padding: '12px 16px',
          background: '#f8fafc',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Terminal size={13} style={{ color: 'var(--rzp-blue)' }} /> Zero-tolerance precision gate active
          </span>
          <span className='tabular-mono' style={{ color: 'var(--status-emerald)', fontWeight: 700 }}>Precision target: 98.1%</span>
        </div>
      </div>
    </div>
  );
}
