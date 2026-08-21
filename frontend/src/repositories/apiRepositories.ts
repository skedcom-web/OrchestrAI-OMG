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
import type { AssetRepository, EvidenceRepository, GovernanceData, GovernanceRecordKind, GovernanceRepository } from './types';
import type { AIAsset, GovernanceReauthorizationRecord, ReassessmentTrigger, ScheduledReview } from '../types';

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

export type { AIAsset };
