import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { getEvidence, saveEvidence, getAssets } from '../services/storageService';
import type { EvidenceDocument, EvidenceCategory, GovernanceDeliverableType } from '../types';

export const EvidenceCenterPage: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<EvidenceDocument[]>(() => getEvidence());
  const [assets] = useState(() => getAssets());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const [newEvd, setNewEvd] = useState<Partial<EvidenceDocument>>({
    title: '',
    category: 'Security Evidence',
    deliverableType: 'Security Review Document',
    assetId: assets[0]?.id || '',
    uploadedBy: 'Sarah Jenkins',
    version: '1.0',
    status: 'Submitted',
    description: '',
  });

  const refreshEvidence = () => {
    setEvidenceList(getEvidence());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find(a => a.id === newEvd.assetId);
    saveEvidence({
      ...newEvd,
      assetName: asset?.name || 'AI Asset',
    });
    refreshEvidence();
    setIsModalOpen(false);
  };

  const deliverablesList: GovernanceDeliverableType[] = [
    'Executive Solution Blueprint',
    'Functional Requirements Specification',
    'Solution Architecture Blueprint',
    'Database Design Document',
    'API Design Specification',
    'Security Review Document',
    'Test Strategy & Evidence',
    'Deployment Blueprint',
    'Production Readiness Assessment',
    'Project Closure Report',
  ];

  const categories: EvidenceCategory[] = [
    'Business Evidence', 'Technical Evidence', 'Security Evidence',
    'Compliance Evidence', 'Operational Evidence', 'Model Evidence'
  ];

  const filtered = evidenceList.filter(e => 
    filterCategory === 'All' || e.category === filterCategory
  );

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Evidence Center</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Central Repository for Governance Evidence • Aligned with OrchestrAI Governance Blueprint v1
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={<span>📄</span>}>
          Submit Governance Evidence
        </Button>
      </div>

      {/* Blueprint v1 Banner */}
      <Card className="!p-4 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 border-[var(--accent-border)]">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📜</span>
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">Universal Governance Standard (ODF v1.0)</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Every governed AI build must satisfy the 10 mandatory deliverables to support proof-based decision governance.
            </p>
          </div>
        </div>
      </Card>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterCategory('All')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            filterCategory === 'All'
              ? 'bg-[var(--accent-primary)] text-white shadow-sm'
              : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          All Categories ({evidenceList.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filterCategory === cat
                ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            {cat} ({evidenceList.filter(e => e.category === cat).length})
          </button>
        ))}
      </div>

      {/* Evidence Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[var(--bg-badge)] border-b border-[var(--border-color)] text-xs uppercase font-bold text-[var(--text-muted)]">
              <tr>
                <th className="p-4">Evidence Title & Deliverable</th>
                <th className="p-4">Governance Category</th>
                <th className="p-4">AI Asset</th>
                <th className="p-4">Uploaded By</th>
                <th className="p-4">Version</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Upload Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filtered.map(evd => (
                <tr key={evd.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-[var(--text-primary)]">{evd.title}</span>
                      <span className="text-[10px] font-extrabold text-[var(--accent-primary)]">
                        {evd.deliverableType}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md bg-[var(--bg-badge)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)]">
                      {evd.category}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-bold text-[var(--text-primary)]">{evd.assetName}</td>
                  <td className="p-4 text-xs text-[var(--text-secondary)]">{evd.uploadedBy}</td>
                  <td className="p-4 text-xs font-bold text-[var(--text-primary)]">v{evd.version}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      evd.status === 'Approved'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : evd.status === 'Rejected'
                        ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                        : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                    }`}>
                      {evd.status}
                    </span>
                  </td>
                  <td className="p-4 text-right text-xs text-[var(--text-muted)]">{evd.uploadDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* UPLOAD EVIDENCE MODAL */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Submit Governance Evidence Document"
          subtitle="Map to Mandatory Governance Deliverables"
          maxWidth="md"
        >
          <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
            <Input
              label="Evidence Title / Document Name"
              required
              value={newEvd.title || ''}
              onChange={e => setNewEvd({ ...newEvd, title: e.target.value })}
              placeholder="e.g. Architecture Security Review & Threat Model"
            />
            <Select
              label="Mandatory ODF Governance Deliverable Type"
              value={newEvd.deliverableType}
              onChange={e => setNewEvd({ ...newEvd, deliverableType: e.target.value as GovernanceDeliverableType })}
              options={deliverablesList.map(d => ({ value: d, label: d }))}
            />
            <Select
              label="Evidence Category"
              value={newEvd.category}
              onChange={e => setNewEvd({ ...newEvd, category: e.target.value as EvidenceCategory })}
              options={categories.map(c => ({ value: c, label: c }))}
            />
            <Select
              label="Associated AI Asset"
              value={newEvd.assetId}
              onChange={e => setNewEvd({ ...newEvd, assetId: e.target.value })}
              options={assets.map(a => ({ value: a.id, label: `${a.name} (${a.type})` }))}
            />
            <Input
              label="Document Version"
              value={newEvd.version || '1.0'}
              onChange={e => setNewEvd({ ...newEvd, version: e.target.value })}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Evidence Description & Summary</label>
              <textarea
                rows={3}
                required
                value={newEvd.description || ''}
                onChange={e => setNewEvd({ ...newEvd, description: e.target.value })}
                placeholder="Provide executive summary of evidence artifact..."
                className="w-full p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Submit Evidence Artifact</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
