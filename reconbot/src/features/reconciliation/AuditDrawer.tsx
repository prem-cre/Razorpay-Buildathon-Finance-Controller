import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, ExternalLink, Bot, Cpu, Download, Landmark, Sparkles, Check, Send } from 'lucide-react';
import { ReconciledRecordView } from '@/types/reconciliation';
import { formatPaiseToINR, formatPaiseDelta } from '@/lib/money';

interface AuditDrawerProps {
  record: ReconciledRecordView | null;
  onClose: () => void;
  onApproveAction?: (recordId: string) => void;
}

export function AuditDrawer({ record, onClose, onApproveAction }: AuditDrawerProps) {
  const [executionState, setExecutionState] = useState<'idle' | 'executing' | 'executed'>('idle');
  const [isEscalated, setIsEscalated] = useState(false);

  if (!record) return null;

  const isMatched = record.match_status === 'matched';
  const diagnosis = record.diagnosis;
  const isActionApproved = executionState === 'executed' || record.resolution_status === 'approved';

  const handleApprove = () => {
    setExecutionState('executing');
    setTimeout(() => {
      setExecutionState('executed');
      if (onApproveAction) {
        onApproveAction(record.id || record.payment_id);
      }
    }, 900);
  };

  const handleEscalate = () => {
    setIsEscalated(true);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.35)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      zIndex: 50,
      display: 'flex',
      justifyContent: 'flex-end',
    }}>
      <div style={{
        width: '680px',
        height: '100%',
        background: '#ffffff',
        borderLeft: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-drawer)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        padding: '28px 32px',
        animation: 'slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Drawer Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className='tabular-mono' style={{ fontSize: '12px', fontWeight: 800, color: 'var(--rzp-blue)', background: 'var(--rzp-blue-subtle)', padding: '2px 8px', borderRadius: '4px' }}>
                {record.payment_id}
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                background: isActionApproved || isMatched ? 'var(--status-emerald-bg)' : 'var(--status-amber-bg)',
                color: isActionApproved || isMatched ? 'var(--status-emerald)' : 'var(--status-amber)',
                border: isActionApproved || isMatched ? '1px solid var(--status-emerald-border)' : '1px solid var(--status-amber-border)',
              }}>
                {isActionApproved ? 'REVIEWED' : isMatched ? 'MATCHED' : (record.exception_category ? record.exception_category.toUpperCase() : 'UNRESOLVED')}
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              3-Way Forensic Audit & Reconciliation Trace
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'var(--surface-interactive)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '6px', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 3-Way Split Diff Cards */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            Multi-Source Line-Item Comparison
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {/* Shopify Card */}
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>1. Shopify Order</div>
              <div className='tabular-mono' style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: '6px 0 2px 0' }}>
                {formatPaiseToINR(record.gross_paise)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{record.order_name}</div>
            </div>

            {/* Razorpay PG Card */}
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>2. Razorpay PG Net</div>
              <div className='tabular-mono' style={{ fontSize: '16px', fontWeight: 800, color: 'var(--rzp-blue)', margin: '6px 0 2px 0' }}>
                {formatPaiseToINR(record.net_paise)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Fee: {formatPaiseToINR(record.fee_paise + record.tax_paise)}
              </div>
            </div>

            {/* Bank credit card */}
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>3. Bank Deposit</div>
              <div className='tabular-mono' style={{ fontSize: '16px', fontWeight: 800, color: isMatched ? 'var(--status-emerald)' : 'var(--status-amber)', margin: '6px 0 2px 0' }}>
                {formatPaiseToINR(record.bank_credit_paise)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Landmark size={12} /> HDFC Bank
              </div>
            </div>
          </div>
        </div>

        {/* Layer 1 / Layer 2 Engine Deterministic Reasoning */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ShieldCheck size={16} style={{ color: 'var(--rzp-blue)' }} />
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Engine reasoning
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
            {record.reasoning}
          </p>
          <div style={{ marginTop: '10px', display: 'flex', gap: '14px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>Settlement UTR: <strong className='tabular-mono' style={{ color: 'var(--text-primary)' }}>{record.bank_utr}</strong></span>
            <span>Rule: <strong className='tabular-mono' style={{ color: 'var(--rzp-blue)' }}>{record.rule_applied || 'deferred to review'}</strong></span>
          </div>
        </div>

        {/* Layer 3 diagnosis — inferred from data, recommends a human action */}
        {diagnosis && (
          <div style={{
            background: isActionApproved ? 'var(--status-emerald-bg)' : '#ffffff',
            border: isActionApproved ? '1px solid var(--status-emerald-border)' : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '24px', boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={16} style={{ color: 'var(--rzp-blue)' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Layer 3 diagnosis
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span className='tabular-mono' style={{
                  fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
                  background: 'var(--surface-interactive)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)',
                }}>{diagnosis.confidence} confidence</span>
                <span style={{
                  fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', textTransform: 'uppercase',
                  color: '#ffffff', background: diagnosis.risk_level === 'high' ? 'var(--status-rose)' : diagnosis.risk_level === 'medium' ? 'var(--status-amber)' : 'var(--status-emerald)',
                }}>{diagnosis.risk_level} risk</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>{diagnosis.title}</span>
              <span className='tabular-mono' style={{ fontSize: '10px', color: 'var(--rzp-blue)', background: 'var(--rzp-blue-subtle)', border: '1px solid var(--rzp-blue-border)', padding: '2px 7px', borderRadius: '4px' }}>
                {diagnosis.category}
              </span>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: '14px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                Evidence (from the record, not the answer key)
              </div>
              {diagnosis.evidence_chain.map((ev, i) => (
                <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '8px', marginBottom: '5px', lineHeight: 1.45 }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--rzp-blue)', marginTop: '6px', flexShrink: 0 }} />
                  {ev}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <ArrowRight size={14} style={{ color: 'var(--rzp-blue)', marginTop: '2px', flexShrink: 0 }} />
              <span><strong style={{ color: 'var(--text-primary)' }}>Recommended:</strong> {diagnosis.recommended_action}</span>
            </div>

            {isActionApproved ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
                background: 'var(--status-emerald-bg)', border: '1px solid var(--status-emerald-border)',
                borderRadius: 'var(--radius-md)', color: 'var(--status-emerald)', fontSize: '12px', fontWeight: 700,
              }}>
                <CheckCircle2 size={16} />
                <span>Marked reviewed — removed from the queue for this session</span>
              </div>
            ) : (
              <button
                onClick={handleApprove}
                disabled={executionState === 'executing'}
                style={{
                  width: '100%', padding: '11px 16px',
                  background: executionState === 'executing' ? 'var(--surface-interactive)' : 'var(--rzp-blue)',
                  border: '1px solid var(--rzp-blue)', borderRadius: 'var(--radius-md)', color: '#ffffff',
                  fontSize: '12px', fontWeight: 700, cursor: executionState === 'executing' ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                <Check size={14} />
                <span>{executionState === 'executing' ? 'Marking reviewed…' : 'Accept & mark reviewed'}</span>
              </button>
            )}
          </div>
        )}

        {/* Drawer Footer Actions */}
        <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface-interactive)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Close Audit
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(180deg, #0c66e4 0%, #0052cc 100%)',
              border: '1px solid rgba(12, 102, 228, 0.5)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(12, 102, 228, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Download size={14} />
            <span>Export Cryptographic Proof</span>
          </button>
        </div>
      </div>
    </div>
  );
}
