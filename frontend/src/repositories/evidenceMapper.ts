/**
 * OMG Release 4 — maps between the frontend EvidenceRecord shape and the
 * backend EvidenceRecord row. The two shapes already line up closely (Release
 * 3's schema was designed flat, matching the frontend type field-for-field),
 * so this is mostly enum translation and un-nesting `ownership`/`traceability`.
 */

import { enumMaps } from './enumMaps';
import type { EvidenceRecord } from '../types';

export function toBackendEvidence(data: Partial<EvidenceRecord>): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (data.name !== undefined) body.name = data.name;
  if (data.evidenceType !== undefined) body.evidenceType = enumMaps.evidenceType.toBackend(data.evidenceType);
  if (data.status !== undefined) body.status = enumMaps.evidenceStatus.toBackend(data.status);
  if (data.createdDate !== undefined) body.createdDate = new Date(data.createdDate).toISOString();
  if (data.expiryDate !== undefined) body.expiryDate = data.expiryDate ? new Date(data.expiryDate).toISOString() : null;
  if (data.description !== undefined) body.description = data.description;
  if (data.assetId !== undefined) body.assetId = data.assetId;

  if (data.ownership !== undefined) {
    body.evidenceOwner = data.ownership.evidenceOwner;
    body.businessOwner = data.ownership.businessOwner || null;
    body.reviewer = data.ownership.reviewer || null;
    body.approvalAuthority = data.ownership.approvalAuthority || null;
  }

  if (data.traceability !== undefined) {
    body.riskAssessmentRef = data.traceability.riskAssessmentRef || null;
    body.governanceReviewRef = data.traceability.governanceReviewRef || null;
    body.decisionRecordRef = data.traceability.decisionRecordRef || null;
    body.reauthorizationRecordRef = data.traceability.reauthorizationRecordRef || null;
    body.timelineEventRef = data.traceability.timelineEventRef || null;
  }

  return body;
}

/** Backend row -> frontend EvidenceRecord. `assetName` is not stored server-side; pass it in when known. */
export function fromBackendEvidence(row: any, assetName = ''): EvidenceRecord {
  return {
    id: row.id,
    name: row.name,
    evidenceType: enumMaps.evidenceType.toFrontend(row.evidenceType),
    status: enumMaps.evidenceStatus.toFrontend(row.status),
    createdDate: String(row.createdDate).split('T')[0],
    expiryDate: row.expiryDate ? String(row.expiryDate).split('T')[0] : undefined,
    description: row.description,
    assetId: row.assetId,
    assetName,
    ownership: {
      evidenceOwner: row.evidenceOwner,
      businessOwner: row.businessOwner || undefined,
      reviewer: row.reviewer || undefined,
      approvalAuthority: row.approvalAuthority || undefined,
    },
    traceability: {
      riskAssessmentRef: row.riskAssessmentRef || undefined,
      governanceReviewRef: row.governanceReviewRef || undefined,
      decisionRecordRef: row.decisionRecordRef || undefined,
      reauthorizationRecordRef: row.reauthorizationRecordRef || undefined,
      timelineEventRef: row.timelineEventRef || undefined,
    },
  };
}
