import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getAssets, calculateAssetGovernanceHealthScore, calculateAssetComplianceScore } from '../services/storageService';
import { GovernanceReviewPackageModal } from '../components/common/GovernanceReviewPackageModal';

export const GovernanceMonitoringPage: React.FC = () => {
  const [assets] = useState(() => getAssets());
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isPackageOpen, setIsPackageOpen] = useState(false);

  const handleGeneratePackage = (assetId: string) => {
    setSelectedAssetId(assetId);
    setIsPackageOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Governance Monitoring Center</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Phase 7 Continuous Oversight • Is the AI system still operating within approved governance boundaries?
        </p>
      </div>

      {/* Health Overview Grid */}
      <div className="grid grid-cols-1 gap-4">
        {assets.map(asset => {
          const health = calculateAssetGovernanceHealthScore(asset.id);
          const comp = calculateAssetComplianceScore(asset.id);

          return (
            <Card key={asset.id} className="!p-6 flex flex-col gap-5 border-[var(--border-color)]">
              {/* Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-[var(--text-primary)]">{asset.name}</h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--bg-badge)] border border-[var(--border-color)] font-semibold">
                      v{asset.version}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] mt-1 block">
                    Department: {asset.department} | Operational Status: {asset.operationalStatus || 'Active'} | Risk Tier: {asset.riskLevel}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Governance Health Score</span>
                    <span className={`text-2xl font-black ${
                      health.overallHealthScore >= 90 ? 'text-emerald-400' : health.overallHealthScore >= 70 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {health.overallHealthScore}/100
                    </span>
                  </div>

                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Health Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                      health.healthStatus === 'Healthy'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : health.healthStatus === 'Watchlist'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}>
                      {health.healthStatus}
                    </span>
                  </div>

                  <Button size="sm" variant="outline" onClick={() => handleGeneratePackage(asset.id)} icon={<span>📑</span>}>
                    Health Package
                  </Button>
                </div>
              </div>

              {/* 5-Pillar Health Score Ratings */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Ownership</span>
                  <span className="text-base font-extrabold text-emerald-400">{health.ownershipHealth.score}/20</span>
                  <span className="text-[9px] text-[var(--text-secondary)] line-clamp-1">{health.ownershipHealth.message}</span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Risk Profile</span>
                  <span className="text-base font-extrabold text-emerald-400">{health.riskHealth.score}/20</span>
                  <span className="text-[9px] text-[var(--text-secondary)] line-clamp-1">{health.riskHealth.message}</span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Validation</span>
                  <span className="text-base font-extrabold text-emerald-400">{health.validationHealth.score}/20</span>
                  <span className="text-[9px] text-[var(--text-secondary)] line-clamp-1">{health.validationHealth.message}</span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Compliance</span>
                  <span className="text-base font-extrabold text-emerald-400">{health.complianceHealth.score}/20</span>
                  <span className="text-[9px] text-[var(--text-secondary)] line-clamp-1">Score: {comp.score}%</span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Operations</span>
                  <span className={`text-base font-extrabold ${health.operationalHealth.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                    {health.operationalHealth.score}/20
                  </span>
                  <span className="text-[9px] text-[var(--text-secondary)] line-clamp-1">{health.operationalHealth.message}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Governance Review Package Modal */}
      {isPackageOpen && selectedAssetId && (
        <GovernanceReviewPackageModal
          isOpen={isPackageOpen}
          onClose={() => setIsPackageOpen(false)}
          assetId={selectedAssetId}
        />
      )}
    </div>
  );
};
