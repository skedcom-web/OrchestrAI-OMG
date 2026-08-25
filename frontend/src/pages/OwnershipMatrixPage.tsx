import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { getAssets, getUsers, saveAsset } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { AIAsset, User, OwnershipAssignment } from '../types';

export const OwnershipMatrixPage: React.FC = () => {
  const { canPerform } = useAuth();
  const [assets, setAssets] = useState<AIAsset[]>(() => getAssets());
  const [users] = useState<User[]>(() => getUsers());
  const [selectedAsset, setSelectedAsset] = useState<AIAsset | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formOwnership, setFormOwnership] = useState<OwnershipAssignment>({});

  const refreshAssets = () => {
    setAssets(getAssets());
  };

  const handleOpenAssignModal = (asset: AIAsset) => {
    setSelectedAsset(asset);
    setFormOwnership({ ...(asset.ownership || {}) });
    setIsModalOpen(true);
  };

  const handleSaveOwnership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

    const persisting = saveAsset({
      ...selectedAsset,
      ownership: formOwnership,
    });
    refreshAssets(); // optimistic — the cache update happens synchronously before this line
    setIsModalOpen(false);
    setSelectedAsset(null);

    try {
      await persisting;
      refreshAssets();
    } catch (err) {
      alert(`Ownership saved to the local cache but could not be synced to Neon: ${(err as Error).message}. It will not be visible on other devices until sync succeeds.`);
    }
  };

  const userOptions = [
    { value: '', label: '-- Select Named Owner --' },
    ...users.map(u => ({ value: u.name, label: `${u.name} (${u.role})` })),
  ];

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Ownership Matrix</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Assign & enforce 5-role governance accountability across all AI assets
          </p>
        </div>
      </div>

      {/* Roles Legend Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs">
          <span className="font-bold text-[var(--accent-primary)] block">Business Owner</span>
          <span className="text-[11px] text-[var(--text-secondary)]">P&L & Business Outcome</span>
        </div>
        <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs">
          <span className="font-bold text-cyan-400 block">Technical Owner</span>
          <span className="text-[11px] text-[var(--text-secondary)]">Architecture & Engineering</span>
        </div>
        <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs">
          <span className="font-bold text-amber-400 block">Risk Owner</span>
          <span className="text-[11px] text-[var(--text-secondary)]">Model Risk Tier & Bias</span>
        </div>
        <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs">
          <span className="font-bold text-purple-400 block">Compliance Owner</span>
          <span className="text-[11px] text-[var(--text-secondary)]">Regulatory & Data Privacy</span>
        </div>
        <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs">
          <span className="font-bold text-emerald-400 block">Approver</span>
          <span className="text-[11px] text-[var(--text-secondary)]">Final Gatekeeper Authority</span>
        </div>
      </div>

      {/* Main Matrix Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[var(--bg-badge)] border-b border-[var(--border-color)] uppercase font-bold text-[var(--text-muted)] tracking-wider">
              <tr>
                <th className="p-4 min-w-[200px]">AI Asset</th>
                <th className="p-4">Business Owner</th>
                <th className="p-4">Technical Owner</th>
                <th className="p-4">Risk Owner</th>
                <th className="p-4">Compliance Owner</th>
                <th className="p-4">Approver</th>
                <th className="p-4 text-center">Completeness</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {assets.map(asset => {
                const o = asset.ownership || {};
                const filledCount = [o.businessOwner, o.technicalOwner, o.riskOwner, o.complianceOwner, o.approver].filter(Boolean).length;
                const isComplete = filledCount === 5;

                return (
                  <tr key={asset.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                    <td className="p-4 font-bold text-[var(--text-primary)]">
                      <div>{asset.name}</div>
                      <span className="text-[10px] text-[var(--text-muted)] font-normal">{asset.type} • {asset.department}</span>
                    </td>
                    <td className="p-4 text-[var(--text-primary)]">
                      {o.businessOwner ? <span className="font-semibold text-xs">{o.businessOwner}</span> : <span className="text-[var(--text-muted)] italic">Unassigned</span>}
                    </td>
                    <td className="p-4 text-[var(--text-primary)]">
                      {o.technicalOwner ? <span className="font-semibold text-xs">{o.technicalOwner}</span> : <span className="text-[var(--text-muted)] italic">Unassigned</span>}
                    </td>
                    <td className="p-4 text-[var(--text-primary)]">
                      {o.riskOwner ? <span className="font-semibold text-xs">{o.riskOwner}</span> : <span className="text-[var(--text-muted)] italic">Unassigned</span>}
                    </td>
                    <td className="p-4 text-[var(--text-primary)]">
                      {o.complianceOwner ? <span className="font-semibold text-xs">{o.complianceOwner}</span> : <span className="text-[var(--text-muted)] italic">Unassigned</span>}
                    </td>
                    <td className="p-4 text-[var(--text-primary)]">
                      {o.approver ? <span className="font-semibold text-xs">{o.approver}</span> : <span className="text-[var(--text-muted)] italic">Unassigned</span>}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        isComplete
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}>
                        {filledCount}/5 Roles
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenAssignModal(asset)}
                        disabled={!canPerform('asset:edit')}
                        title={!canPerform('asset:edit') ? 'Your governance role does not permit editing asset ownership.' : undefined}
                      >
                        Assign Owners
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ASSIGNMENT MODAL */}
      {isModalOpen && selectedAsset && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Assign Owners: ${selectedAsset.name}`}
          subtitle="Configure 5-Role Accountability Matrix"
          maxWidth="lg"
        >
          <form onSubmit={handleSaveOwnership} className="flex flex-col gap-4 py-2">
            <Select
              label="1. Business Owner (Outcome & P&L)"
              options={userOptions}
              value={formOwnership.businessOwner || ''}
              onChange={e => setFormOwnership({ ...formOwnership, businessOwner: e.target.value })}
            />
            <Select
              label="2. Technical Owner (Engineering & Architecture)"
              options={userOptions}
              value={formOwnership.technicalOwner || ''}
              onChange={e => setFormOwnership({ ...formOwnership, technicalOwner: e.target.value })}
            />
            <Select
              label="3. Risk Owner (Model Risk & Bias)"
              options={userOptions}
              value={formOwnership.riskOwner || ''}
              onChange={e => setFormOwnership({ ...formOwnership, riskOwner: e.target.value })}
            />
            <Select
              label="4. Compliance Owner (Regulatory & Privacy)"
              options={userOptions}
              value={formOwnership.complianceOwner || ''}
              onChange={e => setFormOwnership({ ...formOwnership, complianceOwner: e.target.value })}
            />
            <Select
              label="5. Approver (Final Gatekeeper Authority)"
              options={userOptions}
              value={formOwnership.approver || ''}
              onChange={e => setFormOwnership({ ...formOwnership, approver: e.target.value })}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Matrix
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
