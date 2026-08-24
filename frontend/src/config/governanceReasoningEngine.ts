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

/**
 * Objective 2 — Condition Engine. One entry per detected condition type per
 * asset; detection only. `enabledConditionTypes` is Release 10's Condition
 * Designer: when provided, a disabled condition type is never raised for any
 * asset — the detection mechanism itself stays platform code, only whether
 * it's switched on is configurable. Omitted (undefined) preserves prior
 * behavior exactly — every condition type detected, same as Release 7-9.
 */
export function detectGovernanceConditions(
  asset: AIAsset,
  assetEvidence: EvidenceRecord[],
  assetReviews: ScheduledReview[],
  assetValidations: ValidationRecord[],
  assetReauthorizations: GovernanceReauthorizationRecord[],
  enabledConditionTypes?: Set<GovernanceCondition['conditionType']>
): GovernanceCondition[] {
  const conditions: GovernanceCondition[] = [];
  const push = (conditionType: GovernanceCondition['conditionType'], detail: string) => {
    if (enabledConditionTypes && !enabledConditionTypes.has(conditionType)) return;
    conditions.push({ assetId: asset.id, assetName: asset.name, conditionType, detail });
  };

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
 *
 * `disabledOutcomes` is Release 10's Outcome Designer: a disabled tier is
 * skipped even when its trigger condition is true, falling through to the
 * next tier's own (independent) check — the fixed escalation ORDER
 * (Escalation > Reassessment > Review > Attention > Compliant) is a platform
 * primitive and never changes; only which tiers are active is configurable.
 * Omitted (undefined) preserves prior behavior exactly.
 */
export function computeGovernanceOutcome(
  asset: AIAsset,
  assetConditions: GovernanceCondition[],
  assetViolations: GovernancePolicyViolation[],
  assetFindings: GovernanceFinding[],
  disabledOutcomes?: Set<GovernanceOutcome['status']>
): GovernanceOutcome {
  const isEnabled = (status: GovernanceOutcome['status']) => !disabledOutcomes || !disabledOutcomes.has(status);
  const openFindings = assetFindings.filter(f => f.status === 'Open' || f.status === 'Under Review');
  const criticalViolations = assetViolations.filter(v => v.severity === 'Critical');
  const criticalOpenFindings = openFindings.filter(f => f.severity === 'Critical');
  const missingReauth = assetConditions.some(c => c.conditionType === 'Missing Reauthorization');
  const reviewOverdue = assetConditions.some(c => c.conditionType === 'Review Overdue');

  if ((criticalViolations.length > 0 || criticalOpenFindings.length > 0) && isEnabled('Escalation Recommended')) {
    const reasons: string[] = [];
    criticalViolations.forEach(v => reasons.push(`Critical policy violation: ${v.policyName} (${v.conditionType}).`));
    criticalOpenFindings.forEach(f => reasons.push(`Open critical finding: ${f.policyName} — ${f.detail}`));
    return { assetId: asset.id, assetName: asset.name, status: 'Escalation Recommended', reasons };
  }

  if ((asset.governanceState === 'Reassessment Required' || missingReauth) && isEnabled('Reassessment Recommended')) {
    const reasons: string[] = [];
    if (asset.governanceState === 'Reassessment Required') reasons.push('Governance State is Reassessment Required.');
    if (missingReauth) reasons.push('No reauthorization decision on record since reassessment was triggered.');
    return { assetId: asset.id, assetName: asset.name, status: 'Reassessment Recommended', reasons };
  }

  if ((reviewOverdue || openFindings.length > 0) && isEnabled('Review Required')) {
    const reasons: string[] = [];
    if (reviewOverdue) reasons.push('Scheduled Review Overdue.');
    assetViolations.forEach(v => reasons.push(`Policy Triggered: ${v.policyName} (${v.conditionType}).`));
    if (openFindings.length > 0) reasons.push(`${openFindings.length} open governance finding(s) awaiting review.`);
    return { assetId: asset.id, assetName: asset.name, status: 'Review Required', reasons };
  }

  if ((assetViolations.length > 0 || assetConditions.length > 0) && isEnabled('Attention Required')) {
    const reasons: string[] = [];
    assetViolations.forEach(v => reasons.push(`Policy Triggered: ${v.policyName} (${v.conditionType}).`));
    assetConditions
      .filter(c => !assetViolations.some(v => v.conditionType === c.conditionType))
      .forEach(c => reasons.push(`Condition detected: ${c.conditionType} — ${c.detail}`));
    return { assetId: asset.id, assetName: asset.name, status: 'Attention Required', reasons };
  }

  const reasons: string[] = ['No governance conditions detected.', 'No policy violations.', 'Evidence Valid.'];
  return { assetId: asset.id, assetName: asset.name, status: 'Compliant', reasons };
}
