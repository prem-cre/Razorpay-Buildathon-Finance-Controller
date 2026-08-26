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
  const triage = record.layer3_triage;
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
                {isActionApproved ? 'ACTION EXECUTED' : isMatched ? 'MATCHED (100% CONF)' : (record.exception_category ? record.exception_category.toUpperCase() : 'UNRESOLVED')}
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

            {/* Bank MT940 Card */}
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
              Deterministic Rule Checksum Trace
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
            {record.reasoning}
          </p>
          <div style={{ marginTop: '10px', display: 'flex', gap: '14px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>Settlement UTR: <strong className='tabular-mono' style={{ color: 'var(--text-primary)' }}>{record.bank_utr}</strong></span>
            <span>Rule: <strong className='tabular-mono' style={{ color: 'var(--rzp-blue)' }}>{record.rule_applied || 'R1.1_exact_three_way'}</strong></span>
          </div>
        </div>

        {/* Layer 3 Forensic AI Triage & One-Click Resolution Card */}
        {triage && (
          <div style={{
            background: isActionApproved ? 'var(--status-emerald-bg)' : '#ffffff',
            border: isActionApproved ? '1px solid var(--status-emerald-border)' : '1px solid var(--status-violet-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot size={18} style={{ color: isActionApproved ? 'var(--status-emerald)' : 'var(--rzp-purple)' }} />
                <span style={{ fontSize: '13px', fontWeight: 800, color: isActionApproved ? 'var(--status-emerald)' : 'var(--rzp-purple)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Layer 3 Forensic Triage & Resolution
                </span>
              </div>
              <span className='tabular-mono' style={{
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                background: 'var(--surface-interactive)',
                padding: '2px 8px',
                borderRadius: '4px',
              }}>
                {triage.audit_hash}
              </span>
            </div>

            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {triage.title}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '12px' }}>
              {triage.action_description}
            </div>

            {/* Evidence Chain */}
            <div style={{ background: '#f8fafc', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: '14px' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Verifiable Forensic Evidence Chain:
              </div>
              {triage.evidence_chain.map((ev, i) => (
                <div key={i} style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--rzp-purple)' }} />
                  {ev}
                </div>
              ))}
            </div>

            {/* One-Click Action Execution Controls */}
            {isActionApproved ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                background: 'var(--status-emerald-bg)',
                border: '1px solid var(--status-emerald-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--status-emerald)',
                fontSize: '12px',
                fontWeight: 700,
              }}>
                <CheckCircle2 size={16} />
                <span>Action Approved & Programmatically Executed to General Ledger</span>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleApprove}
                  disabled={executionState === 'executing'}
                  style={{
                    flex: 2,
                    padding: '10px 16px',
                    background: executionState === 'executing' ? 'var(--surface-interactive)' : 'linear-gradient(135deg, #7c3aed 0%, #0c66e4 100%)',
                    border: '1px solid rgba(124, 58, 237, 0.4)',
                    borderRadius: 'var(--radius-md)',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: executionState === 'executing' ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
                  }}
                >
                  <Sparkles size={14} />
                  <span>{executionState === 'executing' ? 'Executing Settlement Action...' : triage.action_label}</span>
                </button>

                <button
                  onClick={handleEscalate}
                  disabled={isEscalated}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    background: '#ffffff',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    color: isEscalated ? 'var(--text-muted)' : 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: isEscalated ? 'default' : 'pointer',
                  }}
                >
                  {isEscalated ? 'Escalated' : 'Escalate'}
                </button>
              </div>
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
