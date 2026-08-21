import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { RiskBadge, OversightBadge, AutonomyBadge } from '../components/ui/Badge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { getAssets, getUsers, saveAsset, deleteAsset } from '../services/storageService';
import { OVERSIGHT_TYPES, AUTONOMY_LEVELS, getAuthorityMatrixEntry, defaultAuthorityProfile } from '../config/governanceAuthority';
import type { AIAsset, AssetType, RiskLevel, GovernanceStatus, HumanOversightType, AutonomyLevel } from '../types';

export const AssetRegistryPage: React.FC = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<AIAsset[]>(() => getAssets());
  const [users] = useState(() => getUsers());

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Partial<AIAsset> | null>(null);

  // View Detail Drawer
  const [selectedAsset, setSelectedAsset] = useState<AIAsset | null>(null);

  const refreshAssets = () => {
    setAssets(getAssets());
  };

  const handleOpenCreateModal = () => {
    setEditingAsset({
      name: '',
      type: 'Agent',
      description: '',
      department: 'Enterprise AI',
      version: '1.0.0',
      status: 'Draft',
      riskLevel: 'Medium',
      dataSensitivity: 'Confidential',
      techStack: ['Python'],
      ownership: {},
      authorityProfile: defaultAuthorityProfile(),
      oversightType: getAuthorityMatrixEntry('Medium').oversightType,
      autonomyLevel: 1,
      decisionOutcome: 'PENDING',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (asset: AIAsset) => {
    setEditingAsset({ ...asset });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset?.name || !editingAsset?.type) return;

    saveAsset(editingAsset as any);
    refreshAssets();
    setIsModalOpen(false);
    setEditingAsset(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this AI asset from the registry?')) {
      deleteAsset(id);
      refreshAssets();
      if (selectedAsset?.id === id) setSelectedAsset(null);
    }
  };

  const filteredAssets = assets.filter(a => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      a.department.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || a.type === typeFilter;
    const matchesRisk = riskFilter === 'ALL' || a.riskLevel === riskFilter;
    return matchesSearch && matchesType && matchesRisk;
  });

  const assetTypeOptions = [
    { value: 'ALL', label: 'All Asset Types' },
    { value: 'Application', label: 'Application' },
    { value: 'Agent', label: 'Agent' },
    { value: 'Model', label: 'Model' },
    { value: 'LLM', label: 'LLM' },
    { value: 'Copilot', label: 'Copilot' },
    { value: 'RAG System', label: 'RAG System' },
    { value: 'AI Workflow', label: 'AI Workflow' },
    { value: 'Multi-Agent System', label: 'Multi-Agent System' },
    { value: 'Third-Party AI Service', label: 'Third-Party AI Service' },
  ];

  const userOptions = [
    { value: '', label: '-- Select Named Owner --' },
    ...users.map(u => ({ value: u.name, label: `${u.name} (${u.role})` })),
  ];

  const oversightOptions = OVERSIGHT_TYPES.map(o => ({ value: o.type, label: o.type }));
  const autonomyOptions = AUTONOMY_LEVELS.map(a => ({ value: String(a.level), label: a.label }));

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">AI Asset Registry</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Centralized inventory of all enterprise AI applications, agents, models, & services
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} icon={<span>➕</span>}>
          Register New AI Asset
        </Button>
      </div>

      {/* Filters & Search */}
      <Card className="!p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search AI Assets by name, description, or department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-56">
          <Select
            options={assetTypeOptions}
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          />
        </div>
        <div className="w-full md:w-44">
          <Select
            options={[
              { value: 'ALL', label: 'All Risk Tiers' },
              { value: 'Low', label: 'Low Risk' },
              { value: 'Medium', label: 'Medium Risk' },
              { value: 'High', label: 'High Risk' },
              { value: 'Critical', label: 'Critical Risk' },
            ]}
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
          />
        </div>
      </Card>

      {/* Main Asset Data Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[var(--bg-badge)] border-b border-[var(--border-color)] text-xs uppercase font-bold text-[var(--text-muted)] tracking-wider">
              <tr>
                <th className="p-4">AI Asset Name</th>
                <th className="p-4">Asset Type</th>
                <th className="p-4">Department</th>
                <th className="p-4">Risk Level</th>
                <th className="p-4">Status</th>
                <th className="p-4">Decision</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--text-muted)]">
                    No AI Assets found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAssets.map(asset => (
                  <tr
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className="hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[var(--text-primary)]">{asset.name}</span>
                        <span className="text-xs text-[var(--text-muted)]">v{asset.version} • {asset.id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md bg-[var(--bg-badge)] text-[var(--text-primary)] text-xs font-semibold border border-[var(--border-color)]">
                        {asset.type}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-medium text-[var(--text-secondary)]">{asset.department}</td>
                    <td className="p-4"><RiskBadge level={asset.riskLevel} /></td>
                    <td className="p-4"><StatusBadge status={asset.status} /></td>
                    <td className="p-4">
                      <StatusBadge status={asset.decisionOutcome || 'PENDING'} />
                    </td>
                    <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleOpenEditModal(asset)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/risk?assetId=${asset.id}`)}>
                          Risk
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* DETAIL MODAL / DRAWER */}
      {selectedAsset && (
        <Modal
          isOpen={!!selectedAsset}
          onClose={() => setSelectedAsset(null)}
          title={selectedAsset.name}
          subtitle={`Asset ID: ${selectedAsset.id} • Version ${selectedAsset.version}`}
          maxWidth="xl"
        >
          <div className="flex flex-col gap-6 py-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-[var(--bg-badge)] text-[var(--text-primary)] text-xs font-bold border border-[var(--border-color)]">
                {selectedAsset.type}
              </span>
              <RiskBadge level={selectedAsset.riskLevel} />
              <StatusBadge status={selectedAsset.status} />
              <StatusBadge status={selectedAsset.decisionOutcome || 'PENDING'} />
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">Description</h4>
              <p className="text-sm text-[var(--text-primary)] mt-1 leading-relaxed">{selectedAsset.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)]">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Department</span>
                <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{selectedAsset.department}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)]">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Data Sensitivity</span>
                <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{selectedAsset.dataSensitivity || 'Confidential'}</p>
              </div>
            </div>

            {/* Ownership Summary */}
            <div>
              <h4 className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider mb-2">Ownership Matrix</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs">
                  <span className="text-[10px] text-[var(--text-muted)] block">Business Owner</span>
                  <span className="font-bold text-[var(--text-primary)]">{selectedAsset.ownership?.businessOwner || 'Unassigned'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs">
                  <span className="text-[10px] text-[var(--text-muted)] block">Technical Owner</span>
                  <span className="font-bold text-[var(--text-primary)]">{selectedAsset.ownership?.technicalOwner || 'Unassigned'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs">
                  <span className="text-[10px] text-[var(--text-muted)] block">Risk Owner</span>
                  <span className="font-bold text-[var(--text-primary)]">{selectedAsset.ownership?.riskOwner || 'Unassigned'}</span>
                </div>
              </div>
            </div>

            {/* Release 1 — Governance Summary Card */}
            <div>
              <h4 className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider mb-2">Governance Summary</h4>
              <div className="p-4 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs">
                    <span className="text-[10px] text-[var(--text-muted)] block">Accountable Owner</span>
                    <span className="font-bold text-[var(--text-primary)]">{selectedAsset.authorityProfile?.accountableOwner || 'Unassigned'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs">
                    <span className="text-[10px] text-[var(--text-muted)] block">Governance Sponsor</span>
                    <span className="font-bold text-[var(--text-primary)]">{selectedAsset.authorityProfile?.governanceSponsor || 'Unassigned'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs">
                    <span className="text-[10px] text-[var(--text-muted)] block">Risk Owner</span>
                    <span className="font-bold text-[var(--text-primary)]">{selectedAsset.authorityProfile?.riskOwner || 'Unassigned'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs">
                    <span className="text-[10px] text-[var(--text-muted)] block">Technical Owner</span>
                    <span className="font-bold text-[var(--text-primary)]">{selectedAsset.authorityProfile?.technicalOwner || 'Unassigned'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {selectedAsset.oversightType && <OversightBadge type={selectedAsset.oversightType} size="sm" />}
                  {selectedAsset.autonomyLevel !== undefined && <AutonomyBadge level={selectedAsset.autonomyLevel} size="sm" />}
                </div>

                <div className="pt-2 border-t border-[var(--border-color)]">
                  <span className="text-[10px] text-[var(--text-muted)] block">Approval Authority (Authority Matrix, reference)</span>
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    {getAuthorityMatrixEntry(selectedAsset.riskLevel).approvalAuthority}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
              <Button variant="danger" size="sm" onClick={() => handleDelete(selectedAsset.id)}>
                Delete Asset
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => navigate(`/ownership?assetId=${selectedAsset.id}`)}>
                  Manage Ownership
                </Button>
                <Button size="sm" onClick={() => navigate(`/decision-workbench-v4?assetId=${selectedAsset.id}`)}>
                  Decision Gatekeeper
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && editingAsset && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingAsset.id ? 'Edit AI Asset' : 'Register New AI Asset'}
          subtitle="Enterprise AI Governance Registry Form"
          maxWidth="xl"
        >
          <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
            <Input
              label="AI Asset Name"
              required
              value={editingAsset.name || ''}
              onChange={e => setEditingAsset({ ...editingAsset, name: e.target.value })}
              placeholder="e.g. Fraud Sentinel Agent"
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Asset Type (9 Supported)"
                options={assetTypeOptions.filter(o => o.value !== 'ALL')}
                value={editingAsset.type || 'Agent'}
                onChange={e => setEditingAsset({ ...editingAsset, type: e.target.value as AssetType })}
              />
              <Input
                label="Version"
                value={editingAsset.version || '1.0.0'}
                onChange={e => setEditingAsset({ ...editingAsset, version: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Department / Unit"
                value={editingAsset.department || ''}
                onChange={e => setEditingAsset({ ...editingAsset, department: e.target.value })}
                placeholder="e.g. Retail Banking"
              />
              <Select
                label="Risk Tier"
                options={[
                  { value: 'Low', label: 'Low Risk' },
                  { value: 'Medium', label: 'Medium Risk' },
                  { value: 'High', label: 'High Risk' },
                  { value: 'Critical', label: 'Critical Risk' },
                ]}
                value={editingAsset.riskLevel || 'Medium'}
                onChange={e => setEditingAsset({ ...editingAsset, riskLevel: e.target.value as RiskLevel })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Governance Stage"
                options={[
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Review', label: 'Review' },
                  { value: 'Validation', label: 'Validation' },
                  { value: 'Approval', label: 'Approval' },
                  { value: 'Production', label: 'Production' },
                ]}
                value={editingAsset.status || 'Draft'}
                onChange={e => setEditingAsset({ ...editingAsset, status: e.target.value as GovernanceStatus })}
              />
              <Select
                label="Data Sensitivity"
                options={[
                  { value: 'Public', label: 'Public' },
                  { value: 'Internal', label: 'Internal' },
                  { value: 'Confidential', label: 'Confidential' },
                  { value: 'Restricted', label: 'Restricted' },
                  { value: 'PII/Sensitive', label: 'PII / Sensitive Data' },
                ]}
                value={editingAsset.dataSensitivity || 'Confidential'}
                onChange={e => setEditingAsset({ ...editingAsset, dataSensitivity: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Asset Description
              </label>
              <textarea
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)] transition-all"
                value={editingAsset.description || ''}
                onChange={e => setEditingAsset({ ...editingAsset, description: e.target.value })}
                placeholder="Explain the purpose, input data, and target decision impact of this AI asset..."
              />
            </div>

            {/* Release 1 — Authority Section: Governance Authority Profile */}
            <div className="pt-2 border-t border-[var(--border-color)]">
              <h4 className="text-xs font-bold uppercase text-[var(--text-secondary)] tracking-wider mb-3">
                Governance Authority Profile
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Accountable Owner *"
                  options={userOptions}
                  value={editingAsset.authorityProfile?.accountableOwner || ''}
                  onChange={e => setEditingAsset({
                    ...editingAsset,
                    authorityProfile: { ...(editingAsset.authorityProfile || defaultAuthorityProfile()), accountableOwner: e.target.value },
                  })}
                />
                <Select
                  label="Governance Sponsor *"
                  options={userOptions}
                  value={editingAsset.authorityProfile?.governanceSponsor || ''}
                  onChange={e => setEditingAsset({
                    ...editingAsset,
                    authorityProfile: { ...(editingAsset.authorityProfile || defaultAuthorityProfile()), governanceSponsor: e.target.value },
                  })}
                />
                <Select
                  label="Risk Owner *"
                  options={userOptions}
                  value={editingAsset.authorityProfile?.riskOwner || ''}
                  onChange={e => setEditingAsset({
                    ...editingAsset,
                    authorityProfile: { ...(editingAsset.authorityProfile || defaultAuthorityProfile()), riskOwner: e.target.value },
                  })}
                />
                <Select
                  label="Technical Owner *"
                  options={userOptions}
                  value={editingAsset.authorityProfile?.technicalOwner || ''}
                  onChange={e => setEditingAsset({
                    ...editingAsset,
                    authorityProfile: { ...(editingAsset.authorityProfile || defaultAuthorityProfile()), technicalOwner: e.target.value },
                  })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Select
                  label="Compliance Owner (optional)"
                  options={userOptions}
                  value={editingAsset.authorityProfile?.complianceOwner || ''}
                  onChange={e => setEditingAsset({
                    ...editingAsset,
                    authorityProfile: { ...(editingAsset.authorityProfile || defaultAuthorityProfile()), complianceOwner: e.target.value },
                  })}
                />
                <Select
                  label="Human Override Authority (optional)"
                  options={userOptions}
                  value={editingAsset.authorityProfile?.humanOverrideAuthority || ''}
                  onChange={e => setEditingAsset({
                    ...editingAsset,
                    authorityProfile: { ...(editingAsset.authorityProfile || defaultAuthorityProfile()), humanOverrideAuthority: e.target.value },
                  })}
                />
                <Select
                  label="Kill Switch Authority (optional)"
                  options={userOptions}
                  value={editingAsset.authorityProfile?.killSwitchAuthority || ''}
                  onChange={e => setEditingAsset({
                    ...editingAsset,
                    authorityProfile: { ...(editingAsset.authorityProfile || defaultAuthorityProfile()), killSwitchAuthority: e.target.value },
                  })}
                />
                <Select
                  label="Reassessment Authority (optional)"
                  options={userOptions}
                  value={editingAsset.authorityProfile?.reassessmentAuthority || ''}
                  onChange={e => setEditingAsset({
                    ...editingAsset,
                    authorityProfile: { ...(editingAsset.authorityProfile || defaultAuthorityProfile()), reassessmentAuthority: e.target.value },
                  })}
                />
              </div>
            </div>

            {/* Release 1 — Oversight & Autonomy Sections */}
            <div className="pt-2 border-t border-[var(--border-color)]">
              <h4 className="text-xs font-bold uppercase text-[var(--text-secondary)] tracking-wider mb-3">
                Human Oversight &amp; Autonomy
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Human Oversight Classification"
                  options={oversightOptions}
                  value={editingAsset.oversightType || 'Human-in-the-Loop'}
                  onChange={e => setEditingAsset({ ...editingAsset, oversightType: e.target.value as HumanOversightType })}
                />
                <Select
                  label="Autonomy Level"
                  options={autonomyOptions}
                  value={String(editingAsset.autonomyLevel ?? 1)}
                  onChange={e => setEditingAsset({ ...editingAsset, autonomyLevel: Number(e.target.value) as AutonomyLevel })}
                />
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-2">
                Authority Matrix reference for {editingAsset.riskLevel || 'Medium'} risk: {getAuthorityMatrixEntry(editingAsset.riskLevel || 'Medium').oversightType} · {getAuthorityMatrixEntry(editingAsset.riskLevel || 'Medium').approvalAuthority}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingAsset.id ? 'Save Changes' : 'Register AI Asset'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
