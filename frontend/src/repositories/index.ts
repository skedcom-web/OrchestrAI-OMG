/**
 * OMG Release 4 — Persistence Foundation, Repository factory.
 *
 * Selects the Local (localStorage, demo — the P3 "Demo Mode" feature flag
 * from Release 3's backlog) or Api (NestJS + Prisma + Neon, "Production
 * Mode") repository implementation. Demo Mode is the default: every existing
 * page keeps working exactly as it always has unless a tenant explicitly
 * switches to Production Mode.
 */

import {
  localActionRuleRepository,
  localAssessorCertificationRepository,
  localAssetRepository,
  localCompliancePackRepository,
  localConditionDefinitionRepository,
  localConfidenceAssessmentRepository,
  localConsensusAssessmentRepository,
  localControlRepository,
  localDecisionRepository,
  localEvidenceMappingRepository,
  localEvidenceRepository,
  localGovernanceAssessmentRepository,
  localGovernanceDriftRepository,
  localGovernanceEffectivenessRepository,
  localGovernanceMaturityRepository,
  localGovernanceFindingRepository,
  localGovernancePolicyRepository,
  localGovernanceProfileRepository,
  localGovernanceRepository,
  localKnowledgeAssetRepository,
  localModelRepository,
  localObligationControlRepository,
  localPromptRepository,
  localObligationEvidenceMappingRepository,
  localObligationRepository,
  localOutcomeRuleRepository,
  localRecommendedActionRepository,
  localRegulatoryRequirementRepository,
  localRegulatorySourceRepository,
  localRequirementRepository,
} from './localRepositories';
import {
  apiActionRuleRepository,
  apiAssessorCertificationRepository,
  apiAssetRepository,
  apiCompliancePackRepository,
  apiConditionDefinitionRepository,
  apiConfidenceAssessmentRepository,
  apiConsensusAssessmentRepository,
  apiControlRepository,
  apiDecisionRepository,
  apiEvidenceMappingRepository,
  apiEvidenceRepository,
  apiGovernanceAssessmentRepository,
  apiGovernanceDriftRepository,
  apiGovernanceEffectivenessRepository,
  apiGovernanceMaturityRepository,
  apiGovernanceFindingRepository,
  apiGovernancePolicyRepository,
  apiGovernanceProfileRepository,
  apiGovernanceRepository,
  apiKnowledgeAssetRepository,
  apiModelRepository,
  apiObligationControlRepository,
  apiPromptRepository,
  apiObligationEvidenceMappingRepository,
  apiObligationRepository,
  apiOutcomeRuleRepository,
  apiRecommendedActionRepository,
  apiRegulatoryRequirementRepository,
  apiRegulatorySourceRepository,
  apiRequirementRepository,
} from './apiRepositories';
import type {
  ActionRuleRepository,
  AssessorCertificationRepository,
  AssetRepository,
  CompliancePackRepository,
  ConditionDefinitionRepository,
  ConfidenceAssessmentRepository,
  ConsensusAssessmentRepository,
  ControlRepository,
  DecisionRepository,
  EvidenceMappingRepository,
  EvidenceRepository,
  GovernanceAssessmentRepository,
  GovernanceDriftRepository,
  GovernanceEffectivenessRepository,
  GovernanceMaturityRepository,
  GovernanceFindingRepository,
  GovernancePolicyRepository,
  GovernanceProfileRepository,
  GovernanceRepository,
  KnowledgeAssetRepository,
  ModelRepository,
  ObligationControlRepository,
  PromptRepository,
  ObligationEvidenceMappingRepository,
  ObligationRepository,
  OutcomeRuleRepository,
  RecommendedActionRepository,
  RegulatoryRequirementRepository,
  RegulatorySourceRepository,
  RequirementRepository,
} from './types';

export type DataMode = 'demo' | 'production';

const DATA_MODE_KEY = 'omg_data_mode';

export function getDataMode(): DataMode {
  return localStorage.getItem(DATA_MODE_KEY) === 'production' ? 'production' : 'demo';
}

export function setDataMode(mode: DataMode): void {
  localStorage.setItem(DATA_MODE_KEY, mode);
}

export function getAssetRepository(): AssetRepository {
  return getDataMode() === 'production' ? apiAssetRepository : localAssetRepository;
}

export function getEvidenceRepository(): EvidenceRepository {
  return getDataMode() === 'production' ? apiEvidenceRepository : localEvidenceRepository;
}

export function getGovernanceRepository(): GovernanceRepository {
  return getDataMode() === 'production' ? apiGovernanceRepository : localGovernanceRepository;
}

/**
 * R13 — Model Governance. Api is the default, matching the Release 5.1
 * precedent below — a brand-new domain has no legacy demo data to preserve
 * parity with, so it starts API-first rather than branching on data mode.
 */
export function getModelRepository(): ModelRepository {
  return apiModelRepository;
}

export { localModelRepository };

/** R14 — Knowledge Governance. Same Api-first rationale as Model Governance above. */
export function getKnowledgeAssetRepository(): KnowledgeAssetRepository {
  return apiKnowledgeAssetRepository;
}

export { localKnowledgeAssetRepository };

