'use client';

import React, { useState, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar, NavTab } from '@/components/layout/Sidebar';
import { MatchRateHero } from '@/features/dashboard/MatchRateHero';
import { FlowWaterfall } from '@/features/dashboard/FlowWaterfall';
import { TelemetryStream } from '@/features/dashboard/TelemetryStream';
import { ReconciliationTable } from '@/features/reconciliation/ReconciliationTable';
import { AuditDrawer } from '@/features/reconciliation/AuditDrawer';
import { ExceptionCategoryCard } from '@/features/exceptions/ExceptionCategoryCard';
import { EvaluationSummary } from '@/features/evaluation/EvaluationSummary';
import { MultiSourceDropzone } from '@/features/ingestion/MultiSourceDropzone';
import { FinancialCopilotDrawer } from '@/features/copilot/FinancialCopilotDrawer';
import {
  getMockReconciliationRecords,
  getMockExceptionGroups,
  mockAdversarialBatchSummary,
  mockCleanBatchSummary
} from '@/lib/mockEngine';
import { ReconciledRecordView } from '@/types/reconciliation';

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [currentDataset, setCurrentDataset] = useState<'adversarial' | 'clean'>('adversarial');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ReconciledRecordView | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);

  const rawRecords = useMemo(() => getMockReconciliationRecords(), []);
  const currentSummary = currentDataset === 'adversarial' ? mockAdversarialBatchSummary : mockCleanBatchSummary;

  const filteredRecords = useMemo(() => {
    if (currentDataset === 'clean') {
      return rawRecords.filter((r) => r.match_status === 'matched').slice(0, 50);
    }
    if (!searchQuery) return rawRecords;
    const q = searchQuery.toLowerCase();
    return rawRecords.filter(
      (r) =>
        r.payment_id.toLowerCase().includes(q) ||
        r.bank_utr.toLowerCase().includes(q) ||
        r.order_name.toLowerCase().includes(q) ||
        r.merchant_customer.toLowerCase().includes(q)
    );
  }, [rawRecords, currentDataset, searchQuery]);

  const exceptionGroups = useMemo(() => getMockExceptionGroups(rawRecords), [rawRecords]);

  const handleTriggerRun = () => {
    setIsReconciling(true);
    setTimeout(() => {
      setIsReconciling(false);
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        exceptionCount={currentSummary.exceptions_count}
        totalRecordsCount={currentSummary.total_records}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <Navbar
          currentDataset={currentDataset}
          onDatasetChange={setCurrentDataset}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenCopilot={() => setIsCopilotOpen(true)}
          onTriggerRun={handleTriggerRun}
          isReconciling={isReconciling}
        />

        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {activeTab === 'dashboard' && (
            <div>
              <MatchRateHero summary={currentSummary} onViewExceptions={() => setActiveTab('exceptions')} />
              <FlowWaterfall summary={currentSummary} />
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>Live Reconciled Feed (Recent Transactions)</div>
                  <button
                    onClick={() => setActiveTab('reconciliation')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--rzp-blue)', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    View All {currentSummary.total_records} Records
                  </button>
                </div>
                <ReconciliationTable
                  records={filteredRecords.slice(0, 10)}
                  selectedRecordId={selectedRecord?.id || null}
                  onSelectRecord={setSelectedRecord}
                />
              </div>
              <TelemetryStream />
            </div>
          )}

          {activeTab === 'reconciliation' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>3-Way Multi-Source Reconciliation Grid</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Cross-ledger line-item comparison: Shopify Orders vs Razorpay PG vs Bank Statement UTRs
                  </div>
                </div>
              </div>
              <ReconciliationTable
                records={filteredRecords}
                selectedRecordId={selectedRecord?.id || null}
                onSelectRecord={setSelectedRecord}
              />
            </div>
          )}

          {activeTab === 'exceptions' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>Clustered Exception Triage Queue</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Root-cause clustered exceptions sorted by financial impact with progressive disclosure
                </div>
              </div>
              {exceptionGroups.map((group, idx) => (
                <ExceptionCategoryCard key={idx} group={group} onSelectRecord={setSelectedRecord} />
              ))}
            </div>
          )}

          {activeTab === 'evaluation' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>Engine Performance & Adversarial Benchmarks</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Rigorous evaluation metrics against 50 injected anomalies across clean, messy, and adversarial datasets
                </div>
              </div>
              <EvaluationSummary summary={currentSummary} />
            </div>
          )}

          {activeTab === 'ingest' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>Multi-Source File Ingestion</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Upload raw settlement exports, bank MT940 files, and Shopify CSV batches
                </div>
              </div>
              <MultiSourceDropzone />
            </div>
          )}
        </main>
      </div>

      <AuditDrawer record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      <FinancialCopilotDrawer isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
    </div>
  );
}
