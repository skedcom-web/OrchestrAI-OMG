import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MetricCard } from '../components/ui/MetricCard';
import { RiskBadge, OversightBadge, GovernanceStateBadge, ClassificationBadge, EvidenceStatusBadge, ReadinessBadge, ComplianceCoverageBadge, GovernancePolicySeverityBadge, RecommendedActionStatusBadge } from '../components/ui/Badge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { getGovernanceMetrics, getExecutiveKpiSummary, getAssets, getAuditLogs, getEvidenceRecords, getAllGovernanceGaps, getAllPackGaps, getAllSourceGaps, getModels, getKnowledgeAssets, getPrompts, getTools, getGovernanceControls, getCertificationRecords, getScheduledReviews } from '../services/storageService';
import { computeReauthorizationStatus } from '../config/governanceContinuity';
import { OVERSIGHT_TYPES, AUTONOMY_LEVELS } from '../config/governanceAuthority';
import { GOVERNANCE_STATES, GOVERNANCE_CLASSIFICATIONS } from '../config/governanceContinuity';
import { EVIDENCE_TYPES, EVIDENCE_STATUSES, getExpiryIndicator, evidenceEntityRef } from '../config/evidenceFoundation';
import type { AssetType, RiskLevel, HumanOversightType, ReadinessStatus, ComplianceCoverageStatus, RecommendedActionStatus } from '../types';

