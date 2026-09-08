import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { RiskBadge } from '../components/ui/Badge';
import { getAssets, getModels, getKnowledgeAssets, getPrompts, getTools } from '../services/storageService';
import type { LifecycleStage, GovernanceStatus, RiskLevel } from '../types';

type EntityKind = 'Model' | 'KnowledgeAsset' | 'Prompt' | 'Tool';

const STAGES: LifecycleStage[] = ['Register', 'Assess', 'Approve', 'Operate', 'Monitor', 'Reassess', 'Retire'];

const ENTITY_KIND_OPTIONS: { value: EntityKind; label: string }[] = [
  { value: 'Model', label: 'Model' },
  { value: 'KnowledgeAsset', label: 'Knowledge Asset' },
  { value: 'Prompt', label: 'Prompt' },
  { value: 'Tool', label: 'Tool' },
];

const ENTITY_KIND_TONE: Record<EntityKind, string> = {
  Model: 'var(--accent-primary)',
  KnowledgeAsset: 'var(--status-warning)',
  Prompt: 'var(--status-success)',
  Tool: 'var(--status-danger)',
};

const ENTITY_KIND_ROUTE: Record<EntityKind, string> = {
  Model: '/models',
  KnowledgeAsset: '/knowledge-registry',
  Prompt: '/prompt-library',
  Tool: '/tool-registry',
};

const ASSET_STATUSES: GovernanceStatus[] = ['Draft', 'Review', 'Validation', 'Approval', 'Production', 'Retirement'];

interface Row {
  kind: EntityKind;
  id: string;
  name: string;
  riskLevel: RiskLevel;
  stage: LifecycleStage;
}

/**
 * R19 — Lifecycle Governance. Per the architecture package, R19's 7-stage
 * engine (the shared LifecycleStage enum) already shipped inside the R13
 * Foundation — every governed entity from R13 onward (Model, Knowledge,
 * Prompt, Tool) was built against it from day one. This screen is the one
 * thing R19 actually adds: a single cross-portfolio view of current stage,
 * not a new engine. AI Assets predate this shared vocabulary and keep their
 * own GovernanceStatus model untouched, per the Foundation's own note — shown
 * here as a separate, honestly-labeled section rather than force-mapped into
 * the same seven stages.
 */
export const LifecycleConsolePage: React.FC = () => {
  const navigate = useNavigate();
  const [kindFilter, setKindFilter] = useState<'All' | EntityKind>('All');
  const [stageFilter, setStageFilter] = useState<'All' | LifecycleStage>('All');

  const rows: Row[] = useMemo(() => [
    ...getModels().map(m => ({ kind: 'Model' as const, id: m.id, name: m.name, riskLevel: m.riskLevel, stage: m.lifecycleStage })),
    ...getKnowledgeAssets().map(k => ({ kind: 'KnowledgeAsset' as const, id: k.id, name: k.name, riskLevel: k.riskLevel, stage: k.lifecycleStage })),
    ...getPrompts().map(p => ({ kind: 'Prompt' as const, id: p.id, name: p.name, riskLevel: p.riskLevel, stage: p.lifecycleStage })),
    ...getTools().map(t => ({ kind: 'Tool' as const, id: t.id, name: t.name, riskLevel: t.riskLevel, stage: t.lifecycleStage })),
  ], []);

  const assets = useMemo(() => getAssets(), []);

  const stageDistribution = STAGES.map(stage => ({ stage, count: rows.filter(r => r.stage === stage).length }));
  const maxStageCount = Math.max(1, ...stageDistribution.map(s => s.count));

  const assetStatusDistribution = ASSET_STATUSES.map(status => ({ status, count: assets.filter(a => a.status === status).length }));
  const maxAssetStatusCount = Math.max(1, ...assetStatusDistribution.map(s => s.count));

  const filtered = rows.filter(r => {
    if (kindFilter !== 'All' && r.kind !== kindFilter) return false;
    if (stageFilter !== 'All' && r.stage !== stageFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SectionHeader
        title="Universal Lifecycle Console"
        subtitle="Every governed Model, Knowledge source, Prompt and Tool, current lifecycle stage, in one portfolio view."
        icon="🔄"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum text-[var(--text-primary)]">{rows.length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Governed Entities</p></Card>
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum" style={{ color: 'var(--status-success)' }}>{rows.filter(r => r.stage === 'Operate').length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Operating</p></Card>
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum" style={{ color: 'var(--status-warning)' }}>{rows.filter(r => r.stage === 'Reassess').length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Reassessing</p></Card>
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum text-[var(--text-muted)]">{rows.filter(r => r.stage === 'Retire').length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Retired</p></Card>
      </div>

      <Card>
        <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-4">Lifecycle Stage Distribution — Model, Knowledge, Prompt &amp; Tool</p>
        <div className="flex flex-col gap-2.5">
          {stageDistribution.map(({ stage, count }) => (
            <div key={stage} className="flex items-center gap-3">
              <span className="w-20 text-xs font-semibold text-[var(--text-secondary)] shrink-0">{stage}</span>
              <div className="flex-1 h-2 rounded-full bg-[var(--bg-badge)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--accent-primary)]" style={{ width: `${(count / maxStageCount) * 100}%` }} />
              </div>
              <span className="w-5 text-xs font-bold text-[var(--text-primary)] tnum text-right">{count}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-4">
          AI Assets — Governance Status <span className="normal-case font-medium text-[var(--text-muted)]">(Assets predate the shared lifecycle vocabulary and keep their own status model)</span>
        </p>
        <div className="flex flex-col gap-2.5">
          {assetStatusDistribution.map(({ status, count }) => (
            <div key={status} className="flex items-center gap-3">
              <span className="w-20 text-xs font-semibold text-[var(--text-secondary)] shrink-0">{status}</span>
              <div className="flex-1 h-2 rounded-full bg-[var(--bg-badge)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--status-info)]" style={{ width: `${(count / maxAssetStatusCount) * 100}%` }} />
              </div>
              <span className="w-5 text-xs font-bold text-[var(--text-primary)] tnum text-right">{count}</span>
            </div>
          ))}
        </div>
        <button onClick={() => navigate('/assets')} className="text-xs font-bold text-[var(--accent-primary)] hover:underline mt-4">View Asset Registry →</button>
      </Card>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Select value={kindFilter} onChange={e => setKindFilter(e.target.value as any)} options={[{ value: 'All', label: 'All entity types' }, ...ENTITY_KIND_OPTIONS]} className="sm:max-w-[12rem]" />
          <Select value={stageFilter} onChange={e => setStageFilter(e.target.value as any)} options={[{ value: 'All', label: 'All stages' }, ...STAGES.map(s => ({ value: s, label: s }))]} className="sm:max-w-[10rem]" />
        </div>
        {filtered.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)]">No entities match this filter.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {filtered.map(row => (
              <div key={`${row.kind}-${row.id}`} data-noglass className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)] px-3 py-2">
                <div className="min-w-0 flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0" style={{ color: ENTITY_KIND_TONE[row.kind], background: 'var(--bg-badge)', border: `1px solid ${ENTITY_KIND_TONE[row.kind]}40` }}>
                    {ENTITY_KIND_OPTIONS.find(o => o.value === row.kind)?.label}
                  </span>
                  <button onClick={() => navigate(ENTITY_KIND_ROUTE[row.kind])} className="text-sm font-bold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors cursor-pointer text-left truncate">
                    {row.name}
                  </button>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <RiskBadge level={row.riskLevel} size="sm" />
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-border)] text-[var(--accent-primary)]">{row.stage}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
