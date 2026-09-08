import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { RiskBadge, ReadinessBadge } from '../components/ui/Badge';
import { getTools, saveTool, archiveTool, getAgentToolGrants, getCertificationReadinessFor } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { RiskLevel, Tool, ToolClassification } from '../types';

const CLASSIFICATION_OPTIONS: { value: ToolClassification; label: string }[] = [
  { value: 'Read-Only', label: 'Read-Only' },
  { value: 'Write', label: 'Write' },
  { value: 'Financial', label: 'Financial' },
  { value: 'External API', label: 'External API' },
  { value: 'Destructive', label: 'Destructive' },
];

const RISK_OPTIONS: { value: RiskLevel; label: string }[] = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' },
];

const CLASSIFICATION_TONE: Record<ToolClassification, string> = {
  'Read-Only': 'var(--status-info)',
  'Write': 'var(--status-warning)',
  'Financial': 'var(--status-warning)',
  'External API': 'var(--status-info)',
  'Destructive': 'var(--status-danger)',
};

/**
 * R17 — Tool Governance. Tool's data model shipped with R16 (Release
 * Dependency Map §16) so AgentToolGrant had a real table to reference — this
 * is the registry screen on top of that already-live backend.
 */
export const ToolRegistryPage: React.FC = () => {
  const { canPerform } = useAuth();
  const [tools, setTools] = useState<Tool[]>(() => getTools());
  const [grants] = useState(() => getAgentToolGrants());
  const [filterClass, setFilterClass] = useState<'All' | ToolClassification>('All');
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Tool> | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = () => setTools(getTools());

  const filtered = tools.filter(t => {
    if (filterClass !== 'All' && t.classification !== filterClass) return false;
    if (query && !t.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const openCreate = () => {
    setEditing({ classification: 'Read-Only', riskLevel: 'Medium' });
    setIsModalOpen(true);
  };

  const openEdit = (t: Tool) => {
    setEditing({ ...t });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.name || !editing?.accountableOwner || !editing?.toolOwner) return;
    setSaving(true);
    try {
      await saveTool(editing);
      refresh();
      setIsModalOpen(false);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (t: Tool) => {
    if (!confirm(`Archive "${t.name}"? It will be hidden from the active registry but nothing is deleted.`)) return;
    await archiveTool(t.id, 'Sarah Jenkins', 'Retired via Tool Registry');
    refresh();
  };

  const grantCount = (toolId: string) => grants.filter(g => g.toolId === toolId).length;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SectionHeader
        title="Tool Registry"
        subtitle="Every tool and external capability an AI agent can call — classified, owned and risk-tiered."
        icon="🧰"
        action={canPerform('tool:create') && <Button onClick={openCreate} icon={<span>➕</span>}>Register Tool</Button>}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Search by name…" value={query} onChange={e => setQuery(e.target.value)} className="sm:max-w-xs" />
        <Select value={filterClass} onChange={e => setFilterClass(e.target.value as any)} options={[{ value: 'All', label: 'All classifications' }, ...CLASSIFICATION_OPTIONS]} className="sm:max-w-[11rem]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(tool => (
          <Card
            key={tool.id}
            glowOnHover={canPerform('tool:edit')}
            onClick={canPerform('tool:edit') ? () => openEdit(tool) : undefined}
            className={`flex flex-col gap-3 ${canPerform('tool:edit') ? 'cursor-pointer' : ''}`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-bold text-[var(--text-primary)] truncate">{tool.name}</p>
              <RiskBadge level={tool.riskLevel} size="sm" />
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">{tool.description}</p>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
              <span className="px-2 py-0.5 rounded-full" style={{ color: CLASSIFICATION_TONE[tool.classification], background: 'var(--bg-badge)', border: `1px solid ${CLASSIFICATION_TONE[tool.classification]}40` }}>
                {tool.classification}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-border)] text-[var(--accent-primary)]">{tool.lifecycleStage}</span>
              <ReadinessBadge status={getCertificationReadinessFor('Tool', tool.id).status} size="sm" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
              <span>{grantCount(tool.id) > 0 ? `Granted to ${grantCount(tool.id)} agent${grantCount(tool.id) > 1 ? 's' : ''}` : 'Not yet granted'}</span>
              <span className="font-bold text-[var(--text-secondary)]">{tool.decisionOutcome}</span>
            </div>
            {canPerform('tool:archive') && (
              <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleArchive(tool); }} className="self-start !px-2 !py-1 text-[11px]">Archive</Button>
            )}
          </Card>
        ))}

        {filtered.length === 0 && <p className="col-span-full text-center text-sm text-[var(--text-muted)] py-10">No tools match this filter.</p>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditing(null); }} title={editing?.id ? 'Edit Tool' : 'Register Tool'} subtitle="Every tool needs a named Accountable Owner and Tool Owner before it can be saved." maxWidth="lg">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input label="Tool Name" required value={editing?.name || ''} onChange={e => setEditing(v => ({ ...v, name: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Classification" value={editing?.classification || 'Read-Only'} onChange={e => setEditing(v => ({ ...v, classification: e.target.value as ToolClassification }))} options={CLASSIFICATION_OPTIONS} />
            <Select label="Risk Level" value={editing?.riskLevel || 'Medium'} onChange={e => setEditing(v => ({ ...v, riskLevel: e.target.value as RiskLevel }))} options={RISK_OPTIONS} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
            <textarea required rows={3} value={editing?.description || ''} onChange={e => setEditing(v => ({ ...v, description: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Accountable Owner" required value={editing?.accountableOwner || ''} onChange={e => setEditing(v => ({ ...v, accountableOwner: e.target.value }))} />
            <Input label="Tool Owner" required value={editing?.toolOwner || ''} onChange={e => setEditing(v => ({ ...v, toolOwner: e.target.value }))} />
          </div>
          <Input label="Risk Owner (optional)" value={editing?.riskOwner || ''} onChange={e => setEditing(v => ({ ...v, riskOwner: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setIsModalOpen(false); setEditing(null); }}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Tool'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
