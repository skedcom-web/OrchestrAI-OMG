import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { getAssets, saveAsset } from '../services/storageService';
import { getTools, getAgentToolGrants, saveAgentToolGrant, deleteAgentToolGrant } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { AIAsset, AgentToolGrant, Tool } from '../types';

const CLASSIFICATION_TONE: Record<string, string> = {
  'Read-Only': 'var(--status-info)',
  'Write': 'var(--status-warning)',
  'Financial': 'var(--status-warning)',
  'External API': 'var(--status-info)',
  'Destructive': 'var(--status-danger)',
};

const AGENT_TYPES = ['Agent', 'Multi-Agent System'];

/**
 * R16 — Agent Governance. Agent is already an AssetType, not a new entity —
 * this screen surfaces the accountability fields agents specifically need:
 * delegation scope, human override authority, and which tools the agent is
 * authorized to call.
 */
export const AgentAccountabilityPage: React.FC = () => {
  const { canPerform, currentUser } = useAuth();
  const [assets, setAssets] = useState<AIAsset[]>(() => getAssets().filter(a => AGENT_TYPES.includes(a.type)));
  const [tools] = useState<Tool[]>(() => getTools());
  const [grants, setGrants] = useState<AgentToolGrant[]>(() => getAgentToolGrants());
  const [editingScope, setEditingScope] = useState<{ asset: AIAsset; value: string } | null>(null);
  const [grantTarget, setGrantTarget] = useState<AIAsset | null>(null);
  const [selectedToolId, setSelectedToolId] = useState('');
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

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SectionHeader
        title="Agent Accountability"
        subtitle="Delegation scope, tool grants and human override authority for every autonomous agent."
        icon="🕹️"
      />

      <div className="flex flex-col gap-4">
        {assets.map(asset => {
          const agentGrants = grants.filter(g => g.assetId === asset.id);
          return (
            <Card key={asset.id} className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{asset.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{asset.type} · {asset.department}</p>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                  Override authority: {asset.authorityProfile?.humanOverrideAuthority || '—'}
                </span>
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
    </div>
  );
};
