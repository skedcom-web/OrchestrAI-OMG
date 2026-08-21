import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ScoreRing } from '../components/ui/ScoreRing';
import { ProgressMeter } from '../components/ui/ProgressMeter';
import { ScorecardPanel } from '../components/governance/ScorecardPanel';
import { TrendChart } from '../components/governance/TrendChart';
import { HeatmapMatrix } from '../components/governance/HeatmapMatrix';
import { useAuth } from '../contexts/AuthContext';
import { getAssets, getGovernanceMetrics } from '../services/storageService';
import { getPolicyComplianceSummary } from '../services/policyService';
import {
  EXECUTIVE_VIEWS,
  getAiEstateSummary,
  getAssetTypeHeatmap,
  getAuthorityOversightSummary,
  getContinuityOverview,
  getEvidenceOverview,
  getExecutiveAlerts,
  getExecutiveInsights,
  getGovernanceHealthIndex,
  getGovernanceScorecards,
  getGovernanceTrends,
  getReadinessOverview,
} from '../services/executiveGovernance';
import { GovernanceStateBadge, ReadinessBadge } from '../components/ui/Badge';
import type { ExecutiveAlertType, ExecutiveViewId, GovernanceState, PolicyViolationSeverity, ReadinessStatus } from '../types';

const SEVERITY_COLOR: Record<PolicyViolationSeverity, string> = {
  Critical: 'var(--status-danger)',
  High: 'var(--risk-high)',
  Medium: 'var(--status-warning)',
  Low: 'var(--status-info)',
};

const ALERT_ICON: Record<ExecutiveAlertType, string> = {
  'Critical Risk': '⚡',
  'Missing Ownership': '👥',
  'Policy Violation': '📕',
  'Expired Review': '📅',
};

const BAND_TONE: Record<string, string> = {
  Strong: 'var(--status-success)',
  Stable: 'var(--status-info)',
  Fragile: 'var(--status-warning)',
  Critical: 'var(--status-danger)',
};

/**
 * Phase 9 WS1 + WS9 — Executive Governance Hub.
 *
 * One surface, four audiences. The view switcher reshapes which sections are
 * shown so a CIO, CRO, Compliance Officer or Board member reaches their answer
 * without navigating anywhere else.
 */
