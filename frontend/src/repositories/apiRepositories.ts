/**
 * OMG Release 4 — Persistence Foundation, Api Repository.
 *
 * Real implementations backed by the NestJS + Prisma + Neon API. Same
 * interface as the Local repository (see types.ts), so callers — the
 * Migration Utility today, individual pages in a future release — don't
 * need to know which one they're talking to.
 */

import { apiRequest } from './apiClient';
import { fromBackendAsset, toBackendAsset } from './assetMapper';
import { fromBackendEvidence, toBackendEvidence } from './evidenceMapper';
import { enumMaps } from './enumMaps';
import type {
  ActionRuleRepository,
  AssetRepository,
  CompliancePackRepository,
  ConditionDefinitionRepository,
  ControlRepository,
  DecisionRepository,
  EvidenceMappingRepository,
  EvidenceRepository,
  GovernanceData,
  GovernanceDriftRepository,
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
  ActionRule,
  AIAsset,
  CompliancePack,
  ComplianceRequirement,
  ConditionDefinition,
  DecisionRecord,
  EvidenceMapping,
  GovernanceDrift,
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

export const apiAssetRepository: AssetRepository = {
  async getAssets(includeArchived) {
    const rows = await apiRequest<any[]>(`/assets${includeArchived ? '?includeArchived=true' : ''}`);
    return rows.map(fromBackendAsset);
  },
  async createAsset(data) {
    const row = await apiRequest<any>('/assets', { method: 'POST', body: JSON.stringify(toBackendAsset(data)) });
    return fromBackendAsset(row);
  },
  async updateAsset(id, data) {
    const row = await apiRequest<any>(`/assets/${id}`, { method: 'PATCH', body: JSON.stringify(toBackendAsset(data)) });
    return fromBackendAsset(row);
  },
  async archiveAsset(id, archivedBy, archiveReason) {
    await apiRequest<void>(`/assets/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ archivedBy, archiveReason }),
    });
  },
  async restoreAsset(id) {
    await apiRequest<void>(`/assets/${id}/restore`, { method: 'PATCH' });
  },
};

export const apiEvidenceRepository: EvidenceRepository = {
  async getEvidence() {
    const rows = await apiRequest<any[]>('/evidence-records');
    return rows.map(r => fromBackendEvidence(r));
  },
  async createEvidence(data) {
    const row = await apiRequest<any>('/evidence-records', { method: 'POST', body: JSON.stringify(toBackendEvidence(data)) });
    return fromBackendEvidence(row, data.assetName);
  },
  async updateEvidence(id, data) {
    const row = await apiRequest<any>(`/evidence-records/${id}`, { method: 'PATCH', body: JSON.stringify(toBackendEvidence(data)) });
    return fromBackendEvidence(row, data.assetName);
  },
  async deleteEvidence(id) {
    await apiRequest<void>(`/evidence-records/${id}`, { method: 'DELETE' });
  },
};

function triggerToBackend(data: Partial<ReassessmentTrigger>) {
  const body: Record<string, unknown> = { ...data };
  delete body.assetName;
  if (data.triggerType) body.triggerType = enumMaps.triggerType.toBackend(data.triggerType);
  if (data.severity) body.severity = enumMaps.severity.toBackend(data.severity);
  if (data.status) body.status = enumMaps.triggerStatus.toBackend(data.status);
  if (data.dateDetected) body.dateDetected = new Date(data.dateDetected).toISOString();
  return body;
}

function triggerFromBackend(row: any, assetName = ''): ReassessmentTrigger {
  return {
    id: row.id,
    assetId: row.assetId,
    assetName,
    triggerType: enumMaps.triggerType.toFrontend(row.triggerType),
    dateDetected: String(row.dateDetected).split('T')[0],
    severity: enumMaps.severity.toFrontend(row.severity),
    owner: row.owner,
    status: enumMaps.triggerStatus.toFrontend(row.status),
    comments: row.comments,
  };
}

function reauthToBackend(data: Partial<GovernanceReauthorizationRecord>) {
  const body: Record<string, unknown> = { ...data };
  delete body.assetName;
  delete body.id;
  if (data.decision) body.decision = enumMaps.decisionOutcome.toBackend(data.decision);
  if (data.previousState) body.previousState = enumMaps.governanceState.toBackend(data.previousState);
  if (data.newState) body.newState = enumMaps.governanceState.toBackend(data.newState);
  if (data.reviewDate) body.reviewDate = new Date(data.reviewDate).toISOString();
  return body;
}

function reauthFromBackend(row: any, assetName = ''): GovernanceReauthorizationRecord {
  return {
    id: row.id,
    assetId: row.assetId,
    assetName,
    reviewedBy: row.reviewedBy,
    reviewDate: String(row.reviewDate).split('T')[0],
    decision: enumMaps.decisionOutcome.toFrontend(row.decision),
    reason: row.reason,
    supportingNotes: row.supportingNotes || '',
    previousState: enumMaps.governanceState.toFrontend(row.previousState),
    newState: enumMaps.governanceState.toFrontend(row.newState),
  };
}

function reviewToBackend(data: Partial<ScheduledReview>) {
  const body: Record<string, unknown> = { ...data };
  delete body.assetName;
  if (data.dueDate) body.dueDate = new Date(data.dueDate).toISOString();
  return body;
}

function reviewFromBackend(row: any, assetName = ''): ScheduledReview {
  return {
    id: row.id,
    assetId: row.assetId,
    assetName,
    reviewType: row.reviewType,
    owner: row.owner,
    dueDate: String(row.dueDate).split('T')[0],
    status: row.status,
    outcome: row.outcome || undefined,
  };
}

export const apiGovernanceRepository: GovernanceRepository = {
  async getGovernanceData(): Promise<GovernanceData> {
    const [triggers, reauthorizations, reviews] = await Promise.all([
      apiRequest<any[]>('/reassessment-triggers'),
      apiRequest<any[]>('/reauthorization-records'),
      apiRequest<any[]>('/monitoring/reviews'),
    ]);
    return {
      triggers: triggers.map(r => triggerFromBackend(r)),
      reauthorizations: reauthorizations.map(r => reauthFromBackend(r)),
      reviews: reviews.map(r => reviewFromBackend(r)),
    };
  },
  async createGovernanceRecord(kind: GovernanceRecordKind, data) {
    if (kind === 'trigger') {
      const row = await apiRequest<any>('/reassessment-triggers', {
        method: 'POST',
        body: JSON.stringify(triggerToBackend(data as Partial<ReassessmentTrigger>)),
      });
      return triggerFromBackend(row, (data as Partial<ReassessmentTrigger>).assetName);
    }
    if (kind === 'reauthorization') {
      const row = await apiRequest<any>('/reauthorization-records', {
        method: 'POST',
        body: JSON.stringify(reauthToBackend(data as Partial<GovernanceReauthorizationRecord>)),
      });
      return reauthFromBackend(row, (data as Partial<GovernanceReauthorizationRecord>).assetName);
    }
    const row = await apiRequest<any>('/monitoring/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewToBackend(data as Partial<ScheduledReview>)),
    });
    return reviewFromBackend(row, (data as Partial<ScheduledReview>).assetName);
  },
  async updateGovernanceRecord(kind: GovernanceRecordKind, id: string, data) {
    if (kind === 'trigger') {
      const row = await apiRequest<any>(`/reassessment-triggers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(triggerToBackend(data as Partial<ReassessmentTrigger>)),
      });
      return triggerFromBackend(row, (data as Partial<ReassessmentTrigger>).assetName);
    }
    if (kind === 'review') {
      const row = await apiRequest<any>(`/monitoring/reviews/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(reviewToBackend(data as Partial<ScheduledReview>)),
      });
      return reviewFromBackend(row, (data as Partial<ScheduledReview>).assetName);
    }
    throw new Error('Reauthorization records cannot be updated once created.');
  },
};

// --- RELEASE 5.1 — COMPLIANCE PERSISTENCE ALIGNMENT ---

function packToBackend(data: Partial<CompliancePack>) {
  const body: Record<string, unknown> = { ...data };
  if (data.status) body.status = enumMaps.compliancePackStatus.toBackend(data.status);
  if (data.effectiveDate) body.effectiveDate = new Date(data.effectiveDate).toISOString();
  return body;
}

function packFromBackend(row: any): CompliancePack {
  return {
    id: row.id,
    name: row.name,
    version: row.version,
    status: enumMaps.compliancePackStatus.toFrontend(row.status),
    owner: row.owner,
    description: row.description,
    industry: row.industry,
    effectiveDate: String(row.effectiveDate).split('T')[0],
  };
}

function requirementToBackend(data: Partial<ComplianceRequirement>) {
  const body: Record<string, unknown> = { ...data };
  delete body.packName;
  if (data.priority) body.priority = enumMaps.requirementPriority.toBackend(data.priority);
  if (data.status) body.status = enumMaps.requirementStatus.toBackend(data.status);
  return body;
}

function requirementFromBackend(row: any, packName = ''): ComplianceRequirement {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    packId: row.packId,
    packName,
    category: row.category,
    priority: enumMaps.requirementPriority.toFrontend(row.priority),
    status: enumMaps.requirementStatus.toFrontend(row.status),
  };
}

function controlToBackend(data: Partial<PackControl>) {
  const body: Record<string, unknown> = { ...data };
  delete body.requirementName;
  if (data.status) body.status = enumMaps.packControlStatus.toBackend(data.status);
  return body;
}

function controlFromBackend(row: any, requirementName = ''): PackControl {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    requirementId: row.requirementId,
    requirementName,
    owner: row.owner || '',
    status: enumMaps.packControlStatus.toFrontend(row.status),
  };
}

function mappingToBackend(data: Partial<EvidenceMapping>) {
  const body: Record<string, unknown> = {};
  if (data.id) body.id = data.id;
  if (data.controlId) body.controlId = data.controlId;
  if (data.evidenceId) body.evidenceRecordId = data.evidenceId;
  return body;
}

function mappingFromBackend(row: any, controlName = '', evidenceName = ''): EvidenceMapping {
  return {
    id: row.id,
    controlId: row.controlId,
    controlName,
    evidenceId: row.evidenceRecordId,
    evidenceName,
  };
}

export const apiCompliancePackRepository: CompliancePackRepository = {
  async getCompliancePacks() {
    const rows = await apiRequest<any[]>('/compliance-packs');
    return rows.map(packFromBackend);
  },
  async createCompliancePack(data) {
    const row = await apiRequest<any>('/compliance-packs', { method: 'POST', body: JSON.stringify(packToBackend(data)) });
    return packFromBackend(row);
  },
  async updateCompliancePack(id, data) {
    const row = await apiRequest<any>(`/compliance-packs/${id}`, { method: 'PATCH', body: JSON.stringify(packToBackend(data)) });
    return packFromBackend(row);
  },
  async deleteCompliancePack(id) {
    await apiRequest<void>(`/compliance-packs/${id}`, { method: 'DELETE' });
  },
};

export const apiRequirementRepository: RequirementRepository = {
  async getRequirements() {
    const rows = await apiRequest<any[]>('/compliance-requirements');
    return rows.map(r => requirementFromBackend(r));
  },
  async createRequirement(data) {
    const row = await apiRequest<any>('/compliance-requirements', { method: 'POST', body: JSON.stringify(requirementToBackend(data)) });
    return requirementFromBackend(row, data.packName);
  },
  async updateRequirement(id, data) {
    const row = await apiRequest<any>(`/compliance-requirements/${id}`, { method: 'PATCH', body: JSON.stringify(requirementToBackend(data)) });
    return requirementFromBackend(row, data.packName);
  },
  async deleteRequirement(id) {
    await apiRequest<void>(`/compliance-requirements/${id}`, { method: 'DELETE' });
  },
};

export const apiControlRepository: ControlRepository = {
  async getControls() {
    const rows = await apiRequest<any[]>('/pack-controls');
    return rows.map(r => controlFromBackend(r));
  },
  async createControl(data) {
    const row = await apiRequest<any>('/pack-controls', { method: 'POST', body: JSON.stringify(controlToBackend(data)) });
    return controlFromBackend(row, data.requirementName);
  },
  async updateControl(id, data) {
    const row = await apiRequest<any>(`/pack-controls/${id}`, { method: 'PATCH', body: JSON.stringify(controlToBackend(data)) });
    return controlFromBackend(row, data.requirementName);
  },
  async deleteControl(id) {
    await apiRequest<void>(`/pack-controls/${id}`, { method: 'DELETE' });
  },
};

export const apiEvidenceMappingRepository: EvidenceMappingRepository = {
  async getMappings() {
    const rows = await apiRequest<any[]>('/evidence-mappings');
    return rows.map(r => mappingFromBackend(r));
  },
  async createMapping(data) {
    const row = await apiRequest<any>('/evidence-mappings', { method: 'POST', body: JSON.stringify(mappingToBackend(data)) });
    return mappingFromBackend(row, data.controlName, data.evidenceName);
  },
  async updateMapping(id, data) {
    const row = await apiRequest<any>(`/evidence-mappings/${id}`, { method: 'PATCH', body: JSON.stringify(mappingToBackend(data)) });
    return mappingFromBackend(row, data.controlName, data.evidenceName);
  },
  async deleteMapping(id) {
    await apiRequest<void>(`/evidence-mappings/${id}`, { method: 'DELETE' });
  },
};

// --- RELEASE 6 — UNIVERSAL REGULATORY KNOWLEDGE & OBLIGATION ENGINE ---

function sourceToBackend(data: Partial<RegulatorySource>) {
  const body: Record<string, unknown> = { ...data };
  if (data.sourceType) body.sourceType = enumMaps.regulatorySourceType.toBackend(data.sourceType);
  if (data.status) body.status = enumMaps.regulatorySourceStatus.toBackend(data.status);
  if (data.effectiveDate) body.effectiveDate = new Date(data.effectiveDate).toISOString();
  if (data.reviewDate) body.reviewDate = new Date(data.reviewDate).toISOString();
  return body;
}

function sourceFromBackend(row: any): RegulatorySource {
  return {
    id: row.id,
    name: row.name,
    sourceType: enumMaps.regulatorySourceType.toFrontend(row.sourceType),
    jurisdiction: row.jurisdiction,
    industry: row.industry,
    version: row.version,
    effectiveDate: String(row.effectiveDate).split('T')[0],
    reviewDate: row.reviewDate ? String(row.reviewDate).split('T')[0] : undefined,
    status: enumMaps.regulatorySourceStatus.toFrontend(row.status),
  };
}

function regRequirementToBackend(data: Partial<RegulatoryRequirement>) {
  const body: Record<string, unknown> = { ...data };
  delete body.sourceName;
  if (data.criticality) body.criticality = enumMaps.requirementCriticality.toBackend(data.criticality);
  if (data.status) body.status = enumMaps.regulatoryRequirementStatus.toBackend(data.status);
  return body;
}

function regRequirementFromBackend(row: any, sourceName = ''): RegulatoryRequirement {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    criticality: enumMaps.requirementCriticality.toFrontend(row.criticality),
    status: enumMaps.regulatoryRequirementStatus.toFrontend(row.status),
    sourceId: row.sourceId,
    sourceName,
  };
}

function obligationToBackend(data: Partial<Obligation>) {
  const body: Record<string, unknown> = { ...data };
  delete body.requirementName;
  if (data.status) body.status = enumMaps.obligationStatus.toBackend(data.status);
  return body;
}

function obligationFromBackend(row: any, requirementName = ''): Obligation {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    owner: row.owner || '',
    status: enumMaps.obligationStatus.toFrontend(row.status),
    requirementId: row.requirementId,
    requirementName,
  };
}

function obligationControlToBackend(data: Partial<ObligationControl>) {
  const body: Record<string, unknown> = { ...data };
  delete body.obligationName;
  if (data.status) body.status = enumMaps.obligationControlStatus.toBackend(data.status);
  return body;
}

function obligationControlFromBackend(row: any, obligationName = ''): ObligationControl {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    owner: row.owner || '',
    status: enumMaps.obligationControlStatus.toFrontend(row.status),
    obligationId: row.obligationId,
    obligationName,
  };
}

function obligationMappingToBackend(data: Partial<ObligationEvidenceMapping>) {
  const body: Record<string, unknown> = {};
  if (data.id) body.id = data.id;
  if (data.controlId) body.controlId = data.controlId;
  if (data.evidenceId) body.evidenceRecordId = data.evidenceId;
  return body;
}

function obligationMappingFromBackend(row: any, controlName = '', evidenceName = ''): ObligationEvidenceMapping {
  return {
    id: row.id,
    controlId: row.controlId,
    controlName,
    evidenceId: row.evidenceRecordId,
    evidenceName,
  };
}

export const apiRegulatorySourceRepository: RegulatorySourceRepository = {
  async getSources() {
    const rows = await apiRequest<any[]>('/regulatory-sources');
    return rows.map(sourceFromBackend);
  },
  async createSource(data) {
    const row = await apiRequest<any>('/regulatory-sources', { method: 'POST', body: JSON.stringify(sourceToBackend(data)) });
    return sourceFromBackend(row);
  },
  async updateSource(id, data) {
    const row = await apiRequest<any>(`/regulatory-sources/${id}`, { method: 'PATCH', body: JSON.stringify(sourceToBackend(data)) });
    return sourceFromBackend(row);
  },
  async deleteSource(id) {
    await apiRequest<void>(`/regulatory-sources/${id}`, { method: 'DELETE' });
  },
};

export const apiRegulatoryRequirementRepository: RegulatoryRequirementRepository = {
  async getRequirements() {
    const rows = await apiRequest<any[]>('/regulatory-requirements');
    return rows.map(r => regRequirementFromBackend(r));
  },
  async createRequirement(data) {
    const row = await apiRequest<any>('/regulatory-requirements', { method: 'POST', body: JSON.stringify(regRequirementToBackend(data)) });
    return regRequirementFromBackend(row, data.sourceName);
  },
  async updateRequirement(id, data) {
    const row = await apiRequest<any>(`/regulatory-requirements/${id}`, { method: 'PATCH', body: JSON.stringify(regRequirementToBackend(data)) });
    return regRequirementFromBackend(row, data.sourceName);
  },
  async deleteRequirement(id) {
    await apiRequest<void>(`/regulatory-requirements/${id}`, { method: 'DELETE' });
  },
};

export const apiObligationRepository: ObligationRepository = {
  async getObligations() {
    const rows = await apiRequest<any[]>('/obligations');
    return rows.map(r => obligationFromBackend(r));
  },
  async createObligation(data) {
    const row = await apiRequest<any>('/obligations', { method: 'POST', body: JSON.stringify(obligationToBackend(data)) });
    return obligationFromBackend(row, data.requirementName);
  },
  async updateObligation(id, data) {
    const row = await apiRequest<any>(`/obligations/${id}`, { method: 'PATCH', body: JSON.stringify(obligationToBackend(data)) });
    return obligationFromBackend(row, data.requirementName);
  },
  async deleteObligation(id) {
    await apiRequest<void>(`/obligations/${id}`, { method: 'DELETE' });
  },
};

export const apiObligationControlRepository: ObligationControlRepository = {
  async getControls() {
    const rows = await apiRequest<any[]>('/obligation-controls');
    return rows.map(r => obligationControlFromBackend(r));
  },
  async createControl(data) {
    const row = await apiRequest<any>('/obligation-controls', { method: 'POST', body: JSON.stringify(obligationControlToBackend(data)) });
    return obligationControlFromBackend(row, data.obligationName);
  },
  async updateControl(id, data) {
    const row = await apiRequest<any>(`/obligation-controls/${id}`, { method: 'PATCH', body: JSON.stringify(obligationControlToBackend(data)) });
    return obligationControlFromBackend(row, data.obligationName);
  },
  async deleteControl(id) {
    await apiRequest<void>(`/obligation-controls/${id}`, { method: 'DELETE' });
  },
};

export const apiObligationEvidenceMappingRepository: ObligationEvidenceMappingRepository = {
  async getMappings() {
    const rows = await apiRequest<any[]>('/obligation-evidence-mappings');
    return rows.map(r => obligationMappingFromBackend(r));
  },
  async createMapping(data) {
    const row = await apiRequest<any>('/obligation-evidence-mappings', { method: 'POST', body: JSON.stringify(obligationMappingToBackend(data)) });
    return obligationMappingFromBackend(row, data.controlName, data.evidenceName);
  },
  async updateMapping(id, data) {
    const row = await apiRequest<any>(`/obligation-evidence-mappings/${id}`, { method: 'PATCH', body: JSON.stringify(obligationMappingToBackend(data)) });
    return obligationMappingFromBackend(row, data.controlName, data.evidenceName);
  },
  async deleteMapping(id) {
    await apiRequest<void>(`/obligation-evidence-mappings/${id}`, { method: 'DELETE' });
  },
};

// --- RELEASE 7 — GOVERNANCE INTELLIGENCE ENGINE (FOUNDATION) ---

function policyToBackend(data: Partial<GovernancePolicy>) {
  const body: Record<string, unknown> = { ...data };
  if (data.severity) body.severity = enumMaps.governancePolicySeverity.toBackend(data.severity);
  if (data.status) body.status = enumMaps.governancePolicyStatus.toBackend(data.status);
  if (data.triggerCondition) body.triggerCondition = enumMaps.governanceConditionType.toBackend(data.triggerCondition);
  delete body.obligationName;
  return body;
}

function policyFromBackend(row: any, obligationName = ''): GovernancePolicy {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    severity: enumMaps.governancePolicySeverity.toFrontend(row.severity),
    status: enumMaps.governancePolicyStatus.toFrontend(row.status),
    triggerCondition: enumMaps.governanceConditionType.toFrontend(row.triggerCondition),
    obligationId: row.obligationId || undefined,
    obligationName: row.obligationId ? obligationName : undefined,
    linkedControlIds: row.linkedControlIds || [],
  };
}

function findingToBackend(data: Partial<GovernanceFinding>) {
  const body: Record<string, unknown> = { ...data };
  delete body.assetName;
  delete body.policyName;
  if (data.severity) body.severity = enumMaps.governancePolicySeverity.toBackend(data.severity);
  if (data.status) body.status = enumMaps.governanceFindingStatus.toBackend(data.status);
  if (data.conditionType) body.conditionType = enumMaps.governanceConditionType.toBackend(data.conditionType);
  if (data.createdDate) body.createdDate = new Date(data.createdDate).toISOString();
  if (data.resolutionDate) body.resolutionDate = new Date(data.resolutionDate).toISOString();
  return body;
}

function findingFromBackend(row: any, assetName = '', policyName = ''): GovernanceFinding {
  return {
    id: row.id,
    assetId: row.assetId,
    assetName,
    policyId: row.policyId,
    policyName,
    conditionType: enumMaps.governanceConditionType.toFrontend(row.conditionType),
    severity: enumMaps.governancePolicySeverity.toFrontend(row.severity),
    status: enumMaps.governanceFindingStatus.toFrontend(row.status),
    detail: row.detail,
    createdDate: String(row.createdDate).split('T')[0],
    resolutionDate: row.resolutionDate ? String(row.resolutionDate).split('T')[0] : undefined,
    resolutionNotes: row.resolutionNotes || undefined,
  };
}

export const apiGovernancePolicyRepository: GovernancePolicyRepository = {
  async getPolicies() {
    const rows = await apiRequest<any[]>('/governance-policies');
    return rows.map(r => policyFromBackend(r));
  },
  async createPolicy(data) {
    const row = await apiRequest<any>('/governance-policies', { method: 'POST', body: JSON.stringify(policyToBackend(data)) });
    return policyFromBackend(row, data.obligationName);
  },
  async updatePolicy(id, data) {
    const row = await apiRequest<any>(`/governance-policies/${id}`, { method: 'PATCH', body: JSON.stringify(policyToBackend(data)) });
    return policyFromBackend(row, data.obligationName);
  },
  async deletePolicy(id) {
    await apiRequest<void>(`/governance-policies/${id}`, { method: 'DELETE' });
  },
};

export const apiGovernanceFindingRepository: GovernanceFindingRepository = {
  async getFindings() {
    const rows = await apiRequest<any[]>('/governance-findings');
    return rows.map(r => findingFromBackend(r));
  },
  async createFinding(data) {
    const row = await apiRequest<any>('/governance-findings', { method: 'POST', body: JSON.stringify(findingToBackend(data)) });
    return findingFromBackend(row, data.assetName, data.policyName);
  },
  async updateFinding(id, data) {
    const row = await apiRequest<any>(`/governance-findings/${id}`, { method: 'PATCH', body: JSON.stringify(findingToBackend(data)) });
    return findingFromBackend(row, data.assetName, data.policyName);
  },
  async deleteFinding(id) {
    await apiRequest<void>(`/governance-findings/${id}`, { method: 'DELETE' });
  },
};

// --- RELEASE 8 — GOVERNANCE INTELLIGENCE ENGINE (ACTIONS EDITION) ---

function actionToBackend(data: Partial<RecommendedAction>) {
  const body: Record<string, unknown> = { ...data };
  delete body.assetName;
  delete body.policyName;
  if (data.actionType) body.actionType = enumMaps.recommendedActionType.toBackend(data.actionType);
  if (data.priority) body.priority = enumMaps.recommendedActionPriority.toBackend(data.priority);
  if (data.status) body.status = enumMaps.recommendedActionStatus.toBackend(data.status);
  if (data.dueDate) body.dueDate = new Date(data.dueDate).toISOString();
  if (data.decidedAt) body.decidedAt = new Date(data.decidedAt).toISOString();
  return body;
}

function actionFromBackend(row: any, assetName = '', policyName = ''): RecommendedAction {
  return {
    id: row.id,
    actionType: enumMaps.recommendedActionType.toFrontend(row.actionType),
    name: row.name,
    description: row.description,
    assetId: row.assetId,
    assetName,
    policyId: row.policyId || undefined,
    policyName: row.policyId ? policyName : undefined,
    findingId: row.findingId || undefined,
    priority: enumMaps.recommendedActionPriority.toFrontend(row.priority),
    owner: row.owner || undefined,
    dueDate: row.dueDate ? String(row.dueDate).split('T')[0] : undefined,
    status: enumMaps.recommendedActionStatus.toFrontend(row.status),
    decidedBy: row.decidedBy || undefined,
    decidedAt: row.decidedAt ? String(row.decidedAt).split('T')[0] : undefined,
    createdAt: row.createdAt ? String(row.createdAt) : undefined,
  };
}

export const apiRecommendedActionRepository: RecommendedActionRepository = {
  async getActions() {
    const rows = await apiRequest<any[]>('/recommended-actions');
    return rows.map(r => actionFromBackend(r));
  },
  async createAction(data) {
    const row = await apiRequest<any>('/recommended-actions', { method: 'POST', body: JSON.stringify(actionToBackend(data)) });
    return actionFromBackend(row, data.assetName, data.policyName);
  },
  async updateAction(id, data) {
    const row = await apiRequest<any>(`/recommended-actions/${id}`, { method: 'PATCH', body: JSON.stringify(actionToBackend(data)) });
    return actionFromBackend(row, data.assetName, data.policyName);
  },
  async deleteAction(id) {
    await apiRequest<void>(`/recommended-actions/${id}`, { method: 'DELETE' });
  },
};

// --- RELEASE 10 — GOVERNANCE INTELLIGENCE STUDIO (CUSTOMER CONFIGURATION) ---

function conditionDefinitionToBackend(data: Partial<ConditionDefinition>) {
  const body: Record<string, unknown> = { ...data };
  if (data.conditionType) body.conditionType = enumMaps.governanceConditionType.toBackend(data.conditionType);
  if (data.defaultSeverity) body.defaultSeverity = enumMaps.governancePolicySeverity.toBackend(data.defaultSeverity);
  return body;
}

function conditionDefinitionFromBackend(row: any): ConditionDefinition {
  return {
    id: row.id,
    conditionType: enumMaps.governanceConditionType.toFrontend(row.conditionType),
    label: row.label,
    description: row.description,
    defaultSeverity: enumMaps.governancePolicySeverity.toFrontend(row.defaultSeverity),
    enabled: row.enabled,
  };
}

function outcomeRuleToBackend(data: Partial<OutcomeRule>) {
  const body: Record<string, unknown> = { ...data };
  if (data.outcomeStatus) body.outcomeStatus = enumMaps.governanceOutcomeStatus.toBackend(data.outcomeStatus);
  return body;
}

function outcomeRuleFromBackend(row: any): OutcomeRule {
  return {
    id: row.id,
    outcomeStatus: enumMaps.governanceOutcomeStatus.toFrontend(row.outcomeStatus),
    description: row.description,
    enabled: row.enabled,
  };
}

function actionRuleToBackend(data: Partial<ActionRule>) {
  const body: Record<string, unknown> = { ...data };
  if (data.triggerType) body.triggerType = enumMaps.actionRuleTriggerType.toBackend(data.triggerType);
  if (data.actionType) body.actionType = enumMaps.recommendedActionType.toBackend(data.actionType);
  return body;
}

function actionRuleFromBackend(row: any): ActionRule {
  return {
    id: row.id,
    triggerType: enumMaps.actionRuleTriggerType.toFrontend(row.triggerType),
    triggerValue: row.triggerValue,
    actionType: enumMaps.recommendedActionType.toFrontend(row.actionType),
    actionName: row.actionName,
    actionDescription: row.actionDescription,
    enabled: row.enabled,
  };
}

function governanceProfileFromBackend(row: any): GovernanceProfile {
  return {
    id: row.id,
    name: row.name,
    industry: row.industry,
    description: row.description,
    isActive: row.isActive,
  };
}

export const apiConditionDefinitionRepository: ConditionDefinitionRepository = {
  async getDefinitions() {
    const rows = await apiRequest<any[]>('/condition-definitions');
    return rows.map(conditionDefinitionFromBackend);
  },
  async updateDefinition(id, data) {
    const row = await apiRequest<any>(`/condition-definitions/${id}`, { method: 'PATCH', body: JSON.stringify(conditionDefinitionToBackend(data)) });
    return conditionDefinitionFromBackend(row);
  },
};

export const apiOutcomeRuleRepository: OutcomeRuleRepository = {
  async getRules() {
    const rows = await apiRequest<any[]>('/outcome-rules');
    return rows.map(outcomeRuleFromBackend);
  },
  async updateRule(id, data) {
    const row = await apiRequest<any>(`/outcome-rules/${id}`, { method: 'PATCH', body: JSON.stringify(outcomeRuleToBackend(data)) });
    return outcomeRuleFromBackend(row);
  },
};

export const apiActionRuleRepository: ActionRuleRepository = {
  async getRules() {
    const rows = await apiRequest<any[]>('/action-rules');
    return rows.map(actionRuleFromBackend);
  },
  async createRule(data) {
    const row = await apiRequest<any>('/action-rules', { method: 'POST', body: JSON.stringify(actionRuleToBackend(data)) });
    return actionRuleFromBackend(row);
  },
  async updateRule(id, data) {
    const row = await apiRequest<any>(`/action-rules/${id}`, { method: 'PATCH', body: JSON.stringify(actionRuleToBackend(data)) });
    return actionRuleFromBackend(row);
  },
  async deleteRule(id) {
    await apiRequest<void>(`/action-rules/${id}`, { method: 'DELETE' });
  },
};

export const apiGovernanceProfileRepository: GovernanceProfileRepository = {
  async getProfiles() {
    const rows = await apiRequest<any[]>('/governance-profiles');
    return rows.map(governanceProfileFromBackend);
  },
  async createProfile(data) {
    const row = await apiRequest<any>('/governance-profiles', { method: 'POST', body: JSON.stringify(data) });
    return governanceProfileFromBackend(row);
  },
  async updateProfile(id, data) {
    const row = await apiRequest<any>(`/governance-profiles/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    return governanceProfileFromBackend(row);
  },
};

// --- OMG vNEXT — GOVERNANCE INTELLIGENCE, MODULE 2: DECISION GOVERNANCE ---
// Extends the pre-existing DecisionRecord persistence; not a new entity.

function decisionToBackend(data: Partial<DecisionRecord>) {
  const body: Record<string, unknown> = { ...data };
  delete body.id;
  delete body.decisionDate;
  delete body.conditions; // not a persisted column — informational only, same as today's local-storage behaviour
  if (data.outcome) body.outcome = enumMaps.decisionOutcome.toBackend(data.outcome);
  if (data.decisionType) body.decisionType = enumMaps.decisionType.toBackend(data.decisionType);
  return body;
}

function decisionFromBackend(row: any): DecisionRecord {
  return {
    id: row.id,
    assetId: row.assetId,
    outcome: enumMaps.decisionOutcome.toFrontend(row.outcome),
    checklist: row.checklist,
    decisionOwner: row.decisionOwner,
    decisionDate: String(row.createdAt).split('T')[0],
    justification: row.justification,
    decisionType: row.decisionType ? enumMaps.decisionType.toFrontend(row.decisionType) : undefined,
    authorityRole: row.authorityRole || undefined,
    linkedEvidenceIds: row.linkedEvidenceIds || [],
  };
}

export const apiDecisionRepository: DecisionRepository = {
  async getDecisions(assetId) {
    const rows = await apiRequest<any[]>(`/decisions${assetId ? `?assetId=${assetId}` : ''}`);
    return rows.map(decisionFromBackend);
  },
  async createDecision(data) {
    const row = await apiRequest<any>('/decisions', { method: 'POST', body: JSON.stringify(decisionToBackend(data)) });
    return decisionFromBackend(row);
  },
};

// --- OMG vNEXT — GOVERNANCE INTELLIGENCE, MODULE 3: GOVERNANCE DRIFT ---

function driftToBackend(data: Partial<GovernanceDrift>) {
  const body: Record<string, unknown> = { ...data };
  delete body.id;
  delete body.assetName;
  delete body.detectedAt;
  if (data.category) body.category = enumMaps.driftCategory.toBackend(data.category);
  if (data.severity) body.severity = enumMaps.severity.toBackend(data.severity);
  if (data.status) body.status = enumMaps.driftStatus.toBackend(data.status);
  if (data.resolvedAt) body.resolvedAt = new Date(data.resolvedAt).toISOString();
  return body;
}

function driftFromBackend(row: any, assetName = ''): GovernanceDrift {
  return {
    id: row.id,
    assetId: row.assetId,
    assetName,
    category: enumMaps.driftCategory.toFrontend(row.category),
    severity: enumMaps.severity.toFrontend(row.severity),
    status: enumMaps.driftStatus.toFrontend(row.status),
    detail: row.detail,
    detectedAt: String(row.detectedAt).split('T')[0],
    resolvedAt: row.resolvedAt ? String(row.resolvedAt).split('T')[0] : undefined,
  };
}

export const apiGovernanceDriftRepository: GovernanceDriftRepository = {
  async getDrifts(assetId) {
    const rows = await apiRequest<any[]>(`/governance-drift${assetId ? `?assetId=${assetId}` : ''}`);
    return rows.map(r => driftFromBackend(r));
  },
  async createDrift(data) {
    const row = await apiRequest<any>('/governance-drift', { method: 'POST', body: JSON.stringify(driftToBackend(data)) });
    return driftFromBackend(row, data.assetName);
  },
  async updateDrift(id, data) {
    const row = await apiRequest<any>(`/governance-drift/${id}`, { method: 'PATCH', body: JSON.stringify(driftToBackend(data)) });
    return driftFromBackend(row, data.assetName);
  },
};

export type { AIAsset };
