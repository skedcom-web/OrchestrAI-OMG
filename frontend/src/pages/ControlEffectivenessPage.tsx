import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { getGovernanceControls, recordControlTestResult } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { GovernanceControl, ControlAttachment, ControlTestOutcome, ControlEffectivenessRating } from '../types';

const ENTITY_TYPE_LABEL: Record<ControlAttachment['entityType'], string> = {
  Asset: 'Asset',
  Model: 'Model',
  KnowledgeAsset: 'Knowledge Asset',
  Prompt: 'Prompt',
  Tool: 'Tool',
};

const OUTCOME_OPTIONS: { value: ControlTestOutcome; label: string }[] = [
  { value: 'PASS', label: 'Pass' },
  { value: 'FAIL', label: 'Fail' },
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
 * R18 — Control Governance. Test history and pass/fail effectiveness ratings.
 * A FAIL outcome automatically raises a Corrective Action against the
 * attached entity server-side, via the polymorphic entityType/entityId
 * Foundation already built in R13 — no bespoke remediation model here.
 */
export const ControlEffectivenessPage: React.FC = () => {
  const { canPerform, currentUser } = useAuth();
  const [controls, setControls] = useState<GovernanceControl[]>(() => getGovernanceControls());
  const [testTarget, setTestTarget] = useState<{ control: GovernanceControl; attachment: ControlAttachment } | null>(null);
  const [outcome, setOutcome] = useState<ControlTestOutcome>('PASS');
  const [findings, setFindings] = useState('');
  const [saving, setSaving] = useState(false);

  const refresh = () => setControls(getGovernanceControls());

  const allTests = controls.flatMap(c => (c.attachments || []).flatMap(a => (a.testResults || []).map(t => ({ control: c, attachment: a, test: t }))));
  const totalTests = allTests.length;
  const passCount = allTests.filter(x => x.test.outcome === 'PASS').length;
  const failCount = allTests.filter(x => x.test.outcome === 'FAIL').length;
  const ineffectiveCount = controls.filter(c => c.effectivenessRating === 'INEFFECTIVE').length;

  const openTest = (control: GovernanceControl, attachment: ControlAttachment) => {
    setTestTarget({ control, attachment });
    setOutcome('PASS');
    setFindings('');
  };

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTarget) return;
    setSaving(true);
    try {
      await recordControlTestResult(testTarget.attachment.id, currentUser?.name || 'Unknown', outcome, findings || undefined);
      refresh();
      setTestTarget(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SectionHeader
        title="Control Effectiveness"
        subtitle="Test history and pass/fail effectiveness ratings for every governance control."
        icon="✅"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum text-[var(--text-primary)]">{totalTests}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Tests Recorded</p></Card>
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum" style={{ color: 'var(--status-success)' }}>{passCount}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Passed</p></Card>
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum" style={{ color: 'var(--status-danger)' }}>{failCount}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Failed</p></Card>
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum" style={{ color: 'var(--status-danger)' }}>{ineffectiveCount}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Ineffective Controls</p></Card>
      </div>

      <div className="flex flex-col gap-4">
        {controls.map(control => (
          <Card key={control.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm font-bold text-[var(--text-primary)]">{control.name}</p>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full" style={{ color: EFFECTIVENESS_TONE[control.effectivenessRating], background: 'var(--bg-badge)', border: `1px solid ${EFFECTIVENESS_TONE[control.effectivenessRating]}40` }}>
                {EFFECTIVENESS_LABEL[control.effectivenessRating]}
              </span>
            </div>

            {(!control.attachments || control.attachments.length === 0) ? (
              <p className="text-xs text-[var(--text-muted)]">No attachments to test yet — attach this control to an entity first.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {control.attachments.map(attachment => (
                  <div key={attachment.id} className="pb-2 border-b border-[var(--border-subtle)] last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-[var(--text-primary)]">{ENTITY_TYPE_LABEL[attachment.entityType]}: {attachment.entityName}</span>
                      {canPerform('controlTestResult:create') && (
                        <Button variant="secondary" size="sm" onClick={() => openTest(control, attachment)} className="!px-2 !py-0.5 text-[10.5px] shrink-0">Record Test Result</Button>
                      )}
                    </div>
                    {(!attachment.testResults || attachment.testResults.length === 0) ? (
                      <p className="text-[11px] text-[var(--text-muted)]">Not yet tested.</p>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {attachment.testResults.map(test => (
                          <div key={test.id} className="flex items-start gap-2 text-[11px]">
                            <span className="font-extrabold uppercase shrink-0" style={{ color: test.outcome === 'PASS' ? 'var(--status-success)' : 'var(--status-danger)' }}>{test.outcome}</span>
                            <span className="text-[var(--text-secondary)]">
                              {test.findings || 'No findings noted.'} — {test.tester}, {String(test.testDate).split('T')[0]}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}

        {controls.length === 0 && <p className="text-center text-sm text-[var(--text-muted)] py-10">No controls registered yet — start in the Control Library.</p>}
      </div>

      <Modal isOpen={!!testTarget} onClose={() => setTestTarget(null)} title={`Record Test Result — ${testTarget?.control.name || ''}`} subtitle={`Testing against ${testTarget?.attachment.entityName || ''}. A FAIL outcome automatically raises a corrective action.`} maxWidth="md">
        <form onSubmit={handleRecord} className="flex flex-col gap-4">
          <Select label="Outcome" value={outcome} onChange={e => setOutcome(e.target.value as ControlTestOutcome)} options={OUTCOME_OPTIONS} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Findings (optional)</label>
            <textarea rows={4} value={findings} onChange={e => setFindings(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setTestTarget(null)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Recording…' : 'Record Result'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
