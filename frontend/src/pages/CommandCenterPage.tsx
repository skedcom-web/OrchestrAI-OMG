import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ScoreRing } from '../components/ui/ScoreRing';
import { ProgressMeter } from '../components/ui/ProgressMeter';
import { GovernanceJourney } from '../components/governance/GovernanceJourney';
import { RiskHeatmap } from '../components/governance/RiskHeatmap';
import { DecisionQueue } from '../components/governance/DecisionQueue';
import { PortfolioSummary } from '../components/governance/PortfolioSummary';
import { useAuth } from '../contexts/AuthContext';
import { useExperience } from '../contexts/ExperienceContext';
import { getAssets, getGovernanceAlerts, getGovernanceMetrics } from '../services/storageService';
import {
  getComplianceReadiness,
  getExecutiveKpis,
  getGovernanceJourney,
  getPortfolioReadinessScore,
  getPortfolioSummary,
  getRiskHeatmap,
} from '../services/governanceIntelligence';
import { NAV_DOMAINS } from '../config/navigation';

const RISK_RANK: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };

export const CommandCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, currentPersona, hasPermission } = useAuth();
  const { isExecutive } = useExperience();

  const {
    kpis,
    metrics,
    journey,
    heatmap,
    readiness,
    complianceReadiness,
    portfolio,
    pendingAssets,
    alerts,
  } = useMemo(() => {
    const assets = getAssets();
    return {
      kpis: getExecutiveKpis(),
      metrics: getGovernanceMetrics(),
      journey: getGovernanceJourney(),
      heatmap: getRiskHeatmap(),
      readiness: getPortfolioReadinessScore(),
      complianceReadiness: getComplianceReadiness(),
      portfolio: getPortfolioSummary(),
      alerts: getGovernanceAlerts(),
      pendingAssets: assets
        .filter(a => !a.decisionOutcome || a.decisionOutcome === 'PENDING')
        .sort((a, b) => (RISK_RANK[b.riskLevel] || 0) - (RISK_RANK[a.riskLevel] || 0))
        .slice(0, 5),
    };
  }, []);

  const firstName = currentUser?.name?.split(' ')[0] || 'there';
  const readinessTier =
    readiness.score >= 85
      ? 'Audit Ready'
      : readiness.score >= 70
        ? 'Substantially Ready'
        : readiness.score >= 50
          ? 'Review Required'
          : 'Not Ready';

  return (
    <div className="flex flex-col gap-8 pb-4">
      {/* ================= HERO — Enterprise Governance Command Center ============ */}
      <section
        className="relative overflow-hidden rounded-3xl border border-[var(--border-color)] sheen"
        style={{ background: 'var(--grad-hero)' }}
      >
        <div className="absolute inset-0 enterprise-grid opacity-60 pointer-events-none" aria-hidden />
        <div
          className="absolute -right-24 -top-24 w-[26rem] h-[26rem] rounded-full pointer-events-none"
          style={{ background: 'var(--grad-brand)', opacity: 0.12, filter: 'blur(60px)' }}
          aria-hidden
        />

        <div className="relative p-7 sm:p-9 flex flex-col xl:flex-row xl:items-center gap-8">
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <span
              data-noglass
              className="inline-flex items-center gap-2 w-fit px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-[0.12em] bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-border)]"
            >
              <span className="status-pulse" />
              Live Governance Posture · {currentPersona?.title || 'Super Admin'}
            </span>

            <div>
              <h1 className="text-[2rem] sm:text-[2.6rem] font-extrabold leading-[1.08] text-[var(--text-primary)]">
                Enterprise Governance
                <br />
                <span className="text-gradient-brand">Command Center</span>
              </h1>
              <p className="mt-3 text-[15px] font-semibold text-[var(--text-secondary)] leading-relaxed">
                Govern Every AI. <span className="text-[var(--text-muted)]">·</span> Control Every
                Decision. <span className="text-[var(--text-muted)]">·</span> Prove Every Outcome.
              </p>
              <p className="mt-2 text-[13px] text-[var(--text-muted)]">
                Welcome back, {firstName}. {metrics.totalAssets} AI assets are under governance
                across {new Set(getAssets().map(a => a.department)).size} business domains.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={() => navigate('/decision-workbench-v4')}
                className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                style={{ background: 'var(--grad-brand)' }}
              >
                Open Decision Authority
              </button>
              <button
                onClick={() => navigate('/assets')}
                data-noglass
                className="px-4 py-2.5 rounded-xl text-[13px] font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-border)] transition-all cursor-pointer"
              >
                AI Asset Registry
              </button>
              <button
                onClick={() => navigate('/governance-alerts')}
                data-noglass
                className="px-4 py-2.5 rounded-xl text-[13px] font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-border)] transition-all cursor-pointer flex items-center gap-2"
              >
                Governance Alerts
                {alerts.length > 0 && (
                  <span
                    className="tnum text-[10px] font-extrabold px-1.5 py-0.5 rounded-md text-white"
                    style={{ background: 'var(--status-danger)' }}
                  >
                    {alerts.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Governance Readiness gauge */}
          <div
            data-noglass
            className="shrink-0 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/70 backdrop-blur-sm p-5 flex items-center gap-5"
          >
            <ScoreRing score={readiness.score} label="Readiness" caption={readinessTier} />
            <div className="flex flex-col gap-2 min-w-[10rem]">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Governance Readiness
              </p>
              {readiness.pillars.map(pillar => (
                <div key={pillar.label} className="flex items-center gap-2">
                  <span className="text-[10.5px] font-semibold text-[var(--text-secondary)] w-[4.6rem] shrink-0">
                    {pillar.label}
                  </span>
                  <span
                    className="flex-1 h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'var(--bg-sunken)' }}
                  >
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${pillar.score}%`,
                        background:
                          pillar.score >= 80
                            ? 'var(--status-success)'
                            : pillar.score >= 60
                              ? 'var(--status-warning)'
                              : 'var(--status-danger)',
                      }}
                    />
                  </span>
                  <span className="tnum text-[10px] font-bold text-[var(--text-primary)] w-6 text-right">
                    {pillar.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= EXECUTIVE KPI CARDS ================================== */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          eyebrow="Phase 8B"
          title="Executive Governance Indicators"
          subtitle="The eight measures that determine whether enterprise AI is under control."
          icon="◎"
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
          <KpiCard
            label="Total Governed Assets"
            value={kpis.totalGovernedAssets}
            caption="Registered across the enterprise"
            icon="🗂️"
            tone="accent"
            onClick={() => navigate('/assets')}
          />
          <KpiCard
            label="Production Approved"
            value={kpis.productionApprovedAssets}
            caption={`${kpis.totalGovernedAssets > 0 ? Math.round((kpis.productionApprovedAssets / kpis.totalGovernedAssets) * 100) : 0}% of portfolio live`}
            icon="🚀"
            tone="success"
            progress={
              kpis.totalGovernedAssets > 0
                ? (kpis.productionApprovedAssets / kpis.totalGovernedAssets) * 100
                : 0
            }
            onClick={() => navigate('/operations-dashboard')}
          />
          <KpiCard
            label="High Risk Assets"
            value={kpis.highRiskAssets}
            caption={`${metrics.highRiskUnapprovedCount} without a GO decision`}
            icon="⚡"
            tone="danger"
            onClick={() => navigate('/risk')}
          />
          <KpiCard
            label="Pending Reviews"
            value={kpis.pendingReviews}
            caption="Scheduled and in-flight reviews"
            icon="📅"
            tone="warning"
            onClick={() => navigate('/review-calendar')}
          />
          <KpiCard
            label="Governance Blockers"
            value={kpis.governanceBlockers}
            caption="Hard stops preventing production"
            icon="🧱"
            tone="danger"
            onClick={() => navigate('/governance-blockers')}
          />
          <KpiCard
            label="Active Decisions"
            value={kpis.activeDecisions}
            caption="Pending or conditional authority"
            icon="⚖️"
            tone="info"
            onClick={() => navigate('/decision-dashboard')}
          />
          <KpiCard
            label="Compliance Health"
            value={`${kpis.complianceHealth}%`}
            caption={`RBI alignment ${metrics.rbiAlignmentPercentage}%`}
            icon="🏛️"
            tone={kpis.complianceHealth >= 80 ? 'success' : kpis.complianceHealth >= 60 ? 'warning' : 'danger'}
            progress={kpis.complianceHealth}
            onClick={() => navigate('/compliance-dashboard')}
          />
          <KpiCard
            label="Audit Readiness"
            value={`${kpis.auditReadiness}%`}
            caption={`${metrics.totalEvidenceCount} evidence artefacts filed`}
            icon="📜"
            tone={kpis.auditReadiness >= 80 ? 'success' : kpis.auditReadiness >= 60 ? 'warning' : 'danger'}
            progress={kpis.auditReadiness}
            onClick={() => navigate('/audit-logs')}
          />
        </div>
      </section>

      {/* ================= GOVERNANCE JOURNEY (8C) ============================== */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          eyebrow="Phase 8C"
          title="Governance Journey"
          subtitle="Every AI asset travels the same eight-stage path from registration to continuous monitoring."
          icon="🛤️"
          action={
            <button
              onClick={() => navigate('/asset-lifecycle')}
              className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
            >
              Open Asset Lifecycle →
            </button>
          }
        />
        <GovernanceJourney stages={journey} />
      </section>

      {/* ================= RISK HEATMAP + DECISION QUEUE ======================== */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
          <SectionHeader
            title="Executive Risk Heatmap"
            subtitle="Where risk concentrates across the AI portfolio."
            icon="🔥"
          />
          <RiskHeatmap rows={heatmap} />
        </div>

        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
          <SectionHeader
            title="Executive Decision Queue"
            subtitle="GO, CONDITIONAL GO and NO GO status across the portfolio."
            icon="⚖️"
          />
          <DecisionQueue breakdown={metrics.decisionBreakdown} pendingAssets={pendingAssets} />
        </div>
      </section>

      {/* ================= COMPLIANCE READINESS + HEALTH (8F) =================== */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-5">
          <SectionHeader
            title="Compliance Readiness Meter"
            subtitle="Regulatory standing of every governed asset, right now."
            icon="🏛️"
            action={
              <button
                onClick={() => navigate('/compliance-center')}
                className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                Compliance Center →
              </button>
            }
          />

          <ProgressMeter
            height={16}
            segments={[
              { label: 'Audit Ready', value: complianceReadiness.auditReady, color: 'var(--status-success)' },
              { label: 'Review Required', value: complianceReadiness.reviewRequired, color: 'var(--status-warning)' },
              { label: 'Non-Compliant', value: complianceReadiness.nonCompliant, color: 'var(--status-danger)' },
            ]}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {[
              { label: 'Governance Health', value: `${metrics.tenantGovernanceHealthScore}%`, tone: 'var(--status-info)' },
              { label: 'Healthy Assets', value: metrics.healthyAssetsCount, tone: 'var(--status-success)' },
              { label: 'Watchlist', value: metrics.watchlistAssetsCount, tone: 'var(--status-warning)' },
              { label: 'Attention Required', value: metrics.attentionRequiredAssetsCount, tone: 'var(--status-danger)' },
            ].map(item => (
              <div
                key={item.label}
                data-noglass
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)] px-3 py-2.5"
              >
                <p className="tnum text-xl font-extrabold leading-none" style={{ color: item.tone }}>
                  {item.value}
                </p>
                <p className="text-[10px] font-semibold text-[var(--text-muted)] mt-1.5 leading-tight">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
          <SectionHeader
            title="Open Governance Exposure"
            subtitle="What must be closed before the next audit."
            icon="🚨"
          />

          <ul className="flex flex-col gap-2">
            {[
              { label: 'Open Findings', value: metrics.openFindingsCount, path: '/findings', tone: 'var(--status-warning)' },
              { label: 'Compliance Gaps', value: metrics.openComplianceGapsCount, path: '/compliance-findings', tone: 'var(--status-danger)' },
              { label: 'Open Incidents', value: metrics.openIncidentsCount, path: '/incidents', tone: 'var(--status-danger)' },
              { label: 'Corrective Actions', value: metrics.openCorrectiveActionsCount, path: '/corrective-actions', tone: 'var(--status-info)' },
              { label: 'Suspended Assets', value: metrics.suspendedAssetsCount, path: '/operations-center', tone: 'var(--status-neutral)' },
              { label: 'Active Alerts', value: metrics.activeGovernanceAlertsCount, path: '/governance-alerts', tone: 'var(--status-warning)' },
            ]
              .filter(item => hasPermission(item.path))
              .map(item => (
                <li key={item.label}>
                  <button
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
                    data-noglass
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: item.tone }}
                        aria-hidden
                      />
                      <span className="text-[12px] font-semibold text-[var(--text-secondary)] truncate">
                        {item.label}
                      </span>
                    </span>
                    <span className="tnum text-[14px] font-extrabold" style={{ color: item.tone }}>
                      {item.value}
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      </section>

      {/* ================= AI PORTFOLIO SUMMARY (8F) ============================ */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          eyebrow="Phase 8F"
          title="AI Portfolio Summary"
          subtitle="What kinds of artificial intelligence the enterprise actually runs."
          icon="🧭"
          action={
            <button
              onClick={() => navigate('/assets')}
              className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
            >
              Full Registry →
            </button>
          }
        />
        <PortfolioSummary groups={portfolio} />
      </section>

      {/* ================= GOVERNANCE DOMAINS (8A) ============================= */}
      {!isExecutive && (
        <section className="flex flex-col gap-4">
          <SectionHeader
            eyebrow="Phase 8A"
            title="Governance Domains"
            subtitle="OMG is organised around six governance questions, not a list of features."
            icon="🗺️"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 stagger">
            {NAV_DOMAINS.map(domain => {
              const authorised = domain.modules.filter(m => hasPermission(m.path));
              if (authorised.length === 0) return null;

              return (
                <div
                  key={domain.id}
                  className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 flex flex-col gap-3"
                >
                  <div className="flex items-start gap-3">
                    <span
                      data-noglass
                      className="w-9 h-9 grid place-items-center rounded-xl text-base shrink-0 border"
                      style={{
                        background: `color-mix(in srgb, ${domain.accent} 14%, transparent)`,
                        borderColor: `color-mix(in srgb, ${domain.accent} 40%, transparent)`,
                      }}
                    >
                      {domain.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[var(--text-primary)] leading-tight">
                        {domain.label}
                      </p>
                      <p className="text-[11px] italic text-[var(--text-muted)] mt-0.5">
                        {domain.question}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {authorised.slice(0, 5).map(module => (
                      <button
                        key={module.path}
                        onClick={() => navigate(module.path)}
                        data-noglass
                        className="text-[10.5px] font-semibold px-2 py-1 rounded-lg bg-[var(--bg-badge)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-border)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                      >
                        {module.label}
                      </button>
                    ))}
                    {authorised.length > 5 && (
                      <span className="text-[10.5px] font-semibold px-2 py-1 text-[var(--text-muted)]">
                        +{authorised.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
