import React, { useMemo, useState } from 'react';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { getAssets } from '../services/storageService';
import {
  deletePolicyMapping,
  getPolicies,
  getPoliciesForAsset,
  getPolicyMappings,
  savePolicyMapping,
} from '../services/policyService';
import type { AssetType, PolicyMapping, PolicyTargetType } from '../types';

const TARGET_TYPES: PolicyTargetType[] = ['AI Asset', 'Asset Type', 'Vendor', 'Business Unit'];

const TARGET_META: Record<PolicyTargetType, { icon: string; color: string }> = {
  'AI Asset': { icon: '🗂️', color: 'var(--stage-1)' },
  'Asset Type': { icon: '🧩', color: 'var(--stage-3)' },
  Vendor: { icon: '🔌', color: 'var(--stage-5)' },
  'Business Unit': { icon: '🏦', color: 'var(--stage-8)' },
};

const ASSET_TYPES: AssetType[] = [
  'Application',
  'Agent',
  'Model',
  'LLM',
  'Copilot',
  'RAG System',
  'AI Workflow',
  'Multi-Agent System',
  'Third-Party AI Service',
];

/** Phase 9 WS4 — Policy Mapping. */
export const PolicyMappingPage: React.FC = () => {
  // Q1 Stabilization — Phase 2: PolicyMapping has no matching ActionKey in
  // roleActionMatrix.ts, so writes here fall back to the safe !isReadOnly minimum.
  const { currentUser, isReadOnly } = useAuth();
  const [version, setVersion] = useState(0);
  const [targetFilter, setTargetFilter] = useState<PolicyTargetType | 'all'>('all');
  const [draft, setDraft] = useState<Partial<PolicyMapping> | null>(null);

  const assets = useMemo(() => getAssets(), []);
  const policies = useMemo(
    () => getPolicies(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version forces a re-read after a mutation
    [version]
  );
  const mappings = useMemo(
    () => getPolicyMappings(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version forces a re-read after a mutation
    [version]
  );

  const businessUnits = useMemo(
    () => [...new Set(assets.map(a => a.department))].sort(),
    [assets]
  );

  const vendors = useMemo(
    () =>
      [
        ...new Set(
          mappings.filter(m => m.targetType === 'Vendor').map(m => `${m.targetId}::${m.targetName}`)
        ),
      ].map(entry => {
        const [id, name] = entry.split('::');
        return { id, name };
      }),
    [mappings]
  );

  const filtered = useMemo(
    () => (targetFilter === 'all' ? mappings : mappings.filter(m => m.targetType === targetFilter)),
    [mappings, targetFilter]
  );

  /** Effective policy coverage per asset — direct, by type, or by business unit. */
  const coverage = useMemo(
    () =>
      assets.map(asset => ({
        asset,
        policies: getPoliciesForAsset(asset),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [assets, version]
  );

  const uncovered = coverage.filter(c => c.policies.length === 0).length;

  const handleSave = () => {
    if (!draft?.policyId || !draft?.targetId) return;
    savePolicyMapping(draft, currentUser?.name || 'Governance Admin');
    setDraft(null);
    setVersion(v => v + 1);
  };

  const handleDelete = (id: string) => {
    deletePolicyMapping(id, currentUser?.name || 'Governance Admin');
    setVersion(v => v + 1);
  };

  const targetOptions = (): { id: string; name: string }[] => {
    switch (draft?.targetType) {
      case 'AI Asset':
        return assets.map(a => ({ id: a.id, name: a.name }));
      case 'Asset Type':
        return ASSET_TYPES.map(t => ({ id: t, name: t }));
      case 'Business Unit':
        return businessUnits.map(u => ({ id: u, name: u }));
      case 'Vendor':
        return vendors;
      default:
        return [];
    }
  };

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Policy Mapping</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
            Bind policies to what they govern. A policy mapped to an asset type or business unit
            applies to every asset inside it — coverage is computed, not maintained by hand.
          </p>
        </div>
        <Button
          onClick={() => setDraft({ targetType: 'AI Asset', policyId: policies[0]?.id })}
          disabled={isReadOnly}
          title={isReadOnly ? 'Your governance role does not permit mapping policies.' : undefined}
        >
          Map Policy
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        <KpiCard label="Total Mappings" value={mappings.length} caption="Policy-to-target bindings" icon="🔗" tone="accent" />
        <KpiCard
          label="Policies Mapped"
          value={new Set(mappings.map(m => m.policyId)).size}
          caption={`of ${policies.length} registered policies`}
          icon="📕"
          tone="info"
        />
        <KpiCard
          label="Assets Covered"
          value={coverage.length - uncovered}
          caption={`${uncovered} with no bound policy`}
          icon="🛡️"
          tone={uncovered === 0 ? 'success' : 'warning'}
          progress={coverage.length > 0 ? ((coverage.length - uncovered) / coverage.length) * 100 : 0}
        />
        <KpiCard
          label="Governed Business Units"
          value={new Set(mappings.filter(m => m.targetType === 'Business Unit').map(m => m.targetId)).size}
          caption={`of ${businessUnits.length} in the estate`}
          icon="🏦"
          tone="neutral"
        />
      </div>

      {/* Coverage by asset */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          title="Effective Policy Coverage"
          subtitle="Which policies actually bind each AI asset once type and business unit mappings resolve."
          icon="🧬"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          {coverage.map(({ asset, policies: bound }) => (
            <div
              key={asset.id}
              data-noglass
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)] px-3.5 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-[var(--text-primary)] truncate">
                    {asset.name}
                  </p>
                  <p className="text-[10.5px] text-[var(--text-muted)]">
                    {asset.type} · {asset.department}
                  </p>
                </div>
                <span
                  className="tnum shrink-0 text-[11px] font-extrabold px-2 py-1 rounded-md border"
                  style={{
                    color: bound.length > 0 ? 'var(--status-success)' : 'var(--status-danger)',
                    borderColor:
                      bound.length > 0
                        ? 'var(--status-success-border)'
                        : 'var(--status-danger-border)',
                    background:
                      bound.length > 0 ? 'var(--status-success-bg)' : 'var(--status-danger-bg)',
                  }}
                >
                  {bound.length} {bound.length === 1 ? 'policy' : 'policies'}
                </span>
              </div>

              {bound.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {bound.map(policy => (
                    <span
                      key={policy.id}
                      title={policy.description}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                    >
                      {policy.policyRef}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Mapping register */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          title="Mapping Register"
          subtitle={`${filtered.length} of ${mappings.length} mappings shown.`}
          icon="🔗"
          action={
            <select
              value={targetFilter}
              onChange={e => setTargetFilter(e.target.value as PolicyTargetType | 'all')}
              className="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
            >
              <option value="all">All target types</option>
              {TARGET_TYPES.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[50rem] text-left">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                {['Policy', 'Target Type', 'Mapped To', 'Mapped By', 'Date', ''].map((h, i) => (
                  <th
                    key={h || `c-${i}`}
                    className="pb-2 pr-3 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.map(mapping => {
                const meta = TARGET_META[mapping.targetType];
                return (
                  <tr
                    key={mapping.id}
                    className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] transition-colors align-top"
                  >
                    <td className="py-3 pr-3 max-w-[20rem]">
                      <p className="text-[12.5px] font-semibold text-[var(--text-primary)]">
                        {mapping.policyName}
                      </p>
                      {mapping.notes && (
                        <p className="text-[10.5px] text-[var(--text-muted)] mt-1 leading-snug">
                          {mapping.notes}
                        </p>
                      )}
                    </td>

                    <td className="py-3 pr-3">
                      <span
                        data-noglass
                        className="text-[10px] font-extrabold uppercase px-2 py-1 rounded-md border whitespace-nowrap"
                        style={{
                          color: meta.color,
                          borderColor: `color-mix(in srgb, ${meta.color} 45%, transparent)`,
                          background: `color-mix(in srgb, ${meta.color} 12%, transparent)`,
                        }}
                      >
                        {meta.icon} {mapping.targetType}
                      </span>
                    </td>

                    <td className="py-3 pr-3 text-[12px] font-semibold text-[var(--text-primary)]">
                      {mapping.targetName}
                    </td>

                    <td className="py-3 pr-3 text-[11.5px] text-[var(--text-secondary)] whitespace-nowrap">
                      {mapping.mappedBy}
                    </td>

                    <td className="py-3 pr-3 tnum text-[11px] text-[var(--text-muted)] whitespace-nowrap">
                      {mapping.mappedDate}
                    </td>

                    <td className="py-3">
                      <button
                        onClick={() => handleDelete(mapping.id)}
                        disabled={isReadOnly}
                        title={isReadOnly ? 'Your governance role does not permit removing policy mappings.' : undefined}
                        className={`text-[11px] font-bold text-[var(--status-danger)] whitespace-nowrap ${
                          isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:underline cursor-pointer'
                        }`}
                      >
                        Unmap
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <p className="py-10 text-center text-[13px] text-[var(--text-muted)]">
              No mappings for this target type yet.
            </p>
          )}
        </div>
      </section>

      {/* Mapping editor */}
      {draft && (
        <Modal
          isOpen
          onClose={() => setDraft(null)}
          maxWidth="xl"
          title="Map Policy"
          subtitle="Bind a policy to an asset, an asset type, a vendor or a business unit."
        >
          <div className="flex flex-col gap-3.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-[var(--text-muted)]">
                Policy
              </span>
              <select
                value={draft.policyId || ''}
                onChange={e => setDraft({ ...draft, policyId: e.target.value })}
                className={inputClass}
              >
                <option value="">Select a policy…</option>
                {policies
                  .filter(p => p.status !== 'Retired')
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.policyRef} — {p.name}
                    </option>
                  ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-[var(--text-muted)]">
                Target Type
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TARGET_TYPES.map(type => {
                  const active = draft.targetType === type;
                  return (
                    <button
                      key={type}
                      onClick={() =>
                        setDraft({ ...draft, targetType: type, targetId: '', targetName: '' })
                      }
                      data-noglass
                      className={`px-2.5 py-2 rounded-lg text-[11.5px] font-bold border transition-all cursor-pointer ${
                        active
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-light)] text-[var(--accent-primary)]'
                          : 'border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-secondary)] hover:border-[var(--accent-border)]'
                      }`}
                    >
                      {TARGET_META[type].icon} {type}
                    </button>
                  );
                })}
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-[var(--text-muted)]">
                Mapped To
              </span>
              {draft.targetType === 'Vendor' ? (
                <input
                  value={draft.targetName || ''}
                  onChange={e =>
                    setDraft({
                      ...draft,
                      targetName: e.target.value,
                      targetId: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                    })
                  }
                  placeholder="Vendor name"
                  className={inputClass}
                />
              ) : (
                <select
                  value={draft.targetId || ''}
                  onChange={e => {
                    const option = targetOptions().find(o => o.id === e.target.value);
                    setDraft({ ...draft, targetId: e.target.value, targetName: option?.name || '' });
                  }}
                  className={inputClass}
                >
                  <option value="">Select a target…</option>
                  {targetOptions().map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              )}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-[var(--text-muted)]">
                Notes
              </span>
              <textarea
                value={draft.notes || ''}
                onChange={e => setDraft({ ...draft, notes: e.target.value })}
                rows={2}
                placeholder="Why this policy binds this target."
                className={inputClass}
              />
            </label>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={() => setDraft(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!draft.policyId || !draft.targetId || isReadOnly}>
                Create Mapping
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const inputClass =
  'w-full px-3 py-2 rounded-lg text-[12.5px] bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-focus)]';
