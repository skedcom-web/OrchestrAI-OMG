/**
 * Governance Assessment Calibration & Consistency Framework (GACF).
 * Initiative 4 — Variance & Reliability Analysis.
 *
 * Per the blueprint: "The implementation should NOT assume any fixed
 * acceptable variance percentage unless formally defined and approved."
 * This engine reports observed dispersion only — mean, standard deviation,
 * range, coefficient of variation — and never labels a number "good,"
 * "bad," or "acceptable." That judgment is left to the reader, exactly as
 * specified, so this doesn't introduce an unsupported statistical claim.
 *
 * Two views, both computed from GovernanceAssessmentRecord — the one
 * entity this release added:
 *  - Cross-sectional: dispersion of scores across different assets, per
 *    assessment type. High dispersion here may be entirely legitimate
 *    (different assets carry different risk) — it is not itself a defect.
 *  - Inter-rater reliability: dispersion of scores for the SAME asset,
 *    when more than one assessment exists for it — this is the more
 *    direct read on assessor-to-assessor consistency the blueprint's
 *    "model-to-model assessment reliability" objective is about.
 */

import { GOVERNANCE_ASSESSMENT_CATEGORIES, type GovernanceAssessmentCategory, type GovernanceAssessmentRecord, type GovernanceAssessmentType } from '../types';

export interface DispersionStats {
  count: number;
  mean: number;
  /** GACF Phase 2 — added for Multi-Assessor Consensus's "Median Score"
   * output. Additive; every prior consumer of DispersionStats ignores it. */
  median: number;
  standardDeviation: number;
  min: number;
  max: number;
  range: number;
  /** Standard deviation / mean, as a percentage. Undefined when mean is 0 (division is meaningless). */
  coefficientOfVariationPct: number | null;
}

export function computeDispersion(values: number[]): DispersionStats {
  const count = values.length;
  if (count === 0) {
    return { count: 0, mean: 0, median: 0, standardDeviation: 0, min: 0, max: 0, range: 0, coefficientOfVariationPct: null };
  }
  const mean = values.reduce((sum, v) => sum + v, 0) / count;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / count;
  const standardDeviation = Math.sqrt(variance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

  return {
    count,
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    standardDeviation: Math.round(standardDeviation * 100) / 100,
    min,
    max,
    range: Math.round((max - min) * 100) / 100,
    coefficientOfVariationPct: mean === 0 ? null : Math.round((standardDeviation / mean) * 10000) / 100,
  };
}

export interface AssessmentTypeVariance {
  assessmentType: GovernanceAssessmentType;
  overallScoreDispersion: DispersionStats;
  categoryDispersion: { category: GovernanceAssessmentCategory; dispersion: DispersionStats }[];
}

/** Cross-sectional: dispersion across different assets, grouped by assessment type. */
export function computeCrossSectionalVariance(records: GovernanceAssessmentRecord[]): AssessmentTypeVariance[] {
  const types = Array.from(new Set(records.map(r => r.assessmentType)));

  return types.map(assessmentType => {
    const typeRecords = records.filter(r => r.assessmentType === assessmentType);
    const overallScoreDispersion = computeDispersion(typeRecords.map(r => r.overallScore));

    const categoryDispersion = GOVERNANCE_ASSESSMENT_CATEGORIES.map(category => ({
      category,
      dispersion: computeDispersion(
        typeRecords.map(r => r.categoryScores[category]).filter((v): v is 1 | 2 | 3 | 4 | 5 => v !== undefined)
      ),
    })).filter(c => c.dispersion.count > 0);

    return { assessmentType, overallScoreDispersion, categoryDispersion };
  });
}

export interface AssetReliability {
  assetId: string;
  assetName: string;
  assessmentCount: number;
  overallScoreDispersion: DispersionStats;
}

/** Inter-rater reliability: dispersion of repeated assessments of the SAME asset. Assets with only one assessment on record are excluded — dispersion needs 2+ points to mean anything. */
export function computeInterRaterReliability(records: GovernanceAssessmentRecord[]): AssetReliability[] {
  const byAsset = new Map<string, GovernanceAssessmentRecord[]>();
  for (const r of records) {
    const list = byAsset.get(r.assetId) || [];
    list.push(r);
    byAsset.set(r.assetId, list);
  }

  return Array.from(byAsset.entries())
    .filter(([, list]) => list.length >= 2)
    .map(([assetId, list]) => ({
      assetId,
      assetName: list[0].assetName,
      assessmentCount: list.length,
      overallScoreDispersion: computeDispersion(list.map(r => r.overallScore)),
    }))
    .sort((a, b) => b.overallScoreDispersion.standardDeviation - a.overallScoreDispersion.standardDeviation);
}
