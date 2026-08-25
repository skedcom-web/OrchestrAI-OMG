import React from 'react';
import { Card } from '../components/ui/Card';
import { MetricCard } from '../components/ui/MetricCard';
import { getGovernanceMetrics, getAssets, calculateAssetGovernanceScore } from '../services/storageService';

export const DecisionDashboardPage: React.FC = () => {
  const metrics = getGovernanceMetrics();
  const assets = getAssets();

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Decision Intelligence Dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Executive Single-Pane View of Enterprise AI Decision Readiness & Governance Score Distribution
        </p>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Ready Assets (GO)"
          value={metrics.readyAssetsCount}
          subtitle="Score 90 - 100 • Production Approved"
          icon="✅"
          trend="positive"
        />
        <MetricCard
          title="Conditionally Ready"
          value={metrics.conditionallyReadyAssetsCount}
          subtitle="Score 70 - 89 • Mitigation Required"
          icon="⚠️"
          trend="warning"
        />
        <MetricCard
          title="Not Ready (NO GO)"
          value={metrics.notReadyAssetsCount}
          subtitle="Score <70 • Approval Blocked"
          icon="🚫"
          trend="negative"
        />
        <MetricCard
          title="Active Approval Blockers"
          value={metrics.totalBlockersCount}
          subtitle="Root Cause Action Items"
          icon="🧱"
        />
      </div>

      {/* 2-Column Grid: Score Distribution & Decision Outcomes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Governance Score Distribution */}
        <Card className="lg:col-span-7 flex flex-col gap-4 !p-6">
          <h3 className="text-base font-extrabold text-[var(--text-primary)]">
            Governance Readiness Rating (5 Pillars x 20%)
          </h3>

          <div className="flex flex-col gap-3 mt-2">
            {assets.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] italic p-3">No AI assets registered yet.</p>
            ) : assets.map(asset => {
              const scoreBreakdown = calculateAssetGovernanceScore(asset.id);
              const score = scoreBreakdown.overallScore;

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
                        scoreBreakdown.readinessTier === 'Ready'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : scoreBreakdown.readinessTier === 'Conditionally Ready'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {scoreBreakdown.readinessTier}
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

        {/* Right: Decision Outcomes Distribution */}
        <Card className="lg:col-span-5 flex flex-col gap-4 !p-6">
          <h3 className="text-base font-extrabold text-[var(--text-primary)]">
            Executed Governance Decisions
          </h3>

          <div className="flex flex-col gap-3 mt-2">
            {[
              { outcome: 'GO', count: metrics.decisionBreakdown['GO'], color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
              { outcome: 'CONDITIONAL GO', count: metrics.decisionBreakdown['CONDITIONAL GO'], color: 'text-amber-400', bg: 'bg-amber-500/20' },
              { outcome: 'NO GO', count: metrics.decisionBreakdown['NO GO'], color: 'text-red-400', bg: 'bg-red-500/20' },
              { outcome: 'PENDING', count: metrics.decisionBreakdown['PENDING'], color: 'text-blue-400', bg: 'bg-blue-500/20' },
            ].map(item => (
              <div key={item.outcome} className="p-3.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-primary)]">{item.outcome} Decision</span>
                <span className={`text-sm font-black px-3 py-1 rounded-full ${item.bg} ${item.color}`}>
                  {item.count} Assets
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
