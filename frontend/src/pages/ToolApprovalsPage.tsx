import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { RiskBadge } from '../components/ui/Badge';
import { getTools, recordToolDecision } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { DecisionOutcome, Tool } from '../types';

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
 * R17 — Tool Governance. Reuses the same GO / Conditional GO / No Go
 * decision vocabulary as Model, Knowledge and Prompt Governance.
 */
export const ToolApprovalsPage: React.FC = () => {
  const { canPerform, currentUser } = useAuth();
  const [tools, setTools] = useState<Tool[]>(() => getTools());
  const [decisionTarget, setDecisionTarget] = useState<Tool | null>(null);
  const [outcome, setOutcome] = useState<DecisionOutcome>('GO');
  const [justification, setJustification] = useState('');
  const [saving, setSaving] = useState(false);

  const refresh = () => setTools(getTools());

  const openDecision = (tool: Tool) => {
    setDecisionTarget(tool);
    setOutcome('GO');
    setJustification('');
  };

  const handleRecordDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionTarget || !justification.trim()) return;
    setSaving(true);
    try {
      await recordToolDecision(decisionTarget.id, outcome, justification, currentUser?.name || 'Unknown');
      refresh();
      setDecisionTarget(null);
    } finally {
      setSaving(false);
    }
  };

  const byRisk = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  tools.forEach(t => { byRisk[t.riskLevel]++; });
  const destructivePending = tools.filter(t => t.classification === 'Destructive' && t.decisionOutcome === 'PENDING');

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SectionHeader
        title="Tool Approvals & Risk"
        subtitle="Risk tiering and GO / Conditional GO / No Go decisions for governed tools."
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

      {destructivePending.length > 0 && (
        <Card className="!border-red-500/30 !bg-red-500/5">
          <p className="text-xs font-extrabold uppercase tracking-wider text-red-500 mb-2">⚠ Destructive-class tool awaiting decision — {destructivePending.length}</p>
          <p className="text-xs text-[var(--text-secondary)]">{destructivePending.map(t => t.name).join(', ')} — grant no agent access until a decision is recorded.</p>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {tools.map(tool => (
          <Card key={tool.id} className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-[var(--text-primary)]">{tool.name}</p>
                <RiskBadge level={tool.riskLevel} size="sm" />
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full" style={{ color: OUTCOME_TONE[tool.decisionOutcome], background: 'var(--bg-badge)', border: `1px solid ${OUTCOME_TONE[tool.decisionOutcome]}40` }}>
                  {tool.decisionOutcome}
                </span>
              </div>
              {tool.decisionJustification && (
                <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                  "{tool.decisionJustification}" — {tool.decisionOwner}{tool.decisionDate ? `, ${String(tool.decisionDate).split('T')[0]}` : ''}
                </p>
              )}
            </div>
            {canPerform('tool:decide') && (
              <Button variant="secondary" size="sm" onClick={() => openDecision(tool)} className="shrink-0">Record Decision</Button>
            )}
          </Card>
        ))}
      </div>

      <Modal isOpen={!!decisionTarget} onClose={() => setDecisionTarget(null)} title={`Record Decision — ${decisionTarget?.name || ''}`} subtitle="A justification and your name are required — this becomes part of the tool's permanent governance record." maxWidth="md">
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
