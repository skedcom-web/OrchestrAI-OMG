/**
 * OMG Release 18 — Module 4: Admissibility Assessment Engine.
 *
 * Determines whether the next governance decision remains legitimate, by
 * composing signals OMG already computes: the existing Governance Outcome
 * ladder (governanceReasoningEngine.ts), the new Evidence Sufficiency and
 * Authority Currency engines, and whether a reassessment is already open.
 * This is the diff the earlier Runtime Governability analysis called for —
 * "conditions now" against "conditions the last decision was made under" —
 * built as a strict composition, not a new stored decision object.
 *
 * Advisory only. "Pause" is a recommendation, never an automatic action —
 * exactly like every kill-switch-adjacent signal elsewhere in OMG, nothing
 * here suspends, blocks or executes on its own.
 */
import type {
  AdmissibilityResult,
  AuthorityCurrencyResult,
  EvidenceSufficiencyResult,
  GovernanceOutcomeStatus,
  GovernanceState,
  RiskLevel,
} from '../types';

export function computeAdmissibility(
  governanceState: GovernanceState | undefined,
  riskLevel: RiskLevel,
  governanceOutcomeStatus: GovernanceOutcomeStatus | null,
  evidenceSufficiency: EvidenceSufficiencyResult,
  authorityCurrency: AuthorityCurrencyResult,
  hasOpenReassessmentTrigger: boolean
): AdmissibilityResult {
  const reasons: string[] = [];
  const highRisk = riskLevel === 'Critical' || riskLevel === 'High';

  // Most severe first — mirrors the existing outcome ladder's ordering discipline.
  if (authorityCurrency.status === 'Expired' || (evidenceSufficiency.status === 'Insufficient' && highRisk)) {
    if (authorityCurrency.status === 'Expired') reasons.push('Authority has expired — continued execution cannot be sustained without reauthorization.');
    if (evidenceSufficiency.status === 'Insufficient' && highRisk) reasons.push('No sufficient evidence exists for a High/Critical risk asset.');
    return { outcome: 'Pause', reasons };
  }

  if (governanceOutcomeStatus === 'Escalation Recommended' || (authorityCurrency.status === 'Review Required' && hasOpenReassessmentTrigger)) {
    if (governanceOutcomeStatus === 'Escalation Recommended') reasons.push('The governance reasoning engine already recommends escalation.');
    if (authorityCurrency.status === 'Review Required' && hasOpenReassessmentTrigger) reasons.push('Authority needs review while a reassessment trigger is open.');
    return { outcome: 'Escalate', reasons };
  }

  if (governanceState === 'Reassessment Required' || hasOpenReassessmentTrigger || governanceOutcomeStatus === 'Reassessment Recommended') {
    reasons.push('A material change has been detected — the last decision should be re-earned, not assumed.');
    return { outcome: 'Reauthorize', reasons };
  }

  if (evidenceSufficiency.status === 'Partially Sufficient' || authorityCurrency.status === 'Review Required' || governanceOutcomeStatus === 'Review Required' || governanceOutcomeStatus === 'Attention Required') {
    if (evidenceSufficiency.status === 'Partially Sufficient') reasons.push('Evidence is only partially sufficient.');
    if (authorityCurrency.status === 'Review Required') reasons.push('Authority is due for review.');
    if (governanceOutcomeStatus === 'Review Required' || governanceOutcomeStatus === 'Attention Required') reasons.push(`Governance outcome currently reads ${governanceOutcomeStatus}.`);
    return { outcome: 'Continue With Conditions', reasons };
  }

  reasons.push('Evidence is sufficient, authority is current, and no open reassessment is pending.');
  return { outcome: 'Continue', reasons };
}
