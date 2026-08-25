import React, { useMemo, useState } from 'react';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { ProgressMeter } from '../components/ui/ProgressMeter';
import { useAuth } from '../contexts/AuthContext';
import { getAssets } from '../services/storageService';
import {
  getPolicies,
  getPolicyViolations,
  savePolicyViolation,
  setViolationStatus,
} from '../services/policyService';
import type {
  PolicyViolation,
  PolicyViolationSeverity,
  PolicyViolationStatus,
} from '../types';

const STATUSES: PolicyViolationStatus[] = [
  'Open',
  'Under Review',
  'Accepted',
  'Remediated',
  'Closed',
];

const STATUS_TONE: Record<PolicyViolationStatus, string> = {
  Open: 'var(--status-danger)',
  'Under Review': 'var(--status-warning)',
  Accepted: 'var(--status-info)',
  Remediated: 'var(--status-success)',
  Closed: 'var(--status-neutral)',
};

const SEVERITY_TONE: Record<PolicyViolationSeverity, string> = {
  Critical: 'var(--risk-critical)',
  High: 'var(--risk-high)',
  Medium: 'var(--risk-medium)',
  Low: 'var(--risk-low)',
};

/** Phase 9 WS5 — Policy Violation Management. */
export const PolicyViolationsPage: React.FC = () => {
  // Q1 Stabilization — Phase 2: PolicyViolation has no matching ActionKey in
  // roleActionMatrix.ts (distinct from GovernancePolicyViolation), so writes here fall
  // back to the safe !isReadOnly minimum.
  const { currentUser, isReadOnly } = useAuth();
  const [version, setVersion] = useState(0);
  const [statusFilter, setStatusFilter] = useState<PolicyViolationStatus | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<PolicyViolationSeverity | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PolicyViolation | null>(null);
  const [draft, setDraft] = useState<Partial<PolicyViolation> | null>(null);
  const [transitionStatus, setTransitionStatus] = useState<PolicyViolationStatus>('Under Review');
  const [transitionNotes, setTransitionNotes] = useState('');

  const violations = useMemo(
    () => getPolicyViolations(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version forces a re-read after a mutation
    [version]
  );
  const policies = useMemo(
    () => getPolicies(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version forces a re-read after a mutation
    [version]
  );
  const assets = useMemo(() => getAssets(), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return violations.filter(v => {
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;
      if (severityFilter !== 'all' && v.severity !== severityFilter) return false;
      if (
        q &&
        !v.assetName.toLowerCase().includes(q) &&
        !v.policyName.toLowerCase().includes(q) &&
        !v.violationType.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [violations, statusFilter, severityFilter, search]);

  const open = violations.filter(v => v.status === 'Open').length;
  const underReview = violations.filter(v => v.status === 'Under Review').length;
  const accepted = violations.filter(v => v.status === 'Accepted').length;
  const remediated = violations.filter(v => v.status === 'Remediated').length;
  const closed = violations.filter(v => v.status === 'Closed').length;
  const critical = violations.filter(
    v => v.severity === 'Critical' && (v.status === 'Open' || v.status === 'Under Review')
  ).length;
  const autoDetected = violations.filter(v => v.autoDetected).length;

  const openSelected = (violation: PolicyViolation) => {
    setSelected(violation);
    setTransitionStatus(violation.status === 'Open' ? 'Under Review' : violation.status);
    setTransitionNotes(violation.remediationNotes || '');
  };

  const applyTransition = () => {
    if (!selected) return;
    setViolationStatus(
      selected,
      transitionStatus,
      transitionNotes,
      currentUser?.name || 'Governance Admin'
    );
    setSelected(null);
    setVersion(v => v + 1);
  };

  const saveDraft = () => {
    if (!draft?.policyId || !draft?.assetId || !draft?.violationType?.trim()) return;
    savePolicyViolation(draft, currentUser?.name || 'Governance Admin');
    setDraft(null);
    setVersion(v => v + 1);
  };

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Policy Violations</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
            Breaches of enterprise AI policy, from detection through to closure. Violations marked{' '}
            <strong className="text-[var(--text-primary)]">Detected</strong> are evaluated
            continuously against live governance state — they clear when the underlying gap is fixed.
          </p>
        </div>
        <Button
          onClick={() =>
            setDraft({
              policyId: policies[0]?.id,
              assetId: assets[0]?.id,
              severity: 'Medium',
              status: 'Open',
            })
          }
          disabled={isReadOnly}
          title={isReadOnly ? 'Your governance role does not permit logging policy violations.' : undefined}
        >
          Log Violation
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        <KpiCard
          label="Open Violations"
          value={open}
          caption={`${underReview} additionally under review`}
          icon="🚨"
          tone={open === 0 ? 'success' : 'danger'}
        />
        <KpiCard
          label="Critical Severity"
          value={critical}
          caption="Open or under review"
          icon="⚡"
          tone={critical === 0 ? 'success' : 'danger'}
        />
        <KpiCard
          label="Auto-Detected"
          value={autoDetected}
          caption="Evaluated from live governance state"
          icon="🛰️"
          tone="info"
        />
        <KpiCard
          label="Resolved"
          value={remediated + closed}
          caption={`${remediated} remediated · ${closed} closed`}
          icon="✅"
          tone="success"
        />
      </div>

      {/* Lifecycle distribution */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          title="Violation Lifecycle"
          subtitle="Where breaches sit between detection and closure."
          icon="🔄"
          action={
            statusFilter !== 'all' || severityFilter !== 'all' ? (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setSeverityFilter('all');
                }}
                className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            ) : undefined
          }
        />

        <ProgressMeter
          height={16}
          segments={[
            { label: 'Open', value: open, color: STATUS_TONE.Open },
            { label: 'Under Review', value: underReview, color: STATUS_TONE['Under Review'] },
            { label: 'Accepted', value: accepted, color: STATUS_TONE.Accepted },
            { label: 'Remediated', value: remediated, color: STATUS_TONE.Remediated },
            { label: 'Closed', value: closed, color: STATUS_TONE.Closed },
          ]}
        />

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {STATUSES.map(status => {
            const count = violations.filter(v => v.status === status).length;
            const active = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(active ? 'all' : status)}
                data-noglass
                className={`rounded-xl border px-3 py-2.5 text-left transition-all cursor-pointer ${
                  active
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-light)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-sunken)] hover:border-[var(--accent-border)]'
                }`}
              >
                <span
                  className="tnum block text-lg font-extrabold leading-none"
                  style={{ color: STATUS_TONE[status] }}
                >
                  {count}
                </span>
                <span className="block text-[10.5px] font-semibold text-[var(--text-secondary)] mt-1">
                  {status}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Violation register */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          title="Violation Register"
          subtitle={`${filtered.length} of ${violations.length} violations shown.`}
          icon="📋"
          action={
            <div className="flex items-center gap-2">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search violations"
                className="px-2.5 py-1.5 rounded-lg text-[12px] bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-focus)]"
              />
              <select
                value={severityFilter}
                onChange={e =>
                  setSeverityFilter(e.target.value as PolicyViolationSeverity | 'all')
                }
                className="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="all">All severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                {['Violation', 'Policy', 'Asset', 'Owner', 'Detected', 'Severity', 'Status', ''].map(
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
              {filtered.map(violation => (
                <tr
                  key={violation.id}
                  className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] transition-colors align-top"
                >
                  <td className="py-3 pr-3 max-w-[20rem]">
                    <p className="text-[12.5px] font-semibold text-[var(--text-primary)]">
                      {violation.violationType}
                    </p>
                    <p className="text-[10.5px] text-[var(--text-muted)] mt-1 leading-snug line-clamp-2">
                      {violation.description}
                    </p>
                    {violation.autoDetected && (
                      <span
                        data-noglass
                        className="inline-block mt-1.5 text-[8.5px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded border border-[var(--status-info-border)] text-[var(--status-info)] bg-[var(--status-info-bg)]"
                      >
                        Detected
                      </span>
                    )}
                  </td>

                  <td className="py-3 pr-3 text-[11.5px] text-[var(--text-secondary)] max-w-[12rem]">
                    {violation.policyName}
                  </td>

                  <td className="py-3 pr-3 text-[11.5px] font-semibold text-[var(--text-primary)] max-w-[12rem]">
                    {violation.assetName}
                  </td>

                  <td className="py-3 pr-3 text-[11.5px] text-[var(--text-secondary)] whitespace-nowrap">
                    {violation.owner}
                  </td>

                  <td className="py-3 pr-3 tnum text-[11px] text-[var(--text-muted)] whitespace-nowrap">
                    {violation.detectionDate}
                  </td>

                  <td className="py-3 pr-3">
                    <span
                      data-noglass
                      className="text-[9.5px] font-extrabold uppercase px-2 py-1 rounded-md border whitespace-nowrap"
                      style={{
                        color: SEVERITY_TONE[violation.severity],
                        borderColor: `color-mix(in srgb, ${SEVERITY_TONE[violation.severity]} 45%, transparent)`,
                        background: `color-mix(in srgb, ${SEVERITY_TONE[violation.severity]} 12%, transparent)`,
                      }}
                    >
                      {violation.severity}
                    </span>
                  </td>

                  <td className="py-3 pr-3">
                    <span
                      data-noglass
                      className="text-[9.5px] font-extrabold uppercase px-2 py-1 rounded-md border whitespace-nowrap"
                      style={{
                        color: STATUS_TONE[violation.status],
                        borderColor: `color-mix(in srgb, ${STATUS_TONE[violation.status]} 45%, transparent)`,
                        background: `color-mix(in srgb, ${STATUS_TONE[violation.status]} 12%, transparent)`,
                      }}
                    >
                      {violation.status}
                    </span>
                  </td>

                  <td className="py-3">
                    <button
                      onClick={() => openSelected(violation)}
                      className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer whitespace-nowrap"
                    >
                      {isReadOnly ? 'View' : 'Disposition'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <p className="py-10 text-center text-[13px] text-[var(--text-muted)]">
              No violations match the current filters.
            </p>
          )}
        </div>
      </section>

      {/* Disposition modal */}
      {selected && (
        <Modal
          isOpen
          onClose={() => setSelected(null)}
          maxWidth="xl"
          title="Violation Disposition"
          subtitle={`${selected.policyName} · ${selected.assetName}`}
        >
          <div className="flex flex-col gap-4">
            <div
              className="rounded-xl border border-[var(--border-subtle)] px-3.5 py-3"
              style={{ background: 'var(--bg-sunken)' }}
            >
              <p className="text-[12.5px] font-bold text-[var(--text-primary)]">
                {selected.violationType}
              </p>
              <p className="text-[11.5px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                {selected.description}
              </p>
              <p className="text-[10.5px] text-[var(--text-muted)] mt-2">
                Detected {selected.detectionDate} · Owner {selected.owner} · Severity{' '}
                {selected.severity}
                {selected.autoDetected && ' · Auto-detected from governance state'}
              </p>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-[var(--text-muted)]">
                Disposition
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {STATUSES.map(status => {
                  const active = transitionStatus === status;
                  return (
                    <button
                      key={status}
                      onClick={() => setTransitionStatus(status)}
                      data-noglass
                      className={`px-2 py-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        active
                          ? 'text-white border-transparent'
                          : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-border)]'
                      }`}
                      style={active ? { background: STATUS_TONE[status] } : undefined}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-[var(--text-muted)]">
                Remediation / Acceptance Rationale
              </span>
              <textarea
                value={transitionNotes}
                onChange={e => setTransitionNotes(e.target.value)}
                rows={4}
                placeholder="What was done, by whom, and how closure was verified."
                className={inputClass}
              />
            </label>

            {selected.autoDetected && (
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed px-3 py-2 rounded-lg bg-[var(--bg-sunken)] border border-[var(--border-subtle)]">
                Recording a disposition converts this detection into a tracked violation record.
                The underlying governance gap still needs to be corrected — otherwise the engine
                will continue to report it.
              </p>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Cancel
              </Button>
              <Button
                onClick={applyTransition}
                disabled={isReadOnly}
                title={isReadOnly ? 'Your governance role does not permit changing violation disposition.' : undefined}
              >
                Record Disposition
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Log violation modal */}
      {draft && (
        <Modal
          isOpen
          onClose={() => setDraft(null)}
          maxWidth="xl"
          title="Log Policy Violation"
          subtitle="Record a breach identified outside the automated enforcement rules."
        >
          <div className="flex flex-col gap-3.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-[var(--text-muted)]">
                Policy Breached
              </span>
              <select
                value={draft.policyId || ''}
                onChange={e => setDraft({ ...draft, policyId: e.target.value })}
                className={inputClass}
              >
                {policies.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.policyRef} — {p.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-[var(--text-muted)]">
                AI Asset
              </span>
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
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-[var(--text-muted)]">
                Violation Type
              </span>
              <input
                value={draft.violationType || ''}
                onChange={e => setDraft({ ...draft, violationType: e.target.value })}
                placeholder="Unapproved Model Version In Production"
                className={inputClass}
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-[var(--text-muted)]">
                  Severity
                </span>
                <select
                  value={draft.severity}
                  onChange={e =>
                    setDraft({ ...draft, severity: e.target.value as PolicyViolationSeverity })
                  }
                  className={inputClass}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-[var(--text-muted)]">
                  Accountable Owner
                </span>
                <input
                  value={draft.owner || ''}
                  onChange={e => setDraft({ ...draft, owner: e.target.value })}
                  placeholder={currentUser?.name || 'Owner name'}
                  className={inputClass}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-[var(--text-muted)]">
                Description
              </span>
              <textarea
                value={draft.description || ''}
                onChange={e => setDraft({ ...draft, description: e.target.value })}
                rows={3}
                placeholder="What was breached, and how it was identified."
                className={inputClass}
              />
            </label>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={() => setDraft(null)}>
                Cancel
              </Button>
              <Button
                onClick={saveDraft}
                disabled={!draft.policyId || !draft.assetId || !draft.violationType?.trim()}
              >
                Log Violation
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
