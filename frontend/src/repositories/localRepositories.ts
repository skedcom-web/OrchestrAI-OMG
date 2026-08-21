/**
 * OMG Release 4 — Persistence Foundation, Local Repository.
 *
 * Thin async wrappers over the existing synchronous, localStorage-backed
 * `storageService`. Behaviour is unchanged from every prior release — this
 * file exists purely to satisfy the Repository Pattern's async contract so
 * Local and Api implementations are interchangeable.
 */

import * as storage from '../services/storageService';
import type {
  AssetRepository,
  CompliancePackRepository,
  ControlRepository,
  EvidenceMappingRepository,
  EvidenceRepository,
  GovernanceData,
  GovernanceRecordKind,
  GovernanceRepository,
  RequirementRepository,
} from './types';
import type {
  AIAsset,
  EvidenceRecord,
  GovernanceReauthorizationRecord,
  ReassessmentTrigger,
  ScheduledReview,
} from '../types';

export const localAssetRepository: AssetRepository = {
  async getAssets() {
    return storage.getAssets();
  },
  async createAsset(data) {
    return storage.saveAsset(data);
  },
  async updateAsset(id, data) {
    return storage.saveAsset({ ...data, id });
  },
  async deleteAsset(id) {
    storage.deleteAsset(id);
  },
};

export const localEvidenceRepository: EvidenceRepository = {
  async getEvidence() {
    return storage.getEvidenceRecords();
  },
  async createEvidence(data) {
    return storage.saveEvidenceRecord(data);
  },
  async updateEvidence(id, data) {
    return storage.saveEvidenceRecord({ ...data, id });
  },
  async deleteEvidence(id) {
    storage.deleteEvidenceRecord(id);
  },
};

export const localGovernanceRepository: GovernanceRepository = {
  async getGovernanceData(): Promise<GovernanceData> {
    return {
      triggers: storage.getReassessmentTriggers(),
      reauthorizations: storage.getReauthorizationRecords(),
      reviews: storage.getScheduledReviews(),
    };
  },
  async createGovernanceRecord(kind: GovernanceRecordKind, data) {
    if (kind === 'trigger') return storage.saveReassessmentTrigger(data as Partial<ReassessmentTrigger>);
    if (kind === 'reauthorization') {
      return storage.saveReauthorizationRecord(
        data as Omit<GovernanceReauthorizationRecord, 'id' | 'assetName'>
      );
    }
    return storage.saveScheduledReview(data as Partial<ScheduledReview>);
  },
  async updateGovernanceRecord(kind: GovernanceRecordKind, id: string, data) {
    if (kind === 'trigger') return storage.saveReassessmentTrigger({ ...(data as Partial<ReassessmentTrigger>), id });
    if (kind === 'review') return storage.saveScheduledReview({ ...(data as Partial<ScheduledReview>), id });
    // Reauthorization records are immutable once decided — there is no update path.
    throw new Error('Reauthorization records cannot be updated once created.');
  },
};

export const localCompliancePackRepository: CompliancePackRepository = {
  async getCompliancePacks() {
    return storage.getCompliancePacks();
  },
  async createCompliancePack(data) {
    return storage.saveCompliancePack(data);
  },
  async updateCompliancePack(id, data) {
    return storage.saveCompliancePack({ ...data, id });
  },
  async deleteCompliancePack(id) {
    await storage.deleteCompliancePack(id);
  },
};

export const localRequirementRepository: RequirementRepository = {
  async getRequirements() {
    return storage.getComplianceRequirements();
  },
  async createRequirement(data) {
    return storage.saveComplianceRequirement(data);
  },
  async updateRequirement(id, data) {
    return storage.saveComplianceRequirement({ ...data, id });
  },
  async deleteRequirement(id) {
    await storage.deleteComplianceRequirement(id);
  },
};

export const localControlRepository: ControlRepository = {
  async getControls() {
    return storage.getPackControls();
  },
  async createControl(data) {
    return storage.savePackControl(data);
  },
  async updateControl(id, data) {
    return storage.savePackControl({ ...data, id });
  },
  async deleteControl(id) {
    await storage.deletePackControl(id);
  },
};

export const localEvidenceMappingRepository: EvidenceMappingRepository = {
  async getMappings() {
    return storage.getEvidenceMappings();
  },
  async createMapping(data) {
    return storage.saveEvidenceMapping(data);
  },
  async updateMapping(id, data) {
    return storage.saveEvidenceMapping({ ...data, id });
  },
  async deleteMapping(id) {
    await storage.deleteEvidenceMapping(id);
  },
};

// Re-exported for callers that want the concrete asset type without importing storageService directly.
export type { AIAsset, EvidenceRecord };
