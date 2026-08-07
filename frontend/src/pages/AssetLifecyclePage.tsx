import React, { useMemo, useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { KpiCard } from '../components/ui/KpiCard';
import {
  JOURNEY_STAGES,
  getAssetJourneyPositions,
  getGovernanceJourney,
} from '../services/governanceIntelligence';
import type { AssetJourneyPosition, JourneyStageState, RiskLevel } from '../types';

const STATE_STYLE: Record<JourneyStageState, { color: string; glyph: string; title: string }> = {
  approved: { color: 'var(--status-success)', glyph: '●', title: 'Cleared' },
  pending: { color: 'var(--status-warning)', glyph: '◐', title: 'Pending' },
  blocked: { color: 'var(--status-danger)', glyph: '✕', title: 'Blocked' },
};

const RISK_COLOR: Record<RiskLevel, string> = {
  Low: 'var(--risk-low)',
  Medium: 'var(--risk-medium)',
  High: 'var(--risk-high)',
  Critical: 'var(--risk-critical)',
};

type SortKey = 'progress' | 'score' | 'health' | 'risk' | 'name';

const RISK_RANK: Record<RiskLevel, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };

export const AssetLifecyclePage: React.FC = () => {
  const [stageFilter, setStageFilter] = useState<number | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('progress');
  const [search, setSearch] = useState('');

  const positions = useMemo(() => getAssetJourneyPositions(), []);
  const journey = useMemo(() => getGovernanceJourney(), []);

  const stageDistribution = useMemo(() => {
    const counts = JOURNEY_STAGES.map(() => 0);
    positions.forEach(p => {
      counts[p.currentStageIndex] += 1;
    });
    return counts;
  }, [positions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = positions.filter(p => {
      if (stageFilter !== 'all' && p.currentStageIndex !== stageFilter) return false;
      if (q && !p.assetName.toLowerCase().includes(q) && !p.assetType.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });

    const sorters: Record<SortKey, (a: AssetJourneyPosition, b: AssetJourneyPosition) => number> = {
      progress: (a, b) => b.currentStageIndex - a.currentStageIndex,
      score: (a, b) => b.governanceScore - a.governanceScore,
      health: (a, b) => b.healthScore - a.healthScore,
      risk: (a, b) => RISK_RANK[b.riskLevel] - RISK_RANK[a.riskLevel],
      name: (a, b) => a.assetName.localeCompare(b.assetName),
    };

    return [...rows].sort(sorters[sortKey]);
  }, [positions, stageFilter, sortKey, search]);

  const fullyGoverned = positions.filter(p => p.currentStageIndex === JOURNEY_STAGES.length - 1).length;
  const stalled = positions.filter(p => p.currentStageIndex <= 2).length;
  const withBlockers = positions.filter(p => p.blockerCount > 0).length;
  const avgProgress =
    positions.length > 0
      ? Math.round(
          (positions.reduce((s, p) => s + p.currentStageIndex, 0) /
            (positions.length * (JOURNEY_STAGES.length - 1))) *
            100
        )
      : 0;

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Asset Lifecycle</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">
            Where every governed AI asset sits on the eight-stage governance journey.
          </p>
        </div>
      </div>

      {/* Lifecycle KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        <KpiCard
          label="Assets In Lifecycle"
          value={positions.length}
          caption="Tracked end to end"
          icon="🔄"
          tone="accent"
        />
        <KpiCard
          label="Fully Governed"
          value={fullyGoverned}
          caption="Cleared all eight stages"
          icon="✅"
          tone="success"
          progress={positions.length > 0 ? (fullyGoverned / positions.length) * 100 : 0}
        />
        <KpiCard
          label="Early Stage"
          value={stalled}
          caption="Not yet cleared validation"
          icon="⏳"
          tone="warning"
        />
        <KpiCard
          label="Carrying Blockers"
          value={withBlockers}
          caption="Cannot progress without remediation"
          icon="🧱"
          tone="danger"
        />
      </div>

      {/* Stage distribution */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          title="Lifecycle Distribution"
          subtitle={`Average portfolio progression: ${avgProgress}% through the governance journey.`}
          icon="📊"
          action={
            stageFilter !== 'all' ? (
              <button
                onClick={() => setStageFilter('all')}
                className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                Clear filter
              </button>
            ) : undefined
          }
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2">
          {JOURNEY_STAGES.map((stage, i) => {
            const count = stageDistribution[i];
            const active = stageFilter === i;
            const detail = journey[i];

            return (
              <button
                key={stage.key}
                onClick={() => setStageFilter(active ? 'all' : i)}
                data-noglass
                title={stage.purpose}
                className={`rounded-xl border p-3 text-left transition-all duration-200 cursor-pointer ${
                  active
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-light)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-sunken)] hover:border-[var(--accent-border)]'
                }`}
              >
                <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                  Stage {i + 1}
                </p>
                <p className="text-[11.5px] font-bold text-[var(--text-primary)] mt-1 leading-tight">
                  {stage.icon} {stage.label}
                </p>
                <p className="tnum text-xl font-extrabold text-[var(--text-primary)] mt-1.5 leading-none">
                  {count}
                </p>
                <p className="tnum text-[9.5px] text-[var(--text-muted)] mt-1">
                  {detail.clearanceRate}% cleared
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Asset lifecycle matrix */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          title="Asset Progression Matrix"
          subtitle="Stage-by-stage clearance state for each governed AI asset."
          icon="🧬"
          action={
            <div className="flex items-center gap-2">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search assets"
                className="px-2.5 py-1.5 rounded-lg text-[12px] bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-focus)]"
              />
              <select
                value={sortKey}
                onChange={e => setSortKey(e.target.value as SortKey)}
                className="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="progress">Sort: Progression</option>
                <option value="score">Sort: Governance Score</option>
                <option value="health">Sort: Health Score</option>
                <option value="risk">Sort: Risk</option>
                <option value="name">Sort: Name</option>
              </select>
            </div>
          }
        />

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4">
          {(Object.keys(STATE_STYLE) as JourneyStageState[]).map(state => (
            <span key={state} className="flex items-center gap-1.5">
              <span className="text-[11px]" style={{ color: STATE_STYLE[state].color }} aria-hidden>
                {STATE_STYLE[state].glyph}
              </span>
              <span className="text-[10.5px] font-semibold text-[var(--text-muted)]">
                {STATE_STYLE[state].title}
              </span>
            </span>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="pb-2 pr-3 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                  AI Asset
                </th>
                {JOURNEY_STAGES.map(stage => (
                  <th key={stage.key} className="pb-2 px-1 text-center" title={stage.label}>
                    <span className="text-[11px]" aria-hidden>
                      {stage.icon}
                    </span>
                  </th>
                ))}
                <th className="pb-2 px-2 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)] text-center">
                  Score
                </th>
                <th className="pb-2 pl-2 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)] text-center">
                  Health
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(position => (
                <tr
                  key={position.assetId}
                  className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] transition-colors"
                >
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2.5 max-w-[19rem]">
                      <span
                        className="w-1 h-8 rounded-full shrink-0"
                        style={{ background: RISK_COLOR[position.riskLevel] }}
                        aria-hidden
                      />
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-semibold text-[var(--text-primary)] truncate">
                          {position.assetName}
                        </p>
                        <p className="text-[10.5px] text-[var(--text-muted)] truncate">
                          {position.assetType} · reached {position.currentStageLabel}
                          {position.blockerCount > 0 && (
                            <span style={{ color: 'var(--status-danger)' }}>
                              {' '}
                              · {position.blockerCount} blocker
                              {position.blockerCount === 1 ? '' : 's'}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>

                  {JOURNEY_STAGES.map(stage => {
                    const state = position.stageStates[stage.key];
                    const style = STATE_STYLE[state];
                    return (
                      <td key={stage.key} className="px-1 text-center">
                        <span
                          className="text-[13px] font-bold"
                          style={{ color: style.color }}
                          title={`${stage.label}: ${style.title}`}
                        >
                          {style.glyph}
                        </span>
                      </td>
                    );
                  })}

                  <td className="px-2 text-center">
                    <span
                      className="tnum text-[12px] font-extrabold"
                      style={{
                        color:
                          position.governanceScore >= 80
                            ? 'var(--status-success)'
                            : position.governanceScore >= 60
                              ? 'var(--status-warning)'
                              : 'var(--status-danger)',
                      }}
                    >
                      {position.governanceScore}
                    </span>
                  </td>
                  <td className="pl-2 text-center">
                    <span
                      className="tnum text-[12px] font-extrabold"
                      style={{
                        color:
                          position.healthScore >= 80
                            ? 'var(--status-success)'
                            : position.healthScore >= 60
                              ? 'var(--status-warning)'
                              : 'var(--status-danger)',
                      }}
                    >
                      {position.healthScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <p className="py-10 text-center text-[13px] text-[var(--text-muted)]">
              No assets match the current lifecycle filter.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};
