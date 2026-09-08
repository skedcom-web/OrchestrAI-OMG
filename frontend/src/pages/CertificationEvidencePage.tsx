import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { getCertificationRecords, getCertificationPrograms, addCertificationEvidence } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { CertificationRecord } from '../types';

/**
 * R20 — Certification Governance. Assessment evidence filed in support of a
 * certification decision — a dedicated child table under each record (see
 * the schema comment on why this isn't a reuse of the shared Evidence
 * Registry).
 */
export const CertificationEvidencePage: React.FC = () => {
  const { canPerform, currentUser } = useAuth();
  const [records, setRecords] = useState<CertificationRecord[]>(() => getCertificationRecords());
  const [programs] = useState(() => getCertificationPrograms());
  const [addTarget, setAddTarget] = useState<CertificationRecord | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceRef, setEvidenceRef] = useState('');
  const [saving, setSaving] = useState(false);

  const refresh = () => setRecords(getCertificationRecords());

  const totalEvidence = records.reduce((sum, r) => sum + (r.evidence?.length || 0), 0);
  const withoutEvidence = records.filter(r => !r.evidence || r.evidence.length === 0).length;

  const openAdd = (record: CertificationRecord) => {
    setAddTarget(record);
    setTitle('');
    setDescription('');
    setEvidenceRef('');
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTarget || !title.trim() || !description.trim()) return;
    setSaving(true);
    try {
      await addCertificationEvidence(addTarget.id, title, description, currentUser?.name || 'Unknown', evidenceRef || undefined);
      refresh();
      setAddTarget(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SectionHeader
        title="Certification Evidence & Assessments"
        subtitle="Assessment evidence filed in support of a certification decision."
        icon="🧾"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum text-[var(--text-primary)]">{records.length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Certification Records</p></Card>
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum" style={{ color: 'var(--status-success)' }}>{totalEvidence}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Evidence Filed</p></Card>
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum" style={{ color: 'var(--status-warning)' }}>{withoutEvidence}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Without Evidence</p></Card>
      </div>

      <div className="flex flex-col gap-4">
        {records.map(record => (
          <Card key={record.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)]">{record.entityName}</p>
                <p className="text-xs text-[var(--text-muted)]">{record.entityType} · {record.program?.name || programs.find(p => p.id === record.programId)?.name}</p>
              </div>
              {canPerform('certificationEvidence:create') && (
                <Button variant="secondary" size="sm" onClick={() => openAdd(record)} className="!px-2 !py-1 text-[11px]">Add Evidence</Button>
              )}
            </div>

            {(!record.evidence || record.evidence.length === 0) ? (
              <p className="text-xs text-[var(--text-muted)]">No assessment evidence filed yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {record.evidence.map(e => (
                  <div key={e.id} data-noglass className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)] px-3.5 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[var(--text-primary)]">{e.title}</span>
                      {e.evidenceRef && <span className="text-[10.5px] text-[var(--text-muted)] font-mono">{e.evidenceRef}</span>}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed">{e.description}</p>
                    <p className="text-[10.5px] text-[var(--text-muted)] mt-1">{e.submittedBy}, {String(e.submittedAt).split('T')[0]}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}

        {records.length === 0 && <p className="text-center text-sm text-[var(--text-muted)] py-10">No certification records yet — issue one from Certification Records.</p>}
      </div>

      <Modal isOpen={!!addTarget} onClose={() => setAddTarget(null)} title={`Add Evidence — ${addTarget?.entityName || ''}`} maxWidth="md">
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <Input label="Title" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Adversarial Robustness Test Report" />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
            <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
          </div>
          <Input label="Evidence Reference (optional)" placeholder="e.g. a Control Test Result ID or document reference" value={evidenceRef} onChange={e => setEvidenceRef(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setAddTarget(null)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Adding…' : 'Add Evidence'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
