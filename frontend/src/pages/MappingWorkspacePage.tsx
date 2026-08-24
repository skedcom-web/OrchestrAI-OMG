import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { RegulatorySourceStatusBadge, ComplianceCoverageBadge } from '../components/ui/Badge';
import {
  getRegulatorySources,
  getRegulatoryRequirements,
  getObligations,
  getObligationControls,
  getObligationEvidenceMappings,
  getEvidenceRecords,
  saveRegulatorySource,
  saveRegulatoryRequirement,
  saveObligation,
  saveObligationControl,
  saveObligationEvidenceMapping,
  deleteObligationEvidenceMapping,
  getSourceCoverage,
  getRegulatoryRequirementCoverage,
  getObligationCoverage,
  getSourceGapsForSource,
} from '../services/storageService';
import type { RegulatorySource, RegulatoryRequirement, Obligation, ObligationControl } from '../types';

type WorkspaceTab = 'requirements' | 'obligations' | 'controls' | 'evidence' | 'coverage' | 'gaps';

const TABS: { key: WorkspaceTab; label: string; icon: string }[] = [
  { key: 'requirements', label: 'Requirements', icon: '📋' },
  { key: 'obligations', label: 'Obligations', icon: '🎯' },
  { key: 'controls', label: 'Controls', icon: '🧱' },
  { key: 'evidence', label: 'Evidence', icon: '🗃️' },
  { key: 'coverage', label: 'Coverage', icon: '✅' },
  { key: 'gaps', label: 'Gaps', icon: '🚨' },
];

/**
 * OMG Release 6 — Universal Regulatory Knowledge & Obligation Engine.
 *
 * Source Registry plus the full Mapping Workspace: Requirements,
 * Obligations, Controls, Evidence, Coverage, Gaps for a selected source.
 * Foundation only — a future regulation (Release 9+) plugs in as data here,
 * not a platform redesign. Neon-backed from day one: every save is async and
 * Neon-first, mirroring the Release 5.1-corrected pattern from the start.
 */
