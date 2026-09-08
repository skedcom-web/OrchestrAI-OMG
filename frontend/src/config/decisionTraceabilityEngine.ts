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
  AgentToolGrant,
  AIAsset,
  AuditLog,
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

/**
 * R20.1 — Agent Decision Traceability (Part 1.3 of the hardening release).
 * A sibling reconstruction, not a replacement: buildDecisionTrace above
 * reconstructs policy reasoning (Condition -> Policy -> ... -> Human
 * Decision); this reconstructs an agent's operational chain — which tool it
 * used, what audit trail that produced, what evidence resulted, and the
 * asset's current outcome. Same "computed, not stored" discipline — assembled
 * from AgentToolGrant, AuditLog and EvidenceRecord, all of which already
 * exist. No new persisted domain object.
 */
export type AgentTraceabilityStage = 'Agent' | 'Tool' | 'Action' | 'Evidence' | 'Outcome';

export interface AgentTraceabilityEntry {
  stage: AgentTraceabilityStage;
  label: string;
  detail: string;
  timestamp?: string;
}

export interface AgentTraceabilityChain {
  assetId: string;
  assetName: string;
  toolsUsed: AgentToolGrant[];
  actionsPerformed: AuditLog[];
  evidenceGenerated: EvidenceRecord[];
  outcome: string;
  timeline: AgentTraceabilityEntry[];
  /** False when the agent has tool access but no audit trail, evidence, or resolved outcome behind it — a reconstruction gap. */
  traceabilityComplete: boolean;
}

export function buildAgentTraceabilityChain(
  asset: AIAsset,
  toolGrants: AgentToolGrant[],
  auditLogs: AuditLog[],
  evidence: EvidenceRecord[]
): AgentTraceabilityChain {
  const actionsPerformed = auditLogs.filter(l => l.entityId === asset.id).slice(0, 10);
  const timeline: AgentTraceabilityEntry[] = [];

  timeline.push({ stage: 'Agent', label: asset.name, detail: `${asset.type} · ${asset.department}` });
  toolGrants.forEach(g => timeline.push({ stage: 'Tool', label: g.toolName || g.toolId, detail: `Granted by ${g.grantedBy}`, timestamp: g.createdAt }));
  actionsPerformed.forEach(a => timeline.push({ stage: 'Action', label: a.action, detail: a.details, timestamp: a.timestamp }));
  evidence.forEach(e => timeline.push({ stage: 'Evidence', label: e.name, detail: e.description, timestamp: e.createdDate }));
  timeline.push({ stage: 'Outcome', label: asset.decisionOutcome || 'PENDING', detail: `Current governance outcome for ${asset.name}.` });

  const outcomeResolved = !!asset.decisionOutcome && asset.decisionOutcome !== 'PENDING';
  const traceabilityComplete = toolGrants.length > 0 && actionsPerformed.length > 0 && evidence.length > 0 && outcomeResolved;

  return {
    assetId: asset.id,
    assetName: asset.name,
    toolsUsed: toolGrants,
    actionsPerformed,
    evidenceGenerated: evidence,
    outcome: asset.decisionOutcome || 'PENDING',
    timeline,
    traceabilityComplete,
  };
}
