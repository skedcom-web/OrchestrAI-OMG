import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { CompliancePackStatusBadge, ComplianceCoverageBadge } from '../components/ui/Badge';
import {
  getCompliancePacks,
  getComplianceRequirements,
  getPackControls,
  getEvidenceMappings,
  getEvidenceRecords,
  saveCompliancePack,
  saveComplianceRequirement,
  savePackControl,
  saveEvidenceMapping,
  deleteEvidenceMapping,
  getPackCoverage,
  getRequirementCoverage,
  getPackGapsForPack,
} from '../services/storageService';
import type { CompliancePack, ComplianceRequirement, PackControl } from '../types';

type WorkspaceTab = 'requirements' | 'controls' | 'evidence' | 'coverage' | 'gaps';

const TABS: { key: WorkspaceTab; label: string; icon: string }[] = [
  { key: 'requirements', label: 'Requirements', icon: '📋' },
  { key: 'controls', label: 'Controls', icon: '🧱' },
  { key: 'evidence', label: 'Evidence', icon: '🗃️' },
  { key: 'coverage', label: 'Coverage', icon: '✅' },
  { key: 'gaps', label: 'Gaps', icon: '🚨' },
];

/**
 * OMG Release 5 — Universal Compliance Pack Framework.
 *
 * Capability 1 (Pack Registry) plus Capability 7 (the Compliance Assessment
 * Workspace: Requirements, Controls, Evidence, Coverage, Gaps) for a
 * selected pack. Framework only — RBI FREE-AI / ISO 42001 / EU AI Act
 * content lands in future releases as data here, not a redesign.
 */