const READINESS_ORDER: ReadinessStatus[] = ['Ready', 'Partially Ready', 'Not Ready'];
const COVERAGE_ORDER: ComplianceCoverageStatus[] = ['Covered', 'Partially Covered', 'Not Covered', 'Not Applicable'];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics] = useState(() => getGovernanceMetrics());
  const [kpis] = useState(() => getExecutiveKpiSummary());
  const [assets] = useState(() => getAssets());
  const [auditLogs] = useState(() => getAuditLogs().slice(0, 5));
  const [evidenceRecords] = useState(() => getEvidenceRecords());
  const [gaps] = useState(() => getAllGovernanceGaps());
  const [packGaps] = useState(() => getAllPackGaps());
  const [sourceGaps] = useState(() => getAllSourceGaps());
  const [models] = useState(() => getModels());
  const [knowledgeAssets] = useState(() => getKnowledgeAssets());
  const [prompts] = useState(() => getPrompts());
  const [tools] = useState(() => getTools());
  const [controls] = useState(() => getGovernanceControls());
  const [certRecords] = useState(() => getCertificationRecords());

  const overdueAssets = assets.filter(a => ['Overdue', 'Expired'].includes(computeReauthorizationStatus(a.nextReviewDate)));
  const overdueScheduledReviews = getScheduledReviews().filter(r => r.status === 'Overdue');
  const pendingApprovalItems = [
    ...assets.filter(a => !a.decisionOutcome || a.decisionOutcome === 'PENDING').map(a => ({ name: a.name, kind: 'Asset' })),
    ...models.filter(m => m.decisionOutcome === 'PENDING').map(m => ({ name: m.name, kind: 'Model' })),
    ...knowledgeAssets.filter(k => k.decisionOutcome === 'PENDING').map(k => ({ name: k.name, kind: 'Knowledge Asset' })),
    ...prompts.filter(p => p.decisionOutcome === 'PENDING').map(p => ({ name: p.name, kind: 'Prompt' })),
    ...tools.filter(t => t.decisionOutcome === 'PENDING').map(t => ({ name: t.name, kind: 'Tool' })),
  ];

  const expiringOrExpiredEvidence = evidenceRecords
    .filter(e => {
      const indicator = getExpiryIndicator(e.expiryDate);
      return indicator === 'Expiring Soon' || indicator === 'Expired';
    })
    .slice(0, 5);

  const assetTypeKeys = Object.keys(metrics.assetsByType) as AssetType[];

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Executive Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Enterprise AI Governance Single Pane of Glass
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => navigate('/assets')}>
            View Registry
          </Button>
          <Button onClick={() => navigate('/decision-workbench-v4')}>
            Decision Authority Center
          </Button>
        </div>
      </div>

      {/* R20.1 — Governance Command Center KPIs (Part 4) */}
      <div>
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">Governance Command Center</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <MetricCard title="Total Governed Entities" value={kpis.totalGovernedEntities} icon={<span className="text-lg">🗂️</span>} />
          <MetricCard title="Governance Readiness" value={`${kpis.governanceReadinessScorePct}%`} icon={<span className="text-lg">🛡️</span>} trendType={kpis.governanceReadinessScorePct >= 70 ? 'positive' : kpis.governanceReadinessScorePct >= 40 ? 'neutral' : 'negative'} />
          <MetricCard title="Evidence Completeness" value={`${kpis.evidenceCompletenessPct}%`} icon={<span className="text-lg">🧾</span>} trendType={kpis.evidenceCompletenessPct >= 70 ? 'positive' : kpis.evidenceCompletenessPct >= 40 ? 'neutral' : 'negative'} />
          <MetricCard title="Approval Backlog" value={kpis.approvalBacklog} icon={<span className="text-lg">⏳</span>} trendType={kpis.approvalBacklog === 0 ? 'positive' : 'negative'} />
          <MetricCard title="Open Findings" value={kpis.openFindings} icon={<span className="text-lg">⚠️</span>} trendType={kpis.openFindings === 0 ? 'positive' : 'negative'} />
          <MetricCard title="Open Corrective Actions" value={kpis.openCorrectiveActions} icon={<span className="text-lg">🛠️</span>} trendType={kpis.openCorrectiveActions === 0 ? 'positive' : 'negative'} />
          <MetricCard title="Overdue Reviews" value={kpis.overdueReviews} icon={<span className="text-lg">📅</span>} trendType={kpis.overdueReviews === 0 ? 'positive' : 'negative'} />
          <MetricCard title="Certification Readiness" value={`${kpis.certificationReadinessPct}%`} icon={<span className="text-lg">🏆</span>} subtitle={`${kpis.activeCertifications} active certifications`} trendType={kpis.certificationReadinessPct >= 70 ? 'positive' : kpis.certificationReadinessPct >= 40 ? 'neutral' : 'negative'} />
          <MetricCard title="Control Effectiveness" value={`${kpis.controlEffectivenessPct}%`} icon={<span className="text-lg">🧱</span>} trendType={kpis.controlEffectivenessPct >= 70 ? 'positive' : kpis.controlEffectivenessPct >= 40 ? 'neutral' : 'negative'} />
          <MetricCard title="Governance Trend" value={kpis.governanceTrend} icon={<span className="text-lg">📈</span>} trendType={kpis.governanceTrend === 'Positive' ? 'positive' : kpis.governanceTrend === 'Stable' ? 'neutral' : 'negative'} />
        </div>
      </div>

      {/* R20.1 — Executive Widgets (Part 4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">What Exists</p>
          <div className="flex flex-col gap-1.5 text-xs">
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">AI Assets</span><span className="font-bold text-[var(--text-primary)] tnum">{assets.length}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Models</span><span className="font-bold text-[var(--text-primary)] tnum">{models.length}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Knowledge Assets</span><span className="font-bold text-[var(--text-primary)] tnum">{knowledgeAssets.length}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Prompts</span><span className="font-bold text-[var(--text-primary)] tnum">{prompts.length}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Tools</span><span className="font-bold text-[var(--text-primary)] tnum">{tools.length}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Controls</span><span className="font-bold text-[var(--text-primary)] tnum">{controls.length}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Certifications</span><span className="font-bold text-[var(--text-primary)] tnum">{certRecords.length}</span></div>
          </div>
        </Card>

        <Card>
          <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">What Needs Attention</p>
          {gaps.length === 0 ? <p className="text-xs text-[var(--text-muted)]">No governance gaps detected.</p> : (
            <div className="flex flex-col gap-2">
              {gaps.slice(0, 5).map((g, i) => (
                <button key={i} onClick={() => navigate('/governance-readiness')} className="text-left text-xs">
                  <span className="font-bold text-[var(--text-primary)] block truncate">{g.assetName}</span>
                  <span className="text-[var(--text-muted)]">{g.gapType}</span>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">What Is Overdue</p>
          {overdueAssets.length === 0 && overdueScheduledReviews.length === 0 ? <p className="text-xs text-[var(--text-muted)]">Nothing overdue.</p> : (
            <div className="flex flex-col gap-2">
              {overdueAssets.slice(0, 3).map(a => (
                <button key={a.id} onClick={() => navigate('/agent-monitoring')} className="text-left text-xs">
                  <span className="font-bold text-[var(--text-primary)] block truncate">{a.name}</span>
                  <span className="text-[var(--text-muted)]">Reauthorization overdue</span>
                </button>
              ))}
              {overdueScheduledReviews.slice(0, 3).map(r => (
                <button key={r.id} onClick={() => navigate('/review-calendar')} className="text-left text-xs">
                  <span className="font-bold text-[var(--text-primary)] block truncate">{r.assetName}</span>
                  <span className="text-[var(--text-muted)]">{r.reviewType} overdue</span>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">What Is Pending Approval</p>
          {pendingApprovalItems.length === 0 ? <p className="text-xs text-[var(--text-muted)]">No approvals pending.</p> : (
            <div className="flex flex-col gap-2">
              {pendingApprovalItems.slice(0, 5).map((item, i) => (
                <div key={i} className="text-xs">
                  <span className="font-bold text-[var(--text-primary)] block truncate">{item.name}</span>
                  <span className="text-[var(--text-muted)]">{item.kind}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">What Is Expiring</p>
          {expiringOrExpiredEvidence.length === 0 ? <p className="text-xs text-[var(--text-muted)]">No evidence expiring soon.</p> : (
            <div className="flex flex-col gap-2">
              {expiringOrExpiredEvidence.slice(0, 5).map(e => (
                <div key={e.id} className="text-xs">
                  <span className="font-bold text-[var(--text-primary)] block truncate">{e.name}</span>
                  <span className="text-[var(--text-muted)]">Expires {e.expiryDate}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">Highest Risk Areas</p>
          <div className="flex flex-col gap-1.5 text-xs">
            {(['Critical', 'High', 'Medium', 'Low'] as const).map(level => (
              <div key={level} className="flex justify-between"><span className="text-[var(--text-secondary)]">{level} Risk</span><span className="font-bold text-[var(--text-primary)] tnum">{metrics.riskBreakdown[level]}</span></div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">Recent Governance Changes</p>
          <div className="flex flex-col gap-2">
            {auditLogs.map(log => (
              <div key={log.id} className="text-xs">
                <span className="font-bold text-[var(--text-primary)] block truncate">{log.action}</span>
                <span className="text-[var(--text-muted)]">{log.entityName} — {log.timestamp}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Governed AI Assets"
          value={metrics.totalAssets}
          subtitle="Enterprise Inventory"
          trend="100% Registry Coverage"
          trendType="positive"
          icon={<span className="text-xl">🗂️</span>}
        />
        <MetricCard
          title="High & Critical Risk"
          value={metrics.riskBreakdown['High'] + metrics.riskBreakdown['Critical']}
          subtitle={`${metrics.riskBreakdown['Critical']} Critical • ${metrics.riskBreakdown['High']} High`}
          trend={`${metrics.highRiskUnapprovedCount} Require Approval`}
          trendType="negative"
          icon={<span className="text-xl">⚠️</span>}
        />
        <MetricCard
          title="Ownership Matrix Rate"
          value={`${metrics.ownershipCompletionRate}%`}
          subtitle="Full 5-Role Accountability"
          trend="Target: 100%"
          trendType="positive"
          icon={<span className="text-xl">👥</span>}
        />
        <MetricCard
          title="Approved GO Decisions"
          value={metrics.decisionBreakdown['GO']}
          subtitle={`${metrics.decisionBreakdown['CONDITIONAL GO']} Conditional • ${metrics.decisionBreakdown['NO GO']} Blocked`}
          trend="Human-Decided, Governance-Informed"
          trendType="positive"
          icon={<span className="text-xl">⚖️</span>}
        />
      </div>

      {/* Main Grid: Asset Breakdown & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Asset Inventory Breakdown */}
        <Card className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">AI Asset Class Inventory</h3>
              <p className="text-xs text-[var(--text-secondary)]">Distribution across 9 supported asset types</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate('/assets')}>
              View All →
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {assetTypeKeys.map(type => {
              const count = metrics.assetsByType[type] || 0;
              const pct = metrics.totalAssets > 0 ? Math.round((count / metrics.totalAssets) * 100) : 0;
              return (
                <div key={type} className="p-3.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-primary)] truncate">{type}</span>
                    <span className="text-xs font-black text-[var(--accent-primary)]">{count}</span>
                  </div>
                  <div className="w-full bg-[var(--bg-card)] h-2 rounded-full overflow-hidden border border-[var(--border-color)]">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-red-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)]">{pct}% of total</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right: Risk Tiers Breakdown */}
        <Card className="flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Risk Tier Profile</h3>
            <p className="text-xs text-[var(--text-secondary)]">Governance risk level distribution</p>
          </div>

          <div className="flex flex-col gap-4">
            {(['Critical', 'High', 'Medium', 'Low'] as RiskLevel[]).map(tier => {
              const count = metrics.riskBreakdown[tier] || 0;
              const pct = metrics.totalAssets > 0 ? Math.round((count / metrics.totalAssets) * 100) : 0;
              return (
                <div key={tier} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <RiskBadge level={tier} size="sm" />
                    </div>
                    <span className="text-[var(--text-primary)] font-bold">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[var(--bg-badge)] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        tier === 'Critical' ? 'bg-red-500' :
                        tier === 'High' ? 'bg-orange-500' :
                        tier === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto p-4 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-border)]">
            <h4 className="text-xs font-bold text-[var(--accent-primary)] uppercase tracking-wider">
              Governance Readiness
            </h4>
            <p className="text-xs text-[var(--text-primary)] mt-1">
              Readiness is tracked and surfaced before every production decision — informing human judgment, never replacing it.
            </p>
          </div>
        </Card>
      </div>

      {/* Release 1 — Governance Authority Foundation: Oversight & Autonomy Exposure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Assets by Oversight Model</h3>
            <p className="text-xs text-[var(--text-secondary)]">Human Oversight Classification across the portfolio</p>
          </div>
          <div className="flex flex-col gap-3">
            {OVERSIGHT_TYPES.map(o => {
              const count = metrics.oversightBreakdown[o.type as HumanOversightType] || 0;
              const pct = metrics.totalAssets > 0 ? Math.round((count / metrics.totalAssets) * 100) : 0;
              return (
                <div key={o.type} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <OversightBadge type={o.type} size="sm" />
                    <span className="text-[var(--text-primary)] font-bold">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[var(--bg-badge)] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Assets by Autonomy Level</h3>
            <p className="text-xs text-[var(--text-secondary)]">Autonomy Classification, Level 0 (No AI) through Level 5 (High Autonomy)</p>
          </div>
          <div className="flex flex-col gap-2.5">
            {AUTONOMY_LEVELS.map(a => {
              const count = metrics.autonomyBreakdown[a.level] || 0;
              const pct = metrics.totalAssets > 0 ? Math.round((count / metrics.totalAssets) * 100) : 0;
              return (
                <div key={a.level} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-[var(--text-secondary)]">{a.label}</span>
                    <span className="text-[var(--text-primary)] font-bold">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[var(--bg-badge)] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${a.level >= 4 ? 'bg-red-500' : a.level >= 2 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Release 2 — Governance Continuity Foundation: State, Classification & Continuity Load */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Assets by Governance State</h3>
            <p className="text-xs text-[var(--text-secondary)]">Whether each asset's authorization remains valid — under the governance continuity model</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {GOVERNANCE_STATES.map(s => {
              const count = metrics.governanceStateBreakdown[s.state] || 0;
              return (
                <div key={s.state} className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-1.5">
                  <GovernanceStateBadge state={s.state} size="sm" />
                  <span className="text-lg font-black text-[var(--text-primary)]">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="pt-3 border-t border-[var(--border-color)]">
            <h4 className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider mb-2">Assets by Governance Classification</h4>
            <div className="flex flex-wrap gap-2">
              {GOVERNANCE_CLASSIFICATIONS.map(c => (
                <div key={c.value} className="flex items-center gap-1.5">
                  <ClassificationBadge classification={c.value} size="sm" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">{metrics.governanceClassificationBreakdown[c.value] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Governance Continuity Load</h3>
            <p className="text-xs text-[var(--text-secondary)]">Open work keeping authorizations current</p>
          </div>
          <button
            onClick={() => navigate('/assets')}
            className="p-4 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] text-left hover:border-[var(--accent-border)] transition-all cursor-pointer"
          >
            <span className="text-xs font-semibold text-[var(--text-muted)]">Reassessments Due</span>
            <p className="text-2xl font-black text-[var(--text-primary)] mt-0.5">{metrics.reassessmentsDueCount}</p>
            <span className="text-[10px] text-[var(--text-muted)]">Open or under-review triggers</span>
          </button>
          <button
            onClick={() => navigate('/review-calendar')}
            className="p-4 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] text-left hover:border-[var(--accent-border)] transition-all cursor-pointer"
          >
            <span className="text-xs font-semibold text-[var(--text-muted)]">Reviews Due</span>
            <p className="text-2xl font-black text-[var(--text-primary)] mt-0.5">{metrics.reviewsDueCount}</p>
            <span className="text-[10px] text-[var(--text-muted)]">Not yet completed</span>
          </button>
        </Card>
      </div>

      {/* Release 3 — Evidence Foundation: Type, Status & Expiry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Evidence by Type & Status</h3>
              <p className="text-xs text-[var(--text-secondary)]">Universal governance evidence registry, {evidenceRecords.length} records</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate('/evidence-registry')}>
              Open Registry →
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {EVIDENCE_TYPES.map(t => {
              const count = metrics.evidenceRecordsByType[t.type] || 0;
              return (
                <div key={t.type} className="p-2.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] truncate">{t.icon} {t.type}</span>
                  <span className="text-base font-black text-[var(--accent-primary)]">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2 pt-3 border-t border-[var(--border-color)]">
            {EVIDENCE_STATUSES.map(s => (
              <div key={s.status} className="flex items-center gap-1.5">
                <EvidenceStatusBadge status={s.status} size="sm" />
                <span className="text-xs font-bold text-[var(--text-primary)]">{metrics.evidenceRecordsByStatus[s.status] || 0}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Expiring Evidence</h3>
            <p className="text-xs text-[var(--text-secondary)]">{metrics.expiringEvidenceCount} expiring soon • {metrics.expiredEvidenceCount} expired</p>
          </div>
          <div className="flex flex-col gap-2">
            {expiringOrExpiredEvidence.length === 0 ? (
              <span className="text-xs text-[var(--text-muted)] italic">No evidence expiring soon.</span>
            ) : (
              expiringOrExpiredEvidence.map(e => (
                <button
                  key={e.id}
                  onClick={() => navigate('/evidence-registry')}
                  className="text-left p-2.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] hover:border-[var(--accent-border)] transition-all cursor-pointer"
                >
                  <span className="text-xs font-bold text-[var(--text-primary)] block truncate">{e.name}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{evidenceEntityRef(e).name} • Expires {e.expiryDate}</span>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Release 4 — Readiness Foundation: Readiness Summary & Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Readiness Summary</h3>
            <p className="text-xs text-[var(--text-secondary)]">Is governance complete and ready? Ready / Partially Ready / Not Ready only — no scores.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([
              { label: 'Governance Readiness', breakdown: metrics.governanceReadinessBreakdown },
              { label: 'Evidence Readiness', breakdown: metrics.evidenceReadinessBreakdown },
              { label: 'Review Readiness', breakdown: metrics.reviewReadinessBreakdown },
              { label: 'Audit Readiness', breakdown: metrics.auditReadinessBreakdown },
            ] as const).map(dim => (
              <div key={dim.label} className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-2">
                <span className="text-xs font-bold text-[var(--text-primary)]">{dim.label}</span>
                <div className="flex flex-wrap gap-1.5">
                  {READINESS_ORDER.map(status => (
                    <div key={status} className="flex items-center gap-1">
                      <ReadinessBadge status={status} size="sm" />
                      <span className="text-[11px] font-bold text-[var(--text-primary)]">{dim.breakdown[status]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Readiness Gaps</h3>
            <p className="text-xs text-[var(--text-secondary)]">{metrics.totalGovernanceGapsCount} gaps across the portfolio</p>
          </div>
          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
            {gaps.length === 0 ? (
              <span className="text-xs text-[var(--text-muted)] italic">No governance gaps detected.</span>
            ) : (
              gaps.slice(0, 8).map((gap, i) => (
                <button
                  key={i}
                  onClick={() => navigate('/assets')}
                  className="text-left p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/50 transition-all cursor-pointer"
                >
                  <span className="text-xs font-bold text-amber-500 block">{gap.gapType}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{gap.assetName} — {gap.detail}</span>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Release 5 — Universal Compliance Pack Framework: Coverage & Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Compliance Coverage Overview</h3>
              <p className="text-xs text-[var(--text-secondary)]">{metrics.activeCompliancePacksCount} active compliance packs • Covered / Partially Covered / Not Covered / Not Applicable — no scores</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate('/compliance-packs')}>
              Open Compliance Packs →
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {COVERAGE_ORDER.map(status => (
              <div key={status} className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-2">
                <ComplianceCoverageBadge status={status} size="sm" />
                <span className="text-lg font-black text-[var(--text-primary)]">{metrics.packCoverageBreakdown[status]}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Compliance Gap Summary</h3>
            <p className="text-xs text-[var(--text-secondary)]">{metrics.totalPackGapsCount} gaps across registered packs</p>
          </div>
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
            {packGaps.length === 0 ? (
              <span className="text-xs text-[var(--text-muted)] italic">No compliance gaps detected.</span>
            ) : (
              packGaps.slice(0, 6).map((gap, i) => (
                <button
                  key={i}
                  onClick={() => navigate('/compliance-packs')}
                  className="text-left p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/50 transition-all cursor-pointer"
                >
                  <span className="text-xs font-bold text-amber-500 block">{gap.gapType}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{gap.packName} — {gap.detail}</span>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Release 6 — Universal Regulatory Knowledge & Obligation Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Regulatory Coverage Overview</h3>
              <p className="text-xs text-[var(--text-secondary)]">{metrics.activeRegulatorySourcesCount} active regulatory sources • Covered / Partially Covered / Not Covered / Not Applicable — no scores</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate('/mapping-workspace')}>
              Open Mapping Workspace →
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {COVERAGE_ORDER.map(status => (
              <div key={status} className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-2">
                <ComplianceCoverageBadge status={status} size="sm" />
                <span className="text-lg font-black text-[var(--text-primary)]">{metrics.sourceCoverageBreakdown[status]}</span>
              </div>
            ))}
          </div>
          {Object.keys(metrics.requirementsByCategory).length > 0 && (
            <div className="pt-2 border-t border-[var(--border-color)]">
              <span className="text-xs font-bold uppercase text-[var(--text-muted)] block mb-2">Requirements by Category</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(metrics.requirementsByCategory).map(([category, count]) => (
                  <span key={category} className="text-xs px-2.5 py-1 rounded-full bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                    {category}: <span className="font-bold text-[var(--text-primary)]">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Open Gaps Summary</h3>
            <p className="text-xs text-[var(--text-secondary)]">{metrics.totalRegulatoryGapsCount} gaps across registered sources</p>
          </div>
          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
            {sourceGaps.length === 0 ? (
              <span className="text-xs text-[var(--text-muted)] italic">No regulatory gaps detected.</span>
            ) : (
              sourceGaps.slice(0, 4).map((gap, i) => (
                <button
                  key={i}
                  onClick={() => navigate('/mapping-workspace')}
                  className="text-left p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/50 transition-all cursor-pointer"
                >
                  <span className="text-xs font-bold text-amber-500 block">{gap.gapType}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{gap.sourceName} — {gap.detail}</span>
                </button>
              ))
            )}
          </div>
          {metrics.topMissingControls.length > 0 && (
            <div className="pt-2 border-t border-[var(--border-color)]">
              <span className="text-xs font-bold uppercase text-[var(--text-muted)] block mb-2">Top Missing Controls</span>
              <div className="flex flex-col gap-1">
                {metrics.topMissingControls.map((mc, i) => (
                  <span key={i} className="text-[10px] text-[var(--text-muted)] truncate">{mc.name}{mc.requirementName ? ` — ${mc.requirementName}` : ''}</span>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Release 7 — Governance Intelligence Engine (Foundation) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="flex flex-col gap-3">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Governance Findings</h3>
            <p className="text-xs text-[var(--text-secondary)]">{metrics.openGovernanceFindingsCount} open findings across the portfolio</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(['Critical', 'High', 'Medium', 'Low'] as const).map(sev => (
              <div key={sev} className="p-2.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-1">
                <GovernancePolicySeverityBadge severity={sev} size="sm" />
                <span className="text-lg font-black text-[var(--text-primary)]">{metrics.findingsBySeverity[sev]}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col gap-3">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Top Triggered Policies</h3>
            <p className="text-xs text-[var(--text-secondary)]">Active policies currently violated across the portfolio</p>
          </div>
          <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
            {metrics.topTriggeredPolicies.length === 0 ? (
              <span className="text-xs text-[var(--text-muted)] italic">No policies currently triggered.</span>
            ) : (
              metrics.topTriggeredPolicies.map((p, i) => (
                <div key={i} className="flex items-center justify-between gap-2 text-xs p-2 rounded-lg bg-[var(--bg-badge)] border border-[var(--border-color)]">
                  <span className="text-[var(--text-secondary)] font-semibold truncate">{p.policyName}</span>
                  <span className="text-[var(--text-primary)] font-black">{p.count}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="flex flex-col gap-3">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Governance Attention</h3>
            <p className="text-xs text-[var(--text-secondary)]">Recommendations only — no automatic state changes</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-amber-500">Assets Requiring Attention</span>
              <span className="text-lg font-black text-[var(--text-primary)]">{metrics.assetsRequiringAttentionCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-amber-500">Recommended Reviews</span>
              <span className="text-lg font-black text-[var(--text-primary)]">{metrics.recommendedReviewsCount}</span>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={() => navigate('/governance-intelligence')}>
            Open Governance Intelligence →
          </Button>
        </Card>
      </div>

      {/* Release 8 — Governance Intelligence Engine (Actions Edition) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="flex flex-col gap-3">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Governance Actions</h3>
            <p className="text-xs text-[var(--text-secondary)]">{metrics.openActionsCount} open • {metrics.highPriorityActionsCount} high/critical priority • {metrics.overdueActionsCount} overdue</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-amber-500">Open</span>
              <span className="text-lg font-black text-[var(--text-primary)]">{metrics.openActionsCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-orange-500">High Priority</span>
              <span className="text-lg font-black text-[var(--text-primary)]">{metrics.highPriorityActionsCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-red-500">Overdue</span>
              <span className="text-lg font-black text-[var(--text-primary)]">{metrics.overdueActionsCount}</span>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={() => navigate('/governance-actions')}>
            Open Governance Actions →
          </Button>
        </Card>

        <Card className="flex flex-col gap-3">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Actions by Status</h3>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(metrics.actionsByStatus) as [RecommendedActionStatus, number][]).map(([status, count]) => (
              <div key={status} className="p-2.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex items-center justify-between gap-2">
                <RecommendedActionStatusBadge status={status} size="sm" />
                <span className="text-sm font-black text-[var(--text-primary)]">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col gap-3">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Actions by Owner</h3>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
            {metrics.actionsByOwner.length === 0 ? (
              <span className="text-xs text-[var(--text-muted)] italic">No actions assigned to an owner yet.</span>
            ) : (
              metrics.actionsByOwner.map((o, i) => (
                <div key={i} className="flex items-center justify-between gap-2 text-xs p-2 rounded-lg bg-[var(--bg-badge)] border border-[var(--border-color)]">
                  <span className="text-[var(--text-secondary)] font-semibold truncate">{o.owner}</span>
                  <span className="text-[var(--text-primary)] font-black">{o.count}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Release 9 — Governance Decision Traceability Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="flex flex-col gap-3">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Decision Trace Records</h3>
            <p className="text-xs text-[var(--text-secondary)]">Assets with a recorded finding or action behind their outcome</p>
          </div>
          <span className="text-3xl font-black text-[var(--text-primary)]">{metrics.traceRecordsCount}</span>
          <Button size="sm" variant="ghost" onClick={() => navigate('/decision-traceability')}>
            Open Decision Traceability →
          </Button>
        </Card>

        <Card className="flex flex-col gap-3">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Top Decision Drivers</h3>
          <div className="flex flex-col gap-1.5">
            {metrics.topDecisionDrivers.length === 0 ? (
              <span className="text-xs text-[var(--text-muted)] italic">No conditions detected across the portfolio.</span>
            ) : (
              metrics.topDecisionDrivers.map((d, i) => (
                <div key={i} className="flex items-center justify-between gap-2 text-xs p-2 rounded-lg bg-[var(--bg-badge)] border border-[var(--border-color)]">
                  <span className="text-[var(--text-secondary)] font-semibold truncate">{d.conditionType}</span>
                  <span className="text-[var(--text-primary)] font-black">{d.count}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="flex flex-col gap-3">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Human Decision Statistics</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-blue-400">Accepted</span>
              <span className="text-lg font-black text-[var(--text-primary)]">{metrics.humanDecisionStats.accepted}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-500/10 border border-gray-500/30 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-gray-400">Rejected</span>
              <span className="text-lg font-black text-[var(--text-primary)]">{metrics.humanDecisionStats.rejected}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-500/10 border border-slate-500/30 flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Deferred</span>
              <span className="text-lg font-black text-[var(--text-primary)]">{metrics.humanDecisionStats.deferred}</span>
            </div>
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Action completion: {metrics.actionsByStatus.Completed} of {Object.values(metrics.actionsByStatus).reduce((a, b) => a + b, 0)}</span>
        </Card>
      </div>

      {/* Secondary Row: High Risk Assets requiring review & Recent Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Risk Asset Attention Table */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[var(--text-primary)]">High & Critical Risk Focus Assets</h3>
            <span className="text-xs text-red-400 font-medium">Requires Review</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--border-color)] text-[var(--text-muted)] uppercase">
                <tr>
                  <th className="pb-2">Asset Name</th>
                  <th className="pb-2">Risk</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {assets.filter(a => a.riskLevel === 'High' || a.riskLevel === 'Critical').length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[var(--text-muted)] italic">
                      No High or Critical risk assets currently require review.
                    </td>
                  </tr>
                ) : (
                  assets
                    .filter(a => a.riskLevel === 'High' || a.riskLevel === 'Critical')
                    .slice(0, 4)
                    .map(a => (
                      <tr key={a.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                        <td className="py-2.5 font-bold text-[var(--text-primary)]">{a.name}</td>
                        <td className="py-2.5"><RiskBadge level={a.riskLevel} size="sm" /></td>
                        <td className="py-2.5"><StatusBadge status={a.status} size="sm" /></td>
                        <td className="py-2.5 text-right">
                          <StatusBadge status={a.decisionOutcome || 'PENDING'} size="sm" />
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Audit Log Trail Stream */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[var(--text-primary)]">Live Governance Audit Activity</h3>
            <Button size="sm" variant="ghost" onClick={() => navigate('/audit-logs')}>
              Full Audit Trail →
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {auditLogs.length === 0 ? (
              <span className="text-xs text-[var(--text-muted)] italic">No governance activity recorded yet.</span>
            ) : (
              auditLogs.map(log => (
                <div key={log.id} className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex items-start gap-3">
                  <span className="p-1.5 rounded-lg bg-[var(--accent-light)] text-[var(--accent-primary)] text-xs font-bold">
                    📜
                  </span>
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--text-primary)] truncate">{log.action}</span>
                      <span className="text-[10px] text-[var(--text-muted)] shrink-0">{log.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-1">{log.details}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