/** R15 — Prompt Governance. Same Api-first rationale as Model/Knowledge Governance above. */
export function getPromptRepository(): PromptRepository {
  return apiPromptRepository;
}

export { localPromptRepository };

/**
 * Release 5.1 — Compliance Persistence Alignment. Api is the default for
 * this domain per the blueprint's mandatory platform rule; Local remains a
 * fallback utility only, mirroring the pattern above rather than branching
 * on data mode like Assets/Evidence/Continuity do.
 */
export function getCompliancePackRepository(): CompliancePackRepository {
  return apiCompliancePackRepository;
}

export function getRequirementRepository(): RequirementRepository {
  return apiRequirementRepository;
}

export function getControlRepository(): ControlRepository {
  return apiControlRepository;
}

export function getEvidenceMappingRepository(): EvidenceMappingRepository {
  return apiEvidenceMappingRepository;
}

export {
  localCompliancePackRepository,
  localControlRepository,
  localEvidenceMappingRepository,
  localRequirementRepository,
};

/**
 * Release 6 — Universal Regulatory Knowledge & Obligation Engine. Api-first
 * from day one, same reasoning as Release 5.1's compliance factories above.
 */
export function getRegulatorySourceRepository(): RegulatorySourceRepository {
  return apiRegulatorySourceRepository;
}

export function getRegulatoryRequirementRepository(): RegulatoryRequirementRepository {
  return apiRegulatoryRequirementRepository;
}

export function getObligationRepository(): ObligationRepository {
  return apiObligationRepository;
}

export function getObligationControlRepository(): ObligationControlRepository {
  return apiObligationControlRepository;
}

export function getObligationEvidenceMappingRepository(): ObligationEvidenceMappingRepository {
  return apiObligationEvidenceMappingRepository;
}

export {
  localRegulatorySourceRepository,
  localRegulatoryRequirementRepository,
  localObligationRepository,
  localObligationControlRepository,
  localObligationEvidenceMappingRepository,
};

/**
 * Release 7 — Governance Intelligence Engine. Api-first from day one, same
 * reasoning as Release 6's factories above.
 */
export function getGovernancePolicyRepository(): GovernancePolicyRepository {
  return apiGovernancePolicyRepository;
}

export function getGovernanceFindingRepository(): GovernanceFindingRepository {
  return apiGovernanceFindingRepository;
}

export { localGovernancePolicyRepository, localGovernanceFindingRepository };

/**
 * Release 8 — Governance Intelligence Engine (Actions Edition). Api-first
 * from day one, same reasoning as Release 6/7's factories above.
 */
export function getRecommendedActionRepository(): RecommendedActionRepository {
  return apiRecommendedActionRepository;
}

export { localRecommendedActionRepository };

/**
 * Release 10 — Governance Intelligence Studio. Api-first from day one, same
 * reasoning as Release 6/7/8's factories above.
 */
export function getConditionDefinitionRepository(): ConditionDefinitionRepository {
  return apiConditionDefinitionRepository;
}

export function getOutcomeRuleRepository(): OutcomeRuleRepository {
  return apiOutcomeRuleRepository;
}

export function getActionRuleRepository(): ActionRuleRepository {
  return apiActionRuleRepository;
}

export function getGovernanceProfileRepository(): GovernanceProfileRepository {
  return apiGovernanceProfileRepository;
}

export {
  localConditionDefinitionRepository,
  localOutcomeRuleRepository,
  localActionRuleRepository,
  localGovernanceProfileRepository,
};

/**
 * OMG vNext — Governance Intelligence, Modules 2 & 3. Api-first from day
 * one, same reasoning as every domain since Release 6 above.
 */
export function getDecisionRepository(): DecisionRepository {
  return apiDecisionRepository;
}

export function getGovernanceDriftRepository(): GovernanceDriftRepository {
  return apiGovernanceDriftRepository;
}

export { localDecisionRepository, localGovernanceDriftRepository };

/** Release 11 — Governance Effectiveness & Outcomes Engine. Api-first from day one. */
export function getGovernanceEffectivenessRepository(): GovernanceEffectivenessRepository {
  return apiGovernanceEffectivenessRepository;
}

export function getGovernanceMaturityRepository(): GovernanceMaturityRepository {
  return apiGovernanceMaturityRepository;
}

export { localGovernanceEffectivenessRepository, localGovernanceMaturityRepository };

/** GACF — Governance Assessment Calibration & Consistency Framework. Api-first from day one. */
export function getGovernanceAssessmentRepository(): GovernanceAssessmentRepository {
  return apiGovernanceAssessmentRepository;
}

export { localGovernanceAssessmentRepository };

/** GACF Phase 2 ("Release 13 Extension"). Api-first from day one, same reasoning as every domain above. */
export function getAssessorCertificationRepository(): AssessorCertificationRepository {
  return apiAssessorCertificationRepository;
}

export function getConsensusAssessmentRepository(): ConsensusAssessmentRepository {
  return apiConsensusAssessmentRepository;
}

export function getConfidenceAssessmentRepository(): ConfidenceAssessmentRepository {
  return apiConfidenceAssessmentRepository;
}

export {
  localAssessorCertificationRepository,
  localConsensusAssessmentRepository,
  localConfidenceAssessmentRepository,
};

export * from './types';
