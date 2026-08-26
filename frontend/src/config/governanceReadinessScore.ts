/**
 * OMG vNext — Prevention-First Blueprint: the Governance Readiness Score.
 *
 * Six pillars, ~16.67 points each (100 total): Ownership, Risk, Controls,
 * Evidence, Reviews, Governance Decision. This is a distinct,
 * additively-built system — it does not replace `calculateAssetGovernanceScore`
 * (5 pillars, used by 7 existing call sites in the Decision Workbench and
 * elsewhere) or the Governance Health Index behind /governance-scorecards,
 * both of which serve their own established purposes. Reuses the same
 * 90/70 GO / CONDITIONAL GO / NO GO thresholds as those systems for
 * consistency.
 *
 * The sixth pillar is named "Governance Decision," not "Approval" —
 * deliberately. Readiness measures whether governance decisioning
 * *occurred*, not whether approval was *granted*. A recorded NO GO is a
 * completed governance decision and satisfies this pillar exactly as GO or
 * CONDITIONAL GO does; only PENDING (no decision recorded at all) fails it.
 *
 * Purely advisory, like every other readiness/score computation in this
 * codebase: nothing here blocks or gates a decision. See
 * frontend/src/pages/GovernanceReadinessDashboardPage.tsx (the primary
 * surface this feeds) and the Governance Readiness Advisory in
 * DecisionWorkbenchPageV4.tsx (informational only, never disables anything).
 */

import { authorityProfileCompleteness } from './governanceAuthority';
import { computeEvidenceReadiness, computeReviewReadiness } from './readinessFoundation';
import type { AIAsset, EvidenceRecord, Policy, ReassessmentTrigger, ScheduledReview } from '../types';

export type ReadinessPillarKey = 'ownership' | 'risk' | 'controls' | 'evidence' | 'reviews' | 'governanceDecision';

export const READINESS_PILLAR_LABELS: Record<ReadinessPillarKey, string> = {
  ownership: 'Ownership',
  risk: 'Risk',
  controls: 'Controls',
  evidence: 'Evidence',
  reviews: 'Reviews',
  governanceDecision: 'Governance Decision',
};

export interface ReadinessPillar {
  key: ReadinessPillarKey;
  label: string;
  passed: boolean;
  score: number;
  message: string;
}

export type ReadinessTier = 'Ready' | 'Conditionally Ready' | 'Not Ready';

export interface GovernanceReadinessScore {
  assetId: string;
  assetName: string;
  overallScore: number;
  tier: ReadinessTier;
  pillars: Record<ReadinessPillarKey, ReadinessPillar>;
  missingPillars: ReadinessPillar[];
}

const POINTS_PER_PILLAR = 100 / 6;

function pillar(key: ReadinessPillarKey, passed: boolean, message: string): ReadinessPillar {
  return { key, label: READINESS_PILLAR_LABELS[key], passed, score: passed ? POINTS_PER_PILLAR : 0, message };
}

/**
 * Computes the six-pillar Governance Readiness Score for one asset.
 * Data-in, data-out — the caller supplies the asset's related records, same
 * convention as readinessFoundation.ts, so this works from any repository.
 * `assetPolicies` is passed in rather than fetched here specifically to
 * avoid a circular import (policyService.ts itself imports from
 * storageService.ts) — callers get it from `getPoliciesForAsset` in
 * policyService.ts.
 */
export function computeGovernanceReadinessScore(
  asset: AIAsset,
  assetEvidence: EvidenceRecord[],
  assetReviews: ScheduledReview[],
  assetTriggers: ReassessmentTrigger[],
  assetPolicies: Policy[]
): GovernanceReadinessScore {
  const ownershipComplete = authorityProfileCompleteness(asset.authorityProfile) === 4;
  const ownership = pillar(
    'ownership',
    ownershipComplete,
    ownershipComplete ? 'All four governance owners assigned.' : 'Governance Authority Profile is incomplete.'
  );

  // Risk classification is written by the Risk Center wizard onto these two
  // fields; both are present the moment an asset has gone through it (or was
  // registered with them explicitly set). No separate "risk assessed" record
  // exists in this codebase yet, so presence of both fields is the best
  // available signal, not a fabricated one.
  const riskComplete = !!asset.riskLevel && !!asset.dataSensitivity;
  const risk = pillar(
    'risk',
    riskComplete,
    riskComplete ? `Classified ${asset.riskLevel} risk, ${asset.dataSensitivity} data.` : 'Risk classification incomplete.'
  );

  const controlsComplete = assetPolicies.length > 0;
  const controls = pillar(
    'controls',
    controlsComplete,
    controlsComplete ? `${assetPolicies.length} polic${assetPolicies.length === 1 ? 'y' : 'ies'} mapped.` : 'No governance policy mapped to this asset.'
  );

  const evidenceReadiness = computeEvidenceReadiness(asset, assetEvidence);
  const evidenceComplete = evidenceReadiness.evidenceExists && evidenceReadiness.evidenceOwnershipExists && evidenceReadiness.evidenceNotExpired;
  const evidence = pillar(
    'evidence',
    evidenceComplete,
    evidenceComplete ? 'Evidence on file, owned and current.' : 'Evidence missing, unowned, or expired.'
  );

  const reviewReadiness = computeReviewReadiness(asset, assetReviews, assetTriggers);
  const reviewsComplete = reviewReadiness.reviewsScheduled && reviewReadiness.reviewsCompleted;
  const reviews = pillar(
    'reviews',
    reviewsComplete,
    reviewsComplete ? 'A governance review has been completed.' : 'No completed governance review on record.'
  );

  // "Did governance happen?" — not "was approval granted?" A recorded NO GO
  // is a completed governance decision and passes this pillar exactly like
  // GO or CONDITIONAL GO does; only an asset with no decision at all (still
  // PENDING) fails it.
  const decisionRecorded = !!asset.decisionOutcome && asset.decisionOutcome !== 'PENDING';
  const governanceDecision = pillar(
    'governanceDecision',
    decisionRecorded,
    decisionRecorded ? `Governance decision recorded: ${asset.decisionOutcome}.` : 'No governance decision recorded yet.'
  );

  const pillars: Record<ReadinessPillarKey, ReadinessPillar> = { ownership, risk, controls, evidence, reviews, governanceDecision };
  const overallScore = Math.round(Object.values(pillars).reduce((sum, p) => sum + p.score, 0));
  const missingPillars = Object.values(pillars).filter(p => !p.passed);

  const tier: ReadinessTier = overallScore >= 90 ? 'Ready' : overallScore >= 70 ? 'Conditionally Ready' : 'Not Ready';

  return { assetId: asset.id, assetName: asset.name, overallScore, tier, pillars, missingPillars };
}
