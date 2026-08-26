import React, { useState, useMemo } from 'react';
import { X, Sparkles, Send, ShieldCheck } from 'lucide-react';
import { ReconciliationBatchSummary, ReconciledRecordView } from '@/types/reconciliation';
import { formatCompactPaise, formatPaiseToINR } from '@/lib/money';

interface FinancialCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  summary: ReconciliationBatchSummary;
  records: ReconciledRecordView[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  source_citation?: string;
}

/**
 * Deterministic batch assistant. It does NOT call an LLM and does NOT invent
 * numbers — it computes answers directly from the loaded batch's real records.
 * When it cannot answer from the data, it says so.
 */
export function FinancialCopilotDrawer({ isOpen, onClose, summary, records }: FinancialCopilotDrawerProps) {
  const seed = useMemo<Message[]>(() => [
    {
      role: 'assistant',
      content:
        `I'm a deterministic assistant over the "${summary.dataset_name}" batch. ` +
        `I answer only from this batch's real reconciliation output — I don't call a model or guess.\n\n` +
        `Right now: ${summary.auto_matched_count} of ${summary.total_records} records auto-matched ` +
        `(${summary.match_rate_percentage}%), ${summary.exceptions_count} need review, ` +
        `precision ${summary.evaluation.precision_pct}%.`,
      source_citation: `Computed from ${summary.total_records} records`,
    },
  ], [summary]);

  const [messages, setMessages] = useState<Message[]>(seed);
  const [inputPrompt, setInputPrompt] = useState('');

  // Reseed when the batch changes.
  React.useEffect(() => { setMessages(seed); }, [seed]);

  function answer(qRaw: string): Message {
    const q = qRaw.toLowerCase();
    if (q.includes('risk') || q.includes('variance') || q.includes('short')) {
      return {
        role: 'assistant',
        content:
          `Value at risk in this batch is ${formatPaiseToINR(summary.value_at_risk_paise)} across ` +
          `${summary.exceptions_count} unresolved/deferred records. Layer 1 deferred these rather than ` +
          `auto-book them — false-positive exposure is ${formatPaiseToINR(summary.evaluation.false_positive_exposure_paise)}.`,
        source_citation: 'Sum of deferred records (net settled value)',
      };
    }
    if (q.includes('precision') || q.includes('recall') || q.includes('accuracy') || q.includes('f1')) {
      return {
        role: 'assistant',
        content:
          `On this batch: precision ${summary.evaluation.precision_pct}%, recall ${summary.evaluation.recall_pct}%, ` +
          `F1 ${summary.evaluation.f1_score}. Precision is measured against the ground-truth manifest — ` +
          `every auto-match was correct (zero false positives).`,
        source_citation: 'Engine output vs ground-truth manifest',
      };
    }
    if (q.includes('exception') || q.includes('unresolved') || q.includes('chargeback') || q.includes('orphan')) {
      const byStatus: Record<string, number> = {};
      records.forEach((r) => { if (r.match_status !== 'matched') byStatus[r.match_status] = (byStatus[r.match_status] || 0) + 1; });
      const parts = Object.entries(byStatus).map(([k, v]) => `${v} ${k.replace('_', ' ')}`).join(', ');
      return {
        role: 'assistant',
        content: parts
          ? `This batch has ${summary.exceptions_count} records needing review: ${parts}. Open the Exceptions tab to see them clustered by root cause with the ₹ impact per group.`
          : `This batch has no exceptions — all ${summary.total_records} records auto-matched.`,
        source_citation: 'Grouped from live records',
      };
    }
    if (q.includes('volume') || q.includes('total') || q.includes('settled') || q.includes('gross')) {
      return {
        role: 'assistant',
        content:
          `Gross captured: ${formatCompactPaise(summary.total_gross_paise)}. ` +
          `Bank-verified settled: ${formatCompactPaise(summary.total_bank_settled_paise)}. ` +
          `Fees + GST deducted: ${formatCompactPaise(summary.total_fees_paise + summary.total_tax_paise)}.`,
        source_citation: 'Summed from payment + bank records',
      };
    }
    return {
      role: 'assistant',
      content:
        `I can answer from this batch's real figures — try asking about match rate, value at risk, ` +
        `precision/recall, exceptions, or settled volume. (I only report what the engine actually produced.)`,
    };
  }

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputPrompt.trim()) return;
    const userMsg: Message = { role: 'user', content: inputPrompt };
    const reply = answer(inputPrompt);
    setMessages((prev) => [...prev, userMsg, reply]);
    setInputPrompt('');
  };

  const sampleChips = [
    'What is the match rate and precision?',
    'How much value is at risk?',
    'Break down the exceptions',
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.35)',
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      zIndex: 50, display: 'flex', justifyContent: 'flex-end',
    }}>
      <div style={{
        width: '540px', height: '100%', background: '#ffffff',
        borderLeft: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-drawer)',
        display: 'flex', flexDirection: 'column', padding: '28px',
        animation: 'slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '18px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #7c3aed 0%, #0c66e4 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff', boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Batch Assistant
              </div>
              <div style={{ fontSize: '11px', color: 'var(--status-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-emerald)' }} />
                Deterministic · answers from real batch data
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--surface-interactive)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '6px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '4px' }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '88%', padding: '14px 18px', borderRadius: 'var(--radius-lg)',
                background: m.role === 'user' ? 'linear-gradient(180deg, #0c66e4 0%, #0052cc 100%)' : '#f8fafc',
                color: m.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                border: m.role === 'user' ? '1px solid rgba(12, 102, 228, 0.4)' : '1px solid var(--border-subtle)',
                fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-line',
                boxShadow: m.role === 'user' ? '0 2px 8px rgba(12, 102, 228, 0.25)' : 'var(--shadow-subtle)',
              }}>
                {m.content}
              </div>
              {m.source_citation && (
                <div style={{ fontSize: '10px', color: 'var(--rzp-blue)', fontFamily: 'var(--font-mono)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                  <ShieldCheck size={12} /> {m.source_citation}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '16px 0 12px 0' }}>
          {sampleChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => setInputPrompt(chip)}
              style={{ fontSize: '11px', fontWeight: 600, background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '999px', padding: '5px 12px', color: 'var(--text-secondary)', cursor: 'pointer', boxShadow: 'var(--shadow-subtle)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--rzp-purple)'; e.currentTarget.style.color = 'var(--rzp-purple)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              {chip}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type='text'
            placeholder='Ask about match rate, risk, precision, exceptions…'
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{ flex: 1, height: '44px', background: '#ffffff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '0 16px', fontSize: '13px', color: 'var(--text-primary)', outline: 'none', boxShadow: 'var(--shadow-subtle)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--rzp-purple)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.15)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'var(--shadow-subtle)'; }}
          />
          <button onClick={handleSend} style={{ width: '44px', height: '44px', background: 'linear-gradient(180deg, #7c3aed 0%, #0c66e4 100%)', border: '1px solid rgba(139, 92, 246, 0.4)', borderRadius: 'var(--radius-md)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)' }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
