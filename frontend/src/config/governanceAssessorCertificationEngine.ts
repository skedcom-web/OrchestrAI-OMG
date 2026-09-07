/**
 * GACF Phase 2 ("Release 13 Extension"), Initiative 1 — Assessor
 * Certification. Deterministic, rules-based scoring only — no AI-generated
 * judgment, consistent with the blueprint's explicit exclusion of
 * "governance scoring automation without human review."
 *
 * An assessor attempts certification by scoring the SAME category the
 * existing Calibration Library (governanceCalibrationLibrary.ts) already
 * tags on each of its five reference scenarios — reusing that library as
 * the benchmark, rather than inventing a second set of "correct answers."
 * Calibration accuracy is the average absolute deviation from that
 * scenario's calibrated level, expressed as a percentage (0 deviation on
 * every scenario = 100%; the maximum possible deviation on a 1-5 scale,
 * 4 points, on every scenario = 0%).
 */

import { GOVERNANCE_CALIBRATION_LIBRARY } from './governanceCalibrationLibrary';
import type { AssessorCertificationStatus, GovernanceMaturityLevel } from '../types';

export interface CertificationAttemptScore {
  scenarioIndex: number;
  scoredLevel: GovernanceMaturityLevel;
}

const MAX_DEVIATION_PER_SCENARIO = 4; // |5 - 1| — the widest possible gap on the 1-5 scale

export function computeCalibrationAccuracy(attempts: CertificationAttemptScore[]): number {
  if (attempts.length === 0) return 0;
  const totalDeviation = attempts.reduce((sum, a) => {
    const scenario = GOVERNANCE_CALIBRATION_LIBRARY[a.scenarioIndex];
    if (!scenario) return sum;
    return sum + Math.abs(a.scoredLevel - scenario.categoryScore.level);
  }, 0);
  const maxPossibleDeviation = attempts.length * MAX_DEVIATION_PER_SCENARIO;
  return Math.round((1 - totalDeviation / maxPossibleDeviation) * 100);
}

/** Thresholds are a platform default, not a regulatory standard — a tenant
 * that needs different thresholds should say so explicitly. Documented here
 * rather than left implicit, so the methodology stays auditable. */
export function statusForAccuracy(accuracy: number): AssessorCertificationStatus {
  if (accuracy >= 85) return 'Certified Assessor';
  if (accuracy >= 60) return 'Provisionally Certified';
  return 'Needs Recalibration';
}

export const CERTIFICATION_VALIDITY_DAYS = 365;

export function computeExpiryDate(fromISODate: string): string {
  const d = new Date(fromISODate);
  d.setDate(d.getDate() + CERTIFICATION_VALIDITY_DAYS);
  return d.toISOString().split('T')[0];
}
