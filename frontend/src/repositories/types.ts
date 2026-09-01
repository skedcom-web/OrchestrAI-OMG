/**
 * OMG Release 4 — Persistence Foundation, Repository Pattern.
 *
 * The same interfaces are implemented by a Local (localStorage, demo) and an
 * Api (NestJS + Prisma + Neon, production) repository — see index.ts for the
 * factory that picks between them. Every method is async so both
 * implementations share one contract, even though the local one resolves
 * synchronously in practice.
 */

import type {
  ActionRule,
  AIAsset,
  CompliancePack,
  ComplianceRequirement,
  ConditionDefinition,
  DecisionRecord,
  EvidenceMapping,
  EvidenceRecord,
  GovernanceDrift,
  GovernanceEffectivenessSnapshot,
  GovernanceMaturitySnapshot,
  GovernanceFinding,
  GovernancePolicy,
  GovernanceProfile,
  GovernanceReauthorizationRecord,
  Obligation,
  ObligationControl,
  ObligationEvidenceMapping,
  OutcomeRule,
  PackControl,
  ReassessmentTrigger,
  RecommendedAction,
  RegulatoryRequirement,
  RegulatorySource,
  ScheduledReview,
} from '../types';

export interface AssetRepository {
  /** Q1 Stabilization — includeArchived also returns archived assets (used by the Archived Assets view). */
  getAssets(includeArchived?: boolean): Promise<AIAsset[]>;
  createAsset(data: Partial<AIAsset>): Promise<AIAsset>;
  updateAsset(id: string, data: Partial<AIAsset>): Promise<AIAsset>;
  /** Q1 Stabilization — Phase 3: soft delete/archive, never a physical row removal. */
  archiveAsset(id: string, archivedBy: string, archiveReason: string): Promise<void>;
  restoreAsset(id: string): Promise<void>;
}

export interface EvidenceRepository {
  getEvidence(): Promise<EvidenceRecord[]>;
  createEvidence(data: Partial<EvidenceRecord>): Promise<EvidenceRecord>;
  updateEvidence(id: string, data: Partial<EvidenceRecord>): Promise<EvidenceRecord>;
  deleteEvidence(id: string): Promise<void>;
}

/** Continuity records: Reassessment Triggers, Reauthorization Records, Review Schedule. */
export interface GovernanceData {
  triggers: ReassessmentTrigger[];
  reauthorizations: GovernanceReauthorizationRecord[];
  reviews: ScheduledReview[];
}

export type GovernanceRecordKind = 'trigger' | 'reauthorization' | 'review';

export interface GovernanceRepository {
  getGovernanceData(): Promise<GovernanceData>;
  createGovernanceRecord(
    kind: GovernanceRecordKind,
    data: Partial<ReassessmentTrigger> | Partial<GovernanceReauthorizationRecord> | Partial<ScheduledReview>
  ): Promise<ReassessmentTrigger | GovernanceReauthorizationRecord | ScheduledReview>;
  updateGovernanceRecord(
    kind: GovernanceRecordKind,
    id: string,
    data: Partial<ReassessmentTrigger> | Partial<GovernanceReauthorizationRecord> | Partial<ScheduledReview>
  ): Promise<ReassessmentTrigger | GovernanceReauthorizationRecord | ScheduledReview>;
}

/**
 * Release 5.1 — Compliance Persistence Alignment. Same Repository Pattern as
 * the domains above, now covering the Release 5 Compliance Pack Framework so
 * it stops being the one governance module still primary-sourced from local
 * storage.
 */
export interface CompliancePackRepository {
  getCompliancePacks(): Promise<CompliancePack[]>;
  createCompliancePack(data: Partial<CompliancePack>): Promise<CompliancePack>;
  updateCompliancePack(id: string, data: Partial<CompliancePack>): Promise<CompliancePack>;
  deleteCompliancePack(id: string): Promise<void>;
}

