import React, { useMemo, useState } from 'react';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import {
  CHANGE_STATUS_TONE,
  DECISION_TONE,
  IMPACT_TONE,
  MAGNITUDE_TONE,
  Pill,
  REASSESSMENT_TONE,
} from '../components/governance/ChangeStatusPill';
import { useAuth } from '../contexts/AuthContext';
import { getAssets } from '../services/storageService';
import {
  CHANGE_CATEGORIES,
  EMPTY_IMPACT,
  IMPACT_AREAS,
  IMPACT_OUTCOMES,
  advanceChangeStatus,
  beginReview,
  getCategoryDefinition,
  getChangeGovernanceMetrics,
  getChangeRequests,
  proposeImpact,
  recordApproval,
  resolveReassessment,
  routeApprovals,
  saveChangeRequest,
  scoreImpact,
  submitChangeRequest,
} from '../services/changeManagementService';
import type {
  ApproverRole,
  ChangeCategory,
  ChangeRequest,
  ChangeStatus,
  ImpactAssessment,
} from '../types/changeManagement';

const STATUSES: ChangeStatus[] = [
  'Draft',
  'Submitted',
  'Under Review',
  'Approved',
  'Rejected',
  'Implemented',
  'Closed',
];

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

/**
 * Phase 10 WS1/WS2/WS3/WS4/WS5 — Change Request Center.
 * Raise a change, classify it, assess its governance impact, let the rules
 * engine set the reassessment requirement, and work the routed approval chain.
 */
