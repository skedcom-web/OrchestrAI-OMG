/**
 * OMG Release 12 — Regulatory Intelligence, Capability 3: Compliance Impact
 * Analysis. "What changed recently, and what's the compliance impact?"
 *
 * Reuses the Phase 10 Change Request register verbatim — every change
 * already carries a Compliance impact rating (`ImpactAssessment.Compliance`,
 * WS3) — and cross-references it against the affected asset's existing
 * governance findings and policy violations. No new change-tracking
 * mechanism, no new audit trail.
 */

import type { ChangeRequest } from '../types/changeManagement';
import type { GovernanceFinding, PolicyViolation } from '../types';

const NOTABLE_IMPACT = new Set(['Medium Impact', 'High Impact', 'Critical Impact']);

export interface ComplianceImpactEntry {
  change: ChangeRequest;
  openFindingsForAsset: number;
  openViolationsForAsset: number;
}

export function computeComplianceImpact(
  changes: ChangeRequest[],
  findings: GovernanceFinding[],
  violations: PolicyViolation[]
): ComplianceImpactEntry[] {
  return changes
    .filter(c => c.impact && NOTABLE_IMPACT.has(c.impact.Compliance))
    .map(change => ({
      change,
      openFindingsForAsset: findings.filter(f => f.assetId === change.assetId && (f.status === 'Open' || f.status === 'Under Review')).length,
      openViolationsForAsset: violations.filter(v => v.assetId === change.assetId && (v.status === 'Open' || v.status === 'Under Review')).length,
    }))
    .sort((a, b) => (b.change.requestedDate || '').localeCompare(a.change.requestedDate || ''));
}
