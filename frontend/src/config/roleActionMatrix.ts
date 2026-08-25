/**
 * Q1 Stabilization — Phase 2: Role Action Matrix.
 *
 * Single source of truth for which roles may perform which write actions.
 * Built directly from the backend's actual `@Roles()` grants in
 * `backend/src/app.controller.ts` (verified endpoint-by-endpoint), so the
 * frontend's gating can never silently drift from what the API actually
 * enforces. This file is both the enforcement data (via `canPerform` in
 * AuthContext) and the audited deliverable itself — see
 * docs/qa/OMG_Quality_Remediation_Report.md for the rendered table.
 */
import type { UserRole } from '../types';

export type ActionKey =
  | 'asset:create'
  | 'asset:edit'
  | 'asset:archive'
  | 'asset:restore'
  | 'evidenceRecord:create'
  | 'evidenceRecord:edit'
  | 'evidenceRecord:delete'
  | 'reassessmentTrigger:create'
  | 'reassessmentTrigger:edit'
  | 'reauthorizationRecord:create'
  | 'compliancePack:create'
  | 'compliancePack:edit'
  | 'compliancePack:delete'
  | 'complianceRequirement:create'
  | 'complianceRequirement:edit'
  | 'complianceRequirement:delete'
  | 'packControl:create'
  | 'packControl:edit'
  | 'packControl:delete'
  | 'evidenceMapping:create'
  | 'evidenceMapping:edit'
  | 'evidenceMapping:delete'
  | 'regulatorySource:create'
  | 'regulatorySource:edit'
  | 'regulatorySource:delete'
  | 'regulatoryRequirement:create'
  | 'regulatoryRequirement:edit'
  | 'regulatoryRequirement:delete'
  | 'obligation:create'
  | 'obligation:edit'
  | 'obligation:delete'
  | 'obligationControl:create'
  | 'obligationControl:edit'
  | 'obligationControl:delete'
  | 'obligationEvidenceMapping:create'
  | 'obligationEvidenceMapping:edit'
  | 'obligationEvidenceMapping:delete'
  | 'governancePolicy:create'
  | 'governancePolicy:edit'
  | 'governancePolicy:delete'
  | 'governanceFinding:create'
  | 'governanceFinding:edit'
  | 'governanceFinding:delete'
  | 'recommendedAction:create'
  | 'recommendedAction:edit'
  | 'recommendedAction:delete'
  | 'conditionDefinition:create'
  | 'conditionDefinition:edit'
  | 'outcomeRule:create'
  | 'outcomeRule:edit'
  | 'actionRule:create'
  | 'actionRule:edit'
  | 'actionRule:delete'
  | 'governanceProfile:create'
  | 'governanceProfile:edit'
  | 'scheduledReview:create'
  | 'scheduledReview:edit'
  | 'correctiveAction:create'
  | 'user:view'
  /** Q1 Stabilization — Phase 4 follow-up: these two safety-critical controls have
   * no backend write endpoint at all (client-side only, a known gap), so there is
   * no @Roles() grant to mirror. Scoped deliberately tighter than the generic
   * !isReadOnly fallback other client-only actions use, since accidentally
   * over-permissioning an emergency stop is a materially worse failure mode than
   * over-permissioning ordinary CRUD. */
  | 'killSwitch:engage'
  | 'killSwitch:release'
  | 'override:record';

/** Mirrors backend/src/app.controller.ts's @Roles() grants exactly, endpoint by endpoint. */
export const ROLE_ACTION_MATRIX: Record<ActionKey, UserRole[]> = {
  'asset:create': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],
  'asset:edit': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],
  'asset:archive': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],
  'asset:restore': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],

  'evidenceRecord:create': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER'],
  'evidenceRecord:edit': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER'],
  'evidenceRecord:delete': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],

  'reassessmentTrigger:create': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER'],
  'reassessmentTrigger:edit': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER'],

  'reauthorizationRecord:create': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],

  'compliancePack:create': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],
  'compliancePack:edit': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],
  'compliancePack:delete': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],

  'complianceRequirement:create': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],
  'complianceRequirement:edit': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],
  'complianceRequirement:delete': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],

  'packControl:create': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],
  'packControl:edit': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],
  'packControl:delete': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],

  'evidenceMapping:create': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER'],
  'evidenceMapping:edit': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER'],
  'evidenceMapping:delete': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],

  'regulatorySource:create': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],
  'regulatorySource:edit': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],
  'regulatorySource:delete': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],

  'regulatoryRequirement:create': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],
  'regulatoryRequirement:edit': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],
  'regulatoryRequirement:delete': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],

  'obligation:create': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],
  'obligation:edit': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],
  'obligation:delete': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],

  'obligationControl:create': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],
  'obligationControl:edit': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],
  'obligationControl:delete': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],

  'obligationEvidenceMapping:create': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER'],
  'obligationEvidenceMapping:edit': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER'],
  'obligationEvidenceMapping:delete': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],

  'governancePolicy:create': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],
  'governancePolicy:edit': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],
  'governancePolicy:delete': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],

  'governanceFinding:create': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER'],
  'governanceFinding:edit': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER'],
  'governanceFinding:delete': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],

  'recommendedAction:create': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER'],
  'recommendedAction:edit': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER', 'BUSINESS_OWNER'],
  'recommendedAction:delete': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],

  'conditionDefinition:create': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],
  'conditionDefinition:edit': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],

  'outcomeRule:create': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],
  'outcomeRule:edit': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],

  'actionRule:create': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],
  'actionRule:edit': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],
  'actionRule:delete': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],

  'governanceProfile:create': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],
  'governanceProfile:edit': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],

  'scheduledReview:create': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER'],
  'scheduledReview:edit': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER'],

  'correctiveAction:create': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER', 'VALIDATOR'],

  'user:view': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN'],

  'killSwitch:engage': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER'],
  'killSwitch:release': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER'],
  'override:record': ['SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER'],
};

export const ALL_ROLES: UserRole[] = [
  'SUPER_ADMIN',
  'GOVERNANCE_ADMIN',
  'RISK_OFFICER',
  'BUSINESS_OWNER',
  'VALIDATOR',
  'AUDITOR',
  'VIEWER',
];

/** Auditor and Viewer are never granted a write role on any backend endpoint — verified across all ~46 write endpoints. */
export function isReadOnlyRole(role: UserRole | undefined | null): boolean {
  return role === 'AUDITOR' || role === 'VIEWER';
}

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  GOVERNANCE_ADMIN: 'Governance Admin',
  RISK_OFFICER: 'Risk Officer',
  BUSINESS_OWNER: 'Business Owner',
  VALIDATOR: 'Validator',
  AUDITOR: 'Auditor',
  VIEWER: 'Viewer',
};

export function roleLabel(role: UserRole): string {
  return ROLE_LABELS[role] || role;
}
