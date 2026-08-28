'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar, NavTab } from '@/components/layout/Sidebar';
import { MatchRateHero } from '@/features/dashboard/MatchRateHero';
import { AgentPipelineCanvas } from '@/features/dashboard/AgentPipelineCanvas';
import { TelemetryStream } from '@/features/dashboard/TelemetryStream';
import { FlowWaterfall } from '@/features/dashboard/FlowWaterfall';
import { ReconciliationTable } from '@/features/reconciliation/ReconciliationTable';
import { AuditDrawer } from '@/features/reconciliation/AuditDrawer';
import { ExceptionCategoryCard } from '@/features/exceptions/ExceptionCategoryCard';
import { EvaluationSummary } from '@/features/evaluation/EvaluationSummary';
import { MultiSourceDropzone } from '@/features/ingestion/MultiSourceDropzone';
import { FinancialCopilotDrawer } from '@/features/copilot/FinancialCopilotDrawer';
import { ProcessingModal } from '@/features/dashboard/ProcessingModal';
import { getDataset, DatasetName } from '@/lib/engineData';
import { ReconciledRecordView, ExceptionGroupSummary } from '@/types/reconciliation';

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [currentDataset, setCurrentDataset] = useState<DatasetName>('adversarial');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ReconciledRecordView | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [approvedRecordIds, setApprovedRecordIds] = useState<Set<string>>(new Set());

  const datasetData = useMemo(() => getDataset(currentDataset), [currentDataset]);
  const { summary: rawSummary, records: rawRecords, exception_groups: rawGroups } = datasetData;

  // Optimistic resolution overlay for approved actions
  const records = useMemo(() => {
    return rawRecords.map((r: ReconciledRecordView) => {
      const key = r.id || r.payment_id;
      if (approvedRecordIds.has(key)) {
        return {
          ...r,
          match_status: 'matched' as const,
          resolution_status: 'approved',
        };
      }
      return r;
    });
  }, [rawRecords, approvedRecordIds]);

  const summary = useMemo(() => {
    const additionalApproved = approvedRecordIds.size;
    const newMatched = rawSummary.auto_matched_count + additionalApproved;
    // Resolution rate counts BOTH deterministic (Layer 1) and recovered
    // (Layer 2) records — omitting fuzzy under-reports the engine.
    const newRate = Number(
      (((newMatched + rawSummary.fuzzy_matched_count) / rawSummary.total_records) * 100).toFixed(1)
    );
    const remainingExceptions = Math.max(0, rawSummary.exceptions_count - additionalApproved);

    return {
      ...rawSummary,
      auto_matched_count: newMatched,
      match_rate_percentage: newRate,
      exceptions_count: remainingExceptions,
    };
  }, [rawSummary, approvedRecordIds]);

  const filteredRecords = useMemo(() => {
    if (!searchQuery) return records;
    const q = searchQuery.toLowerCase();
    return records.filter(
      (r: ReconciledRecordView) =>
        r.payment_id.toLowerCase().includes(q) ||
        r.bank_utr.toLowerCase().includes(q) ||
        r.order_name.toLowerCase().includes(q) ||
        r.merchant_customer.toLowerCase().includes(q)
    );
  }, [records, searchQuery]);

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
    setToastMessage('Reconciliation Run Complete: ' + summary.auto_matched_count + ' / ' + summary.total_records + ' records matched (' + summary.match_rate_percentage + '%)');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApproveAction = (recordId: string) => {
    setApprovedRecordIds((prev) => new Set([...prev, recordId]));
    setToastMessage('Record marked resolved and moved out of the review queue');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--surface-canvas)' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        summary={summary}
      />

      {/* Main Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <Navbar
          currentDataset={currentDataset}
          onDatasetChange={(ds) => {
            setApprovedRecordIds(new Set());
            setCurrentDataset(ds);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenCopilot={() => setIsCopilotOpen(true)}
          onTriggerRun={handleTriggerRun}
          isReconciling={isProcessing}
        />

        {/* Floating Toast Notification */}
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
                summary={summary}
                onViewExceptions={() => setActiveTab('exceptions')}
                onOpenCopilot={() => setIsCopilotOpen(true)}
              />
              <FlowWaterfall summary={summary} />
              
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
                    View All {summary.total_records} Records →
                  </button>
                </div>
                <ReconciliationTable
                  records={filteredRecords.slice(0, 10)}
                  selectedRecordId={selectedRecord?.id || null}
                  onSelectRecord={setSelectedRecord}
                />
              </div>
            </div>
          )}

          {activeTab === 'reconciliation' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  3-Way Multi-Source Reconciliation Grid
                </h1>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Line-item three-way match: order total vs gateway settlement vs bank credit
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
              {rawGroups.map((group: ExceptionGroupSummary, idx: number) => (
                <ExceptionCategoryCard key={idx} group={group} onSelectRecord={setSelectedRecord} />
              ))}
            </div>
          )}

          {activeTab === 'evaluation' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  Evaluation & engine integrity
                </h1>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Engine output diffed against the ground-truth manifest, including the held-out adversarial batch
                </div>
              </div>
              <EvaluationSummary summary={summary} report={datasetData.evaluation_report as never} />
              <div style={{ marginTop: '28px' }}>
                <AgentPipelineCanvas summary={summary} />
              </div>
              <div style={{ marginTop: '28px' }}>
                <TelemetryStream records={records} />
              </div>
            </div>
          )}

          {activeTab === 'ingest' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  Multi-Source File Ingestion Pipeline
                </h1>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Gateway settlement export, bank statement, and order export
                </div>
              </div>
              <MultiSourceDropzone />
            </div>
          )}
        </main>
      </div>

      {/* Forensic Audit Drawer with One-Click Approval */}
      <AuditDrawer
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onApproveAction={handleApproveAction}
      />

      {/* Financial Copilot Drawer */}
      <FinancialCopilotDrawer isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} summary={summary} records={records} />

      {/* Live Processing Pipeline Modal */}
      <ProcessingModal isOpen={isProcessing} onComplete={handleProcessingComplete} summary={summary} />
    </div>
  );
}
