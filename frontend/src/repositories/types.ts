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
  AIAsset,
  CompliancePack,
  ComplianceRequirement,
  EvidenceMapping,
  EvidenceRecord,
  GovernanceReauthorizationRecord,
  PackControl,
  ReassessmentTrigger,
  ScheduledReview,
} from '../types';

export interface AssetRepository {
  getAssets(): Promise<AIAsset[]>;
  createAsset(data: Partial<AIAsset>): Promise<AIAsset>;
  updateAsset(id: string, data: Partial<AIAsset>): Promise<AIAsset>;
  deleteAsset(id: string): Promise<void>;
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
