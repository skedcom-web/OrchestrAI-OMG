import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '../components/ui/SectionHeader';
import { TrendChart } from '../components/governance/TrendChart';
import {
  getExecutiveInsights,
  getGovernanceHealthIndex,
  getGovernanceTrends,
} from '../services/executiveGovernance';
import type { PolicyViolationSeverity } from '../types';

const SEVERITY_TONE: Record<PolicyViolationSeverity, string> = {
  Critical: 'var(--risk-critical)',
  High: 'var(--risk-high)',
  Medium: 'var(--risk-medium)',
  Low: 'var(--risk-low)',
};

/** Phase 9 WS7 — Governance Insights. */
export const GovernanceInsightsPage: React.FC = () => {
  const navigate = useNavigate();
  const trends = useMemo(() => getGovernanceTrends(), []);
  const insights = useMemo(() => getExecutiveInsights(), []);
  const health = useMemo(() => getGovernanceHealthIndex(), []);

  const actionable = insights.filter(i => i.count > 0);
  const clear = insights.filter(i => i.count === 0);

  const improving = trends.filter(series => {
    const first = series.points[0]?.value ?? 0;
    const last = series.points[series.points.length - 1]?.value ?? 0;
    const delta = last - first;
    return series.higherIsBetter ? delta >= 0 : delta <= 0;
  }).length;

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Governance Insights</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          Direction of travel, and the shortest path from posture to action. Trends are
          reconstructed from the immutable audit trail, so every figure is evidenced.
        </p>
      </div>

      {/* Headline */}
      <section
        className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] p-5 sm:p-6"
        style={{ background: 'var(--grad-hero)' }}
      >
        <div className="absolute inset-0 enterprise-grid opacity-50 pointer-events-none" aria-hidden />
        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Governance Health
            </p>
            <p className="tnum text-[2.2rem] font-extrabold text-[var(--text-primary)] leading-none mt-1.5">
              {health.score}
              <span className="text-[14px] text-[var(--text-muted)]">/100</span>
            </p>
            <p className="text-[11.5px] font-bold text-[var(--text-secondary)] mt-1">
              Posture: {health.band}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Trends Improving
            </p>
            <p className="tnum text-[2.2rem] font-extrabold leading-none mt-1.5" style={{ color: 'var(--status-success)' }}>
              {improving}
              <span className="text-[14px] text-[var(--text-muted)]">/{trends.length}</span>
            </p>
            <p className="text-[11.5px] font-bold text-[var(--text-secondary)] mt-1">
              Moving in the right direction
            </p>
          </div>

          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Open Governance Debt
            </p>
            <p
              className="tnum text-[2.2rem] font-extrabold leading-none mt-1.5"
              style={{ color: actionable.length > 0 ? 'var(--status-warning)' : 'var(--status-success)' }}
            >
              {actionable.reduce((sum, i) => sum + i.count, 0)}
            </p>
            <p className="text-[11.5px] font-bold text-[var(--text-secondary)] mt-1">
              Items across {actionable.length} insight areas
            </p>
          </div>
        </div>
      </section>

      {/* Trends */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          eyebrow="Workstream 7"
          title="Governance Trends"
          subtitle="Risk, approvals, policy violations, reviews and overall health across six months."
          icon="📈"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 stagger">
          {trends.map(series => (
            <TrendChart key={series.id} series={series} />
          ))}
        </div>
      </section>

      {/* Insights requiring action */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          title="Insights Requiring Action"
          subtitle="Ranked by severity, then by volume."
          icon="💡"
        />

        {actionable.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-[var(--text-muted)]">
            No outstanding governance debt. Every insight area is clear.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {actionable.map(insight => (
              <button
                key={insight.id}
                onClick={() => navigate(insight.actionPath)}
                data-noglass
                className="text-left flex items-center gap-4 px-4 py-3.5 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
              >
                <span
                  className="tnum shrink-0 w-14 h-14 grid place-items-center rounded-xl text-[19px] font-extrabold border"
                  style={{
                    color: SEVERITY_TONE[insight.severity],
                    borderColor: `color-mix(in srgb, ${SEVERITY_TONE[insight.severity]} 40%, transparent)`,
                    background: `color-mix(in srgb, ${SEVERITY_TONE[insight.severity]} 12%, transparent)`,
                  }}
                >
                  {insight.count}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-[13.5px] font-bold text-[var(--text-primary)]">
                      {insight.title}
                    </span>
                    <span
                      className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded"
                      style={{
                        color: SEVERITY_TONE[insight.severity],
                        background: `color-mix(in srgb, ${SEVERITY_TONE[insight.severity]} 12%, transparent)`,
                      }}
                    >
                      {insight.severity}
                    </span>
                  </span>
                  <span className="block text-[11.5px] text-[var(--text-muted)] leading-snug mt-1">
                    {insight.detail}
                  </span>
                </span>

                <span className="shrink-0 text-[11px] font-bold text-[var(--accent-primary)] whitespace-nowrap">
                  {insight.actionLabel} →
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Clear areas */}
      {clear.length > 0 && (
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
          <SectionHeader
            title="Areas Currently Clear"
            subtitle="No outstanding items — hold the standard."
            icon="✅"
          />
          <div className="flex flex-wrap gap-2">
            {clear.map(insight => (
              <span
                key={insight.id}
                data-noglass
                className="text-[11.5px] font-semibold px-3 py-1.5 rounded-lg border"
                style={{
                  color: 'var(--status-success)',
                  borderColor: 'var(--status-success-border)',
                  background: 'var(--status-success-bg)',
                }}
              >
                ✓ {insight.title}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
