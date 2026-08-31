import React, { useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { ScoreRing } from '../components/ui/ScoreRing';
import { SectionHeader } from '../components/ui/SectionHeader';
import {
  getAssets,
  getEvidenceRecords,
  getEvidenceRecordsForAsset,
  getScheduledReviews,
  getReassessmentTriggers,
  getGovernanceFindings,
  getGovernanceDrifts,
  getDecisions,
  getGovernanceReadinessInputs,
} from '../services/storageService';
import { getPoliciesForAsset, getPolicyViolations } from '../services/policyService';
import { computeGovernanceReadinessScore } from '../config/governanceReadinessScore';
import { computePortfolioGovernanceMetrics } from '../config/governanceValueMetrics';
import { computeGovernanceGates } from '../config/governanceGatesEngine';
import { computeGovernanceHealthIndex, type HealthTier } from '../config/governanceHealthIndex';

const TIER_TONE: Record<HealthTier, string> = {
  'Strong': 'var(--status-success)',
  'Needs Attention': 'var(--status-warning)',
  'At Risk': 'var(--status-danger)',
};

/**
 * OMG vNext — Governance Intelligence, Module 5: Governance Health Index.
 * A single executive governance health indicator, combining Readiness,
 * Drift, Evidence Coverage, Review Compliance, Reassessment Compliance,
 * Findings Resolution and Control Assurance. Advisory only.
 */
export const GovernanceHealthCenterPage: React.FC = () => {
  const assets = useMemo(() => getAssets(), []);
  const allPolicyViolations = useMemo(() => getPolicyViolations(), []);

  const { metrics, controlAssurancePassPct, driftFreePct } = useMemo(() => {
    const evidenceAll = getEvidenceRecords();
    const reviewsAll = getScheduledReviews();
    const triggersAll = getReassessmentTriggers();
    const findingsAll = getGovernanceFindings();
    const drifts = getGovernanceDrifts().filter(d => d.status === 'Open');

    const readinessScores: number[] = [];
    let controlAssurancePass = 0;
    let assetsWithoutDrift = 0;

    for (const asset of assets) {
      const inputs = getGovernanceReadinessInputs(asset.id);
      const policies = getPoliciesForAsset(asset);
      if (inputs) {
        readinessScores.push(computeGovernanceReadinessScore(inputs.asset, inputs.evidence, inputs.reviews, inputs.triggers, policies).overallScore);
      }

      const assetViolations = allPolicyViolations.filter(v => v.assetId === asset.id);
      const gates = computeGovernanceGates(asset, getEvidenceRecordsForAsset(asset.id), policies, assetViolations);
      if (gates.gates.controlAssurance.status === 'PASS') controlAssurancePass += 1;

      const hasOpenDrift = drifts.some(d => d.assetId === asset.id);
      if (!hasOpenDrift) assetsWithoutDrift += 1;
    }

    return {
      metrics: computePortfolioGovernanceMetrics(assets, readinessScores, evidenceAll, reviewsAll, triggersAll, findingsAll, allPolicyViolations, getDecisions()),
      controlAssurancePassPct: assets.length ? Math.round((controlAssurancePass / assets.length) * 100) : 0,
      driftFreePct: assets.length ? Math.round((assetsWithoutDrift / assets.length) * 100) : 0,
    };
  }, [assets, allPolicyViolations]);

  const health = useMemo(
    () => computeGovernanceHealthIndex(metrics, controlAssurancePassPct, driftFreePct),
    [metrics, controlAssurancePassPct, driftFreePct]
  );

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Governance Health Center</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          One executive indicator for whether governance is holding up across the AI portfolio — readiness,
          drift, evidence, reviews, reassessment, findings and control assurance, combined. Advisory only.
        </p>
      </div>

      <section
        className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] p-5 sm:p-6"
        style={{ background: 'var(--grad-hero)' }}
      >
        <div className="absolute inset-0 enterprise-grid opacity-50 pointer-events-none" aria-hidden />
        <div className="relative flex flex-col lg:flex-row items-center gap-7">
          <ScoreRing score={health.overallScore} size={150} label="Governance Health" caption={`${assets.length} assets`} />
          <div className="flex-1 w-full min-w-0">
            <span
              className="inline-flex text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-4"
              style={{ background: `color-mix(in srgb, ${TIER_TONE[health.tier]} 15%, transparent)`, color: TIER_TONE[health.tier] }}
            >
              {health.tier}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {health.components.map(c => (
                <div key={c.key} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                  <span className="text-[12px] font-semibold text-[var(--text-secondary)]">{c.label}</span>
                  <span className="tnum text-[13px] font-extrabold text-[var(--text-primary)]">{c.scorePct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionHeader eyebrow="OMG vNext" title="What This Means" subtitle="Read this as a health check, not a permission slip." icon="💡" />
      <Card className="!p-5 flex flex-col gap-2">
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          The Governance Health Index is a diagnostic, not a gate: a lower score never blocks a decision,
          deployment or approval. It exists to tell governance leadership where to look first — see the
          Governance Drift Center and Governance Value Dashboard for the underlying detail behind each component.
        </p>
      </Card>
    </div>
  );
};
