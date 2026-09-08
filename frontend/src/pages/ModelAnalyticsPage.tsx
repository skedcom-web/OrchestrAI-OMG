import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { RiskBadge } from '../components/ui/Badge';
import { getModels } from '../services/storageService';
import type { LifecycleStage, ModelType, RiskLevel } from '../types';

const STAGES: LifecycleStage[] = ['Register', 'Assess', 'Approve', 'Operate', 'Monitor', 'Reassess', 'Retire'];
const TYPES: ModelType[] = ['Foundation', 'Fine-Tuned', 'Custom', 'Third-Party'];

/**
 * R13 — Model Governance. Which assets use which models, and where model
 * risk concentrates across the portfolio — a rollup, not a new engine (see
 * Architecture Package §2, Reporting Architecture).
 */
export const ModelAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const models = useMemo(() => getModels(), []);

  const byStage = STAGES.map(stage => ({ stage, count: models.filter(m => m.lifecycleStage === stage).length }));
  const byType = TYPES.map(type => ({ type, count: models.filter(m => m.modelType === type).length }));
  const byRisk = (['Critical', 'High', 'Medium', 'Low'] as RiskLevel[]).map(level => ({ level, count: models.filter(m => m.riskLevel === level).length }));
  const shared = models.filter(m => m.usedByAssetIds.length > 1).sort((a, b) => b.usedByAssetIds.length - a.usedByAssetIds.length);
  const driftCount = models.filter(m => m.driftDetected).length;
  const maxStageCount = Math.max(1, ...byStage.map(s => s.count));

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SectionHeader
        title="Model Analytics"
        subtitle="Which assets use which models, and where model risk concentrates across the portfolio."
        icon="📊"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum text-[var(--text-primary)]">{models.length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Governed Models</p></Card>
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum text-[var(--accent-primary)]">{shared.length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Shared Across Assets</p></Card>
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum" style={{ color: 'var(--status-danger)' }}>{driftCount}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Drift Flagged</p></Card>
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum" style={{ color: 'var(--status-success)' }}>{models.filter(m => m.decisionOutcome === 'GO').length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Approved (GO)</p></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-4">Portfolio by Lifecycle Stage</p>
          <div className="flex flex-col gap-2.5">
            {byStage.map(({ stage, count }) => (
              <div key={stage} className="flex items-center gap-3">
                <span className="w-16 text-xs font-semibold text-[var(--text-secondary)] shrink-0">{stage}</span>
                <div className="flex-1 h-2 rounded-full bg-[var(--bg-badge)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(count / maxStageCount) * 100}%`, background: 'var(--accent-primary)' }} />
                </div>
                <span className="w-5 text-xs font-bold text-[var(--text-primary)] tnum text-right">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-4">Portfolio by Risk</p>
          <div className="flex flex-col gap-2.5">
            {byRisk.map(({ level, count }) => (
              <div key={level} className="flex items-center justify-between">
                <RiskBadge level={level} size="sm" />
                <span className="text-sm font-bold text-[var(--text-primary)] tnum">{count}</span>
              </div>
            ))}
          </div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mt-5 mb-3">By Model Type</p>
          <div className="flex flex-wrap gap-2">
            {byType.map(({ type, count }) => (
              <span key={type} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                {type} · {count}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-4">Models Shared Across Multiple Assets</p>
        {shared.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)]">No model is currently linked to more than one asset.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {shared.map(model => (
              <div key={model.id} className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)] last:border-0 last:pb-0">
                <div className="min-w-0">
                  <button onClick={() => navigate('/models')} className="text-sm font-bold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors cursor-pointer text-left">
                    {model.name}
                  </button>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{model.usedByAssetNames.join(' · ')}</p>
                </div>
                <span className="shrink-0 text-xs font-extrabold px-2.5 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-border)] tnum">
                  {model.usedByAssetIds.length} assets
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
