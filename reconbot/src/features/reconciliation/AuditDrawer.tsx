import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, ExternalLink, Bot, Cpu, Download, Landmark } from 'lucide-react';
import { ReconciledRecordView } from '@/types/reconciliation';
import { formatPaiseToINR, formatPaiseDelta } from '@/lib/money';

interface AuditDrawerProps {
  record: ReconciledRecordView | null;
  onClose: () => void;
}

export function AuditDrawer({ record, onClose }: AuditDrawerProps) {
  if (!record) return null;

  const isMatched = record.match_status === 'matched';
  const isTiming = record.exception_category === 'timing_gap';
  const isFee = record.exception_category === 'fee_discrepancy';
  const isUnknown = record.exception_category === 'amount_unknown';

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
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '999px',
                  background: isMatched ? 'var(--status-emerald-bg)' : 'var(--status-amber-bg)',
                  color: isMatched ? 'var(--status-emerald)' : 'var(--status-amber)',
                  border: isMatched ? '1px solid var(--status-emerald-border)' : '1px solid var(--status-amber-border)',
                }}
              >
                {isMatched ? '3-WAY AUDIT VERIFIED' : 'VARIANCE DETECTED'}
              </span>
              <span className='tabular-mono' style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Confidence: <strong style={{ color: 'var(--text-primary)' }}>{record.confidence_score}%</strong>
              </span>
            </div>
            <h2 className='tabular-mono' style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              {record.payment_id}
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Customer: <strong style={{ color: 'var(--text-primary)' }}>{record.merchant_customer}</strong> · Order {record.order_name} · {record.payment_method.toUpperCase()}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--surface-interactive)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '6px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 3-Way Split Diff Cards */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Multi-Source Cross-Ledger Split Diff
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {/* Shopify Order */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 14px',
              boxShadow: 'var(--shadow-subtle)',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                1. Shopify Order
              </div>
              <div className='tabular-mono' style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '8px 0 2px 0' }}>
                {formatPaiseToINR(record.gross_paise)}
              </div>
              <div className='tabular-mono' style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {record.order_name}
              </div>
            </div>

            {/* Razorpay Gateway */}
            <div style={{
              background: '#eff6ff',
              border: '1px solid var(--rzp-blue-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 14px',
              boxShadow: '0 1px 3px rgba(12, 102, 228, 0.08)',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--rzp-blue)', fontWeight: 700, textTransform: 'uppercase' }}>
                2. Razorpay Net
              </div>
              <div className='tabular-mono' style={{ fontSize: '20px', fontWeight: 800, color: 'var(--rzp-blue)', margin: '8px 0 2px 0' }}>
                {formatPaiseToINR(record.net_paise)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Fee: {formatPaiseToINR(record.fee_paise + record.tax_paise)}
              </div>
            </div>

            {/* Bank Statement */}
            <div style={{
              background: '#f8fafc',
              border: record.variance_paise !== 0 ? '1px solid var(--status-amber-border)' : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 14px',
              boxShadow: record.variance_paise !== 0 ? '0 1px 3px rgba(217, 119, 6, 0.1)' : 'var(--shadow-subtle)',
            }}>
              <div style={{ fontSize: '11px', color: record.variance_paise !== 0 ? 'var(--status-amber)' : 'var(--status-emerald)', fontWeight: 700, textTransform: 'uppercase' }}>
                3. Bank Credit
              </div>
              <div className='tabular-mono' style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '8px 0 2px 0' }}>
                {record.bank_credit_paise === 0 ? 'Pending' : formatPaiseToINR(record.bank_credit_paise)}
              </div>
              <div className='tabular-mono' style={{ fontSize: '11px', color: record.variance_paise === 0 ? 'var(--status-emerald)' : 'var(--status-amber)', fontWeight: 700 }}>
                Delta: {formatPaiseDelta(record.variance_paise)}
              </div>
            </div>
          </div>
        </div>

        {/* Machine Evidence Chain (Deterministic Layer) */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Cpu size={16} style={{ color: 'var(--rzp-blue)' }} />
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Deterministic Evidence (Layer 1)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Applied Engine Rule: </span>
              <strong className='tabular-mono' style={{ color: 'var(--text-primary)' }}>{record.rule_applied || 'None — deferred to Layer 2/3'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Bank UTR Link: </span>
              <strong className='tabular-mono' style={{ color: 'var(--text-primary)' }}>{record.bank_utr}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Settlement Batch: </span>
              <strong className='tabular-mono' style={{ color: 'var(--text-primary)' }}>{record.settlement_id}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Clearing Date: </span>
              <strong className='tabular-mono' style={{ color: 'var(--text-primary)' }}>{record.clearing_date}</strong>
            </div>
          </div>
        </div>

        {/* Engine reasoning (deterministic) + ground-truth note */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <ShieldCheck size={16} style={{ color: 'var(--rzp-blue)' }} />
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Engine reasoning
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
            {record.reasoning}
          </p>
          {record.ground_truth_category && (
            <div style={{
              marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border-default)',
              fontSize: '12px', color: 'var(--text-muted)',
            }}>
              <strong style={{ color: 'var(--rzp-purple)' }}>Ground-truth category:</strong>{' '}
              <span className='tabular-mono'>{record.ground_truth_category}</span>
              {' '}· a Layer 2/3 target, not something Layer 1 claims to have resolved.
              {record.injected_defect && (
                <div style={{ marginTop: '4px', fontStyle: 'italic' }}>{record.injected_defect}</div>
              )}
            </div>
          )}
        </div>

        {/* Studio Actions */}
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
            <span>{isMatched ? 'Export audit record' : 'Send to review queue'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