export const ExecutiveGovernanceHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [viewId, setViewId] = useState<ExecutiveViewId>(() => {
    const saved = localStorage.getItem('omg_executive_view');
    return (saved as ExecutiveViewId) || 'board';
  });

  const data = useMemo(
    () => ({
      estate: getAiEstateSummary(),
      authority: getAuthorityOversightSummary(),
      continuity: getContinuityOverview(),
      evidence: getEvidenceOverview(),
      readiness: getReadinessOverview(),
      health: getGovernanceHealthIndex(),
      metrics: getGovernanceMetrics(),
      scorecards: getGovernanceScorecards(),
      alerts: getExecutiveAlerts(),
      insights: getExecutiveInsights(),
      trends: getGovernanceTrends(),
      policy: getPolicyComplianceSummary(),
      typeHeatmap: getAssetTypeHeatmap(),
      assets: getAssets(),
    }),
    []
  );

  const view = EXECUTIVE_VIEWS.find(v => v.id === viewId) || EXECUTIVE_VIEWS[3];
  const shows = (section: string) => view.sections.includes(section);

  const selectView = (id: ExecutiveViewId) => {
    setViewId(id);
    localStorage.setItem('omg_executive_view', id);
  };

  const criticalAssets = data.assets
    .filter(a => a.riskLevel === 'Critical' || a.riskLevel === 'High')
    .sort((a, b) => Number(b.riskLevel === 'Critical') - Number(a.riskLevel === 'Critical'));

  const alertsByType = (Object.keys(ALERT_ICON) as ExecutiveAlertType[]).map(type => ({
    type,
    count: data.alerts.filter(a => a.type === type).length,
  }));

  const estateRows: { label: string; value: number; icon: string }[] = [
    { label: 'Applications', value: data.estate.applications, icon: '💻' },
    { label: 'Agents', value: data.estate.agents, icon: '🤖' },
    { label: 'Models', value: data.estate.models, icon: '📈' },
    { label: 'Copilots', value: data.estate.copilots, icon: '🧑‍💼' },
    { label: 'RAG Systems', value: data.estate.ragSystems, icon: '📚' },
    { label: 'Third-Party AI', value: data.estate.thirdPartyAi, icon: '🔌' },
  ];

  return (
    <div className="flex flex-col gap-7 pb-4">
      {/* ===================== HERO ===================== */}
      <section
        className="relative overflow-hidden rounded-3xl border border-[var(--border-color)] sheen"
        style={{ background: 'var(--grad-hero)' }}
      >
        <div className="absolute inset-0 enterprise-grid opacity-60 pointer-events-none" aria-hidden />
        <div
          className="absolute -right-24 -top-24 w-[24rem] h-[24rem] rounded-full pointer-events-none"
          style={{ background: 'var(--grad-brand)', opacity: 0.12, filter: 'blur(60px)' }}
          aria-hidden
        />

        <div className="relative p-6 sm:p-8 flex flex-col xl:flex-row xl:items-center gap-7">
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <span
              data-noglass
              className="inline-flex items-center gap-2 w-fit px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-[0.12em] bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-border)]"
            >
              <span className="status-pulse" />
              Phase 9 · Executive AI Governance Command Center
            </span>

            <div>
              <h1 className="text-[1.9rem] sm:text-[2.4rem] font-extrabold leading-[1.1] text-[var(--text-primary)]">
                Executive Governance <span className="text-gradient-brand">Hub</span>
              </h1>
              <p className="mt-2.5 text-[14px] font-semibold text-[var(--text-secondary)]">
                Governed Decisions. <span className="text-[var(--text-muted)]">·</span> Minimal
                Governance Debt.
              </p>
              <p className="mt-2 text-[12.5px] text-[var(--text-muted)] max-w-2xl leading-relaxed">
                {view.question} Everything below is scoped to the{' '}
                <strong className="text-[var(--text-secondary)]">{view.audience}</strong> lens.
              </p>
            </div>

            {/* WS9 — Role-based executive view switcher */}
            <div className="flex flex-wrap gap-2 pt-1" role="group" aria-label="Executive view">
              {EXECUTIVE_VIEWS.map(v => {
                const active = v.id === viewId;
                return (
                  <button
                    key={v.id}
                    onClick={() => selectView(v.id)}
                    aria-pressed={active}
                    title={v.question}
                    data-noglass
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer border ${
                      active
                        ? 'text-white border-transparent shadow-md'
                        : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-border)] hover:text-[var(--text-primary)]'
                    }`}
                    style={active ? { background: 'var(--grad-brand)' } : undefined}
                  >
                    <span aria-hidden>{v.icon}</span>
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Governance Health Index */}
          <div
            data-noglass
            className="shrink-0 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/70 backdrop-blur-sm p-5 flex items-center gap-5"
          >
            <ScoreRing
              score={data.health.score}
              label="Health Index"
              caption={data.health.band}
            />
            <div className="flex flex-col gap-2 min-w-[11rem]">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Governance Health Index
              </p>
              {data.health.dimensions.map(d => (
                <div key={d.label} className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-semibold text-[var(--text-secondary)] w-[6.2rem] shrink-0 truncate"
                    title={d.label}
                  >
                    {d.label.replace(' Completeness', '').replace(' Readiness', '')}
                  </span>
                  <span
                    className="flex-1 h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'var(--bg-sunken)' }}
                  >
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${d.score}%`,
                        background:
                          d.score >= 80
                            ? 'var(--status-success)'
                            : d.score >= 60
                              ? 'var(--status-warning)'
                              : 'var(--status-danger)',
                      }}
                    />
                  </span>
                  <span className="tnum text-[10px] font-bold text-[var(--text-primary)] w-6 text-right">
                    {d.score}
                  </span>
                </div>
              ))}
              <p
                className="text-[10px] font-extrabold uppercase tracking-[0.1em] mt-0.5"
                style={{ color: BAND_TONE[data.health.band] }}
              >
                Posture: {data.health.band}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== AI ESTATE SUMMARY ===================== */}
      {(shows('estate') || shows('summary') || shows('portfolio')) && (
        <section className="flex flex-col gap-4">
          <SectionHeader
            eyebrow="Workstream 1"
            title="AI Estate Summary"
            subtitle="Every form of artificial intelligence the enterprise is accountable for."
            icon="🧭"
            action={
              <button
                onClick={() => navigate('/assets')}
                className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                Open registry →
              </button>
            }
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-2.5 stagger">
            <div
              className="rounded-2xl border p-4 flex flex-col justify-between"
              style={{
                background: 'var(--grad-brand)',
                borderColor: 'transparent',
                minHeight: '6.5rem',
              }}
            >
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-white/80">
                Total AI Assets
              </p>
              <p className="tnum text-[2rem] font-extrabold text-white leading-none">
                {data.estate.totalAssets}
              </p>
            </div>

            {estateRows.map(row => (
              <button
                key={row.label}
                onClick={() => navigate('/assets')}
                data-noglass
                className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 flex flex-col justify-between text-left glow-on-hover cursor-pointer"
                style={{ minHeight: '6.5rem' }}
              >
                <span className="flex items-center justify-between">
                  <span className="text-[14px]" aria-hidden>
                    {row.icon}
                  </span>
                  <span className="tnum text-[9.5px] font-bold text-[var(--text-muted)]">
                    {data.estate.totalAssets > 0
                      ? Math.round((row.value / data.estate.totalAssets) * 100)
                      : 0}
                    %
                  </span>
                </span>
                <span>
                  <span className="tnum block text-[1.6rem] font-extrabold text-[var(--text-primary)] leading-none">
                    {row.value}
                  </span>
                  <span className="block text-[10.5px] font-semibold text-[var(--text-secondary)] mt-1">
                    {row.label}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ===================== ACCOUNTABILITY, OVERSIGHT & AUTONOMY (Release 1) ===================== */}
      {(shows('estate') || shows('summary') || shows('portfolio')) && (
        <section className="flex flex-col gap-4">
          <SectionHeader
            eyebrow="Release 1"
            title="Accountability, Oversight & Autonomy"
            subtitle="Who owns this AI, how humans supervise it, and how much it acts on its own."
            icon="🧑‍⚖️"
            action={
              <button
                onClick={() => navigate('/assets')}
                className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                Open registry →
              </button>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 flex flex-col gap-1.5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                Governance Authority Profile
              </p>
              <p className="tnum text-[1.9rem] font-extrabold text-[var(--text-primary)] leading-none">
                {data.authority.authorityProfileCompleteAssets}
                <span className="text-[13px] font-semibold text-[var(--text-muted)]"> / {data.authority.totalAssets}</span>
              </p>
              <p className="text-[11.5px] text-[var(--text-secondary)]">
                Assets with an Accountable Owner, Governance Sponsor, Risk Owner and Technical Owner on record.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 flex flex-col gap-2">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                Human Oversight Model
              </p>
              <div className="flex flex-col gap-1">
                {data.authority.oversightBreakdown.map(o => (
                  <div key={o.type} className="flex items-center justify-between text-[11.5px]">
                    <span className="text-[var(--text-secondary)]">{o.type}</span>
                    <span className="tnum font-bold text-[var(--text-primary)]">{o.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 flex flex-col gap-1.5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                Autonomy Exposure
              </p>
              <p className="tnum text-[1.9rem] font-extrabold text-[var(--text-primary)] leading-none">
                {data.authority.highAutonomyAssets}
              </p>
              <p className="text-[11.5px] text-[var(--text-secondary)]">
                Assets classified Level 4 (Controlled Autonomy) or Level 5 (High Autonomy).
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ===================== GOVERNANCE CONTINUITY OVERVIEW (Release 2) ===================== */}
      {(shows('estate') || shows('summary') || shows('portfolio')) && (
        <section className="flex flex-col gap-4">
          <SectionHeader
            eyebrow="Release 2"
            title="Governance Continuity Overview"
            subtitle="Whether approved AI assets remain validly authorized over time."
            icon="🔁"
            action={
              <button
                onClick={() => navigate('/governance-timeline')}
                className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                Open governance timeline →
              </button>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/review-calendar')}
              data-noglass
              className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 flex flex-col gap-1.5 text-left glow-on-hover cursor-pointer"
            >
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                Assets Awaiting Review
              </p>
              <p className="tnum text-[1.9rem] font-extrabold text-[var(--text-primary)] leading-none">
                {data.continuity.assetsAwaitingReview}
              </p>
              <p className="text-[11.5px] text-[var(--text-secondary)]">Scheduled governance reviews not yet completed.</p>
            </button>

            <button
              onClick={() => navigate('/assets')}
              data-noglass
              className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 flex flex-col gap-1.5 text-left glow-on-hover cursor-pointer"
            >
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                Assets Requiring Reauthorization
              </p>
              <p className="tnum text-[1.9rem] font-extrabold text-[var(--text-primary)] leading-none">
                {data.continuity.assetsRequiringReauthorization}
              </p>
              <p className="text-[11.5px] text-[var(--text-secondary)]">In Reassessment Required governance state.</p>
            </button>

            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 flex flex-col gap-2">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                Governance State Mix
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.continuity.governanceStateBreakdown
                  .filter(s => s.count > 0)
                  .map(s => (
                    <div key={s.state} className="flex items-center gap-1">
                      <GovernanceStateBadge state={s.state as GovernanceState} size="sm" />
                      <span className="text-[11px] font-bold text-[var(--text-primary)]">{s.count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===================== EVIDENCE OVERVIEW (Release 3) ===================== */}
      {(shows('estate') || shows('summary') || shows('portfolio')) && (
        <section className="flex flex-col gap-4">
          <SectionHeader
            eyebrow="Release 3"
            title="Evidence Overview"
            subtitle="Ownership summary and evidence health snapshot — plain counts, no scoring."
            icon="🗃️"
            action={
              <button
                onClick={() => navigate('/evidence-registry')}
                className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                Open evidence registry →
              </button>
            }
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 flex flex-col gap-1.5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]">Total Evidence Records</p>
              <p className="tnum text-[1.9rem] font-extrabold text-[var(--text-primary)] leading-none">{data.evidence.totalEvidenceRecords}</p>
              <p className="text-[11.5px] text-[var(--text-secondary)]">{data.evidence.activeEvidenceRecords} currently Active</p>
            </div>
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 flex flex-col gap-1.5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]">Ownership Complete</p>
              <p className="tnum text-[1.9rem] font-extrabold text-[var(--text-primary)] leading-none">{data.evidence.ownershipComplete}</p>
              <p className="text-[11.5px] text-[var(--text-secondary)]">Evidence Owner + Approval Authority on record</p>
            </div>
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 flex flex-col gap-1.5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]">Expiring / Expired</p>
              <p className="tnum text-[1.9rem] font-extrabold text-[var(--text-primary)] leading-none">
                {data.evidence.expiringEvidenceCount + data.evidence.expiredEvidenceCount}
              </p>
              <p className="text-[11.5px] text-[var(--text-secondary)]">{data.evidence.expiringEvidenceCount} expiring soon · {data.evidence.expiredEvidenceCount} expired</p>
            </div>
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 flex flex-col gap-1.5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]">Assets Without Evidence</p>
              <p className="tnum text-[1.9rem] font-extrabold text-[var(--text-primary)] leading-none">{data.evidence.assetsWithNoEvidence}</p>
              <p className="text-[11.5px] text-[var(--text-secondary)]">No evidence record linked yet</p>
            </div>
          </div>
        </section>
      )}

      {/* ===================== READINESS OVERVIEW (Release 4) ===================== */}
      {(shows('estate') || shows('summary') || shows('portfolio')) && (
        <section className="flex flex-col gap-4">
          <SectionHeader
            eyebrow="Release 4"
            title="Readiness Overview"
            subtitle="Is governance complete and ready? Ready / Partially Ready / Not Ready — no scores."
            icon="✅"
            action={
              <button
                onClick={() => navigate('/dashboard')}
                className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                Open readiness summary →
              </button>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {([
              { label: 'Governance Readiness', rows: data.readiness.governance },
              { label: 'Evidence Readiness', rows: data.readiness.evidence },
              { label: 'Audit Readiness', rows: data.readiness.audit },
            ] as const).map(dim => (
              <div key={dim.label} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 flex flex-col gap-2">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]">{dim.label}</p>
                <div className="flex flex-col gap-1.5">
                  {dim.rows.map(row => (
                    <div key={row.status} className="flex items-center justify-between">
                      <ReadinessBadge status={row.status as ReadinessStatus} size="sm" />
                      <span className="text-[12px] font-bold text-[var(--text-primary)]">{row.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11.5px] text-[var(--text-secondary)]">
            {data.readiness.totalGaps} governance gaps detected across the portfolio.
          </p>
        </section>
      )}

      {/* ===================== DECISION SUMMARY ===================== */}
      {(shows('decisions') || shows('delivery') || shows('summary')) && (
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
            <SectionHeader
              title="Decision Summary"
              subtitle="Whether enterprise AI has been authorised to operate."
              icon="⚖️"
              action={
                <button
                  onClick={() => navigate('/decision-dashboard')}
                  className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
                >
                  Decision queue →
                </button>
              }
            />

            <ProgressMeter
              height={16}
              segments={[
                { label: 'GO', value: data.metrics.decisionBreakdown.GO, color: 'var(--status-success)' },
                {
                  label: 'CONDITIONAL GO',
                  value: data.metrics.decisionBreakdown['CONDITIONAL GO'],
                  color: 'var(--status-warning)',
                },
                {
                  label: 'NO-GO',
                  value: data.metrics.decisionBreakdown['NO GO'],
                  color: 'var(--status-danger)',
                },
                {
                  label: 'Awaiting',
                  value: data.metrics.decisionBreakdown.PENDING,
                  color: 'var(--status-info)',
                },
              ]}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <KpiCard
                label="Governance Health"
                value={`${data.health.score}`}
                caption={data.health.band}
                tone={data.health.score >= 70 ? 'success' : 'warning'}
              />
              <KpiCard
                label="Policy Compliance"
                value={`${data.policy.complianceRate}%`}
                caption={`${data.policy.activePolicies} active policies`}
                tone={data.policy.complianceRate >= 80 ? 'success' : 'warning'}
              />
              <KpiCard
                label="Open Violations"
                value={data.policy.openViolations}
                caption={`${data.policy.criticalViolations} critical`}
                tone={data.policy.openViolations === 0 ? 'success' : 'danger'}
              />
              <KpiCard
                label="Executive Alerts"
                value={data.alerts.length}
                caption="Requiring leadership attention"
                tone={data.alerts.length === 0 ? 'success' : 'warning'}
              />
            </div>
          </div>

          {/* Executive alert mix */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
            <SectionHeader title="Alert Composition" subtitle="What is driving the noise." icon="🔔" />
            <ul className="flex flex-col gap-2">
              {alertsByType.map(entry => (
                <li
                  key={entry.type}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl"
                  style={{ background: 'var(--bg-sunken)' }}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span aria-hidden>{ALERT_ICON[entry.type]}</span>
                    <span className="text-[12px] font-semibold text-[var(--text-secondary)] truncate">
                      {entry.type}
                    </span>
                  </span>
                  <span className="tnum text-[14px] font-extrabold text-[var(--text-primary)]">
                    {entry.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ===================== EXECUTIVE ALERTS ===================== */}
      {(shows('alerts') || shows('summary') || shows('violations')) && (
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
          <SectionHeader
            eyebrow="Workstream 1"
            title="Executive Alerts"
            subtitle="Critical risks, ownership gaps, policy violations and expired reviews."
            icon="🚨"
          />

          {data.alerts.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-[var(--text-muted)]">
              No executive-level alerts. Governance posture is clean.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {data.alerts.slice(0, 10).map(alert => (
                <li key={alert.id}>
                  <button
                    onClick={() => navigate(alert.actionPath)}
                    className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
                    data-noglass
                  >
                    <span
                      className="w-1.5 h-9 rounded-full shrink-0"
                      style={{ background: SEVERITY_COLOR[alert.severity] }}
                      aria-hidden
                    />
                    <span className="text-[13px] shrink-0" aria-hidden>
                      {ALERT_ICON[alert.type]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-semibold text-[var(--text-primary)] truncate">
                        {alert.assetName}
                      </span>
                      <span className="block text-[11px] text-[var(--text-muted)] truncate">
                        {alert.message}
                      </span>
                    </span>
                    <span
                      data-noglass
                      className="shrink-0 text-[9.5px] font-extrabold uppercase px-2 py-1 rounded-md border"
                      style={{
                        color: SEVERITY_COLOR[alert.severity],
                        borderColor: `color-mix(in srgb, ${SEVERITY_COLOR[alert.severity]} 45%, transparent)`,
                        background: `color-mix(in srgb, ${SEVERITY_COLOR[alert.severity]} 12%, transparent)`,
                      }}
                    >
                      {alert.severity}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {data.alerts.length > 10 && (
            <p className="text-[11px] text-[var(--text-muted)]">
              Showing the 10 highest-severity of {data.alerts.length} alerts.
            </p>
          )}
        </section>
      )}

      {/* ===================== RISK EXPOSURE (CRO) ===================== */}
      {shows('risk-exposure') && (
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
          <SectionHeader
            title="Risk Exposure by AI Category"
            subtitle="Where risk concentrates, and how healthy each concentration is."
            icon="🔥"
            action={
              <button
                onClick={() => navigate('/executive-heatmaps')}
                className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                All heatmaps →
              </button>
            }
          />
          <HeatmapMatrix rows={data.typeHeatmap} dimensionLabel="AI Category" />
        </section>
      )}

      {/* ===================== CRITICAL ASSETS (CRO) ===================== */}
      {shows('critical-assets') && (
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
          <SectionHeader
            title="Critical & High Risk Assets"
            subtitle="The assets that determine the enterprise risk position."
            icon="⚡"
          />

          <ul className="flex flex-col gap-1.5">
            {criticalAssets.map(asset => {
              const outcome = asset.decisionOutcome || 'PENDING';
              const approved = outcome === 'GO';
              return (
                <li
                  key={asset.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[var(--border-subtle)]"
                >
                  <span
                    className="w-1.5 h-9 rounded-full shrink-0"
                    style={{
                      background:
                        asset.riskLevel === 'Critical' ? 'var(--risk-critical)' : 'var(--risk-high)',
                    }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] font-semibold text-[var(--text-primary)] truncate">
                      {asset.name}
                    </span>
                    <span className="block text-[11px] text-[var(--text-muted)] truncate">
                      {asset.type} · {asset.department}
                    </span>
                  </span>
                  <span
                    data-noglass
                    className="shrink-0 text-[9.5px] font-extrabold uppercase px-2 py-1 rounded-md border"
                    style={{
                      color: approved ? 'var(--status-success)' : 'var(--status-danger)',
                      borderColor: approved
                        ? 'var(--status-success-border)'
                        : 'var(--status-danger-border)',
                      background: approved
                        ? 'var(--status-success-bg)'
                        : 'var(--status-danger-bg)',
                    }}
                  >
                    {outcome}
                  </span>
                </li>
              );
            })}
            {criticalAssets.length === 0 && (
              <li className="py-8 text-center text-[13px] text-[var(--text-muted)]">
                No High or Critical risk assets in the estate.
              </li>
            )}
          </ul>
        </section>
      )}

      {/* ===================== POLICY COMPLIANCE (Compliance) ============ */}
      {shows('policy-compliance') && (
        <section className="flex flex-col gap-4">
          <SectionHeader
            eyebrow="Workstream 3"
            title="Policy Compliance Position"
            subtitle="The rules that bind enterprise AI, and how well they hold."
            icon="📕"
            action={
              <button
                onClick={() => navigate('/policy-management')}
                className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                Policy registry →
              </button>
            }
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
            <KpiCard
              label="Active Policies"
              value={data.policy.activePolicies}
              caption={`${data.policy.mandatoryPolicies} mandatory`}
              icon="📕"
              tone="accent"
            />
            <KpiCard
              label="Policy Compliance Rate"
              value={`${data.policy.complianceRate}%`}
              caption="Active policies with no open breach"
              icon="✅"
              tone={data.policy.complianceRate >= 80 ? 'success' : 'warning'}
              progress={data.policy.complianceRate}
            />
            <KpiCard
              label="Open Violations"
              value={data.policy.openViolations}
              caption={`${data.policy.criticalViolations} critical severity`}
              icon="🚨"
              tone={data.policy.openViolations === 0 ? 'success' : 'danger'}
              onClick={() => navigate('/policy-violations')}
            />
            <KpiCard
              label="Policies Due For Review"
              value={data.policy.policiesDueForReview}
              caption="Past their scheduled review date"
              icon="📅"
              tone={data.policy.policiesDueForReview === 0 ? 'success' : 'warning'}
              onClick={() => navigate('/policy-management')}
            />
          </div>
        </section>
      )}

      {/* ===================== SCORECARDS ===================== */}
      {(shows('scorecards') || shows('delivery') || shows('regulatory-readiness')) && (
        <section className="flex flex-col gap-4">
          <SectionHeader
            eyebrow="Workstream 2"
            title="Governance Scorecards"
            subtitle="Ownership, risk, validation, evidence and decision readiness at a glance."
            icon="🗂️"
            action={
              <button
                onClick={() => navigate('/governance-scorecards')}
                className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                Full scorecards →
              </button>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 stagger">
            {data.scorecards.map(scorecard => (
              <ScorecardPanel key={scorecard.id} scorecard={scorecard} compact />
            ))}
          </div>
        </section>
      )}

      {/* ===================== TRENDS ===================== */}
      {shows('trends') && (
        <section className="flex flex-col gap-4">
          <SectionHeader
            eyebrow="Workstream 7"
            title="Governance Trends"
            subtitle="Direction of travel over the last six months."
            icon="📈"
            action={
              <button
                onClick={() => navigate('/governance-insights')}
                className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                All insights →
              </button>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 stagger">
            {data.trends.slice(0, 3).map(series => (
              <TrendChart key={series.id} series={series} />
            ))}
          </div>
        </section>
      )}

      {/* ===================== INSIGHTS ===================== */}
      {(shows('insights') || shows('reviews')) && (
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
          <SectionHeader
            eyebrow="Workstream 7"
            title="Executive Insights"
            subtitle="The shortest path from posture to action."
            icon="💡"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {data.insights.slice(0, 6).map(insight => (
              <button
                key={insight.id}
                onClick={() => navigate(insight.actionPath)}
                data-noglass
                className="text-left flex items-center gap-3 px-3.5 py-3 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
              >
                <span
                  className="tnum shrink-0 w-11 h-11 grid place-items-center rounded-xl text-[15px] font-extrabold border"
                  style={{
                    color: SEVERITY_COLOR[insight.severity],
                    borderColor: `color-mix(in srgb, ${SEVERITY_COLOR[insight.severity]} 40%, transparent)`,
                    background: `color-mix(in srgb, ${SEVERITY_COLOR[insight.severity]} 12%, transparent)`,
                  }}
                >
                  {insight.count}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-bold text-[var(--text-primary)]">
                    {insight.title}
                  </span>
                  <span className="block text-[11px] text-[var(--text-muted)] leading-snug mt-0.5">
                    {insight.detail}
                  </span>
                </span>
                <span className="shrink-0 text-[10.5px] font-bold text-[var(--accent-primary)]">
                  {insight.actionLabel} →
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ===================== REGULATORY READINESS (Board) ============== */}
      {shows('regulatory-readiness') && (
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
          <SectionHeader
            eyebrow="Workstream 8"
            title="Regulatory Readiness"
            subtitle="Whether the enterprise can prove governance was applied."
            icon="📜"
            action={
              <button
                onClick={() => navigate('/board-reporting')}
                className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                Generate board pack →
              </button>
            }
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <KpiCard
              label="Evidence Artefacts"
              value={data.metrics.totalEvidenceCount}
              caption="Filed against governed assets"
              tone="info"
            />
            <KpiCard
              label="Compliance Score"
              value={`${data.metrics.tenantComplianceScore}%`}
              caption={`RBI alignment ${data.metrics.rbiAlignmentPercentage}%`}
              tone={data.metrics.tenantComplianceScore >= 80 ? 'success' : 'warning'}
            />
            <KpiCard
              label="Outstanding Actions"
              value={data.metrics.openCorrectiveActionsCount + data.metrics.openFindingsCount}
              caption="Corrective actions and findings"
              tone="warning"
            />
            <KpiCard
              label="Governance Blockers"
              value={data.metrics.totalBlockersCount}
              caption="Preventing production decisions"
              tone={data.metrics.totalBlockersCount === 0 ? 'success' : 'danger'}
            />
          </div>

          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            Prepared for {currentUser?.name || 'the executive team'} under the {view.audience} lens.
            Every figure on this page is derived from the immutable governance record and can be
            evidenced on demand.
          </p>
        </section>
      )}
    </div>
  );
};