export const ChangeRequestCenterPage: React.FC = () => {
  const { currentUser, currentPersona, isReadOnly } = useAuth();
  const actor = currentUser?.name || 'Governance Admin';
  const actorRole = currentPersona?.role || 'GOVERNANCE_ADMIN';

  const [version, setVersion] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ChangeStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ChangeCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  const [draft, setDraft] = useState<Partial<ChangeRequest> | null>(null);
  const [selected, setSelected] = useState<ChangeRequest | null>(null);
  const [impactDraft, setImpactDraft] = useState<ImpactAssessment>(EMPTY_IMPACT);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [approverRole, setApproverRole] = useState<ApproverRole | ''>('');

  const assets = useMemo(() => getAssets(), []);
  const changes = useMemo(
    () => getChangeRequests(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version forces a re-read after a mutation
    [version]
  );
  const metrics = useMemo(
    () => getChangeGovernanceMetrics(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version forces a re-read after a mutation
    [version]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return changes.filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
      if (
        q &&
        !c.title.toLowerCase().includes(q) &&
        !c.changeRef.toLowerCase().includes(q) &&
        !c.assetName.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [changes, statusFilter, categoryFilter, search]);

  const refresh = () => setVersion(v => v + 1);

  const openChange = (change: ChangeRequest) => {
    setSelected(change);
    setImpactDraft(change.impact || proposeImpact(change.category, change.assetId));
    setDecisionNotes('');
    const firstPending = (change.approvals || []).find(a => a.decision === 'Pending');
    setApproverRole(firstPending?.role || '');
  };

  const saveDraft = () => {
    if (!draft?.title?.trim() || !draft?.assetId) return;
    saveChangeRequest(draft, actor, actorRole);
    setDraft(null);
    refresh();
  };

  const doSubmit = () => {
    if (!selected) return;
    submitChangeRequest(selected.id, impactDraft, actor, actorRole);
    setSelected(null);
    refresh();
  };

  const doApproval = (decision: 'Approved' | 'Rejected') => {
    if (!selected || !approverRole) return;
    recordApproval(selected.id, approverRole, decision, decisionNotes, actor, actorRole);
    setSelected(null);
    refresh();
  };

  const doAdvance = (status: ChangeStatus) => {
    if (!selected) return;
    advanceChangeStatus(selected.id, status, decisionNotes, actor, actorRole);
    setSelected(null);
    refresh();
  };

  // Live preview of the rules engine while the impact assessment is edited.
  const previewScore = selected ? scoreImpact(impactDraft, selected.category) : 0;
  const previewRule = resolveReassessment(previewScore);
  const previewChain = selected ? routeApprovals(previewRule.requirement, selected.assetId) : [];

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">
            Change Request Center
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
            Approval is not permanent. Every significant change to a governed AI asset is
            classified, impact-assessed, routed for reapproval and recorded here before it proceeds.
          </p>
        </div>
        <Button
          onClick={() =>
            setDraft({
              assetId: assets[0]?.id,
              category: 'Model Change',
              requestedBy: actor,
              requestedByRole: actorRole,
              status: 'Draft',
            })
          }
          disabled={isReadOnly}
          title={isReadOnly ? 'Your governance role does not permit raising change requests.' : undefined}
        >
          Raise Change Request
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        <KpiCard
          label="Open Changes"
          value={metrics.openChanges}
          caption={`${metrics.totalChanges} in the register`}
          icon="🔁"
          tone="accent"
        />
        <KpiCard
          label="Pending Reviews"
          value={metrics.pendingReviews}
          caption={`${metrics.awaitingReapproval} awaiting reapproval`}
          icon="⏳"
          tone={metrics.pendingReviews === 0 ? 'success' : 'warning'}
        />
        <KpiCard
          label="Critical Magnitude"
          value={metrics.criticalChanges}
          caption="Executive approval required"
          icon="⚡"
          tone={metrics.criticalChanges === 0 ? 'success' : 'danger'}
        />
        <KpiCard
          label="Avg Decision Time"
          value={`${metrics.averageDecisionDays}d`}
          caption="Submission to decision"
          icon="⏱️"
          tone="info"
        />
      </div>

      {/* WS2 — classification */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          eyebrow="Workstream 2"
          title="Change Classification"
          subtitle="Every change is classified. The category sets the baseline governance weight."
          icon="🏷️"
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

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5">
          {CHANGE_CATEGORIES.map(def => {
            const active = categoryFilter === def.category;
            const count = metrics.byCategory[def.category] || 0;
            return (
              <button
                key={def.category}
                onClick={() => setCategoryFilter(active ? 'all' : def.category)}
                title={def.description}
                data-noglass
                className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                  active
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-light)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-sunken)] hover:border-[var(--accent-border)]'
                }`}
              >
                <span className="text-base" aria-hidden>
                  {def.icon}
                </span>
                <p className="tnum text-xl font-extrabold text-[var(--text-primary)] mt-1.5 leading-none">
                  {count}
                </p>
                <p className="text-[10.5px] font-semibold text-[var(--text-secondary)] mt-1 leading-tight">
                  {def.category.replace(' Change', '')}
                </p>
                <span
                  className="mt-2 block h-1 rounded-full"
                  style={{ background: def.accent, opacity: 0.75 }}
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* Change register */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          eyebrow="Workstream 1"
          title="Change Register"
          subtitle={`${filtered.length} of ${changes.length} change requests shown.`}
          icon="📋"
          action={
            <div className="flex items-center gap-2">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search changes"
                className="px-2.5 py-1.5 rounded-lg text-[12px] bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-focus)]"
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as ChangeStatus | 'all')}
                className="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="all">All statuses</option>
                {STATUSES.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[62rem] text-left">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                {['Change', 'Asset', 'Category', 'Impact', 'Magnitude', 'Reassessment', 'Approvals', 'Status', ''].map(
                  (h, i) => (
                    <th
                      key={h || `c-${i}`}
                      className="pb-2 pr-3 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {filtered.map(change => {
                const def = getCategoryDefinition(change.category);
                const approvals = change.approvals || [];
                const done = approvals.filter(a => a.decision !== 'Pending').length;

                return (
                  <tr
                    key={change.id}
                    className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] transition-colors align-top"
                  >
                    <td className="py-3 pr-3 max-w-[20rem]">
                      <p className="mono text-[10px] text-[var(--accent-primary)]">
                        {change.changeRef}
                      </p>
                      <p className="text-[12.5px] font-semibold text-[var(--text-primary)] mt-0.5">
                        {change.title}
                      </p>
                      <p className="text-[10.5px] text-[var(--text-muted)] mt-1">
                        {change.requestedBy} · {change.requestedDate}
                      </p>
                    </td>

                    <td className="py-3 pr-3 text-[11.5px] text-[var(--text-secondary)] max-w-[11rem]">
                      {change.assetName}
                    </td>

                    <td className="py-3 pr-3 text-[11.5px] whitespace-nowrap">
                      <span style={{ color: def.accent }}>{def.icon}</span>{' '}
                      <span className="text-[var(--text-secondary)]">
                        {change.category.replace(' Change', '')}
                      </span>
                    </td>

                    <td className="py-3 pr-3 text-center">
                      {typeof change.impactScore === 'number' ? (
                        <span className="tnum text-[12px] font-extrabold text-[var(--text-primary)]">
                          {change.impactScore}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[var(--text-muted)]">—</span>
                      )}
                    </td>

                    <td className="py-3 pr-3">
                      {change.magnitude ? (
                        <Pill label={change.magnitude} tone={MAGNITUDE_TONE[change.magnitude]} />
                      ) : (
                        <span className="text-[11px] text-[var(--text-muted)]">Unassessed</span>
                      )}
                    </td>

                    <td className="py-3 pr-3">
                      {change.reassessment ? (
                        <Pill
                          label={change.reassessment.replace(' Required', '')}
                          tone={REASSESSMENT_TONE[change.reassessment]}
                          title={change.reassessment}
                        />
                      ) : (
                        <span className="text-[11px] text-[var(--text-muted)]">—</span>
                      )}
                    </td>

                    <td className="py-3 pr-3">
                      {approvals.length > 0 ? (
                        <span className="flex items-center gap-1.5">
                          <span className="tnum text-[11px] font-bold text-[var(--text-primary)]">
                            {done}/{approvals.length}
                          </span>
                          <span className="flex gap-0.5">
                            {approvals.map(a => (
                              <span
                                key={a.role}
                                title={`${a.role}: ${a.decision}`}
                                className="w-1.5 h-4 rounded-sm"
                                style={{ background: DECISION_TONE[a.decision] }}
                              />
                            ))}
                          </span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-[var(--text-muted)]">Not routed</span>
                      )}
                    </td>

                    <td className="py-3 pr-3">
                      <Pill label={change.status} tone={CHANGE_STATUS_TONE[change.status]} />
                    </td>

                    <td className="py-3">
                      <button
                        onClick={() => openChange(change)}
                        className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer whitespace-nowrap"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <p className="py-10 text-center text-[13px] text-[var(--text-muted)]">
              No change requests match the current filters.
            </p>
          )}
        </div>
      </section>

      {/* ================= Raise change ================= */}
      {draft && (
        <Modal
          isOpen
          onClose={() => setDraft(null)}
          maxWidth="2xl"
          title="Raise Change Request"
          subtitle="Describe the change and why the business needs it. Impact is assessed at submission."
        >
          <div className="flex flex-col gap-3.5">
            <Field label="Title">
              <input
                value={draft.title || ''}
                onChange={e => setDraft({ ...draft, title: e.target.value })}
                placeholder="Upgrade fraud detection model to v3.0"
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="AI Asset">
                <select
                  value={draft.assetId || ''}
                  onChange={e => setDraft({ ...draft, assetId: e.target.value })}
                  className={inputClass}
                >
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Change Category">
                <select
                  value={draft.category}
                  onChange={e =>
                    setDraft({ ...draft, category: e.target.value as ChangeCategory })
                  }
                  className={inputClass}
                >
                  {CHANGE_CATEGORIES.map(def => (
                    <option key={def.category} value={def.category}>
                      {def.icon} {def.category}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {draft.category && (
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed px-3 py-2 rounded-lg bg-[var(--bg-sunken)] border border-[var(--border-subtle)]">
                {getCategoryDefinition(draft.category).description} Typical examples:{' '}
                {getCategoryDefinition(draft.category).examples.join(', ')}.
              </p>
            )}

            <Field label="Description">
              <textarea
                value={draft.description || ''}
                onChange={e => setDraft({ ...draft, description: e.target.value })}
                rows={3}
                placeholder="What exactly is changing?"
                className={inputClass}
              />
            </Field>

            <Field label="Business Justification">
              <textarea
                value={draft.businessJustification || ''}
                onChange={e => setDraft({ ...draft, businessJustification: e.target.value })}
                rows={3}
                placeholder="Why the enterprise needs this change."
                className={inputClass}
              />
            </Field>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={() => setDraft(null)}>
                Cancel
              </Button>
              <Button
                onClick={saveDraft}
                disabled={isReadOnly || !draft.title?.trim() || !draft.assetId}
                title={isReadOnly ? 'Your governance role does not permit raising change requests.' : undefined}
              >
                Save Draft
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================= Change workspace ================= */}
      {selected && (
        <Modal
          isOpen
          onClose={() => setSelected(null)}
          maxWidth="2xl"
          title={`${selected.changeRef} — ${selected.title}`}
          subtitle={`${selected.category} · ${selected.assetName} · raised by ${selected.requestedBy}`}
        >
          <div className="flex flex-col gap-5">
            {/* Summary */}
            <div
              className="rounded-xl border border-[var(--border-subtle)] px-3.5 py-3"
              style={{ background: 'var(--bg-sunken)' }}
            >
              <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                {selected.description}
              </p>
              <p className="text-[11.5px] text-[var(--text-muted)] mt-2 leading-relaxed">
                <strong className="text-[var(--text-secondary)]">Justification:</strong>{' '}
                {selected.businessJustification}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Pill label={selected.status} tone={CHANGE_STATUS_TONE[selected.status]} />
                {selected.magnitude && (
                  <Pill label={selected.magnitude} tone={MAGNITUDE_TONE[selected.magnitude]} />
                )}
                {selected.reassessment && (
                  <Pill
                    label={selected.reassessment}
                    tone={REASSESSMENT_TONE[selected.reassessment]}
                  />
                )}
              </div>
            </div>

            {/* WS3 — impact assessment */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--accent-primary)]">
                    Workstream 3
                  </p>
                  <h4 className="text-[14px] font-bold text-[var(--text-primary)]">
                    Change Impact Analysis
                  </h4>
                </div>
                {selected.status === 'Draft' && (
                  <button
                    onClick={() => setImpactDraft(proposeImpact(selected.category, selected.assetId))}
                    className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
                  >
                    Re-propose from category
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                {IMPACT_AREAS.map(area => (
                  <div key={area} className="flex items-center gap-3">
                    <span className="text-[11.5px] font-semibold text-[var(--text-secondary)] w-[6.5rem] shrink-0">
                      {area}
                    </span>
                    <div className="flex-1 grid grid-cols-5 gap-1">
                      {IMPACT_OUTCOMES.map(outcome => {
                        const active = impactDraft[area] === outcome;
                        const editable = selected.status === 'Draft';
                        return (
                          <button
                            key={outcome}
                            disabled={!editable}
                            onClick={() => setImpactDraft({ ...impactDraft, [area]: outcome })}
                            title={outcome}
                            data-noglass
                            className={`h-7 rounded-md border text-[9px] font-extrabold transition-all ${
                              editable ? 'cursor-pointer' : 'cursor-default'
                            }`}
                            style={{
                              color: active ? '#fff' : IMPACT_TONE[outcome],
                              background: active
                                ? IMPACT_TONE[outcome]
                                : `color-mix(in srgb, ${IMPACT_TONE[outcome]} 10%, transparent)`,
                              borderColor: `color-mix(in srgb, ${IMPACT_TONE[outcome]} 40%, transparent)`,
                            }}
                          >
                            {outcome === 'No Impact' ? 'NONE' : outcome.replace(' Impact', '').toUpperCase()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WS4 — rules engine verdict */}
            <div
              className="rounded-xl border px-3.5 py-3"
              style={{
                background: `color-mix(in srgb, ${REASSESSMENT_TONE[previewRule.requirement]} 8%, transparent)`,
                borderColor: `color-mix(in srgb, ${REASSESSMENT_TONE[previewRule.requirement]} 35%, transparent)`,
              }}
            >
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Workstream 4 · Reassessment Rules Engine
              </p>
              <p className="text-[14px] font-bold mt-1.5" style={{ color: REASSESSMENT_TONE[previewRule.requirement] }}>
                {previewRule.magnitude} change → {previewRule.requirement}
              </p>
              <p className="text-[11.5px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                {previewRule.description}
              </p>
              <p className="tnum text-[11px] text-[var(--text-muted)] mt-1.5">
                Weighted impact score: {previewScore}/100
              </p>
            </div>

            {/* WS5 — approval routing */}
            <div className="flex flex-col gap-2.5">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--accent-primary)]">
                  Workstream 5
                </p>
                <h4 className="text-[14px] font-bold text-[var(--text-primary)]">
                  Approval Routing
                </h4>
              </div>

              <div className="flex flex-col gap-1.5">
                {(selected.approvals || previewChain).map(approval => (
                  <div
                    key={approval.role}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg border border-[var(--border-subtle)]"
                  >
                    <span
                      className="w-1.5 h-7 rounded-full shrink-0"
                      style={{ background: DECISION_TONE[approval.decision] }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-bold text-[var(--text-primary)]">
                        {approval.role}
                      </span>
                      <span className="block text-[10.5px] text-[var(--text-muted)] truncate">
                        {approval.approver}
                        {approval.notes ? ` — ${approval.notes}` : ''}
                      </span>
                    </span>
                    <Pill label={approval.decision} tone={DECISION_TONE[approval.decision]} />
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-1 border-t border-[var(--border-subtle)]">
              {selected.status === 'Draft' && (
                <>
                  <p className="text-[11.5px] text-[var(--text-muted)] leading-relaxed">
                    Submitting locks the impact assessment, classifies the change and routes it to
                    the approvers the rules engine selected.
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="secondary" onClick={() => setSelected(null)}>
                      Close
                    </Button>
                    <Button
                      onClick={doSubmit}
                      disabled={isReadOnly}
                      title={isReadOnly ? 'Your governance role does not permit submitting change requests for governance.' : undefined}
                    >
                      Submit For Governance
                    </Button>
                  </div>
                </>
              )}

              {selected.status === 'Submitted' && (
                <div className="flex items-center justify-end gap-2">
                  <Button variant="secondary" onClick={() => setSelected(null)}>
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      beginReview(selected.id, actor, actorRole);
                      setSelected(null);
                      refresh();
                    }}
                    disabled={isReadOnly}
                    title={isReadOnly ? 'Your governance role does not permit opening a governance review.' : undefined}
                  >
                    Open Governance Review
                  </Button>
                </div>
              )}

              {(selected.status === 'Under Review' || selected.status === 'Submitted') && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Acting As">
                      <select
                        value={approverRole}
                        onChange={e => setApproverRole(e.target.value as ApproverRole)}
                        className={inputClass}
                      >
                        <option value="">Select approver role…</option>
                        {(selected.approvals || [])
                          .filter(a => a.decision === 'Pending')
                          .map(a => (
                            <option key={a.role} value={a.role}>
                              {a.role} ({a.approver})
                            </option>
                          ))}
                      </select>
                    </Field>
                    <Field label="Decision Rationale">
                      <input
                        value={decisionNotes}
                        onChange={e => setDecisionNotes(e.target.value)}
                        placeholder="Basis for the decision"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button variant="secondary" onClick={() => setSelected(null)}>
                      Close
                    </Button>
                    <Button
                      variant="danger"
                      disabled={isReadOnly || !approverRole}
                      title={isReadOnly ? 'Your governance role does not permit deciding on change requests.' : undefined}
                      onClick={() => doApproval('Rejected')}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="success"
                      disabled={isReadOnly || !approverRole}
                      title={isReadOnly ? 'Your governance role does not permit deciding on change requests.' : undefined}
                      onClick={() => doApproval('Approved')}
                    >
                      Approve
                    </Button>
                  </div>
                </>
              )}

              {selected.status === 'Approved' && (
                <>
                  <Field label="Implementation Note">
                    <input
                      value={decisionNotes}
                      onChange={e => setDecisionNotes(e.target.value)}
                      placeholder="How and when the change was deployed"
                      className={inputClass}
                    />
                  </Field>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="secondary" onClick={() => setSelected(null)}>
                      Close
                    </Button>
                    <Button
                      onClick={() => doAdvance('Implemented')}
                      disabled={isReadOnly}
                      title={isReadOnly ? 'Your governance role does not permit marking a change implemented.' : undefined}
                    >
                      Mark Implemented
                    </Button>
                  </div>
                </>
              )}

              {selected.status === 'Implemented' && (
                <>
                  <Field label="Closure Note">
                    <input
                      value={decisionNotes}
                      onChange={e => setDecisionNotes(e.target.value)}
                      placeholder="Post-implementation verification"
                      className={inputClass}
                    />
                  </Field>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="secondary" onClick={() => setSelected(null)}>
                      Close
                    </Button>
                    <Button
                      onClick={() => doAdvance('Closed')}
                      disabled={isReadOnly}
                      title={isReadOnly ? 'Your governance role does not permit closing a change.' : undefined}
                    >
                      Close Change
                    </Button>
                  </div>
                </>
              )}

              {(selected.status === 'Rejected' || selected.status === 'Closed') && (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11.5px] text-[var(--text-muted)] leading-relaxed">
                    {selected.decisionRationale || 'This change is closed to further action.'}
                  </p>
                  <Button variant="secondary" onClick={() => setSelected(null)}>
                    Close
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
