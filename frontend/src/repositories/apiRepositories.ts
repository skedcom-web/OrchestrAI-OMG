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
  CompliancePack,
  ComplianceRequirement,
  EvidenceMapping,
  GovernanceReauthorizationRecord,
  PackControl,
  ReassessmentTrigger,
  ScheduledReview,
} from '../types';

export const apiAssetRepository: AssetRepository = {
  async getAssets() {
    const rows = await apiRequest<any[]>('/assets');
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
  async deleteAsset(id) {
    await apiRequest<void>(`/assets/${id}`, { method: 'DELETE' });
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

export type { AIAsset };
