/**
 * OMG Release 11 — Governance Effectiveness & Outcomes Engine, Capability 2.
 *
 * Translates governance activity into business language. Every dollar/hour
 * figure here is an ESTIMATE derived from a labeled, editable assumption
 * constant, not a measured fact — displayed with its methodology so it
 * reads as a transparent model, not fabricated precision. Nothing here is
 * persisted; it's a live computation over data that already exists
 * (Evidence Registry, Scheduled Reviews, Compliance Packs, Governance
 * Findings, Governance Drift), same compute-only pattern as Value Metrics.
 */

import type { CompliancePack, EvidenceRecord, GovernanceDrift, GovernanceFinding, RegulatoryRequirement, ScheduledReview } from '../types';

/** Every constant here is a stated assumption, not a measurement — surface these alongside any dollar/hour figure so the estimate is auditable. */
export const ROI_ASSUMPTIONS = {
  hoursPerReviewPreparedWithoutOMG: 3,
  hoursPerEvidenceRecordCollectedManually: 1.5,
  hoursReducedPerCompletedReviewCycle: 2,
  hoursPerCompliancePackReportedManually: 8,
  hoursPerRegulatoryRequirementTrackedManually: 0.5,
  blendedGovernanceHourlyRate: 75,
  exposureAvoidedPerResolvedCriticalOrHighFinding: 25000,
};

export interface GovernanceROIResult {
  operationalSavings: {
    auditPreparationHoursSaved: number;
    evidenceCollectionHoursSaved: number;
    reviewCycleTimeReductionHours: number;
    complianceReportingAutomationSavingsHours: number;
    totalOperationalHoursSaved: number;
  };
  riskAvoidance: {
    potentialRegulatoryExposureAvoided: number;
    highRiskFindingsResolved: number;
    governanceExceptionsPrevented: number;
  };
  executiveSummary: {
    estimatedGovernanceValueDelivered: number;
  };
}

export function computeGovernanceROI(
  evidence: EvidenceRecord[],
  reviews: ScheduledReview[],
  compliancePacks: CompliancePack[],
  regulatoryRequirements: RegulatoryRequirement[],
  findings: GovernanceFinding[],
  drifts: GovernanceDrift[]
): GovernanceROIResult {
  const completedReviews = reviews.filter(r => r.status === 'Completed');

  const auditPreparationHoursSaved = Math.round(completedReviews.length * ROI_ASSUMPTIONS.hoursPerReviewPreparedWithoutOMG);
  const evidenceCollectionHoursSaved = Math.round(evidence.length * ROI_ASSUMPTIONS.hoursPerEvidenceRecordCollectedManually);
  const reviewCycleTimeReductionHours = Math.round(completedReviews.length * ROI_ASSUMPTIONS.hoursReducedPerCompletedReviewCycle);
  const complianceReportingAutomationSavingsHours = Math.round(
    compliancePacks.length * ROI_ASSUMPTIONS.hoursPerCompliancePackReportedManually +
    regulatoryRequirements.length * ROI_ASSUMPTIONS.hoursPerRegulatoryRequirementTrackedManually
  );
  const totalOperationalHoursSaved =
    auditPreparationHoursSaved + evidenceCollectionHoursSaved + reviewCycleTimeReductionHours + complianceReportingAutomationSavingsHours;

  const highRiskFindingsResolved = findings.filter(f => f.status === 'Resolved' && (f.severity === 'High' || f.severity === 'Critical')).length;
  const governanceExceptionsPrevented = drifts.filter(d => d.status === 'Resolved').length;
  const potentialRegulatoryExposureAvoided = highRiskFindingsResolved * ROI_ASSUMPTIONS.exposureAvoidedPerResolvedCriticalOrHighFinding;

  const estimatedGovernanceValueDelivered =
    totalOperationalHoursSaved * ROI_ASSUMPTIONS.blendedGovernanceHourlyRate + potentialRegulatoryExposureAvoided;

  return {
    operationalSavings: {
      auditPreparationHoursSaved,
      evidenceCollectionHoursSaved,
      reviewCycleTimeReductionHours,
      complianceReportingAutomationSavingsHours,
      totalOperationalHoursSaved,
    },
    riskAvoidance: {
      potentialRegulatoryExposureAvoided,
      highRiskFindingsResolved,
      governanceExceptionsPrevented,
    },
    executiveSummary: {
      estimatedGovernanceValueDelivered,
    },
  };
}
