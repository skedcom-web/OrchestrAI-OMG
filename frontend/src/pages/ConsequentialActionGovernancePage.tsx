import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { useAuth } from '../contexts/AuthContext';
import {
  getAssets,
  getConsequentialActionsForAsset,
  createConsequentialActionRequest,
  computeActionValidation,
  recordGovernanceDecision,
  executeConsequentialAction,
  recordConsequentialActionOutcome,
  getGovernanceDecisionsForAction,
  getActionExecutionsForAction,
  getGovernanceOutcomesForAction,
} from '../services/storageService';
import type {
  ConsequentialActionRecord,
  ConsequentialActionType,
  GovernanceActionDecision,
  GovernanceDecisionRecord,
  ActionExecutionRecord,
  GovernanceOutcomeRecord,
  GovernanceOutcomeType,
} from '../types';

const ACTION_TYPES: ConsequentialActionType[] = ['Kill Switch', 'Retirement', 'Override', 'Access Revocation', 'Permission Suspension', 'Account Freeze'];
const DECISIONS: GovernanceActionDecision[] = ['Approved', 'Rejected', 'Escalated', 'Deferred'];
const OUTCOME_TYPES: GovernanceOutcomeType[] = ['Completed', 'Failed', 'Reversed', 'Superseded'];

const STATUS_TONE: Record<string, string> = {
  'Requested': 'var(--text-muted)',
  'Under Review': 'var(--status-warning)',
  'Decided': 'var(--status-warning)',
  'Executed': 'var(--accent-strong)',
  'Closed': 'var(--status-success)',
};

const Pill: React.FC<{ children: React.ReactNode; tone?: string }> = ({ children, tone = 'var(--text-muted)' }) => (
  <span
    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border"
    style={{ color: tone, borderColor: tone, background: 'color-mix(in srgb, ' + tone + ' 12%, transparent)' }}
  >
    {children}
  </span>
);

const inputClass = "w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]";
const labelClass = "text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider";

