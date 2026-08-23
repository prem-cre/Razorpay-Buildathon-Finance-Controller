import React from 'react';
import { FileSpreadsheet, CheckCircle2 } from 'lucide-react';

export function MultiSourceDropzone() {
  const sources = [
    { title: 'Razorpay Settlements & Payments', ext: 'CSV / JSON', status: 'Ready (500 records loaded)', verified: true },
    { title: 'HDFC / ICICI Bank Statement', ext: 'MT940 / CAMT.053 / CSV', status: 'Ready (492 bank deposits matched)', verified: true },
    { title: 'Shopify / ERP Orders Export', ext: 'CSV / REST Webhook', status: 'Ready (500 orders ingested)', verified: true },
  ];

  return (
    <div style={{
      background: 'var(--surface-elevated)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
    }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '15px', fontWeight: 700 }}>Multi-Source File Ingestion & Parsing Engine</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Drop raw bank statements, gateway settlement exports, and e-commerce ledger files for deterministic 3-way reconciliation
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        {sources.map((src, i) => (
          <div
            key={i}
            style={{
              background: 'var(--surface-primary)',
              border: '1px dashed var(--border-strong)',
              borderRadius: 'var(--radius-md)',
              padding: '20px 16px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <FileSpreadsheet size={28} style={{ color: 'var(--rzp-blue)' }} />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{src.title}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Supported: {src.ext}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--status-emerald)' }}>
              <CheckCircle2 size={13} />
              <span>{src.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
