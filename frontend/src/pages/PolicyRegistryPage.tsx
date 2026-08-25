import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import {
  getMappingsForPolicy,
  getPolicies,
  getPolicyComplianceSummary,
  getPolicyViolations,
  savePolicy,
} from '../services/policyService';
import type { Policy, PolicyCategory, PolicyStatus } from '../types';

const CATEGORIES: PolicyCategory[] = [
  'Governance Policies',
  'Risk Policies',
  'Security Policies',
  'Privacy Policies',
  'Vendor Policies',
];

const CATEGORY_META: Record<PolicyCategory, { icon: string; accent: string }> = {
  'Governance Policies': { icon: '⚖️', accent: '#8B5CF6' },
  'Risk Policies': { icon: '⚡', accent: '#F97316' },
  'Security Policies': { icon: '🔐', accent: '#0EA5E9' },
  'Privacy Policies': { icon: '🛡️', accent: '#10B981' },
  'Vendor Policies': { icon: '🔌', accent: '#EC4899' },
};

const STATUS_TONE: Record<PolicyStatus, string> = {
  Active: 'var(--status-success)',
  Draft: 'var(--status-neutral)',
  'Under Review': 'var(--status-warning)',
  Retired: 'var(--text-muted)',
};

const EMPTY_FORM: Partial<Policy> = {
  policyRef: '',
  name: '',
  category: 'Governance Policies',
  owner: '',
  ownerRole: 'Governance Admin',
  effectiveDate: new Date().toISOString().split('T')[0],
  reviewDate: '',
  status: 'Draft',
  description: '',
  mandatory: false,
};

