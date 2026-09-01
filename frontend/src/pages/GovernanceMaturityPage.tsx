import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
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
  getGovernanceMaturitySnapshots,
  recordGovernanceMaturitySnapshot,
  bootstrapPersistence,
} from '../services/storageService';
import { getPoliciesForAsset, getPolicyViolations } from '../services/policyService';
import { computeGovernanceReadinessScore } from '../config/governanceReadinessScore';
import { computePortfolioGovernanceMetrics } from '../config/governanceValueMetrics';
import { computeGovernanceEffectiveness } from '../config/governanceEffectivenessEngine';
import { computeMaturityInputs, computeMaturityResults } from '../config/governanceMaturityEngine';
import { MATURITY_LEVEL_LABELS, type GovernanceMaturityLevel } from '../types';

const TREND_TONE: Record<string, string> = {
  'Improving': 'var(--status-success)',
  'Declining': 'var(--status-danger)',
  'Stable': 'var(--text-secondary)',
  'No prior data': 'var(--text-muted)',
};

/**
 * Release 11, Capability 3: Governance Maturity Engine. Levels 1 (Reactive)
 * through 5 (Optimized) across six domains, derived from activity already
 * computed elsewhere in the platform. Recording a snapshot is explicit.
 */
export const GovernanceMaturityPage: React.FC = () => {
  const [assets, setAssets] = useState(() => getAssets());
  const [snapshots, setSnapshots] = useState(() => getGovernanceMaturitySnapshots());
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    bootstrapPersistence().then(() => {
      setAssets(getAssets());
      setSnapshots(getGovernanceMaturitySnapshots());
    });
  }, []);

  const results = useMemo(() => {
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
    const effectiveness = computeGovernanceEffectiveness(metrics, getPolicyViolations(), getGovernanceDrifts());
    const inputs = computeMaturityInputs(assets, getDecisions(), metrics.evidenceCoveragePct, effectiveness.policyAdherenceScore, effectiveness.driftResolutionScore);
    return computeMaturityResults(inputs, snapshots);
  }, [assets, snapshots]);

  const handleRecordSnapshot = async () => {
    setRecording(true);
    try {
      for (const r of results) {
        await recordGovernanceMaturitySnapshot({ domain: r.domain, level: r.level as GovernanceMaturityLevel });
      }
      setSnapshots(getGovernanceMaturitySnapshots());
    } finally {
      setRecording(false);
    }
  };

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Governance Maturity</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
            How mature is the governance program, domain by domain — Reactive through Optimized.
          </p>
        </div>
        <Button onClick={handleRecordSnapshot} disabled={recording} icon={<span>📌</span>}>
          {recording ? 'Recording…' : 'Record Maturity Snapshot'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map(r => (
          <Card key={r.domain} className="!p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-[var(--text-primary)] uppercase">{r.domain}</p>
              <span className="tnum text-[11px] font-extrabold" style={{ color: TREND_TONE[r.trend] }}>{r.trend}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="tnum text-3xl font-black text-[var(--accent-primary)]">{r.level}</span>
              <span className="text-sm font-bold text-[var(--text-secondary)] mb-1">/ 5 — {MATURITY_LEVEL_LABELS[r.level]}</span>
            </div>
            <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--bg-sunken)' }}>
              <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: 'var(--accent-primary)' }} />
            </div>
            {r.previousLevel !== null && (
              <p className="text-[11px] text-[var(--text-muted)]">Previously level {r.previousLevel}</p>
            )}
          </Card>
        ))}
      </div>

      <SectionHeader eyebrow="Release 11" title="Improvement Recommendations" subtitle="The lowest-scoring domain first." icon="💡" />
      <Card className="!p-5 flex flex-col gap-2">
        {(() => {
          const weakest = [...results].sort((a, b) => a.level - b.level)[0];
          return (
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              <strong className="text-[var(--text-primary)]">{weakest.domain}</strong> is the least mature domain at
              level {weakest.level} ({MATURITY_LEVEL_LABELS[weakest.level]}, {weakest.pct}% activity coverage). Raising it
              to the next level means closing the gap between current and target coverage on the signals that feed it —
              see the Governance Value Dashboard and Drift Center for the underlying detail.
            </p>
          );
        })()}
      </Card>
    </div>
  );
};
