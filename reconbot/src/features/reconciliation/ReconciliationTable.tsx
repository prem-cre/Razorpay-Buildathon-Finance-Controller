import React from 'react';
import { formatPaiseToINR, formatPaiseDelta } from '@/lib/money';
import { formatTruncatedId } from '@/lib/formatters';
import { ReconciledRecordView } from '@/types/reconciliation';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ChevronRight } from 'lucide-react';

interface ReconciliationTableProps {
  records: ReconciledRecordView[];
  selectedRecordId: string | null;
  onSelectRecord: (rec: ReconciledRecordView) => void;
}

export function ReconciliationTable({ records, selectedRecordId, onSelectRecord }: ReconciliationTableProps) {
  return (
    <div style={{
      background: 'var(--surface-primary)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-card)',
      overflow: 'hidden',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{
              background: 'var(--surface-canvas)',
              borderBottom: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}>
              <th style={{ padding: '14px 18px' }}>Status & Match Rule</th>
              <th style={{ padding: '14px 18px' }}>Payment ID / Order</th>
              <th style={{ padding: '14px 18px' }}>Merchant / Method</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Order Gross</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Fee + GST</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Expected Net</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Bank Deposit</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Variance (Delta)</th>
              <th style={{ padding: '14px 18px' }}>Bank UTR Link</th>
              <th style={{ padding: '14px 18px', textAlign: 'center' }}>Inspect</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => {
              const isSelected = selectedRecordId === r.id;
              const isMatched = r.match_status === 'matched';
              const isTiming = r.exception_category === 'timing_gap';
              const isFee = r.exception_category === 'fee_discrepancy';
              const isUnknown = r.exception_category === 'amount_unknown';
              const isHold = r.exception_category === 'chargeback_withheld';

              const borderCol = isMatched
                ? 'var(--status-emerald-border)'
                : isTiming
                ? 'var(--status-violet-border)'
                : isFee || isHold
                ? 'var(--status-amber-border)'
                : 'var(--status-rose-border)';

              return (
                <tr
                  key={r.id}
                  onClick={() => onSelectRecord(r)}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: isSelected ? 'rgba(12, 102, 228, 0.05)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(0, 0, 0, 0.015)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isMatched && <CheckCircle2 size={14} style={{ color: 'var(--status-emerald)' }} />}
                      {isTiming && <Clock size={14} style={{ color: 'var(--status-violet)' }} />}
                      {isFee && <AlertTriangle size={14} style={{ color: 'var(--status-amber)' }} />}
                      {isHold && <AlertTriangle size={14} style={{ color: 'var(--status-amber)' }} />}
                      {isUnknown && <XCircle size={14} style={{ color: 'var(--status-rose)' }} />}
                      
                      <span
                        className='tabular-mono'
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '999px',
                          background: isMatched
                            ? 'var(--status-emerald-bg)'
                            : isTiming
                            ? 'var(--status-violet-bg)'
                            : isFee || isHold
                            ? 'var(--status-amber-bg)'
                            : 'var(--status-rose-bg)',
                          color: isMatched
                            ? 'var(--status-emerald)'
                            : isTiming
                            ? 'var(--status-violet)'
                            : isFee || isHold
                            ? 'var(--status-amber)'
                            : 'var(--status-rose)',
                          border: '1px solid ' + borderCol,
                        }}
                      >
                        {isMatched ? '3-WAY MATCH' : isTiming ? 'TIMING (T+2)' : isFee ? 'FEE DRIFT' : isHold ? 'DISPUTE HOLD' : 'UNKNOWN'}
                      </span>
                    </div>
                  </td>

                  <td style={{ padding: '14px 18px' }}>
                    <div className='tabular-mono' style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatTruncatedId(r.payment_id, 8, 4)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {r.order_name}
                    </div>
                  </td>

                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.merchant_customer}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>
                      {r.payment_method}
                    </div>
                  </td>

                  <td className='tabular-mono' style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatPaiseToINR(r.gross_paise)}
                  </td>

                  <td className='tabular-mono' style={{ padding: '14px 18px', textAlign: 'right', color: 'var(--text-muted)' }}>
                    {formatPaiseToINR(r.fee_paise + r.tax_paise)}
                  </td>

                  <td className='tabular-mono' style={{ padding: '14px 18px', textAlign: 'right', color: 'var(--rzp-blue)', fontWeight: 700 }}>
                    {formatPaiseToINR(r.net_paise)}
                  </td>

                  <td className='tabular-mono' style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {r.bank_credit_paise === 0 ? '—' : formatPaiseToINR(r.bank_credit_paise)}
                  </td>

                  <td className='tabular-mono' style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 800, color: r.variance_paise === 0 ? 'var(--status-emerald)' : 'var(--status-amber)' }}>
                    {formatPaiseDelta(r.variance_paise)}
                  </td>

                  <td style={{ padding: '14px 18px' }}>
                    <div className='tabular-mono' style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {formatTruncatedId(r.bank_utr, 6, 6)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.clearing_date}</div>
                  </td>

                  <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRecord(r);
                      }}
                      style={{
                        background: 'var(--surface-canvas)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '5px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: 'var(--shadow-subtle)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--rzp-blue)';
                        e.currentTarget.style.color = 'var(--rzp-blue)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-default)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                    >
                      Audit <ChevronRight size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