export const CompliancePackWorkspacePage: React.FC = () => {
  const [packs, setPacks] = useState<CompliancePack[]>(() => getCompliancePacks());
  const [selectedPackId, setSelectedPackId] = useState<string>(packs[0]?.id || '');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('requirements');
  const [evidenceRecords] = useState(() => getEvidenceRecords());

  const [isPackModalOpen, setIsPackModalOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<Partial<CompliancePack> | null>(null);
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<Partial<ComplianceRequirement> | null>(null);
  const [isControlModalOpen, setIsControlModalOpen] = useState(false);
  const [editingControl, setEditingControl] = useState<Partial<PackControl> | null>(null);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [mappingControlId, setMappingControlId] = useState('');
  const [mappingEvidenceId, setMappingEvidenceId] = useState('');

  const refreshPacks = () => setPacks(getCompliancePacks());
  const [, forceRefresh] = useState(0);
  const refreshAll = () => forceRefresh(v => v + 1);

  const selectedPack = packs.find(p => p.id === selectedPackId) || null;
  const requirements = getComplianceRequirements().filter(r => r.packId === selectedPackId);
  const controls = getPackControls().filter(c => requirements.some(r => r.id === c.requirementId));
  const mappings = getEvidenceMappings();
  const gaps = selectedPackId ? getPackGapsForPack(selectedPackId) : [];

  const handleSavePack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPack?.name) return;

    const persisting = saveCompliancePack(editingPack); // synchronous cache update happens before this line returns
    refreshPacks();
    setIsPackModalOpen(false);
    setEditingPack(null);

    try {
      const saved = await persisting;
      refreshPacks();
      setSelectedPackId(saved.id);
    } catch (err) {
      alert(`This compliance pack saved to the local cache but could not be synced to Neon: ${(err as Error).message}. It will not be visible on other devices until sync succeeds.`);
    }
  };

  const handleSaveRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReq?.name) return;

    const persisting = saveComplianceRequirement({ ...editingReq, packId: selectedPackId });
    refreshAll();
    setIsReqModalOpen(false);
    setEditingReq(null);

    try {
      await persisting;
      refreshAll();
    } catch (err) {
      alert(`This requirement saved to the local cache but could not be synced to Neon: ${(err as Error).message}. It will not be visible on other devices until sync succeeds.`);
    }
  };

  const handleSaveControl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingControl?.name || !editingControl?.requirementId) return;

    const persisting = savePackControl(editingControl);
    refreshAll();
    setIsControlModalOpen(false);
    setEditingControl(null);

    try {
      await persisting;
      refreshAll();
    } catch (err) {
      alert(`This control saved to the local cache but could not be synced to Neon: ${(err as Error).message}. It will not be visible on other devices until sync succeeds.`);
    }
  };

  const handleSaveMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mappingControlId || !mappingEvidenceId) return;

    const persisting = saveEvidenceMapping({ controlId: mappingControlId, evidenceId: mappingEvidenceId });
    refreshAll();
    setIsMappingModalOpen(false);
    setMappingControlId('');
    setMappingEvidenceId('');

    try {
      await persisting;
      refreshAll();
    } catch (err) {
      alert(`This evidence mapping saved to the local cache but could not be synced to Neon: ${(err as Error).message}. It will not be visible on other devices until sync succeeds.`);
    }
  };

  const handleUnlinkMapping = async (id: string) => {
    const deleting = deleteEvidenceMapping(id); // synchronous cache removal happens before this line returns
    refreshAll();

    try {
      await deleting;
    } catch (err) {
      alert(`Removed from this device but could not be deleted on Neon: ${(err as Error).message}. It may reappear once sync succeeds.`);
      refreshAll();
    }
  };

  const packOptions = packs.map(p => ({ value: p.id, label: `${p.name} (${p.status})` }));

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Compliance Pack Framework</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            The reusable architecture every future regulation plugs into — Pack → Requirement → Control → Evidence.
          </p>
        </div>
        <Button
          onClick={() => { setEditingPack({ name: '', version: '1.0', status: 'Draft', owner: '', description: '', industry: 'Cross-Industry', effectiveDate: new Date().toISOString().split('T')[0] }); setIsPackModalOpen(true); }}
          icon={<span>➕</span>}
        >
          Register Compliance Pack
        </Button>
      </div>

      {/* Capability 1 — Compliance Pack Registry */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[var(--bg-badge)] border-b border-[var(--border-color)] text-xs uppercase font-bold text-[var(--text-muted)] tracking-wider">
              <tr>
                <th className="p-4">Pack</th>
                <th className="p-4">Version</th>
                <th className="p-4">Industry</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Status</th>
                <th className="p-4">Coverage</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {packs.map(pack => {
                const coverage = getPackCoverage(pack.id);
                return (
                  <tr
                    key={pack.id}
                    onClick={() => { setSelectedPackId(pack.id); setActiveTab('requirements'); }}
                    className={`hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors ${selectedPackId === pack.id ? 'bg-[var(--bg-card-hover)]' : ''}`}
                  >
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[var(--text-primary)]">{pack.name}</span>
                        <span className="text-xs text-[var(--text-muted)]">{pack.id}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-[var(--text-secondary)]">{pack.version}</td>
                    <td className="p-4 text-xs text-[var(--text-secondary)]">{pack.industry}</td>
                    <td className="p-4 text-xs text-[var(--text-secondary)]">{pack.owner}</td>
                    <td className="p-4"><CompliancePackStatusBadge status={pack.status} size="sm" /></td>
                    <td className="p-4">{coverage && <ComplianceCoverageBadge status={coverage.status} size="sm" />}</td>
                    <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingPack({ ...pack }); setIsPackModalOpen(true); }}>Edit</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Capability 7 — Compliance Assessment Workspace */}
      {selectedPack && (
        <Card className="!p-0 overflow-hidden">
          <div className="p-5 border-b border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{selectedPack.name} Workspace</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{selectedPack.description}</p>
            </div>
            <div className="w-full sm:w-64">
              <Select options={packOptions} value={selectedPackId} onChange={e => { setSelectedPackId(e.target.value); setActiveTab('requirements'); }} />
            </div>
          </div>

          <div className="flex items-center gap-1 px-5 pt-3 border-b border-[var(--border-color)] overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-2 rounded-t-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer border-b-2 ${
                  activeTab === tab.key
                    ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === 'requirements' && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => { setEditingReq({ name: '', description: '', category: 'General', priority: 'Medium', status: 'Draft' }); setIsReqModalOpen(true); }}>
                    Add Requirement
                  </Button>
                </div>
                {requirements.length === 0 ? (
                  <span className="text-sm text-[var(--text-muted)] italic">No requirements registered for this pack yet.</span>
                ) : (
                  requirements.map(req => {
                    const coverage = getRequirementCoverage(req.id);
                    return (
                      <div key={req.id} className="p-3.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-[var(--text-muted)]">{req.id}</span>
                            <span className="font-bold text-sm text-[var(--text-primary)]">{req.name}</span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{req.description}</p>
                          <span className="text-[10px] text-[var(--text-muted)]">{req.category} • {req.priority} priority • {req.status}</span>
                        </div>
                        {coverage && <ComplianceCoverageBadge status={coverage.status} size="sm" />}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'controls' && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => { setEditingControl({ name: '', description: '', requirementId: requirements[0]?.id || '', owner: '', status: 'Draft' }); setIsControlModalOpen(true); }} disabled={requirements.length === 0}>
                    Add Control
                  </Button>
                </div>
                {controls.length === 0 ? (
                  <span className="text-sm text-[var(--text-muted)] italic">No controls defined for this pack's requirements yet.</span>
                ) : (
                  controls.map(control => (
                    <div key={control.id} className="p-3.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[var(--text-muted)]">{control.id}</span>
                        <span className="font-bold text-sm text-[var(--text-primary)]">{control.name}</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{control.description}</p>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        Requirement: {control.requirementName} • Owner: {control.owner || 'Unassigned'} • {control.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'evidence' && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => setIsMappingModalOpen(true)} disabled={controls.length === 0}>
                    Map Evidence to Control
                  </Button>
                </div>
                {controls.length === 0 ? (
                  <span className="text-sm text-[var(--text-muted)] italic">Add controls first, then map evidence to them.</span>
                ) : (
                  controls.map(control => {
                    const controlMappings = mappings.filter(m => m.controlId === control.id);
                    return (
                      <div key={control.id} className="p-3.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)]">
                        <span className="font-bold text-sm text-[var(--text-primary)]">{control.name}</span>
                        <div className="flex flex-col gap-1.5 mt-2">
                          {controlMappings.length === 0 ? (
                            <span className="text-xs text-[var(--text-muted)] italic">No evidence mapped.</span>
                          ) : (
                            controlMappings.map(m => (
                              <div key={m.id} className="flex items-center justify-between gap-2 text-xs p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                                <span className="text-[var(--text-primary)] font-semibold truncate">{m.evidenceName}</span>
                                <Button size="sm" variant="ghost" onClick={() => handleUnlinkMapping(m.id)}>Unlink</Button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'coverage' && (
              <div className="flex flex-col gap-4">
                {(() => {
                  const packCoverage = getPackCoverage(selectedPackId);
                  return packCoverage && (
                    <div className="p-4 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase text-[var(--text-muted)]">Overall Pack Coverage</span>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{packCoverage.controlsCovered} of {packCoverage.controlsTotal} controls covered</p>
                      </div>
                      <ComplianceCoverageBadge status={packCoverage.status} />
                    </div>
                  );
                })()}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {requirements.map(req => {
                    const coverage = getRequirementCoverage(req.id);
                    return coverage ? (
                      <div key={req.id} className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[var(--text-primary)] truncate">{req.name}</span>
                        <ComplianceCoverageBadge status={coverage.status} size="sm" />
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {activeTab === 'gaps' && (
              <div className="flex flex-col gap-2">
                {gaps.length === 0 ? (
                  <span className="text-sm text-emerald-500 font-semibold">✓ No compliance gaps detected for this pack.</span>
                ) : (
                  gaps.map((gap, i) => (
                    <div key={i} className="text-xs p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
                      <span className="font-bold">{gap.gapType}:</span> {gap.detail}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Pack Modal */}
      {isPackModalOpen && editingPack && (
        <Modal isOpen={isPackModalOpen} onClose={() => setIsPackModalOpen(false)} title={editingPack.id ? 'Edit Compliance Pack' : 'Register Compliance Pack'} maxWidth="lg">
          <form onSubmit={handleSavePack} className="flex flex-col gap-4 py-2">
            <Input label="Pack Name" required value={editingPack.name || ''} onChange={e => setEditingPack({ ...editingPack, name: e.target.value })} placeholder="e.g. RBI Demo Pack" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Version" value={editingPack.version || '1.0'} onChange={e => setEditingPack({ ...editingPack, version: e.target.value })} />
              <Select label="Status" options={[{ value: 'Draft', label: 'Draft' }, { value: 'Active', label: 'Active' }, { value: 'Retired', label: 'Retired' }]} value={editingPack.status || 'Draft'} onChange={e => setEditingPack({ ...editingPack, status: e.target.value as CompliancePack['status'] })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Owner" value={editingPack.owner || ''} onChange={e => setEditingPack({ ...editingPack, owner: e.target.value })} placeholder="e.g. David Chen" />
              <Input label="Industry" value={editingPack.industry || ''} onChange={e => setEditingPack({ ...editingPack, industry: e.target.value })} />
            </div>
            <Input label="Effective Date" type="date" value={editingPack.effectiveDate || ''} onChange={e => setEditingPack({ ...editingPack, effectiveDate: e.target.value })} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
              <textarea rows={2} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" value={editingPack.description || ''} onChange={e => setEditingPack({ ...editingPack, description: e.target.value })} />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
              <Button type="button" variant="ghost" onClick={() => setIsPackModalOpen(false)}>Cancel</Button>
              <Button type="submit">{editingPack.id ? 'Save Changes' : 'Register Pack'}</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Requirement Modal */}
      {isReqModalOpen && editingReq && (
        <Modal isOpen={isReqModalOpen} onClose={() => setIsReqModalOpen(false)} title="Add Requirement" subtitle={`Pack: ${selectedPack?.name}`} maxWidth="lg">
          <form onSubmit={handleSaveRequirement} className="flex flex-col gap-4 py-2">
            <Input label="Requirement ID (optional)" value={editingReq.id || ''} onChange={e => setEditingReq({ ...editingReq, id: e.target.value })} placeholder="e.g. RBI-REQ-003" />
            <Input label="Requirement Name" required value={editingReq.name || ''} onChange={e => setEditingReq({ ...editingReq, name: e.target.value })} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
              <textarea rows={2} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" value={editingReq.description || ''} onChange={e => setEditingReq({ ...editingReq, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Category" value={editingReq.category || ''} onChange={e => setEditingReq({ ...editingReq, category: e.target.value })} />
              <Select label="Priority" options={['Low', 'Medium', 'High', 'Critical'].map(v => ({ value: v, label: v }))} value={editingReq.priority || 'Medium'} onChange={e => setEditingReq({ ...editingReq, priority: e.target.value as ComplianceRequirement['priority'] })} />
              <Select label="Status" options={['Draft', 'Active', 'Retired'].map(v => ({ value: v, label: v }))} value={editingReq.status || 'Draft'} onChange={e => setEditingReq({ ...editingReq, status: e.target.value as ComplianceRequirement['status'] })} />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
              <Button type="button" variant="ghost" onClick={() => setIsReqModalOpen(false)}>Cancel</Button>
              <Button type="submit">Add Requirement</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Control Modal */}
      {isControlModalOpen && editingControl && (
        <Modal isOpen={isControlModalOpen} onClose={() => setIsControlModalOpen(false)} title="Add Control" subtitle={`Pack: ${selectedPack?.name}`} maxWidth="lg">
          <form onSubmit={handleSaveControl} className="flex flex-col gap-4 py-2">
            <Input label="Control Name" required value={editingControl.name || ''} onChange={e => setEditingControl({ ...editingControl, name: e.target.value })} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
              <textarea rows={2} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" value={editingControl.description || ''} onChange={e => setEditingControl({ ...editingControl, description: e.target.value })} />
            </div>
            <Select label="Requirement" required options={requirements.map(r => ({ value: r.id, label: `${r.id} — ${r.name}` }))} value={editingControl.requirementId || ''} onChange={e => setEditingControl({ ...editingControl, requirementId: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Owner" value={editingControl.owner || ''} onChange={e => setEditingControl({ ...editingControl, owner: e.target.value })} />
              <Select label="Status" options={['Draft', 'Active', 'Retired'].map(v => ({ value: v, label: v }))} value={editingControl.status || 'Draft'} onChange={e => setEditingControl({ ...editingControl, status: e.target.value as PackControl['status'] })} />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
              <Button type="button" variant="ghost" onClick={() => setIsControlModalOpen(false)}>Cancel</Button>
              <Button type="submit">Add Control</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Evidence Mapping Modal */}
      {isMappingModalOpen && (
        <Modal isOpen={isMappingModalOpen} onClose={() => setIsMappingModalOpen(false)} title="Map Evidence to Control" subtitle="Reuse an existing evidence record — collect once, apply everywhere." maxWidth="lg">
          <form onSubmit={handleSaveMapping} className="flex flex-col gap-4 py-2">
            <Select label="Control" required options={controls.map(c => ({ value: c.id, label: c.name }))} value={mappingControlId} onChange={e => setMappingControlId(e.target.value)} />
            <Select label="Evidence Record" required options={evidenceRecords.map(e => ({ value: e.id, label: `${e.name} (${e.status})` }))} value={mappingEvidenceId} onChange={e => setMappingEvidenceId(e.target.value)} />
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
              <Button type="button" variant="ghost" onClick={() => setIsMappingModalOpen(false)}>Cancel</Button>
              <Button type="submit">Map Evidence</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
