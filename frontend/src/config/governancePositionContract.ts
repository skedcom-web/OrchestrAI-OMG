/**
 * OMG Release 19 — Domain C + G: Authorised Governance Position helpers and
 * the Governance Position Contract builder.
 *
 * Domain G's "standard governance handoff model" is deliberately just data —
 * a package a downstream runtime or execution system *may* consume. Runtime
 * implementation of anything in the contract remains entirely external to
 * OMG (Principle: OMG SHALL NOT become the runtime enforcement platform).
 * This module only shapes an existing Authorised Governance Position (AGP)
 * into that package; it stores nothing new that the AGP didn't already say.
 */
import type { AuthorisedGovernancePosition, GovernancePositionContract } from '../types';

export function buildGovernancePositionContract(
  agp: AuthorisedGovernancePosition,
  issuedBy: string
): Omit<GovernancePositionContract, 'id'> {
  return {
    assetId: agp.assetId,
    assetName: agp.assetName,
    governancePositionId: agp.id,
    conditions: agp.conditions,
    obligations: agp.obligations,
    monitoringExpectations: agp.relianceElementIds.length > 0
      ? [`Monitor the ${agp.relianceElementIds.length} reliance element(s) this position depends on for continued validity.`]
      : ['No reliance elements are currently linked to this position — monitoring expectations cannot be derived.'],
    reviewRequirements: agp.validUntil
      ? [`Review before ${agp.validUntil}, when this position's validity window closes.`]
      : ['No validity end date is set — review on the next scheduled governance reassessment.'],
    reportingRequirements: ['Report any condition breach, obligation failure, or reliance element status change back into OMG as new evidence, so the next Governability computation reflects it.'],
    issuedAt: new Date().toISOString(),
    issuedBy,
    workspaceId: agp.workspaceId,
    tenantId: agp.tenantId,
    environmentId: agp.environmentId,
  };
}
