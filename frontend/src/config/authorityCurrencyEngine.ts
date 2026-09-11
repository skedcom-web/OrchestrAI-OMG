/**
 * OMG Release 18 — Module 3: Authority Currency Engine.
 *
 * Strengthens authorityProfileCompleteness() — which only ever counts
 * non-empty name fields — with whether that authority is still current.
 * "Reachable" here means confirmed-within-its-review-period, computed from
 * asset.lastReviewDate the same way computeReauthorizationStatus derives
 * continuity from nextReviewDate — not real-world identity verification,
 * which is explicitly outside OMG's scope (OMG is not an IAM platform).
 * "Applicable" means the authority still matches what the asset's *current*
 * risk tier expects, per the existing Authority Matrix — not a new rule.
 *
 * Advisory only, computed live — nothing here revokes or modifies authority.
 */
import { authorityProfileCompleteness, getAuthorityMatrixEntry } from './governanceAuthority';
import type { AIAsset, AuthorityCurrencyResult } from '../types';

/** Module 11 — Governability Studio: "Authority Review Periods" default, in days. */
export const DEFAULT_AUTHORITY_REVIEW_PERIOD_DAYS = 90;
export const DEFAULT_AUTHORITY_WARNING_PERIOD_DAYS = 60;

export function computeAuthorityCurrency(
  asset: AIAsset,
  reviewPeriodDays: number = DEFAULT_AUTHORITY_REVIEW_PERIOD_DAYS,
  warningPeriodDays: number = DEFAULT_AUTHORITY_WARNING_PERIOD_DAYS
): AuthorityCurrencyResult {
  const reasons: string[] = [];

  // Dimension 1 — Authority Exists
  const authorityExists = authorityProfileCompleteness(asset.authorityProfile) === 4;
  if (!authorityExists) {
    return {
      status: 'Not Applicable',
      authorityExists: false,
      authorityReachable: false,
      authorityApplicable: false,
      daysSinceLastReview: null,
      reasons: ['No complete Governance Authority Profile is on record — currency cannot be assessed.'],
    };
  }

  // Dimension 2 — Authority Reachable (confirmed within its review period)
  const daysSinceLastReview = asset.lastReviewDate
    ? Math.floor((Date.now() - new Date(asset.lastReviewDate).getTime()) / (24 * 60 * 60 * 1000))
    : null;
  const authorityReachable = daysSinceLastReview !== null && daysSinceLastReview <= warningPeriodDays;
  if (daysSinceLastReview === null) reasons.push('Authority has never been confirmed by a recorded review.');
  else if (!authorityReachable) reasons.push(`Authority was last confirmed ${daysSinceLastReview} days ago.`);

  // Dimension 3 — Authority Applicable (still matches what current risk tier expects)
  const expectedOversight = getAuthorityMatrixEntry(asset.riskLevel).oversightType;
  const authorityApplicable = asset.oversightType === expectedOversight;
  if (!authorityApplicable) reasons.push(`${asset.riskLevel} risk expects ${expectedOversight} oversight; this asset is currently set to ${asset.oversightType || 'none'}.`);

  const isExpired = daysSinceLastReview === null || daysSinceLastReview > reviewPeriodDays;
  const status = isExpired
    ? 'Expired'
    : authorityReachable && authorityApplicable
      ? 'Current'
      : 'Review Required';

  if (status === 'Current') reasons.push('Authority is complete, recently confirmed and matched to current risk.');

  return { status, authorityExists, authorityReachable, authorityApplicable, daysSinceLastReview, reasons };
}
