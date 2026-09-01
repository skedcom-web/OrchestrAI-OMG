/**
 * OMG Release 12 — Regulatory Intelligence, Capability 4: Regulatory Change
 * Readiness. "Are we ready when a regulation changes?"
 *
 * A portfolio-wide ranking on top of Release 6's existing per-source
 * coverage/gap engine (`computeSourceCoverage`/`computeSourceGaps` —
 * reused verbatim, not reimplemented). MappingWorkspacePage already shows
 * this per source in a drill-down; this ranks every source by readiness so
 * the weakest one surfaces first, plus flags a source whose own review
 * cadence has lapsed.
 */

import { computeSourceCoverage, computeSourceGaps } from './regulatoryKnowledgeEngine';
import type {
  Obligation,
  ObligationControl,
  ObligationEvidenceMapping,
  EvidenceRecord,
  RegulatoryRequirement,
  RegulatorySource,
  ScheduledReview,
} from '../types';

export type ReadinessTier = 'Ready' | 'Partially Ready' | 'Not Ready';

export interface RegulatoryChangeReadinessResult {
  source: RegulatorySource;
  coveragePct: number;
  gapCount: number;
  tier: ReadinessTier;
  reviewOverdue: boolean;
}

export function computeRegulatoryChangeReadiness(
  sources: RegulatorySource[],
  requirements: RegulatoryRequirement[],
  obligations: Obligation[],
  controls: ObligationControl[],
  mappings: ObligationEvidenceMapping[],
  evidence: EvidenceRecord[],
  reviews: ScheduledReview[]
): RegulatoryChangeReadinessResult[] {
  const today = new Date().toISOString().split('T')[0];

  return sources
    .filter(s => s.status === 'Active')
    .map(source => {
      const coverage = computeSourceCoverage(source, requirements, obligations, controls, mappings, evidence);
      const gaps = computeSourceGaps(source, requirements, obligations, controls, mappings, evidence, reviews);
      const coveragePct = coverage.controlsTotal === 0 ? 100 : Math.round((coverage.controlsCovered / coverage.controlsTotal) * 100);
      const reviewOverdue = !!source.reviewDate && source.reviewDate < today;

      const tier: ReadinessTier =
        coveragePct >= 90 && gaps.length === 0 && !reviewOverdue ? 'Ready' : coveragePct >= 50 ? 'Partially Ready' : 'Not Ready';

      return { source, coveragePct, gapCount: gaps.length, tier, reviewOverdue };
    })
    .sort((a, b) => a.coveragePct - b.coveragePct);
}
