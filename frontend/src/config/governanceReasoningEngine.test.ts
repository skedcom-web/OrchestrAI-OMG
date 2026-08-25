/**
 * Q1 Stabilization — Phase 5 (Test Automation).
 * Pure-computation unit tests for the Release 7 Governance Intelligence
 * Engine: condition detection, policy-violation evaluation, and the outcome
 * escalation ladder. No DOM, no network — data in, data out.
 */
import { describe, expect, it } from 'vitest';
import {
  computeGovernanceOutcome,
  detectGovernanceConditions,
  evaluatePolicyViolations,
} from './governanceReasoningEngine';
import type {
  AIAsset,
  EvidenceRecord,
  GovernanceFinding,
  GovernancePolicy,
  GovernancePolicyViolation,
  GovernanceReauthorizationRecord,
  ScheduledReview,
  ValidationRecord,
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
    authorityProfile: {
      accountableOwner: 'Alice',
      governanceSponsor: 'Bob',
      riskOwner: 'Carol',
      technicalOwner: 'Dave',
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    decisionOutcome: 'GO',
    ...overrides,
  } as AIAsset;
}

describe('detectGovernanceConditions', () => {
  it('detects no conditions for a fully clean asset', () => {
    const asset = baseAsset();
    const validations: ValidationRecord[] = [{ status: 'Approved' } as ValidationRecord];
    const conditions = detectGovernanceConditions(asset, [], [], validations, []);
    expect(conditions).toEqual([]);
  });

  it('detects "Missing Approval" when decisionOutcome is PENDING', () => {
    const asset = baseAsset({ decisionOutcome: 'PENDING' });
    const validations: ValidationRecord[] = [{ status: 'Approved' } as ValidationRecord];
    const conditions = detectGovernanceConditions(asset, [], [], validations, []);
    expect(conditions.map(c => c.conditionType)).toContain('Missing Approval');
  });

  it('detects "Missing Owner" when the authority profile is incomplete', () => {
    const asset = baseAsset({
      authorityProfile: { accountableOwner: 'Alice', governanceSponsor: '', riskOwner: 'Carol', technicalOwner: 'Dave' },
    });
    const validations: ValidationRecord[] = [{ status: 'Approved' } as ValidationRecord];
    const conditions = detectGovernanceConditions(asset, [], [], validations, []);
    expect(conditions.map(c => c.conditionType)).toContain('Missing Owner');
  });

  it('detects "Missing Validation" when there is no approved validation on record', () => {
    const asset = baseAsset();
    const conditions = detectGovernanceConditions(asset, [], [], [], []);
    const missingValidation = conditions.find(c => c.conditionType === 'Missing Validation');
    expect(missingValidation).toBeDefined();
    expect(missingValidation!.detail).toBe('No validation on record.');
  });

  it('distinguishes "no validation at all" from "validation exists but none approved"', () => {
    const asset = baseAsset();
    const rejected: ValidationRecord[] = [{ status: 'Rejected' } as ValidationRecord];
    const conditions = detectGovernanceConditions(asset, [], [], rejected, []);
    const missingValidation = conditions.find(c => c.conditionType === 'Missing Validation');
    expect(missingValidation!.detail).toBe('No approved validation on record.');
  });

  it('detects "Evidence Expired" only for evidence past its expiry date', () => {
    const asset = baseAsset();
    const validations: ValidationRecord[] = [{ status: 'Approved' } as ValidationRecord];
    const evidence: EvidenceRecord[] = [
      { expiryDate: '2000-01-01T00:00:00.000Z' } as EvidenceRecord, // expired
      { expiryDate: '2999-01-01T00:00:00.000Z' } as EvidenceRecord, // valid
    ];
    const conditions = detectGovernanceConditions(asset, evidence, [], validations, []);
    const expired = conditions.find(c => c.conditionType === 'Evidence Expired');
    expect(expired).toBeDefined();
    expect(expired!.detail).toBe('1 evidence record(s) past expiry.');
  });

  it('detects "Review Overdue" for a review marked Overdue or genuinely past its due date', () => {
    const asset = baseAsset();
    const validations: ValidationRecord[] = [{ status: 'Approved' } as ValidationRecord];
    const reviews: ScheduledReview[] = [{ status: 'Overdue', dueDate: '2000-01-01T00:00:00.000Z' } as ScheduledReview];
    const conditions = detectGovernanceConditions(asset, [], reviews, validations, []);
    expect(conditions.map(c => c.conditionType)).toContain('Review Overdue');
  });

  it('does not flag a Completed review as overdue even if its due date has passed', () => {
    const asset = baseAsset();
    const validations: ValidationRecord[] = [{ status: 'Approved' } as ValidationRecord];
    const reviews: ScheduledReview[] = [{ status: 'Completed', dueDate: '2000-01-01T00:00:00.000Z' } as ScheduledReview];
    const conditions = detectGovernanceConditions(asset, [], reviews, validations, []);
    expect(conditions.map(c => c.conditionType)).not.toContain('Review Overdue');
  });

  it('detects "Missing Reauthorization" only when state is Reassessment Required with none on record', () => {
    const asset = baseAsset({ governanceState: 'Reassessment Required' });
    const validations: ValidationRecord[] = [{ status: 'Approved' } as ValidationRecord];
    const withNone = detectGovernanceConditions(asset, [], [], validations, []);
    expect(withNone.map(c => c.conditionType)).toContain('Missing Reauthorization');

    const withOne = detectGovernanceConditions(
      asset,
      [],
      [],
      validations,
      [{} as GovernanceReauthorizationRecord]
    );
    expect(withOne.map(c => c.conditionType)).not.toContain('Missing Reauthorization');
  });

  it('respects enabledConditionTypes — a disabled condition type is never raised', () => {
    const asset = baseAsset({ decisionOutcome: 'PENDING' });
    const validations: ValidationRecord[] = [{ status: 'Approved' } as ValidationRecord];
    const conditions = detectGovernanceConditions(asset, [], [], validations, [], new Set());
    expect(conditions).toEqual([]);
  });
});

