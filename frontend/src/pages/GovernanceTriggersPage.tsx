import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Pill } from '../components/governance/ChangeStatusPill';
import {
  CHANGE_CATEGORIES,
  getFiredTriggers,
  getTriggerRules,
  setTriggerRuleEnabled,
} from '../services/changeManagementService';
import { useAuth } from '../contexts/AuthContext';
import type { FiredTrigger, TriggerActionType } from '../types/changeManagement';

const SEVERITY_TONE: Record<FiredTrigger['severity'], string> = {
  Critical: 'var(--risk-critical)',
  High: 'var(--risk-high)',
  Medium: 'var(--risk-medium)',
  Low: 'var(--risk-low)',
};

const ACTION_META: Record<TriggerActionType, { icon: string; tone: string; route: string }> = {
  'Create Review': { icon: '📅', tone: 'var(--stage-2)', route: '/review-calendar' },
  'Identify Affected Assets': { icon: '🔗', tone: 'var(--stage-3)', route: '/policy-mapping' },
  'Executive Escalation': { icon: '🏛️', tone: 'var(--status-danger)', route: '/executive-hub' },
  'Require Revalidation': { icon: '🧪', tone: 'var(--stage-5)', route: '/validation' },
  'Require Evidence Refresh': { icon: '📄', tone: 'var(--stage-7)', route: '/evidence' },
  'Notify Compliance': { icon: '🏛️', tone: 'var(--stage-8)', route: '/compliance-center' },
};

/**
 * Phase 10 WS9 — Governance Triggers.
 * Changes do not just get approved; they automatically create governance work.
 */
