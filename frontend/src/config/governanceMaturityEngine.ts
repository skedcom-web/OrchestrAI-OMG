/**
 * OMG Release 11 — Governance Effectiveness & Outcomes Engine, Capability 3.
 *
 * Maps a 0-100 activity percentage per domain onto the standard five-level
 * maturity scale (Reactive → Optimized). Inputs are deliberately reused from
 * signals already computed elsewhere (Value Metrics, the Effectiveness
 * engine's Policy Adherence / Drift Resolution, ownership completeness) —
 * see computeMaturityInputs's per-field comments for exactly which existing
 * computation each domain draws from. Nothing here is a new source of truth.
 */

import { authorityProfileCompleteness } from './governanceAuthority';
import type { AIAsset, DecisionRecord, GovernanceMaturityDomain, GovernanceMaturityLevel, GovernanceMaturitySnapshot } from '../types';

export const MATURITY_DOMAINS: GovernanceMaturityDomain[] = [
  'Governance Program',
  'Evidence Management',
  'Decision Governance',
  'Compliance Management',
  'Accountability',
  'Continuous Assurance',
];

export function levelFromPercent(pct: number): GovernanceMaturityLevel {
  if (pct >= 80) return 5;
  if (pct >= 60) return 4;
  if (pct >= 40) return 3;
  if (pct >= 20) return 2;
  return 1;
}

export interface MaturityInputs {
  'Governance Program': number;
  'Evidence Management': number;
  'Decision Governance': number;
  'Compliance Management': number;
  'Accountability': number;
  'Continuous Assurance': number;
}

/**
 * @param assets Full portfolio.
 * @param decisions Full decision history — Decision Governance maturity
 *   measures adoption of the Release-vNext decisionType/authorityRole
 *   extension, not just whether a decision exists.
 * @param evidenceCoveragePct From GovernanceValueMetrics — reused verbatim.
 * @param policyAdherenceScore From governanceEffectivenessEngine — reused verbatim.
 * @param driftResolutionScore From governanceEffectivenessEngine — reused verbatim.
 */
export function computeMaturityInputs(
  assets: AIAsset[],
  decisions: DecisionRecord[],
  evidenceCoveragePct: number,
  policyAdherenceScore: number,
  driftResolutionScore: number
): MaturityInputs {
  const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 100));

  const governanceProgramPct = pct(
    assets.filter(a => !!a.decisionOutcome && a.decisionOutcome !== 'PENDING').length,
    assets.length
  );

  const decisionGovernancePct = pct(
    decisions.filter(d => !!d.decisionType && !!d.authorityRole).length,
    decisions.length
  );

  const accountabilityPct = pct(
    assets.filter(a => authorityProfileCompleteness(a.authorityProfile) === 4).length,
    assets.length
  );

  return {
    'Governance Program': governanceProgramPct,
    'Evidence Management': evidenceCoveragePct,
    'Decision Governance': decisionGovernancePct,
    'Compliance Management': policyAdherenceScore,
    'Accountability': accountabilityPct,
    'Continuous Assurance': driftResolutionScore,
  };
}

export interface MaturityDomainResult {
  domain: GovernanceMaturityDomain;
  pct: number;
  level: GovernanceMaturityLevel;
  previousLevel: number | null;
  trend: 'Improving' | 'Declining' | 'Stable' | 'No prior data';
}

export function computeMaturityResults(inputs: MaturityInputs, snapshots: GovernanceMaturitySnapshot[]): MaturityDomainResult[] {
  return MATURITY_DOMAINS.map(domain => {
    const pct = inputs[domain];
    const level = levelFromPercent(pct);
    const previous = snapshots.find(s => s.domain === domain);
    const previousLevel = previous ? previous.level : null;
    const trend = previousLevel === null ? 'No prior data' : level > previousLevel ? 'Improving' : level < previousLevel ? 'Declining' : 'Stable';
    return { domain, pct, level, previousLevel, trend };
  });
}
