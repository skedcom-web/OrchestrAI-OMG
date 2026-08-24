import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { GovernanceFindingStatusBadge, GovernanceOutcomeBadge, GovernancePolicySeverityBadge, RecommendedActionStatusBadge } from '../components/ui/Badge';
import {
  getAssets,
  getGovernancePolicies,
  saveGovernancePolicy,
  getGovernanceConditionsForAsset,
  getPolicyViolationsForAsset,
  getGovernanceFindingsForAsset,
  saveGovernanceFinding,
  getGovernanceOutcomeForAsset,
  getRecommendedActionsForAsset,
  generateRecommendedActionsForAsset,
} from '../services/storageService';
import { GOVERNANCE_PLAYBOOKS } from '../config/governanceActionsEngine';
import type { GovernanceConditionType, GovernanceFindingStatus, GovernancePolicy } from '../types';

const OUTCOME_PLAYBOOK: Partial<Record<string, keyof typeof GOVERNANCE_PLAYBOOKS>> = {
  'Review Required': 'Review',
  'Reassessment Recommended': 'Reassessment',
};

type WorkspaceTab = 'policies' | 'conditions' | 'findings' | 'outcomes' | 'explanations';

const TABS: { key: WorkspaceTab; label: string; icon: string }[] = [
  { key: 'policies', label: 'Policies', icon: '📜' },
  { key: 'conditions', label: 'Conditions', icon: '🔎' },
  { key: 'findings', label: 'Findings', icon: '🚩' },
  { key: 'outcomes', label: 'Outcomes', icon: '🧭' },
  { key: 'explanations', label: 'Explanations', icon: '💡' },
];

const CONDITION_TYPES: GovernanceConditionType[] = [
  'Evidence Expired', 'Review Overdue', 'Missing Approval', 'Missing Owner', 'Missing Validation', 'Missing Reauthorization',
];

const FINDING_STATUS_FLOW: Record<GovernanceFindingStatus, GovernanceFindingStatus | null> = {
  'Open': 'Under Review',
  'Under Review': 'Resolved',
  'Accepted Risk': null,
  'Resolved': null,
};

/**
 * OMG Release 7 — Governance Intelligence Engine (Foundation Edition).
 *
 * Policy Registry plus an asset-scoped reasoning workspace: Conditions
 * (detected live), Findings (persisted, manually managed), Outcomes
 * (recommended live) and Explanations (the reasoning chain behind the
 * outcome). Detection and recommendation only — nothing here changes an
 * asset's governance state automatically.
 */
