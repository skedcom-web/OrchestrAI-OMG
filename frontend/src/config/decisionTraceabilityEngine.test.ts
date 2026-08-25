/**
 * Q1 Stabilization — Phase 5 (Test Automation).
 * Pure-computation unit tests for the Release 9 Governance Decision
 * Traceability Engine: assembling a full Condition -> Policy -> Violation ->
 * Finding -> Outcome -> Recommended Action -> Human Decision timeline from
 * data already produced elsewhere. No DOM, no network — data in, data out.
 */
import { describe, expect, it } from 'vitest';
import { buildDecisionTrace } from './decisionTraceabilityEngine';
import type {
  AIAsset,
  GovernanceCondition,
  GovernanceFinding,
  GovernanceOutcome,
  GovernancePolicy,
  GovernancePolicyViolation,
  RecommendedAction,
} from '../types';

function baseAsset(overrides: Partial<AIAsset> = {}): AIAsset {
  return {
    id: 'asset-1',
    name: 'Test Asset',
    type: 'MODEL' as any,
    description: 'fixture',
    department: 'QA',
    version: '1.0.0',
    status: 'PRODUCTION' as any,
    riskLevel: 'MEDIUM' as any,
    ownership: {} as any,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    decisionOutcome: 'GO',
    ...overrides,
  } as AIAsset;
}

const condition: GovernanceCondition = { assetId: 'asset-1', assetName: 'Test Asset', conditionType: 'Missing Approval', detail: 'No decision recorded.' };
const policy: GovernancePolicy = { id: 'p1', name: 'Approval Policy', description: 'x', category: 'Decision', severity: 'High', status: 'Active', triggerCondition: 'Missing Approval', linkedControlIds: [] };
const violation: GovernancePolicyViolation = { policyId: 'p1', policyName: 'Approval Policy', assetId: 'asset-1', assetName: 'Test Asset', conditionType: 'Missing Approval', detail: 'Policy breached.', severity: 'High' };
const findingFixture: GovernanceFinding = { id: 'f1', assetId: 'asset-1', assetName: 'Test Asset', policyId: 'p1', policyName: 'Approval Policy', conditionType: 'Missing Approval', severity: 'High', status: 'Open', detail: 'Open finding.', createdDate: '2026-01-02' };
const outcome: GovernanceOutcome = { assetId: 'asset-1', assetName: 'Test Asset', status: 'Review Required', reasons: ['Open finding present.'] };

function actionFixture(overrides: Partial<RecommendedAction> = {}): RecommendedAction {
  return {
    id: 'a1',
    actionType: 'Approval',
    name: 'Obtain Governance Approval',
    description: 'Route for decision.',
    assetId: 'asset-1',
    assetName: 'Test Asset',
    priority: 'High',
    status: 'Pending' as any,
    createdAt: '2026-01-03T00:00:00.000Z',
    ...overrides,
  };
}

describe('buildDecisionTrace', () => {
  it('builds a minimal trace with just the Input stage when nothing was detected', () => {
    const trace = buildDecisionTrace(baseAsset(), [], [], [], [], [], [], [], [], null, []);
    expect(trace.timeline).toHaveLength(1);
    expect(trace.timeline[0].stage).toBe('Input');
    expect(trace.traceabilityComplete).toBe(true);
  });

  it('reports the correct input counts in the Input stage', () => {
    const trace = buildDecisionTrace(
      baseAsset(),
      [{} as any, {} as any],
      [{} as any],
      [{} as any, {} as any, {} as any],
      [],
      [],
      [],
      [],
      [],
      null,
      []
    );
    expect(trace.inputsEvaluated).toEqual({ evidenceCount: 2, reviewCount: 1, validationCount: 3, reauthorizationCount: 0 });
  });

  it('assembles the full Condition -> Policy -> Violation -> Finding -> Outcome -> Action chain in stage order', () => {
    const trace = buildDecisionTrace(
      baseAsset(),
      [], [], [], [],
      [policy],
      [condition],
      [violation],
      [findingFixture],
      outcome,
      [actionFixture()]
    );
    const stages = trace.timeline.map(e => e.stage);
    expect(stages).toEqual(['Input', 'Condition', 'Policy', 'Violation', 'Finding', 'Outcome', 'Action']);
  });

  it('only includes policies whose triggerCondition matches a condition that actually fired', () => {
    const unrelatedPolicy: GovernancePolicy = { ...policy, id: 'p2', name: 'Unrelated Policy', triggerCondition: 'Review Overdue' };
    const trace = buildDecisionTrace(baseAsset(), [], [], [], [], [policy, unrelatedPolicy], [condition], [], [], null, []);
    const policyLabels = trace.timeline.filter(e => e.stage === 'Policy').map(e => e.label);
    expect(policyLabels).toEqual(['Approval Policy']);
  });

  it('adds a Human Decision entry only when an action has actually been decided (decidedBy set)', () => {
    const undecided = actionFixture({ id: 'a1', decidedBy: undefined });
    const decided = actionFixture({ id: 'a2', status: 'Accepted' as any, decidedBy: 'Sarah Jenkins', decidedAt: '2026-01-04T00:00:00.000Z' });

    const traceUndecided = buildDecisionTrace(baseAsset(), [], [], [], [], [], [], [], [], null, [undecided]);
    expect(traceUndecided.timeline.some(e => e.stage === 'Human Decision')).toBe(false);
    expect(traceUndecided.humanDecisions).toEqual([]);

    const traceDecided = buildDecisionTrace(baseAsset(), [], [], [], [], [], [], [], [], null, [decided]);
    const humanEntry = traceDecided.timeline.find(e => e.stage === 'Human Decision');
    expect(humanEntry).toMatchObject({ actor: 'Sarah Jenkins', label: 'Accepted' });
    expect(traceDecided.humanDecisions).toEqual([decided]);
  });

  it('flags traceabilityComplete=false when a condition fired but nothing was ever raised to address it — the reasoning-gap case', () => {
    const trace = buildDecisionTrace(baseAsset(), [], [], [], [], [], [condition], [], [], null, []);
    expect(trace.traceabilityComplete).toBe(false);
  });

  it('traceabilityComplete stays true once a finding exists for a fired condition, even with no action yet', () => {
    const trace = buildDecisionTrace(baseAsset(), [], [], [], [], [], [condition], [], [findingFixture], null, []);
    expect(trace.traceabilityComplete).toBe(true);
  });

  it('traceabilityComplete stays true once an action exists, even with no finding', () => {
    const trace = buildDecisionTrace(baseAsset(), [], [], [], [], [], [condition], [], [], null, [actionFixture()]);
    expect(trace.traceabilityComplete).toBe(true);
  });

  it('falls back to "No reasoning trail." when an outcome has no reasons', () => {
    const emptyOutcome: GovernanceOutcome = { assetId: 'asset-1', assetName: 'Test Asset', status: 'Compliant', reasons: [] };
    const trace = buildDecisionTrace(baseAsset(), [], [], [], [], [], [], [], [], emptyOutcome, []);
    const outcomeEntry = trace.timeline.find(e => e.stage === 'Outcome');
    expect(outcomeEntry?.detail).toBe('No reasoning trail.');
  });
});
