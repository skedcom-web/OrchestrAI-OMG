import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { RiskBadge } from '../components/ui/Badge';
import { getGovernanceControls, saveGovernanceControl, archiveGovernanceControl } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { RiskLevel, GovernanceControl, ControlEffectivenessRating } from '../types';

const RISK_OPTIONS: { value: RiskLevel; label: string }[] = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' },
];

const CATEGORY_OPTIONS = [
  { value: 'Preventive', label: 'Preventive' },
  { value: 'Detective', label: 'Detective' },
  { value: 'Corrective', label: 'Corrective' },
  { value: 'Directive', label: 'Directive' },
];

const EFFECTIVENESS_LABEL: Record<ControlEffectivenessRating, string> = {
  NOT_YET_TESTED: 'Not Yet Tested',
  EFFECTIVE: 'Effective',
  PARTIALLY_EFFECTIVE: 'Partially Effective',
  INEFFECTIVE: 'Ineffective',
};

const EFFECTIVENESS_TONE: Record<ControlEffectivenessRating, string> = {
  NOT_YET_TESTED: 'var(--text-muted)',
  EFFECTIVE: 'var(--status-success)',
  PARTIALLY_EFFECTIVE: 'var(--status-warning)',
  INEFFECTIVE: 'var(--status-danger)',
};

/**
 * R18 — Control Governance. Registered once, attached to any Asset, Model,
 * Knowledge source, Prompt or Tool via the Control Mapping screen — a
 * control's identity here is independent of what it's attached to. No
 * GO/NO-GO decision workflow: a control's standing is established by testing
 * (Control Effectiveness), not by a one-time approval.
 */
export const ControlLibraryPage: React.FC = () => {
  const { canPerform } = useAuth();
  const [controls, setControls] = useState<GovernanceControl[]>(() => getGovernanceControls());
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<GovernanceControl> | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = () => setControls(getGovernanceControls());

  const filtered = controls.filter(c => !query || c.name.toLowerCase().includes(query.toLowerCase()));

  const openCreate = () => {
    setEditing({ category: 'Preventive', riskLevel: 'Medium' });
    setIsModalOpen(true);
  };

  const openEdit = (c: GovernanceControl) => {
    setEditing({ ...c });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.name || !editing?.accountableOwner || !editing?.controlOwner || !editing?.testProcedure) return;
    setSaving(true);
    try {
      await saveGovernanceControl(editing);
      refresh();
      setIsModalOpen(false);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (c: GovernanceControl) => {
    if (!confirm(`Archive "${c.name}"? It will be hidden from the active library but nothing is deleted.`)) return;
    await archiveGovernanceControl(c.id, 'Sarah Jenkins', 'Retired via Control Library');
    refresh();
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SectionHeader
        title="Control Library"
        subtitle="Governance controls registered once, attached to any governed entity across the portfolio."
        icon="🧱"
        action={canPerform('governanceControl:create') && <Button onClick={openCreate} icon={<span>➕</span>}>Register Control</Button>}
      />

      <Input placeholder="Search by name…" value={query} onChange={e => setQuery(e.target.value)} className="sm:max-w-xs" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(control => (
          <Card
            key={control.id}
            glowOnHover={canPerform('governanceControl:edit')}
            onClick={canPerform('governanceControl:edit') ? () => openEdit(control) : undefined}
            className={`flex flex-col gap-3 ${canPerform('governanceControl:edit') ? 'cursor-pointer' : ''}`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-bold text-[var(--text-primary)] truncate">{control.name}</p>
              <RiskBadge level={control.riskLevel} size="sm" />
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">{control.description}</p>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
              <span className="px-2 py-0.5 rounded-full bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-secondary)]">{control.category}</span>
              <span className="px-2 py-0.5 rounded-full" style={{ color: EFFECTIVENESS_TONE[control.effectivenessRating], background: 'var(--bg-badge)', border: `1px solid ${EFFECTIVENESS_TONE[control.effectivenessRating]}40` }}>
                {EFFECTIVENESS_LABEL[control.effectivenessRating]}
              </span>
            </div>
            <div className="pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
              <span>{(control.attachments?.length || 0) > 0 ? `Attached to ${control.attachments!.length} ${control.attachments!.length === 1 ? 'entity' : 'entities'}` : 'Not yet attached'}</span>
            </div>
            {canPerform('governanceControl:archive') && (
              <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleArchive(control); }} className="self-start !px-2 !py-1 text-[11px]">Archive</Button>
            )}
          </Card>
        ))}

        {filtered.length === 0 && <p className="col-span-full text-center text-sm text-[var(--text-muted)] py-10">No controls match this filter.</p>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditing(null); }} title={editing?.id ? 'Edit Control' : 'Register Control'} subtitle="Every control needs a named Accountable Owner, Control Owner and documented test procedure before it can be saved." maxWidth="lg">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input label="Control Name" required value={editing?.name || ''} onChange={e => setEditing(v => ({ ...v, name: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Category" value={editing?.category || 'Preventive'} onChange={e => setEditing(v => ({ ...v, category: e.target.value }))} options={CATEGORY_OPTIONS} />
            <Select label="Risk Level" value={editing?.riskLevel || 'Medium'} onChange={e => setEditing(v => ({ ...v, riskLevel: e.target.value as RiskLevel }))} options={RISK_OPTIONS} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
            <textarea required rows={3} value={editing?.description || ''} onChange={e => setEditing(v => ({ ...v, description: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Test Procedure</label>
            <textarea required rows={3} value={editing?.testProcedure || ''} onChange={e => setEditing(v => ({ ...v, testProcedure: e.target.value }))} placeholder="How is this control actually tested?" className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Accountable Owner" required value={editing?.accountableOwner || ''} onChange={e => setEditing(v => ({ ...v, accountableOwner: e.target.value }))} />
            <Input label="Control Owner" required value={editing?.controlOwner || ''} onChange={e => setEditing(v => ({ ...v, controlOwner: e.target.value }))} />
          </div>
          <Input label="Risk Owner (optional)" value={editing?.riskOwner || ''} onChange={e => setEditing(v => ({ ...v, riskOwner: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setIsModalOpen(false); setEditing(null); }}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Control'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
