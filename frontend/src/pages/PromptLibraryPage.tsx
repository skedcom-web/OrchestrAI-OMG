import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { RiskBadge } from '../components/ui/Badge';
import { getPrompts, savePrompt, archivePrompt, createPromptVersion } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { Prompt, RiskLevel } from '../types';

const RISK_OPTIONS: { value: RiskLevel; label: string }[] = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' },
];

const REVIEW_TONE: Record<string, string> = {
  'Reviewed — Pass': 'var(--status-success)',
  'Reviewed — Flagged': 'var(--status-danger)',
  'Not Reviewed': 'var(--text-muted)',
};

/**
 * R15 — Prompt Governance. Every edit is a new version — prior versions are
 * retained, never overwritten (Architecture Package Blueprint 4).
 */
export const PromptLibraryPage: React.FC = () => {
  const { canPerform, currentUser } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>(() => getPrompts());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Prompt> & { templateBody?: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const [versionTarget, setVersionTarget] = useState<Prompt | null>(null);
  const [newTemplateBody, setNewTemplateBody] = useState('');
  const [changeNotes, setChangeNotes] = useState('');
  const [savingVersion, setSavingVersion] = useState(false);

  const refresh = () => setPrompts(getPrompts());

  const filtered = prompts.filter(p => !query || p.name.toLowerCase().includes(query.toLowerCase()));

  const openCreate = () => {
    setEditing({ riskLevel: 'Medium' });
    setIsModalOpen(true);
  };

  const openEdit = (p: Prompt) => {
    setEditing({ ...p });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.name || !editing?.accountableOwner || !editing?.promptOwner) return;
    if (!editing.id && !editing.templateBody) return;
    setSaving(true);
    try {
      await savePrompt(editing);
      refresh();
      setIsModalOpen(false);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (p: Prompt) => {
    if (!confirm(`Archive "${p.name}"? It will be hidden from the active library but nothing is deleted.`)) return;
    await archivePrompt(p.id, 'Sarah Jenkins', 'Retired via Prompt Library');
    refresh();
  };

  const openNewVersion = (p: Prompt) => {
    setVersionTarget(p);
    setNewTemplateBody(p.versions[0]?.templateBody || '');
    setChangeNotes('');
  };

  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionTarget || !newTemplateBody.trim() || !changeNotes.trim()) return;
    setSavingVersion(true);
    try {
      await createPromptVersion(versionTarget.id, newTemplateBody, currentUser?.name || 'Unknown', changeNotes);
      refresh();
      setVersionTarget(null);
    } finally {
      setSavingVersion(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SectionHeader
        title="Prompt Library"
        subtitle="Every governed prompt template, versioned — every edit is a new version, prior versions retained."
        icon="💬"
        action={canPerform('prompt:create') && <Button onClick={openCreate} icon={<span>➕</span>}>Register Prompt</Button>}
      />

      <Input placeholder="Search by name…" value={query} onChange={e => setQuery(e.target.value)} className="sm:max-w-xs" />

      <div className="flex flex-col gap-3">
        {filtered.map(prompt => {
          const latest = prompt.versions[0];
          const isOpen = expandedId === prompt.id;
          return (
            <Card key={prompt.id} className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setExpandedId(isOpen ? null : prompt.id)}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-[var(--text-primary)]">{prompt.name}</p>
                    <RiskBadge level={prompt.riskLevel} size="sm" />
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-border)] text-[var(--accent-primary)]">{prompt.lifecycleStage}</span>
                    <span className="text-[10px] font-bold text-[var(--text-muted)]">v{latest?.versionNumber || 1} · {prompt.versions.length} version{prompt.versions.length > 1 ? 's' : ''}</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">{prompt.description}</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                    {prompt.usedByAssetNames.length > 0 ? `Used by ${prompt.usedByAssetNames.join(', ')}` : 'Not yet linked to an asset'}
                  </p>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1.5 shrink-0">
                  <span className="text-[11px] font-bold text-[var(--text-secondary)]">{prompt.decisionOutcome}</span>
                  {canPerform('prompt:edit') && (
                    <div className="flex gap-1.5">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(prompt)} className="!px-2 !py-1 text-[11px]">Edit</Button>
                      {canPerform('promptVersion:create') && (
                        <Button variant="secondary" size="sm" onClick={() => openNewVersion(prompt)} className="!px-2 !py-1 text-[11px]">New Version</Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {isOpen && (
                <div className="flex flex-col gap-2.5 pt-3 border-t border-[var(--border-subtle)]">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Version History</p>
                  {prompt.versions.map(v => (
                    <div key={v.id} data-noglass className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)] px-3.5 py-3 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[var(--text-primary)]">Version {v.versionNumber}</span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full" style={{ color: REVIEW_TONE[v.reviewStatus], background: 'var(--bg-badge)', border: `1px solid ${REVIEW_TONE[v.reviewStatus]}40` }}>
                          {v.reviewStatus}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] font-mono leading-relaxed">{v.templateBody}</p>
                      <p className="text-[11px] text-[var(--text-muted)]">{v.changeNotes} — {v.createdBy}, {String(v.createdAt).split('T')[0]}</p>
                      {v.reviewNotes && <p className="text-[11px] text-[var(--text-muted)] italic">Review: {v.reviewNotes}</p>}
                    </div>
                  ))}
                  {canPerform('prompt:archive') && (
                    <Button variant="ghost" size="sm" onClick={() => handleArchive(prompt)} className="self-start !px-2 !py-1 text-[11px] mt-1">Archive Prompt</Button>
                  )}
                </div>
              )}
            </Card>
          );
        })}

        {filtered.length === 0 && <p className="text-center text-sm text-[var(--text-muted)] py-10">No prompts match this search.</p>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditing(null); }} title={editing?.id ? 'Edit Prompt' : 'Register Prompt'} subtitle="Every prompt needs a named Accountable Owner and Prompt Owner before it can be saved." maxWidth="lg">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input label="Prompt Name" required value={editing?.name || ''} onChange={e => setEditing(v => ({ ...v, name: e.target.value }))} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
            <textarea required rows={2} value={editing?.description || ''} onChange={e => setEditing(v => ({ ...v, description: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
          </div>
          {!editing?.id && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Initial Template Body</label>
              <textarea required rows={4} value={editing?.templateBody || ''} onChange={e => setEditing(v => ({ ...v, templateBody: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm font-mono focus:outline-none focus:border-[var(--border-focus)]" />
            </div>
          )}
          <Select label="Risk Level" value={editing?.riskLevel || 'Medium'} onChange={e => setEditing(v => ({ ...v, riskLevel: e.target.value as RiskLevel }))} options={RISK_OPTIONS} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Accountable Owner" required value={editing?.accountableOwner || ''} onChange={e => setEditing(v => ({ ...v, accountableOwner: e.target.value }))} />
            <Input label="Prompt Owner" required value={editing?.promptOwner || ''} onChange={e => setEditing(v => ({ ...v, promptOwner: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setIsModalOpen(false); setEditing(null); }}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Prompt'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!versionTarget} onClose={() => setVersionTarget(null)} title={`New Version — ${versionTarget?.name || ''}`} subtitle="This creates a new version; the current version is retained in history, never overwritten." maxWidth="lg">
        <form onSubmit={handleCreateVersion} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Template Body</label>
            <textarea required rows={5} value={newTemplateBody} onChange={e => setNewTemplateBody(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm font-mono focus:outline-none focus:border-[var(--border-focus)]" />
          </div>
          <Input label="Change Notes" required placeholder="What changed and why…" value={changeNotes} onChange={e => setChangeNotes(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setVersionTarget(null)}>Cancel</Button>
            <Button type="submit" disabled={savingVersion}>{savingVersion ? 'Saving…' : 'Create Version'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
