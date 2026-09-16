/**
 * OMG Release 19.1 — Governance State Resolution Layer (GSRL).
 *
 * Architectural Principle: One Governance Reality. Every governed asset
 * must have ONE authoritative governance state. Local workflow states
 * (Findings' Open/In Progress/Closed, the separate Change Request
 * lifecycle, Governance Continuity's own date-based status, etc.) are
 * explicitly untouched and continue to mean whatever they already mean —
 * none of them becomes, or is replaced by, the governance truth. The GSRL
 * only resolves them, alongside the newer Release 19 engines, into one
 * state a human or any module can trust without cross-referencing five
 * screens.
 *
 * Every engine that feeds this layer is a signal PROVIDER, never itself
 * authoritative:
 *  - Authority Currency Engine  -> Current / Review Required / Expired / Not Applicable
 *  - Reliance Basis Engine      -> Reliance Valid / Degraded / Broken
 *  - Evidence Sufficiency Engine -> Sufficient / Partially Sufficient / Insufficient
 *  - Admissibility Engine       -> Continue / Continue With Conditions / Escalate / Reauthorize / Pause
 *  - Reauthorisation Engine     -> Continue / Reassess / Reauthorise / Suspend Governance Position
 *  - Governance Continuity      -> mapped from the existing date-based ReauthorizationStatus
 *
 * Resolution is ordered most-severe-first, the same discipline every other
 * engine in this codebase already follows (see admissibilityEngine.ts) —
 * this is what makes "no conflicting governance truths" actually hold: a
 * single asset can never satisfy two rules at once and get an ambiguous
 * answer, because the first matching rule, in severity order, always wins.
 *
 * Advisory only — "Governance Invalid" is a description of current
 * standing, never an automatic suspension, block or execution.
 */
import type {
  AdmissibilityResult,
  AGPStatus,
  AuthorityCurrencyResult,
  EvidenceSufficiencyResult,
  GovernabilityResult,
  GovernanceContinuitySignal,
  GovernanceStateSignalBreakdown,
  ReauthorisationResult,
  RelianceBasisResult,
  UnifiedGovernanceState,
  UnifiedGovernanceStateResult,
} from '../types';

export interface GovernanceStateSignals {
  assetId: string;
  assetName: string;
  governability: GovernabilityResult;
  authorityCurrency: AuthorityCurrencyResult;
  relianceBasis: RelianceBasisResult;
  evidenceSufficiency: EvidenceSufficiencyResult;
  admissibility: AdmissibilityResult;
  reauthorisation: ReauthorisationResult;
  governanceContinuity: GovernanceContinuitySignal;
  activeAGPStatus: AGPStatus | null;
  isRetired: boolean;
}

export function resolveGovernanceState(signals: GovernanceStateSignals): UnifiedGovernanceStateResult {
  const {
    assetId, assetName, governability, authorityCurrency, relianceBasis, evidenceSufficiency,
    admissibility, reauthorisation, governanceContinuity, activeAGPStatus, isRetired,
  } = signals;

  const reasons: string[] = [];
  let state: UnifiedGovernanceState;

  if (isRetired) {
    state = 'Retired';
    reasons.push('Asset has been retired — governance is closed, not active.');
  } else if (
    authorityCurrency.status === 'Expired' ||
    relianceBasis.status === 'Reliance Broken' ||
    admissibility.outcome === 'Pause' ||
    reauthorisation.outcome === 'Suspend Governance Position'
  ) {
    state = 'Governance Invalid';
    if (authorityCurrency.status === 'Expired') reasons.push('Authority has expired.');
    if (relianceBasis.status === 'Reliance Broken') reasons.push(...relianceBasis.reasons);
    if (admissibility.outcome === 'Pause') reasons.push(...admissibility.reasons);
    if (reauthorisation.outcome === 'Suspend Governance Position') reasons.push(...reauthorisation.reasons);
  } else if (
    reauthorisation.outcome === 'Reauthorise' ||
    !activeAGPStatus ||
    activeAGPStatus === 'Expired' ||
    activeAGPStatus === 'Superseded'
  ) {
    state = 'Pending Reauthorisation';
    if (reauthorisation.outcome === 'Reauthorise') reasons.push(...reauthorisation.reasons);
    if (!activeAGPStatus) reasons.push('No Authorised Governance Position is currently on file for this asset.');
    else if (activeAGPStatus === 'Expired') reasons.push('The Authorised Governance Position has expired.');
    else if (activeAGPStatus === 'Superseded') reasons.push('The Authorised Governance Position has been superseded and not yet replaced.');
  } else if (
    authorityCurrency.status === 'Review Required' ||
    governanceContinuity === 'Escalate'
  ) {
    state = 'Governance At Risk';
    reasons.push(...authorityCurrency.reasons);
    if (governanceContinuity === 'Escalate') reasons.push('Governance Continuity has escalated — the scheduled review window has been missed.');
  } else if (
    relianceBasis.status === 'Reliance Degraded' ||
    evidenceSufficiency.status === 'Partially Sufficient' ||
    admissibility.outcome === 'Continue With Conditions' ||
    reauthorisation.outcome === 'Reassess' ||
    governanceContinuity === 'Reassess' ||
    activeAGPStatus === 'Suspended'
  ) {
    state = 'Conditionally Governed';
    if (relianceBasis.status === 'Reliance Degraded') reasons.push(...relianceBasis.reasons);
    if (evidenceSufficiency.status === 'Partially Sufficient') reasons.push('Evidence is only partially sufficient.');
    if (admissibility.outcome === 'Continue With Conditions') reasons.push(...admissibility.reasons);
    if (reauthorisation.outcome === 'Reassess') reasons.push(...reauthorisation.reasons);
    if (governanceContinuity === 'Reassess') reasons.push('Governance Continuity flags this review as overdue.');
    if (activeAGPStatus === 'Suspended') reasons.push('The Authorised Governance Position itself is suspended.');
  } else {
    state = 'Governed';
    reasons.push('Authority is current, reliance basis is valid, evidence is sufficient, and admissibility, reauthorisation and continuity all support continued governance.');
  }

  const signalBreakdown: GovernanceStateSignalBreakdown = {
    authorityCurrency: authorityCurrency.status,
    relianceBasis: relianceBasis.status,
    evidenceSufficiency: evidenceSufficiency.status,
    admissibility: admissibility.outcome,
    reauthorisation: reauthorisation.outcome,
    governanceContinuity,
    governancePosition: activeAGPStatus ?? 'None',
  };

  return {
    assetId,
    assetName,
    state,
    reasons,
    sourceGovernabilityStatus: governability.status,
    sourceRelianceStatus: relianceBasis.status,
    sourceAGPStatus: activeAGPStatus,
    signalBreakdown,
    lastEvaluatedAt: new Date().toISOString(),
  };
}
