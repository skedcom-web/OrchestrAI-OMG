import React from 'react';
import { Card } from '../components/ui/Card';
import { MetricCard } from '../components/ui/MetricCard';
import { getGovernanceMetrics, getAssets } from '../services/storageService';

export const OperationalDashboardPage: React.FC = () => {
  const metrics = getGovernanceMetrics();
  const assets = getAssets();

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Operational Review Dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Executive Single-Pane View of Production AI Operations, Kill Switches, Incidents & Overrides
        </p>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Operational Assets"
          value={metrics.activeOperationalAssetsCount}
          subtitle="Running in Production"
          icon="⚡"
          trend="positive"
        />
        <MetricCard
          title="Suspended Assets"
          value={metrics.suspendedAssetsCount}
          subtitle="Kill Switch Engaged"
          icon="🚨"
          trend="negative"
        />
        <MetricCard
          title="Human Overrides Executed"
          value={metrics.overridesExecutedCount}
          subtitle="RBI Control RBI-004 Audit Trail"
          icon="👤"
        />
        <MetricCard
          title="Open Governance Incidents"
          value={metrics.openIncidentsCount}
          subtitle={`${metrics.criticalIncidentsCount} Critical Severity`}
          icon="⚠️"
          trend="warning"
        />
      </div>

      {/* Operational Status Distribution Matrix */}
      <Card className="flex flex-col gap-4 !p-6">
        <h3 className="text-base font-extrabold text-[var(--text-primary)]">
          AI Assets Production Operational Status
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          {assets.map(asset => {
            const status = asset.operationalStatus || 'Active';

            return (
              <div key={asset.id} className="p-3.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[var(--text-primary)]">{asset.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-color)] font-semibold text-[var(--text-muted)]">
                      {asset.type}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    Owner: {asset.ownership.businessOwner || 'Unassigned'} • Risk: {asset.riskLevel}
                  </span>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                  status === 'Active'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : status === 'Suspended'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                    : status === 'Under Review'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
