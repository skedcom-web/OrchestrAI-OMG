import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import {
  getEvidenceRecords,
  getScheduledReviews,
  getCompliancePacks,
  getRegulatoryRequirements,
  getGovernanceFindings,
  getGovernanceDrifts,
  bootstrapPersistence,
} from '../services/storageService';
import { computeGovernanceROI, ROI_ASSUMPTIONS, type GovernanceROIResult } from '../config/governanceROIEngine';

function computeCurrentROI(): GovernanceROIResult {
  return computeGovernanceROI(
    getEvidenceRecords(),
    getScheduledReviews(),
    getCompliancePacks(),
    getRegulatoryRequirements(),
    getGovernanceFindings(),
    getGovernanceDrifts()
  );
}

/**
 * Release 11, Capability 2: Governance ROI Engine. Translates governance
 * activity into executive/business language. Every figure here is an
 * estimate from a labeled assumption, not a measured fact — see the
 * methodology note, always shown alongside the numbers it produced.
 */
export const GovernanceROIPage: React.FC = () => {
  const [roi, setRoi] = useState<GovernanceROIResult>(() => computeCurrentROI());

  useEffect(() => {
    bootstrapPersistence().then(() => setRoi(computeCurrentROI()));
  }, []);

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Governance ROI</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          What governance activity is worth in business terms — estimated, transparently, from stated assumptions.
        </p>
      </div>

      <SectionHeader eyebrow="Release 11" title="Operational Savings" subtitle="Hours governance activity saves versus a manual process." icon="⏱️" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Audit Preparation Hours Saved" value={roi.operationalSavings.auditPreparationHoursSaved} icon="📋" tone="info" />
        <KpiCard label="Evidence Collection Hours Saved" value={roi.operationalSavings.evidenceCollectionHoursSaved} icon="📄" tone="info" />
        <KpiCard label="Review Cycle Time Reduction" value={`${roi.operationalSavings.reviewCycleTimeReductionHours}h`} icon="🔄" tone="info" />
        <KpiCard label="Compliance Reporting Automation" value={`${roi.operationalSavings.complianceReportingAutomationSavingsHours}h`} icon="🧩" tone="info" />
      </div>

      <SectionHeader eyebrow="Release 11" title="Risk Avoidance" subtitle="Exposure and exceptions governance activity has closed off." icon="🛡️" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Potential Regulatory Exposure Avoided"
          value={`$${roi.riskAvoidance.potentialRegulatoryExposureAvoided.toLocaleString()}`}
          icon="⚖️"
          tone="warning"
        />
        <KpiCard label="High-Risk Findings Resolved" value={roi.riskAvoidance.highRiskFindingsResolved} icon="✅" tone="success" />
        <KpiCard label="Governance Exceptions Prevented" value={roi.riskAvoidance.governanceExceptionsPrevented} icon="🚨" tone="success" />
      </div>

      <Card className="!p-6 flex flex-col gap-2 !bg-[var(--grad-hero)]">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Executive Summary</p>
        <p className="text-3xl font-black text-[var(--text-primary)]">
          ${roi.executiveSummary.estimatedGovernanceValueDelivered.toLocaleString()}
        </p>
        <p className="text-[12px] text-[var(--text-secondary)]">Estimated Governance Value Delivered</p>
      </Card>

      <Card className="!p-5 flex flex-col gap-2">
        <p className="text-xs font-bold text-[var(--text-primary)] uppercase">Methodology</p>
        <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
          These figures are estimates, not measurements: {ROI_ASSUMPTIONS.hoursPerReviewPreparedWithoutOMG}h assumed per review prepared manually,{' '}
          {ROI_ASSUMPTIONS.hoursPerEvidenceRecordCollectedManually}h per evidence record collected manually,{' '}
          {ROI_ASSUMPTIONS.hoursReducedPerCompletedReviewCycle}h reduced per completed review cycle,{' '}
          {ROI_ASSUMPTIONS.hoursPerCompliancePackReportedManually}h per compliance pack reported manually, a blended rate of $
          {ROI_ASSUMPTIONS.blendedGovernanceHourlyRate}/hour, and ${ROI_ASSUMPTIONS.exposureAvoidedPerResolvedCriticalOrHighFinding.toLocaleString()}{' '}
          exposure avoided per resolved High/Critical finding. Adjust these assumptions to your organization's own rates for a more accurate figure.
        </p>
      </Card>
    </div>
  );
};
