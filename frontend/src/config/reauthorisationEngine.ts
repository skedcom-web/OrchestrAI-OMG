/**
 * OMG Release 19 — Domain F: Reauthorisation Engine.
 * Refactored under Release 19.1 — Governance State Harmonisation: this
 * engine now reads the same raw upstream signals (Governability, Reliance
 * Basis, Authority Currency, open triggers) the Governance State Resolution
 * Layer (GSRL) reads, rather than depending on the GSRL's own resolved
 * Unified Governance State. That earlier design was circular — Unified
 * State depended on Reauthorisation, which depended on Unified State.
 * Reauthorisation and the GSRL are now siblings, both fed by the same
 * upstream engines, never nested inside one another.
 *
 * Principle 5 — Reauthorisation Over Reprocessing: a material change must
 * trigger a reauthorisation *assessment*, not merely a workflow re-run.
 * Integrates with the existing Reassessment Engine (Release 18's
 * ReassessmentTrigger) rather than replacing it — an open reassessment
 * trigger is read as one input signal here, not duplicated into a second
 * trigger taxonomy.
 *
 * Advisory only — "Suspend Governance Position" is a recommendation for a
 * human to act on, never an automatic suspension.
 */
import type {
  AuthorityCurrencyResult,
  GovernabilityResult,
  ReauthorisationOutcome,
  ReauthorisationResult,
  ReauthorisationTriggerType,
  RelianceBasisResult,
} from '../types';

export function computeReauthorisation(
  governability: GovernabilityResult,
  reliance: RelianceBasisResult,
  authorityCurrency: AuthorityCurrencyResult,
  hasOpenReassessmentTrigger: boolean,
  hasOpenRegulatoryOrPolicyTrigger: boolean,
  hasOpenRiskEscalationTrigger: boolean
): ReauthorisationResult {
  const triggerTypes: ReauthorisationTriggerType[] = [];
  const reasons: string[] = [];

  if (hasOpenReassessmentTrigger) triggerTypes.push('Material Change');
  if (authorityCurrency.status === 'Expired' || authorityCurrency.status === 'Review Required') triggerTypes.push('Authority Change');
  if (reliance.status === 'Reliance Broken' || reliance.status === 'Reliance Degraded') triggerTypes.push('Reliance Failure');
  if (governability.status === 'Not Governable' || governability.status === 'Governance Attention Required') triggerTypes.push('Evidence Insufficiency');
  if (hasOpenRegulatoryOrPolicyTrigger) { triggerTypes.push('Regulatory Change'); triggerTypes.push('Policy Change'); }
  if (hasOpenRiskEscalationTrigger) triggerTypes.push('Risk Escalation');

  let outcome: ReauthorisationOutcome;

  if (governability.status === 'Not Governable' || reliance.status === 'Reliance Broken' || authorityCurrency.status === 'Expired') {
    outcome = 'Suspend Governance Position';
    reasons.push('Governance is not currently governable, reliance basis is broken, or authority has expired — the current position should not be assumed to still hold.');
  } else if (governability.status === 'Review Required' || governability.status === 'Governance Attention Required') {
    outcome = 'Reauthorise';
    reasons.push(...governability.reasons);
  } else if (triggerTypes.length > 0) {
    outcome = 'Reassess';
    reasons.push(`Open signal(s) require reassessment before continuation is assumed: ${triggerTypes.join(', ')}.`);
  } else {
    outcome = 'Continue';
    reasons.push('No open material change, authority, reliance, evidence, regulatory or risk signal currently requires reauthorisation.');
  }

  return {
    assetId: governability.assetId,
    assetName: governability.assetName,
    outcome,
    triggerTypes,
    reasons,
  };
}
