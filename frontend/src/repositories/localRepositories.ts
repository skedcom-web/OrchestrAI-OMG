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
  ActionRuleRepository,
  AssetRepository,
  CompliancePackRepository,
  ConditionDefinitionRepository,
  ControlRepository,
  EvidenceMappingRepository,
  EvidenceRepository,
  GovernanceData,
  GovernanceFindingRepository,
  GovernancePolicyRepository,
  GovernanceProfileRepository,
  GovernanceRecordKind,
  GovernanceRepository,
  ObligationControlRepository,
  ObligationEvidenceMappingRepository,
  ObligationRepository,
  OutcomeRuleRepository,
  RecommendedActionRepository,
  RegulatoryRequirementRepository,
  RegulatorySourceRepository,
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

export const localRegulatorySourceRepository: RegulatorySourceRepository = {
  async getSources() {
    return storage.getRegulatorySources();
  },
  async createSource(data) {
    return storage.saveRegulatorySource(data);
  },
  async updateSource(id, data) {
    return storage.saveRegulatorySource({ ...data, id });
  },
  async deleteSource(id) {
    await storage.deleteRegulatorySource(id);
  },
};

export const localRegulatoryRequirementRepository: RegulatoryRequirementRepository = {
  async getRequirements() {
    return storage.getRegulatoryRequirements();
  },
  async createRequirement(data) {
    return storage.saveRegulatoryRequirement(data);
  },
  async updateRequirement(id, data) {
    return storage.saveRegulatoryRequirement({ ...data, id });
  },
  async deleteRequirement(id) {
    await storage.deleteRegulatoryRequirement(id);
  },
};

export const localObligationRepository: ObligationRepository = {
  async getObligations() {
    return storage.getObligations();
  },
  async createObligation(data) {
    return storage.saveObligation(data);
  },
  async updateObligation(id, data) {
    return storage.saveObligation({ ...data, id });
  },
  async deleteObligation(id) {
    await storage.deleteObligation(id);
  },
};

export const localObligationControlRepository: ObligationControlRepository = {
  async getControls() {
    return storage.getObligationControls();
  },
  async createControl(data) {
    return storage.saveObligationControl(data);
  },
  async updateControl(id, data) {
    return storage.saveObligationControl({ ...data, id });
  },
  async deleteControl(id) {
    await storage.deleteObligationControl(id);
  },
};

export const localObligationEvidenceMappingRepository: ObligationEvidenceMappingRepository = {
  async getMappings() {
    return storage.getObligationEvidenceMappings();
  },
  async createMapping(data) {
    return storage.saveObligationEvidenceMapping(data);
  },
  async updateMapping(id, data) {
    return storage.saveObligationEvidenceMapping({ ...data, id });
  },
  async deleteMapping(id) {
    await storage.deleteObligationEvidenceMapping(id);
  },
};

export const localGovernancePolicyRepository: GovernancePolicyRepository = {
  async getPolicies() {
    return storage.getGovernancePolicies();
  },
  async createPolicy(data) {
    return storage.saveGovernancePolicy(data);
  },
  async updatePolicy(id, data) {
    return storage.saveGovernancePolicy({ ...data, id });
  },
  async deletePolicy(id) {
    await storage.deleteGovernancePolicy(id);
  },
};

export const localGovernanceFindingRepository: GovernanceFindingRepository = {
  async getFindings() {
    return storage.getGovernanceFindings();
  },
  async createFinding(data) {
    return storage.saveGovernanceFinding(data);
  },
  async updateFinding(id, data) {
    return storage.saveGovernanceFinding({ ...data, id });
  },
  async deleteFinding(id) {
    await storage.deleteGovernanceFinding(id);
  },
};

export const localRecommendedActionRepository: RecommendedActionRepository = {
  async getActions() {
    return storage.getRecommendedActions();
  },
  async createAction(data) {
    return storage.saveRecommendedAction(data);
  },
  async updateAction(id, data) {
    return storage.saveRecommendedAction({ ...data, id });
  },
  async deleteAction(id) {
    await storage.deleteRecommendedAction(id);
  },
};

// --- RELEASE 10 — GOVERNANCE INTELLIGENCE STUDIO (CUSTOMER CONFIGURATION) ---

export const localConditionDefinitionRepository: ConditionDefinitionRepository = {
  async getDefinitions() {
    return storage.getConditionDefinitions();
  },
  async updateDefinition(id, data) {
    return storage.saveConditionDefinition({ ...data, id });
  },
};

export const localOutcomeRuleRepository: OutcomeRuleRepository = {
  async getRules() {
    return storage.getOutcomeRules();
  },
  async updateRule(id, data) {
    return storage.saveOutcomeRule({ ...data, id });
  },
};

export const localActionRuleRepository: ActionRuleRepository = {
  async getRules() {
    return storage.getActionRules();
  },
  async createRule(data) {
    return storage.saveActionRule(data);
  },
  async updateRule(id, data) {
    return storage.saveActionRule({ ...data, id });
  },
  async deleteRule(id) {
    await storage.deleteActionRule(id);
  },
};

export const localGovernanceProfileRepository: GovernanceProfileRepository = {
  async getProfiles() {
    return storage.getGovernanceProfiles();
  },
  async createProfile(data) {
    return storage.saveGovernanceProfile(data);
  },
  async updateProfile(id, data) {
    return storage.saveGovernanceProfile({ ...data, id });
  },
};

// Re-exported for callers that want the concrete asset type without importing storageService directly.
export type { AIAsset, EvidenceRecord };
