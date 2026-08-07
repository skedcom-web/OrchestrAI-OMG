import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getAssets, updateAssetOperationalStatus } from '../services/storageService';
import type { OperationalStatus } from '../types';

export const OperationsCenterPage: React.FC = () => {
  const [assets, setAssets] = useState(() => getAssets());

  const handleStatusChange = (id: string, newStatus: OperationalStatus) => {
    updateAssetOperationalStatus(id, newStatus, 'Sarah Jenkins (Super Admin)');
    setAssets(getAssets());
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Operations Command Center</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Phase 6 Production Runtime Oversight • Can we safely operate, suspend, and control AI systems?
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Active in Production', count: assets.filter(a => (a.operationalStatus || 'Active') === 'Active').length, color: 'text-emerald-400' },
          { label: 'Suspended (Kill Switch)', count: assets.filter(a => a.operationalStatus === 'Suspended').length, color: 'text-red-400' },
          { label: 'Under Review', count: assets.filter(a => a.operationalStatus === 'Under Review').length, color: 'text-amber-400' },
          { label: 'Planned / Pre-Prod', count: assets.filter(a => a.operationalStatus === 'Planned').length, color: 'text-blue-400' },
          { label: 'Retired Assets', count: assets.filter(a => a.operationalStatus === 'Retired').length, color: 'text-gray-400' },
        ].map(item => (
          <Card key={item.label} className="!p-4 text-center border-[var(--border-color)]">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">{item.label}</span>
            <span className={`text-2xl font-black mt-1 ${item.color}`}>{item.count}</span>
          </Card>
        ))}
      </div>

      {/* Asset Operations Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[var(--bg-badge)] border-b border-[var(--border-color)] text-xs uppercase font-bold text-[var(--text-muted)]">
              <tr>
                <th className="p-4">AI Asset</th>
                <th className="p-4">Accountable Owner</th>
                <th className="p-4">Risk Tier</th>
                <th className="p-4">Decision Outcome</th>
                <th className="p-4">Operational Status</th>
                <th className="p-4 text-right">Quick Control Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {assets.map(asset => {
                const currentOpStatus = asset.operationalStatus || 'Active';

                return (
                  <tr key={asset.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[var(--text-primary)]">{asset.name}</span>
                        <span className="text-[11px] text-[var(--text-muted)]">v{asset.version} • Dept: {asset.department}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-semibold text-[var(--text-secondary)]">
                      {asset.ownership.businessOwner || 'Unassigned'}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                        asset.riskLevel === 'Critical' ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {asset.riskLevel}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-black text-emerald-400">
                      {asset.decisionOutcome || 'GO'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                        currentOpStatus === 'Active'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : currentOpStatus === 'Suspended'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse'
                          : currentOpStatus === 'Under Review'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-gray-500/15 text-gray-400 border border-gray-500/30'
                      }`}>
                        {currentOpStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {currentOpStatus !== 'Active' && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(asset.id, 'Active')}>
                            Set Active
                          </Button>
                        )}
                        {currentOpStatus !== 'Suspended' && (
                          <Button size="sm" variant="danger" onClick={() => handleStatusChange(asset.id, 'Suspended')}>
                            Suspend
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
