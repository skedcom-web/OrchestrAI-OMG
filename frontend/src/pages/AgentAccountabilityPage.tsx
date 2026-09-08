import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import {
  getAssets,
  saveAsset,
  saveAssetOwnership,
  getUsers,
  getTools,
  getAgentToolGrants,
  saveAgentToolGrant,
  deleteAgentToolGrant,
  getEvidenceRecordsForAsset,
  getAuditLogs,
} from '../services/storageService';
import { agentOwnershipComplete } from '../config/readinessFoundation';
import { computeReauthorizationStatus, REAUTHORIZATION_STATUS_TONE } from '../config/governanceContinuity';
import { buildAgentTraceabilityChain } from '../config/decisionTraceabilityEngine';
import { useAuth } from '../contexts/AuthContext';
import type { AIAsset, AgentToolGrant, OwnershipAssignment, ReviewFrequency, Tool } from '../types';

const CLASSIFICATION_TONE: Record<string, string> = {
  'Read-Only': 'var(--status-info)',
  'Write': 'var(--status-warning)',
  'Financial': 'var(--status-warning)',
  'External API': 'var(--status-info)',
  'Destructive': 'var(--status-danger)',
};

const AGENT_TYPES = ['Agent', 'Multi-Agent System'];

const FREQUENCY_OPTIONS: { value: ReviewFrequency; label: string }[] = [
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'Semi Annual', label: 'Semi Annual' },
  { value: 'Annual', label: 'Annual' },
];

/**
 * R16 — Agent Governance, hardened in R20.1 (Part 1). Agent is already an
 * AssetType, not a new entity — this screen surfaces the accountability,
 * reauthorization and traceability capabilities agents specifically need,
 * all reused from existing OMG foundations:
 *  - Accountability: the existing 5-role Ownership Matrix (asset.ownership).
 *  - Reauthorization: AIAsset's own governance continuity fields, extended
 *    with approvalDate/reviewFrequency; status is computed, not stored.
 *  - Traceability: AgentToolGrant + Audit Trail + Evidence Registry,
 *    reconstructed live (decisionTraceabilityEngine.ts), never persisted.
 */
