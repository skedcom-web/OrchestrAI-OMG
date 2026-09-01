/**
 * OMG Release 11 — Governance Effectiveness & Outcomes Engine, Capability 4.
 *
 * Reference benchmark scores by industry, compared against the tenant's own
 * live Governance Effectiveness Score. These are illustrative starting
 * points for the "where do we stand" conversation, not audited industry
 * statistics — labeled as such in the UI. Static reference data on purpose:
 * per the platform's baseline-first rule, the core stays industry-agnostic,
 * so this lives as swappable config, not logic baked into the engine, the
 * same way GovernanceProfile treats industry as configuration.
 */

export interface IndustryBenchmark {
  industry: string;
  icon: string;
  benchmarkEffectivenessScore: number;
}

export const GOVERNANCE_BENCHMARKS: IndustryBenchmark[] = [
  { industry: 'Banking', icon: '🏦', benchmarkEffectivenessScore: 82 },
  { industry: 'Insurance', icon: '📑', benchmarkEffectivenessScore: 78 },
  { industry: 'Healthcare', icon: '🏥', benchmarkEffectivenessScore: 80 },
  { industry: 'Government', icon: '🏛️', benchmarkEffectivenessScore: 74 },
  { industry: 'Telecom', icon: '📡', benchmarkEffectivenessScore: 71 },
  { industry: 'Enterprise General', icon: '🏢', benchmarkEffectivenessScore: 68 },
];

export interface BenchmarkGap {
  industry: string;
  icon: string;
  benchmarkEffectivenessScore: number;
  organizationScore: number;
  gap: number;
}

export function compareToBenchmarks(organizationScore: number): BenchmarkGap[] {
  return GOVERNANCE_BENCHMARKS.map(b => ({
    industry: b.industry,
    icon: b.icon,
    benchmarkEffectivenessScore: b.benchmarkEffectivenessScore,
    organizationScore,
    gap: organizationScore - b.benchmarkEffectivenessScore,
  }));
}
