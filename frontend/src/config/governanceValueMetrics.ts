/**
 * OMG vNext — Governance Intelligence, Module 1: Governance Value Dashboard.
 *
 * Portfolio-wide metrics, computed on demand from data the platform already
 * has (assets, evidence, reviews, reassessment triggers, governance
 * findings, policy violations, decisions). No GovernanceMetric persistence
 * table — see ARCHITECTURAL REFINEMENT DIRECTIVE, Module 1: "Metrics must
 * derive from existing governance data," historical trending intentionally
 * deferred to a future roadmap phase.
 *
 * Data-in, data-out, same convention as governanceReadinessScore.ts /
 * readinessFoundation.ts — works from either Demo or Production Mode data
 * without caring which one supplied it.
 */

import { computeEvidenceReadiness } from './readinessFoundation';
import type {
  AIAsset,
  DecisionRecord,
  EvidenceRecord,
  GovernanceFinding,
  PolicyViolation,
  ReassessmentTrigger,
  ScheduledReview,
} from '../types';

export interface GovernanceValueMetrics {
  /** Portfolio average of the 6-pillar Governance Readiness Score (0-100). */
  readinessScoreAvg: number;
  evidenceCoveragePct: number;
  reviewCompliancePct: number;
  reassessmentCompliancePct: number;
  findingsResolutionRatePct: number;
  governanceSlaCompliancePct: number;
  /** Average days from asset creation to its first recorded decision. Null when no asset has a decision yet. */
  approvalCycleTimeDays: number | null;
  openGovernanceRisksCount: number;
}

const today = () => new Date().toISOString().split('T')[0];

function pct(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

export function computePortfolioGovernanceMetrics(
  assets: AIAsset[],
  readinessScores: number[],
  allEvidence: EvidenceRecord[],
  allReviews: ScheduledReview[],
  allTriggers: ReassessmentTrigger[],
  allFindings: GovernanceFinding[],
  allPolicyViolations: PolicyViolation[],
  allDecisions: DecisionRecord[]
): GovernanceValueMetrics {
  const readinessScoreAvg = readinessScores.length
    ? Math.round(readinessScores.reduce((sum, s) => sum + s, 0) / readinessScores.length)
    : 0;

  const evidenceCoveragePct = pct(
    assets.filter(a => computeEvidenceReadiness(a, allEvidence.filter(e => e.assetId === a.id)).status !== 'Not Ready').length,
    assets.length
  );

  const reviewCompliancePct = pct(
    assets.filter(a => allReviews.some(r => r.assetId === a.id && r.status === 'Completed')).length,
    assets.length
  );

  const reassessmentCompliancePct = pct(
    assets.filter(a => !allTriggers.some(t => t.assetId === a.id && (t.status === 'Open' || t.status === 'Under Review'))).length,
    assets.length
  );

  const resolvedFindings = allFindings.filter(f => f.status === 'Resolved').length;
  const findingsResolutionRatePct = pct(resolvedFindings, allFindings.length);

  const now = today();
  const onTrackReviews = allReviews.filter(r => r.status === 'Completed' || r.dueDate >= now).length;
  const governanceSlaCompliancePct = pct(onTrackReviews, allReviews.length);

  const cycleTimes: number[] = [];
  for (const asset of assets) {
    const assetDecisions = allDecisions.filter(d => d.assetId === asset.id).sort((a, b) => a.decisionDate.localeCompare(b.decisionDate));
    const first = assetDecisions[0];
    if (first && asset.createdAt) {
      const days = Math.round((new Date(first.decisionDate).getTime() - new Date(asset.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      if (Number.isFinite(days) && days >= 0) cycleTimes.push(days);
    }
  }
  const approvalCycleTimeDays = cycleTimes.length
    ? Math.round(cycleTimes.reduce((sum, d) => sum + d, 0) / cycleTimes.length)
    : null;

  const openFindings = allFindings.filter(f => f.status === 'Open' || f.status === 'Under Review').length;
  const openViolations = allPolicyViolations.filter(v => v.status === 'Open' || v.status === 'Under Review').length;
  const openGovernanceRisksCount = openFindings + openViolations;

  return {
    readinessScoreAvg,
    evidenceCoveragePct,
    reviewCompliancePct,
    reassessmentCompliancePct,
    findingsResolutionRatePct,
    governanceSlaCompliancePct,
    approvalCycleTimeDays,
    openGovernanceRisksCount,
  };
}
