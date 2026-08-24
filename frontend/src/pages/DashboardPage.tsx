import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MetricCard } from '../components/ui/MetricCard';
import { RiskBadge, OversightBadge, GovernanceStateBadge, ClassificationBadge, EvidenceStatusBadge, ReadinessBadge, ComplianceCoverageBadge, GovernancePolicySeverityBadge, RecommendedActionStatusBadge } from '../components/ui/Badge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { getGovernanceMetrics, getAssets, getAuditLogs, getEvidenceRecords, getAllGovernanceGaps, getAllPackGaps, getAllSourceGaps } from '../services/storageService';
import { OVERSIGHT_TYPES, AUTONOMY_LEVELS } from '../config/governanceAuthority';
import { GOVERNANCE_STATES, GOVERNANCE_CLASSIFICATIONS } from '../config/governanceContinuity';
import { EVIDENCE_TYPES, EVIDENCE_STATUSES, getExpiryIndicator } from '../config/evidenceFoundation';
import type { AssetType, RiskLevel, HumanOversightType, ReadinessStatus, ComplianceCoverageStatus, RecommendedActionStatus } from '../types';

const READINESS_ORDER: ReadinessStatus[] = ['Ready', 'Partially Ready', 'Not Ready'];
const COVERAGE_ORDER: ComplianceCoverageStatus[] = ['Covered', 'Partially Covered', 'Not Covered', 'Not Applicable'];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics] = useState(() => getGovernanceMetrics());
  const [assets] = useState(() => getAssets());
  const [auditLogs] = useState(() => getAuditLogs().slice(0, 5));
  const [evidenceRecords] = useState(() => getEvidenceRecords());
  const [gaps] = useState(() => getAllGovernanceGaps());
  const [packGaps] = useState(() => getAllPackGaps());
  const [sourceGaps] = useState(() => getAllSourceGaps());

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
          trend="Governance Enforced"
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
              Governance Gatekeeper
            </h4>
            <p className="text-xs text-[var(--text-primary)] mt-1">
              No admissible decision = No AI asset movement into production.
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
            <p className="text-xs text-[var(--text-secondary)]">Whether each asset's authorization remains valid — Release 2 continuity model</p>
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
                  <span className="text-[10px] text-[var(--text-muted)]">{e.assetName} • Expires {e.expiryDate}</span>
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
                {assets
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
                  ))}
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
            {auditLogs.map(log => (
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
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
