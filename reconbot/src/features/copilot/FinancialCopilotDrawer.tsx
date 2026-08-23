import React, { useState } from 'react';
import { X, Sparkles, Send } from 'lucide-react';

interface FinancialCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FinancialCopilotDrawer({ isOpen, onClose }: FinancialCopilotDrawerProps) {
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; text: string; citations?: string[] }[]>([
    {
      sender: 'bot',
      text: 'Hello, I am Ray, your Autonomous Finance Controller Copilot. I have audited batch_2026_08 across Shopify, Razorpay and HDFC statements. How can I assist you with variance analysis or journal entries?',
    }
  ]);
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');

    setTimeout(() => {
      if (userMsg.toLowerCase().includes('unknown') || userMsg.toLowerCase().includes('residual')) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: 'I detected 1 true unknown residual: Record pay_00052 has an unexplained delta of -₹17,000.00 against the bank statement narration. Neither fee schedule drift nor timing rules explain this variance. I recommend escalating ticket FIN-8921 to Senior Ops.',
            citations: ['pay_00052', 'Rule: R3.1_llm_triage_diagnosis', 'Bank Statement Row #52'],
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: 'Based on the deterministic audit trail, 94.2% (471/500) of transactions are 100% matched with zero variance. 3 records are timing lag (T+2) and 2 are chargeback reserve withholdings.',
            citations: ['Audit Trail Hash: 0x8f21a4', 'Precision Score: 98.1%'],
          }
        ]);
      }
    }, 600);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 50,
      display: 'flex',
      justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div style={{
        width: '460px',
        height: '100%',
        background: 'var(--surface-primary)',
        borderLeft: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-drawer)',
        display: 'flex',
        flexDirection: 'column',
      }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface-elevated)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} style={{ color: 'var(--rzp-blue)' }} />
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Ray Financial AI Copilot</span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
              <div style={{
                background: m.sender === 'user' ? 'var(--rzp-blue)' : 'var(--surface-elevated)',
                color: '#ffffff',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '12px',
                lineHeight: '1.5',
                border: m.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
              }}>
                {m.text}
              </div>
              {m.citations && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                  {m.citations.map((c, i) => (
                    <span key={i} className='tabular-mono' style={{
                      fontSize: '10px',
                      background: 'var(--surface-interactive)',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      color: 'var(--rzp-blue)',
                      border: '1px solid var(--border-accent)',
                    }}>
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-elevated)' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder='Ask about variances, UTR links, or journal entries...'
              style={{
                flex: 1,
                background: 'var(--surface-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                fontSize: '12px',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSend}
              style={{
                background: 'var(--rzp-blue)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '0 14px',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