describe('evaluatePolicyViolations', () => {
  const policy: GovernancePolicy = {
    id: 'pol-1',
    name: 'Approval Required Before GO',
    description: 'fixture',
    category: 'Governance',
    severity: 'Critical',
    status: 'Active',
    triggerCondition: 'Missing Approval',
    linkedControlIds: [],
  };

  it('produces one violation per matching condition for active policies', () => {
    const conditions = [{ assetId: 'a1', assetName: 'Asset 1', conditionType: 'Missing Approval' as const, detail: 'No decision on record.' }];
    const violations = evaluatePolicyViolations([policy], conditions);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({
      policyId: 'pol-1',
      assetId: 'a1',
      conditionType: 'Missing Approval',
      severity: 'Critical',
    });
  });

  it('ignores retired/draft policies even if their trigger condition is present', () => {
    const draftPolicy: GovernancePolicy = { ...policy, status: 'Draft' };
    const conditions = [{ assetId: 'a1', assetName: 'Asset 1', conditionType: 'Missing Approval' as const, detail: 'x' }];
    expect(evaluatePolicyViolations([draftPolicy], conditions)).toEqual([]);
  });

  it('ignores conditions that no active policy watches for', () => {
    const conditions = [{ assetId: 'a1', assetName: 'Asset 1', conditionType: 'Review Overdue' as const, detail: 'x' }];
    expect(evaluatePolicyViolations([policy], conditions)).toEqual([]);
  });
});

describe('computeGovernanceOutcome', () => {
  const asset = baseAsset();

  it('returns Compliant with no conditions and no violations', () => {
    const outcome = computeGovernanceOutcome(asset, [], [], []);
    expect(outcome.status).toBe('Compliant');
    expect(outcome.reasons).toContain('No governance conditions detected.');
  });

  it('escalates to Escalation Recommended for a critical policy violation, outranking a lower-tier condition', () => {
    const conditions = [{ assetId: asset.id, assetName: asset.name, conditionType: 'Missing Approval' as const, detail: 'x' }];
    const violations: GovernancePolicyViolation[] = [
      { policyId: 'p1', policyName: 'Critical Policy', assetId: asset.id, assetName: asset.name, conditionType: 'Missing Approval', detail: 'x', severity: 'Critical' },
    ];
    const outcome = computeGovernanceOutcome(asset, conditions, violations, []);
    expect(outcome.status).toBe('Escalation Recommended');
    expect(outcome.reasons.some(r => r.includes('Critical Policy'))).toBe(true);
  });

  it('escalates to Escalation Recommended for an open critical finding even with no policy violation', () => {
    const findings: GovernanceFinding[] = [
      { id: 'f1', assetId: asset.id, assetName: asset.name, policyId: 'p1', policyName: 'Some Policy', conditionType: 'Missing Owner', severity: 'Critical', status: 'Open', detail: 'critical gap', createdDate: '2026-01-01' },
    ];
    const outcome = computeGovernanceOutcome(asset, [], [], findings);
    expect(outcome.status).toBe('Escalation Recommended');
  });

  it('recommends Reassessment when governanceState is Reassessment Required', () => {
    const reassessAsset = baseAsset({ governanceState: 'Reassessment Required' });
    const outcome = computeGovernanceOutcome(reassessAsset, [], [], []);
    expect(outcome.status).toBe('Reassessment Recommended');
  });

  it('recommends Review when there are open findings but no critical/reassessment trigger', () => {
    const findings: GovernanceFinding[] = [
      { id: 'f1', assetId: asset.id, assetName: asset.name, policyId: 'p1', policyName: 'Some Policy', conditionType: 'Missing Owner', severity: 'Medium', status: 'Open', detail: 'gap', createdDate: '2026-01-01' },
    ];
    const outcome = computeGovernanceOutcome(asset, [], [], findings);
    expect(outcome.status).toBe('Review Required');
  });

  it('falls back to Attention Required for a non-critical violation/condition with no open findings', () => {
    const conditions = [{ assetId: asset.id, assetName: asset.name, conditionType: 'Missing Owner' as const, detail: 'x' }];
    const violations: GovernancePolicyViolation[] = [
      { policyId: 'p1', policyName: 'Low Policy', assetId: asset.id, assetName: asset.name, conditionType: 'Missing Owner', detail: 'x', severity: 'Low' },
    ];
    const outcome = computeGovernanceOutcome(asset, conditions, violations, []);
    expect(outcome.status).toBe('Attention Required');
  });

  it('respects disabledOutcomes — a disabled tier falls through to the next enabled tier', () => {
    const conditions = [{ assetId: asset.id, assetName: asset.name, conditionType: 'Missing Approval' as const, detail: 'x' }];
    const violations: GovernancePolicyViolation[] = [
      { policyId: 'p1', policyName: 'Critical Policy', assetId: asset.id, assetName: asset.name, conditionType: 'Missing Approval', detail: 'x', severity: 'Critical' },
    ];
    // Escalation is disabled, so a critical violation should fall through to
    // the next check the data still satisfies — here, Attention Required,
    // since there's no reassessment trigger and no open findings.
    const outcome = computeGovernanceOutcome(asset, conditions, violations, [], new Set(['Escalation Recommended']));
    expect(outcome.status).not.toBe('Escalation Recommended');
  });
});
