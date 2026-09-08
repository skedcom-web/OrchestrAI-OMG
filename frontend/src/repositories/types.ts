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
  AssessorCertification,
  AssetKnowledgeUsage,
  AssetModelUsage,
  CompliancePack,
  ComplianceRequirement,
  ConditionDefinition,
  ConfidenceAssessment,
  ConsensusAssessment,
  DecisionOutcome,
  DecisionRecord,
  AgentToolGrant,
  AssetPromptUsage,
  KnowledgeAsset,
  Model,
  Prompt,
  PromptReviewStatus,
  PromptVersion,
  Tool,
  EvidenceMapping,
  EvidenceRecord,
  GovernanceDrift,
  GovernanceAssessmentRecord,
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
/** R13 — Model Governance. */
export interface ModelRepository {
  getModels(includeArchived?: boolean): Promise<Model[]>;
  createModel(data: Partial<Model>): Promise<Model>;
  updateModel(id: string, data: Partial<Model>): Promise<Model>;
  archiveModel(id: string, archivedBy?: string, archiveReason?: string): Promise<void>;
  restoreModel(id: string): Promise<void>;
  recordModelDecision(id: string, outcome: DecisionOutcome, justification: string, decisionOwner: string): Promise<Model>;
  createUsage(assetId: string, modelId: string): Promise<AssetModelUsage>;
  deleteUsage(id: string): Promise<void>;
}

/** R14 — Knowledge Governance. */
export interface KnowledgeAssetRepository {
  getKnowledgeAssets(includeArchived?: boolean): Promise<KnowledgeAsset[]>;
  createKnowledgeAsset(data: Partial<KnowledgeAsset>): Promise<KnowledgeAsset>;
  updateKnowledgeAsset(id: string, data: Partial<KnowledgeAsset>): Promise<KnowledgeAsset>;
  archiveKnowledgeAsset(id: string, archivedBy?: string, archiveReason?: string): Promise<void>;
  restoreKnowledgeAsset(id: string): Promise<void>;
  recordKnowledgeDecision(id: string, outcome: DecisionOutcome, justification: string, decisionOwner: string): Promise<KnowledgeAsset>;
  createUsage(assetId: string, knowledgeAssetId: string): Promise<AssetKnowledgeUsage>;
  deleteUsage(id: string): Promise<void>;
}

/** R15 — Prompt Governance. */
export interface PromptRepository {
  getPrompts(includeArchived?: boolean): Promise<Prompt[]>;
  createPrompt(data: Partial<Prompt> & { templateBody: string; createdBy: string }): Promise<Prompt>;
  updatePrompt(id: string, data: Partial<Prompt>): Promise<Prompt>;
  archivePrompt(id: string, archivedBy?: string, archiveReason?: string): Promise<void>;
  restorePrompt(id: string): Promise<void>;
  recordPromptDecision(id: string, outcome: DecisionOutcome, justification: string, decisionOwner: string): Promise<Prompt>;
  createVersion(promptId: string, templateBody: string, createdBy: string, changeNotes?: string): Promise<PromptVersion>;
  reviewVersion(versionId: string, reviewStatus: PromptReviewStatus, reviewedBy: string, reviewNotes?: string, testTranscriptRef?: string): Promise<PromptVersion>;
  createUsage(assetId: string, promptId: string): Promise<AssetPromptUsage>;
  deleteUsage(id: string): Promise<void>;
}

/**
 * R16/R17 — Tool's data model, brought forward from R17 (Release Dependency
 * Map §16). Basic CRUD only in R16 — full risk/decision workflow ships with
 * R17's own registry screens.
 */
export interface ToolRepository {
  getTools(includeArchived?: boolean): Promise<Tool[]>;
  createTool(data: Partial<Tool>): Promise<Tool>;
  updateTool(id: string, data: Partial<Tool>): Promise<Tool>;
  archiveTool(id: string, archivedBy?: string, archiveReason?: string): Promise<void>;
  restoreTool(id: string): Promise<void>;
  recordToolDecision(id: string, outcome: DecisionOutcome, justification: string, decisionOwner: string): Promise<Tool>;
}

/** R16 — Agent Governance. The authorization boundary between an agent and a tool. */
export interface AgentToolGrantRepository {
  getGrants(): Promise<AgentToolGrant[]>;
  createGrant(assetId: string, toolId: string, grantedBy: string, grantNotes?: string): Promise<AgentToolGrant>;
  deleteGrant(id: string): Promise<void>;
}

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

/**
 * GACF — the one persisted entity across all six initiatives. Append-only:
 * an assessment is a historical record, never edited after the fact.
 */
export interface GovernanceAssessmentRepository {
  getRecords(assetId?: string): Promise<GovernanceAssessmentRecord[]>;
  createRecord(data: Partial<GovernanceAssessmentRecord>): Promise<GovernanceAssessmentRecord>;
}

/** GACF Phase 2 ("Release 13 Extension"). Certification attempts, append-only. */
export interface AssessorCertificationRepository {
  getCertifications(): Promise<AssessorCertification[]>;
  createCertification(data: Partial<AssessorCertification>): Promise<AssessorCertification>;
}

/** GACF Phase 2 — a round's own state plus its aggregate stats once closed. */
export interface ConsensusAssessmentRepository {
  getRounds(): Promise<ConsensusAssessment[]>;
  createRound(data: Partial<ConsensusAssessment>): Promise<ConsensusAssessment>;
  /** Persists the "who has submitted" state — called on every participant
   * submission, not just at close, so it survives a reload rather than
   * living only in the submitting browser's local cache. */
  updateParticipants(id: string, participants: ConsensusAssessment['participants']): Promise<ConsensusAssessment>;
  closeRound(id: string, consensusScore: number, varianceScore: number): Promise<ConsensusAssessment>;
}

/** GACF Phase 2 — one optional row per governance-assessment-record. */
export interface ConfidenceAssessmentRepository {
  getConfidenceAssessments(): Promise<ConfidenceAssessment[]>;
  createConfidenceAssessment(data: Partial<ConfidenceAssessment>): Promise<ConfidenceAssessment>;
}
