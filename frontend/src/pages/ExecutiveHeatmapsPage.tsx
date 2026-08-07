import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '../components/ui/SectionHeader';
import { KpiCard } from '../components/ui/KpiCard';
import { HeatmapMatrix } from '../components/governance/HeatmapMatrix';
import {
  getAssetTypeHeatmap,
  getBusinessUnitHeatmap,
  getRiskStageHeatmap,
} from '../services/executiveGovernance';
import { getGovernanceMetrics } from '../services/storageService';
import type { HeatmapMatrixRow } from '../types';

type HeatmapViewId = 'business-unit' | 'asset-type' | 'lifecycle';

const VIEWS: { id: HeatmapViewId; label: string; icon: string; dimension: string; blurb: string }[] =
  [
    {
      id: 'business-unit',
      label: 'Business Unit',
      icon: '🏦',
      dimension: 'Business Unit',
      blurb: 'Which parts of the enterprise carry AI risk, and how well they govern it.',
    },
    {
      id: 'asset-type',
      label: 'Asset Type',
      icon: '🧩',
      dimension: 'AI Category',
      blurb: 'Which kinds of AI concentrate risk across the estate.',
    },
    {
      id: 'lifecycle',
      label: 'Lifecycle Stage',
      icon: '◈',
      dimension: 'Governance Stage',
      blurb: 'Where risky assets are sitting in the governance lifecycle.',
    },
  ];

/** Phase 9 WS6 — Executive Heatmaps. */
export const ExecutiveHeatmapsPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewId, setViewId] = useState<HeatmapViewId>('business-unit');

  const rowsByView = useMemo<Record<HeatmapViewId, HeatmapMatrixRow[]>>(
    () => ({
      'business-unit': getBusinessUnitHeatmap(),
      'asset-type': getAssetTypeHeatmap(),
      lifecycle: getRiskStageHeatmap(),
    }),
    []
  );

  const metrics = useMemo(() => getGovernanceMetrics(), []);
  const view = VIEWS.find(v => v.id === viewId) || VIEWS[0];
  const rows = rowsByView[viewId];

  const populated = rows.filter(r => r.total > 0);
  const hottest = [...populated].sort(
    (a, b) =>
      b.cells.Critical * 3 + b.cells.High * 2 - (a.cells.Critical * 3 + a.cells.High * 2)
  )[0];
  const weakestHealth = [...populated].sort((a, b) => a.health - b.health)[0];

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Executive Heatmaps</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          Risk concentration across the enterprise, sliced the three ways executives ask for it.
          Each cell is clickable through to the Risk Center.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        <KpiCard
          label="Critical Risk"
          value={metrics.riskBreakdown.Critical}
          caption="Highest severity AI in the estate"
          icon="🔴"
          tone="danger"
        />
        <KpiCard
          label="High Risk"
          value={metrics.riskBreakdown.High}
          caption="Requires quarterly review cadence"
          icon="🟠"
          tone="warning"
        />
        <KpiCard
          label="Hottest Concentration"
          value={hottest ? hottest.cells.Critical + hottest.cells.High : 0}
          caption={hottest ? hottest.label : 'No high-risk concentration'}
          icon="🔥"
          tone="danger"
        />
        <KpiCard
          label="Weakest Governance"
          value={weakestHealth ? weakestHealth.health : 0}
          caption={weakestHealth ? weakestHealth.label : 'No assets assessed'}
          icon="🩺"
          tone={weakestHealth && weakestHealth.health >= 70 ? 'success' : 'warning'}
          progress={weakestHealth?.health}
        />
      </div>

      {/* View switcher */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Heatmap dimension">
        {VIEWS.map(v => {
          const active = v.id === viewId;
          return (
            <button
              key={v.id}
              onClick={() => setViewId(v.id)}
              aria-pressed={active}
              data-noglass
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-bold border transition-all cursor-pointer ${
                active
                  ? 'text-white border-transparent shadow-md'
                  : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-border)] hover:text-[var(--text-primary)]'
              }`}
              style={active ? { background: 'var(--grad-brand)' } : undefined}
            >
              <span aria-hidden>{v.icon}</span>
              {v.label} Heatmap
            </button>
          );
        })}
      </div>

      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          eyebrow="Workstream 6"
          title={`${view.label} Heatmap`}
          subtitle={view.blurb}
          icon={view.icon}
        />

        <HeatmapMatrix
          rows={rows}
          dimensionLabel={view.dimension}
          onCellClick={() => navigate('/risk')}
        />

        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
          Cell intensity is scaled to the largest concentration in this view. The health column is
          the mean continuous governance health score of the assets in that row — a hot row with a
          low health score is where executive attention belongs first.
        </p>
      </section>
    </div>
  );
};
