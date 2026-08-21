/**
 * OMG Release 4 — maps between the frontend AIAsset shape and the backend
 * AIAsset row shape (enums, ownershipJson, and the flat authorityProfile
 * scalars decomposed on Release 1-3's schema).
 */

import { enumMaps } from './enumMaps';
import type { AIAsset } from '../types';

/** Frontend AIAsset -> backend Prisma `data` payload for create/update. */
export function toBackendAsset(data: Partial<AIAsset>): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (data.name !== undefined) body.name = data.name;
  if (data.type !== undefined) body.type = enumMaps.assetType.toBackend(data.type);
  if (data.description !== undefined) body.description = data.description;
  if (data.department !== undefined) body.department = data.department;
  if (data.version !== undefined) body.version = data.version;
  if (data.status !== undefined) body.status = enumMaps.governanceStatus.toBackend(data.status);
  if (data.operationalStatus !== undefined) body.operationalStatus = data.operationalStatus;
  if (data.riskLevel !== undefined) body.riskLevel = enumMaps.riskLevel.toBackend(data.riskLevel);
  if (data.techStack !== undefined) body.techStack = data.techStack;
  if (data.dataSensitivity !== undefined) body.dataSensitivity = data.dataSensitivity;
  if (data.validationScore !== undefined) body.validationScore = data.validationScore;
  if (data.decisionOutcome !== undefined) body.decisionOutcome = enumMaps.decisionOutcome.toBackend(data.decisionOutcome);
  if (data.tags !== undefined) body.tags = data.tags;
  if (data.ownership !== undefined) body.ownershipJson = data.ownership;
  if (data.oversightType !== undefined) body.oversightType = enumMaps.oversightType.toBackend(data.oversightType);
  if (data.autonomyLevel !== undefined) body.autonomyLevel = data.autonomyLevel;
  if (data.governanceClassification !== undefined) {
    body.governanceClassification = enumMaps.governanceClassification.toBackend(data.governanceClassification);
  }
  if (data.governanceState !== undefined) body.governanceState = enumMaps.governanceState.toBackend(data.governanceState);
  if (data.nextReviewDate !== undefined) body.nextReviewDate = data.nextReviewDate ? new Date(data.nextReviewDate).toISOString() : null;

  if (data.authorityProfile !== undefined) {
    const ap = data.authorityProfile;
    body.accountableOwner = ap.accountableOwner || null;
    body.governanceSponsor = ap.governanceSponsor || null;
    body.authorityRiskOwner = ap.riskOwner || null;
    body.authorityTechnicalOwner = ap.technicalOwner || null;
    body.authorityComplianceOwner = ap.complianceOwner || null;
    body.humanOverrideAuthority = ap.humanOverrideAuthority || null;
    body.killSwitchAuthority = ap.killSwitchAuthority || null;
    body.reassessmentAuthority = ap.reassessmentAuthority || null;
  }

  return body;
}

/** Backend Prisma AIAsset row -> frontend AIAsset. */
export function fromBackendAsset(row: any): AIAsset {
  const hasAuthorityFields =
    row.accountableOwner || row.governanceSponsor || row.authorityRiskOwner ||
    row.authorityTechnicalOwner || row.authorityComplianceOwner;

  return {
    id: row.id,
    name: row.name,
    type: enumMaps.assetType.toFrontend(row.type),
    description: row.description,
    department: row.department,
    version: row.version,
    status: enumMaps.governanceStatus.toFrontend(row.status),
    operationalStatus: row.operationalStatus,
    riskLevel: enumMaps.riskLevel.toFrontend(row.riskLevel),
    ownership: row.ownershipJson || {},
    authorityProfile: hasAuthorityFields
      ? {
          accountableOwner: row.accountableOwner || '',
          governanceSponsor: row.governanceSponsor || '',
          riskOwner: row.authorityRiskOwner || '',
          technicalOwner: row.authorityTechnicalOwner || '',
          complianceOwner: row.authorityComplianceOwner || undefined,
          humanOverrideAuthority: row.humanOverrideAuthority || undefined,
          killSwitchAuthority: row.killSwitchAuthority || undefined,
          reassessmentAuthority: row.reassessmentAuthority || undefined,
        }
      : undefined,
    oversightType: row.oversightType ? enumMaps.oversightType.toFrontend(row.oversightType) : undefined,
    autonomyLevel: row.autonomyLevel ?? undefined,
    governanceClassification: row.governanceClassification
      ? enumMaps.governanceClassification.toFrontend(row.governanceClassification)
      : undefined,
    governanceState: row.governanceState ? enumMaps.governanceState.toFrontend(row.governanceState) : undefined,
    nextReviewDate: row.nextReviewDate ? String(row.nextReviewDate).split('T')[0] : undefined,
    techStack: row.techStack,
    dataSensitivity: row.dataSensitivity,
    validationScore: row.validationScore ?? undefined,
    createdAt: String(row.createdAt).split('T')[0],
    updatedAt: String(row.updatedAt).split('T')[0],
    decisionOutcome: enumMaps.decisionOutcome.toFrontend(row.decisionOutcome),
    tags: row.tags,
  };
}
