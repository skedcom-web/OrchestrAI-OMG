import React, { useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { GovernanceTruthCard } from '../components/governance/GovernanceTruthCard';
import { useAuth } from '../contexts/AuthContext';
import {
  getAssets,
  getAllGovernabilityResults,
  getAllUnifiedGovernanceStates,
  getReassessmentTriggers,
  saveReassessmentTrigger,
  saveReauthorizationRecord,
  computeRevalidation,
} from '../services/storageService';
import { REASSESSMENT_TRIGGER_TYPES } from '../config/governanceContinuity';
import type { GovernabilityStatus, ReassessmentTriggerType, RevalidationResult, UnifiedGovernanceState, DecisionOutcome, GovernanceState } from '../types';

/** Release 21.1 — the reauthorization decision a reviewer records maps directly
 * to the governance state it restores; no separate "new state" field to fill in. */
function newStateForDecision(decision: DecisionOutcome, assetStatus: string): GovernanceState {
  if (decision === 'GO') return assetStatus === 'Production' ? 'Monitoring' : 'Authorized';
  if (decision === 'CONDITIONAL GO') return 'Conditional GO';
  return 'No GO';
}

const STATUS_TONE: Record<GovernabilityStatus, string> = {
  'Governable': 'var(--status-success)',
  'Governable With Conditions': 'var(--status-warning)',
  'Review Required': 'var(--status-warning)',
  'Governance Attention Required': 'var(--status-danger)',
  'Not Governable': 'var(--status-danger)',
};

const UNIFIED_STATE_TONE: Record<UnifiedGovernanceState, string> = {
  'Governed': 'var(--status-success)',
  'Conditionally Governed': 'var(--status-warning)',
  'Governance At Risk': 'var(--status-warning)',
  'Governance Invalid': 'var(--status-danger)',
  'Pending Reauthorisation': 'var(--status-warning)',
  'Retired': 'var(--text-muted)',
};

const Pill: React.FC<{ children: React.ReactNode; tone?: string }> = ({ children, tone = 'var(--text-muted)' }) => (
  <span
    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border"
    style={{ color: tone, borderColor: tone, background: 'color-mix(in srgb, ' + tone + ' 12%, transparent)' }}
  >
    {children}
  </span>
);

export const GovernabilityDashboardPage: React.FC = () => {
  const { currentUser, canPerform } = useAuth();
  const [assets] = useState(() => getAssets());
  const [results, setResults] = useState(() => getAllGovernabilityResults());
  const [unifiedStates, setUnifiedStates] = useState(() => getAllUnifiedGovernanceStates());
  const [triggers, setTriggers] = useState(() => getReassessmentTriggers());

  // Module 6 — Reassessment Trigger Framework: the entry point identified as
  // missing in the earlier Runtime Governability analysis.
  const [triggerAssetId, setTriggerAssetId] = useState(assets[0]?.id || '');
  const [triggerType, setTriggerType] = useState<ReassessmentTriggerType>('Model Change');
  const [triggerComment, setTriggerComment] = useState('');
  const [filing, setFiling] = useState(false);

  // Module 12 — Post-Intervention Revalidation
  const [revalAssetId, setRevalAssetId] = useState(assets[0]?.id || '');
  const [revalContext, setRevalContext] = useState('');
  const [revalResult, setRevalResult] = useState<RevalidationResult | null>(null);

  // Release 21.1 — Governance Continuity Closure (certification finding P4-01):
  // saveReauthorizationRecord() already existed and already restores an
  // asset's governance state; no page called it. This is that page.
  const pendingReauthAssets = useMemo(
    () => assets.filter(a => unifiedStates.find(s => s.assetId === a.id)?.state === 'Pending Reauthorisation'),
    [assets, unifiedStates]
  );
  const [reauthAssetId, setReauthAssetId] = useState('');
  const [reauthDecision, setReauthDecision] = useState<DecisionOutcome>('GO');
  const [reauthReason, setReauthReason] = useState('');
  const [reauthNotes, setReauthNotes] = useState('');
  const [filingReauth, setFilingReauth] = useState(false);

  const canFile = canPerform('reassessmentTrigger:create');
  const canReauthorize = canPerform('reauthorizationRecord:create');

  const breakdown = useMemo(() => {
    const counts: Record<GovernabilityStatus, number> = {
      'Governable': 0, 'Governable With Conditions': 0, 'Review Required': 0, 'Governance Attention Required': 0, 'Not Governable': 0,
    };
    results.forEach(r => { counts[r.status]++; });
    return counts;
  }, [results]);

  // Release 19.1 — Dashboard Harmonisation: the Unified Governance State
  // breakdown below is the one governance truth this dashboard reports;
  // the Governability breakdown above is kept as one of its named input
  // signals, not a second, competing status aggregation.
  const unifiedBreakdown = useMemo(() => {
    const counts: Record<UnifiedGovernanceState, number> = {
      'Governed': 0, 'Conditionally Governed': 0, 'Governance At Risk': 0, 'Pending Reauthorisation': 0, 'Governance Invalid': 0, 'Retired': 0,
    };
    unifiedStates.forEach(s => { counts[s.state]++; });
    return counts;
  }, [unifiedStates]);

  const activeReassessments = triggers.filter(t => t.status === 'Open' || t.status === 'Under Review').length;
  const attentionRequired = breakdown['Governance Attention Required'] + breakdown['Not Governable'];

  const handleFileTrigger = async () => {
    if (!triggerAssetId || !canFile) return;
    setFiling(true);
    await saveReassessmentTrigger({
      assetId: triggerAssetId,
      triggerType,
      severity: 'Medium',
      owner: currentUser?.name || 'David Chen (Governance Admin)',
      status: 'Open',
      comments: triggerComment || `${triggerType} reported via Governability Dashboard.`,
    });
    setTriggers(getReassessmentTriggers());
    setResults(getAllGovernabilityResults());
    setUnifiedStates(getAllUnifiedGovernanceStates());
    setTriggerComment('');
    setFiling(false);
  };

  const selectedReauthAssetId = reauthAssetId || pendingReauthAssets[0]?.id || '';
  const reauthAsset = assets.find(a => a.id === selectedReauthAssetId);

  const handleFileReauthorization = async () => {
    if (!selectedReauthAssetId || !reauthAsset || !reauthReason || !canReauthorize) return;
    setFilingReauth(true);
    await saveReauthorizationRecord({
      assetId: selectedReauthAssetId,
      reviewedBy: currentUser?.name || 'David Chen (Governance Admin)',
      reviewDate: new Date().toISOString(),
      decision: reauthDecision,
      reason: reauthReason,
      supportingNotes: reauthNotes,
      previousState: reauthAsset.governanceState ?? 'Reassessment Required',
      newState: newStateForDecision(reauthDecision, reauthAsset.status),
    });
    setResults(getAllGovernabilityResults());
    setUnifiedStates(getAllUnifiedGovernanceStates());
    setReauthAssetId('');
    setReauthReason('');
    setReauthNotes('');
    setFilingReauth(false);
  };

  const handleRevalidate = () => {
    if (!revalAssetId || !revalContext) return;
    setRevalResult(computeRevalidation(revalAssetId, revalContext));
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Governability Dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
          Whether governance legitimacy can still be established, computed live from evidence, authority and
          admissibility signals already on file — advisory only, nothing here suspends or blocks an asset.
        </p>
      </div>

      {/* ============== RELEASE 19.1 — GOVERNANCE STATE HARMONISATION: THE ONE GOVERNANCE TRUTH ============== */}
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">Unified Governance State — the platform's one governance truth</p>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {(Object.keys(unifiedBreakdown) as UnifiedGovernanceState[]).map(state => (
            <Card key={state} className="!p-4">
              <p className="text-2xl font-extrabold tnum" style={{ color: UNIFIED_STATE_TONE[state] }}>{unifiedBreakdown[state]}</p>
              <p className="text-[10.5px] font-semibold text-[var(--text-muted)] mt-1">{state}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* ============== MODULE 5 — GOVERNABILITY DASHBOARD (one input signal to the truth above) ============== */}
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">Governability — one signal the Unified Governance State is resolved from</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(Object.keys(breakdown) as GovernabilityStatus[]).map(status => (
            <Card key={status} className="!p-4">
              <p className="text-2xl font-extrabold tnum" style={{ color: STATUS_TONE[status] }}>{breakdown[status]}</p>
              <p className="text-[10.5px] font-semibold text-[var(--text-muted)] mt-1">{status}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="!p-4">
          <p className="text-2xl font-extrabold text-[var(--text-primary)] tnum">{activeReassessments}</p>
          <p className="text-[10.5px] font-semibold text-[var(--text-muted)] mt-1">Active Reassessments</p>
        </Card>
        <Card className="!p-4">
          <p className="text-2xl font-extrabold text-[var(--status-danger)] tnum">{attentionRequired}</p>
          <p className="text-[10.5px] font-semibold text-[var(--text-muted)] mt-1">Governance Attention Required</p>
        </Card>
        <Card className="!p-4">
          <p className="text-2xl font-extrabold text-[var(--text-primary)] tnum">{results.length}</p>
          <p className="text-[10.5px] font-semibold text-[var(--text-muted)] mt-1">Assets Assessed</p>
        </Card>
      </div>

      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">Governability by Asset</p>
        <div className="flex flex-col gap-2.5">
          {results.map(r => (
            <Card key={r.assetId} className="!p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <span className="text-sm font-bold text-[var(--text-primary)]">{r.assetName}</span>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">{r.reasons[0]}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <GovernanceTruthCard assetId={r.assetId} compact />
                  <Pill tone={STATUS_TONE[r.status]}>{r.status}</Pill>
                  <Pill tone="var(--text-muted)">Evidence: {r.evidenceSufficiency.status}</Pill>
                  <Pill tone="var(--text-muted)">Authority: {r.authorityCurrency.status}</Pill>
                  <Pill tone="var(--text-muted)">Admissibility: {r.admissibility.outcome}</Pill>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ============== MODULE 6 — REPORT A MATERIAL CHANGE ============== */}
      <Card className="!p-5 border-[var(--accent-border)]">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">Report a Material Change (Reassessment Trigger)</p>
        {!canFile && <p className="text-[11px] text-[var(--text-muted)] mb-3">Your role can view triggers but not file new ones.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Asset"
            value={triggerAssetId}
            onChange={e => setTriggerAssetId(e.target.value)}
            options={assets.map(a => ({ value: a.id, label: a.name }))}
            disabled={!canFile}
          />
          <Select
            label="Trigger Type"
            value={triggerType}
            onChange={e => setTriggerType(e.target.value as ReassessmentTriggerType)}
            options={REASSESSMENT_TRIGGER_TYPES.map(t => ({ value: t.type, label: `${t.icon} ${t.type}` }))}
            disabled={!canFile}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Comment</label>
            <input
              value={triggerComment}
              onChange={e => setTriggerComment(e.target.value)}
              disabled={!canFile}
              placeholder="What changed?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]"
            />
          </div>
        </div>
        <button
          onClick={handleFileTrigger}
          disabled={!canFile || filing}
          className="mt-3 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'var(--grad-brand)' }}
        >
          {filing ? 'Filing…' : 'File Reassessment Trigger'}
        </button>
        <p className="text-[10.5px] text-[var(--text-muted)] mt-2">
          Filing a trigger raises a Governance Alert, requires reassessment, and appears on this asset's Governance
          Journey Timeline — it never suspends the asset automatically.
        </p>
      </Card>

      {/* ============== RELEASE 21.1 — FILE A REAUTHORIZATION (closes the loop a Reassessment Trigger opens) ============== */}
      <Card className="!p-5 border-[var(--accent-border)]">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">File a Reauthorization</p>
        {pendingReauthAssets.length === 0 ? (
          <p className="text-[11px] text-[var(--text-muted)]">No assets are currently Pending Reauthorisation.</p>
        ) : (
          <>
            {!canReauthorize && <p className="text-[11px] text-[var(--text-muted)] mb-3">Your role can view governance state but not file a reauthorization.</p>}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Asset"
                value={selectedReauthAssetId}
                onChange={e => setReauthAssetId(e.target.value)}
                options={pendingReauthAssets.map(a => ({ value: a.id, label: a.name }))}
                disabled={!canReauthorize}
              />
              <Select
                label="Decision"
                value={reauthDecision}
                onChange={e => setReauthDecision(e.target.value as DecisionOutcome)}
                options={[
                  { value: 'GO', label: 'GO' },
                  { value: 'CONDITIONAL GO', label: 'Conditional GO' },
                  { value: 'NO GO', label: 'No GO' },
                ]}
                disabled={!canReauthorize}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Reason</label>
                <input
                  value={reauthReason}
                  onChange={e => setReauthReason(e.target.value)}
                  disabled={!canReauthorize}
                  placeholder="Why is this asset being reauthorized?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]"
                />
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Supporting Notes (optional)</label>
              <input
                value={reauthNotes}
                onChange={e => setReauthNotes(e.target.value)}
                disabled={!canReauthorize}
                placeholder="Evidence or reassessment outcome supporting this decision"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]"
              />
            </div>
            <button
              onClick={handleFileReauthorization}
              disabled={!canReauthorize || !reauthReason || filingReauth}
              className="mt-3 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--grad-brand)' }}
            >
              {filingReauth ? 'Filing…' : 'File Reauthorization'}
            </button>
            <p className="text-[10.5px] text-[var(--text-muted)] mt-2">
              Reauthorizing restores this asset's governance state and moves it out of Pending Reauthorisation —
              the decision recorded here is always a named person's, never automatic.
            </p>
          </>
        )}
      </Card>

      {/* ============== MODULE 12 — POST-INTERVENTION REVALIDATION ============== */}
      <Card className="!p-5 border-[var(--accent-border)]">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">Post-Intervention Revalidation</p>
        <p className="text-[11px] text-[var(--text-muted)] mb-3">
          Context Change → Evidence Review → Authority Review → Admissibility Review → Continue or Remain Stopped.
          A recommendation for a human to act on — never an automatic suspension.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Asset"
            value={revalAssetId}
            onChange={e => setRevalAssetId(e.target.value)}
            options={assets.map(a => ({ value: a.id, label: a.name }))}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Detected Context Change</label>
            <input
              value={revalContext}
              onChange={e => setRevalContext(e.target.value)}
              placeholder="e.g. Vendor changed underlying model provider"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]"
            />
          </div>
        </div>
        <button
          onClick={handleRevalidate}
          disabled={!revalContext}
          className="mt-3 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'var(--grad-brand)' }}
        >
          Run Revalidation
        </button>

        {revalResult && (
          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              {revalResult.steps.map(step => (
                <div key={step.step} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-[var(--bg-sunken)]">
                  <span className="text-xs font-semibold text-[var(--text-primary)]">{step.step}</span>
                  <Pill tone={step.status === 'Passed' ? 'var(--status-success)' : step.status === 'Failed' ? 'var(--status-danger)' : 'var(--status-warning)'}>{step.status}</Pill>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[var(--text-primary)]">Recommendation:</span>
              <Pill tone={revalResult.recommendation === 'Continue' ? 'var(--status-success)' : 'var(--status-danger)'}>{revalResult.recommendation}</Pill>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