const ActionCard: React.FC<{ action: ConsequentialActionRecord; onChanged: () => void }> = ({ action, onChanged }) => {
  const { currentUser, canPerform } = useAuth();
  const canDecide = canPerform('consequentialAction:decide');
  const canExecute = canPerform('consequentialAction:execute');
  const canRecordOutcome = canPerform('consequentialAction:recordOutcome');

  const [decisions, setDecisions] = useState<GovernanceDecisionRecord[]>([]);
  const [executions, setExecutions] = useState<ActionExecutionRecord[]>([]);
  const [outcomes, setOutcomes] = useState<GovernanceOutcomeRecord[]>([]);

  const [decision, setDecision] = useState<GovernanceActionDecision>('Approved');
  const [rationale, setRationale] = useState('');
  const [executionType, setExecutionType] = useState('');
  const [outcomeType, setOutcomeType] = useState<GovernanceOutcomeType>('Completed');
  const [outcomeDescription, setOutcomeDescription] = useState('');

  const validation = useMemo(() => computeActionValidation(action.assetId), [action.assetId]);

  const refresh = () => {
    getGovernanceDecisionsForAction(action.id).then(setDecisions).catch(() => {});
    getActionExecutionsForAction(action.id).then(setExecutions).catch(() => {});
    getGovernanceOutcomesForAction(action.id).then(setOutcomes).catch(() => {});
  };

  useEffect(() => { refresh(); }, [action.id]);

  const activeDecision = decisions[0];
  const isApproved = activeDecision?.decision === 'Approved';

  const handleDecide = async () => {
    if (!canDecide || !rationale) return;
    await recordGovernanceDecision({
      assetId: action.assetId,
      actionId: action.id,
      decision,
      approver: currentUser?.name || 'David Chen (Governance Admin)',
      rationale,
    });
    setRationale('');
    refresh();
    onChanged();
  };

  const handleExecute = async () => {
    if (!canExecute || !executionType) return;
    await executeConsequentialAction({
      actionId: action.id,
      assetId: action.assetId,
      actionType: action.actionType,
      decisionId: activeDecision?.id,
      executedBy: currentUser?.name || 'David Chen (Governance Admin)',
      executionType,
      reason: action.reason,
    });
    setExecutionType('');
    refresh();
    onChanged();
  };

  const handleRecordOutcome = async () => {
    if (!canRecordOutcome || !outcomeDescription) return;
    await recordConsequentialActionOutcome({
      actionId: action.id,
      decisionId: activeDecision?.id,
      outcomeType,
      outcomeDescription,
      recordedBy: currentUser?.name || 'David Chen (Governance Admin)',
    });
    setOutcomeDescription('');
    refresh();
    onChanged();
  };

  return (
    <Card className="!p-5">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <Pill tone={STATUS_TONE[action.status]}>{action.status}</Pill>
        <span className="text-sm font-bold text-[var(--text-primary)]">{action.actionType}</span>
      </div>
      <p className="text-[11px] text-[var(--text-muted)] mb-3">Requested by {action.requestedBy} on {new Date(action.requestedDate).toLocaleDateString()} — {action.reason}</p>

      {validation && (
        <div className="mb-3 px-3 py-2.5 rounded-lg bg-[var(--bg-sunken)]">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-faint)] mb-1.5">Action-Time Validation (live)</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Pill tone={validation.authorityValidationResult === 'PASS' ? 'var(--status-success)' : 'var(--status-danger)'}>Authority: {validation.authorityValidationResult}</Pill>
            <Pill tone={validation.evidenceValidationResult === 'PASS' ? 'var(--status-success)' : 'var(--status-danger)'}>Evidence: {validation.evidenceValidationResult}</Pill>
          </div>
          {(validation.authorityReasons[0] || validation.evidenceReasons[0]) && (
            <p className="text-[11px] text-[var(--text-muted)] mt-1.5">{validation.authorityReasons[0]} {validation.evidenceReasons[0]}</p>
          )}
        </div>
      )}

      {decisions.map(d => (
        <div key={d.id} className="mb-2 px-3 py-2 rounded-lg bg-[var(--bg-sunken)]">
          <div className="flex items-center gap-2"><Pill tone={d.decision === 'Approved' ? 'var(--status-success)' : d.decision === 'Rejected' ? 'var(--status-danger)' : 'var(--status-warning)'}>{d.decision}</Pill><span className="text-[11px] text-[var(--text-muted)]">by {d.approver}</span></div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Authority Validation at decision: {d.authorityValidationResult} · Evidence Validation at decision: {d.evidenceValidationResult}</p>
          <p className="text-[11px] text-[var(--text-muted)]">{d.rationale}</p>
        </div>
      ))}

      {!activeDecision && (
        <div className="border-t border-[var(--border-color)] pt-3 mt-1">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">Governance Decision</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
            <Select label="Decision" value={decision} onChange={e => setDecision(e.target.value as GovernanceActionDecision)} disabled={!canDecide} options={DECISIONS.map(d => ({ value: d, label: d }))} />
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Rationale</label>
              <input value={rationale} onChange={e => setRationale(e.target.value)} disabled={!canDecide} className={inputClass} />
            </div>
          </div>
          <button onClick={handleDecide} disabled={!canDecide || !rationale} className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'var(--grad-brand)' }}>
            Record Decision
          </button>
        </div>
      )}

      {executions.map(e => (
        <div key={e.id} className="mb-2 px-3 py-2 rounded-lg bg-[var(--bg-sunken)] flex items-center justify-between gap-2">
          <span className="text-[11px] text-[var(--text-muted)]">{e.executionType} — {e.executionStatus}</span>
          <span className="text-[10.5px] text-[var(--text-faint)]">{new Date(e.executionTimestamp).toLocaleString()} · {e.executedBy}</span>
        </div>
      ))}

      {isApproved && (
        <div className="border-t border-[var(--border-color)] pt-3 mt-2">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">Action Execution</p>
          <div className="flex gap-2 flex-wrap mb-2">
            <input value={executionType} onChange={e => setExecutionType(e.target.value)} disabled={!canExecute} placeholder={`e.g. ${action.actionType} Activated`} className={inputClass} />
          </div>
          <button onClick={handleExecute} disabled={!canExecute || !executionType} className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'var(--grad-brand)' }}>
            Record Execution
          </button>
        </div>
      )}

      {outcomes.map(o => (
        <div key={o.id} className="mt-2 px-3 py-2 rounded-lg bg-[var(--bg-sunken)]">
          <Pill tone="var(--status-success)">{o.outcomeType}</Pill>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">{o.outcomeDescription} — recorded by {o.recordedBy}</p>
        </div>
      ))}

      {executions.length > 0 && (
        <div className="border-t border-[var(--border-color)] pt-3 mt-2">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">Governance Outcome</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
            <Select label="Outcome Type" value={outcomeType} onChange={e => setOutcomeType(e.target.value as GovernanceOutcomeType)} disabled={!canRecordOutcome} options={OUTCOME_TYPES.map(t => ({ value: t, label: t }))} />
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Description</label>
              <input value={outcomeDescription} onChange={e => setOutcomeDescription(e.target.value)} disabled={!canRecordOutcome} className={inputClass} />
            </div>
          </div>
          <button onClick={handleRecordOutcome} disabled={!canRecordOutcome || !outcomeDescription} className="px-4 py-2.5 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-border)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            Record Outcome
          </button>
        </div>
      )}
    </Card>
  );
};

