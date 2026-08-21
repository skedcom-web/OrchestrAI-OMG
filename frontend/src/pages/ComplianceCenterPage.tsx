import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getAssets, calculateAssetComplianceScore, getComplianceGaps, getCompliancePacks, getAllPackGaps } from '../services/storageService';
import { CompliancePackageModal } from '../components/common/CompliancePackageModal';

export const ComplianceCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const [assets] = useState(() => getAssets());
  const [packs] = useState(() => getCompliancePacks());
  const [packGaps] = useState(() => getAllPackGaps());
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isPackageOpen, setIsPackageOpen] = useState(false);

  const handleGeneratePackage = (assetId: string) => {
    setSelectedAssetId(assetId);
    setIsPackageOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Compliance Center</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Phase 5 Command Center • Can we prove governance compliance against RBI & Enterprise Standards?
          </p>
        </div>
      </div>

      {/* Release 5 — Universal Compliance Pack Framework */}
      <Card className="!p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-[var(--accent-border)]">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🧩</span>
          <div>
            <h4 className="text-base font-extrabold text-[var(--text-primary)]">Compliance Pack Framework</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {packs.length} packs registered • {packGaps.length} open compliance gaps. Requirements, controls and evidence mappings the RBI, ISO 42001 and EU AI Act packs will plug into.
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => navigate('/compliance-packs')}>
          Open Compliance Packs →
        </Button>
      </Card>

      {/* RBI Alignment Banner */}
      <Card className="!p-5 bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-blue-600/10 border-[var(--accent-border)]">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏛️</span>
          <div>
            <h4 className="text-base font-extrabold text-[var(--text-primary)]">RBI AI Governance Standard (Controls RBI-001 to RBI-008)</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Centralized compliance evaluation ensuring named ownership, independent validation, human oversight, day-1 auditability, and emergency kill switch capability.
            </p>
          </div>
        </div>
      </Card>

      {/* Assets Compliance Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[var(--bg-badge)] border-b border-[var(--border-color)] text-xs uppercase font-bold text-[var(--text-muted)]">
              <tr>
                <th className="p-4">AI Asset</th>
                <th className="p-4">Asset Type</th>
                <th className="p-4">Department</th>
                <th className="p-4">Compliance Rating</th>
                <th className="p-4">Compliance Status</th>
                <th className="p-4">Open Regulatory Gaps</th>
                <th className="p-4 text-right">Audit Package</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {assets.map(asset => {
                const compDetails = calculateAssetComplianceScore(asset.id);
                const assetGaps = getComplianceGaps(asset.id);

                return (
                  <tr key={asset.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[var(--text-primary)]">{asset.name}</span>
                        <span className="text-[11px] text-[var(--text-muted)]">v{asset.version} • Risk: {asset.riskLevel}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-semibold text-[var(--text-secondary)]">{asset.type}</td>
                    <td className="p-4 text-xs font-medium text-[var(--text-secondary)]">{asset.department}</td>
                    <td className="p-4">
                      <span className={`text-base font-black ${
                        compDetails.score >= 90 ? 'text-emerald-400' : compDetails.score >= 70 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {compDetails.score}%
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                        compDetails.status === 'Compliant'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : compDetails.status === 'Partially Compliant'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}>
                        {compDetails.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-bold text-[var(--text-primary)]">
                      {assetGaps.length === 0 ? (
                        <span className="text-emerald-400">0 Gaps ✅</span>
                      ) : (
                        <span className="text-amber-400">{assetGaps.length} Gaps Pending</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Button size="sm" variant="outline" onClick={() => handleGeneratePackage(asset.id)} icon={<span>📑</span>}>
                        Export Package
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Compliance Package Modal */}
      {isPackageOpen && selectedAssetId && (
        <CompliancePackageModal
          isOpen={isPackageOpen}
          onClose={() => setIsPackageOpen(false)}
          assetId={selectedAssetId}
        />
      )}
    </div>
  );
};