export interface RequirementRepository {
  getRequirements(): Promise<ComplianceRequirement[]>;
  createRequirement(data: Partial<ComplianceRequirement>): Promise<ComplianceRequirement>;
  updateRequirement(id: string, data: Partial<ComplianceRequirement>): Promise<ComplianceRequirement>;
  deleteRequirement(id: string): Promise<void>;
}

export interface ControlRepository {
  getControls(): Promise<PackControl[]>;
  createControl(data: Partial<PackControl>): Promise<PackControl>;
  updateControl(id: string, data: Partial<PackControl>): Promise<PackControl>;
  deleteControl(id: string): Promise<void>;
}

export interface EvidenceMappingRepository {
  getMappings(): Promise<EvidenceMapping[]>;
  createMapping(data: Partial<EvidenceMapping>): Promise<EvidenceMapping>;
  updateMapping(id: string, data: Partial<EvidenceMapping>): Promise<EvidenceMapping>;
  deleteMapping(id: string): Promise<void>;
}

/**
 * Release 6 — Universal Regulatory Knowledge & Obligation Engine. Same
 * Repository Pattern one layer deeper: Source -> Requirement -> Obligation ->
 * Control -> Evidence. Api-first from day one — no local-storage-first
 * detour, per the Release 6 blueprint's production principles and the
 * Release 5.1 correction they generalize.
 */
export interface RegulatorySourceRepository {
  getSources(): Promise<RegulatorySource[]>;
  createSource(data: Partial<RegulatorySource>): Promise<RegulatorySource>;
  updateSource(id: string, data: Partial<RegulatorySource>): Promise<RegulatorySource>;
  deleteSource(id: string): Promise<void>;
}

export interface RegulatoryRequirementRepository {
  getRequirements(): Promise<RegulatoryRequirement[]>;
  createRequirement(data: Partial<RegulatoryRequirement>): Promise<RegulatoryRequirement>;
  updateRequirement(id: string, data: Partial<RegulatoryRequirement>): Promise<RegulatoryRequirement>;
  deleteRequirement(id: string): Promise<void>;
}

export interface ObligationRepository {
  getObligations(): Promise<Obligation[]>;
  createObligation(data: Partial<Obligation>): Promise<Obligation>;
  updateObligation(id: string, data: Partial<Obligation>): Promise<Obligation>;
  deleteObligation(id: string): Promise<void>;
}

export interface ObligationControlRepository {
  getControls(): Promise<ObligationControl[]>;
  createControl(data: Partial<ObligationControl>): Promise<ObligationControl>;
  updateControl(id: string, data: Partial<ObligationControl>): Promise<ObligationControl>;
  deleteControl(id: string): Promise<void>;
}

export interface ObligationEvidenceMappingRepository {
  getMappings(): Promise<ObligationEvidenceMapping[]>;
  createMapping(data: Partial<ObligationEvidenceMapping>): Promise<ObligationEvidenceMapping>;
  updateMapping(id: string, data: Partial<ObligationEvidenceMapping>): Promise<ObligationEvidenceMapping>;
  deleteMapping(id: string): Promise<void>;
}

/**
 * Release 7 — Governance Intelligence Engine. Policy and Finding are
 * genuinely persisted, Neon-backed from day one like Release 6 — Conditions,
 * Violations and Outcomes are computed live (see governanceReasoningEngine.ts)
 * and have no repository of their own.
 */
export interface GovernancePolicyRepository {
  getPolicies(): Promise<GovernancePolicy[]>;
  createPolicy(data: Partial<GovernancePolicy>): Promise<GovernancePolicy>;
  updatePolicy(id: string, data: Partial<GovernancePolicy>): Promise<GovernancePolicy>;
  deletePolicy(id: string): Promise<void>;
}

export interface GovernanceFindingRepository {
  getFindings(): Promise<GovernanceFinding[]>;
  createFinding(data: Partial<GovernanceFinding>): Promise<GovernanceFinding>;
  updateFinding(id: string, data: Partial<GovernanceFinding>): Promise<GovernanceFinding>;
  deleteFinding(id: string): Promise<void>;
}

