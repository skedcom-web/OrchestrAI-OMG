import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { KpiCard } from '../components/ui/KpiCard';
import { ScoreRing } from '../components/ui/ScoreRing';
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
  getGovernanceEffectivenessSnapshots,
  recordGovernanceEffectivenessSnapshot,
  bootstrapPersistence,
} from '../services/storageService';
import { getPoliciesForAsset, getPolicyViolations } from '../services/policyService';
import { computeGovernanceReadinessScore } from '../config/governanceReadinessScore';
import { computePortfolioGovernanceMetrics } from '../config/governanceValueMetrics';
import { computeGovernanceEffectiveness, compareToLastSnapshot } from '../config/governanceEffectivenessEngine';

const SUB_FACTOR_LABELS: Record<string, string> = {
  evidenceComplianceScore: 'Evidence Compliance',
  reviewComplianceScore: 'Review Compliance',
  findingsReductionScore: 'Findings Reduction',
  reassessmentTimelinessScore: 'Reassessment Timeliness',
  policyAdherenceScore: 'Policy Adherence',
  driftResolutionScore: 'Drift Resolution',
};

/**
 * Release 11, Capability 1: Governance Effectiveness Score. Measures whether
 * governance is improving over time — Trend/Previous Score/Improvement %
 * come from comparing against the most recently recorded snapshot.
 * Recording a snapshot is an explicit action, never automatic.
 */
export const GovernanceEffectivenessPage: React.FC = () => {
  const [assets, setAssets] = useState(() => getAssets());
  const [snapshots, setSnapshots] = useState(() => getGovernanceEffectivenessSnapshots());
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    bootstrapPersistence().then(() => {
      setAssets(getAssets());
      setSnapshots(getGovernanceEffectivenessSnapshots());
    });
  }, []);

  const result = useMemo(() => {
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

    return computeGovernanceEffectiveness(metrics, getPolicyViolations(), getGovernanceDrifts());
  }, [assets]);

  const comparison = useMemo(() => compareToLastSnapshot(result, snapshots), [result, snapshots]);

  const handleRecordSnapshot = async () => {
    setRecording(true);
    try {
      await recordGovernanceEffectivenessSnapshot(result);
      setSnapshots(getGovernanceEffectivenessSnapshots());
    } finally {
      setRecording(false);
    }
  };

  const trendTone =
    comparison.trend === 'Improving' ? 'var(--status-success)' : comparison.trend === 'Declining' ? 'var(--status-danger)' : 'var(--text-secondary)';

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Governance Effectiveness Score</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
            Is governance actually improving? A recorded reading, compared against the last one.
          </p>
        </div>
        <Button onClick={handleRecordSnapshot} disabled={recording} icon={<span>📌</span>}>
          {recording ? 'Recording…' : 'Record Snapshot'}
        </Button>
      </div>

      <section
        className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] p-5 sm:p-6"
        style={{ background: 'var(--grad-hero)' }}
      >
        <div className="absolute inset-0 enterprise-grid opacity-50 pointer-events-none" aria-hidden />
        <div className="relative flex flex-col lg:flex-row items-center gap-7">
          <ScoreRing score={result.effectivenessScore} size={150} label="Effectiveness" caption={`${assets.length} assets`} />
          <div className="flex-1 w-full min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl p-3.5 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <p className="tnum text-2xl font-extrabold" style={{ color: trendTone }}>{comparison.trend}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Trend</p>
            </div>
            <div className="rounded-xl p-3.5 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <p className="tnum text-2xl font-extrabold text-[var(--text-primary)]">{comparison.previousScore ?? '—'}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Previous Score</p>
            </div>
            <div className="rounded-xl p-3.5 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <p className="tnum text-2xl font-extrabold text-[var(--text-primary)]">
                {comparison.improvementPercent !== null ? `${comparison.improvementPercent > 0 ? '+' : ''}${comparison.improvementPercent}%` : '—'}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Improvement %</p>
            </div>
          </div>
        </div>
      </section>

      <SectionHeader eyebrow="Release 11" title="Contributing Factors" subtitle="Six equally-weighted sub-factors, each reused from an existing computation." icon="🧮" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(SUB_FACTOR_LABELS).map(([key, label]) => (
          <KpiCard key={key} label={label} value={`${(result as any)[key]}%`} icon="📈" tone="info" progress={(result as any)[key]} />
        ))}
      </div>

      {snapshots.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeader eyebrow="History" title="Recorded Snapshots" subtitle={`${snapshots.length} reading(s) on file.`} icon="🗂️" />
          <div className="flex flex-col gap-2">
            {snapshots.slice(0, 10).map(s => (
              <Card key={s.id} className="!p-3.5 flex items-center gap-3">
                <span className="tnum text-sm font-extrabold text-[var(--text-primary)]">{s.effectivenessScore}</span>
                <span className="text-[11px] text-[var(--text-muted)]">recorded {s.recordedAt}</span>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
