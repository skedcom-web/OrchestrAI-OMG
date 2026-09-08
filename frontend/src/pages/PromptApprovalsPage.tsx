import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { RiskBadge } from '../components/ui/Badge';
import { getPrompts, recordPromptDecision } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { DecisionOutcome, Prompt } from '../types';

const OUTCOME_OPTIONS: { value: DecisionOutcome; label: string }[] = [
  { value: 'GO', label: 'GO' },
  { value: 'CONDITIONAL GO', label: 'Conditional GO' },
  { value: 'NO GO', label: 'No Go' },
];

const OUTCOME_TONE: Record<DecisionOutcome, string> = {
  'GO': 'var(--status-success)',
  'CONDITIONAL GO': 'var(--status-warning)',
  'NO GO': 'var(--status-danger)',
  'PENDING': 'var(--text-muted)',
};

/**
 * R15 — Prompt Governance. Reuses the same GO / Conditional GO / No Go
 * decision vocabulary as Model and Knowledge Governance.
 */
export const PromptApprovalsPage: React.FC = () => {
  const { canPerform, currentUser } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>(() => getPrompts());
  const [decisionTarget, setDecisionTarget] = useState<Prompt | null>(null);
  const [outcome, setOutcome] = useState<DecisionOutcome>('GO');
  const [justification, setJustification] = useState('');
  const [saving, setSaving] = useState(false);

  const refresh = () => setPrompts(getPrompts());

  const openDecision = (p: Prompt) => {
    setDecisionTarget(p);
    setOutcome('GO');
    setJustification('');
  };

  const handleRecordDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionTarget || !justification.trim()) return;
    setSaving(true);
    try {
      await recordPromptDecision(decisionTarget.id, outcome, justification, currentUser?.name || 'Unknown');
      refresh();
      setDecisionTarget(null);
    } finally {
      setSaving(false);
    }
  };

  const byRisk = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  prompts.forEach(p => { byRisk[p.riskLevel]++; });
  const flaggedVersions = prompts.filter(p => p.versions.some(v => v.reviewStatus === 'Reviewed — Flagged'));

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SectionHeader
        title="Prompt Approvals & Risk"
        subtitle="Risk tiering and GO / Conditional GO / No Go decisions for governed prompts."
        icon="⚖️"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['Critical', 'High', 'Medium', 'Low'] as const).map(level => (
          <Card key={level} className="!p-4">
            <p className="text-2xl font-extrabold text-[var(--text-primary)] tnum">{byRisk[level]}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">{level} Risk</p>
          </Card>
        ))}
      </div>

      {flaggedVersions.length > 0 && (
        <Card className="!border-red-500/30 !bg-red-500/5">
          <p className="text-xs font-extrabold uppercase tracking-wider text-red-500 mb-2">⚠ Injection-control review flagged a version — {flaggedVersions.length} prompt{flaggedVersions.length > 1 ? 's' : ''}</p>
          <div className="flex flex-col gap-2">
            {flaggedVersions.map(p => {
              const flagged = p.versions.find(v => v.reviewStatus === 'Reviewed — Flagged');
              return (
                <div key={p.id} className="text-xs text-[var(--text-secondary)]">
                  <span className="font-bold text-[var(--text-primary)]">{p.name}</span> (v{flagged?.versionNumber}) — {flagged?.reviewNotes || 'Flagged during review.'}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {prompts.map(prompt => (
          <Card key={prompt.id} className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-[var(--text-primary)]">{prompt.name}</p>
                <RiskBadge level={prompt.riskLevel} size="sm" />
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full" style={{ color: OUTCOME_TONE[prompt.decisionOutcome], background: 'var(--bg-badge)', border: `1px solid ${OUTCOME_TONE[prompt.decisionOutcome]}40` }}>
                  {prompt.decisionOutcome}
                </span>
              </div>
              {prompt.decisionJustification && (
                <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                  "{prompt.decisionJustification}" — {prompt.decisionOwner}{prompt.decisionDate ? `, ${String(prompt.decisionDate).split('T')[0]}` : ''}
                </p>
              )}
            </div>
            {canPerform('prompt:decide') && (
              <Button variant="secondary" size="sm" onClick={() => openDecision(prompt)} className="shrink-0">Record Decision</Button>
            )}
          </Card>
        ))}
      </div>

      <Modal isOpen={!!decisionTarget} onClose={() => setDecisionTarget(null)} title={`Record Decision — ${decisionTarget?.name || ''}`} subtitle="A justification and your name are required — this becomes part of the prompt's permanent governance record." maxWidth="md">
        <form onSubmit={handleRecordDecision} className="flex flex-col gap-4">
          <Select label="Outcome" value={outcome} onChange={e => setOutcome(e.target.value as DecisionOutcome)} options={OUTCOME_OPTIONS} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Justification</label>
            <textarea required rows={4} value={justification} onChange={e => setJustification(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
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