/**
 * Release 8 — Governance Intelligence Engine (Actions Edition). Recommended
 * Actions are persisted (Neon-backed, Api-first from day one) — the drafts
 * that produce them (governanceActionsEngine.ts) are pure config, not a
 * repository of their own.
 */
export interface RecommendedActionRepository {
  getActions(): Promise<RecommendedAction[]>;
  createAction(data: Partial<RecommendedAction>): Promise<RecommendedAction>;
  updateAction(id: string, data: Partial<RecommendedAction>): Promise<RecommendedAction>;
  deleteAction(id: string): Promise<void>;
}

/**
 * Release 10 — Governance Intelligence Studio. All four are persisted,
 * Api-first from day one, same reasoning as every domain since Release 6.
 * No delete on ConditionDefinition/OutcomeRule — they're a fixed one-row-
 * per-platform-primitive catalogue (seeded once), only enable/disable and
 * metadata are editable; ActionRule and GovernanceProfile are genuinely
 * user-managed collections and support full CRUD.
 */
export interface ConditionDefinitionRepository {
  getDefinitions(): Promise<ConditionDefinition[]>;
  updateDefinition(id: string, data: Partial<ConditionDefinition>): Promise<ConditionDefinition>;
}

export interface OutcomeRuleRepository {
  getRules(): Promise<OutcomeRule[]>;
  updateRule(id: string, data: Partial<OutcomeRule>): Promise<OutcomeRule>;
}

export interface ActionRuleRepository {
  getRules(): Promise<ActionRule[]>;
  createRule(data: Partial<ActionRule>): Promise<ActionRule>;
  updateRule(id: string, data: Partial<ActionRule>): Promise<ActionRule>;
  deleteRule(id: string): Promise<void>;
}

export interface GovernanceProfileRepository {
  getProfiles(): Promise<GovernanceProfile[]>;
  createProfile(data: Partial<GovernanceProfile>): Promise<GovernanceProfile>;
  updateProfile(id: string, data: Partial<GovernanceProfile>): Promise<GovernanceProfile>;
}

/**
 * OMG vNext — Governance Intelligence, Module 2 (Decision Governance).
 * Extends the pre-existing DecisionRecord persistence — this is the first
 * repository this table has had; before vNext it only ever reached
 * localStorage (see storageService.ts's recordDecision). Api-first from
 * day one like every domain since Release 6, no update/delete: decisions
 * are an append-only record, matching GovernanceReauthorizationRecord.
 */
export interface DecisionRepository {
  getDecisions(assetId?: string): Promise<DecisionRecord[]>;
  createDecision(data: Partial<DecisionRecord>): Promise<DecisionRecord>;
}

/**
 * OMG vNext — Governance Intelligence, Module 3 (Governance Drift). The one
 * genuinely new persisted entity vNext introduces — see GovernanceDrift on
 * the Prisma schema for why (drift has a "time since detected" a computed
 * snapshot can't reconstruct). Api-first from day one.
 */
export interface GovernanceDriftRepository {
  getDrifts(assetId?: string): Promise<GovernanceDrift[]>;
  createDrift(data: Partial<GovernanceDrift>): Promise<GovernanceDrift>;
  updateDrift(id: string, data: Partial<GovernanceDrift>): Promise<GovernanceDrift>;
}

/**
 * Release 11, Capability 1. Append-only — a snapshot is a historical record,
 * never edited after the fact (matches GovernanceReauthorizationRecord's
 * no-update contract).
 */
export interface GovernanceEffectivenessRepository {
  getSnapshots(): Promise<GovernanceEffectivenessSnapshot[]>;
  createSnapshot(data: Partial<GovernanceEffectivenessSnapshot>): Promise<GovernanceEffectivenessSnapshot>;
}

/** Release 11, Capability 3. Same append-only contract. */
export interface GovernanceMaturityRepository {
  getSnapshots(): Promise<GovernanceMaturitySnapshot[]>;
  createSnapshot(data: Partial<GovernanceMaturitySnapshot>): Promise<GovernanceMaturitySnapshot>;
}
