import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getAssets, calculateAssetGovernanceScore } from '../services/storageService';
import { DecisionPackageModal } from '../components/common/DecisionPackageModal';

export const DecisionIntelligencePage: React.FC = () => {
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
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Decision Intelligence Center</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Phase 4 Executive Decision Authority • Can this AI asset move forward today?
        </p>
      </div>

      {/* Assets Readiness Intelligence Grid */}
      <div className="grid grid-cols-1 gap-4">
        {assets.map(asset => {
          const scoreBreakdown = calculateAssetGovernanceScore(asset.id);
          const isReady = scoreBreakdown.readinessTier === 'Ready';
          const isCondReady = scoreBreakdown.readinessTier === 'Conditionally Ready';

          return (
            <Card key={asset.id} className="!p-6 flex flex-col gap-5 border-[var(--border-color)]">
              {/* Asset Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-[var(--text-primary)]">{asset.name}</h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--bg-badge)] border border-[var(--border-color)] font-semibold">
                      v{asset.version}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] mt-1 block">
                    Department: {asset.department} | Type: {asset.type} | Risk Level: {asset.riskLevel}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Governance Score Badge */}
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Governance Score</span>
                    <span className={`text-2xl font-black ${isReady ? 'text-emerald-400' : isCondReady ? 'text-amber-400' : 'text-red-400'}`}>
                      {scoreBreakdown.overallScore}/100
                    </span>
                  </div>

                  {/* System Recommendation Badge */}
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Recommendation</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                      scoreBreakdown.recommendedOutcome === 'GO'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : scoreBreakdown.recommendedOutcome === 'CONDITIONAL GO'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}>
                      {scoreBreakdown.recommendedOutcome}
                    </span>
                  </div>

                  <Button size="sm" variant="outline" onClick={() => handleGeneratePackage(asset.id)} icon={<span>📄</span>}>
                    Decision Package
                  </Button>
                </div>
              </div>

              {/* 5-Pillar Score Rating Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">1. Ownership</span>
                  <span className={`text-base font-extrabold ${scoreBreakdown.ownership.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {scoreBreakdown.ownership.score}/20
                  </span>
                  <span className="text-[9px] text-[var(--text-secondary)] line-clamp-1">{scoreBreakdown.ownership.message}</span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">2. Risk</span>
                  <span className={`text-base font-extrabold ${scoreBreakdown.risk.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {scoreBreakdown.risk.score}/20
                  </span>
                  <span className="text-[9px] text-[var(--text-secondary)] line-clamp-1">{scoreBreakdown.risk.message}</span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">3. Validation</span>
                  <span className={`text-base font-extrabold ${scoreBreakdown.validation.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {scoreBreakdown.validation.score}/20
                  </span>
                  <span className="text-[9px] text-[var(--text-secondary)] line-clamp-1">{scoreBreakdown.validation.message}</span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">4. Evidence</span>
                  <span className={`text-base font-extrabold ${scoreBreakdown.evidence.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {scoreBreakdown.evidence.score}/20
                  </span>
                  <span className="text-[9px] text-[var(--text-secondary)] line-clamp-1">{scoreBreakdown.evidence.message}</span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">5. Findings</span>
                  <span className={`text-base font-extrabold ${scoreBreakdown.findings.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                    {scoreBreakdown.findings.score}/20
                  </span>
                  <span className="text-[9px] text-[var(--text-secondary)] line-clamp-1">{scoreBreakdown.findings.message}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Decision Package Modal */}
      {isPackageOpen && selectedAssetId && (
        <DecisionPackageModal
          isOpen={isPackageOpen}
          onClose={() => setIsPackageOpen(false)}
          assetId={selectedAssetId}
        />
      )}
    </div>
  );
};
