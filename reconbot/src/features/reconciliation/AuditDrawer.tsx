import React from 'react';
import { X, ShieldCheck, Bot, ChevronRight } from 'lucide-react';
import { ReconciledRecordView } from '@/types/reconciliation';
import { formatPaiseToINR, formatPaiseDelta } from '@/lib/money';
import { RULE_NAMES } from '@/lib/constants';

interface AuditDrawerProps {
  record: ReconciledRecordView | null;
  onClose: () => void;
}

export function AuditDrawer({ record, onClose }: AuditDrawerProps) {
  if (!record) return null;

  const ruleInfo = record.rule_applied ? RULE_NAMES[record.rule_applied] : null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 50,
      display: 'flex',
      justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div style={{
        width: '640px',
        height: '100%',
        background: 'var(--surface-primary)',
        borderLeft: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-drawer)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface-elevated)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className='tabular-mono' style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {record.payment_id}
              </span>
              <span
                className='tabular-mono'
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: 'var(--status-emerald-bg)',
                  color: 'var(--status-emerald)',
                  border: '1px solid var(--status-emerald-border)',
                }}
              >
                {record.confidence} CONFIDENCE ({record.confidence_score}%)
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              3-Way Multi-Source Forensic Verification & Evidence Trail
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--surface-interactive)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '10px' }}>
              3-Way Cross-Ledger Split Diff
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  1. Shopify Order
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Order Name</div>
                <div className='tabular-mono' style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {record.order_name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Order Total</div>
                <div className='tabular-mono' style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {formatPaiseToINR(record.gross_paise)}
                </div>
              </div>

              <div style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-accent)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--rzp-blue)', marginBottom: '8px' }}>
                  2. Razorpay PG Net
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MDR + 18% GST</div>
                <div className='tabular-mono' style={{ fontSize: '12px', color: 'var(--status-rose)' }}>
                  - {formatPaiseToINR(record.fee_paise + record.tax_paise)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Expected Net</div>
                <div className='tabular-mono' style={{ fontSize: '14px', fontWeight: 700, color: 'var(--rzp-blue)' }}>
                  {formatPaiseToINR(record.net_paise)}
                </div>
              </div>

              <div style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--status-emerald)', marginBottom: '8px' }}>
                  3. HDFC Statement
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Statement UTR</div>
                <div className='tabular-mono' style={{ fontSize: '11px', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                  {record.bank_utr}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Deposit Amount</div>
                <div className='tabular-mono' style={{ fontSize: '14px', fontWeight: 700, color: 'var(--status-emerald)' }}>
                  {formatPaiseToINR(record.bank_credit_paise)}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <ShieldCheck size={15} style={{ color: 'var(--status-emerald)' }} />
              <span style={{ fontSize: '12px', fontWeight: 700 }}>Deterministic Machine Audit Trail</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Rule Evaluated:</span>
                <span className='tabular-mono' style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {ruleInfo ? ruleInfo.name : 'Unresolved Anomaly'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Decision Layer:</span>
                <span style={{ color: 'var(--text-primary)' }}>Layer {record.audit_record.layer}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Amount Tolerance Delta:</span>
                <span className='tabular-mono' style={{ fontWeight: 700, color: record.variance_paise === 0 ? 'var(--status-emerald)' : 'var(--status-amber)' }}>
                  {formatPaiseDelta(record.variance_paise)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Decision Hash Timestamp:</span>
                <span className='tabular-mono' style={{ color: 'var(--text-muted)' }}>{record.audit_record.timestamp}</span>
              </div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(12, 102, 228, 0.08), var(--surface-elevated))',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Bot size={15} style={{ color: 'var(--rzp-blue)' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--rzp-blue)' }}>Ray AI Forensic Reasoning (CoT)</span>
            </div>
            <p style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--text-primary)', margin: 0 }}>
              {record.reasoning}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              style={{
                flex: 1,
                background: 'var(--rzp-blue)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '10px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Export Immutable Audit Packet (JSON/PDF)
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 16px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
