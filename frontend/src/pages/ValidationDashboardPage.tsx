import React from 'react';
import { Card } from '../components/ui/Card';
import { MetricCard } from '../components/ui/MetricCard';
import { getGovernanceMetrics, getValidations, getAssets, getFindings } from '../services/storageService';

export const ValidationDashboardPage: React.FC = () => {
  const metrics = getGovernanceMetrics();
  const validations = getValidations();
  const assets = getAssets();
  const findings = getFindings();

  const categories = ['Business', 'Technical', 'Security', 'Compliance', 'Operational', 'Model'];

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Validation & Evidence Dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Executive Single-Pane View of AI Asset Preparedness, Proofs, Scorecards & Open Findings
        </p>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Validations"
          value={metrics.totalValidations}
          subtitle={`${metrics.passedValidations} Passed • ${metrics.failedValidations} Failed`}
          icon="🧪"
        />
        <MetricCard
          title="Validation Pass Rate"
          value={`${metrics.totalValidations > 0 ? Math.round((metrics.passedValidations / metrics.totalValidations) * 100) : 0}%`}
          subtitle="Multi-Discipline Average"
          icon="✅"
        />
        <MetricCard
          title="Open Governance Findings"
          value={metrics.openFindingsCount}
          subtitle={`${findings.filter(f => f.severity === 'Critical').length} Critical Risk Blockers`}
          icon="⚠️"
          trend="warning"
        />
        <MetricCard
          title="Governance Evidence Count"
          value={metrics.totalEvidenceCount}
          subtitle="Aligned with ODF Blueprint v1"
          icon="📄"
        />
      </div>

      {/* 2-Column Grid: Validation Scorecard Distribution & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Asset Validation Scorecard Distribution */}
        <Card className="lg:col-span-7 flex flex-col gap-4 !p-6">
          <h3 className="text-base font-extrabold text-[var(--text-primary)]">
            AI Asset Validation Scorecard (Proof-Based)
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Overall validation score calculated as average of completed multi-disciplinary reviews.
          </p>

          <div className="flex flex-col gap-3 mt-2">
            {assets.map(asset => {
              const score = asset.validationScore ?? 0;
              return (
                <div key={asset.id} className="p-3.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[var(--text-primary)]">{asset.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-color)] font-semibold text-[var(--text-muted)]">
                        {asset.type}
                      </span>
                    </div>
                    <span className={`text-sm font-black ${score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                      Score: {score}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 rounded-full bg-black/20 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        score >= 80
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : score >= 60
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

        {/* Right: Validation Category Performance Breakdown */}
        <Card className="lg:col-span-5 flex flex-col gap-4 !p-6">
          <h3 className="text-base font-extrabold text-[var(--text-primary)]">
            Category Preparedness Rating
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Pass / Fail ratio across all 6 governance validation types.
          </p>

          <div className="flex flex-col gap-3 mt-2">
            {categories.map(cat => {
              const catVals = validations.filter(v => v.category === cat);
              const passed = catVals.filter(v => v.status === 'Approved').length;
              const rate = catVals.length > 0 ? Math.round((passed / catVals.length) * 100) : 0;

              return (
                <div key={cat} className="p-3.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[var(--text-primary)]">{cat} Validation</span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {passed} of {catVals.length} Passed
                    </span>
                  </div>
                  <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                    rate >= 80 ? 'bg-emerald-500/20 text-emerald-400' : rate >= 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {rate}% Pass
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