export const GovernanceTriggersPage: React.FC = () => {
  const navigate = useNavigate();
  // Q1 Stabilization — Phase 2: TriggerRule (distinct from ActionRule) has no matching
  // ActionKey in roleActionMatrix.ts, so enabling/disabling a rule falls back to the
  // safe !isReadOnly minimum.
  const { isReadOnly } = useAuth();
  const [version, setVersion] = useState(0);

  const rules = useMemo(
    () => getTriggerRules(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version forces a re-read after a mutation
    [version]
  );
  const fired = useMemo(
    () => getFiredTriggers(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version forces a re-read after a mutation
    [version]
  );

  const toggle = (ruleId: string, enabled: boolean) => {
    setTriggerRuleEnabled(ruleId, enabled);
    setVersion(v => v + 1);
  };

  const criticalFired = fired.filter(f => f.severity === 'Critical').length;
  const escalations = fired.filter(f => f.action === 'Executive Escalation').length;
  const activeRules = rules.filter(r => r.enabled).length;

  const byAction = (Object.keys(ACTION_META) as TriggerActionType[])
    .map(action => ({ action, count: fired.filter(f => f.action === action).length }))
    .filter(entry => entry.count > 0);

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Governance Triggers</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          A governed change should not need someone to remember what happens next. Trigger rules
          convert change conditions into governance work automatically — reviews, escalations,
          revalidation and compliance notification.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        <KpiCard
          label="Active Rules"
          value={activeRules}
          caption={`of ${rules.length} configured`}
          icon="⚙️"
          tone="accent"
        />
        <KpiCard
          label="Triggers Fired"
          value={fired.length}
          caption="From the current change register"
          icon="🔔"
          tone={fired.length === 0 ? 'success' : 'info'}
        />
        <KpiCard
          label="Executive Escalations"
          value={escalations}
          caption="Routed to executive authority"
          icon="🏛️"
          tone={escalations === 0 ? 'success' : 'danger'}
        />
        <KpiCard
          label="Critical Severity"
          value={criticalFired}
          caption="Fired on critical-magnitude changes"
          icon="⚡"
          tone={criticalFired === 0 ? 'success' : 'danger'}
        />
      </div>

      {/* Rule configuration */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          eyebrow="Workstream 9"
          title="Trigger Rules"
          subtitle="Condition in, governance action out. Disable a rule and it stops arming immediately."
          icon="⚙️"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          {rules.map(rule => {
            const meta = ACTION_META[rule.action];
            return (
              <div
                key={rule.id}
                data-noglass
                className="rounded-xl border px-3.5 py-3 flex flex-col gap-2.5"
                style={{
                  borderColor: rule.enabled
                    ? `color-mix(in srgb, ${meta.tone} 35%, transparent)`
                    : 'var(--border-subtle)',
                  background: rule.enabled
                    ? `color-mix(in srgb, ${meta.tone} 7%, transparent)`
                    : 'var(--bg-sunken)',
                  opacity: rule.enabled ? 1 : 0.6,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-bold text-[var(--text-primary)]">
                      {rule.condition}
                    </p>
                    <p
                      className="text-[12px] font-bold mt-1"
                      style={{ color: meta.tone }}
                    >
                      {meta.icon} → {rule.action}
                    </p>
                  </div>

                  <label
                    className={`flex items-center gap-2 shrink-0 ${isReadOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                    title={isReadOnly ? 'Your governance role does not permit changing trigger rules.' : undefined}
                  >
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={e => toggle(rule.id, e.target.checked)}
                      disabled={isReadOnly}
                      aria-label={`${rule.condition} rule enabled`}
                    />
                    <span className="text-[10px] font-extrabold uppercase text-[var(--text-muted)]">
                      {rule.enabled ? 'Armed' : 'Off'}
                    </span>
                  </label>
                </div>

                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {rule.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {rule.categories.map(category => {
                    const def = CHANGE_CATEGORIES.find(c => c.category === category);
                    return (
                      <span
                        key={category}
                        className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                      >
                        {def?.icon} {category.replace(' Change', '')}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Fired triggers */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          title="Governance Actions Raised"
          subtitle="Work the trigger engine has created from the current change register."
          icon="🔔"
          action={
            <button
              onClick={() => navigate('/change-requests')}
              className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
            >
              Change register →
            </button>
          }
        />

        {byAction.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {byAction.map(entry => (
              <span
                key={entry.action}
                data-noglass
                className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold"
                style={{
                  color: ACTION_META[entry.action].tone,
                  borderColor: `color-mix(in srgb, ${ACTION_META[entry.action].tone} 40%, transparent)`,
                  background: `color-mix(in srgb, ${ACTION_META[entry.action].tone} 10%, transparent)`,
                }}
              >
                {ACTION_META[entry.action].icon} {entry.action}
                <span className="tnum">{entry.count}</span>
              </span>
            ))}
          </div>
        )}

        {fired.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-[var(--text-muted)]">
            No trigger has armed against the current change register.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {fired.map(trigger => {
              const meta = ACTION_META[trigger.action];
              return (
                <li key={trigger.id}>
                  <button
                    onClick={() => navigate(meta.route)}
                    data-noglass
                    className="w-full text-left flex items-center gap-3 px-3.5 py-3 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
                  >
                    <span
                      className="w-1.5 h-10 rounded-full shrink-0"
                      style={{ background: SEVERITY_TONE[trigger.severity] }}
                    />
                    <span className="shrink-0 text-[15px]" aria-hidden>
                      {meta.icon}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="mono text-[10px] text-[var(--accent-primary)]">
                          {trigger.changeRef}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase text-[var(--text-muted)]">
                          {trigger.condition}
                        </span>
                      </span>
                      <span
                        className="block text-[12.5px] font-bold mt-0.5"
                        style={{ color: meta.tone }}
                      >
                        {trigger.action}
                      </span>
                      <span className="block text-[10.5px] text-[var(--text-muted)] truncate mt-0.5">
                        {trigger.assetName} · fired {trigger.firedAt}
                      </span>
                    </span>

                    <Pill label={trigger.severity} tone={SEVERITY_TONE[trigger.severity]} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
          Triggers are evaluated from the change register rather than stored, so this list always
          reflects the current state of governance. Correct the underlying change and the trigger
          stands down on its own.
        </p>
      </section>
    </div>
  );
};
