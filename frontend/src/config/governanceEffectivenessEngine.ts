/**
 * OMG Release 11 — Governance Effectiveness & Outcomes Engine, Capability 1.
 *
 * Measures whether governance activity is improving governance performance
 * over time — the one thing none of the existing scores (Readiness, Health,
 * Value Metrics) answer, because none of them compare against history.
 *
 * Five of the six sub-factors reuse GovernanceValueMetrics verbatim (no
 * duplicate computation, per the blueprint's explicit "SHALL NOT be
 * duplicated" list); Policy Adherence and Drift Resolution are new, since
 * neither existed as a portfolio percentage before this release. Trend and
 * Improvement % are derived by comparing against the most recent persisted
 * snapshot — see governance-effectiveness-snapshots in storageService.ts.
 */

import type { GovernanceValueMetrics } from './governanceValueMetrics';
import type { GovernanceDrift, GovernanceEffectivenessSnapshot, PolicyViolation } from '../types';

export interface GovernanceEffectivenessResult {
  effectivenessScore: number;
  evidenceComplianceScore: number;
  reviewComplianceScore: number;
  findingsReductionScore: number;
  reassessmentTimelinessScore: number;
  policyAdherenceScore: number;
  driftResolutionScore: number;
}

const CLOSED_VIOLATION_STATUSES = new Set(['Remediated', 'Closed', 'Accepted']);

export function computeGovernanceEffectiveness(
  metrics: GovernanceValueMetrics,
  policyViolations: PolicyViolation[],
  drifts: GovernanceDrift[]
): GovernanceEffectivenessResult {
  const policyAdherenceScore = policyViolations.length === 0
    ? 100
    : Math.round((policyViolations.filter(v => CLOSED_VIOLATION_STATUSES.has(v.status)).length / policyViolations.length) * 100);

  const driftResolutionScore = drifts.length === 0
    ? 100
    : Math.round((drifts.filter(d => d.status === 'Resolved').length / drifts.length) * 100);

  const evidenceComplianceScore = metrics.evidenceCoveragePct;
  const reviewComplianceScore = metrics.reviewCompliancePct;
  const findingsReductionScore = metrics.findingsResolutionRatePct;
  const reassessmentTimelinessScore = metrics.reassessmentCompliancePct;

  const effectivenessScore = Math.round(
    (evidenceComplianceScore + reviewComplianceScore + findingsReductionScore + reassessmentTimelinessScore + policyAdherenceScore + driftResolutionScore) / 6
  );

  return {
    effectivenessScore,
    evidenceComplianceScore,
    reviewComplianceScore,
    findingsReductionScore,
    reassessmentTimelinessScore,
    policyAdherenceScore,
    driftResolutionScore,
  };
}

export type EffectivenessTrend = 'Improving' | 'Declining' | 'Stable' | 'No prior data';

export interface GovernanceEffectivenessComparison {
  current: GovernanceEffectivenessResult;
  previousScore: number | null;
  trend: EffectivenessTrend;
  improvementPercent: number | null;
}

/** `snapshots` is the full recorded history, most-recent-first (matches every other list in this codebase). */
export function compareToLastSnapshot(
  current: GovernanceEffectivenessResult,
  snapshots: GovernanceEffectivenessSnapshot[]
): GovernanceEffectivenessComparison {
  const previous = snapshots[0];
  if (!previous) {
    return { current, previousScore: null, trend: 'No prior data', improvementPercent: null };
  }

  const delta = current.effectivenessScore - previous.effectivenessScore;
  const trend: EffectivenessTrend = delta > 0 ? 'Improving' : delta < 0 ? 'Declining' : 'Stable';
  const improvementPercent = previous.effectivenessScore === 0 ? null : Math.round((delta / previous.effectivenessScore) * 100);

  return { current, previousScore: previous.effectivenessScore, trend, improvementPercent };
}
