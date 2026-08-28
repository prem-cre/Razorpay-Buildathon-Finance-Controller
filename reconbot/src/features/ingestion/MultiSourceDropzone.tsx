import React from 'react';
import { UploadCloud, CheckCircle2, FileText, Database, ShieldAlert, ArrowRight, Bot, Cpu } from 'lucide-react';

interface DataSourceCard {
  id: string;
  title: string;
  sourceType: string;
  format: string;
  status: 'READY' | 'PARSED' | 'SYNCED';
  recordCount: number;
  description: string;
}

export function MultiSourceDropzone() {
  const sources: DataSourceCard[] = [
    {
      id: 'shopify',
      title: 'Shopify E-Commerce Orders',
      sourceType: 'Order Line Items (Gross)',
      format: 'CSV / REST API webhook',
      status: 'SYNCED',
      recordCount: 500,
      description: 'Captured customer checkouts with gross order value, taxes, and customer identifiers.',
    },
    {
      id: 'razorpay',
      title: 'Razorpay PG Settlement Export',
      sourceType: 'Payment Gateway Captures',
      format: 'Settlement CSV / Webhook',
      status: 'SYNCED',
      recordCount: 500,
      description: 'Transaction IDs, gross paise, MDR commission rates, GST, and expected net amounts.',
    },
    {
      id: 'hdfc_bank',
      title: 'HDFC Corporate Bank Statement',
      sourceType: 'Bank statement',
      format: 'CSV',
      status: 'SYNCED',
      recordCount: 485,
      description: 'Official bank ledger credits with 16-character UTR numbers and clearing timestamps.',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {sources.map((src) => (
          <div
            key={src.id}
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--rzp-blue-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--rzp-blue)',
                  border: '1px solid var(--rzp-blue-border)',
                }}>
                  <Database size={18} />
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: '999px',
                    background: 'var(--status-emerald-bg)',
                    color: 'var(--status-emerald)',
                    border: '1px solid var(--status-emerald-border)',
                  }}
                >
                  SCHEMA VERIFIED
                </span>
              </div>

              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {src.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--rzp-blue)', fontWeight: 600, marginBottom: '8px' }}>
                {src.sourceType}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                {src.description}
              </p>
            </div>

            <div style={{ marginTop: '22px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className='tabular-mono' style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {src.recordCount} records loaded
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{src.format}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Dropzone Area */}
      <div style={{
        background: '#ffffff',
        border: '2px dashed var(--border-default)',
        borderRadius: 'var(--radius-xl)',
        padding: '44px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'var(--rzp-blue-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--rzp-blue)',
          border: '1px solid var(--rzp-blue-border)',
        }}>
          <UploadCloud size={24} />
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Drop a settlement export, bank statement, or order export
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Supported: CSV exports from the gateway, bank, and store
          </div>
        </div>
        <button style={{
          marginTop: '6px',
          padding: '10px 20px',
          background: 'var(--surface-interactive)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-md)',
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          cursor: 'pointer',
        }}>
          Select File from Disk
        </button>
      </div>
    </div>
  );
}