export const MappingWorkspacePage: React.FC = () => {
  const [sources, setSources] = useState<RegulatorySource[]>(() => getRegulatorySources());
  const [selectedSourceId, setSelectedSourceId] = useState<string>(sources[0]?.id || '');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('requirements');
  const [evidenceRecords] = useState(() => getEvidenceRecords());

  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Partial<RegulatorySource> | null>(null);
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<Partial<RegulatoryRequirement> | null>(null);
  const [isObligationModalOpen, setIsObligationModalOpen] = useState(false);
  const [editingObligation, setEditingObligation] = useState<Partial<Obligation> | null>(null);
  const [isControlModalOpen, setIsControlModalOpen] = useState(false);
  const [editingControl, setEditingControl] = useState<Partial<ObligationControl> | null>(null);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [mappingControlId, setMappingControlId] = useState('');
  const [mappingEvidenceId, setMappingEvidenceId] = useState('');

  const refreshSources = () => setSources(getRegulatorySources());
  const [, forceRefresh] = useState(0);
  const refreshAll = () => forceRefresh(v => v + 1);

  const selectedSource = sources.find(s => s.id === selectedSourceId) || null;
  const requirements = getRegulatoryRequirements().filter(r => r.sourceId === selectedSourceId);
  const obligations = getObligations().filter(o => requirements.some(r => r.id === o.requirementId));
  const controls = getObligationControls().filter(c => obligations.some(o => o.id === c.obligationId));
  const mappings = getObligationEvidenceMappings();
  const gaps = selectedSourceId ? getSourceGapsForSource(selectedSourceId) : [];

  const handleSaveSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSource?.name) return;

    const persisting = saveRegulatorySource(editingSource); // synchronous cache update happens before this line returns
    refreshSources();
    setIsSourceModalOpen(false);
    setEditingSource(null);

    try {
      const saved = await persisting;
      refreshSources();
      setSelectedSourceId(saved.id);
    } catch (err) {
      alert(`This regulatory source saved to the local cache but could not be synced to Neon: ${(err as Error).message}. It will not be visible on other devices until sync succeeds.`);
    }
  };

  const handleSaveRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReq?.name) return;

    const persisting = saveRegulatoryRequirement({ ...editingReq, sourceId: selectedSourceId });
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

  const handleSaveObligation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingObligation?.name || !editingObligation?.requirementId) return;

    const persisting = saveObligation(editingObligation);
    refreshAll();
    setIsObligationModalOpen(false);
    setEditingObligation(null);

    try {
      await persisting;
      refreshAll();
    } catch (err) {
      alert(`This obligation saved to the local cache but could not be synced to Neon: ${(err as Error).message}. It will not be visible on other devices until sync succeeds.`);
    }
  };

  const handleSaveControl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingControl?.name || !editingControl?.obligationId) return;

    const persisting = saveObligationControl(editingControl);
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

    const persisting = saveObligationEvidenceMapping({ controlId: mappingControlId, evidenceId: mappingEvidenceId });
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
    const deleting = deleteObligationEvidenceMapping(id); // synchronous cache removal happens before this line returns
    refreshAll();

    try {
      await deleting;
    } catch (err) {
      alert(`Removed from this device but could not be deleted on Neon: ${(err as Error).message}. It may reappear once sync succeeds.`);
      refreshAll();
    }
  };

  const sourceOptions = sources.map(s => ({ value: s.id, label: `${s.name} (${s.status})` }));

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Mapping Workspace</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            The reusable foundation every future regulation plugs into — Source → Requirement → Obligation → Control → Evidence.
          </p>
        </div>
        <Button
          onClick={() => { setEditingSource({ name: '', sourceType: 'Regulation', status: 'Draft', jurisdiction: '', industry: 'Cross-Industry', version: '1.0', effectiveDate: new Date().toISOString().split('T')[0] }); setIsSourceModalOpen(true); }}
          icon={<span>➕</span>}
        >
          Register Regulatory Source
        </Button>
      </div>

      {/* Capability 1 — Regulatory Source Registry */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[var(--bg-badge)] border-b border-[var(--border-color)] text-xs uppercase font-bold text-[var(--text-muted)] tracking-wider">
              <tr>
                <th className="p-4">Source</th>
                <th className="p-4">Type</th>
                <th className="p-4">Jurisdiction</th>
                <th className="p-4">Industry</th>
                <th className="p-4">Status</th>
                <th className="p-4">Coverage</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {sources.map(source => {
                const coverage = getSourceCoverage(source.id);
                return (
                  <tr
                    key={source.id}
                    onClick={() => { setSelectedSourceId(source.id); setActiveTab('requirements'); }}
                    className={`hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors ${selectedSourceId === source.id ? 'bg-[var(--bg-card-hover)]' : ''}`}
                  >
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[var(--text-primary)]">{source.name}</span>
                        <span className="text-xs text-[var(--text-muted)]">{source.id}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-[var(--text-secondary)]">{source.sourceType}</td>
                    <td className="p-4 text-xs text-[var(--text-secondary)]">{source.jurisdiction}</td>
                    <td className="p-4 text-xs text-[var(--text-secondary)]">{source.industry}</td>
                    <td className="p-4"><RegulatorySourceStatusBadge status={source.status} size="sm" /></td>
                    <td className="p-4">{coverage && <ComplianceCoverageBadge status={coverage.status} size="sm" />}</td>
                    <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingSource({ ...source }); setIsSourceModalOpen(true); }}>Edit</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mapping Workspace */}
      {selectedSource && (
        <Card className="!p-0 overflow-hidden">
          <div className="p-5 border-b border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{selectedSource.name} Workspace</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{selectedSource.jurisdiction} · {selectedSource.industry} · v{selectedSource.version}</p>
            </div>
            <div className="w-full sm:w-64">
              <Select options={sourceOptions} value={selectedSourceId} onChange={e => { setSelectedSourceId(e.target.value); setActiveTab('requirements'); }} />
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
                  <Button size="sm" onClick={() => { setEditingReq({ name: '', description: '', category: 'General', criticality: 'Medium', status: 'Draft' }); setIsReqModalOpen(true); }}>
                    Add Requirement
                  </Button>
                </div>
                {requirements.length === 0 ? (
                  <span className="text-sm text-[var(--text-muted)] italic">No requirements registered for this source yet.</span>
                ) : (
                  requirements.map(req => {
                    const coverage = getRegulatoryRequirementCoverage(req.id);
                    return (
                      <div key={req.id} className="p-3.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-[var(--text-muted)]">{req.id}</span>
                            <span className="font-bold text-sm text-[var(--text-primary)]">{req.name}</span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{req.description}</p>
                          <span className="text-[10px] text-[var(--text-muted)]">{req.category} • {req.criticality} criticality • {req.status}</span>
                        </div>
                        {coverage && <ComplianceCoverageBadge status={coverage.status} size="sm" />}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'obligations' && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => { setEditingObligation({ name: '', description: '', requirementId: requirements[0]?.id || '', owner: '', status: 'Draft' }); setIsObligationModalOpen(true); }} disabled={requirements.length === 0}>
                    Add Obligation
                  </Button>
                </div>
                {obligations.length === 0 ? (
                  <span className="text-sm text-[var(--text-muted)] italic">No obligations translated from this source's requirements yet.</span>
                ) : (
                  obligations.map(obligation => {
                    const coverage = getObligationCoverage(obligation.id);
                    return (
                      <div key={obligation.id} className="p-3.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-[var(--text-muted)]">{obligation.id}</span>
                            <span className="font-bold text-sm text-[var(--text-primary)]">{obligation.name}</span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{obligation.description}</p>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            Requirement: {obligation.requirementName} • Owner: {obligation.owner || 'Unassigned'} • {obligation.status}
                          </span>
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
                  <Button size="sm" onClick={() => { setEditingControl({ name: '', description: '', obligationId: obligations[0]?.id || '', owner: '', status: 'Draft' }); setIsControlModalOpen(true); }} disabled={obligations.length === 0}>
                    Add Control
                  </Button>
                </div>
                {controls.length === 0 ? (
                  <span className="text-sm text-[var(--text-muted)] italic">No controls mapped to this source's obligations yet.</span>
                ) : (
                  controls.map(control => (
                    <div key={control.id} className="p-3.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[var(--text-muted)]">{control.id}</span>
                        <span className="font-bold text-sm text-[var(--text-primary)]">{control.name}</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{control.description}</p>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        Obligation: {control.obligationName} • Owner: {control.owner || 'Unassigned'} • {control.status}
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
                  const sourceCoverage = getSourceCoverage(selectedSourceId);
                  return sourceCoverage && (
                    <div className="p-4 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase text-[var(--text-muted)]">Overall Source Coverage</span>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{sourceCoverage.controlsCovered} of {sourceCoverage.controlsTotal} controls covered</p>
                      </div>
                      <ComplianceCoverageBadge status={sourceCoverage.status} />
                    </div>
                  );
                })()}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {requirements.map(req => {
                    const coverage = getRegulatoryRequirementCoverage(req.id);
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
                  <span className="text-sm text-emerald-500 font-semibold">✓ No regulatory gaps detected for this source.</span>
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

      {/* Source Modal */}
      {isSourceModalOpen && editingSource && (
        <Modal isOpen={isSourceModalOpen} onClose={() => setIsSourceModalOpen(false)} title={editingSource.id ? 'Edit Regulatory Source' : 'Register Regulatory Source'} maxWidth="lg">
          <form onSubmit={handleSaveSource} className="flex flex-col gap-4 py-2">
            <Input label="Source Name" required value={editingSource.name || ''} onChange={e => setEditingSource({ ...editingSource, name: e.target.value })} placeholder="e.g. Sample Regulatory Source" />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Source Type" options={['Regulation', 'Standard', 'Framework', 'Internal Policy', 'Guidance'].map(v => ({ value: v, label: v }))} value={editingSource.sourceType || 'Regulation'} onChange={e => setEditingSource({ ...editingSource, sourceType: e.target.value as RegulatorySource['sourceType'] })} />
              <Select label="Status" options={['Draft', 'Active', 'Superseded', 'Retired'].map(v => ({ value: v, label: v }))} value={editingSource.status || 'Draft'} onChange={e => setEditingSource({ ...editingSource, status: e.target.value as RegulatorySource['status'] })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Jurisdiction" value={editingSource.jurisdiction || ''} onChange={e => setEditingSource({ ...editingSource, jurisdiction: e.target.value })} placeholder="e.g. Cross-Jurisdiction" />
              <Input label="Industry" value={editingSource.industry || ''} onChange={e => setEditingSource({ ...editingSource, industry: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Version" value={editingSource.version || '1.0'} onChange={e => setEditingSource({ ...editingSource, version: e.target.value })} />
              <Input label="Effective Date" type="date" value={editingSource.effectiveDate || ''} onChange={e => setEditingSource({ ...editingSource, effectiveDate: e.target.value })} />
              <Input label="Review Date" type="date" value={editingSource.reviewDate || ''} onChange={e => setEditingSource({ ...editingSource, reviewDate: e.target.value })} />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
              <Button type="button" variant="ghost" onClick={() => setIsSourceModalOpen(false)}>Cancel</Button>
              <Button type="submit">{editingSource.id ? 'Save Changes' : 'Register Source'}</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Requirement Modal */}
      {isReqModalOpen && editingReq && (
        <Modal isOpen={isReqModalOpen} onClose={() => setIsReqModalOpen(false)} title="Add Requirement" subtitle={`Source: ${selectedSource?.name}`} maxWidth="lg">
          <form onSubmit={handleSaveRequirement} className="flex flex-col gap-4 py-2">
            <Input label="Requirement ID (optional)" value={editingReq.id || ''} onChange={e => setEditingReq({ ...editingReq, id: e.target.value })} placeholder="e.g. REQ-OVERSIGHT-002" />
            <Input label="Requirement Name" required value={editingReq.name || ''} onChange={e => setEditingReq({ ...editingReq, name: e.target.value })} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
              <textarea rows={2} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" value={editingReq.description || ''} onChange={e => setEditingReq({ ...editingReq, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Category" value={editingReq.category || ''} onChange={e => setEditingReq({ ...editingReq, category: e.target.value })} />
              <Select label="Criticality" options={['Low', 'Medium', 'High', 'Critical'].map(v => ({ value: v, label: v }))} value={editingReq.criticality || 'Medium'} onChange={e => setEditingReq({ ...editingReq, criticality: e.target.value as RegulatoryRequirement['criticality'] })} />
              <Select label="Status" options={['Draft', 'Active', 'Retired'].map(v => ({ value: v, label: v }))} value={editingReq.status || 'Draft'} onChange={e => setEditingReq({ ...editingReq, status: e.target.value as RegulatoryRequirement['status'] })} />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
              <Button type="button" variant="ghost" onClick={() => setIsReqModalOpen(false)}>Cancel</Button>
              <Button type="submit">Add Requirement</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Obligation Modal */}
      {isObligationModalOpen && editingObligation && (
        <Modal isOpen={isObligationModalOpen} onClose={() => setIsObligationModalOpen(false)} title="Add Obligation" subtitle={`Source: ${selectedSource?.name}`} maxWidth="lg">
          <form onSubmit={handleSaveObligation} className="flex flex-col gap-4 py-2">
            <Input label="Obligation Name" required value={editingObligation.name || ''} onChange={e => setEditingObligation({ ...editingObligation, name: e.target.value })} placeholder="e.g. Named Owner" />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
              <textarea rows={2} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" value={editingObligation.description || ''} onChange={e => setEditingObligation({ ...editingObligation, description: e.target.value })} />
            </div>
            <Select label="Requirement" required options={requirements.map(r => ({ value: r.id, label: `${r.id} — ${r.name}` }))} value={editingObligation.requirementId || ''} onChange={e => setEditingObligation({ ...editingObligation, requirementId: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Owner" value={editingObligation.owner || ''} onChange={e => setEditingObligation({ ...editingObligation, owner: e.target.value })} />
              <Select label="Status" options={['Draft', 'Active', 'Retired'].map(v => ({ value: v, label: v }))} value={editingObligation.status || 'Draft'} onChange={e => setEditingObligation({ ...editingObligation, status: e.target.value as Obligation['status'] })} />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
              <Button type="button" variant="ghost" onClick={() => setIsObligationModalOpen(false)}>Cancel</Button>
              <Button type="submit">Add Obligation</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Control Modal */}
      {isControlModalOpen && editingControl && (
        <Modal isOpen={isControlModalOpen} onClose={() => setIsControlModalOpen(false)} title="Add Control" subtitle={`Source: ${selectedSource?.name}`} maxWidth="lg">
          <form onSubmit={handleSaveControl} className="flex flex-col gap-4 py-2">
            <Input label="Control Name" required value={editingControl.name || ''} onChange={e => setEditingControl({ ...editingControl, name: e.target.value })} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
              <textarea rows={2} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" value={editingControl.description || ''} onChange={e => setEditingControl({ ...editingControl, description: e.target.value })} />
            </div>
            <Select label="Obligation" required options={obligations.map(o => ({ value: o.id, label: `${o.id} — ${o.name}` }))} value={editingControl.obligationId || ''} onChange={e => setEditingControl({ ...editingControl, obligationId: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Owner" value={editingControl.owner || ''} onChange={e => setEditingControl({ ...editingControl, owner: e.target.value })} />
              <Select label="Status" options={['Draft', 'Active', 'Retired'].map(v => ({ value: v, label: v }))} value={editingControl.status || 'Draft'} onChange={e => setEditingControl({ ...editingControl, status: e.target.value as ObligationControl['status'] })} />
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
