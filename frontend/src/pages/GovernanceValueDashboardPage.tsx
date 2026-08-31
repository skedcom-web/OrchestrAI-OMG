import React, { useEffect, useMemo, useState } from 'react';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import {
  getAssets,
  getEvidenceRecords,
  getScheduledReviews,
  getReassessmentTriggers,
  getGovernanceFindings,
  getDecisions,
  getGovernanceReadinessInputs,
  bootstrapPersistence,
} from '../services/storageService';
import { getPoliciesForAsset, getPolicyViolations } from '../services/policyService';
import { computeGovernanceReadinessScore } from '../config/governanceReadinessScore';
import { computePortfolioGovernanceMetrics } from '../config/governanceValueMetrics';

/**
 * OMG vNext — Governance Intelligence, Module 1: Governance Value Dashboard.
 * Board-friendly view of governance effectiveness. Every widget is computed
 * live from existing governance data — nothing here is a new source of
 * truth, and nothing here blocks or gates anything; it's read-only insight.
 */
export const GovernanceValueDashboardPage: React.FC = () => {
  const [assets, setAssets] = useState(() => getAssets());

  // `bootstrapPersistence()` fires on module load but resolves
  // asynchronously; a visit that lands before it completes would otherwise
  // freeze this dashboard on incomplete data with no way to self-correct
  // (there's no manual refresh action here, unlike the Drift Center's scan
  // button), so refresh once the real Neon data has landed.
  useEffect(() => {
    bootstrapPersistence().then(() => setAssets(getAssets()));
  }, []);

  const readinessScores = useMemo(
    () =>
      assets
        .map(asset => {
          const inputs = getGovernanceReadinessInputs(asset.id);
          if (!inputs) return null;
          return computeGovernanceReadinessScore(inputs.asset, inputs.evidence, inputs.reviews, inputs.triggers, getPoliciesForAsset(asset)).overallScore;
        })
        .filter((s): s is number => s !== null),
    [assets]
  );

  const metrics = useMemo(
    () =>
      computePortfolioGovernanceMetrics(
        assets,
        readinessScores,
        getEvidenceRecords(),
        getScheduledReviews(),
        getReassessmentTriggers(),
        getGovernanceFindings(),
        getPolicyViolations(),
        getDecisions()
      ),
    [assets, readinessScores]
  );

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Governance Value Dashboard</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          Governance effectiveness, measured — the board-friendly view of whether governance is actually
          happening across the AI portfolio, not just whether it was approved.
        </p>
      </div>

      <SectionHeader eyebrow="OMG vNext" title="Portfolio Metrics" subtitle="Computed live from the governance record, every time." icon="📊" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Governance Readiness Score" value={metrics.readinessScoreAvg} caption={`Portfolio average across ${assets.length} assets`} icon="🛡️" tone="accent" progress={metrics.readinessScoreAvg} />
        <KpiCard label="Evidence Coverage" value={`${metrics.evidenceCoveragePct}%`} caption="Assets with current, owned evidence" icon="📁" tone="info" progress={metrics.evidenceCoveragePct} />
        <KpiCard label="Review Compliance" value={`${metrics.reviewCompliancePct}%`} caption="Assets with a completed governance review" icon="📅" tone="info" progress={metrics.reviewCompliancePct} />
        <KpiCard label="Reassessment Compliance" value={`${metrics.reassessmentCompliancePct}%`} caption="Assets with no open reassessment triggers" icon="🔁" tone="info" progress={metrics.reassessmentCompliancePct} />
        <KpiCard
          label="Findings Resolution Rate"
          value={`${metrics.findingsResolutionRatePct}%`}
          caption="Governance findings resolved"
          icon="✅"
          tone={metrics.findingsResolutionRatePct >= 70 ? 'success' : 'warning'}
          progress={metrics.findingsResolutionRatePct}
        />
        <KpiCard
          label="Governance SLA Compliance"
          value={`${metrics.governanceSlaCompliancePct}%`}
          caption="Scheduled reviews on track or completed"
          icon="⏱️"
          tone={metrics.governanceSlaCompliancePct >= 70 ? 'success' : 'warning'}
          progress={metrics.governanceSlaCompliancePct}
        />
        <KpiCard
          label="Approval Cycle Time"
          value={metrics.approvalCycleTimeDays !== null ? `${metrics.approvalCycleTimeDays}d` : '—'}
          caption="Avg. days from registration to first decision"
          icon="⚖️"
          tone="neutral"
        />
        <KpiCard
          label="Open Governance Risks"
          value={metrics.openGovernanceRisksCount}
          caption="Open findings + open policy violations"
          icon="🚨"
          tone={metrics.openGovernanceRisksCount > 0 ? 'danger' : 'success'}
        />
      </div>
    </div>
  );
};
