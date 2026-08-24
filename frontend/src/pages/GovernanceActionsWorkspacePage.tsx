import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { RecommendedActionStatusBadge, GovernancePolicySeverityBadge } from '../components/ui/Badge';
import {
  getAssets,
  getRecommendedActions,
  saveRecommendedAction,
  getGovernanceFindings,
  getGovernanceOutcomeForAsset,
} from '../services/storageService';
import type { RecommendedAction, RecommendedActionStatus } from '../types';

type ActionView = 'open' | 'accepted' | 'deferred' | 'completed';

const VIEWS: { key: ActionView; label: string; statuses: RecommendedActionStatus[] }[] = [
  { key: 'open', label: 'Open Actions', statuses: ['Open'] },
  { key: 'accepted', label: 'Accepted Actions', statuses: ['Accepted', 'In Progress'] },
  { key: 'deferred', label: 'Deferred Actions', statuses: ['Deferred'] },
  { key: 'completed', label: 'Completed Actions', statuses: ['Completed', 'Rejected'] },
];

/**
 * OMG Release 8 — Governance Intelligence Engine (Actions Edition).
 *
 * A flat, filterable view across every Recommended Action the engine has
 * raised — the bridge from Governance Intelligence to Governance Execution.
 * Accept, Reject or Defer here is the Human Decision Layer (Objective 6):
 * nothing executes automatically, and every transition is recorded to the
 * immutable audit trail.
 */
export const GovernanceActionsWorkspacePage: React.FC = () => {
  const [assets] = useState(() => getAssets());
  const [, forceRefresh] = useState(0);
  const refreshAll = () => forceRefresh(v => v + 1);

  const [activeView, setActiveView] = useState<ActionView>('open');
  const [assetFilter, setAssetFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [ownerFilter, setOwnerFilter] = useState('ALL');
  const [overdueOnly, setOverdueOnly] = useState(false);

  const allActions = getRecommendedActions();
  const owners = Array.from(new Set(allActions.map(a => a.owner).filter((o): o is string => !!o))).sort();
  const activeStatuses = VIEWS.find(v => v.key === activeView)!.statuses;
  const today = new Date().toISOString().split('T')[0];

  const filtered = allActions.filter(a => {
    if (!activeStatuses.includes(a.status)) return false;
    if (assetFilter !== 'ALL' && a.assetId !== assetFilter) return false;
    if (priorityFilter !== 'ALL' && a.priority !== priorityFilter) return false;
    if (ownerFilter !== 'ALL' && a.owner !== ownerFilter) return false;
    if (overdueOnly && !(a.dueDate && a.dueDate < today)) return false;
    return true;
  });

  const handleTransition = async (action: RecommendedAction, status: RecommendedActionStatus) => {
    const persisting = saveRecommendedAction({ id: action.id, status });
    refreshAll();

    try {
      await persisting;
      refreshAll();
    } catch (err) {
      alert(`This decision saved to the local cache but could not be synced to Neon: ${(err as Error).message}.`);
      refreshAll();
    }
  };

  const explainAction = (action: RecommendedAction) => {
    const chain: string[] = [];
    if (action.findingId) {
      const finding = getGovernanceFindings().find(f => f.id === action.findingId);
      if (finding) chain.push(finding.conditionType);
    }
    if (action.policyName) chain.push(action.policyName);
    if (action.findingId) chain.push('Finding');
    const outcome = getGovernanceOutcomeForAsset(action.assetId);
    if (outcome) chain.push(outcome.status);
    chain.push(action.name);
    return chain.join(' → ');
  };

  const assetOptions = [{ value: 'ALL', label: 'All Assets' }, ...assets.map(a => ({ value: a.id, label: a.name }))];
  const priorityOptions = ['ALL', 'Low', 'Medium', 'High', 'Critical'].map(v => ({ value: v, label: v === 'ALL' ? 'All Priorities' : v }));
  const ownerOptions = [{ value: 'ALL', label: 'All Owners' }, ...owners.map(o => ({ value: o, label: o }))];

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Governance Actions Workspace</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Recommended actions raised from Governance Intelligence outcomes — Accept, Reject or Defer. Nothing executes automatically; humans remain accountable.
        </p>
      </div>

      <div className="flex items-center gap-1 border-b border-[var(--border-color)] overflow-x-auto">
        {VIEWS.map(view => {
          const count = allActions.filter(a => view.statuses.includes(a.status)).length;
          return (
            <button
              key={view.key}
              onClick={() => setActiveView(view.key)}
              className={`px-3.5 py-2 rounded-t-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer border-b-2 ${
                activeView === view.key
                  ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {view.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
        <Select label="Asset" options={assetOptions} value={assetFilter} onChange={e => setAssetFilter(e.target.value)} />
        <Select label="Priority" options={priorityOptions} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} />
        <Select label="Owner" options={ownerOptions} value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} />
        <label className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] pb-2.5 cursor-pointer">
          <input type="checkbox" checked={overdueOnly} onChange={e => setOverdueOnly(e.target.checked)} className="cursor-pointer" />
          Overdue only
        </label>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="flex flex-col divide-y divide-[var(--border-color)]">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-[var(--text-muted)] italic">No actions match this view and filters.</div>
          ) : (
            filtered.map(action => (
              <div key={action.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-[var(--text-primary)]">{action.name}</span>
                    <GovernancePolicySeverityBadge severity={action.priority} size="sm" />
                    <RecommendedActionStatusBadge status={action.status} size="sm" />
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{action.description}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1 font-mono">{explainAction(action)}</p>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {action.assetName} • {action.actionType} • Owner: {action.owner || 'Unassigned'}{action.dueDate ? ` • Due ${action.dueDate}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {action.status === 'Open' && (
                    <>
                      <Button size="sm" onClick={() => handleTransition(action, 'Accepted')}>Accept</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleTransition(action, 'Deferred')}>Defer</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleTransition(action, 'Rejected')}>Reject</Button>
                    </>
                  )}
                  {action.status === 'Accepted' && (
                    <>
                      <Button size="sm" onClick={() => handleTransition(action, 'In Progress')}>Start</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleTransition(action, 'Deferred')}>Defer</Button>
                    </>
                  )}
                  {action.status === 'In Progress' && (
                    <Button size="sm" onClick={() => handleTransition(action, 'Completed')}>Mark Completed</Button>
                  )}
                  {action.status === 'Deferred' && (
                    <>
                      <Button size="sm" onClick={() => handleTransition(action, 'Accepted')}>Accept</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleTransition(action, 'Rejected')}>Reject</Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
