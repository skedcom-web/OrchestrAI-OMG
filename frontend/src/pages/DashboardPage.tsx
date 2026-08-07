import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MetricCard } from '../components/ui/MetricCard';
import { RiskBadge } from '../components/ui/Badge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { getGovernanceMetrics, getAssets, getAuditLogs } from '../services/storageService';
import type { AssetType, RiskLevel } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics] = useState(() => getGovernanceMetrics());
  const [assets] = useState(() => getAssets());
  const [auditLogs] = useState(() => getAuditLogs().slice(0, 5));

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
