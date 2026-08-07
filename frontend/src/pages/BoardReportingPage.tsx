import React, { useMemo, useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { KpiCard } from '../components/ui/KpiCard';
import { Button } from '../components/ui/Button';
import { ProgressMeter } from '../components/ui/ProgressMeter';
import { ScoreRing } from '../components/ui/ScoreRing';
import { useAuth } from '../contexts/AuthContext';
import { addAuditLog } from '../services/storageService';
import {
  buildAuditReadinessReport,
  buildExecutiveGovernanceReport,
} from '../services/executiveGovernance';
import type { AuditReadinessReport, ExecutiveGovernanceReport } from '../types';

type ReportId = 'executive' | 'audit';

const Row: React.FC<{ label: string; value: React.ReactNode; muted?: boolean }> = ({
  label,
  value,
  muted,
}) => (
  <div className="flex items-center justify-between gap-4 py-2 border-b border-[var(--border-subtle)] last:border-0">
    <span className="text-[12px] font-semibold text-[var(--text-secondary)]">{label}</span>
    <span
      className={`tnum text-[13px] font-extrabold ${muted ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}
    >
      {value}
    </span>
  </div>
);

/** Phase 9 WS8 — Board & Regulator Reporting. */
export const BoardReportingPage: React.FC = () => {
  const { currentUser, currentPersona } = useAuth();
  const [reportId, setReportId] = useState<ReportId>('executive');
  const [executiveReport, setExecutiveReport] = useState<ExecutiveGovernanceReport | null>(null);
  const [auditReport, setAuditReport] = useState<AuditReadinessReport | null>(null);

  const author = currentUser?.name || 'Governance Admin';

  // Live previews so the page is meaningful before anything is generated.
  const preview = useMemo(
    () => ({
      executive: buildExecutiveGovernanceReport(author),
      audit: buildAuditReadinessReport(author),
    }),
    [author]
  );

  const activeExecutive = executiveReport || preview.executive;
  const activeAudit = auditReport || preview.audit;

  const generate = () => {
    if (reportId === 'executive') {
      const report = buildExecutiveGovernanceReport(author);
      setExecutiveReport(report);
      addAuditLog(
        currentUser?.id || 'usr-1',
        author,
        currentPersona?.role || 'SUPER_ADMIN',
        'EXECUTIVE_REPORT_GENERATED',
        'ExecutiveReport',
        report.id,
        'Executive Governance Report',
        `Generated Executive Governance Report. Health score ${report.governanceHealthScore}/100, ${report.policyCompliance.openViolations} open policy violations.`
      );
    } else {
      const report = buildAuditReadinessReport(author);
      setAuditReport(report);
      addAuditLog(
        currentUser?.id || 'usr-1',
        author,
        currentPersona?.role || 'SUPER_ADMIN',
        'AUDIT_READINESS_REPORT_GENERATED',
        'ExecutiveReport',
        report.id,
        'Audit Readiness Report',
        `Generated Audit Readiness Report. Readiness score ${report.auditReadinessScore}/100.`
      );
    }
  };

  const exportReport = () => {
    const payload =
      reportId === 'executive'
        ? { report: 'Executive Governance Report', ...activeExecutive }
        : { report: 'Audit Readiness Report', ...activeAudit };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `omg-${reportId}-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generatedAt = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">
            Board &amp; Regulator Reporting
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
            Two reports answer the questions a board or examiner actually asks: is AI under control,
            and can we prove it? Both are generated from the live governance record.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={exportReport}>
            Export JSON
          </Button>
          <Button onClick={generate}>Generate Report</Button>
        </div>
      </div>

      {/* Report switcher */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Report type">
        {(
          [
            { id: 'executive' as ReportId, label: 'Executive Governance Report', icon: '⚖️' },
            { id: 'audit' as ReportId, label: 'Audit Readiness Report', icon: '📜' },
          ]
        ).map(option => {
          const active = option.id === reportId;
          return (
            <button
              key={option.id}
              onClick={() => setReportId(option.id)}
              aria-pressed={active}
              data-noglass
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-bold border transition-all cursor-pointer ${
                active
                  ? 'text-white border-transparent shadow-md'
                  : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-border)] hover:text-[var(--text-primary)]'
              }`}
              style={active ? { background: 'var(--grad-brand)' } : undefined}
            >
              <span aria-hidden>{option.icon}</span>
              {option.label}
            </button>
          );
        })}
      </div>

      {/* ===================== EXECUTIVE GOVERNANCE REPORT ==================== */}
      {reportId === 'executive' && (
        <>
          <section
            className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] p-5 sm:p-6"
            style={{ background: 'var(--grad-hero)' }}
          >
            <div className="absolute inset-0 enterprise-grid opacity-50 pointer-events-none" aria-hidden />
            <div className="relative flex flex-col lg:flex-row items-center gap-6">
              <ScoreRing
                score={activeExecutive.governanceHealthScore}
                size={150}
                label="Health"
                caption="Governance"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--accent-primary)]">
                  Workstream 8 · Executive Governance Report
                </p>
                <h2 className="text-xl font-extrabold text-[var(--text-primary)] mt-1.5">
                  Enterprise AI Governance Position
                </h2>
                <p className="text-[12px] text-[var(--text-muted)] mt-1.5">
                  Prepared by {activeExecutive.generatedBy} ·{' '}
                  {generatedAt(activeExecutive.generatedAt)}
                  {!executiveReport && ' · live preview'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
                  <KpiCard
                    label="AI Inventory"
                    value={activeExecutive.inventory.totalAssets}
                    caption="Governed assets"
                    tone="accent"
                  />
                  <KpiCard
                    label="Policy Compliance"
                    value={`${activeExecutive.policyCompliance.complianceRate}%`}
                    caption={`${activeExecutive.policyCompliance.activePolicies} active policies`}
                    tone={
                      activeExecutive.policyCompliance.complianceRate >= 80 ? 'success' : 'warning'
                    }
                  />
                  <KpiCard
                    label="Open Violations"
                    value={activeExecutive.policyCompliance.openViolations}
                    caption="Awaiting disposition"
                    tone={
                      activeExecutive.policyCompliance.openViolations === 0 ? 'success' : 'danger'
                    }
                  />
                  <KpiCard
                    label="Outstanding Actions"
                    value={activeExecutive.outstandingActions}
                    caption="Findings and corrective actions"
                    tone="warning"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-3">
              <SectionHeader title="AI Inventory" subtitle="What the enterprise runs." icon="🧭" />
              <div>
                <Row label="Total AI Assets" value={activeExecutive.inventory.totalAssets} />
                <Row label="Applications" value={activeExecutive.inventory.applications} />
                <Row label="Agents" value={activeExecutive.inventory.agents} />
                <Row label="Models" value={activeExecutive.inventory.models} />
                <Row label="Copilots" value={activeExecutive.inventory.copilots} />
                <Row label="RAG Systems" value={activeExecutive.inventory.ragSystems} />
                <Row label="Third-Party AI" value={activeExecutive.inventory.thirdPartyAi} />
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
              <SectionHeader title="Risk Summary" subtitle="Severity distribution." icon="⚡" />
              <ProgressMeter
                height={14}
                segments={[
                  { label: 'Low', value: activeExecutive.riskSummary.Low, color: 'var(--risk-low)' },
                  {
                    label: 'Medium',
                    value: activeExecutive.riskSummary.Medium,
                    color: 'var(--risk-medium)',
                  },
                  { label: 'High', value: activeExecutive.riskSummary.High, color: 'var(--risk-high)' },
                  {
                    label: 'Critical',
                    value: activeExecutive.riskSummary.Critical,
                    color: 'var(--risk-critical)',
                  },
                ]}
              />
            </section>

            <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
              <SectionHeader title="Decisions" subtitle="Authority position." icon="⚖️" />
              <ProgressMeter
                height={14}
                segments={[
                  { label: 'GO', value: activeExecutive.decisions.GO, color: 'var(--status-success)' },
                  {
                    label: 'Conditional',
                    value: activeExecutive.decisions['CONDITIONAL GO'],
                    color: 'var(--status-warning)',
                  },
                  {
                    label: 'NO-GO',
                    value: activeExecutive.decisions['NO GO'],
                    color: 'var(--status-danger)',
                  },
                  {
                    label: 'Pending',
                    value: activeExecutive.decisions.PENDING,
                    color: 'var(--status-info)',
                  },
                ]}
              />
            </section>
          </div>
        </>
      )}

      {/* ===================== AUDIT READINESS REPORT ======================== */}
      {reportId === 'audit' && (
        <>
          <section
            className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] p-5 sm:p-6"
            style={{ background: 'var(--grad-hero)' }}
          >
            <div className="absolute inset-0 enterprise-grid opacity-50 pointer-events-none" aria-hidden />
            <div className="relative flex flex-col lg:flex-row items-center gap-6">
              <ScoreRing
                score={activeAudit.auditReadinessScore}
                size={150}
                label="Readiness"
                caption="Audit"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--accent-primary)]">
                  Workstream 8 · Audit Readiness Report
                </p>
                <h2 className="text-xl font-extrabold text-[var(--text-primary)] mt-1.5">
                  Can We Prove Governance Was Applied?
                </h2>
                <p className="text-[12px] text-[var(--text-muted)] mt-1.5">
                  Prepared by {activeAudit.generatedBy} · {generatedAt(activeAudit.generatedAt)}
                  {!auditReport && ' · live preview'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
                  <KpiCard
                    label="Evidence Complete"
                    value={activeAudit.evidenceStatus.complete}
                    caption="Assets with a full pack"
                    tone="success"
                  />
                  <KpiCard
                    label="Evidence Missing"
                    value={activeAudit.evidenceStatus.missing}
                    caption="No artefacts filed"
                    tone="danger"
                  />
                  <KpiCard
                    label="Approval History"
                    value={activeAudit.approvalHistoryCount}
                    caption="Recorded approval events"
                    tone="info"
                  />
                  <KpiCard
                    label="Review History"
                    value={activeAudit.reviewHistoryCount}
                    caption="Governance reviews on record"
                    tone="neutral"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
              <SectionHeader
                title="Evidence Status"
                subtitle="Whether each governed asset can be evidenced on demand."
                icon="📄"
              />
              <ProgressMeter
                height={16}
                segments={[
                  {
                    label: 'Complete',
                    value: activeAudit.evidenceStatus.complete,
                    color: 'var(--status-success)',
                  },
                  {
                    label: 'Review Required',
                    value: activeAudit.evidenceStatus.reviewRequired,
                    color: 'var(--status-warning)',
                  },
                  {
                    label: 'Missing',
                    value: activeAudit.evidenceStatus.missing,
                    color: 'var(--status-danger)',
                  },
                ]}
              />
            </section>

            <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-3">
              <SectionHeader
                title="Governance History"
                subtitle="The immutable record an examiner would request."
                icon="📜"
              />
              <div>
                <Row label="Approval History Events" value={activeAudit.approvalHistoryCount} />
                <Row label="Decision History Records" value={activeAudit.decisionHistoryCount} />
                <Row label="Review History Records" value={activeAudit.reviewHistoryCount} />
                <Row
                  label="Audit Readiness Score"
                  value={`${activeAudit.auditReadinessScore}/100`}
                />
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                Readiness weights evidence completeness at 50%, audit trail depth at 25% and review
                coverage at 25%.
              </p>
            </section>
          </div>
        </>
      )}

      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
        Generating a report writes an entry to the immutable audit log, so the act of reporting is
        itself governed. Export produces a machine-readable snapshot suitable for attaching to board
        minutes or a regulatory submission pack.
      </p>
    </div>
  );
};
