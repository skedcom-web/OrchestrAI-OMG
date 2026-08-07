import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ProgressMeter } from '../components/ui/ProgressMeter';
import { TrendChart } from '../components/governance/TrendChart';
import {
  CHANGE_STATUS_TONE,
  MAGNITUDE_TONE,
  Pill,
  REASSESSMENT_TONE,
} from '../components/governance/ChangeStatusPill';
import {
  CHANGE_CATEGORIES,
  getChangeGovernanceMetrics,
  getChangeRiskTrend,
  getGovernanceBottlenecks,
  getPendingReapprovals,
  getRecentCriticalChanges,
} from '../services/changeManagementService';
import type { GovernanceTrendSeries } from '../types';

/**
 * Phase 10 WS6 + WS10 — Change Governance Dashboard and
 * Executive Change Intelligence.
 */
export const ChangeGovernanceDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const metrics = useMemo(() => getChangeGovernanceMetrics(), []);
  const trend = useMemo(() => getChangeRiskTrend(), []);
  const bottlenecks = useMemo(() => getGovernanceBottlenecks(), []);
  const criticalChanges = useMemo(() => getRecentCriticalChanges(6), []);
  const pendingReapprovals = useMemo(() => getPendingReapprovals(), []);

  const trendSeries: GovernanceTrendSeries[] = [
    {
      id: 'submitted',
      label: 'Change Volume',
      icon: '🔁',
      points: trend.map(p => ({ period: p.period, value: p.submitted })),
      higherIsBetter: false,
    },
    {
      id: 'approved',
      label: 'Reapproval Throughput',
      icon: '✅',
      points: trend.map(p => ({ period: p.period, value: p.approved })),
      higherIsBetter: true,
    },
    {
      id: 'critical',
      label: 'Critical Change Trend',
      icon: '⚡',
      points: trend.map(p => ({ period: p.period, value: p.criticalMagnitude })),
      higherIsBetter: false,
    },
  ];

  const totalBottleneck = bottlenecks.reduce((sum, b) => sum + b.pendingCount, 0);

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">
          Change Governance Dashboard
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          Executive visibility into change activity: what is moving, what is stuck, and which
          changes carry enough governance weight to demand leadership attention.
        </p>
      </div>

      {/* WS6 — change activity */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 stagger">
        <KpiCard
          label="Open Changes"
          value={metrics.openChanges}
          caption="Draft, submitted or in review"
          icon="🔁"
          tone="accent"
          onClick={() => navigate('/change-requests')}
        />
        <KpiCard
          label="Approved"
          value={metrics.approvedChanges}
          caption="Cleared for implementation"
          icon="✅"
          tone="success"
        />
        <KpiCard
          label="Rejected"
          value={metrics.rejectedChanges}
          caption="Governance declined the change"
          icon="✕"
          tone="danger"
        />
        <KpiCard
          label="Pending Reviews"
          value={metrics.pendingReviews}
          caption="Awaiting an approver decision"
          icon="⏳"
          tone={metrics.pendingReviews === 0 ? 'success' : 'warning'}
        />
        <KpiCard
          label="High-Risk Changes"
          value={metrics.highRiskChanges}
          caption="On High or Critical risk assets"
          icon="🎯"
          tone="warning"
        />
        <KpiCard
          label="Critical Changes"
          value={metrics.criticalChanges}
          caption="Executive approval required"
          icon="⚡"
          tone={metrics.criticalChanges === 0 ? 'success' : 'danger'}
        />
      </div>

      {/* Pipeline */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          eyebrow="Workstream 6"
          title="Change Pipeline"
          subtitle={`Mean time from submission to decision: ${metrics.averageDecisionDays} days.`}
          icon="📊"
          action={
            <button
              onClick={() => navigate('/change-requests')}
              className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
            >
              Open register →
            </button>
          }
        />

        <ProgressMeter
          height={16}
          segments={(
            ['Draft', 'Submitted', 'Under Review', 'Approved', 'Implemented', 'Closed', 'Rejected'] as const
          ).map(status => ({
            label: status,
            value: metrics.byStatus[status] || 0,
            color: CHANGE_STATUS_TONE[status],
          }))}
        />

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 pt-1">
          {CHANGE_CATEGORIES.map(def => (
            <div
              key={def.category}
              data-noglass
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)] px-3 py-2.5"
            >
              <span className="text-[13px]" aria-hidden>
                {def.icon}
              </span>
              <p className="tnum text-lg font-extrabold text-[var(--text-primary)] mt-1 leading-none">
                {metrics.byCategory[def.category] || 0}
              </p>
              <p className="text-[10px] font-semibold text-[var(--text-muted)] mt-1 leading-tight">
                {def.category.replace(' Change', '')}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* WS10 — trends */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          eyebrow="Workstream 10"
          title="Change Risk Trends"
          subtitle="Whether change activity and change severity are rising or settling."
          icon="📈"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 stagger">
          {trendSeries.map(series => (
            <TrendChart key={series.id} series={series} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* WS10 — critical changes */}
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
          <SectionHeader
            title="Recent Critical Changes"
            subtitle="Changes leadership should know about before they land."
            icon="⚡"
          />

          {criticalChanges.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-[var(--text-muted)]">
              No critical changes in the register.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {criticalChanges.map(change => (
                <li key={change.id}>
                  <button
                    onClick={() => navigate('/change-requests')}
                    data-noglass
                    className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
                  >
                    <span
                      className="w-1.5 h-10 rounded-full shrink-0"
                      style={{
                        background: change.magnitude
                          ? MAGNITUDE_TONE[change.magnitude]
                          : 'var(--status-neutral)',
                      }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="mono block text-[10px] text-[var(--accent-primary)]">
                        {change.changeRef}
                      </span>
                      <span className="block text-[12.5px] font-semibold text-[var(--text-primary)] truncate">
                        {change.title}
                      </span>
                      <span className="block text-[10.5px] text-[var(--text-muted)] truncate">
                        {change.assetName} · {change.category}
                      </span>
                    </span>
                    <Pill label={change.status} tone={CHANGE_STATUS_TONE[change.status]} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* WS10 — bottlenecks */}
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
          <SectionHeader
            title="Governance Bottlenecks"
            subtitle={`${totalBottleneck} approval${totalBottleneck === 1 ? '' : 's'} outstanding across the routed chains.`}
            icon="🚧"
          />

          {bottlenecks.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-[var(--text-muted)]">
              No approver has outstanding change decisions.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {bottlenecks.map(bottleneck => (
                <li
                  key={bottleneck.role}
                  data-noglass
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl border border-[var(--border-subtle)]"
                  style={{ background: 'var(--bg-sunken)' }}
                >
                  <span
                    className="tnum shrink-0 w-11 h-11 grid place-items-center rounded-xl text-[15px] font-extrabold border"
                    style={{
                      color:
                        bottleneck.oldestWaitDays > 14
                          ? 'var(--status-danger)'
                          : 'var(--status-warning)',
                      borderColor:
                        bottleneck.oldestWaitDays > 14
                          ? 'var(--status-danger-border)'
                          : 'var(--status-warning-border)',
                      background:
                        bottleneck.oldestWaitDays > 14
                          ? 'var(--status-danger-bg)'
                          : 'var(--status-warning-bg)',
                    }}
                  >
                    {bottleneck.pendingCount}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] font-bold text-[var(--text-primary)]">
                      {bottleneck.role}
                    </span>
                    <span className="block text-[10.5px] text-[var(--text-muted)] truncate">
                      Oldest wait {bottleneck.oldestWaitDays} days ·{' '}
                      {bottleneck.changeRefs.join(', ')}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* WS10 — pending reapprovals */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          eyebrow="Workstream 10"
          title="Pending Reapprovals"
          subtitle="Assets whose approved state is provisional until a change clears governance."
          icon="🔓"
        />

        {pendingReapprovals.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-[var(--text-muted)]">
            No asset is waiting on a reapproval.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {pendingReapprovals.map(change => (
              <div
                key={change.id}
                data-noglass
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)] px-3.5 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="mono text-[10px] text-[var(--accent-primary)]">
                      {change.changeRef}
                    </p>
                    <p className="text-[12.5px] font-semibold text-[var(--text-primary)] truncate">
                      {change.assetName}
                    </p>
                    <p className="text-[10.5px] text-[var(--text-muted)] mt-0.5">
                      {change.category} · requested {change.requestedDate}
                    </p>
                  </div>
                  {change.reassessment && (
                    <Pill
                      label={change.reassessment.replace(' Required', '')}
                      tone={REASSESSMENT_TONE[change.reassessment]}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
