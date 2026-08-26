import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, ArrowRight, ShieldCheck } from 'lucide-react';

interface FinancialCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source_citation?: string;
}

export function FinancialCopilotDrawer({ isOpen, onClose }: FinancialCopilotDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am Ray, your Autonomous Financial Copilot. I have full read-access to the 3-Way Reconciliation Ledger, HDFC MT940 bank statements, and Razorpay settlement feeds. How can I assist with your financial close today?',
      timestamp: '10:15 AM',
    },
    {
      role: 'user',
      content: 'Why is there a ₹18.4L variance in our current settlement batch?',
      timestamp: '10:16 AM',
    },
    {
      role: 'assistant',
      content: 'Analysis of the August 24 settlement batch shows:\n\n1. ₹9.42L (8 records) is standard T+2 banking lag on payments captured yesterday after 8 PM.\n2. ₹7.28L (3 records) is held by Razorpay Risk Engine for active dispute arbitration (DISP_2026_8819).\n3. ₹1.70L (1 record) is a true unidentified bank reference requiring Senior Ops review.\n\nZero unauthorized fund leakage or fraudulent chargebacks were detected.',
      timestamp: '10:16 AM',
      source_citation: 'Rule Engine Audit Hash: 0x8F92...A71D (Verified)',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputPrompt.trim()) return;
    const userMsg: Message = {
      role: 'user',
      content: inputPrompt,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');

    setTimeout(() => {
      const botMsg: Message = {
        role: 'assistant',
        content: 'I have verified that against the HDFC Bank MT940 statement. All 471 exact-matched payments (₹4.82 Cr) have verified 16-digit UTR credits in account XXXX5819. Would you like me to prepare the SAP/Zoho ERP journal entry export?',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        source_citation: 'Cross-Ledger Verification Hash: 0x33B1...9C4F',
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  const sampleChips = [
    'Explain the T+2 settlement lag',
    'Show transactions where MDR fee > 2.0%',
    'Which records are held due to chargebacks?',
  ];

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
        width: '540px',
        height: '100%',
        background: '#ffffff',
        borderLeft: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-drawer)',
        display: 'flex',
        flexDirection: 'column',
        padding: '28px',
        animation: 'slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '18px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #7c3aed 0%, #0c66e4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Ray Financial Copilot
              </div>
              <div style={{ fontSize: '11px', color: 'var(--status-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-emerald)' }} />
                Grounded in Ground Truth Audit Hashes
              </div>
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
            <X size={16} />
          </button>
        </div>

        {/* Chat Feed */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '4px' }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '88%',
                padding: '14px 18px',
                borderRadius: 'var(--radius-lg)',
                background: m.role === 'user' ? 'linear-gradient(180deg, #0c66e4 0%, #0052cc 100%)' : '#f8fafc',
                color: m.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                border: m.role === 'user' ? '1px solid rgba(12, 102, 228, 0.4)' : '1px solid var(--border-subtle)',
                fontSize: '13px',
                lineHeight: '1.6',
                whiteSpace: 'pre-line',
                boxShadow: m.role === 'user' ? '0 2px 8px rgba(12, 102, 228, 0.25)' : 'var(--shadow-subtle)',
              }}>
                {m.content}
              </div>

              {m.source_citation && (
                <div style={{
                  fontSize: '10px',
                  color: 'var(--rzp-blue)',
                  fontFamily: 'var(--font-mono)',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 700,
                }}>
                  <ShieldCheck size={12} /> {m.source_citation}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Suggestion Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '16px 0 12px 0' }}>
          {sampleChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => setInputPrompt(chip)}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '999px',
                padding: '5px 12px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-subtle)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--rzp-purple)';
                e.currentTarget.style.color = 'var(--rzp-purple)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <div style={{ display: 'flex', gap: '10px', position: 'relative' }}>
          <input
            type='text'
            placeholder='Ask about missing UTRs, fee calculations, or suspense accounts...'
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{
              flex: 1,
              height: '44px',
              background: '#ffffff',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '0 16px',
              fontSize: '13px',
              color: 'var(--text-primary)',
              outline: 'none',
              boxShadow: 'var(--shadow-subtle)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--rzp-purple)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.15)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-default)';
              e.currentTarget.style.boxShadow = 'var(--shadow-subtle)';
            }}
          />
          <button
            onClick={handleSend}
            style={{
              width: '44px',
              height: '44px',
              background: 'linear-gradient(180deg, #7c3aed 0%, #0c66e4 100%)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              borderRadius: 'var(--radius-md)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
