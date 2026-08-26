import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { ScoreRing } from '../components/ui/ScoreRing';
import { SectionHeader } from '../components/ui/SectionHeader';
import { getAssets, getGovernanceReadinessInputs } from '../services/storageService';
import { getPoliciesForAsset } from '../services/policyService';
import {
  computeGovernanceReadinessScore,
  READINESS_PILLAR_LABELS,
  type GovernanceReadinessScore,
  type ReadinessPillarKey,
  type ReadinessTier,
} from '../config/governanceReadinessScore';

const TIER_TONE: Record<ReadinessTier, string> = {
  'Ready': 'var(--status-success)',
  'Conditionally Ready': 'var(--status-warning)',
  'Not Ready': 'var(--status-danger)',
};

/**
 * vNext — Prevention-First Blueprint: the Governance Readiness Dashboard.
 * This is the primary prevention surface — the point is to surface gaps
 * during portfolio review, well before anyone reaches a decision screen.
 * Purely informational, like every readiness view in this codebase.
 */
export const GovernanceReadinessDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<'score-asc' | 'score-desc' | 'name'>('score-asc');

  const scores: GovernanceReadinessScore[] = useMemo(() => {
    return getAssets()
      .map(asset => {
        const inputs = getGovernanceReadinessInputs(asset.id);
        if (!inputs) return null;
        const policies = getPoliciesForAsset(asset);
        return computeGovernanceReadinessScore(inputs.asset, inputs.evidence, inputs.reviews, inputs.triggers, policies);
      })
      .filter((s): s is GovernanceReadinessScore => s !== null);
  }, []);

  const sorted = useMemo(() => {
    const list = [...scores];
    if (sortBy === 'score-asc') list.sort((a, b) => a.overallScore - b.overallScore);
    else if (sortBy === 'score-desc') list.sort((a, b) => b.overallScore - a.overallScore);
    else list.sort((a, b) => a.assetName.localeCompare(b.assetName));
    return list;
  }, [scores, sortBy]);

  const portfolioAverage = scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length)
    : 0;
  const readyCount = scores.filter(s => s.tier === 'Ready').length;
  const conditionalCount = scores.filter(s => s.tier === 'Conditionally Ready').length;
  const notReadyCount = scores.filter(s => s.tier === 'Not Ready').length;

  // vNext refinement — surface the single weakest pillar across the whole
  // portfolio as an actionable insight, not a defect report. Computed fresh
  // from live data each time, so this never hardcodes a fact that could go
  // stale as the underlying assets change.
  const weakestPillar = useMemo(() => {
    if (scores.length === 0) return null;
    const pillarKeys = Object.keys(READINESS_PILLAR_LABELS) as ReadinessPillarKey[];
    const failureCounts = pillarKeys.map(key => ({
      key,
      failCount: scores.filter(s => !s.pillars[key].passed).length,
    }));
    const worst = failureCounts.reduce((a, b) => (b.failCount > a.failCount ? b : a));
    return worst.failCount > 0 ? worst : null;
  }, [scores]);

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Governance Readiness Dashboard</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          Ownership, Risk, Controls, Evidence, Reviews and Governance Decision — the six things that determine
          whether an AI asset is genuinely ready, surfaced here before anyone reaches a decision review.
        </p>
      </div>

      {/* Portfolio summary */}
      <section
        className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] p-5 sm:p-6"
        style={{ background: 'var(--grad-hero)' }}
      >
        <div className="absolute inset-0 enterprise-grid opacity-50 pointer-events-none" aria-hidden />
        <div className="relative flex flex-col lg:flex-row items-center gap-7">
          <ScoreRing score={portfolioAverage} size={150} label="Portfolio Average" caption={`${scores.length} assets`} />
          <div className="flex-1 w-full min-w-0 grid grid-cols-3 gap-3">
            <div className="rounded-xl p-3.5 text-center" style={{ background: 'var(--status-success-bg)', border: '1px solid var(--status-success-border)' }}>
              <p className="tnum text-2xl font-extrabold" style={{ color: 'var(--status-success)' }}>{readyCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Ready</p>
            </div>
            <div className="rounded-xl p-3.5 text-center" style={{ background: 'var(--status-warning-bg)', border: '1px solid var(--status-warning-border)' }}>
              <p className="tnum text-2xl font-extrabold" style={{ color: 'var(--status-warning)' }}>{conditionalCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Conditionally Ready</p>
            </div>
            <div className="rounded-xl p-3.5 text-center" style={{ background: 'var(--status-danger-bg)', border: '1px solid var(--status-danger-border)' }}>
              <p className="tnum text-2xl font-extrabold" style={{ color: 'var(--status-danger)' }}>{notReadyCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Not Ready</p>
            </div>
          </div>
        </div>
      </section>

      {/* vNext refinement — actionable governance insight, not a defect report. */}
      {weakestPillar && (
        <Card className="!p-5 flex flex-col gap-2 !bg-[var(--status-info-bg)] !border-[var(--status-info-border)]">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--status-info)]">
            Governance Insight
          </p>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">
            The Governance Readiness Dashboard surfaced a meaningful governance insight from live
            production data: <strong>{weakestPillar.failCount} of {scores.length}</strong> current
            assets {weakestPillar.failCount === 1 ? 'has' : 'have'} not completed{' '}
            <strong>{READINESS_PILLAR_LABELS[weakestPillar.key]}</strong>.
          </p>
          <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
            This demonstrates the value of the Readiness model in identifying governance gaps before
            audits, approvals, compliance reviews, incidents, or regulatory assessments occur.
          </p>
        </Card>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <SectionHeader
            eyebrow="vNext — Prevention First"
            title="Per-Asset Readiness"
            subtitle="Identify gaps early, before they reach a decision review."
            icon="🛡️"
          />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-xs font-semibold cursor-pointer"
          >
            <option value="score-asc">Lowest Score First</option>
            <option value="score-desc">Highest Score First</option>
            <option value="name">Name</option>
          </select>
        </div>

        {sorted.length === 0 ? (
          <Card className="!p-8 text-center">
            <p className="text-sm text-[var(--text-secondary)]">No assets in the registry yet.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {sorted.map(score => (
              <Card key={score.assetId} className="!p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="shrink-0">
                  <ScoreRing score={score.overallScore} size={72} strokeWidth={7} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-[var(--text-primary)]">{score.assetName}</span>
                    <span
                      className="text-[10px] font-black uppercase px-2 py-0.5 rounded"
                      style={{ background: `color-mix(in srgb, ${TIER_TONE[score.tier]} 15%, transparent)`, color: TIER_TONE[score.tier] }}
                    >
                      {score.tier}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    {Object.values(score.pillars).map(p => (
                      <span
                        key={p.key}
                        title={p.message}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg border"
                        style={{
                          color: p.passed ? 'var(--status-success)' : 'var(--status-danger)',
                          borderColor: p.passed ? 'var(--status-success-border)' : 'var(--status-danger-border)',
                          background: p.passed ? 'var(--status-success-bg)' : 'var(--status-danger-bg)',
                        }}
                      >
                        {p.passed ? '✓' : '✕'} {READINESS_PILLAR_LABELS[p.key]}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/assets?assetId=${score.assetId}`)}
                  className="self-start sm:self-center shrink-0 text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
                >
                  View Asset →
                </button>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
