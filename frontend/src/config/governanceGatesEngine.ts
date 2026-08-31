/**
 * OMG vNext — Governance Intelligence, Module 4: Governance Gates.
 *
 * Advisory only. A gate reports PASS (Governance Ready), PENDING (Governance
 * Review Required) or FAIL (Governance Not Ready) for one governance
 * dimension, purely as information. Nothing here disables a button, blocks a
 * workflow transition, rejects an API call or blocks an approval/deployment
 * — human accountability remains the final authority, exactly like
 * readinessFoundation.ts and governanceReadinessScore.ts. See
 * ARCHITECTURAL REFINEMENT DIRECTIVE, Module 1 / Module 4.
 *
 * Deliberately NOT persisted (no GovernanceGate table/repository) — gates
 * are calculated state, recomputed from the same signals readinessFoundation.ts
 * already reads (ownership, evidence, reviews, reassessment, decision,
 * policy mapping / violations), not a new source of truth.
 */

import { authorityProfileCompleteness } from './governanceAuthority';
import { computeEvidenceReadiness } from './readinessFoundation';
import type { AIAsset, EvidenceRecord, Policy, PolicyViolation } from '../types';

export type GateStatus = 'PASS' | 'PENDING' | 'FAIL';
export type GateKey = 'ownership' | 'risk' | 'evidence' | 'approval' | 'controlAssurance';

export const GATE_LABELS: Record<GateKey, string> = {
  ownership: 'Ownership Gate',
  risk: 'Risk Gate',
  evidence: 'Evidence Gate',
  approval: 'Approval Gate',
  controlAssurance: 'Control Assurance Gate',
};

export interface GovernanceGate {
  key: GateKey;
  label: string;
  status: GateStatus;
  detail: string;
}

export type DeploymentReadiness = 'Ready for Deployment' | 'Partially Ready' | 'Not Ready';

export interface GovernanceGatesResult {
  assetId: string;
  assetName: string;
  gates: Record<GateKey, GovernanceGate>;
  readiness: DeploymentReadiness;
}

function gate(key: GateKey, status: GateStatus, detail: string): GovernanceGate {
  return { key, label: GATE_LABELS[key], status, detail };
}

const OPEN_VIOLATION_STATUSES = new Set(['Open', 'Under Review']);

export function computeGovernanceGates(
  asset: AIAsset,
  assetEvidence: EvidenceRecord[],
  assetPolicies: Policy[],
  assetPolicyViolations: PolicyViolation[]
): GovernanceGatesResult {
  const ownershipCount = authorityProfileCompleteness(asset.authorityProfile);
  const ownership = gate(
    'ownership',
    ownershipCount === 4 ? 'PASS' : ownershipCount === 0 ? 'FAIL' : 'PENDING',
    ownershipCount === 4
      ? 'All four governance owners assigned.'
      : ownershipCount === 0
        ? 'No accountable owner exists — no governance owner assigned.'
        : `${ownershipCount}/4 governance owners assigned.`
  );

  const riskSignals = [!!asset.riskLevel, !!asset.dataSensitivity].filter(Boolean).length;
  const risk = gate(
    'risk',
    riskSignals === 2 ? 'PASS' : riskSignals === 0 ? 'FAIL' : 'PENDING',
    riskSignals === 2
      ? `Risk assessment completed: ${asset.riskLevel} risk, ${asset.dataSensitivity} data.`
      : riskSignals === 0
        ? 'Risk assessment not completed.'
        : 'Risk assessment partially completed.'
  );

  const evidenceReadiness = computeEvidenceReadiness(asset, assetEvidence);
  const evidenceStatusMap: Record<typeof evidenceReadiness.status, GateStatus> = {
    'Ready': 'PASS',
    'Partially Ready': 'PENDING',
    'Not Ready': 'FAIL',
  };
  const evidence = gate(
    'evidence',
    evidenceStatusMap[evidenceReadiness.status],
    evidenceReadiness.evidenceExists
      ? evidenceReadiness.evidenceNotExpired
        ? 'Required evidence available and current.'
        : 'Evidence on file has expired entries.'
      : 'No required evidence available.'
  );

  const decisionRecorded = !!asset.decisionOutcome && asset.decisionOutcome !== 'PENDING';
  const approval = gate(
    'approval',
    decisionRecorded ? 'PASS' : 'FAIL',
    decisionRecorded
      ? `Governance approval recorded: ${asset.decisionOutcome}.`
      : 'No governance approval recorded.'
  );

  const openViolations = assetPolicyViolations.filter(v => OPEN_VIOLATION_STATUSES.has(v.status));
  const controlAssurance = gate(
    'controlAssurance',
    assetPolicies.length === 0 ? 'PENDING' : openViolations.length > 0 ? 'FAIL' : 'PASS',
    assetPolicies.length === 0
      ? 'No controls mapped to this asset yet.'
      : openViolations.length > 0
        ? `${openViolations.length} open policy violation(s) against mapped controls.`
        : `${assetPolicies.length} control(s) mapped, no open violations.`
  );

  const gates: Record<GateKey, GovernanceGate> = { ownership, risk, evidence, approval, controlAssurance };
  const statuses = Object.values(gates).map(g => g.status);
  const readiness: DeploymentReadiness = statuses.includes('FAIL')
    ? 'Not Ready'
    : statuses.includes('PENDING')
      ? 'Partially Ready'
      : 'Ready for Deployment';

  return { assetId: asset.id, assetName: asset.name, gates, readiness };
}
