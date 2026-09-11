import React, { useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { useAuth } from '../contexts/AuthContext';
import {
  getAssets,
  getAllGovernabilityResults,
  getReassessmentTriggers,
  saveReassessmentTrigger,
  computeRevalidation,
} from '../services/storageService';
import { REASSESSMENT_TRIGGER_TYPES } from '../config/governanceContinuity';
import type { GovernabilityStatus, ReassessmentTriggerType, RevalidationResult } from '../types';

const STATUS_TONE: Record<GovernabilityStatus, string> = {
  'Governable': 'var(--status-success)',
  'Governable With Conditions': 'var(--status-warning)',
  'Review Required': 'var(--status-warning)',
  'Governance Attention Required': 'var(--status-danger)',
  'Not Governable': 'var(--status-danger)',
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

  const canFile = canPerform('reassessmentTrigger:create');

  const breakdown = useMemo(() => {
    const counts: Record<GovernabilityStatus, number> = {
      'Governable': 0, 'Governable With Conditions': 0, 'Review Required': 0, 'Governance Attention Required': 0, 'Not Governable': 0,
    };
    results.forEach(r => { counts[r.status]++; });
    return counts;
  }, [results]);

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
    setTriggerComment('');
    setFiling(false);
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

      {/* ============== MODULE 5 — GOVERNABILITY DASHBOARD ============== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(Object.keys(breakdown) as GovernabilityStatus[]).map(status => (
          <Card key={status} className="!p-4">
            <p className="text-2xl font-extrabold tnum" style={{ color: STATUS_TONE[status] }}>{breakdown[status]}</p>
            <p className="text-[10.5px] font-semibold text-[var(--text-muted)] mt-1">{status}</p>
          </Card>
        ))}
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
