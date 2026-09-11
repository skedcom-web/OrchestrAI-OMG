/**
 * OMG Release 18 — Module 2: Evidence Sufficiency Engine.
 *
 * Strengthens readinessFoundation.ts's computeEvidenceReadiness() — which
 * only ever checks "does at least one non-expired evidence record exist" —
 * with a real sufficiency bar. Advisory only, computed live, exactly like
 * every other engine in this codebase: nothing here blocks anything.
 *
 * Deliberately data-in, data-out (same discipline as readinessFoundation.ts):
 * callers pass in already-loaded evidence and reassessment triggers rather
 * than this module reading storage itself.
 */
import { getExpiryIndicator } from './evidenceFoundation';
import type { AIAsset, EvidenceRecord, EvidenceSufficiencyResult, ReassessmentTrigger, RiskLevel } from '../types';

/** Module 11 — Governability Studio: "Evidence Thresholds" default, configurable per risk tier. */
export const DEFAULT_EVIDENCE_COMPLETENESS_MINIMUMS: Record<RiskLevel, number> = {
  Critical: 2,
  High: 2,
  Medium: 1,
  Low: 1,
};

/** Evidence types that speak to whether a decision was actually earned, not just administered. */
const DECISION_RELEVANT_EVIDENCE_TYPES = new Set([
  'Validation Report',
  'Approval Record',
  'Risk Assessment',
  'Control Assessment',
  'Third-Party Assessment',
]);

export function computeEvidenceSufficiency(
  asset: AIAsset,
  assetEvidence: EvidenceRecord[],
  assetTriggers: ReassessmentTrigger[],
  completenessMinimums: Record<RiskLevel, number> = DEFAULT_EVIDENCE_COMPLETENESS_MINIMUMS
): EvidenceSufficiencyResult {
  const reasons: string[] = [];

  const activeEvidence = assetEvidence.filter(e => e.status === 'Active');
  const activeNonExpired = activeEvidence.filter(e => getExpiryIndicator(e.expiryDate) !== 'Expired');

  // Dimension 1 — Evidence Availability
  const evidenceAvailable = activeEvidence.length > 0;
  if (!evidenceAvailable) reasons.push('No active evidence record exists for this asset.');

  // Dimension 2 — Evidence Recency
  const evidenceRecency = activeNonExpired.length > 0;
  if (evidenceAvailable && !evidenceRecency) reasons.push('Every active evidence record has expired.');

  // Dimension 3 — Evidence Completeness (risk-proportionate minimum count)
  const minimumRequired = completenessMinimums[asset.riskLevel] ?? 1;
  const evidenceCompleteness = activeNonExpired.length >= minimumRequired;
  if (!evidenceCompleteness) reasons.push(`${activeNonExpired.length} of ${minimumRequired} required evidence record(s) on file for ${asset.riskLevel} risk.`);

  // Dimension 4 — Evidence Relevance (at least one decision-relevant type, not just administrative)
  const evidenceRelevance = activeNonExpired.some(e => DECISION_RELEVANT_EVIDENCE_TYPES.has(e.evidenceType));
  if (!evidenceRelevance) reasons.push('No Validation, Approval, Risk, Control or Third-Party Assessment evidence on file.');

  // Dimension 5 — Evidence Context Alignment: does the newest active evidence
  // predate a material change that has since been detected? If a reassessment
  // trigger fired after the evidence was filed, that evidence has not caught
  // up with current context.
  const newestEvidence = [...activeNonExpired].sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())[0];
  const openOrReviewTriggers = assetTriggers.filter(t => t.status === 'Open' || t.status === 'Under Review');
  const evidenceContextAlignment = !!newestEvidence && !openOrReviewTriggers.some(t => new Date(t.dateDetected).getTime() > new Date(newestEvidence.createdDate).getTime());
  if (newestEvidence && !evidenceContextAlignment) reasons.push('A material change was detected after the most recent evidence was filed — evidence has not caught up with current context.');
  else if (!newestEvidence) reasons.push('No current evidence to assess for context alignment.');

  const passed = [evidenceAvailable, evidenceRecency, evidenceCompleteness, evidenceRelevance, evidenceContextAlignment].filter(Boolean).length;
  const status = !evidenceAvailable ? 'Insufficient' : passed === 5 ? 'Sufficient' : 'Partially Sufficient';

  if (status === 'Sufficient') reasons.length = 0;
  if (status === 'Sufficient') reasons.push('Evidence is current, complete, relevant and aligned with current context.');

  return {
    status,
    evidenceAvailable,
    evidenceRecency,
    evidenceCompleteness,
    evidenceRelevance,
    evidenceContextAlignment,
    reasons,
  };
}
