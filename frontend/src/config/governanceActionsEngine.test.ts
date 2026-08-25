/**
 * Q1 Stabilization — Phase 5 (Test Automation).
 * Pure-computation unit tests for the Release 8 Governance Intelligence
 * Engine (Actions Edition): Condition -> tactical action, Outcome ->
 * procedural action, and the Release 10 Action Designer rule overrides.
 * No DOM, no network — data in, data out.
 */
import { describe, expect, it } from 'vitest';
import { generateActionDrafts } from './governanceActionsEngine';
import type { ActionRule, AIAsset, GovernanceFinding, GovernanceOutcome } from '../types';

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

function finding(overrides: Partial<GovernanceFinding> = {}): GovernanceFinding {
  return {
    id: 'finding-1',
    assetId: 'asset-1',
    assetName: 'Test Asset',
    policyId: 'policy-1',
    policyName: 'Test Policy',
    conditionType: 'Missing Approval',
    severity: 'Medium' as any,
    status: 'Open',
    detail: 'fixture finding',
    createdDate: '2026-01-01',
    ...overrides,
  };
}

describe('generateActionDrafts', () => {
  it('produces no drafts for a clean asset with no findings and no outcome', () => {
    const drafts = generateActionDrafts(baseAsset(), [], null);
    expect(drafts).toEqual([]);
  });

  it('produces one tactical action per open/under-review finding, using the condition template', () => {
    const drafts = generateActionDrafts(
      baseAsset(),
      [finding({ id: 'f1', status: 'Open', conditionType: 'Missing Owner', severity: 'High' as any })],
      null
    );
    expect(drafts).toHaveLength(1);
    expect(drafts[0]).toMatchObject({
      actionType: 'Ownership',
      name: 'Assign Accountable Owner',
      assetId: 'asset-1',
      findingId: 'f1',
      priority: 'High',
    });
  });

  it('ignores findings that are Resolved or Accepted Risk (not Open/Under Review)', () => {
    const drafts = generateActionDrafts(
      baseAsset(),
      [
        finding({ id: 'f1', status: 'Resolved' as any }),
        finding({ id: 'f2', status: 'Accepted Risk' as any }),
      ],
      null
    );
    expect(drafts).toEqual([]);
  });

  it('adds a procedural action for an escalating outcome tier', () => {
    const outcome: GovernanceOutcome = { assetId: 'asset-1', assetName: 'Test Asset', status: 'Escalation Recommended', reasons: ['critical violation'] };
    const drafts = generateActionDrafts(baseAsset(), [], outcome);
    expect(drafts).toHaveLength(1);
    expect(drafts[0]).toMatchObject({ actionType: 'Escalation', name: 'Escalate To Governance Authority', priority: 'Critical' });
  });

  it('adds no procedural action for Compliant or Attention Required outcomes (no template exists for either)', () => {
    const compliant: GovernanceOutcome = { assetId: 'asset-1', assetName: 'Test Asset', status: 'Compliant', reasons: [] };
    const attention: GovernanceOutcome = { assetId: 'asset-1', assetName: 'Test Asset', status: 'Attention Required', reasons: ['minor gap'] };
    expect(generateActionDrafts(baseAsset(), [], compliant)).toEqual([]);
    expect(generateActionDrafts(baseAsset(), [], attention)).toEqual([]);
  });

  it('combines findings and an outcome into multiple drafts in one pass', () => {
    const outcome: GovernanceOutcome = { assetId: 'asset-1', assetName: 'Test Asset', status: 'Review Required', reasons: ['open finding'] };
    const drafts = generateActionDrafts(baseAsset(), [finding({ id: 'f1' })], outcome);
    expect(drafts).toHaveLength(2);
    expect(drafts.map(d => d.actionType).sort()).toEqual(['Approval', 'Review']);
  });

  it('a matching enabled Release 10 action rule overrides the hardcoded condition template', () => {
    const rules: ActionRule[] = [
      {
        id: 'rule-1',
        triggerType: 'Condition',
        triggerValue: 'Missing Owner',
        actionType: 'Escalation',
        actionName: 'Custom Escalation Name',
        actionDescription: 'Custom description from the Action Designer.',
        enabled: true,
      },
    ];
    const drafts = generateActionDrafts(
      baseAsset(),
      [finding({ conditionType: 'Missing Owner' })],
      null,
      rules
    );
    expect(drafts[0]).toMatchObject({ actionType: 'Escalation', name: 'Custom Escalation Name' });
  });

  it('a matching disabled action rule suppresses the draft entirely, rather than falling back to the template', () => {
    const rules: ActionRule[] = [
      {
        id: 'rule-1',
        triggerType: 'Condition',
        triggerValue: 'Missing Owner',
        actionType: 'Escalation',
        actionName: 'Should not appear',
        actionDescription: 'n/a',
        enabled: false,
      },
    ];
    const drafts = generateActionDrafts(
      baseAsset(),
      [finding({ conditionType: 'Missing Owner' })],
      null,
      rules
    );
    expect(drafts).toEqual([]);
  });

  it('a disabled Release 10 outcome rule suppresses the procedural action for that outcome', () => {
    const rules: ActionRule[] = [
      { id: 'rule-2', triggerType: 'Outcome', triggerValue: 'Escalation Recommended', actionType: 'Escalation', actionName: 'x', actionDescription: 'x', enabled: false },
    ];
    const outcome: GovernanceOutcome = { assetId: 'asset-1', assetName: 'Test Asset', status: 'Escalation Recommended', reasons: [] };
    const drafts = generateActionDrafts(baseAsset(), [], outcome, rules);
    expect(drafts).toEqual([]);
  });

  it('an unrelated action rule (different triggerValue) does not affect an unmatched finding — falls back to the template', () => {
    const rules: ActionRule[] = [
      { id: 'rule-3', triggerType: 'Condition', triggerValue: 'Review Overdue', actionType: 'Escalation', actionName: 'x', actionDescription: 'x', enabled: true },
    ];
    const drafts = generateActionDrafts(baseAsset(), [finding({ conditionType: 'Missing Owner' })], null, rules);
    expect(drafts[0]).toMatchObject({ actionType: 'Ownership', name: 'Assign Accountable Owner' });
  });
});
