/**
 * OMG Release 4 — Data Migration Utility.
 *
 * Local Storage → Neon. Purpose: preserve demo data while moving a tenant to
 * production persistence. Always writes through the Api repositories
 * directly (regardless of the current Data Mode), so running the migration
 * doesn't depend on already being switched to Production Mode.
 *
 * Assets get new backend-assigned ids; every dependent record (evidence,
 * triggers, reauthorizations, reviews) is re-pointed at the new id so
 * referential integrity survives the move.
 */

import {
  getAssets,
  getEvidenceRecords,
  getReassessmentTriggers,
  getReauthorizationRecords,
  getScheduledReviews,
} from './storageService';
import { apiAssetRepository, apiEvidenceRepository, apiGovernanceRepository } from '../repositories/apiRepositories';

export interface MigrationResult {
  assetsCreated: number;
  evidenceCreated: number;
  triggersCreated: number;
  reauthorizationsCreated: number;
  reviewsCreated: number;
  errors: string[];
}

export async function migrateLocalDataToNeon(
  onProgress?: (message: string) => void
): Promise<MigrationResult> {
  const result: MigrationResult = {
    assetsCreated: 0,
    evidenceCreated: 0,
    triggersCreated: 0,
    reauthorizationsCreated: 0,
    reviewsCreated: 0,
    errors: [],
  };

  const report = (msg: string) => onProgress?.(msg);
  const assetIdMap = new Map<string, string>(); // local id -> Neon id

  const localAssets = getAssets();
  report(`Migrating ${localAssets.length} assets...`);
  for (const asset of localAssets) {
    try {
      const { id: _localId, ...rest } = asset;
      const created = await apiAssetRepository.createAsset(rest);
      assetIdMap.set(asset.id, created.id);
      result.assetsCreated++;
    } catch (err) {
      result.errors.push(`Asset "${asset.name}": ${(err as Error).message}`);
    }
  }

  const localEvidence = getEvidenceRecords();
  report(`Migrating ${localEvidence.length} evidence records...`);
  for (const record of localEvidence) {
    const neonAssetId = assetIdMap.get(record.assetId);
    if (!neonAssetId) {
      result.errors.push(`Evidence "${record.name}": linked asset was not migrated.`);
      continue;
    }
    try {
      await apiEvidenceRepository.createEvidence({ ...record, assetId: neonAssetId });
      result.evidenceCreated++;
    } catch (err) {
      result.errors.push(`Evidence "${record.name}": ${(err as Error).message}`);
    }
  }

  const localTriggers = getReassessmentTriggers();
  report(`Migrating ${localTriggers.length} reassessment triggers...`);
  for (const trigger of localTriggers) {
    const neonAssetId = assetIdMap.get(trigger.assetId);
    if (!neonAssetId) {
      result.errors.push(`Trigger "${trigger.triggerType}": linked asset was not migrated.`);
      continue;
    }
    try {
      await apiGovernanceRepository.createGovernanceRecord('trigger', { ...trigger, assetId: neonAssetId });
      result.triggersCreated++;
    } catch (err) {
      result.errors.push(`Trigger "${trigger.triggerType}": ${(err as Error).message}`);
    }
  }

  const localReauthorizations = getReauthorizationRecords();
  report(`Migrating ${localReauthorizations.length} reauthorization records...`);
  for (const record of localReauthorizations) {
    const neonAssetId = assetIdMap.get(record.assetId);
    if (!neonAssetId) {
      result.errors.push(`Reauthorization for "${record.assetName}": linked asset was not migrated.`);
      continue;
    }
    try {
      await apiGovernanceRepository.createGovernanceRecord('reauthorization', { ...record, assetId: neonAssetId });
      result.reauthorizationsCreated++;
    } catch (err) {
      result.errors.push(`Reauthorization for "${record.assetName}": ${(err as Error).message}`);
    }
  }

  const localReviews = getScheduledReviews();
  report(`Migrating ${localReviews.length} scheduled reviews...`);
  for (const review of localReviews) {
    const neonAssetId = assetIdMap.get(review.assetId);
    if (!neonAssetId) {
      result.errors.push(`Review "${review.reviewType}" for "${review.assetName}": linked asset was not migrated.`);
      continue;
    }
    try {
      await apiGovernanceRepository.createGovernanceRecord('review', { ...review, assetId: neonAssetId });
      result.reviewsCreated++;
    } catch (err) {
      result.errors.push(`Review "${review.reviewType}": ${(err as Error).message}`);
    }
  }

  report('Migration complete.');
  return result;
}
