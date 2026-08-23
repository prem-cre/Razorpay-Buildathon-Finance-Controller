import React from 'react';
import { formatPaiseToINR, formatPaiseDelta } from '@/lib/money';
import { formatTruncatedId, formatDate } from '@/lib/formatters';
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
      background: 'var(--surface-elevated)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
          <thead>
            <tr style={{
              background: 'var(--surface-primary)',
              borderBottom: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              <th style={{ padding: '12px 16px' }}>Status & Match Rule</th>
              <th style={{ padding: '12px 16px' }}>Payment ID / Order</th>
              <th style={{ padding: '12px 16px' }}>Merchant / Method</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Order Gross</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>MDR Fee + GST</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Expected Net</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Bank Deposit</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Variance (Delta)</th>
              <th style={{ padding: '12px 16px' }}>Bank UTR Link</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Inspect</th>
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
                    background: isSelected ? 'var(--surface-interactive)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isMatched && <CheckCircle2 size={13} style={{ color: 'var(--status-emerald)' }} />}
                      {isTiming && <Clock size={13} style={{ color: 'var(--status-violet)' }} />}
                      {isFee && <AlertTriangle size={13} style={{ color: 'var(--status-amber)' }} />}
                      {isHold && <AlertTriangle size={13} style={{ color: 'var(--status-amber)' }} />}
                      {isUnknown && <XCircle size={13} style={{ color: 'var(--status-rose)' }} />}
                      
                      <span
                        className='tabular-mono'
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: '4px',
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

                  <td style={{ padding: '12px 16px' }}>
                    <div className='tabular-mono' style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {formatTruncatedId(r.payment_id, 8, 4)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {r.order_name}
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{r.merchant_customer}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {r.payment_method}
                    </div>
                  </td>

                  <td className='tabular-mono' style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>
                    {formatPaiseToINR(r.gross_paise)}
                  </td>

                  <td className='tabular-mono' style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-muted)' }}>
                    {formatPaiseToINR(r.fee_paise + r.tax_paise)}
                  </td>

                  <td className='tabular-mono' style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--rzp-blue)', fontWeight: 600 }}>
                    {formatPaiseToINR(r.net_paise)}
                  </td>

                  <td className='tabular-mono' style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>
                    {r.bank_credit_paise === 0 ? '—' : formatPaiseToINR(r.bank_credit_paise)}
                  </td>

                  <td className='tabular-mono' style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: r.variance_paise === 0 ? 'var(--status-emerald)' : 'var(--status-amber)' }}>
                    {formatPaiseDelta(r.variance_paise)}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <div className='tabular-mono' style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {formatTruncatedId(r.bank_utr, 6, 6)}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{r.clearing_date}</div>
                  </td>

                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRecord(r);
                      }}
                      style={{
                        background: 'var(--surface-interactive)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '4px 8px',
                        fontSize: '11px',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      Audit <ChevronRight size={11} />
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
