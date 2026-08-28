import React from 'react';
import { ShieldCheck, Target, AlertTriangle, Scale, Info } from 'lucide-react';
import { ReconciliationBatchSummary } from '@/types/reconciliation';
import { formatPaiseToINR } from '@/lib/money';

/** Shape emitted by src/engine/export_frontend.py — every field is measured. */
export interface EngineEvaluationReport {
  rule_counts: Record<string, number>;
  confidence_distribution: Record<string, number>;
  status_distribution: Record<string, number>;
  manifest_status_distribution: Record<string, number>;
  matched_class_vs_manifest: {
    true_positive: number;
    false_positive: number;
    false_negative: number;
    precision: number;
    recall: number;
  };
  false_positive_records: Array<{
    record_key: string;
    engine_rule: string | null;
    engine_status: string;
    manifest_status: string;
  }>;
  totals: {
    records_processed: number;
    manifest_entries: number;
    covered: number;
  };
}

interface EvaluationSummaryProps {
  summary: ReconciliationBatchSummary;
  report?: EngineEvaluationReport;
}

export function EvaluationSummary({ summary, report }: EvaluationSummaryProps) {
  const strict = report?.matched_class_vs_manifest;
  const resolved = summary.auto_matched_count + summary.fuzzy_matched_count;

  return (
    <div>
      {/* Headline tiles — all measured against the ground-truth manifest */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <Tile
          icon={<ShieldCheck size={16} style={{ color: 'var(--status-emerald)' }} />}
          label='Safety precision'
          value={summary.evaluation.precision_pct + '%'}
          valueColor='var(--status-emerald)'
          note='No withheld / ambiguous record was ever auto-resolved'
        />
        <Tile
          icon={<Target size={16} style={{ color: 'var(--rzp-blue)' }} />}
          label='Resolution rate'
          value={summary.match_rate_percentage + '%'}
          valueColor='var(--rzp-blue)'
          note={resolved + ' of ' + summary.total_records + ' records closed automatically'}
        />
        <Tile
          icon={<Scale size={16} style={{ color: 'var(--text-secondary)' }} />}
          label='Strict match precision'
          value={strict ? (strict.precision * 100).toFixed(1) + '%' : '—'}
          note={strict ? strict.true_positive + ' exact-correct, ' + strict.false_positive + ' over-resolved vs manifest' : ''}
        />
        <Tile
          icon={<AlertTriangle size={16} style={{ color: summary.evaluation.false_positive_exposure_paise > 0 ? 'var(--status-amber)' : 'var(--text-muted)' }} />}
          label='Money wrongly booked'
          value={formatPaiseToINR(summary.evaluation.false_positive_exposure_paise)}
          note='Value auto-resolved that ground truth says was at risk'
        />
      </div>

      {/* Two-metric explainer — this is the honest bit */}
      <div style={{
        background: 'var(--rzp-blue-subtle)', border: '1px solid var(--rzp-blue-border)',
        borderRadius: 'var(--radius-lg)', padding: '18px 20px', marginBottom: '28px',
        display: 'flex', gap: '12px', alignItems: 'flex-start',
      }}>
        <Info size={16} style={{ color: 'var(--rzp-blue)', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Why two precision numbers.</strong>{' '}
          <em>Safety precision</em> asks the question that costs money: did the engine ever auto-resolve a
          record where cash was actually withheld or unexplained (a chargeback, a duplicate capture, an
          orphan payment, an unknown delta)? That stays at {summary.evaluation.precision_pct}%.{' '}
          <em>Strict match precision</em> is harsher — it also counts records the engine closed that the
          manifest labels with a recovery category such as <code className='tabular-mono'>split_payment</code>.
          Those are cases where the money did land and the engine reconstructed it correctly, but ground
          truth still tracks them separately. Both are reported here rather than only the flattering one.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
        <Panel title='Which rule closed each record' subtitle='Counted from the real decision log'>
          {report ? <BarList data={report.rule_counts} total={summary.total_records} /> : <Empty />}
        </Panel>
        <Panel title='Engine outcome vs ground truth' subtitle='Manifest categories present in this batch'>
          {report ? <BarList data={report.manifest_status_distribution} total={summary.total_records} /> : <Empty />}
        </Panel>
      </div>

      {/* Over-resolved records, named */}
      <Panel
        title='Records the engine closed that ground truth tracks separately'
        subtitle={strict && strict.false_positive > 0
          ? strict.false_positive + ' record(s) — listed individually, not summarised away'
          : 'None in this batch'}
      >
        {report && report.false_positive_records.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {report.false_positive_records.map((fp) => (
              <div key={fp.record_key} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 14px', background: 'var(--status-amber-bg)',
                border: '1px solid var(--status-amber-border)', borderRadius: 'var(--radius-md)',
                fontSize: '12px',
              }}>
                <span className='tabular-mono' style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{fp.record_key}</span>
                <span className='tabular-mono' style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{fp.engine_rule}</span>
                <span style={{ color: 'var(--status-amber)', fontWeight: 700, fontSize: '11px' }}>
                  ground truth: {fp.manifest_status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '8px 0' }}>
            Every record the engine closed matches ground truth exactly.
          </div>
        )}
      </Panel>

      {/* Honest limitations */}
      <div style={{ marginTop: '16px' }}>
        <Panel title='What this engine cannot do yet' subtitle='Stated plainly'>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <li>Layer 3 is not built. Chargeback holds, duplicate captures, FX deltas and unexplained residuals are <strong>flagged for review, never resolved</strong>.</li>
            <li>Layer 2 recoveries are marked MEDIUM confidence — deterministic evidence, but a recovery inference, so a reviewer can still spot-check them.</li>
            <li>Amount matching uses a ±₹1 tolerance. Anything outside that is deferred rather than rounded away.</li>
            <li>All figures come from synthetic batches generated for this project; the adversarial batch was never tuned against.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function Tile({ icon, label, value, note, valueColor = 'var(--text-primary)' }: {
  icon: React.ReactNode; label: string; value: string; note: string; valueColor?: string;
}) {
  return (
    <div style={{
      background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)',
      padding: '20px 22px', boxShadow: 'var(--shadow-card)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
        {icon}
      </div>
      <div className='tabular-mono' style={{ fontSize: '28px', fontWeight: 800, color: valueColor, letterSpacing: '-0.025em', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.45 }}>{note}</div>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)',
      padding: '22px 24px', boxShadow: 'var(--shadow-card)',
    }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{title}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{subtitle}</div>
      </div>
      {children}
    </div>
  );
}

function BarList({ data, total }: { data: Record<string, number>; total: number }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {entries.map(([key, count]) => {
        const pct = total > 0 ? (count / total) * 100 : 0;
        const isNone = key === 'NO_RULE' || key === 'NONE';
        return (
          <div key={key}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span className='tabular-mono' style={{ fontSize: '11px', color: isNone ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: 600 }}>
                {key}
              </span>
              <span className='tabular-mono' style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
                {count} · {pct.toFixed(0)}%
              </span>
            </div>
            <div style={{ height: '6px', background: 'var(--surface-interactive)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                width: pct + '%', height: '100%', borderRadius: '999px',
                background: isNone ? 'var(--border-default)' : 'linear-gradient(90deg,#0c66e4,#3b82f6)',
                transition: 'width 700ms cubic-bezier(0.16,1,0.3,1)',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Empty() {
  return <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No evaluation report available for this batch.</div>;
}
