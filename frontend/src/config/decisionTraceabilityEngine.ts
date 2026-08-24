/**
 * OMG Release 9 — Governance Decision Traceability Engine.
 *
 * Makes every governance decision reconstructable end-to-end:
 * Condition -> Policy -> Violation -> Finding -> Outcome -> Recommended
 * Action -> Human Decision. Deliberately not a new persisted domain object —
 * a Decision Trace is a live reconstruction assembled from data every prior
 * release already produces (Release 7's computed Conditions/Violations/
 * Outcomes, Release 7/8's persisted Findings/Actions), the same "computed,
 * not stored" discipline Release 7 established for the reasoning layer
 * itself. Pure and data-in/data-out like every prior release's engine.
 */

import type {
  AIAsset,
  EvidenceRecord,
  GovernanceCondition,
  GovernanceFinding,
  GovernanceOutcome,
  GovernancePolicy,
  GovernancePolicyViolation,
  GovernanceReauthorizationRecord,
  RecommendedAction,
  ScheduledReview,
  ValidationRecord,
} from '../types';

export type DecisionTraceStage = 'Input' | 'Condition' | 'Policy' | 'Violation' | 'Finding' | 'Outcome' | 'Action' | 'Human Decision';

export interface DecisionTraceEntry {
  stage: DecisionTraceStage;
  label: string;
  detail: string;
  timestamp?: string;
  actor?: string;
}

export interface DecisionTrace {
  assetId: string;
  assetName: string;
  inputsEvaluated: {
    evidenceCount: number;
    reviewCount: number;
    validationCount: number;
    reauthorizationCount: number;
  };
  conditionsTriggered: GovernanceCondition[];
  policiesEvaluated: GovernancePolicy[];
  violationsDetected: GovernancePolicyViolation[];
  findingsGenerated: GovernanceFinding[];
  outcome: GovernanceOutcome | null;
  actionsRecommended: RecommendedAction[];
  humanDecisions: RecommendedAction[];
  timeline: DecisionTraceEntry[];
  /** False when conditions were detected but nothing (no finding, no action) was ever raised to address them — a reasoning gap. */
  traceabilityComplete: boolean;
}

/** Core Feature 1 — Decision Trace Engine. Assembles the full reconstruction for one asset from data already produced elsewhere. */
export function buildDecisionTrace(
  asset: AIAsset,
  evidence: EvidenceRecord[],
  reviews: ScheduledReview[],
  validations: ValidationRecord[],
  reauthorizations: GovernanceReauthorizationRecord[],
  activePolicies: GovernancePolicy[],
  conditions: GovernanceCondition[],
  violations: GovernancePolicyViolation[],
  findings: GovernanceFinding[],
  outcome: GovernanceOutcome | null,
  actions: RecommendedAction[]
): DecisionTrace {
  const timeline: DecisionTraceEntry[] = [];

  timeline.push({
    stage: 'Input',
    label: 'Governance data evaluated',
    detail: `${evidence.length} evidence record(s), ${reviews.length} review(s), ${validations.length} validation(s), ${reauthorizations.length} reauthorization(s).`,
  });

  conditions.forEach(c => timeline.push({ stage: 'Condition', label: c.conditionType, detail: c.detail }));

  activePolicies
    .filter(p => conditions.some(c => c.conditionType === p.triggerCondition))
    .forEach(p => timeline.push({ stage: 'Policy', label: p.name, detail: `Watches for: ${p.triggerCondition}` }));

  violations.forEach(v => timeline.push({ stage: 'Violation', label: v.policyName, detail: `${v.conditionType} — ${v.detail}` }));

  findings.forEach(f => timeline.push({ stage: 'Finding', label: f.policyName, detail: f.detail, timestamp: f.createdDate }));

  if (outcome) {
    timeline.push({ stage: 'Outcome', label: outcome.status, detail: outcome.reasons.join(' ') || 'No reasoning trail.' });
  }

  actions.forEach(a => {
    timeline.push({ stage: 'Action', label: a.name, detail: `${a.actionType} • ${a.description}`, timestamp: a.createdAt });
    if (a.decidedBy) {
      timeline.push({ stage: 'Human Decision', label: `${a.status}`, detail: a.name, timestamp: a.decidedAt, actor: a.decidedBy });
    }
  });

  const humanDecisions = actions.filter(a => !!a.decidedBy);
  const unaddressedConditions = conditions.length > 0 && findings.length === 0 && actions.length === 0;

  return {
    assetId: asset.id,
    assetName: asset.name,
    inputsEvaluated: {
      evidenceCount: evidence.length,
      reviewCount: reviews.length,
      validationCount: validations.length,
      reauthorizationCount: reauthorizations.length,
    },
    conditionsTriggered: conditions,
    policiesEvaluated: activePolicies,
    violationsDetected: violations,
    findingsGenerated: findings,
    outcome,
    actionsRecommended: actions,
    humanDecisions,
    timeline,
    traceabilityComplete: !unaddressedConditions,
  };
}
