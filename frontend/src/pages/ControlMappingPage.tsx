import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import {
  getGovernanceControls,
  saveControlAttachment,
  deleteControlAttachment,
  getAssets,
  getModels,
  getKnowledgeAssets,
  getPrompts,
  getTools,
} from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { GovernanceControl, ControlAttachment } from '../types';

type EntityType = ControlAttachment['entityType'];

const ENTITY_TYPE_OPTIONS: { value: EntityType; label: string }[] = [
  { value: 'Asset', label: 'AI Asset' },
  { value: 'Model', label: 'Model' },
  { value: 'KnowledgeAsset', label: 'Knowledge Asset' },
  { value: 'Prompt', label: 'Prompt' },
  { value: 'Tool', label: 'Tool' },
];

const ENTITY_TYPE_TONE: Record<EntityType, string> = {
  Asset: 'var(--status-info)',
  Model: 'var(--accent-primary)',
  KnowledgeAsset: 'var(--status-warning)',
  Prompt: 'var(--status-success)',
  Tool: 'var(--status-danger)',
};

const ENTITY_TYPE_LABEL: Record<EntityType, string> = {
  Asset: 'Asset',
  Model: 'Model',
  KnowledgeAsset: 'Knowledge Asset',
  Prompt: 'Prompt',
  Tool: 'Tool',
};

/**
 * R18 — Control Governance. Which entities each control is attached to, and
 * where coverage gaps remain. Attaching reuses the polymorphic
 * entityType/entityId/entityName shape the Foundation already built for
 * Evidence, Corrective Actions and Alerts back in R13.
 */
export const ControlMappingPage: React.FC = () => {
  const { canPerform, currentUser } = useAuth();
  const [controls, setControls] = useState<GovernanceControl[]>(() => getGovernanceControls());
  const [attachTarget, setAttachTarget] = useState<GovernanceControl | null>(null);
  const [entityType, setEntityType] = useState<EntityType>('Asset');
  const [entityId, setEntityId] = useState('');
  const [saving, setSaving] = useState(false);

  const assets = getAssets();
  const models = getModels();
  const knowledgeAssets = getKnowledgeAssets();
  const prompts = getPrompts();
  const tools = getTools();

  const refresh = () => setControls(getGovernanceControls());

  const entityOptionsFor = (type: EntityType): { value: string; label: string }[] => {
    switch (type) {
      case 'Asset': return assets.map(a => ({ value: a.id, label: a.name }));
      case 'Model': return models.map(m => ({ value: m.id, label: m.name }));
      case 'KnowledgeAsset': return knowledgeAssets.map(k => ({ value: k.id, label: k.name }));
      case 'Prompt': return prompts.map(p => ({ value: p.id, label: p.name }));
      case 'Tool': return tools.map(t => ({ value: t.id, label: t.name }));
    }
  };

  const entityNameFor = (type: EntityType, id: string): string =>
    entityOptionsFor(type).find(o => o.value === id)?.label || id;

  const openAttach = (control: GovernanceControl) => {
    setAttachTarget(control);
    setEntityType('Asset');
    setEntityId('');
  };

  const handleAttach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachTarget || !entityId) return;
    setSaving(true);
    try {
      await saveControlAttachment(attachTarget.id, entityType, entityId, entityNameFor(entityType, entityId), currentUser?.name || 'Unknown');
      refresh();
      setAttachTarget(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDetach = async (attachment: ControlAttachment, controlName: string) => {
    if (!confirm(`Detach "${controlName}" from ${attachment.entityName}?`)) return;
    await deleteControlAttachment(attachment.id);
    refresh();
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SectionHeader
        title="Control Mapping"
        subtitle="Which entities each control is attached to, and where coverage gaps remain across the portfolio."
        icon="🔗"
      />

      <div className="flex flex-col gap-4">
        {controls.map(control => (
          <Card key={control.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)]">{control.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{control.category} · {control.riskLevel} Risk</p>
              </div>
              {canPerform('controlAttachment:create') && (
                <Button variant="secondary" size="sm" onClick={() => openAttach(control)} className="!px-2 !py-1 text-[11px]">Attach to Entity</Button>
              )}
            </div>

            {(!control.attachments || control.attachments.length === 0) ? (
              <p className="text-xs text-[var(--text-muted)]">Not attached to any entity yet.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {control.attachments.map(attachment => (
                  <div key={attachment.id} data-noglass className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)] px-3 py-2">
                    <div className="min-w-0 flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0" style={{ color: ENTITY_TYPE_TONE[attachment.entityType], background: 'var(--bg-badge)', border: `1px solid ${ENTITY_TYPE_TONE[attachment.entityType]}40` }}>
                        {ENTITY_TYPE_LABEL[attachment.entityType]}
                      </span>
                      <span className="text-xs font-semibold text-[var(--text-primary)] truncate">{attachment.entityName}</span>
                      <span className="text-[10.5px] text-[var(--text-muted)] shrink-0">{attachment.testResults?.length || 0} test{attachment.testResults?.length === 1 ? '' : 's'}</span>
                    </div>
                    {canPerform('controlAttachment:delete') && (
                      <Button variant="ghost" size="sm" onClick={() => handleDetach(attachment, control.name)} className="!px-2 !py-0.5 text-[10.5px] shrink-0">Detach</Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}

        {controls.length === 0 && <p className="text-center text-sm text-[var(--text-muted)] py-10">No controls registered yet — start in the Control Library.</p>}
      </div>

      <Modal isOpen={!!attachTarget} onClose={() => setAttachTarget(null)} title={`Attach to Entity — ${attachTarget?.name || ''}`} subtitle="The control will apply to this entity immediately." maxWidth="sm">
        <form onSubmit={handleAttach} className="flex flex-col gap-4">
          <Select
            label="Entity Type"
            value={entityType}
            onChange={e => { setEntityType(e.target.value as EntityType); setEntityId(''); }}
            options={ENTITY_TYPE_OPTIONS}
          />
          <Select
            label="Entity"
            value={entityId}
            onChange={e => setEntityId(e.target.value)}
            options={[{ value: '', label: 'Select an entity…' }, ...entityOptionsFor(entityType)]}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setAttachTarget(null)}>Cancel</Button>
            <Button type="submit" disabled={saving || !entityId}>{saving ? 'Attaching…' : 'Attach Control'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
