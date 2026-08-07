import React, { useMemo, useState } from 'react';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { CHANGE_STATUS_TONE, Pill } from '../components/governance/ChangeStatusPill';
import { getAssets } from '../services/storageService';
import {
  GOVERNANCE_LIFECYCLE,
  getChangeHistory,
  getChangeRequests,
  getCurrentGovernanceState,
  getStateTransitions,
} from '../services/changeManagementService';
import type { ChangeHistoryEntry, GovernanceState } from '../types/changeManagement';

const STATE_TONE: Record<GovernanceState, string> = {
  Draft: 'var(--status-neutral)',
  Review: 'var(--stage-2)',
  Approved: 'var(--stage-3)',
  Production: 'var(--status-success)',
  Monitoring: 'var(--stage-8)',
  'Change Requested': 'var(--status-warning)',
  'Impact Assessment': 'var(--stage-5)',
  Reassessment: 'var(--risk-high)',
  Reapproved: 'var(--status-success)',
  Retirement: 'var(--text-muted)',
};

/**
 * Phase 10 WS7 + WS8 — Governance State Machine and Change History.
 * Every asset state transition, and an immutable record of what changed,
 * who changed it, when, why and who approved it.
 */
export const ChangeHistoryPage: React.FC = () => {
  const [assetFilter, setAssetFilter] = useState<string>('all');
  const [view, setView] = useState<'history' | 'transitions'>('history');

  const assets = useMemo(() => getAssets(), []);
  const changes = useMemo(() => getChangeRequests(), []);
  const transitions = useMemo(() => getStateTransitions(), []);

  /**
   * The stored history log holds entries generated in this browser. Seeded
   * changes carry their own narrative, so the two are merged into one
   * chronological record rather than showing an empty log on first visit.
   */
  const history = useMemo(() => {
    const logged = getChangeHistory();

    const derived = changes.flatMap(change => {
      const entries: ChangeHistoryEntry[] = [
        {
          id: `derived-raise-${change.id}`,
          changeId: change.id,
          changeRef: change.changeRef,
          assetId: change.assetId,
          assetName: change.assetName,
          action: `Change request raised (${change.category})`,
          actor: change.requestedBy,
          actorRole: change.requestedByRole,
          timestamp: change.requestedDate,
          rationale: change.businessJustification,
          toStatus: 'Draft',
        },
      ];

      if (change.submittedDate) {
        entries.push({
          id: `derived-submit-${change.id}`,
          changeId: change.id,
          changeRef: change.changeRef,
          assetId: change.assetId,
          assetName: change.assetName,
          action: `Submitted — classified ${change.magnitude}, impact ${change.impactScore}/100`,
          actor: change.requestedBy,
          actorRole: change.requestedByRole,
          timestamp: change.submittedDate,
          rationale: change.reassessment || 'Routed for governance evaluation',
          toStatus: 'Submitted',
        });
      }

      (change.approvals || [])
        .filter(a => a.decision !== 'Pending' && a.decidedAt)
        .forEach(approval => {
          entries.push({
            id: `derived-appr-${change.id}-${approval.role}`,
            changeId: change.id,
            changeRef: change.changeRef,
            assetId: change.assetId,
            assetName: change.assetName,
            action: `${approval.role} ${approval.decision.toLowerCase()} the change`,
            actor: approval.approver,
            actorRole: approval.role,
            timestamp: approval.decidedAt as string,
            rationale: approval.notes || 'No rationale recorded',
            toStatus: approval.decision === 'Approved' ? 'Approved' : 'Rejected',
          });
        });

      if (change.implementedDate) {
        entries.push({
          id: `derived-impl-${change.id}`,
          changeId: change.id,
          changeRef: change.changeRef,
          assetId: change.assetId,
          assetName: change.assetName,
          action: 'Change implemented',
          actor: change.requestedBy,
          actorRole: change.requestedByRole,
          timestamp: change.implementedDate,
          rationale: change.decisionRationale || 'Deployed to production',
          toStatus: 'Implemented',
        });
      }

      if (change.closedDate) {
        entries.push({
          id: `derived-close-${change.id}`,
          changeId: change.id,
          changeRef: change.changeRef,
          assetId: change.assetId,
          assetName: change.assetName,
          action: 'Change closed',
          actor: change.requestedBy,
          actorRole: change.requestedByRole,
          timestamp: change.closedDate,
          rationale: 'Post-implementation verification complete',
          toStatus: 'Closed',
        });
      }

      return entries;
    });

    const loggedIds = new Set(logged.map(l => `${l.changeId}-${l.action}`));
    const merged = [
      ...logged,
      ...derived.filter(d => !loggedIds.has(`${d.changeId}-${d.action}`)),
    ];

    return merged.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [changes]);

  const filteredHistory = useMemo(
    () => (assetFilter === 'all' ? history : history.filter(h => h.assetId === assetFilter)),
    [history, assetFilter]
  );

  const filteredTransitions = useMemo(
    () =>
      assetFilter === 'all' ? transitions : transitions.filter(t => t.assetId === assetFilter),
    [transitions, assetFilter]
  );

  const assetsInChange = new Set(
    changes
      .filter(c => c.status === 'Submitted' || c.status === 'Under Review')
      .map(c => c.assetId)
  );

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">
            Change History &amp; State Machine
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
            What changed, who changed it, when, why, and who approved it — plus every governance
            state transition an asset has passed through.
          </p>
        </div>

        <select
          value={assetFilter}
          onChange={e => setAssetFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
        >
          <option value="all">All AI assets</option>
          {assets.map(a => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        <KpiCard
          label="History Entries"
          value={filteredHistory.length}
          caption="Immutable change record"
          icon="📜"
          tone="accent"
        />
        <KpiCard
          label="State Transitions"
          value={filteredTransitions.length}
          caption="Recorded lifecycle movements"
          icon="🔀"
          tone="info"
        />
        <KpiCard
          label="Assets In Change"
          value={assetsInChange.size}
          caption="Currently outside a steady state"
          icon="🔁"
          tone={assetsInChange.size === 0 ? 'success' : 'warning'}
        />
        <KpiCard
          label="Lifecycle Stages"
          value={GOVERNANCE_LIFECYCLE.length}
          caption="Phase 10 enhanced lifecycle"
          icon="🛤️"
          tone="neutral"
        />
      </div>

      {/* WS7 — the enhanced lifecycle */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          eyebrow="Workstream 7"
          title="Governance State Machine"
          subtitle="The Phase 10 lifecycle. A change drives an asset out of monitoring and back through reassessment to reapproval."
          icon="🔀"
        />

        <div className="flex flex-wrap items-center gap-1.5">
          {GOVERNANCE_LIFECYCLE.map((state, i) => (
            <React.Fragment key={state}>
              <span
                data-noglass
                className="text-[10.5px] font-extrabold uppercase px-2.5 py-1.5 rounded-lg border whitespace-nowrap"
                style={{
                  color: STATE_TONE[state],
                  borderColor: `color-mix(in srgb, ${STATE_TONE[state]} 40%, transparent)`,
                  background: `color-mix(in srgb, ${STATE_TONE[state]} 10%, transparent)`,
                }}
              >
                {state}
              </span>
              {i < GOVERNANCE_LIFECYCLE.length - 1 && (
                <span className="text-[var(--text-muted)] text-[10px]" aria-hidden>
                  →
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Current state per asset */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 pt-1">
          {assets
            .filter(a => assetFilter === 'all' || a.id === assetFilter)
            .map(asset => {
              const state = getCurrentGovernanceState(asset.id);
              return (
                <div
                  key={asset.id}
                  data-noglass
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)] px-3.5 py-3 flex items-center justify-between gap-3"
                >
                  <span className="min-w-0">
                    <span className="block text-[12px] font-semibold text-[var(--text-primary)] truncate">
                      {asset.name}
                    </span>
                    <span className="block text-[10.5px] text-[var(--text-muted)]">
                      {asset.type}
                    </span>
                  </span>
                  <Pill label={state} tone={STATE_TONE[state]} />
                </div>
              );
            })}
        </div>
      </section>

      {/* View switcher */}
      <div className="flex gap-2" role="group" aria-label="Record view">
        {(
          [
            { id: 'history' as const, label: 'Change History', icon: '📜' },
            { id: 'transitions' as const, label: 'State Transitions', icon: '🔀' },
          ]
        ).map(option => {
          const active = view === option.id;
          return (
            <button
              key={option.id}
              onClick={() => setView(option.id)}
              aria-pressed={active}
              data-noglass
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-bold border transition-all cursor-pointer ${
                active
                  ? 'text-white border-transparent shadow-md'
                  : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-border)]'
              }`}
              style={active ? { background: 'var(--grad-brand)' } : undefined}
            >
              <span aria-hidden>{option.icon}</span>
              {option.label}
            </button>
          );
        })}
      </div>

      {/* WS8 — change history */}
      {view === 'history' && (
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
          <SectionHeader
            eyebrow="Workstream 8"
            title="Change History &amp; Audit Trail"
            subtitle="Immutable. Entries are appended, never edited or removed."
            icon="📜"
          />

          <ol className="flex flex-col">
            {filteredHistory.map((entry, i) => (
              <li key={entry.id} className="flex gap-3.5">
                {/* Timeline rail */}
                <div className="flex flex-col items-center shrink-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full mt-1.5"
                    style={{
                      background: entry.toStatus
                        ? CHANGE_STATUS_TONE[entry.toStatus]
                        : 'var(--accent-primary)',
                    }}
                  />
                  {i < filteredHistory.length - 1 && (
                    <span className="w-px flex-1 bg-[var(--border-color)] my-1" />
                  )}
                </div>

                <div className="flex-1 min-w-0 pb-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="mono text-[10px] text-[var(--accent-primary)]">
                      {entry.changeRef}
                    </span>
                    <span className="tnum text-[10px] text-[var(--text-muted)]">
                      {entry.timestamp}
                    </span>
                    {entry.toStatus && (
                      <Pill label={entry.toStatus} tone={CHANGE_STATUS_TONE[entry.toStatus]} />
                    )}
                  </div>

                  <p className="text-[12.5px] font-semibold text-[var(--text-primary)] mt-1">
                    {entry.action}
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                    {entry.rationale}
                  </p>
                  <p className="text-[10.5px] text-[var(--text-muted)] mt-1">
                    {entry.actor} ({entry.actorRole}) · {entry.assetName}
                    {entry.approvedBy ? ` · approved by ${entry.approvedBy}` : ''}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {filteredHistory.length === 0 && (
            <p className="py-10 text-center text-[13px] text-[var(--text-muted)]">
              No change history recorded for this asset.
            </p>
          )}
        </section>
      )}

      {/* WS7 — transitions */}
      {view === 'transitions' && (
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
          <SectionHeader
            eyebrow="Workstream 7"
            title="State Transition Log"
            subtitle="Every governance state movement, with the change that caused it."
            icon="🔀"
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-left">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  {['Asset', 'From', '', 'To', 'Change', 'Actor', 'When'].map((h, i) => (
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
                {filteredTransitions.map(transition => (
                  <tr
                    key={transition.id}
                    className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] transition-colors align-top"
                  >
                    <td className="py-3 pr-3 max-w-[14rem]">
                      <p className="text-[12px] font-semibold text-[var(--text-primary)] truncate">
                        {transition.assetName}
                      </p>
                      <p className="text-[10.5px] text-[var(--text-muted)] mt-0.5 leading-snug">
                        {transition.reason}
                      </p>
                    </td>
                    <td className="py-3 pr-3">
                      <Pill label={transition.fromState} tone={STATE_TONE[transition.fromState]} />
                    </td>
                    <td className="py-3 pr-1 text-[var(--text-muted)] text-[11px]">→</td>
                    <td className="py-3 pr-3">
                      <Pill label={transition.toState} tone={STATE_TONE[transition.toState]} />
                    </td>
                    <td className="py-3 pr-3 mono text-[10px] text-[var(--accent-primary)] whitespace-nowrap">
                      {transition.changeRef || '—'}
                    </td>
                    <td className="py-3 pr-3 text-[11.5px] text-[var(--text-secondary)] whitespace-nowrap">
                      {transition.actor}
                    </td>
                    <td className="py-3 tnum text-[10.5px] text-[var(--text-muted)] whitespace-nowrap">
                      {transition.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTransitions.length === 0 && (
              <p className="py-10 text-center text-[13px] text-[var(--text-muted)]">
                No state transitions recorded for this asset.
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
