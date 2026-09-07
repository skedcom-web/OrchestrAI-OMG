/**
 * GACF Phase 2 ("Release 13 Extension"), Initiative 4 — Benchmark
 * Recommendation Engine. Pure, deterministic filtering/ranking over data
 * OMG already has — no new persistence, no AI-generated suggestion. Given
 * Use Case (GovernanceClassification), Risk Category (RiskLevel) and Asset
 * Type, it recommends:
 *  - Relevant Playbooks — ranked by a fixed rule set below, not learned.
 *  - Similar Assessments — real GovernanceAssessmentRecord rows for assets
 *    sharing the same dimensions.
 *  - Reference Examples — Calibration Library scenarios tagged with the
 *    closest-matching dimensions.
 *  - Typical Scoring Ranges — observed dispersion (governanceVarianceEngine's
 *    computeDispersion) across those same similar assessments, not an
 *    invented target.
 */

import { GOVERNANCE_ASSESSMENT_PLAYBOOKS, type GovernanceAssessmentPlaybook } from './governanceAssessmentPlaybooks';
import { GOVERNANCE_CALIBRATION_LIBRARY, type CalibrationExample } from './governanceCalibrationLibrary';
import { computeDispersion, type DispersionStats } from './governanceVarianceEngine';
import type { AIAsset, AssetType, GovernanceAssessmentRecord, GovernanceAssessmentType, GovernanceClassification, RiskLevel } from '../types';

export interface BenchmarkQuery {
  useCase: GovernanceClassification;
  riskCategory: RiskLevel;
  assetType: AssetType;
}

/** Fixed, documented rule set — not learned or inferred. Regulated AI or
 * High/Critical risk pushes Regulatory Readiness and Effectiveness to the
 * top; Decision Support pushes Effectiveness first; everything else keeps
 * the platform default order (Effectiveness first). */
function rankPlaybooks(query: BenchmarkQuery): { playbook: GovernanceAssessmentPlaybook; reason: string }[] {
  const order: GovernanceAssessmentType[] = (() => {
    if (query.useCase === 'Regulated AI' || query.riskCategory === 'Critical' || query.riskCategory === 'High') {
      return ['Regulatory Readiness', 'Effectiveness', 'Maturity', 'Benchmarking', 'ROI'];
    }
    if (query.useCase === 'Decision Support') {
      return ['Effectiveness', 'Maturity', 'Regulatory Readiness', 'Benchmarking', 'ROI'];
    }
    return ['Effectiveness', 'Maturity', 'Benchmarking', 'ROI', 'Regulatory Readiness'];
  })();

  const reasonFor = (type: GovernanceAssessmentType): string => {
    if (type === 'Regulatory Readiness' && (query.useCase === 'Regulated AI' || query.riskCategory === 'Critical' || query.riskCategory === 'High'))
      return `${query.useCase === 'Regulated AI' ? 'Regulated AI use case' : `${query.riskCategory} risk category`} — regulatory posture is the first thing to confirm.`;
    if (type === 'Effectiveness' && query.useCase === 'Decision Support')
      return 'Decision Support use case — governance effectiveness on this asset directly affects decision quality.';
    if (type === 'Effectiveness') return 'Platform default starting point for any new assessment.';
    return 'Standard playbook, ordered after higher-priority recommendations above.';
  };

  return order
    .map(type => GOVERNANCE_ASSESSMENT_PLAYBOOKS.find(p => p.assessmentType === type))
    .filter((p): p is GovernanceAssessmentPlaybook => !!p)
    .map(playbook => ({ playbook, reason: reasonFor(playbook.assessmentType) }));
}

function matchesQuery(example: CalibrationExample, query: BenchmarkQuery): number {
  let score = 0;
  if (example.useCase === query.useCase) score += 2;
  if (example.riskCategory === query.riskCategory) score += 2;
  if (example.assetType === query.assetType) score += 1;
  return score;
}

function rankReferenceExamples(query: BenchmarkQuery): CalibrationExample[] {
  return GOVERNANCE_CALIBRATION_LIBRARY
    .map(example => ({ example, score: matchesQuery(example, query) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(r => r.example);
}

export interface BenchmarkRecommendation {
  query: BenchmarkQuery;
  rankedPlaybooks: { playbook: GovernanceAssessmentPlaybook; reason: string }[];
  referenceExamples: CalibrationExample[];
  similarAssessments: GovernanceAssessmentRecord[];
  typicalScoringRange: DispersionStats;
}

export function recommendBenchmarks(
  query: BenchmarkQuery,
  assets: AIAsset[],
  assessmentRecords: GovernanceAssessmentRecord[]
): BenchmarkRecommendation {
  const matchingAssetIds = new Set(
    assets
      .filter(a => a.type === query.assetType && a.riskLevel === query.riskCategory && a.governanceClassification === query.useCase)
      .map(a => a.id)
  );

  const similarAssessments = assessmentRecords.filter(r => matchingAssetIds.has(r.assetId));

  return {
    query,
    rankedPlaybooks: rankPlaybooks(query),
    referenceExamples: rankReferenceExamples(query),
    similarAssessments,
    typicalScoringRange: computeDispersion(similarAssessments.map(r => r.overallScore)),
  };
}
