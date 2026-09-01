/**
 * OMG Release 11 — Governance Effectiveness & Outcomes Engine, Capability 5.
 *
 * Reframes existing activity data (findings, policy violations, drift) as
 * outcomes rather than activity counts — "what did governance actually fix"
 * instead of "what got reviewed." Pure aggregation over data that already
 * exists; no new source of truth, nothing persisted.
 */

import type { GovernanceDrift, GovernanceFinding, PolicyViolation } from '../types';

const CLOSED_VIOLATION_STATUSES = new Set(['Remediated', 'Closed']);

export interface GovernanceOutcomesResult {
  governanceRisksPrevented: number;
  governanceDriftEventsResolved: number;
  missingEvidenceCasesClosed: number;
  expiredApprovalsIdentified: number;
  policyViolationsCorrected: number;
  accountabilityGapsEliminated: number;
}

export function computeGovernanceOutcomes(
  findings: GovernanceFinding[],
  policyViolations: PolicyViolation[],
  drifts: GovernanceDrift[]
): GovernanceOutcomesResult {
  const highSeverityFindingsResolved = findings.filter(
    f => f.status === 'Resolved' && (f.severity === 'High' || f.severity === 'Critical')
  ).length;
  const policyViolationsCorrected = policyViolations.filter(v => CLOSED_VIOLATION_STATUSES.has(v.status)).length;

  const governanceRisksPrevented = highSeverityFindingsResolved + policyViolationsCorrected;
  const governanceDriftEventsResolved = drifts.filter(d => d.status === 'Resolved').length;

  const missingEvidenceCasesClosed =
    findings.filter(f => f.conditionType === 'Evidence Expired' && f.status === 'Resolved').length +
    drifts.filter(d => d.category === 'Evidence' && d.status === 'Resolved').length;

  const expiredApprovalsIdentified =
    findings.filter(f => f.conditionType === 'Missing Approval').length +
    drifts.filter(d => d.category === 'Approval').length;

  const accountabilityGapsEliminated =
    findings.filter(f => f.conditionType === 'Missing Owner' && f.status === 'Resolved').length +
    drifts.filter(d => d.category === 'Ownership' && d.status === 'Resolved').length;

  return {
    governanceRisksPrevented,
    governanceDriftEventsResolved,
    missingEvidenceCasesClosed,
    expiredApprovalsIdentified,
    policyViolationsCorrected,
    accountabilityGapsEliminated,
  };
}
