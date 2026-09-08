import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { RiskBadge } from '../components/ui/Badge';
import { getKnowledgeAssets, saveKnowledgeAsset, archiveKnowledgeAsset } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { KnowledgeAsset, KnowledgeSourceType, RiskLevel } from '../types';

const SOURCE_TYPE_OPTIONS: { value: KnowledgeSourceType; label: string }[] = [
  { value: 'Document Store', label: 'Document Store' },
  { value: 'Database', label: 'Database' },
  { value: 'API', label: 'API' },
  { value: 'Vector Index', label: 'Vector Index' },
];

const RISK_OPTIONS: { value: RiskLevel; label: string }[] = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' },
];

const QUALITY_TONE: Record<string, string> = {
  'Ready': 'var(--status-success)',
  'Partially Ready': 'var(--status-warning)',
  'Not Ready': 'var(--status-danger)',
};

/**
 * R14 — Knowledge Governance. A knowledge source is registered once and may
 * feed many AI assets (see usedByAssetNames) — this is the registry, not a
 * per-asset sub-record, mirroring Model Governance exactly.
 */
export const KnowledgeRegistryPage: React.FC = () => {
  const { canPerform } = useAuth();
  const [sources, setSources] = useState<KnowledgeAsset[]>(() => getKnowledgeAssets());
  const [filterType, setFilterType] = useState<'All' | KnowledgeSourceType>('All');
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<KnowledgeAsset> | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = () => setSources(getKnowledgeAssets());

  const filtered = sources.filter(s => {
    if (filterType !== 'All' && s.sourceType !== filterType) return false;
    if (query && !s.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const openCreate = () => {
    setEditing({ sourceType: 'Document Store', riskLevel: 'Medium', qualityControlStatus: 'Not Ready' });
    setIsModalOpen(true);
  };

  const openEdit = (s: KnowledgeAsset) => {
    setEditing({ ...s });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.name || !editing?.accountableOwner || !editing?.knowledgeOwner) return;
    setSaving(true);
    try {
      await saveKnowledgeAsset(editing);
      refresh();
      setIsModalOpen(false);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (s: KnowledgeAsset) => {
    if (!confirm(`Archive "${s.name}"? It will be hidden from the active registry but nothing is deleted.`)) return;
    await archiveKnowledgeAsset(s.id, 'Sarah Jenkins', 'Retired via Knowledge Registry');
    refresh();
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SectionHeader
        title="Knowledge Registry"
        subtitle="Every knowledge source AI retrieves from — registered, owned and risk-tiered like any other governed entity."
        icon="📚"
        action={
          canPerform('knowledgeAsset:create') && (
            <Button onClick={openCreate} icon={<span>➕</span>}>Register Source</Button>
          )
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Search by name…" value={query} onChange={e => setQuery(e.target.value)} className="sm:max-w-xs" />
        <Select value={filterType} onChange={e => setFilterType(e.target.value as any)} options={[{ value: 'All', label: 'All source types' }, ...SOURCE_TYPE_OPTIONS]} className="sm:max-w-[11rem]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(source => (
          <Card
            key={source.id}
            glowOnHover={canPerform('knowledgeAsset:edit')}
            onClick={canPerform('knowledgeAsset:edit') ? () => openEdit(source) : undefined}
            className={`flex flex-col gap-3 ${canPerform('knowledgeAsset:edit') ? 'cursor-pointer' : ''}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--text-primary)] truncate">{source.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{source.sourceType}</p>
              </div>
              <RiskBadge level={source.riskLevel} size="sm" />
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">{source.description}</p>

            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
              <span className="px-2 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-border)] text-[var(--accent-primary)]">{source.lifecycleStage}</span>
              <span
                className="px-2 py-0.5 rounded-full"
                style={{ color: QUALITY_TONE[source.qualityControlStatus], background: 'var(--bg-badge)', border: `1px solid ${QUALITY_TONE[source.qualityControlStatus]}40` }}
              >
                {source.qualityControlStatus}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
              <span>{source.usedByAssetNames.length > 0 ? `Used by ${source.usedByAssetNames.length} asset${source.usedByAssetNames.length > 1 ? 's' : ''}` : 'Not yet linked to an asset'}</span>
              <span className="font-bold text-[var(--text-secondary)]">{source.decisionOutcome}</span>
            </div>

            {canPerform('knowledgeAsset:archive') && (
              <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleArchive(source); }} className="self-start !px-2 !py-1 text-[11px]">
                Archive
              </Button>
            )}
          </Card>
        ))}

        {filtered.length === 0 && (
          <p className="col-span-full text-center text-sm text-[var(--text-muted)] py-10">No knowledge sources match this filter.</p>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditing(null); }}
        title={editing?.id ? 'Edit Knowledge Source' : 'Register Knowledge Source'}
        subtitle="Every source needs a named Accountable Owner and Knowledge Owner before it can be saved."
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input label="Source Name" required value={editing?.name || ''} onChange={e => setEditing(v => ({ ...v, name: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Source Type" value={editing?.sourceType || 'Document Store'} onChange={e => setEditing(v => ({ ...v, sourceType: e.target.value as KnowledgeSourceType }))} options={SOURCE_TYPE_OPTIONS} />
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
            <Input label="Knowledge Owner" required value={editing?.knowledgeOwner || ''} onChange={e => setEditing(v => ({ ...v, knowledgeOwner: e.target.value }))} />
          </div>
          <Input label="Risk Owner (optional)" value={editing?.riskOwner || ''} onChange={e => setEditing(v => ({ ...v, riskOwner: e.target.value }))} />
          <Input label="Freshness SLA (optional)" placeholder="Weekly, Monthly, Real-time…" value={editing?.freshnessSLA || ''} onChange={e => setEditing(v => ({ ...v, freshnessSLA: e.target.value }))} />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setIsModalOpen(false); setEditing(null); }}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Source'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
