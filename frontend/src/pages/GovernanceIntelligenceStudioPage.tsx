import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { GovernancePolicySeverityBadge, GovernanceOutcomeBadge } from '../components/ui/Badge';
import {
  getConditionDefinitions,
  saveConditionDefinition,
  getOutcomeRules,
  saveOutcomeRule,
  getActionRules,
  saveActionRule,
  deleteActionRule,
  getGovernanceProfiles,
  saveGovernanceProfile,
  getGovernancePolicies,
  getRegulatorySources,
  getRegulatoryRequirements,
  getObligations,
  getObligationControls,
} from '../services/storageService';
import type { ActionRule, ConditionDefinition, GovernanceProfile, OutcomeRule, RecommendedActionType } from '../types';

type StudioTab = 'conditions' | 'policies' | 'outcomes' | 'actions' | 'mapping' | 'packs' | 'profiles';

const TABS: { key: StudioTab; label: string; icon: string }[] = [
  { key: 'conditions', label: 'Condition Designer', icon: '🔎' },
  { key: 'policies', label: 'Policy Designer', icon: '📜' },
  { key: 'outcomes', label: 'Outcome Designer', icon: '🧭' },
  { key: 'actions', label: 'Action Designer', icon: '⚙️' },
  { key: 'mapping', label: 'Rule Mapping Engine', icon: '🔗' },
  { key: 'packs', label: 'Compliance Pack Builder', icon: '🧩' },
  { key: 'profiles', label: 'Customer Profiles', icon: '🏢' },
];

const ACTION_TYPES: RecommendedActionType[] = ['Review', 'Reassessment', 'Validation', 'Approval', 'Reauthorization', 'Ownership', 'Escalation'];

const emptyActionRule: Partial<ActionRule> = {
  triggerType: 'Condition',
  triggerValue: 'Evidence Expired',
  actionType: 'Review',
  actionName: '',
  actionDescription: '',
  enabled: true,
};

/**
 * OMG Release 10 — Governance Intelligence Studio (Customer Configuration
 * Edition). "Configure governance logic without code changes." Detection
 * mechanisms and outcome evaluation order stay platform primitives; what's
 * configurable is which conditions/outcome-tiers are enabled and what
 * actions they produce — the final core-platform release before
 * customer-specific compliance packs.
 */
export const GovernanceIntelligenceStudioPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StudioTab>('conditions');
  const [conditions, setConditions] = useState<ConditionDefinition[]>(() => getConditionDefinitions());
  const [outcomes, setOutcomes] = useState<OutcomeRule[]>(() => getOutcomeRules());
  const [actionRules, setActionRules] = useState<ActionRule[]>(() => getActionRules());
  const [profiles, setProfiles] = useState<GovernanceProfile[]>(() => getGovernanceProfiles());
  const [policies] = useState(() => getGovernancePolicies());

  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [editingActionRule, setEditingActionRule] = useState<Partial<ActionRule> | null>(null);

  const refreshConditions = () => setConditions(getConditionDefinitions());
  const refreshOutcomes = () => setOutcomes(getOutcomeRules());
  const refreshActionRules = () => setActionRules(getActionRules());
  const refreshProfiles = () => setProfiles(getGovernanceProfiles());

  const handleToggleCondition = async (c: ConditionDefinition) => {
    const persisting = saveConditionDefinition({ id: c.id, enabled: !c.enabled });
    refreshConditions();
    try {
      await persisting;
      refreshConditions();
    } catch (err) {
      alert(`This change saved to the local cache but could not be synced to Neon: ${(err as Error).message}.`);
      refreshConditions();
    }
  };

  const handleToggleOutcome = async (o: OutcomeRule) => {
    const persisting = saveOutcomeRule({ id: o.id, enabled: !o.enabled });
    refreshOutcomes();
    try {
      await persisting;
      refreshOutcomes();
    } catch (err) {
      alert(`This change saved to the local cache but could not be synced to Neon: ${(err as Error).message}.`);
      refreshOutcomes();
    }
  };

  const handleToggleActionRule = async (r: ActionRule) => {
    const persisting = saveActionRule({ id: r.id, enabled: !r.enabled });
    refreshActionRules();
    try {
      await persisting;
      refreshActionRules();
    } catch (err) {
      alert(`This change saved to the local cache but could not be synced to Neon: ${(err as Error).message}.`);
      refreshActionRules();
    }
  };

  const handleSaveActionRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActionRule?.actionName || !editingActionRule?.triggerValue) return;

    const persisting = saveActionRule(editingActionRule);
    refreshActionRules();
    setIsActionModalOpen(false);
    setEditingActionRule(null);

    try {
      await persisting;
      refreshActionRules();
    } catch (err) {
      alert(`This action rule saved to the local cache but could not be synced to Neon: ${(err as Error).message}.`);
    }
  };

  const handleDeleteActionRule = async (id: string) => {
    if (!confirm('Delete this action rule? Governance will fall back to no configured action for this trigger.')) return;
    const persisting = deleteActionRule(id);
    refreshActionRules();
    try {
      await persisting;
    } catch (err) {
      alert(`This delete could not be synced to Neon: ${(err as Error).message}.`);
      refreshActionRules();
    }
  };

  const handleActivateProfile = async (p: GovernanceProfile) => {
    if (p.isActive) return;
    const persisting = saveGovernanceProfile({ id: p.id, isActive: true });
    setProfiles(prev => prev.map(x => ({ ...x, isActive: x.id === p.id })));
    try {
      await persisting;
      refreshProfiles();
    } catch (err) {
      alert(`This change saved to the local cache but could not be synced to Neon: ${(err as Error).message}.`);
      refreshProfiles();
    }
  };

  const conditionTriggerOptions = conditions.map(c => ({ value: c.label, label: c.label }));
  const outcomeTriggerOptions = outcomes.map(o => ({ value: o.outcomeStatus, label: o.outcomeStatus }));

  const sources = getRegulatorySources();
  const requirements = getRegulatoryRequirements();
  const obligations = getObligations();
  const obligationControls = getObligationControls();
  const policiesWithObligation = policies.filter(p => p.obligationId);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Governance Intelligence Studio</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Built Once. Configured Many Times. Configure governance logic without code changes — Condition → Policy → Outcome → Action, tuned per customer, not per release.
        </p>
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

      {activeTab === 'conditions' && (
        <Card className="!p-0 overflow-hidden">
          <div className="p-5 border-b border-[var(--border-color)]">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Condition Designer</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">The detection mechanism for each condition type is platform code; enabling or disabling one here controls whether it is ever raised, for every asset, without touching code.</p>
          </div>
          <div className="flex flex-col divide-y divide-[var(--border-color)]">
            {conditions.map(c => (
              <div key={c.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-[var(--text-primary)]">{c.label}</span>
                    <GovernancePolicySeverityBadge severity={c.defaultSeverity} size="sm" />
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{c.description}</p>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] shrink-0 cursor-pointer">
                  <input type="checkbox" checked={c.enabled} onChange={() => handleToggleCondition(c)} className="cursor-pointer" />
                  {c.enabled ? 'Enabled' : 'Disabled'}
                </label>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'policies' && (
        <Card className="!p-0 overflow-hidden">
          <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Policy Designer</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Policies already live as data since Release 7 — the Policy Registry is the Studio's Policy Designer. Full create/edit lives in the Governance Intelligence Workspace.</p>
            </div>
            <Link to="/governance-intelligence"><Button size="sm">Open Policy Registry</Button></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-[var(--bg-badge)] border-b border-[var(--border-color)] text-xs uppercase font-bold text-[var(--text-muted)] tracking-wider">
                <tr>
                  <th className="p-4">Policy</th>
                  <th className="p-4">Trigger Condition</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {policies.map(p => (
                  <tr key={p.id}>
                    <td className="p-4 font-bold text-[var(--text-primary)]">{p.name}</td>
                    <td className="p-4 text-xs text-[var(--text-secondary)]">{p.triggerCondition}</td>
                    <td className="p-4"><GovernancePolicySeverityBadge severity={p.severity} size="sm" /></td>
                    <td className="p-4 text-xs text-[var(--text-secondary)]">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'outcomes' && (
        <Card className="!p-0 overflow-hidden">
          <div className="p-5 border-b border-[var(--border-color)]">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Outcome Designer</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">The escalation order (Escalation &gt; Reassessment &gt; Review &gt; Attention &gt; Compliant) is a platform primitive and never changes. Disabling a tier here skips it — the engine falls through to the next enabled tier.</p>
          </div>
          <div className="flex flex-col divide-y divide-[var(--border-color)]">
            {outcomes.map(o => (
              <div key={o.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <GovernanceOutcomeBadge status={o.outcomeStatus} size="sm" />
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{o.description}</p>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] shrink-0 cursor-pointer">
                  <input type="checkbox" checked={o.enabled} onChange={() => handleToggleOutcome(o)} className="cursor-pointer" />
                  {o.enabled ? 'Enabled' : 'Disabled'}
                </label>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'actions' && (
        <Card className="!p-0 overflow-hidden">
          <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Action Designer</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">The Action Recommendation Library, made editable — one rule per Condition or Outcome trigger. A matching enabled rule overrides the platform default; a disabled rule suppresses the draft entirely.</p>
            </div>
            <Button size="sm" icon={<span>➕</span>} onClick={() => { setEditingActionRule({ ...emptyActionRule }); setIsActionModalOpen(true); }}>New Action Rule</Button>
          </div>
          <div className="flex flex-col divide-y divide-[var(--border-color)]">
            {actionRules.map(r => (
              <div key={r.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-[var(--text-primary)]">{r.actionName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-muted)] font-mono">{r.triggerType}: {r.triggerValue}</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{r.actionType} • {r.actionDescription}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] cursor-pointer">
                    <input type="checkbox" checked={r.enabled} onChange={() => handleToggleActionRule(r)} className="cursor-pointer" />
                    {r.enabled ? 'Enabled' : 'Disabled'}
                  </label>
                  <Button size="sm" variant="ghost" onClick={() => { setEditingActionRule({ ...r }); setIsActionModalOpen(true); }}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteActionRule(r.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'mapping' && (
        <Card className="!p-5">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Rule Mapping Engine</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 mb-4">Condition → Policy → Outcome → Action, read-only — how the configuration above chains together right now.</p>
          <div className="flex flex-col gap-3">
            {conditions.map(c => {
              const policy = policies.find(p => p.triggerCondition === c.conditionType);
              const conditionAction = actionRules.find(r => r.triggerType === 'Condition' && r.triggerValue === c.label);
              return (
                <div key={c.id} className="p-3.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                  <span className={`font-bold ${c.enabled ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] line-through'}`}>{c.label}</span>
                  <span className="text-[var(--text-muted)]">→</span>
                  <span className="text-[var(--text-secondary)]">{policy ? policy.name : 'No policy mapped'}</span>
                  <span className="text-[var(--text-muted)]">→</span>
                  <span className={conditionAction && !conditionAction.enabled ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-secondary)]'}>{conditionAction ? conditionAction.actionName : 'No action rule mapped'}</span>
                </div>
              );
            })}
            <div className="pt-3 border-t border-[var(--border-color)] flex flex-col gap-3">
              <span className="text-xs font-bold uppercase text-[var(--text-muted)]">Outcome → Action</span>
              {outcomes.map(o => {
                const outcomeAction = actionRules.find(r => r.triggerType === 'Outcome' && r.triggerValue === o.outcomeStatus);
                return (
                  <div key={o.id} className="p-3.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                    <GovernanceOutcomeBadge status={o.outcomeStatus} size="sm" />
                    <span className="text-[var(--text-muted)]">→</span>
                    <span className={outcomeAction && !outcomeAction.enabled ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-secondary)]'}>{outcomeAction ? outcomeAction.actionName : 'No procedural action mapped'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'packs' && (
        <Card className="!p-5">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Compliance Pack Builder Foundation</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 mb-4">Regulatory Source → Requirement → Obligation → Control, cross-linked to the Policies that enforce them — the foundation a customer-specific compliance pack builds on.</p>
          <div className="flex flex-col gap-3">
            {sources.map(s => {
              const sourceReqs = requirements.filter(r => r.sourceId === s.id);
              return (
                <div key={s.id} className="p-3.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[var(--text-primary)]">{s.name}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{s.jurisdiction} • {s.industry}</span>
                  </div>
                  <div className="mt-2 flex flex-col gap-2">
                    {sourceReqs.map(req => {
                      const reqObligations = obligations.filter(o => o.requirementId === req.id);
                      return (
                        <div key={req.id} className="pl-4 border-l-2 border-[var(--border-color)]">
                          <span className="text-xs font-semibold text-[var(--text-secondary)]">{req.name}</span>
                          {reqObligations.map(ob => {
                            const controls = obligationControls.filter(c => c.obligationId === ob.id);
                            const linkedPolicies = policiesWithObligation.filter(p => p.obligationId === ob.id);
                            return (
                              <div key={ob.id} className="pl-4 mt-1 flex flex-col gap-1">
                                <span className="text-[11px] text-[var(--text-muted)]">Obligation: {ob.name} ({controls.length} control{controls.length !== 1 ? 's' : ''})</span>
                                {linkedPolicies.map(p => (
                                  <span key={p.id} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] w-fit">Enforced by policy: {p.name}</span>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {activeTab === 'profiles' && (
        <Card className="!p-0 overflow-hidden">
          <div className="p-5 border-b border-[var(--border-color)]">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Customer Governance Profiles</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Exactly one profile is active at a time, representing which industry configuration this tenant is running.</p>
          </div>
          <div className="flex flex-col divide-y divide-[var(--border-color)]">
            {profiles.map(p => (
              <div key={p.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-[var(--text-primary)]">{p.name}</span>
                    {p.isActive && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 font-bold">ACTIVE</span>}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{p.description}</p>
                </div>
                {!p.isActive && <Button size="sm" onClick={() => handleActivateProfile(p)}>Activate</Button>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {isActionModalOpen && editingActionRule && (
        <Modal isOpen={isActionModalOpen} onClose={() => setIsActionModalOpen(false)} title={editingActionRule.id ? 'Edit Action Rule' : 'New Action Rule'} maxWidth="lg">
          <form onSubmit={handleSaveActionRule} className="flex flex-col gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Trigger Type"
                options={[{ value: 'Condition', label: 'Condition' }, { value: 'Outcome', label: 'Outcome' }]}
                value={editingActionRule.triggerType || 'Condition'}
                onChange={e => setEditingActionRule({ ...editingActionRule, triggerType: e.target.value as ActionRule['triggerType'], triggerValue: e.target.value === 'Condition' ? (conditions[0]?.label || '') : (outcomes[0]?.outcomeStatus || '') })}
              />
              <Select
                label="Trigger Value"
                options={editingActionRule.triggerType === 'Outcome' ? outcomeTriggerOptions : conditionTriggerOptions}
                value={editingActionRule.triggerValue || ''}
                onChange={e => setEditingActionRule({ ...editingActionRule, triggerValue: e.target.value })}
              />
            </div>
            <Input label="Action Name" required value={editingActionRule.actionName || ''} onChange={e => setEditingActionRule({ ...editingActionRule, actionName: e.target.value })} placeholder="e.g. Renew Evidence" />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
              <textarea rows={2} className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" value={editingActionRule.actionDescription || ''} onChange={e => setEditingActionRule({ ...editingActionRule, actionDescription: e.target.value })} />
            </div>
            <Select label="Action Type" options={ACTION_TYPES.map(v => ({ value: v, label: v }))} value={editingActionRule.actionType || 'Review'} onChange={e => setEditingActionRule({ ...editingActionRule, actionType: e.target.value as RecommendedActionType })} />
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
              <Button type="button" variant="ghost" onClick={() => setIsActionModalOpen(false)}>Cancel</Button>
              <Button type="submit">{editingActionRule.id ? 'Save Changes' : 'Create Action Rule'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
