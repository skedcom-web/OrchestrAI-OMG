/**
 * OMG Release 4 — Persistence Foundation, Local Repository.
 *
 * Thin async wrappers over the existing synchronous, localStorage-backed
 * `storageService`. Behaviour is unchanged from every prior release — this
 * file exists purely to satisfy the Repository Pattern's async contract so
 * Local and Api implementations are interchangeable.
 */

import * as storage from '../services/storageService';
import type { AssetRepository, EvidenceRepository, GovernanceData, GovernanceRecordKind, GovernanceRepository } from './types';
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

// Re-exported for callers that want the concrete asset type without importing storageService directly.
export type { AIAsset, EvidenceRecord };
