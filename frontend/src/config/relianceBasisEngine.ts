/**
 * OMG Release 19 — Domain E: Governance Reliance Basis Registry.
 *
 * Captures *why* a governance position remains valid — the assumptions,
 * required controls, required evidence, and regulatory/operational
 * dependencies a decision was made in reliance on. A governance decision
 * can be perfectly well-evidenced and well-authorised at the moment it is
 * made and still stop being valid later, purely because something it relied
 * on quietly broke — this registry makes that reliance explicit and
 * checkable instead of implicit and undiscoverable.
 *
 * Advisory only, computed live — nothing here is itself a control or a
 * piece of evidence; it is a record of what a decision leans on.
 */
import type { GovernanceRelianceElement, RelianceBasisResult, RelianceBasisStatus } from '../types';

export function computeRelianceBasis(
  assetId: string,
  assetName: string,
  elements: GovernanceRelianceElement[]
): RelianceBasisResult {
  const assetElements = elements.filter(e => e.assetId === assetId);
  const reasons: string[] = [];

  if (assetElements.length === 0) {
    return {
      assetId,
      assetName,
      status: 'Reliance Degraded',
      elements: [],
      reasons: ['No reliance basis has been recorded — what this governance position depends on is not yet documented.'],
    };
  }

  const broken = assetElements.filter(e => e.status === 'Broken');
  const degraded = assetElements.filter(e => e.status === 'Degraded');

  let status: RelianceBasisStatus;
  if (broken.length > 0) {
    status = 'Reliance Broken';
    reasons.push(...broken.map(e => `${e.elementType} broken: ${e.description}`));
  } else if (degraded.length > 0) {
    status = 'Reliance Degraded';
    reasons.push(...degraded.map(e => `${e.elementType} degraded: ${e.description}`));
  } else {
    status = 'Reliance Valid';
    reasons.push(`All ${assetElements.length} reliance element(s) — ${assetElements.map(e => e.elementType).join(', ')} — remain valid.`);
  }

  return { assetId, assetName, status, elements: assetElements, reasons };
}
