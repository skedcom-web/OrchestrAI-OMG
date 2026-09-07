import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { getAssets, getGovernanceAssessmentRecords, bootstrapPersistence } from '../services/storageService';
import { recommendBenchmarks } from '../config/governanceBenchmarkRecommendationEngine';
import type { AssetType, GovernanceClassification, RiskLevel } from '../types';

const USE_CASES: GovernanceClassification[] = ['Internal Productivity', 'Customer Facing', 'Decision Support', 'Operational Automation', 'Agentic Workflow', 'Regulated AI'];
const RISK_CATEGORIES: RiskLevel[] = ['Low', 'Medium', 'High', 'Critical'];
const ASSET_TYPES: AssetType[] = ['Application', 'Agent', 'Model', 'LLM', 'Copilot', 'RAG System', 'AI Workflow', 'Multi-Agent System', 'Third-Party AI Service'];

/**
 * GACF Phase 2, Initiative 4 — Benchmark Recommendation Engine. Read-only
 * for every role; recommends by filtering/ranking data OMG already has
 * (see governanceBenchmarkRecommendationEngine.ts) — no persistence, no
 * write action, so no RBAC gate is needed beyond ordinary page visibility.
 */
export const BenchmarkRecommendationsPage: React.FC = () => {
  const [assets, setAssets] = useState(() => getAssets());
  const [records, setRecords] = useState(() => getGovernanceAssessmentRecords());
  const [useCase, setUseCase] = useState<GovernanceClassification>('Decision Support');
  const [riskCategory, setRiskCategory] = useState<RiskLevel>('High');
  const [assetType, setAssetType] = useState<AssetType>('Model');

  useEffect(() => {
    bootstrapPersistence().then(() => {
      setAssets(getAssets());
      setRecords(getGovernanceAssessmentRecords());
    });
  }, []);

  const recommendation = useMemo(
    () => recommendBenchmarks({ useCase, riskCategory, assetType }, assets, records),
    [useCase, riskCategory, assetType, assets, records]
  );

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Benchmark Recommendations</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          Select the dimensions of the asset you're about to assess — OMG surfaces the most relevant playbooks, reference examples and observed scoring ranges from data already on the platform. Guidance only, deterministic rules — never an AI-generated suggestion.
        </p>
      </div>

      <Card className="!p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select label="Use Case" value={useCase} onChange={e => setUseCase(e.target.value as GovernanceClassification)} options={USE_CASES.map(v => ({ value: v, label: v }))} />
        <Select label="Risk Category" value={riskCategory} onChange={e => setRiskCategory(e.target.value as RiskLevel)} options={RISK_CATEGORIES.map(v => ({ value: v, label: v }))} />
        <Select label="Asset Type" value={assetType} onChange={e => setAssetType(e.target.value as AssetType)} options={ASSET_TYPES.map(v => ({ value: v, label: v }))} />
      </Card>

      <section className="flex flex-col gap-4">
        <SectionHeader eyebrow="Recommended" title="Relevant Playbooks" subtitle="Ranked by a fixed rule set — not learned or inferred." icon="📚" />
        <div className="flex flex-col gap-2">
          {recommendation.rankedPlaybooks.map((r, i) => (
            <Card key={r.playbook.assessmentType} className="!p-4 flex items-center gap-3 flex-wrap">
              <span className="tnum text-xs font-black text-[var(--text-muted)] w-5">{i + 1}</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">{r.playbook.icon} {r.playbook.assessmentType}</span>
              <span className="text-[12px] text-[var(--text-secondary)] flex-1 min-w-[200px]">{r.reason}</span>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader eyebrow="Recommended" title="Reference Examples" subtitle="Calibration Library scenarios closest to your selected dimensions." icon="🎓" />
        {recommendation.referenceExamples.length === 0 ? (
          <Card className="!p-6 text-center">
            <p className="text-sm text-[var(--text-secondary)]">No Calibration Library scenario shares any of these dimensions — the Calibration Library still has value as general reference material.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {recommendation.referenceExamples.map(ex => (
              <Card key={ex.scenario} className="!p-4 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-[var(--text-primary)]">{ex.icon} {ex.scenario}</span>
                  {ex.useCase === useCase && <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-[var(--accent-light)] text-[var(--accent-primary)]">Use Case Match</span>}
                  {ex.riskCategory === riskCategory && <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-[var(--accent-light)] text-[var(--accent-primary)]">Risk Match</span>}
                  {ex.assetType === assetType && <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-[var(--accent-light)] text-[var(--accent-primary)]">Asset Type Match</span>}
                </div>
                <p className="text-[12.5px] text-[var(--text-secondary)]">{ex.description}</p>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader eyebrow="Recommended" title="Similar Assessments &amp; Typical Scoring Range" subtitle="Observed, not assumed — computed from recorded assessments of assets sharing these exact dimensions." icon="📊" />
        {recommendation.similarAssessments.length === 0 ? (
          <Card className="!p-6 text-center">
            <p className="text-sm text-[var(--text-secondary)]">No recorded assessments yet for assets matching all three selected dimensions.</p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <KpiCard label="Similar Assessments" value={recommendation.typicalScoringRange.count} icon="n" tone="neutral" />
              <KpiCard label="Mean Score" value={recommendation.typicalScoringRange.mean} icon="μ" tone="neutral" />
              <KpiCard label="Median Score" value={recommendation.typicalScoringRange.median} icon="⚖" tone="neutral" />
              <KpiCard label="Range" value={recommendation.typicalScoringRange.range} caption={`${recommendation.typicalScoringRange.min}–${recommendation.typicalScoringRange.max}`} icon="↔" tone="neutral" />
              <KpiCard label="Std. Deviation" value={recommendation.typicalScoringRange.standardDeviation} icon="σ" tone="neutral" />
            </div>
            <div className="flex flex-col gap-2">
              {recommendation.similarAssessments.slice(0, 6).map(r => (
                <Card key={r.id} className="!p-3.5 flex items-center gap-3 flex-wrap">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[var(--accent-light)] text-[var(--accent-primary)]">{r.assessmentType}</span>
                  <span className="text-[13px] font-bold text-[var(--text-primary)]">{r.assetName}</span>
                  <span className="tnum text-[12px] font-bold text-[var(--text-secondary)]">{r.overallScore}/5</span>
                  <span className="text-[11px] text-[var(--text-muted)]">by {r.assessorName} · {r.createdAt}</span>
                </Card>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};
