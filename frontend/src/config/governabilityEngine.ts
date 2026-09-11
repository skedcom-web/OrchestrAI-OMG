/**
 * OMG Release 18 — Module 1: Governability Engine.
 *
 * Determines whether governance legitimacy can still be established for an
 * asset, by composing the Evidence Sufficiency, Authority Currency and
 * Admissibility engines into one live, explainable verdict — the single
 * composite the earlier Runtime Governability analysis identified as OMG's
 * highest-leverage gap. Every input is a signal OMG already computes; this
 * module adds no new stored data, only a composition.
 *
 * Advisory only, exactly like every governance engine in this codebase:
 * "Not Governable" is a recommendation for a human to act on, never an
 * automatic suspension, block or execution.
 */
import { computeEvidenceSufficiency, DEFAULT_EVIDENCE_COMPLETENESS_MINIMUMS } from './evidenceSufficiencyEngine';
import { computeAuthorityCurrency, DEFAULT_AUTHORITY_REVIEW_PERIOD_DAYS, DEFAULT_AUTHORITY_WARNING_PERIOD_DAYS } from './authorityCurrencyEngine';
import { computeAdmissibility } from './admissibilityEngine';
import type { AIAsset, EvidenceRecord, GovernabilityResult, GovernanceOutcomeStatus, ReassessmentTrigger, RiskLevel } from '../types';

export interface GovernabilityConfigOverrides {
  evidenceCompletenessMinimums?: Record<RiskLevel, number>;
  authorityReviewPeriodDays?: number;
  authorityWarningPeriodDays?: number;
}

export function computeGovernability(
  asset: AIAsset,
  assetEvidence: EvidenceRecord[],
  assetTriggers: ReassessmentTrigger[],
  governanceOutcomeStatus: GovernanceOutcomeStatus | null,
  config: GovernabilityConfigOverrides = {}
): GovernabilityResult {
  const evidenceSufficiency = computeEvidenceSufficiency(
    asset,
    assetEvidence,
    assetTriggers,
    config.evidenceCompletenessMinimums || DEFAULT_EVIDENCE_COMPLETENESS_MINIMUMS
  );
  const authorityCurrency = computeAuthorityCurrency(
    asset,
    config.authorityReviewPeriodDays ?? DEFAULT_AUTHORITY_REVIEW_PERIOD_DAYS,
    config.authorityWarningPeriodDays ?? DEFAULT_AUTHORITY_WARNING_PERIOD_DAYS
  );
  const hasOpenReassessmentTrigger = assetTriggers.some(t => t.status === 'Open' || t.status === 'Under Review');
  const admissibility = computeAdmissibility(
    asset.governanceState,
    asset.riskLevel,
    governanceOutcomeStatus,
    evidenceSufficiency,
    authorityCurrency,
    hasOpenReassessmentTrigger
  );

  const reasons: string[] = [];
  let status: GovernabilityResult['status'];

  if (admissibility.outcome === 'Pause' || authorityCurrency.status === 'Expired') {
    status = 'Not Governable';
    reasons.push(...admissibility.reasons);
  } else if (admissibility.outcome === 'Escalate') {
    status = 'Governance Attention Required';
    reasons.push(...admissibility.reasons);
  } else if (admissibility.outcome === 'Reauthorize') {
    status = 'Review Required';
    reasons.push(...admissibility.reasons);
  } else if (admissibility.outcome === 'Continue With Conditions') {
    status = 'Governable With Conditions';
    reasons.push(...admissibility.reasons);
  } else {
    status = 'Governable';
    reasons.push('Evidence, authority and admissibility all support continued governance.');
  }

  return {
    assetId: asset.id,
    assetName: asset.name,
    status,
    evidenceSufficiency,
    authorityCurrency,
    admissibility,
    reasons,
  };
}
