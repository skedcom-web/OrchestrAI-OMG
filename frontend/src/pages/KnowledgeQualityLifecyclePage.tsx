import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { getKnowledgeAssets, saveKnowledgeAsset, recordKnowledgeDecision } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { DecisionOutcome, KnowledgeAsset, LifecycleStage, ReadinessStatus } from '../types';

const STAGES: LifecycleStage[] = ['Register', 'Assess', 'Approve', 'Operate', 'Monitor', 'Reassess', 'Retire'];
const QUALITY_OPTIONS: { value: ReadinessStatus; label: string }[] = [
  { value: 'Ready', label: 'Ready' },
  { value: 'Partially Ready', label: 'Partially Ready' },
  { value: 'Not Ready', label: 'Not Ready' },
];
const OUTCOME_OPTIONS: { value: DecisionOutcome; label: string }[] = [
  { value: 'GO', label: 'GO' },
  { value: 'CONDITIONAL GO', label: 'Conditional GO' },
  { value: 'NO GO', label: 'No Go' },
];
const QUALITY_TONE: Record<ReadinessStatus, string> = {
  'Ready': 'var(--status-success)',
  'Partially Ready': 'var(--status-warning)',
  'Not Ready': 'var(--status-danger)',
};

/**
 * R14 — Knowledge Governance. Combines the universal lifecycle (Architecture
 * Package §9) with the freshness/quality signal specific to knowledge
 * sources and the same GO / Conditional GO / No Go decision vocabulary used
 * everywhere else — one screen per the approved package's 3-screen design
 * for this domain (Model Governance splits this across two screens; Knowledge
 * doesn't need that split).
 */
export const KnowledgeQualityLifecyclePage: React.FC = () => {
  const { canPerform, currentUser } = useAuth();
  const [sources, setSources] = useState<KnowledgeAsset[]>(() => getKnowledgeAssets());
  const [decisionTarget, setDecisionTarget] = useState<KnowledgeAsset | null>(null);
  const [outcome, setOutcome] = useState<DecisionOutcome>('GO');
  const [justification, setJustification] = useState('');
  const [saving, setSaving] = useState(false);

  const refresh = () => setSources(getKnowledgeAssets());

  const handleStageChange = async (source: KnowledgeAsset, stage: LifecycleStage) => {
    await saveKnowledgeAsset({ id: source.id, lifecycleStage: stage });
    refresh();
  };

  const handleQualityChange = async (source: KnowledgeAsset, status: ReadinessStatus) => {
    await saveKnowledgeAsset({ id: source.id, qualityControlStatus: status });
    refresh();
  };

  const openDecision = (source: KnowledgeAsset) => {
    setDecisionTarget(source);
    setOutcome('GO');
    setJustification('');
  };

  const handleRecordDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionTarget || !justification.trim()) return;
    setSaving(true);
    try {
      await recordKnowledgeDecision(decisionTarget.id, outcome, justification, currentUser?.name || 'Unknown');
      refresh();
      setDecisionTarget(null);
    } finally {
      setSaving(false);
    }
  };

  const stale = sources.filter(s => s.qualityControlStatus !== 'Ready');

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SectionHeader
        title="Knowledge Quality & Lifecycle"
        subtitle="Freshness, ownership and lifecycle stage for every governed knowledge source."
        icon="🧪"
      />

      {stale.length > 0 && (
        <Card className="!border-amber-500/30 !bg-amber-500/5">
          <p className="text-xs font-extrabold uppercase tracking-wider mb-2" style={{ color: 'var(--status-warning)' }}>⚠ Quality attention needed — {stale.length} source{stale.length > 1 ? 's' : ''}</p>
          <div className="flex flex-col gap-2">
            {stale.map(s => (
              <div key={s.id} className="text-xs text-[var(--text-secondary)]">
                <span className="font-bold text-[var(--text-primary)]">{s.name}</span> — {s.qualityNotes || `Currently ${s.qualityControlStatus}.`}
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sources.map(source => (
          <Card key={source.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--text-primary)] truncate">{source.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{source.sourceType} · SLA: {source.freshnessSLA || '—'}</p>
              </div>
              <span
                className="shrink-0 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full"
                style={{ color: QUALITY_TONE[source.qualityControlStatus], background: 'var(--bg-badge)', border: `1px solid ${QUALITY_TONE[source.qualityControlStatus]}40` }}
              >
                {source.qualityControlStatus}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {STAGES.map((stage, i) => {
                const currentIdx = STAGES.indexOf(source.lifecycleStage);
                return <div key={stage} title={stage} className="flex-1 h-1.5 rounded-full" style={{ background: i <= currentIdx ? 'var(--accent-primary)' : 'var(--border-subtle)' }} />;
              })}
            </div>

            <p className="text-xs text-[var(--text-muted)]">Last refreshed: {source.lastRefreshedAt ? String(source.lastRefreshedAt).split('T')[0] : 'Never'}</p>

            {canPerform('knowledgeAsset:edit') && (
              <div className="grid grid-cols-2 gap-2">
                <Select label="Lifecycle stage" value={source.lifecycleStage} onChange={e => handleStageChange(source, e.target.value as LifecycleStage)} options={STAGES.map(s => ({ value: s, label: s }))} />
                <Select label="Quality status" value={source.qualityControlStatus} onChange={e => handleQualityChange(source, e.target.value as ReadinessStatus)} options={QUALITY_OPTIONS} />
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
              <span className="text-[11px] font-bold text-[var(--text-secondary)]">{source.decisionOutcome}</span>
              {canPerform('knowledgeAsset:decide') && (
                <Button variant="secondary" size="sm" onClick={() => openDecision(source)}>Record Decision</Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={!!decisionTarget}
        onClose={() => setDecisionTarget(null)}
        title={`Record Decision — ${decisionTarget?.name || ''}`}
        subtitle="A justification and your name are required — this becomes part of the source's permanent governance record."
        maxWidth="md"
      >
        <form onSubmit={handleRecordDecision} className="flex flex-col gap-4">
          <Select label="Outcome" value={outcome} onChange={e => setOutcome(e.target.value as DecisionOutcome)} options={OUTCOME_OPTIONS} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Justification</label>
            <textarea
              required
              rows={4}
              value={justification}
              onChange={e => setJustification(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setDecisionTarget(null)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Recording…' : 'Record Decision'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
