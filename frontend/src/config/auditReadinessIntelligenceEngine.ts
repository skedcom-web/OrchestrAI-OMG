/**
 * OMG Release 12 — Regulatory Intelligence, Capability 5: Audit Readiness
 * Intelligence. "What evidence supports compliance — are we audit-ready?"
 *
 * A rollup, not a new score: per-asset audit readiness reuses
 * `computeAuditReadiness` (readinessFoundation.ts, Release 3/4) verbatim;
 * framework-level readiness reuses `computePackCoverage`/`computeSourceCoverage`
 * (Release 5/6) verbatim. This only aggregates them to portfolio level and
 * surfaces the highest-priority missing-evidence gaps across both existing
 * gap registers — it does not compute a new readiness signal of its own.
 */

import { computeAuditReadiness } from './readinessFoundation';
import { computePackCoverage, computePackGaps } from './compliancePackFramework';
import { computeSourceCoverage, computeSourceGaps } from './regulatoryKnowledgeEngine';
import type {
  AIAsset,
  CompliancePack,
  ComplianceRequirement,
  EvidenceMapping,
  EvidenceRecord,
  Obligation,
  ObligationControl,
  ObligationEvidenceMapping,
  PackControl,
  RegulatoryRequirement,
  RegulatorySource,
  ScheduledReview,
} from '../types';

export interface AuditReadinessIntelligenceResult {
  assetsReadyPct: number;
  assetsNotReadyCount: number;
  packCoveragePct: number;
  sourceCoveragePct: number;
  topEvidenceGaps: { framework: string; detail: string }[];
}

export function computeAuditReadinessIntelligence(
  assets: AIAsset[],
  evidenceByAsset: (assetId: string) => EvidenceRecord[],
  compliancePacks: CompliancePack[],
  complianceRequirements: ComplianceRequirement[],
  packControls: PackControl[],
  evidenceMappings: EvidenceMapping[],
  allEvidence: EvidenceRecord[],
  regulatorySources: RegulatorySource[],
  regulatoryRequirements: RegulatoryRequirement[],
  obligations: Obligation[],
  obligationControls: ObligationControl[],
  obligationEvidenceMappings: ObligationEvidenceMapping[],
  reviews: ScheduledReview[]
): AuditReadinessIntelligenceResult {
  const assetReadiness = assets.map(a => computeAuditReadiness(a, evidenceByAsset(a.id)));
  const readyCount = assetReadiness.filter(r => r.status === 'Ready').length;
  const notReadyCount = assetReadiness.filter(r => r.status === 'Not Ready').length;
  const assetsReadyPct = assets.length === 0 ? 0 : Math.round((readyCount / assets.length) * 100);

  const activePacks = compliancePacks.filter(p => p.status === 'Active');
  const packCoverages = activePacks.map(p => computePackCoverage(p, complianceRequirements, packControls, evidenceMappings, allEvidence));
  const packCoveragePct = pctCovered(packCoverages);

  const activeSources = regulatorySources.filter(s => s.status === 'Active');
  const sourceCoverages = activeSources.map(s =>
    computeSourceCoverage(s, regulatoryRequirements, obligations, obligationControls, obligationEvidenceMappings, allEvidence)
  );
  const sourceCoveragePct = pctCovered(sourceCoverages);

  const packGaps = activePacks.flatMap(p =>
    computePackGaps(p, complianceRequirements, packControls, evidenceMappings, allEvidence, reviews)
      .filter(g => g.gapType === 'Missing Evidence' || g.gapType === 'Expired Evidence')
      .map(g => ({ framework: p.name, detail: g.detail }))
  );
  const sourceGaps = activeSources.flatMap(s =>
    computeSourceGaps(s, regulatoryRequirements, obligations, obligationControls, obligationEvidenceMappings, allEvidence, reviews)
      .filter(g => g.gapType === 'Missing Evidence' || g.gapType === 'Missing Approval')
      .map(g => ({ framework: s.name, detail: g.detail }))
  );

  return {
    assetsReadyPct,
    assetsNotReadyCount: notReadyCount,
    packCoveragePct,
    sourceCoveragePct,
    topEvidenceGaps: [...packGaps, ...sourceGaps].slice(0, 10),
  };
}

function pctCovered(coverages: { controlsTotal: number; controlsCovered: number }[]): number {
  const applicable = coverages.filter(c => c.controlsTotal > 0);
  if (applicable.length === 0) return 100;
  const totalControls = applicable.reduce((sum, c) => sum + c.controlsTotal, 0);
  const coveredControls = applicable.reduce((sum, c) => sum + c.controlsCovered, 0);
  return totalControls === 0 ? 100 : Math.round((coveredControls / totalControls) * 100);
}
