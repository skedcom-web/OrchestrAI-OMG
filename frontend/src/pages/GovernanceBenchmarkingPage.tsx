import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { SectionHeader } from '../components/ui/SectionHeader';
import {
  getAssets,
  getEvidenceRecords,
  getScheduledReviews,
  getReassessmentTriggers,
  getGovernanceFindings,
  getGovernanceDrifts,
  getDecisions,
  getGovernanceReadinessInputs,
  bootstrapPersistence,
} from '../services/storageService';
import { getPoliciesForAsset, getPolicyViolations } from '../services/policyService';
import { computeGovernanceReadinessScore } from '../config/governanceReadinessScore';
import { computePortfolioGovernanceMetrics } from '../config/governanceValueMetrics';
import { computeGovernanceEffectiveness } from '../config/governanceEffectivenessEngine';
import { compareToBenchmarks } from '../config/governanceBenchmarks';

/**
 * Release 11, Capability 4: Governance Benchmarking Framework. Compares the
 * tenant's own live Governance Effectiveness Score against illustrative
 * reference benchmarks by industry — see governanceBenchmarks.ts for why
 * these are static, swappable reference data rather than logic baked into
 * the platform core.
 */
export const GovernanceBenchmarkingPage: React.FC = () => {
  const [assets, setAssets] = useState(() => getAssets());

  useEffect(() => {
    bootstrapPersistence().then(() => setAssets(getAssets()));
  }, []);

  const organizationScore = useMemo(() => {
    const readinessScores = assets
      .map(asset => {
        const inputs = getGovernanceReadinessInputs(asset.id);
        if (!inputs) return null;
        return computeGovernanceReadinessScore(inputs.asset, inputs.evidence, inputs.reviews, inputs.triggers, getPoliciesForAsset(asset)).overallScore;
      })
      .filter((s): s is number => s !== null);

    const metrics = computePortfolioGovernanceMetrics(
      assets,
      readinessScores,
      getEvidenceRecords(),
      getScheduledReviews(),
      getReassessmentTriggers(),
      getGovernanceFindings(),
      getPolicyViolations(),
      getDecisions()
    );
    return computeGovernanceEffectiveness(metrics, getPolicyViolations(), getGovernanceDrifts()).effectivenessScore;
  }, [assets]);

  const benchmarks = useMemo(() => compareToBenchmarks(organizationScore), [organizationScore]);

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Governance Benchmarking</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          How this organization's Governance Effectiveness Score ({organizationScore}%) compares against
          illustrative industry reference benchmarks.
        </p>
      </div>

      <SectionHeader eyebrow="Release 11" title="Gap Analysis" subtitle="Positive means ahead of benchmark; negative means behind." icon="📐" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {benchmarks.map(b => (
          <Card key={b.industry} className="!p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>{b.icon}</span>
              <p className="text-sm font-extrabold text-[var(--text-primary)]">{b.industry}</p>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[var(--text-secondary)]">Benchmark</span>
              <span className="tnum font-bold text-[var(--text-primary)]">{b.benchmarkEffectivenessScore}%</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[var(--text-secondary)]">This Organization</span>
              <span className="tnum font-bold text-[var(--text-primary)]">{b.organizationScore}%</span>
            </div>
            <div
              className="rounded-lg px-3 py-2 text-center text-[13px] font-extrabold"
              style={{
                background: b.gap >= 0 ? 'var(--status-success-bg)' : 'var(--status-warning-bg)',
                color: b.gap >= 0 ? 'var(--status-success)' : 'var(--status-warning)',
              }}
            >
              {b.gap >= 0 ? '+' : ''}{b.gap} pts {b.gap >= 0 ? 'ahead' : 'behind'}
            </div>
          </Card>
        ))}
      </div>

      <Card className="!p-5 flex flex-col gap-2">
        <p className="text-xs font-bold text-[var(--text-primary)] uppercase">About These Benchmarks</p>
        <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
          These are illustrative reference points for a starting conversation, not audited industry statistics.
          The platform core stays industry-agnostic — swap these values, or map them to a configured Governance
          Profile, for a benchmark set specific to your engagement.
        </p>
      </Card>
    </div>
  );
};
