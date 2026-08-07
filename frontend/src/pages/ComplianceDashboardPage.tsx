import React from 'react';
import { Card } from '../components/ui/Card';
import { MetricCard } from '../components/ui/MetricCard';
import { getGovernanceMetrics, getAssets, calculateAssetComplianceScore, getComplianceControls } from '../services/storageService';

export const ComplianceDashboardPage: React.FC = () => {
  const metrics = getGovernanceMetrics();
  const assets = getAssets();
  const controls = getComplianceControls();

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Compliance Intelligence Dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Executive Single-Pane View of Enterprise RBI Alignment, Regulatory Scores & Audit Readiness
        </p>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Tenant Compliance Rating"
          value={`${metrics.tenantComplianceScore}%`}
          subtitle="Average across all AI Assets"
          icon="🏛️"
          trend="positive"
        />
        <MetricCard
          title="RBI AI Standard Alignment"
          value={`${metrics.rbiAlignmentPercentage}%`}
          subtitle="Controls RBI-001 to RBI-008"
          icon="📋"
          trend="positive"
        />
        <MetricCard
          title="Compliant AI Assets"
          value={metrics.compliantAssetsCount}
          subtitle={`${metrics.partiallyCompliantAssetsCount} Partial • ${metrics.nonCompliantAssetsCount} Non-Compliant`}
          icon="✅"
        />
        <MetricCard
          title="Open Compliance Gaps"
          value={metrics.openComplianceGapsCount}
          subtitle="Remediation Action Items"
          icon="⚠️"
          trend="warning"
        />
      </div>

      {/* 2-Column Grid: Compliance Score Distribution & RBI Control Alignment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Asset Compliance Score Distribution */}
        <Card className="lg:col-span-7 flex flex-col gap-4 !p-6">
          <h3 className="text-base font-extrabold text-[var(--text-primary)]">
            AI Asset Compliance Rating (Audit-Ready)
          </h3>

          <div className="flex flex-col gap-3 mt-2">
            {assets.map(asset => {
              const compDetails = calculateAssetComplianceScore(asset.id);
              const score = compDetails.score;

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
                        compDetails.status === 'Compliant'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : compDetails.status === 'Partially Compliant'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {compDetails.status}
                      </span>
                      <span className="text-sm font-black text-emerald-400">{score}%</span>
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

        {/* Right: RBI Control Alignment Matrix */}
        <Card className="lg:col-span-5 flex flex-col gap-4 !p-6">
          <h3 className="text-base font-extrabold text-[var(--text-primary)]">
            RBI Standard Controls Alignment
          </h3>

          <div className="flex flex-col gap-2 mt-1">
            {controls.slice(0, 6).map(ctrl => (
              <div key={ctrl.id} className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[var(--accent-primary)]">{ctrl.id}</span>
                  <span className="font-semibold text-[var(--text-primary)]">{ctrl.controlName}</span>
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded">
                  Passed
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
