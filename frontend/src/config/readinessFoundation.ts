/**
 * OMG Release 4 — Readiness Foundation.
 *
 * Pure, derivable readiness evaluation: Governance, Evidence, Review and
 * Audit Readiness, plus gap detection. Ready / Partially Ready / Not Ready
 * only — no numeric scores, no automation, matching Release 4's own rule.
 *
 * Deliberately data-in, data-out: these functions take already-loaded
 * records rather than reading storage themselves, so they stay usable from
 * both the local-storage demo path and the future API-driven path without
 * caring which one supplied the data.
 */

import { authorityProfileCompleteness } from './governanceAuthority';
import { getExpiryIndicator } from './evidenceFoundation';
import type {
  AIAsset,
  AuditReadinessResult,
  EvidenceReadinessResult,
  EvidenceRecord,
  GovernanceGap,
  GovernanceReadinessResult,
  GovernanceReauthorizationRecord,
  ReadinessStatus,
  ReassessmentTrigger,
  ReviewReadinessResult,
  ScheduledReview,
} from '../types';

function statusFromCount(passed: number, total: number): ReadinessStatus {
  if (passed === total) return 'Ready';
  if (passed === 0) return 'Not Ready';
  return 'Partially Ready';
}

/** A governance state that reflects a currently valid, standing authorization. */
const VALID_GOVERNANCE_STATES = new Set(['Authorized', 'Monitoring', 'Conditional GO']);

export function computeGovernanceReadiness(asset: AIAsset): GovernanceReadinessResult {
  const ownershipAssigned = authorityProfileCompleteness(asset.authorityProfile) === 4;
  const oversightAssigned = !!asset.oversightType;
  const autonomyAssigned = asset.autonomyLevel !== undefined;
  const governanceStateValid = !!asset.governanceState && VALID_GOVERNANCE_STATES.has(asset.governanceState);

  const passed = [ownershipAssigned, oversightAssigned, autonomyAssigned, governanceStateValid].filter(Boolean).length;

  return {
    status: statusFromCount(passed, 4),
    ownershipAssigned,
    oversightAssigned,
    autonomyAssigned,
    governanceStateValid,
  };
}

export function computeEvidenceReadiness(
  _asset: AIAsset,
  assetEvidence: EvidenceRecord[]
): EvidenceReadinessResult {
  const evidenceExists = assetEvidence.length > 0;
  const evidenceOwnershipExists = assetEvidence.some(e => !!e.ownership.evidenceOwner);
  const evidenceNotExpired = assetEvidence.length > 0 && assetEvidence.every(e => getExpiryIndicator(e.expiryDate) !== 'Expired');

  const passed = [evidenceExists, evidenceOwnershipExists, evidenceNotExpired].filter(Boolean).length;

  return {
    status: statusFromCount(passed, 3),
    evidenceExists,
    evidenceOwnershipExists,
    evidenceNotExpired,
  };
}

export function computeReviewReadiness(
  _asset: AIAsset,
  assetReviews: ScheduledReview[],
  assetTriggers: ReassessmentTrigger[]
): ReviewReadinessResult {
  const reviewsScheduled = assetReviews.length > 0;
  const reviewsCompleted = assetReviews.some(r => r.status === 'Completed');
  const reassessmentsUpToDate = !assetTriggers.some(t => t.status === 'Open' || t.status === 'Under Review');

  const passed = [reviewsScheduled, reviewsCompleted, reassessmentsUpToDate].filter(Boolean).length;

  return {
    status: statusFromCount(passed, 3),
    reviewsScheduled,
    reviewsCompleted,
    reassessmentsUpToDate,
  };
}

export function computeAuditReadiness(
  asset: AIAsset,
  assetEvidence: EvidenceRecord[]
): AuditReadinessResult {
  const governanceRecordsAvailable = authorityProfileCompleteness(asset.authorityProfile) === 4 && !!asset.decisionOutcome && asset.decisionOutcome !== 'PENDING';
  const evidenceAvailable = assetEvidence.length > 0;
  const traceabilityAvailable = assetEvidence.some(e => !!e.traceability && Object.values(e.traceability).some(Boolean));

  const passed = [governanceRecordsAvailable, evidenceAvailable, traceabilityAvailable].filter(Boolean).length;

  return {
    status: statusFromCount(passed, 3),
    governanceRecordsAvailable,
    evidenceAvailable,
    traceabilityAvailable,
  };
}

export function computeGovernanceGaps(
  asset: AIAsset,
  assetEvidence: EvidenceRecord[],
  assetReviews: ScheduledReview[],
  assetReauthorizations: GovernanceReauthorizationRecord[]
): GovernanceGap[] {
  const gaps: GovernanceGap[] = [];
  const push = (gapType: GovernanceGap['gapType'], detail: string) =>
    gaps.push({ assetId: asset.id, assetName: asset.name, gapType, detail });

  if (authorityProfileCompleteness(asset.authorityProfile) < 4) {
    push('Missing Owner', 'Governance Authority Profile is missing a mandatory role.');
  }
  if (!asset.oversightType) {
    push('Missing Oversight', 'No Human Oversight Classification set.');
  }
  if (asset.autonomyLevel === undefined) {
    push('Missing Autonomy', 'No Autonomy Classification set.');
  }
  if (assetEvidence.length === 0) {
    push('Missing Evidence', 'No evidence linked to this asset.');
  }
  const expired = assetEvidence.filter(e => getExpiryIndicator(e.expiryDate) === 'Expired');
  if (expired.length > 0) {
    push('Expired Evidence', `${expired.length} evidence record(s) past expiry.`);
  }
  if (assetReviews.length === 0) {
    push('Missing Review', 'No governance review scheduled.');
  }
  if (asset.governanceState === 'Reassessment Required' && assetReauthorizations.length === 0) {
    push('Missing Reauthorization', 'Reassessment Required but no reauthorization decision on record.');
  }

  return gaps;
}
