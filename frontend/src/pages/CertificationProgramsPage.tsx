import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { getCertificationPrograms, saveCertificationProgram, archiveCertificationProgram, getCertificationRecords } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { CertificationProgram } from '../types';

/**
 * R20 — Certification Governance. The reusable program definition — criteria,
 * description and validity period. Issuing a certification against a
 * specific entity happens on the Certification Records screen.
 */
export const CertificationProgramsPage: React.FC = () => {
  const { canPerform } = useAuth();
  const [programs, setPrograms] = useState<CertificationProgram[]>(() => getCertificationPrograms());
  const [records] = useState(() => getCertificationRecords());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<CertificationProgram> | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = () => setPrograms(getCertificationPrograms());

  const openCreate = () => {
    setEditing({ validityPeriodDays: 365 });
    setIsModalOpen(true);
  };

  const openEdit = (p: CertificationProgram) => {
    setEditing({ ...p });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.name || !editing?.criteria || !editing?.validityPeriodDays) return;
    setSaving(true);
    try {
      await saveCertificationProgram(editing);
      refresh();
      setIsModalOpen(false);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (p: CertificationProgram) => {
    if (!confirm(`Archive "${p.name}"? It will be hidden from the active list but nothing is deleted.`)) return;
    await archiveCertificationProgram(p.id, 'Sarah Jenkins', 'Retired via Certification Programs');
    refresh();
  };

  const recordCount = (programId: string) => records.filter(r => r.programId === programId).length;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SectionHeader
        title="Certification Programs"
        subtitle="Reusable certification program definitions — criteria, validity period and scope."
        icon="📜"
        action={canPerform('certificationProgram:create') && <Button onClick={openCreate} icon={<span>➕</span>}>New Program</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {programs.map(program => (
          <Card
            key={program.id}
            glowOnHover={canPerform('certificationProgram:edit')}
            onClick={canPerform('certificationProgram:edit') ? () => openEdit(program) : undefined}
            className={`flex flex-col gap-3 ${canPerform('certificationProgram:edit') ? 'cursor-pointer' : ''}`}
          >
            <p className="text-sm font-bold text-[var(--text-primary)]">{program.name}</p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">{program.description}</p>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed line-clamp-2"><span className="font-bold text-[var(--text-secondary)]">Criteria: </span>{program.criteria}</p>
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
              <span>Valid for {program.validityPeriodDays} days</span>
              <span className="font-bold text-[var(--text-secondary)]">{recordCount(program.id)} issued</span>
            </div>
            {canPerform('certificationProgram:archive') && (
              <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleArchive(program); }} className="self-start !px-2 !py-1 text-[11px]">Archive</Button>
            )}
          </Card>
        ))}

        {programs.length === 0 && <p className="col-span-full text-center text-sm text-[var(--text-muted)] py-10">No certification programs defined yet.</p>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditing(null); }} title={editing?.id ? 'Edit Program' : 'New Certification Program'} subtitle="Every program needs named criteria and a validity period before it can be saved." maxWidth="lg">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input label="Program Name" required value={editing?.name || ''} onChange={e => setEditing(v => ({ ...v, name: e.target.value }))} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
            <textarea required rows={3} value={editing?.description || ''} onChange={e => setEditing(v => ({ ...v, description: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Criteria</label>
            <textarea required rows={3} value={editing?.criteria || ''} onChange={e => setEditing(v => ({ ...v, criteria: e.target.value }))} placeholder="What must an entity satisfy to earn this certification?" className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
          </div>
          <Input label="Validity Period (days)" type="number" required min={1} value={editing?.validityPeriodDays ?? ''} onChange={e => setEditing(v => ({ ...v, validityPeriodDays: Number(e.target.value) }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setIsModalOpen(false); setEditing(null); }}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Program'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
