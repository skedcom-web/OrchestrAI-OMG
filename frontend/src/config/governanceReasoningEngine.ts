/**
 * OMG Release 7 — Governance Intelligence Engine (Foundation Edition).
 *
 * Pure, derivable governance reasoning: Policy -> Condition -> Violation ->
 * Finding -> Outcome, every outcome explainable. Detection and
 * recommendation only — no automatic state changes (Release 8's scope), no
 * regulation-specific intelligence (RBI/ISO/EU AI Act stay out of scope
 * here, same as every prior foundation release). Deliberately data-in,
 * data-out like readinessFoundation.ts and compliancePackFramework.ts.
 */

import { authorityProfileCompleteness } from './governanceAuthority';
import { getExpiryIndicator } from './evidenceFoundation';
import type {
  AIAsset,
  EvidenceRecord,
  GovernanceCondition,
  GovernanceFinding,
  GovernanceOutcome,
  GovernancePolicy,
  GovernancePolicyViolation,
  GovernanceReauthorizationRecord,
  ScheduledReview,
  ValidationRecord,
} from '../types';

/** Objective 2 — Condition Engine. One entry per detected condition type per asset; detection only. */
export function detectGovernanceConditions(
  asset: AIAsset,
  assetEvidence: EvidenceRecord[],
  assetReviews: ScheduledReview[],
  assetValidations: ValidationRecord[],
  assetReauthorizations: GovernanceReauthorizationRecord[]
): GovernanceCondition[] {
  const conditions: GovernanceCondition[] = [];
  const push = (conditionType: GovernanceCondition['conditionType'], detail: string) =>
    conditions.push({ assetId: asset.id, assetName: asset.name, conditionType, detail });

  const expired = assetEvidence.filter(e => getExpiryIndicator(e.expiryDate) === 'Expired');
  if (expired.length > 0) {
    push('Evidence Expired', `${expired.length} evidence record(s) past expiry.`);
  }

  const now = new Date();
  const overdueReviews = assetReviews.filter(r => r.status === 'Overdue' || (r.status !== 'Completed' && new Date(r.dueDate) < now));
  if (overdueReviews.length > 0) {
    push('Review Overdue', `${overdueReviews.length} scheduled review(s) past due date.`);
  }

  if (asset.decisionOutcome === 'PENDING') {
    push('Missing Approval', 'No GO / CONDITIONAL GO / NO GO decision on record.');
  }

  if (authorityProfileCompleteness(asset.authorityProfile) < 4) {
    push('Missing Owner', 'Governance Authority Profile is missing a mandatory role.');
  }

  const hasApprovedValidation = assetValidations.some(v => v.status === 'Approved');
  if (!hasApprovedValidation) {
    push('Missing Validation', assetValidations.length === 0 ? 'No validation on record.' : 'No approved validation on record.');
  }

  if (asset.governanceState === 'Reassessment Required' && assetReauthorizations.length === 0) {
    push('Missing Reauthorization', 'Reassessment Required but no reauthorization decision on record.');
  }

  return conditions;
}

/** Objective 3 — Governance Rule Engine: evaluate active policies against detected conditions. */
export function evaluatePolicyViolations(policies: GovernancePolicy[], conditions: GovernanceCondition[]): GovernancePolicyViolation[] {
  const violations: GovernancePolicyViolation[] = [];

  policies
    .filter(p => p.status === 'Active')
    .forEach(policy => {
      conditions
        .filter(c => c.conditionType === policy.triggerCondition)
        .forEach(condition => {
          violations.push({
            policyId: policy.id,
            policyName: policy.name,
            assetId: condition.assetId,
            assetName: condition.assetName,
            conditionType: condition.conditionType,
            detail: condition.detail,
            severity: policy.severity,
          });
        });
    });

  return violations;
}

/**
 * Objectives 5 & 6 — Governance Outcome Engine and Explainability Layer.
 * Recommendations only, never an automatic state change. `reasons` is why
 * the outcome was generated — every outcome must be explainable per
 * Objective 6, so the reason list is part of the outcome itself, not a
 * separate lookup.
 */
export function computeGovernanceOutcome(
  asset: AIAsset,
  assetConditions: GovernanceCondition[],
  assetViolations: GovernancePolicyViolation[],
  assetFindings: GovernanceFinding[]
): GovernanceOutcome {
  const reasons: string[] = [];
  const openFindings = assetFindings.filter(f => f.status === 'Open' || f.status === 'Under Review');
  const criticalViolations = assetViolations.filter(v => v.severity === 'Critical');
  const criticalOpenFindings = openFindings.filter(f => f.severity === 'Critical');
  const missingReauth = assetConditions.some(c => c.conditionType === 'Missing Reauthorization');
  const reviewOverdue = assetConditions.some(c => c.conditionType === 'Review Overdue');

  if (criticalViolations.length > 0 || criticalOpenFindings.length > 0) {
    criticalViolations.forEach(v => reasons.push(`Critical policy violation: ${v.policyName} (${v.conditionType}).`));
    criticalOpenFindings.forEach(f => reasons.push(`Open critical finding: ${f.policyName} — ${f.detail}`));
    return { assetId: asset.id, assetName: asset.name, status: 'Escalation Recommended', reasons };
  }

  if (asset.governanceState === 'Reassessment Required' || missingReauth) {
    if (asset.governanceState === 'Reassessment Required') reasons.push('Governance State is Reassessment Required.');
    if (missingReauth) reasons.push('No reauthorization decision on record since reassessment was triggered.');
    return { assetId: asset.id, assetName: asset.name, status: 'Reassessment Recommended', reasons };
  }

  if (reviewOverdue || openFindings.length > 0) {
    if (reviewOverdue) reasons.push('Scheduled Review Overdue.');
    assetViolations.forEach(v => reasons.push(`Policy Triggered: ${v.policyName} (${v.conditionType}).`));
    if (openFindings.length > 0) reasons.push(`${openFindings.length} open governance finding(s) awaiting review.`);
    return { assetId: asset.id, assetName: asset.name, status: 'Review Required', reasons };
  }

  if (assetViolations.length > 0 || assetConditions.length > 0) {
    assetViolations.forEach(v => reasons.push(`Policy Triggered: ${v.policyName} (${v.conditionType}).`));
    assetConditions
      .filter(c => !assetViolations.some(v => v.conditionType === c.conditionType))
      .forEach(c => reasons.push(`Condition detected: ${c.conditionType} — ${c.detail}`));
    return { assetId: asset.id, assetName: asset.name, status: 'Attention Required', reasons };
  }

  reasons.push('No governance conditions detected.');
  reasons.push('No policy violations.');
  reasons.push('Evidence Valid.');
  return { assetId: asset.id, assetName: asset.name, status: 'Compliant', reasons };
}