export const GovernanceIntelligenceWorkspacePage: React.FC = () => {
  const [policies, setPolicies] = useState<GovernancePolicy[]>(() => getGovernancePolicies());
  const [assets] = useState(() => getAssets());
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('policies');

  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Partial<GovernancePolicy> | null>(null);

  const refreshPolicies = () => setPolicies(getGovernancePolicies());
  const [, forceRefresh] = useState(0);
  const refreshAll = () => forceRefresh(v => v + 1);

  const selectedAsset = assets.find(a => a.id === selectedAssetId) || null;
  const conditions = selectedAssetId ? getGovernanceConditionsForAsset(selectedAssetId) : [];
  const violations = selectedAssetId ? getPolicyViolationsForAsset(selectedAssetId) : [];
  const findings = selectedAssetId ? getGovernanceFindingsForAsset(selectedAssetId) : [];
  const outcome = selectedAssetId ? getGovernanceOutcomeForAsset(selectedAssetId) : null;
  const recommendedActions = selectedAssetId ? getRecommendedActionsForAsset(selectedAssetId) : [];
  const applicablePlaybook = outcome ? OUTCOME_PLAYBOOK[outcome.status] : undefined;

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy?.name || !editingPolicy?.triggerCondition) return;

    const persisting = saveGovernancePolicy(editingPolicy); // synchronous cache update happens before this line returns
    refreshPolicies();
    setIsPolicyModalOpen(false);
    setEditingPolicy(null);

    try {
      await persisting;
      refreshPolicies();
    } catch (err) {
      alert(`This policy saved to the local cache but could not be synced to Neon: ${(err as Error).message}. It will not be visible on other devices until sync succeeds.`);
    }
  };

  const handleGenerateFindings = async () => {
    const existingActiveKeys = new Set(
      findings.filter(f => f.status !== 'Resolved').map(f => `${f.policyId}|${f.conditionType}`)
    );
    const toCreate = violations.filter(v => !existingActiveKeys.has(`${v.policyId}|${v.conditionType}`));
    if (toCreate.length === 0) {
      alert('No new violations to raise as findings — every currently-triggered policy already has an active finding for this asset.');
      return;
    }

    const persisting = Promise.all(
      toCreate.map(v => saveGovernanceFinding({ assetId: v.assetId, policyId: v.policyId, conditionType: v.conditionType, severity: v.severity, status: 'Open', detail: v.detail }))
    );
    refreshAll();

    try {
      await persisting;
      refreshAll();
    } catch (err) {
      alert(`Findings saved to the local cache but could not be synced to Neon: ${(err as Error).message}.`);
    }
  };

  const handleAdvanceFinding = async (findingId: string, nextStatus: GovernanceFindingStatus) => {
    const persisting = saveGovernanceFinding({ id: findingId, status: nextStatus, resolutionDate: nextStatus === 'Resolved' ? new Date().toISOString().split('T')[0] : undefined });
    refreshAll();

    try {
      await persisting;
      refreshAll();
    } catch (err) {
      alert(`This status change saved to the local cache but could not be synced to Neon: ${(err as Error).message}.`);
      refreshAll();
    }
  };

  const handleAcceptRisk = (findingId: string) => handleAdvanceFinding(findingId, 'Accepted Risk');

  const handleGenerateActions = async () => {
    if (!selectedAssetId) return;
    try {
      const created = await generateRecommendedActionsForAsset(selectedAssetId);
      refreshAll();
      if (created.length === 0) {
        alert('No new recommended actions — every currently open finding and the current outcome already has an active action for this asset.');
      }
    } catch (err) {
      alert(`Some recommended actions could not be synced to Neon: ${(err as Error).message}.`);
      refreshAll();
    }
  };

  const assetOptions = assets.map(a => ({ value: a.id, label: a.name }));

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Governance Intelligence Workspace</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Policy → Condition → Violation → Finding → Outcome, with every outcome explainable. Detection and recommendation only — no automatic state changes.
          </p>
        </div>
        <Button
          onClick={() => { setEditingPolicy({ name: '', description: '', category: 'General', severity: 'Medium', status: 'Draft', triggerCondition: 'Missing Owner', linkedControlIds: [] }); setIsPolicyModalOpen(true); }}
          icon={<span>➕</span>}
        >
          Register Policy
        </Button>
      </div>

      <div className="flex items-center gap-1 border-b border-[var(--border-color)] overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer border-b-2 ${
              activeTab === tab.key
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'policies' && (
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-[var(--bg-badge)] border-b border-[var(--border-color)] text-xs uppercase font-bold text-[var(--text-muted)] tracking-wider">
                <tr>
                  <th className="p-4">Policy</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Trigger Condition</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {policies.map(policy => (
                  <tr key={policy.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[var(--text-primary)]">{policy.name}</span>
                        <span className="text-xs text-[var(--text-muted)]">{policy.id}</span>
                        <span className="text-xs text-[var(--text-secondary)] mt-0.5">{policy.description}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-[var(--text-secondary)]">{policy.category}</td>
                    <td className="p-4 text-xs text-[var(--text-secondary)]">{policy.triggerCondition}</td>
                    <td className="p-4"><GovernancePolicySeverityBadge severity={policy.severity} size="sm" /></td>
                    <td className="p-4 text-xs text-[var(--text-secondary)]">{policy.status}</td>
                    <td className="p-4 text-right">
                      <Button size="sm" variant="ghost" onClick={() => { setEditingPolicy({ ...policy }); setIsPolicyModalOpen(true); }}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab !== 'policies' && (
        <Card className="!p-0 overflow-hidden">
          <div className="p-5 border-b border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{selectedAsset?.name || 'Select an asset'}</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Governance reasoning for this asset — open it to see triggered conditions, violated policies, findings and the recommended outcome.</p>
            </div>
            <div className="w-full sm:w-72">
              <Select options={assetOptions} value={selectedAssetId} onChange={e => setSelectedAssetId(e.target.value)} />
            </div>
          </div>

          <div className="p-5">
            {activeTab === 'conditions' && (
              <div className="flex flex-col gap-3">
                {conditions.length === 0 ? (
                  <span className="text-sm text-emerald-500 font-semibold">✓ No governance conditions detected for this asset.</span>
                ) : (
                  conditions.map((c, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)]">
                      <span className="font-bold text-sm text-[var(--text-primary)]">{c.conditionType}</span>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{c.detail}</p>
                    </div>
                  ))
                )}
                {violations.length > 0 && (
                  <div className="pt-3 border-t border-[var(--border-color)] flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase text-[var(--text-muted)]">Policies Violated</span>
                    {violations.map((v, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                        <span className="text-xs font-semibold text-amber-500">{v.policyName}</span>
                        <GovernancePolicySeverityBadge severity={v.severity} size="sm" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'findings' && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-end">
                  <Button size="sm" onClick={handleGenerateFindings} disabled={violations.length === 0}>
                    Generate Findings from Violations
                  </Button>
                </div>
                {findings.length === 0 ? (
                  <span className="text-sm text-[var(--text-muted)] italic">No findings raised for this asset yet.</span>
                ) : (
                  findings.map(f => {
                    const next = FINDING_STATUS_FLOW[f.status];
                    return (
                      <div key={f.id} className="p-3.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[var(--text-primary)]">{f.policyName}</span>
                            <GovernancePolicySeverityBadge severity={f.severity} size="sm" />
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{f.conditionType} — {f.detail}</p>
                          <span className="text-[10px] text-[var(--text-muted)]">Created {f.createdDate}{f.resolutionDate ? ` • Resolved ${f.resolutionDate}` : ''}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <GovernanceFindingStatusBadge status={f.status} size="sm" />
                          {next && <Button size="sm" variant="ghost" onClick={() => handleAdvanceFinding(f.id, next)}>Mark {next}</Button>}
                          {f.status === 'Open' && <Button size="sm" variant="ghost" onClick={() => handleAcceptRisk(f.id)}>Accept Risk</Button>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'outcomes' && outcome && (
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase text-[var(--text-muted)]">Recommended Outcome</span>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">Recommendation only — no automatic state change.</p>
                  </div>
                  <GovernanceOutcomeBadge status={outcome.status} />
                </div>

                {applicablePlaybook && (
                  <div className="p-4 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)]">
                    <span className="text-xs font-bold uppercase text-[var(--text-muted)]">{GOVERNANCE_PLAYBOOKS[applicablePlaybook].name}</span>
                    <ol className="flex flex-col gap-1 mt-2">
                      {GOVERNANCE_PLAYBOOKS[applicablePlaybook].steps.map((step, i) => (
                        <li key={i} className="text-xs text-[var(--text-secondary)]"><span className="font-mono text-[var(--text-muted)] mr-2">{i + 1}.</span>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-[var(--text-muted)]">Recommended Actions</span>
                    <Button size="sm" onClick={handleGenerateActions}>Generate Recommended Actions</Button>
                  </div>
                  {recommendedActions.length === 0 ? (
                    <span className="text-sm text-[var(--text-muted)] italic">No recommended actions raised for this asset yet.</span>
                  ) : (
                    recommendedActions.map(a => (
                      <div key={a.id} className="p-3.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[var(--text-primary)]">{a.name}</span>
                            <GovernancePolicySeverityBadge severity={a.priority} size="sm" />
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{a.actionType} • {a.description}</p>
                        </div>
                        <RecommendedActionStatusBadge status={a.status} size="sm" />
                      </div>
                    ))
                  )}
                  <span className="text-[10px] text-[var(--text-muted)] italic">Accept, reject, defer and progress actions in the Governance Actions workspace.</span>
                </div>
              </div>
            )}

            {activeTab === 'explanations' && outcome && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-[var(--text-muted)]">Why:</span>
                  <GovernanceOutcomeBadge status={outcome.status} size="sm" />
                </div>
                {outcome.reasons.length === 0 ? (
                  <span className="text-sm text-[var(--text-muted)] italic">No reasoning trail — nothing detected for this asset.</span>
                ) : (
                  <ol className="flex flex-col gap-2">
                    {outcome.reasons.map((reason, i) => (
                      <li key={i} className="text-xs p-2.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                        <span className="font-mono text-[var(--text-muted)] mr-2">{i + 1}.</span>{reason}
                      </li>
                    ))}
                  </ol>
                )}
                {recommendedActions.length > 0 && (
                  <div className="pt-2 border-t border-[var(--border-color)] flex flex-col gap-1.5">
                    <span className="text-xs font-bold uppercase text-[var(--text-muted)]">→ Recommended Action{recommendedActions.length > 1 ? 's' : ''}</span>
                    {recommendedActions.map(a => (
                      <span key={a.id} className="text-xs p-2 rounded-lg bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-secondary)]">{a.name} ({a.status})</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Policy Modal */}
      {isPolicyModalOpen && editingPolicy && (
        <Modal isOpen={isPolicyModalOpen} onClose={() => setIsPolicyModalOpen(false)} title={editingPolicy.id ? 'Edit Policy' : 'Register Policy'} maxWidth="lg">
          <form onSubmit={handleSavePolicy} className="flex flex-col gap-4 py-2">
            <Input label="Policy Name" required value={editingPolicy.name || ''} onChange={e => setEditingPolicy({ ...editingPolicy, name: e.target.value })} placeholder="e.g. Evidence Must Be Current" />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
              <textarea rows={2} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" value={editingPolicy.description || ''} onChange={e => setEditingPolicy({ ...editingPolicy, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Category" value={editingPolicy.category || ''} onChange={e => setEditingPolicy({ ...editingPolicy, category: e.target.value })} />
              <Select label="Trigger Condition" required options={CONDITION_TYPES.map(v => ({ value: v, label: v }))} value={editingPolicy.triggerCondition || 'Missing Owner'} onChange={e => setEditingPolicy({ ...editingPolicy, triggerCondition: e.target.value as GovernanceConditionType })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Severity" options={['Low', 'Medium', 'High', 'Critical'].map(v => ({ value: v, label: v }))} value={editingPolicy.severity || 'Medium'} onChange={e => setEditingPolicy({ ...editingPolicy, severity: e.target.value as GovernancePolicy['severity'] })} />
              <Select label="Status" options={['Draft', 'Active', 'Retired'].map(v => ({ value: v, label: v }))} value={editingPolicy.status || 'Draft'} onChange={e => setEditingPolicy({ ...editingPolicy, status: e.target.value as GovernancePolicy['status'] })} />
            </div>
            <Input label="Linked Control IDs (comma-separated, optional)" value={(editingPolicy.linkedControlIds || []).join(', ')} onChange={e => setEditingPolicy({ ...editingPolicy, linkedControlIds: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="e.g. octl-approval-authority" />
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
              <Button type="button" variant="ghost" onClick={() => setIsPolicyModalOpen(false)}>Cancel</Button>
              <Button type="submit">{editingPolicy.id ? 'Save Changes' : 'Register Policy'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