export const AgentAccountabilityPage: React.FC = () => {
  const { canPerform, currentUser } = useAuth();
  const [assets, setAssets] = useState<AIAsset[]>(() => getAssets().filter(a => AGENT_TYPES.includes(a.type)));
  const [tools] = useState<Tool[]>(() => getTools());
  const [users] = useState(() => getUsers());
  const [grants, setGrants] = useState<AgentToolGrant[]>(() => getAgentToolGrants());
  const [editingScope, setEditingScope] = useState<{ asset: AIAsset; value: string } | null>(null);
  const [grantTarget, setGrantTarget] = useState<AIAsset | null>(null);
  const [selectedToolId, setSelectedToolId] = useState('');
  const [ownershipTarget, setOwnershipTarget] = useState<AIAsset | null>(null);
  const [formOwnership, setFormOwnership] = useState<OwnershipAssignment>({});
  const [continuityTarget, setContinuityTarget] = useState<AIAsset | null>(null);
  const [formApprovalDate, setFormApprovalDate] = useState('');
  const [formNextReviewDate, setFormNextReviewDate] = useState('');
  const [formFrequency, setFormFrequency] = useState<ReviewFrequency>('Quarterly');
  const [traceTarget, setTraceTarget] = useState<AIAsset | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = () => {
    setAssets(getAssets().filter(a => AGENT_TYPES.includes(a.type)));
    setGrants(getAgentToolGrants());
  };

  const openScopeEdit = (asset: AIAsset) => setEditingScope({ asset, value: asset.delegationScope || '' });

  const handleSaveScope = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScope) return;
    setSaving(true);
    try {
      await saveAsset({ id: editingScope.asset.id, delegationScope: editingScope.value });
      refresh();
      setEditingScope(null);
    } finally {
      setSaving(false);
    }
  };

  const openGrant = (asset: AIAsset) => {
    setGrantTarget(asset);
    setSelectedToolId('');
  };

  const availableTools = (assetId: string) => {
    const grantedIds = new Set(grants.filter(g => g.assetId === assetId).map(g => g.toolId));
    return tools.filter(t => !grantedIds.has(t.id));
  };

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantTarget || !selectedToolId) return;
    setSaving(true);
    try {
      await saveAgentToolGrant(grantTarget.id, selectedToolId, currentUser?.name || 'Unknown');
      refresh();
      setGrantTarget(null);
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async (grant: AgentToolGrant) => {
    if (!confirm(`Revoke ${grant.toolName || grant.toolId} access for ${grant.assetName || grant.assetId}?`)) return;
    await deleteAgentToolGrant(grant.id);
    refresh();
  };

  const userOptions = [{ value: '', label: '-- Select Named Owner --' }, ...users.map(u => ({ value: u.name, label: `${u.name} (${u.role})` }))];

  const openOwnership = (asset: AIAsset) => {
    setOwnershipTarget(asset);
    setFormOwnership({ ...(asset.ownership || {}) });
  };

  const handleSaveOwnership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownershipTarget) return;
    setSaving(true);
    try {
      await saveAssetOwnership(ownershipTarget.id, formOwnership, currentUser?.name || 'Unknown');
      refresh();
      setOwnershipTarget(null);
    } finally {
      setSaving(false);
    }
  };

  const openContinuity = (asset: AIAsset) => {
    setContinuityTarget(asset);
    setFormApprovalDate(asset.approvalDate || '');
    setFormNextReviewDate(asset.nextReviewDate || '');
    setFormFrequency(asset.reviewFrequency || 'Quarterly');
  };

  const handleSaveContinuity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!continuityTarget) return;
    setSaving(true);
    try {
      await saveAsset({
        id: continuityTarget.id,
        approvalDate: formApprovalDate || undefined,
        nextReviewDate: formNextReviewDate || undefined,
        reviewFrequency: formFrequency,
      });
      refresh();
      setContinuityTarget(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SectionHeader
        title="Agent Accountability"
        subtitle="Accountability, reauthorization, decision traceability, delegation scope and tool grants for every autonomous agent."
        icon="🕹️"
      />

      <div className="flex flex-col gap-4">
        {assets.map(asset => {
          const agentGrants = grants.filter(g => g.assetId === asset.id);
          const ownership = asset.ownership || {};
          const accountabilityComplete = agentOwnershipComplete(asset);
          const reauthStatus = computeReauthorizationStatus(asset.nextReviewDate);

          return (
            <Card key={asset.id} className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{asset.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{asset.type} · {asset.department}</p>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                  Override authority: {asset.authorityProfile?.humanOverrideAuthority || '—'}
                </span>
              </div>

              {/* Part 1.1 — Agent Accountability Mapping */}
              <div className="pt-3 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Accountability Mapping</p>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full"
                      style={{
                        color: accountabilityComplete ? 'var(--status-success)' : 'var(--status-danger)',
                        background: 'var(--bg-badge)',
                        border: `1px solid ${accountabilityComplete ? 'var(--status-success)' : 'var(--status-danger)'}40`,
                      }}
                    >
                      {accountabilityComplete ? 'Accountability Complete' : 'Accountability Incomplete'}
                    </span>
                    {canPerform('asset:edit') && (
                      <Button variant="ghost" size="sm" onClick={() => openOwnership(asset)} className="!px-2 !py-0.5 text-[10.5px]">Edit</Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div><span className="text-[var(--text-muted)] block">Business Owner</span><span className="font-semibold text-[var(--text-primary)]">{ownership.businessOwner || '—'}</span></div>
                  <div><span className="text-[var(--text-muted)] block">Technical Owner</span><span className="font-semibold text-[var(--text-primary)]">{ownership.technicalOwner || '—'}</span></div>
                  <div><span className="text-[var(--text-muted)] block">Risk Owner</span><span className="font-semibold text-[var(--text-primary)]">{ownership.riskOwner || '—'}</span></div>
                  <div><span className="text-[var(--text-muted)] block">Approver</span><span className="font-semibold text-[var(--text-primary)]">{ownership.approver || '—'}</span></div>
                </div>
              </div>

              {/* Part 1.2 — Agent Reauthorization & Governance Continuity */}
              <div className="pt-3 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Reauthorization &amp; Continuity</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full" style={{ color: REAUTHORIZATION_STATUS_TONE[reauthStatus], background: 'var(--bg-badge)', border: `1px solid ${REAUTHORIZATION_STATUS_TONE[reauthStatus]}40` }}>
                      {reauthStatus}
                    </span>
                    {canPerform('asset:edit') && (
                      <Button variant="ghost" size="sm" onClick={() => openContinuity(asset)} className="!px-2 !py-0.5 text-[10.5px]">Edit</Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div><span className="text-[var(--text-muted)] block">Approval Date</span><span className="font-semibold text-[var(--text-primary)]">{asset.approvalDate || '—'}</span></div>
                  <div><span className="text-[var(--text-muted)] block">Last Review</span><span className="font-semibold text-[var(--text-primary)]">{asset.lastReviewDate || '—'}</span></div>
                  <div><span className="text-[var(--text-muted)] block">Next Review</span><span className="font-semibold text-[var(--text-primary)]">{asset.nextReviewDate || '—'}</span></div>
                  <div><span className="text-[var(--text-muted)] block">Frequency</span><span className="font-semibold text-[var(--text-primary)]">{asset.reviewFrequency || '—'}</span></div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">Delegation Scope</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{asset.delegationScope || 'No delegation scope recorded yet.'}</p>
                {canPerform('asset:edit') && (
                  <Button variant="ghost" size="sm" onClick={() => openScopeEdit(asset)} className="!px-2 !py-1 text-[11px] mt-1.5">Edit Scope</Button>
                )}
              </div>

              <div className="pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Tool Grants</p>
                  {canPerform('agentToolGrant:create') && (
                    <Button variant="secondary" size="sm" onClick={() => openGrant(asset)} className="!px-2 !py-1 text-[11px]">Grant Tool</Button>
                  )}
                </div>
                {agentGrants.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)]">No tools granted.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {agentGrants.map(grant => {
                      const tool = tools.find(t => t.id === grant.toolId);
                      return (
                        <div key={grant.id} data-noglass className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)] px-3 py-2">
                          <div className="min-w-0 flex items-center gap-2">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full" style={{ color: CLASSIFICATION_TONE[tool?.classification || ''], background: 'var(--bg-badge)', border: `1px solid ${CLASSIFICATION_TONE[tool?.classification || '']}40` }}>
                              {tool?.classification || 'Unknown'}
                            </span>
                            <span className="text-xs font-semibold text-[var(--text-primary)] truncate">{grant.toolName || tool?.name}</span>
                          </div>
                          {canPerform('agentToolGrant:delete') && (
                            <Button variant="ghost" size="sm" onClick={() => handleRevoke(grant)} className="!px-2 !py-0.5 text-[10.5px] shrink-0">Revoke</Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Part 1.3 — Agent Decision Traceability */}
              <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setTraceTarget(asset)} className="!px-2 !py-1 text-[11px]">View Traceability Chain →</Button>
              </div>
            </Card>
          );
        })}

        {assets.length === 0 && <p className="text-center text-sm text-[var(--text-muted)] py-10">No agent-type assets are currently registered.</p>}
      </div>

      <Modal isOpen={!!editingScope} onClose={() => setEditingScope(null)} title={`Edit Delegation Scope — ${editingScope?.asset.name || ''}`} maxWidth="md">
        <form onSubmit={handleSaveScope} className="flex flex-col gap-4">
          <textarea
            required rows={4}
            value={editingScope?.value || ''}
            onChange={e => setEditingScope(v => (v ? { ...v, value: e.target.value } : v))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]"
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setEditingScope(null)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Scope'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!grantTarget} onClose={() => setGrantTarget(null)} title={`Grant Tool Access — ${grantTarget?.name || ''}`} subtitle="The agent will be authorized to call this tool immediately." maxWidth="sm">
        <form onSubmit={handleGrant} className="flex flex-col gap-4">
          <Select
            label="Tool"
            value={selectedToolId}
            onChange={e => setSelectedToolId(e.target.value)}
            options={[{ value: '', label: 'Select a tool…' }, ...(grantTarget ? availableTools(grantTarget.id) : []).map(t => ({ value: t.id, label: `${t.name} (${t.classification})` }))]}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setGrantTarget(null)}>Cancel</Button>
            <Button type="submit" disabled={saving || !selectedToolId}>{saving ? 'Granting…' : 'Grant Access'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!ownershipTarget} onClose={() => setOwnershipTarget(null)} title={`Accountability Mapping — ${ownershipTarget?.name || ''}`} subtitle="Business Owner, Technical Owner, Risk Owner and Approver — the same 5-role Ownership Matrix used platform-wide." maxWidth="lg">
        <form onSubmit={handleSaveOwnership} className="flex flex-col gap-4">
          <Select label="Business Owner" options={userOptions} value={formOwnership.businessOwner || ''} onChange={e => setFormOwnership(v => ({ ...v, businessOwner: e.target.value }))} />
          <Select label="Technical Owner" options={userOptions} value={formOwnership.technicalOwner || ''} onChange={e => setFormOwnership(v => ({ ...v, technicalOwner: e.target.value }))} />
          <Select label="Risk Owner" options={userOptions} value={formOwnership.riskOwner || ''} onChange={e => setFormOwnership(v => ({ ...v, riskOwner: e.target.value }))} />
          <Select label="Approver" options={userOptions} value={formOwnership.approver || ''} onChange={e => setFormOwnership(v => ({ ...v, approver: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOwnershipTarget(null)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Accountability'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!continuityTarget} onClose={() => setContinuityTarget(null)} title={`Reauthorization Schedule — ${continuityTarget?.name || ''}`} maxWidth="md">
        <form onSubmit={handleSaveContinuity} className="flex flex-col gap-4">
          <Input label="Approval Date" type="date" value={formApprovalDate} onChange={e => setFormApprovalDate(e.target.value)} />
          <Input label="Next Review Date" type="date" value={formNextReviewDate} onChange={e => setFormNextReviewDate(e.target.value)} />
          <Select label="Review Frequency" value={formFrequency} onChange={e => setFormFrequency(e.target.value as ReviewFrequency)} options={FREQUENCY_OPTIONS} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setContinuityTarget(null)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Schedule'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!traceTarget} onClose={() => setTraceTarget(null)} title={`Decision Traceability — ${traceTarget?.name || ''}`} subtitle="Agent → Tool Used → Action Performed → Evidence Generated → Outcome, reconstructed from the Audit Trail and Evidence Registry." maxWidth="lg">
        {traceTarget && (() => {
          const chain = buildAgentTraceabilityChain(
            traceTarget,
            grants.filter(g => g.assetId === traceTarget.id),
            getAuditLogs(),
            getEvidenceRecordsForAsset(traceTarget.id)
          );
          return (
            <div className="flex flex-col gap-3">
              <span
                className="self-start text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full"
                style={{
                  color: chain.traceabilityComplete ? 'var(--status-success)' : 'var(--status-warning)',
                  background: 'var(--bg-badge)',
                  border: `1px solid ${chain.traceabilityComplete ? 'var(--status-success)' : 'var(--status-warning)'}40`,
                }}
              >
                {chain.traceabilityComplete ? 'Traceability Complete' : 'Traceability Incomplete'}
              </span>
              <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                {chain.timeline.map((entry, i) => (
                  <div key={i} data-noglass className="flex gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)] px-3.5 py-2.5">
                    <span className="text-[10px] font-extrabold uppercase text-[var(--accent-primary)] shrink-0 w-16">{entry.stage}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--text-primary)]">{entry.label}</p>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{entry.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};
