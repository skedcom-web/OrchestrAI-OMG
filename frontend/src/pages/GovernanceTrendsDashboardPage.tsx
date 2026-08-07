import React from 'react';
import { Card } from '../components/ui/Card';
import { MetricCard } from '../components/ui/MetricCard';
import { getGovernanceMetrics, getAssets, calculateAssetGovernanceHealthScore } from '../services/storageService';

export const GovernanceTrendsDashboardPage: React.FC = () => {
  const metrics = getGovernanceMetrics();
  const assets = getAssets();

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Governance Trends Dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Executive Single-Pane View of Continuous Portfolio Governance Health & Re-Assessment Trends
        </p>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Tenant Governance Health Score"
          value={`${metrics.tenantGovernanceHealthScore}/100`}
          subtitle="Average across production assets"
          icon="👁️"
          trend="positive"
        />
        <MetricCard
          title="Healthy Assets"
          value={metrics.healthyAssetsCount}
          subtitle={`${metrics.watchlistAssetsCount} Watchlist • ${metrics.attentionRequiredAssetsCount} Attention Required`}
          icon="✅"
          trend="positive"
        />
        <MetricCard
          title="Active Governance Alerts"
          value={metrics.activeGovernanceAlertsCount}
          subtitle="Exception Action Items"
          icon="🚨"
          trend="warning"
        />
        <MetricCard
          title="Upcoming Reviews & Actions"
          value={metrics.upcomingReviewsCount + metrics.openCorrectiveActionsCount}
          subtitle={`${metrics.upcomingReviewsCount} Reviews • ${metrics.openCorrectiveActionsCount} Tasks`}
          icon="📅"
        />
      </div>

      {/* Governance Health Rating Grid */}
      <Card className="flex flex-col gap-4 !p-6">
        <h3 className="text-base font-extrabold text-[var(--text-primary)]">
          Continuous Portfolio Governance Health Rating (5 Pillars x 20%)
        </h3>

        <div className="flex flex-col gap-3 mt-2">
          {assets.map(asset => {
            const health = calculateAssetGovernanceHealthScore(asset.id);
            const score = health.overallHealthScore;

            return (
              <div key={asset.id} className="p-3.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[var(--text-primary)]">{asset.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-color)] font-semibold text-[var(--text-muted)]">
                      {asset.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      health.healthStatus === 'Healthy'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : health.healthStatus === 'Watchlist'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {health.healthStatus}
                    </span>
                    <span className="text-sm font-black text-[var(--accent-primary)]">{score}/100</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-black/20 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      score >= 90
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : score >= 70
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        : 'bg-gradient-to-r from-red-500 to-pink-500'
                    }`}
                    style={{ width: `${Math.max(score, 5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
