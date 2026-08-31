/**
 * OMG vNext — Governance Intelligence, Module 3: Governance Drift Management.
 *
 * Detects degradation of governance *process* effectiveness over time — not
 * model/technical performance drift (that's ReassessmentTrigger's
 * PERFORMANCE_DRIFT trigger type, a different concept this module doesn't
 * replace). Reads the same signals readinessFoundation.ts and
 * governanceGatesEngine.ts already read; adds a severity tier and, via
 * storageService's openGovernanceDrift/resolveGovernanceDrift, a persisted
 * "time since detected" — the one thing a point-in-time computation can't
 * reconstruct on its own.
 *
 * Purely detection + severity classification. Nothing here blocks, gates or
 * auto-remediates — see ARCHITECTURAL REFINEMENT DIRECTIVE, Module 3/8.
 */

import { authorityProfileCompleteness } from './governanceAuthority';
import type {
  AIAsset,
  DriftCategory,
  DriftSeverity,
  EvidenceRecord,
  Policy,
  ReassessmentTrigger,
  ScheduledReview,
} from '../types';
import { getExpiryIndicator } from './evidenceFoundation';

export interface DetectedDriftIssue {
  category: DriftCategory;
  /** Base severity before the compound-drift escalation rule below is applied. */
  baseSeverity: DriftSeverity;
  detail: string;
}

const today = () => new Date().toISOString().split('T')[0];

/**
 * Pure detection pass over one asset's current governance data. Returns the
 * drift issues currently active (i.e. what a reconciliation pass would keep
 * OPEN); anything not returned here that has an OPEN persisted record should
 * be resolved by the caller.
 */
export function detectDrift(
  asset: AIAsset,
  assetEvidence: EvidenceRecord[],
  assetReviews: ScheduledReview[],
  assetTriggers: ReassessmentTrigger[],
  assetPolicies: Policy[]
): DetectedDriftIssue[] {
  const issues: DetectedDriftIssue[] = [];
  const now = today();

  // 1. Review Drift — overdue review. LOW.
  const overdueReview = assetReviews.find(r => r.status !== 'Completed' && r.dueDate < now);
  if (overdueReview) {
    issues.push({ category: 'Review', baseSeverity: 'Low', detail: `${overdueReview.reviewType} review overdue (due ${overdueReview.dueDate}).` });
  }

  // 2. Evidence Drift — expired evidence (MEDIUM), escalated to CRITICAL if none exists at all.
  if (assetEvidence.length === 0) {
    issues.push({ category: 'Evidence', baseSeverity: 'Critical', detail: 'No evidence on file for this asset.' });
  } else {
    const expired = assetEvidence.filter(e => getExpiryIndicator(e.expiryDate) === 'Expired');
    if (expired.length > 0) {
      issues.push({ category: 'Evidence', baseSeverity: 'Medium', detail: `${expired.length} evidence record(s) expired.` });
    }
  }

  // 3. Reassessment Drift — trigger open/under review and not actioned. MEDIUM.
  const unactionedTrigger = assetTriggers.find(t => t.status === 'Open' || t.status === 'Under Review');
  if (unactionedTrigger) {
    issues.push({ category: 'Reassessment', baseSeverity: 'Medium', detail: `${unactionedTrigger.triggerType} reassessment trigger not actioned (${unactionedTrigger.status}).` });
  }

  // 4. Control Drift — a mapped control/policy with no named owner. HIGH.
  const unownedPolicy = assetPolicies.find(p => !p.owner || !p.owner.trim());
  if (unownedPolicy) {
    issues.push({ category: 'Control', baseSeverity: 'High', detail: `Mapped control "${unownedPolicy.name}" has no named owner.` });
  }

  // 5. Ownership Drift — any vacant owner role. HIGH, CRITICAL if High/Critical risk asset.
  const ownershipCount = authorityProfileCompleteness(asset.authorityProfile);
  if (ownershipCount < 4) {
    const isHighRisk = asset.riskLevel === 'High' || asset.riskLevel === 'Critical';
    issues.push({
      category: 'Ownership',
      baseSeverity: isHighRisk ? 'Critical' : 'High',
      detail: isHighRisk
        ? `Accountable owner vacant on a ${asset.riskLevel}-risk asset.`
        : `${4 - ownershipCount}/4 governance owner role(s) vacant.`,
    });
  }

  // 6. Approval Drift — no decision on record (CRITICAL), or decision stale
  // past the asset's own next review date (HIGH).
  const noDecision = !asset.decisionOutcome || asset.decisionOutcome === 'PENDING';
  if (noDecision) {
    issues.push({ category: 'Approval', baseSeverity: 'Critical', detail: 'No governance approval decision exists.' });
  } else if (asset.nextReviewDate && asset.nextReviewDate < now) {
    issues.push({ category: 'Approval', baseSeverity: 'High', detail: `Governance approval is stale — review was due ${asset.nextReviewDate}.` });
  }

  return issues;
}

/** Compound Drift Rule: 2+ simultaneously active categories escalate every
 * issue on the asset to CRITICAL, regardless of individual base severity. */
export function applyCompoundEscalation(issues: DetectedDriftIssue[]): { category: DriftCategory; severity: DriftSeverity; detail: string }[] {
  const compound = issues.length >= 2;
  return issues.map(i => ({
    category: i.category,
    severity: compound ? 'Critical' : i.baseSeverity,
    detail: compound ? `${i.detail} (compound drift — ${issues.length} active governance drift categories on this asset)` : i.detail,
  }));
}
