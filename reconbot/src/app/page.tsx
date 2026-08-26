'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar, NavTab } from '@/components/layout/Sidebar';
import { MatchRateHero } from '@/features/dashboard/MatchRateHero';
import { AgentPipelineCanvas } from '@/features/dashboard/AgentPipelineCanvas';
import { FlowWaterfall } from '@/features/dashboard/FlowWaterfall';
import { TelemetryStream } from '@/features/dashboard/TelemetryStream';
import { ReconciliationTable } from '@/features/reconciliation/ReconciliationTable';
import { AuditDrawer } from '@/features/reconciliation/AuditDrawer';
import { ExceptionCategoryCard } from '@/features/exceptions/ExceptionCategoryCard';
import { EvaluationSummary } from '@/features/evaluation/EvaluationSummary';
import { MultiSourceDropzone } from '@/features/ingestion/MultiSourceDropzone';
import { FinancialCopilotDrawer } from '@/features/copilot/FinancialCopilotDrawer';
import { ProcessingModal } from '@/features/dashboard/ProcessingModal';
import { DatasetName, getDataset } from '@/lib/engineData';
import { ReconciledRecordView, ExceptionGroupSummary } from '@/types/reconciliation';

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [currentDataset, setCurrentDataset] = useState<DatasetName>('adversarial');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ReconciledRecordView | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const datasetPayload = useMemo(() => getDataset(currentDataset), [currentDataset]);
  const currentSummary = datasetPayload.summary;
  const rawRecords = datasetPayload.records;
  const exceptionGroups = datasetPayload.exception_groups;

  const filteredRecords = useMemo(() => {
    if (!searchQuery) return rawRecords;
    const q = searchQuery.toLowerCase();
    return rawRecords.filter(
      (r: ReconciledRecordView) =>
        r.payment_id.toLowerCase().includes(q) ||
        r.bank_utr.toLowerCase().includes(q) ||
        r.order_name.toLowerCase().includes(q) ||
        r.merchant_customer.toLowerCase().includes(q)
    );
  }, [rawRecords, searchQuery]);

  // Global Keyboard Shortcuts (/, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedRecord(null);
        setIsCopilotOpen(false);
        setIsProcessing(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTriggerRun = () => {
    setIsProcessing(true);
  };

  const handleProcessingComplete = () => {
    setIsProcessing(false);
    const resolved = currentSummary.auto_matched_count + currentSummary.fuzzy_matched_count;
    setToastMessage('Agent Execution Complete · ' + resolved + ' / ' + currentSummary.total_records + ' records resolved (' + currentSummary.match_rate_percentage + '%)');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--surface-canvas)' }}>
      {/* Studio Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        summary={currentSummary}
        exceptionCount={currentSummary.exceptions_count}
        totalRecordsCount={currentSummary.total_records}
      />

      {/* Main Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <Navbar
          currentDataset={currentDataset}
          onDatasetChange={setCurrentDataset}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenCopilot={() => setIsCopilotOpen(true)}
          onTriggerRun={handleTriggerRun}
          isReconciling={isProcessing}
        />

        {/* Floating Toast Feedback */}
        {toastMessage && (
          <div style={{
            position: 'fixed',
            top: '80px',
            right: '28px',
            background: '#ffffff',
            border: '1px solid var(--status-emerald-border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 20px',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--status-emerald)',
            boxShadow: 'var(--shadow-elevated)',
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-emerald)', boxShadow: '0 0 8px rgba(5, 150, 105, 0.4)' }} />
            {toastMessage}
          </div>
        )}

        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          {activeTab === 'dashboard' && (
            <div>
              <MatchRateHero
                summary={currentSummary}
                onViewExceptions={() => setActiveTab('exceptions')}
                onTriggerRun={handleTriggerRun}
                isReconciling={isProcessing}
              />
              <AgentPipelineCanvas summary={currentSummary} />
              <FlowWaterfall summary={currentSummary} />
              
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Live Multi-Source Reconciled Feed
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Click any row or Audit button to open the 3-Way Forensic Drawer
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('reconciliation')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--rzp-blue)', fontSize: '13px', cursor: 'pointer', fontWeight: 700 }}
                  >
                    View All {currentSummary.total_records} Records →
                  </button>
                </div>
                <ReconciliationTable
                  records={filteredRecords.slice(0, 10)}
                  selectedRecordId={selectedRecord?.id || null}
                  onSelectRecord={setSelectedRecord}
                />
              </div>

              <TelemetryStream records={rawRecords} />
            </div>
          )}

          {activeTab === 'reconciliation' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  3-Way Multi-Source Reconciliation Grid
                </h1>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Cross-ledger line-item comparison: Shopify Order Gross vs Razorpay PG Net vs Bank MT940 Credit
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
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  Clustered Exception Triage Queue
                </h1>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Root-cause clustered exceptions sorted by financial impact with progressive disclosure
                </div>
              </div>
              {exceptionGroups.map((group: ExceptionGroupSummary, idx: number) => (
                <ExceptionCategoryCard key={idx} group={group} onSelectRecord={setSelectedRecord} />
              ))}
            </div>
          )}

          {activeTab === 'evaluation' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  Model Integrity & Adversarial Stress Benchmarks
                </h1>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Rigorous evaluation metrics against 50 injected anomalies across clean, messy, and adversarial datasets
                </div>
              </div>
              <EvaluationSummary summary={currentSummary} />
            </div>
          )}

          {activeTab === 'ingest' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  Multi-Source File Ingestion Pipeline
                </h1>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Upload raw settlement exports, bank MT940 files, and Shopify CSV batches
                </div>
              </div>
              <MultiSourceDropzone />
            </div>
          )}
        </main>
      </div>

      {/* Forensic Audit Drawer */}
      <AuditDrawer record={selectedRecord} onClose={() => setSelectedRecord(null)} />

      {/* Financial Copilot Drawer */}
      <FinancialCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        summary={currentSummary}
        records={rawRecords}
      />

      {/* Live Processing Pipeline Modal */}
      <ProcessingModal
        isOpen={isProcessing}
        onComplete={handleProcessingComplete}
        summary={currentSummary}
      />
    </div>
  );
}
