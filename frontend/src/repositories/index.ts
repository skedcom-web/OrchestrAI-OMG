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
  localAssetRepository,
  localCompliancePackRepository,
  localControlRepository,
  localEvidenceMappingRepository,
  localEvidenceRepository,
  localGovernanceFindingRepository,
  localGovernancePolicyRepository,
  localGovernanceRepository,
  localObligationControlRepository,
  localObligationEvidenceMappingRepository,
  localObligationRepository,
  localRecommendedActionRepository,
  localRegulatoryRequirementRepository,
  localRegulatorySourceRepository,
  localRequirementRepository,
} from './localRepositories';
import {
  apiAssetRepository,
  apiCompliancePackRepository,
  apiControlRepository,
  apiEvidenceMappingRepository,
  apiEvidenceRepository,
  apiGovernanceFindingRepository,
  apiGovernancePolicyRepository,
  apiGovernanceRepository,
  apiObligationControlRepository,
  apiObligationEvidenceMappingRepository,
  apiObligationRepository,
  apiRecommendedActionRepository,
  apiRegulatoryRequirementRepository,
  apiRegulatorySourceRepository,
  apiRequirementRepository,
} from './apiRepositories';
import type {
  AssetRepository,
  CompliancePackRepository,
  ControlRepository,
  EvidenceMappingRepository,
  EvidenceRepository,
  GovernanceFindingRepository,
  GovernancePolicyRepository,
  GovernanceRepository,
  ObligationControlRepository,
  ObligationEvidenceMappingRepository,
  ObligationRepository,
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

export * from './types';
