/**
 * OMG vNext — Governance Intelligence, Module 5: Governance Health Index.
 *
 * A single executive governance health indicator, derived from Governance
 * Readiness, Governance Drift, Evidence Coverage, Review Compliance,
 * Reassessment Compliance, Findings Resolution and Control Assurance —
 * seven equally-weighted components, same pattern as the six-pillar
 * Governance Readiness Score. Advisory only; not persisted (see
 * governanceValueMetrics.ts for why). Reuses the same 90/70 thresholds as
 * governanceReadinessScore.ts for consistency, mapped to health-appropriate
 * tier names.
 */

import type { GovernanceValueMetrics } from './governanceValueMetrics';

export type HealthComponentKey =
  | 'governanceReadiness'
  | 'governanceDrift'
  | 'evidenceCoverage'
  | 'reviewCompliance'
  | 'reassessmentCompliance'
  | 'findingsResolution'
  | 'controlAssurance';

export const HEALTH_COMPONENT_LABELS: Record<HealthComponentKey, string> = {
  governanceReadiness: 'Governance Readiness',
  governanceDrift: 'Governance Drift',
  evidenceCoverage: 'Evidence Coverage',
  reviewCompliance: 'Review Compliance',
  reassessmentCompliance: 'Reassessment Compliance',
  findingsResolution: 'Findings Resolution',
  controlAssurance: 'Control Assurance',
};

export interface GovernanceHealthComponent {
  key: HealthComponentKey;
  label: string;
  scorePct: number;
}

export type HealthTier = 'Strong' | 'Needs Attention' | 'At Risk';

export interface GovernanceHealthIndex {
  overallScore: number;
  tier: HealthTier;
  components: GovernanceHealthComponent[];
}

/**
 * @param metrics Portfolio metrics from governanceValueMetrics.ts.
 * @param controlAssurancePassPct % of assets whose Control Assurance gate is PASS (governanceGatesEngine.ts).
 * @param driftFreePct % of assets with zero currently-active drift issues (governanceDriftEngine.ts).
 */
export function computeGovernanceHealthIndex(
  metrics: GovernanceValueMetrics,
  controlAssurancePassPct: number,
  driftFreePct: number
): GovernanceHealthIndex {
  const components: GovernanceHealthComponent[] = [
    { key: 'governanceReadiness', label: HEALTH_COMPONENT_LABELS.governanceReadiness, scorePct: metrics.readinessScoreAvg },
    { key: 'governanceDrift', label: HEALTH_COMPONENT_LABELS.governanceDrift, scorePct: driftFreePct },
    { key: 'evidenceCoverage', label: HEALTH_COMPONENT_LABELS.evidenceCoverage, scorePct: metrics.evidenceCoveragePct },
    { key: 'reviewCompliance', label: HEALTH_COMPONENT_LABELS.reviewCompliance, scorePct: metrics.reviewCompliancePct },
    { key: 'reassessmentCompliance', label: HEALTH_COMPONENT_LABELS.reassessmentCompliance, scorePct: metrics.reassessmentCompliancePct },
    { key: 'findingsResolution', label: HEALTH_COMPONENT_LABELS.findingsResolution, scorePct: metrics.findingsResolutionRatePct },
    { key: 'controlAssurance', label: HEALTH_COMPONENT_LABELS.controlAssurance, scorePct: controlAssurancePassPct },
  ];

  const overallScore = Math.round(components.reduce((sum, c) => sum + c.scorePct, 0) / components.length);
  const tier: HealthTier = overallScore >= 90 ? 'Strong' : overallScore >= 70 ? 'Needs Attention' : 'At Risk';

  return { overallScore, tier, components };
}
