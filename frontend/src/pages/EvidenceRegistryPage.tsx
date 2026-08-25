import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { EvidenceStatusBadge, EvidenceExpiryBadge, ReadinessBadge } from '../components/ui/Badge';
import { getAssets, getEvidenceRecords, getEvidenceTimeline, saveEvidenceRecord, deleteEvidenceRecord, getEvidenceReadiness } from '../services/storageService';
import { EVIDENCE_TYPES, EVIDENCE_STATUSES, getExpiryIndicator, daysRemaining } from '../config/evidenceFoundation';
import { useAuth } from '../contexts/AuthContext';
import type { EvidenceRecord, EvidenceRecordType, EvidenceRecordStatus } from '../types';

/**
 * OMG Release 3 — Evidence Registry.
 *
 * The universal governance evidence object: registry, detail and timeline in
 * one module. Evidence links to an AI asset and, optionally, to the risk
 * assessment, governance review, decision, reauthorization or timeline event
 * it supports.
 */
export const EvidenceRegistryPage: React.FC = () => {
  const navigate = useNavigate();
  const { canPerform } = useAuth();
  const [assets] = useState(() => getAssets());
  const [records, setRecords] = useState<EvidenceRecord[]>(() => getEvidenceRecords());

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Partial<EvidenceRecord> | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<EvidenceRecord | null>(null);

  const refresh = () => setRecords(getEvidenceRecords());

  const handleOpenCreateModal = () => {
    setEditingRecord({
      name: '',
      evidenceType: 'Policy Document',
      status: 'Draft',
      createdDate: new Date().toISOString().split('T')[0],
      description: '',
      assetId: assets[0]?.id || '',
      ownership: { evidenceOwner: '' },
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: EvidenceRecord) => {
    setEditingRecord({ ...record });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord?.name || !editingRecord?.assetId || !editingRecord?.ownership?.evidenceOwner) return;

    const persisting = saveEvidenceRecord(editingRecord as any); // synchronous cache update happens before this line returns
    refresh();
    setIsModalOpen(false);
    setEditingRecord(null);

    try {
      await persisting;
      refresh();
    } catch (err) {
      alert(`This evidence record saved to the local cache but could not be synced to Neon: ${(err as Error).message}. It will not be visible on other devices until sync succeeds.`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this evidence record?')) return;

    const deleting = deleteEvidenceRecord(id); // synchronous cache removal happens before this line returns
    refresh();
    if (selectedRecord?.id === id) setSelectedRecord(null);

    try {
      await deleting;
    } catch (err) {
      alert(`Removed from this device but could not be deleted on Neon: ${(err as Error).message}. It may reappear once sync succeeds.`);
      refresh();
    }
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.assetName.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || r.evidenceType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const typeOptions = [{ value: 'ALL', label: 'All Evidence Types' }, ...EVIDENCE_TYPES.map(t => ({ value: t.type, label: `${t.icon} ${t.type}` }))];
  const statusOptions = [{ value: 'ALL', label: 'All Statuses' }, ...EVIDENCE_STATUSES.map(s => ({ value: s.status, label: `${s.icon} ${s.status}` }))];
  const assetOptions = assets.map(a => ({ value: a.id, label: `${a.name} (${a.type})` }));

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Evidence Registry</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            The universal governance evidence object — audit-ready, traceable, and linked to every AI asset
          </p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          icon={<span>➕</span>}
          disabled={!canPerform('evidenceRecord:create')}
          title={!canPerform('evidenceRecord:create') ? 'Your governance role does not permit registering new evidence records.' : undefined}
        >
          Register Evidence
        </Button>
      </div>

      <Card className="!p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search evidence by name, description, or asset..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-56">
          <Select options={typeOptions} value={typeFilter} onChange={e => setTypeFilter(e.target.value)} />
        </div>
        <div className="w-full md:w-48">
          <Select options={statusOptions} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} />
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[var(--bg-badge)] border-b border-[var(--border-color)] text-xs uppercase font-bold text-[var(--text-muted)] tracking-wider">
              <tr>
                <th className="p-4">Evidence Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Linked Asset</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Status</th>
                <th className="p-4">Expiry</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--text-muted)]">
                    No evidence records found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(record => (
                  <tr
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    className="hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[var(--text-primary)]">{record.name}</span>
                        <span className="text-xs text-[var(--text-muted)]">{record.id} • Created {record.createdDate}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md bg-[var(--bg-badge)] text-[var(--text-primary)] text-xs font-semibold border border-[var(--border-color)]">
                        {record.evidenceType}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-medium text-[var(--text-secondary)]">{record.assetName}</td>
                    <td className="p-4 text-xs font-medium text-[var(--text-secondary)]">{record.ownership.evidenceOwner}</td>
                    <td className="p-4"><EvidenceStatusBadge status={record.status} /></td>
                    <td className="p-4"><EvidenceExpiryBadge indicator={getExpiryIndicator(record.expiryDate)} size="sm" /></td>
                    <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEditModal(record)}
                          disabled={!canPerform('evidenceRecord:edit')}
                          title={!canPerform('evidenceRecord:edit') ? 'Your governance role does not permit editing evidence records.' : undefined}
                        >
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/assets?assetId=${record.assetId}`)}>Asset</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* EVIDENCE DETAIL + TIMELINE */}
      {selectedRecord && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title={selectedRecord.name}
          subtitle={`Evidence ID: ${selectedRecord.id} • Linked to ${selectedRecord.assetName}`}
          maxWidth="xl"
        >
          <div className="flex flex-col gap-6 py-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-[var(--bg-badge)] text-[var(--text-primary)] text-xs font-bold border border-[var(--border-color)]">
                {selectedRecord.evidenceType}
              </span>
              <EvidenceStatusBadge status={selectedRecord.status} />
              <EvidenceExpiryBadge indicator={getExpiryIndicator(selectedRecord.expiryDate)} />
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">Description</h4>
              <p className="text-sm text-[var(--text-primary)] mt-1 leading-relaxed">{selectedRecord.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)]">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Created Date</span>
                <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{selectedRecord.createdDate}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)]">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Expiry Date</span>
                <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                  {selectedRecord.expiryDate ? `${selectedRecord.expiryDate} (${daysRemaining(selectedRecord.expiryDate)} days)` : 'No expiry set'}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider mb-2">Evidence Ownership</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs">
                  <span className="text-[10px] text-[var(--text-muted)] block">Evidence Owner</span>
                  <span className="font-bold text-[var(--text-primary)]">{selectedRecord.ownership.evidenceOwner}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs">
                  <span className="text-[10px] text-[var(--text-muted)] block">Business Owner</span>
                  <span className="font-bold text-[var(--text-primary)]">{selectedRecord.ownership.businessOwner || 'Unassigned'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs">
                  <span className="text-[10px] text-[var(--text-muted)] block">Reviewer</span>
                  <span className="font-bold text-[var(--text-primary)]">{selectedRecord.ownership.reviewer || 'Unassigned'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs">
                  <span className="text-[10px] text-[var(--text-muted)] block">Approval Authority</span>
                  <span className="font-bold text-[var(--text-primary)]">{selectedRecord.ownership.approvalAuthority || 'Unassigned'}</span>
                </div>
              </div>
            </div>

            {selectedRecord.traceability && Object.values(selectedRecord.traceability).some(Boolean) && (
              <div>
                <h4 className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider mb-2">Evidence Traceability</h4>
                <div className="flex flex-col gap-1.5">
                  {selectedRecord.traceability.riskAssessmentRef && (
                    <div className="text-xs p-2 rounded-lg bg-[var(--bg-badge)] border border-[var(--border-color)]">
                      <span className="text-[10px] text-[var(--text-muted)] block">Risk Assessment</span>{selectedRecord.traceability.riskAssessmentRef}
                    </div>
                  )}
                  {selectedRecord.traceability.governanceReviewRef && (
                    <div className="text-xs p-2 rounded-lg bg-[var(--bg-badge)] border border-[var(--border-color)]">
                      <span className="text-[10px] text-[var(--text-muted)] block">Governance Review</span>{selectedRecord.traceability.governanceReviewRef}
                    </div>
                  )}
                  {selectedRecord.traceability.decisionRecordRef && (
                    <div className="text-xs p-2 rounded-lg bg-[var(--bg-badge)] border border-[var(--border-color)]">
                      <span className="text-[10px] text-[var(--text-muted)] block">Decision Record</span>{selectedRecord.traceability.decisionRecordRef}
                    </div>
                  )}
                  {selectedRecord.traceability.reauthorizationRecordRef && (
                    <div className="text-xs p-2 rounded-lg bg-[var(--bg-badge)] border border-[var(--border-color)]">
                      <span className="text-[10px] text-[var(--text-muted)] block">Reauthorization Record</span>{selectedRecord.traceability.reauthorizationRecordRef}
                    </div>
                  )}
                  {selectedRecord.traceability.timelineEventRef && (
                    <div className="text-xs p-2 rounded-lg bg-[var(--bg-badge)] border border-[var(--border-color)]">
                      <span className="text-[10px] text-[var(--text-muted)] block">Governance Timeline Event</span>{selectedRecord.traceability.timelineEventRef}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider mb-2">Evidence Timeline</h4>
              <div className="relative pl-5 border-l-2 border-[var(--border-color)] flex flex-col gap-3">
                {getEvidenceTimeline(selectedRecord.id).map(event => (
                  <div key={event.id} className="relative flex flex-col gap-0.5">
                    <div className="absolute -left-[26px] top-1 w-3 h-3 rounded-full bg-[var(--accent-primary)] border-2 border-[var(--bg-card)]" />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-[var(--accent-primary)] uppercase tracking-wider">{event.event}</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">{event.timestamp}</span>
                    </div>
                    <p className="text-xs text-[var(--text-primary)]">{event.details}</p>
                    <span className="text-[10px] text-[var(--text-muted)]">Actor: {event.actor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Release 4 — Readiness Contribution & Linked Governance Objects */}
            <div>
              <h4 className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider mb-2">Readiness Contribution</h4>
              <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedRecord.status === 'Active' && getExpiryIndicator(selectedRecord.expiryDate) !== 'Expired' && selectedRecord.ownership.evidenceOwner ? (
                    <span className="text-[11px] font-semibold text-emerald-500">✓ This record counts toward Evidence Readiness and Audit Readiness for {selectedRecord.assetName}.</span>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-500">⚠ This record does not currently count toward readiness (not Active, expired, or missing an owner).</span>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-color)]">
                  <span className="text-[10px] text-[var(--text-muted)]">Asset Evidence Readiness:</span>
                  {(() => {
                    const r = getEvidenceReadiness(selectedRecord.assetId);
                    return r ? <ReadinessBadge status={r.status} size="sm" /> : null;
                  })()}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider mb-2">Linked Governance Objects</h4>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold">
                  🗂️ AI Asset — {selectedRecord.assetName}
                </span>
                {selectedRecord.traceability?.riskAssessmentRef && (
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold">⚡ Risk Assessment</span>
                )}
                {selectedRecord.traceability?.governanceReviewRef && (
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold">🧭 Governance Review</span>
                )}
                {selectedRecord.traceability?.decisionRecordRef && (
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold">🖋️ Decision Record</span>
                )}
                {selectedRecord.traceability?.reauthorizationRecordRef && (
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold">🔁 Reauthorization Record</span>
                )}
                {selectedRecord.traceability?.timelineEventRef && (
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold">⏱️ Governance Timeline Event</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(selectedRecord.id)}
                disabled={!canPerform('evidenceRecord:delete')}
                title={!canPerform('evidenceRecord:delete') ? 'Your governance role does not permit deleting evidence records.' : undefined}
              >
                Delete Evidence
              </Button>
              <Button size="sm" onClick={() => navigate(`/assets?assetId=${selectedRecord.assetId}`)}>Open Linked Asset</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && editingRecord && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingRecord.id ? 'Edit Evidence Record' : 'Register Evidence'}
          subtitle="Universal Governance Evidence Object"
          maxWidth="xl"
        >
          <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
            <Input
              label="Evidence Name"
              required
              value={editingRecord.name || ''}
              onChange={e => setEditingRecord({ ...editingRecord, name: e.target.value })}
              placeholder="e.g. Independent Validation Report"
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Evidence Type"
                options={EVIDENCE_TYPES.map(t => ({ value: t.type, label: `${t.icon} ${t.type}` }))}
                value={editingRecord.evidenceType || 'Policy Document'}
                onChange={e => setEditingRecord({ ...editingRecord, evidenceType: e.target.value as EvidenceRecordType })}
              />
              <Select
                label="Linked Asset *"
                options={assetOptions}
                value={editingRecord.assetId || ''}
                onChange={e => setEditingRecord({ ...editingRecord, assetId: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Evidence Status"
                options={EVIDENCE_STATUSES.map(s => ({ value: s.status, label: `${s.icon} ${s.status}` }))}
                value={editingRecord.status || 'Draft'}
                onChange={e => setEditingRecord({ ...editingRecord, status: e.target.value as EvidenceRecordStatus })}
              />
              <Input
                label="Created Date"
                type="date"
                value={editingRecord.createdDate || ''}
                onChange={e => setEditingRecord({ ...editingRecord, createdDate: e.target.value })}
              />
            </div>

            <Input
              label="Expiry Date (optional)"
              type="date"
              value={editingRecord.expiryDate || ''}
              onChange={e => setEditingRecord({ ...editingRecord, expiryDate: e.target.value })}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
              <textarea
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)] transition-all"
                value={editingRecord.description || ''}
                onChange={e => setEditingRecord({ ...editingRecord, description: e.target.value })}
                placeholder="What does this evidence demonstrate, and for what purpose?"
              />
            </div>

            <div className="pt-2 border-t border-[var(--border-color)]">
              <h4 className="text-xs font-bold uppercase text-[var(--text-secondary)] tracking-wider mb-3">Evidence Ownership</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Evidence Owner *"
                  required
                  value={editingRecord.ownership?.evidenceOwner || ''}
                  onChange={e => setEditingRecord({ ...editingRecord, ownership: { ...(editingRecord.ownership || { evidenceOwner: '' }), evidenceOwner: e.target.value } })}
                  placeholder="e.g. Dr. Aris Thorne"
                />
                <Input
                  label="Business Owner (optional)"
                  value={editingRecord.ownership?.businessOwner || ''}
                  onChange={e => setEditingRecord({ ...editingRecord, ownership: { ...(editingRecord.ownership || { evidenceOwner: '' }), businessOwner: e.target.value } })}
                />
                <Input
                  label="Reviewer (optional)"
                  value={editingRecord.ownership?.reviewer || ''}
                  onChange={e => setEditingRecord({ ...editingRecord, ownership: { ...(editingRecord.ownership || { evidenceOwner: '' }), reviewer: e.target.value } })}
                />
                <Input
                  label="Approval Authority (optional)"
                  value={editingRecord.ownership?.approvalAuthority || ''}
                  onChange={e => setEditingRecord({ ...editingRecord, ownership: { ...(editingRecord.ownership || { evidenceOwner: '' }), approvalAuthority: e.target.value } })}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                disabled={!canPerform(editingRecord.id ? 'evidenceRecord:edit' : 'evidenceRecord:create')}
                title={!canPerform(editingRecord.id ? 'evidenceRecord:edit' : 'evidenceRecord:create') ? 'Your governance role does not permit saving evidence records.' : undefined}
              >
                {editingRecord.id ? 'Save Changes' : 'Register Evidence'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
