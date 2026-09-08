import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { RiskBadge } from '../components/ui/Badge';
import { getModels, saveModel, archiveModel } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { Model, ModelType, RiskLevel } from '../types';

const MODEL_TYPE_OPTIONS: { value: ModelType; label: string }[] = [
  { value: 'Foundation', label: 'Foundation' },
  { value: 'Fine-Tuned', label: 'Fine-Tuned' },
  { value: 'Custom', label: 'Custom' },
  { value: 'Third-Party', label: 'Third-Party' },
];

const RISK_OPTIONS: { value: RiskLevel; label: string }[] = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' },
];

/**
 * R13 — Model Governance. A model is registered once and reused by many AI
 * assets (see usedByAssetNames) — this is the registry, not a per-asset
 * sub-record.
 */
export const ModelRegistryPage: React.FC = () => {
  const { canPerform, isReadOnly } = useAuth();
  const [models, setModels] = useState<Model[]>(() => getModels());
  const [filterType, setFilterType] = useState<'All' | ModelType>('All');
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Model> | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = () => setModels(getModels());

  const filtered = models.filter(m => {
    if (filterType !== 'All' && m.modelType !== filterType) return false;
    if (query && !m.name.toLowerCase().includes(query.toLowerCase()) && !(m.vendor || '').toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const openCreate = () => {
    setEditing({ modelType: 'Custom', riskLevel: 'Medium' });
    setIsModalOpen(true);
  };

  const openEdit = (m: Model) => {
    setEditing({ ...m });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.name || !editing?.accountableOwner || !editing?.modelOwner) return;
    setSaving(true);
    try {
      await saveModel(editing);
      refresh();
      setIsModalOpen(false);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (m: Model) => {
    if (!confirm(`Archive "${m.name}"? It will be hidden from the active registry but nothing is deleted.`)) return;
    await archiveModel(m.id, 'Sarah Jenkins', 'Retired via Model Registry');
    refresh();
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SectionHeader
        title="Model Registry"
        subtitle="Every AI model governed as a first-class, reusable asset — registered once, used by many."
        icon="🧬"
        action={
          canPerform('model:create') && (
            <Button onClick={openCreate} icon={<span>➕</span>}>Register Model</Button>
          )
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by name or vendor…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          value={filterType}
          onChange={e => setFilterType(e.target.value as any)}
          options={[{ value: 'All', label: 'All types' }, ...MODEL_TYPE_OPTIONS]}
          className="sm:max-w-[10rem]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(model => (
          <Card
            key={model.id}
            glowOnHover={canPerform('model:edit')}
            onClick={canPerform('model:edit') ? () => openEdit(model) : undefined}
            className={`flex flex-col gap-3 ${canPerform('model:edit') ? 'cursor-pointer' : ''}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--text-primary)] truncate">{model.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{model.vendor || 'In-House'} · v{model.version}</p>
              </div>
              <RiskBadge level={model.riskLevel} size="sm" />
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">{model.description}</p>

            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
              <span className="px-2 py-0.5 rounded-full bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-secondary)]">{model.modelType}</span>
              <span className="px-2 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-border)] text-[var(--accent-primary)]">{model.lifecycleStage}</span>
              {model.driftDetected && (
                <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-500">Drift flagged</span>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
              <span>{model.usedByAssetNames.length > 0 ? `Used by ${model.usedByAssetNames.length} asset${model.usedByAssetNames.length > 1 ? 's' : ''}` : 'Not yet linked to an asset'}</span>
              <span className="font-bold text-[var(--text-secondary)]">{model.decisionOutcome}</span>
            </div>

            {canPerform('model:archive') && !isReadOnly && (
              <Button
                variant="ghost"
                size="sm"
                onClick={e => { e.stopPropagation(); handleArchive(model); }}
                className="self-start !px-2 !py-1 text-[11px]"
              >
                Archive
              </Button>
            )}
          </Card>
        ))}

        {filtered.length === 0 && (
          <p className="col-span-full text-center text-sm text-[var(--text-muted)] py-10">No models match this filter.</p>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditing(null); }}
        title={editing?.id ? 'Edit Model' : 'Register Model'}
        subtitle="Every model needs a named Accountable Owner and Model Owner before it can be saved."
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input label="Model Name" required value={editing?.name || ''} onChange={e => setEditing(v => ({ ...v, name: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Vendor" value={editing?.vendor || ''} onChange={e => setEditing(v => ({ ...v, vendor: e.target.value }))} placeholder="In-House, Azure OpenAI, ..." />
            <Input label="Version" value={editing?.version || ''} onChange={e => setEditing(v => ({ ...v, version: e.target.value }))} placeholder="1.0.0" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Model Type" value={editing?.modelType || 'Custom'} onChange={e => setEditing(v => ({ ...v, modelType: e.target.value as ModelType }))} options={MODEL_TYPE_OPTIONS} />
            <Select label="Risk Level" value={editing?.riskLevel || 'Medium'} onChange={e => setEditing(v => ({ ...v, riskLevel: e.target.value as RiskLevel }))} options={RISK_OPTIONS} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
            <textarea
              required
              rows={3}
              value={editing?.description || ''}
              onChange={e => setEditing(v => ({ ...v, description: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Accountable Owner" required value={editing?.accountableOwner || ''} onChange={e => setEditing(v => ({ ...v, accountableOwner: e.target.value }))} />
            <Input label="Model Owner" required value={editing?.modelOwner || ''} onChange={e => setEditing(v => ({ ...v, modelOwner: e.target.value }))} />
          </div>
          <Input label="Risk Owner (optional)" value={editing?.riskOwner || ''} onChange={e => setEditing(v => ({ ...v, riskOwner: e.target.value }))} />
          <Input label="Training Data Reference (optional)" value={editing?.trainingDataRef || ''} onChange={e => setEditing(v => ({ ...v, trainingDataRef: e.target.value }))} />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setIsModalOpen(false); setEditing(null); }}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Model'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