/** Phase 9 WS3 — Policy Registry. */
export const PolicyRegistryPage: React.FC = () => {
  const navigate = useNavigate();
  // Q1 Stabilization — Phase 2: this page's `Policy` type is the Policy Registry entity,
  // distinct from `GovernancePolicy` (the Governance Intelligence Engine entity that owns
  // 'governancePolicy:create/edit/delete' in roleActionMatrix.ts) — no matching ActionKey
  // exists yet, so writes here fall back to the safe !isReadOnly minimum.
  const { currentUser, isReadOnly } = useAuth();

  const [version, setVersion] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<PolicyCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<PolicyStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Partial<Policy> | null>(null);

  const policies = useMemo(
    () => getPolicies(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version forces a re-read after a mutation
    [version]
  );
  const summary = useMemo(
    () => getPolicyComplianceSummary(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version forces a re-read after a mutation
    [version]
  );
  const violations = useMemo(
    () => getPolicyViolations(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version forces a re-read after a mutation
    [version]
  );

  const openViolationCount = (policyId: string) =>
    violations.filter(
      v => v.policyId === policyId && (v.status === 'Open' || v.status === 'Under Review')
    ).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return policies.filter(p => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.policyRef.toLowerCase().includes(q) &&
        !p.description.toLowerCase().includes(q) &&
        !p.owner.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [policies, categoryFilter, statusFilter, search]);

  const today = new Date().toISOString().split('T')[0];

  const handleSave = () => {
    if (!editing?.name?.trim()) return;
    savePolicy(editing, currentUser?.name || 'Governance Admin');
    setEditing(null);
    setVersion(v => v + 1);
  };

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Policy Registry</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
            The enterprise rulebook for artificial intelligence. OMG governs assets against these
            policies — each one is owned, dated, reviewed and enforceable.
          </p>
        </div>
        <Button
          onClick={() => setEditing({ ...EMPTY_FORM, owner: currentUser?.name || '' })}
          disabled={isReadOnly}
          title={isReadOnly ? 'Your governance role does not permit registering policies.' : undefined}
        >
          Register Policy
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        <KpiCard
          label="Total Policies"
          value={summary.totalPolicies}
          caption={`${summary.mandatoryPolicies} mandatory`}
          icon="📕"
          tone="accent"
        />
        <KpiCard
          label="Active Policies"
          value={summary.activePolicies}
          caption={`${summary.draftPolicies} draft · ${summary.underReviewPolicies} under review`}
          icon="✅"
          tone="success"
        />
        <KpiCard
          label="Policy Compliance"
          value={`${summary.complianceRate}%`}
          caption="Active policies with no open breach"
          icon="📊"
          tone={summary.complianceRate >= 80 ? 'success' : 'warning'}
          progress={summary.complianceRate}
        />
        <KpiCard
          label="Due For Review"
          value={summary.policiesDueForReview}
          caption="Past scheduled review date"
          icon="📅"
          tone={summary.policiesDueForReview === 0 ? 'success' : 'warning'}
        />
      </div>

      {/* Category distribution */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          title="Policy Categories"
          subtitle="Filter the register by the kind of rule being enforced."
          icon="🗂️"
          action={
            categoryFilter !== 'all' ? (
              <button
                onClick={() => setCategoryFilter('all')}
                className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                Clear filter
              </button>
            ) : undefined
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5">
          {CATEGORIES.map(category => {
            const inCategory = policies.filter(p => p.category === category);
            const active = categoryFilter === category;
            const meta = CATEGORY_META[category];
            const breaches = inCategory.reduce((n, p) => n + openViolationCount(p.id), 0);

            return (
              <button
                key={category}
                onClick={() => setCategoryFilter(active ? 'all' : category)}
                data-noglass
                className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                  active ? 'border-[var(--accent-primary)] bg-[var(--accent-light)]' : 'border-[var(--border-subtle)] bg-[var(--bg-sunken)] hover:border-[var(--accent-border)]'
                }`}
              >
                <span className="flex items-center justify-between">
                  <span className="text-base" aria-hidden>
                    {meta.icon}
                  </span>
                  {breaches > 0 && (
                    <span
                      className="tnum text-[9px] font-extrabold px-1.5 py-0.5 rounded text-white"
                      style={{ background: 'var(--status-danger)' }}
                      title={`${breaches} open violation${breaches === 1 ? '' : 's'}`}
                    >
                      {breaches}
                    </span>
                  )}
                </span>
                <p className="tnum text-xl font-extrabold text-[var(--text-primary)] mt-2 leading-none">
                  {inCategory.length}
                </p>
                <p className="text-[10.5px] font-semibold text-[var(--text-secondary)] mt-1 leading-tight">
                  {category.replace(' Policies', '')}
                </p>
                <span
                  className="mt-2 block h-1 rounded-full"
                  style={{ background: meta.accent, opacity: 0.7 }}
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* Register */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          title="Policy Register"
          subtitle={`${filtered.length} of ${policies.length} policies shown.`}
          icon="📋"
          action={
            <div className="flex items-center gap-2">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search policies"
                className="px-2.5 py-1.5 rounded-lg text-[12px] bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-focus)]"
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as PolicyStatus | 'all')}
                className="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="all">All statuses</option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Under Review">Under Review</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[58rem] text-left">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                {['Policy', 'Category', 'Owner', 'Effective', 'Review', 'Mapped', 'Breaches', 'Status', ''].map(
                  (heading, i) => (
                    <th
                      key={heading || `col-${i}`}
                      className="pb-2 pr-3 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]"
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {filtered.map(policy => {
                const mapped = getMappingsForPolicy(policy.id).length;
                const breaches = openViolationCount(policy.id);
                const overdue = policy.status === 'Active' && policy.reviewDate < today;

                return (
                  <tr
                    key={policy.id}
                    className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] transition-colors align-top"
                  >
                    <td className="py-3 pr-3 max-w-[22rem]">
                      <p className="text-[12.5px] font-semibold text-[var(--text-primary)]">
                        {policy.name}
                      </p>
                      <p className="mono text-[10px] text-[var(--accent-primary)] mt-0.5">
                        {policy.policyRef}
                        {policy.mandatory && (
                          <span className="ml-2 text-[9px] font-extrabold uppercase text-[var(--status-danger)]">
                            Mandatory
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-1 leading-snug line-clamp-2">
                        {policy.description}
                      </p>
                    </td>

                    <td className="py-3 pr-3">
                      <span className="text-[11.5px] text-[var(--text-secondary)] whitespace-nowrap">
                        {CATEGORY_META[policy.category].icon}{' '}
                        {policy.category.replace(' Policies', '')}
                      </span>
                    </td>

                    <td className="py-3 pr-3">
                      <p className="text-[11.5px] font-semibold text-[var(--text-primary)] whitespace-nowrap">
                        {policy.owner}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)]">{policy.ownerRole}</p>
                    </td>

                    <td className="py-3 pr-3 tnum text-[11px] text-[var(--text-secondary)] whitespace-nowrap">
                      {policy.effectiveDate}
                    </td>

                    <td className="py-3 pr-3 tnum text-[11px] whitespace-nowrap">
                      <span style={{ color: overdue ? 'var(--status-danger)' : 'var(--text-secondary)' }}>
                        {policy.reviewDate}
                      </span>
                      {overdue && (
                        <span className="block text-[9px] font-extrabold uppercase text-[var(--status-danger)]">
                          Overdue
                        </span>
                      )}
                    </td>

                    <td className="py-3 pr-3 text-center">
                      <button
                        onClick={() => navigate('/policy-mapping')}
                        className="tnum text-[12px] font-extrabold text-[var(--accent-primary)] hover:underline cursor-pointer"
                        title="Open policy mapping"
                      >
                        {mapped}
                      </button>
                    </td>

                    <td className="py-3 pr-3 text-center">
                      <span
                        className="tnum text-[12px] font-extrabold"
                        style={{
                          color: breaches > 0 ? 'var(--status-danger)' : 'var(--status-success)',
                        }}
                      >
                        {breaches}
                      </span>
                    </td>

                    <td className="py-3 pr-3">
                      <span
                        data-noglass
                        className="text-[9.5px] font-extrabold uppercase px-2 py-1 rounded-md border whitespace-nowrap"
                        style={{
                          color: STATUS_TONE[policy.status],
                          borderColor: `color-mix(in srgb, ${STATUS_TONE[policy.status]} 45%, transparent)`,
                          background: `color-mix(in srgb, ${STATUS_TONE[policy.status]} 12%, transparent)`,
                        }}
                      >
                        {policy.status}
                      </span>
                    </td>

                    <td className="py-3">
                      <button
                        onClick={() => setEditing(policy)}
                        disabled={isReadOnly}
                        title={isReadOnly ? 'Your governance role does not permit editing policies.' : undefined}
                        className={`text-[11px] font-bold text-[var(--accent-primary)] whitespace-nowrap ${
                          isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:underline cursor-pointer'
                        }`}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <p className="py-10 text-center text-[13px] text-[var(--text-muted)]">
              No policies match the current filters.
            </p>
          )}
        </div>
      </section>

      {/* Editor */}
      {editing && (
        <Modal
          isOpen
          onClose={() => setEditing(null)}
          maxWidth="2xl"
          title={editing.id ? 'Edit Policy' : 'Register Policy'}
          subtitle="Policies are the rules OMG governs AI assets against."
        >
          <div className="flex flex-col gap-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Policy Reference">
                <input
                  value={editing.policyRef || ''}
                  onChange={e => setEditing({ ...editing, policyRef: e.target.value })}
                  placeholder="POL-GOV-005"
                  className={inputClass}
                />
              </Field>
              <Field label="Category">
                <select
                  value={editing.category}
                  onChange={e =>
                    setEditing({ ...editing, category: e.target.value as PolicyCategory })
                  }
                  className={inputClass}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Policy Name">
              <input
                value={editing.name || ''}
                onChange={e => setEditing({ ...editing, name: e.target.value })}
                placeholder="Human Oversight Required"
                className={inputClass}
              />
            </Field>

            <Field label="Description">
              <textarea
                value={editing.description || ''}
                onChange={e => setEditing({ ...editing, description: e.target.value })}
                rows={3}
                placeholder="What this policy requires, and of whom."
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Policy Owner">
                <input
                  value={editing.owner || ''}
                  onChange={e => setEditing({ ...editing, owner: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Owner Role">
                <input
                  value={editing.ownerRole || ''}
                  onChange={e => setEditing({ ...editing, ownerRole: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Effective Date">
                <input
                  type="date"
                  value={editing.effectiveDate || ''}
                  onChange={e => setEditing({ ...editing, effectiveDate: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Review Date">
                <input
                  type="date"
                  value={editing.reviewDate || ''}
                  onChange={e => setEditing({ ...editing, reviewDate: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Status">
                <select
                  value={editing.status}
                  onChange={e => setEditing({ ...editing, status: e.target.value as PolicyStatus })}
                  className={inputClass}
                >
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Retired">Retired</option>
                </select>
              </Field>
              <Field label="Enforcement">
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editing.mandatory)}
                    onChange={e => setEditing({ ...editing, mandatory: e.target.checked })}
                  />
                  <span className="text-[12px] font-semibold text-[var(--text-secondary)]">
                    Mandatory policy
                  </span>
                </label>
              </Field>
            </div>

            {editing.enforcementRule && (
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed px-3 py-2 rounded-lg bg-[var(--bg-sunken)] border border-[var(--border-subtle)]">
                This policy carries the automated enforcement rule{' '}
                <span className="mono text-[var(--accent-primary)]">{editing.enforcementRule}</span>.
                Violations are detected continuously from live governance state.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!editing.name?.trim() || isReadOnly}>
                {editing.id ? 'Save Policy' : 'Register Policy'}
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

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-[var(--text-muted)]">
      {label}
    </span>
    {children}
  </label>
);