export const ConsequentialActionGovernancePage: React.FC = () => {
  const { currentUser, canPerform } = useAuth();
  const [assets] = useState(() => getAssets());
  const [assetId, setAssetId] = useState(assets[0]?.id || '');
  const [actions, setActions] = useState<ConsequentialActionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const canRequest = canPerform('consequentialAction:request');

  const [actionType, setActionType] = useState<ConsequentialActionType>('Kill Switch');
  const [reason, setReason] = useState('');

  const reload = () => {
    if (!assetId) return;
    setLoading(true);
    getConsequentialActionsForAsset(assetId).then(rows => { setActions(rows); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { reload(); }, [assetId]);

  const asset = assets.find(a => a.id === assetId);

  const handleCreate = async () => {
    if (!asset || !canRequest || !reason) return;
    await createConsequentialActionRequest({
      assetId: asset.id,
      assetName: asset.name,
      actionType,
      requestedBy: currentUser?.name || 'David Chen (Governance Admin)',
      reason,
    });
    setReason('');
    reload();
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Consequential Action Governance</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
          Release 21 — Consequential Action Governance Completion. Every consequential action is requested, validated
          against current authority and evidence, decided, executed and its outcome recorded as a first-class,
          persisted governance record — completing the lifecycle from Material Change through to Outcome Recording.
        </p>
      </div>

      <Select label="Asset" value={assetId} onChange={e => setAssetId(e.target.value)} options={assets.map(a => ({ value: a.id, label: a.name }))} />

      <Card className="!p-5 border-[var(--accent-border)]">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">Request a Consequential Action</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <Select label="Action Type" value={actionType} onChange={e => setActionType(e.target.value as ConsequentialActionType)} disabled={!canRequest} options={ACTION_TYPES.map(t => ({ value: t, label: t }))} />
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Reason</label>
            <input value={reason} onChange={e => setReason(e.target.value)} disabled={!canRequest} placeholder="e.g. Reassessment completed following detected model drift" className={inputClass} />
          </div>
        </div>
        <button onClick={handleCreate} disabled={!canRequest || !reason} className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'var(--grad-brand)' }}>
          Submit Request
        </button>
      </Card>

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Loading consequential actions…</p>
      ) : actions.length === 0 ? (
        <Card className="!p-5"><p className="text-sm text-[var(--text-muted)]">No consequential actions recorded for this asset.</p></Card>
      ) : (
        <div className="flex flex-col gap-3">
          {actions.map(action => (
            <ActionCard key={action.id} action={action} onChanged={reload} />
          ))}
        </div>
      )}
    </div>
  );
};
