import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ProgressMeter } from '../components/ui/ProgressMeter';
import {
  IMPACT_TONE,
  MAGNITUDE_TONE,
  Pill,
  REASSESSMENT_TONE,
} from '../components/governance/ChangeStatusPill';
import {
  IMPACT_AREAS,
  IMPACT_OUTCOMES,
  REASSESSMENT_RULES,
  getCategoryDefinition,
  getChangeRequests,
} from '../services/changeManagementService';
import type { ImpactArea, ImpactOutcome } from '../types/changeManagement';

/**
 * Phase 10 WS3 + WS4 — Change Impact & Reassessment.
 * The analytical view of how governance impact is being assessed across the
 * change register, and the rules that convert impact into routing.
 */
export const ChangeImpactPage: React.FC = () => {
  const navigate = useNavigate();
  const [areaFilter, setAreaFilter] = useState<ImpactArea | 'all'>('all');

  const changes = useMemo(() => getChangeRequests(), []);
  const assessed = useMemo(() => changes.filter(c => c.impact), [changes]);

  /** How often each impact area is hit, and at what severity. */
  const areaProfile = useMemo(
    () =>
      IMPACT_AREAS.map(area => {
        const counts = IMPACT_OUTCOMES.reduce<Record<ImpactOutcome, number>>(
          (acc, outcome) => {
            acc[outcome] = assessed.filter(c => c.impact?.[area] === outcome).length;
            return acc;
          },
          {} as Record<ImpactOutcome, number>
        );

        const affected = assessed.filter(
          c => c.impact?.[area] && c.impact[area] !== 'No Impact'
        ).length;

        const severe = assessed.filter(
          c => c.impact?.[area] === 'High Impact' || c.impact?.[area] === 'Critical Impact'
        ).length;

        return { area, counts, affected, severe };
      }),
    [assessed]
  );

  const filteredChanges = useMemo(
    () =>
      areaFilter === 'all'
        ? assessed
        : assessed.filter(c => c.impact?.[areaFilter] && c.impact[areaFilter] !== 'No Impact'),
    [assessed, areaFilter]
  );

  const byMagnitude = {
    Critical: assessed.filter(c => c.magnitude === 'Critical').length,
    Major: assessed.filter(c => c.magnitude === 'Major').length,
    Moderate: assessed.filter(c => c.magnitude === 'Moderate').length,
    Minor: assessed.filter(c => c.magnitude === 'Minor').length,
  };

  const meanScore =
    assessed.length > 0
      ? Math.round(assessed.reduce((s, c) => s + (c.impactScore || 0), 0) / assessed.length)
      : 0;

  const mostAffected = [...areaProfile].sort((a, b) => b.severe - a.severe)[0];

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">
          Change Impact &amp; Reassessment
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          Every change is assessed across seven governance impact areas. The rules engine converts
          that assessment into a magnitude and a reassessment requirement — the same way, every time.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        <KpiCard
          label="Assessed Changes"
          value={assessed.length}
          caption={`of ${changes.length} in the register`}
          icon="🔬"
          tone="accent"
        />
        <KpiCard
          label="Mean Impact Score"
          value={`${meanScore}`}
          caption="Weighted across seven areas"
          icon="📊"
          tone={meanScore >= 60 ? 'danger' : meanScore >= 35 ? 'warning' : 'success'}
          progress={meanScore}
        />
        <KpiCard
          label="Requiring Executive Sign-Off"
          value={byMagnitude.Critical}
          caption="Critical magnitude changes"
          icon="⚡"
          tone={byMagnitude.Critical === 0 ? 'success' : 'danger'}
        />
        <KpiCard
          label="Most Affected Area"
          value={mostAffected ? mostAffected.severe : 0}
          caption={mostAffected ? `${mostAffected.area} — high or critical` : 'No assessments'}
          icon="🎯"
          tone="warning"
        />
      </div>

      {/* Magnitude distribution */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          eyebrow="Workstream 4"
          title="Reassessment Rules Engine"
          subtitle="Impact score determines magnitude, and magnitude determines who must reapprove."
          icon="⚙️"
        />

        <ProgressMeter
          height={16}
          segments={[
            { label: 'Minor', value: byMagnitude.Minor, color: MAGNITUDE_TONE.Minor },
            { label: 'Moderate', value: byMagnitude.Moderate, color: MAGNITUDE_TONE.Moderate },
            { label: 'Major', value: byMagnitude.Major, color: MAGNITUDE_TONE.Major },
            { label: 'Critical', value: byMagnitude.Critical, color: MAGNITUDE_TONE.Critical },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {[...REASSESSMENT_RULES].reverse().map(rule => (
            <div
              key={rule.magnitude}
              data-noglass
              className="rounded-xl border px-3.5 py-3"
              style={{
                background: `color-mix(in srgb, ${MAGNITUDE_TONE[rule.magnitude]} 8%, transparent)`,
                borderColor: `color-mix(in srgb, ${MAGNITUDE_TONE[rule.magnitude]} 32%, transparent)`,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <Pill label={`${rule.magnitude} Change`} tone={MAGNITUDE_TONE[rule.magnitude]} size="md" />
                <span className="tnum text-[10px] font-bold text-[var(--text-muted)]">
                  score ≥ {rule.minScore}
                </span>
              </div>

              <p
                className="text-[13px] font-bold mt-2"
                style={{ color: REASSESSMENT_TONE[rule.requirement] }}
              >
                → {rule.requirement}
              </p>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                {rule.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {rule.approvers.map(role => (
                  <span
                    key={role}
                    className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Impact area profile */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          eyebrow="Workstream 3"
          title="Governance Impact Profile"
          subtitle="Which governance dimensions changes are actually disturbing."
          icon="🔬"
          action={
            areaFilter !== 'all' ? (
              <button
                onClick={() => setAreaFilter('all')}
                className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                Clear filter
              </button>
            ) : undefined
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="text-left text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)] pb-1 pl-1">
                  Impact Area
                </th>
                {IMPACT_OUTCOMES.map(outcome => (
                  <th key={outcome} className="pb-1">
                    <span className="flex items-center justify-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-sm"
                        style={{ background: IMPACT_TONE[outcome] }}
                        aria-hidden
                      />
                      <span className="text-[9.5px] font-extrabold uppercase text-[var(--text-muted)]">
                        {outcome.replace(' Impact', '')}
                      </span>
                    </span>
                  </th>
                ))}
                <th className="pb-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)] text-center">
                  Affected
                </th>
              </tr>
            </thead>

            <tbody>
              {areaProfile.map(row => {
                const active = areaFilter === row.area;
                return (
                  <tr key={row.area}>
                    <td className="pr-2 py-1">
                      <button
                        onClick={() => setAreaFilter(active ? 'all' : row.area)}
                        className={`text-[12px] font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                          active
                            ? 'text-[var(--accent-primary)]'
                            : 'text-[var(--text-primary)] hover:text-[var(--accent-primary)]'
                        }`}
                      >
                        {row.area}
                      </button>
                    </td>

                    {IMPACT_OUTCOMES.map(outcome => {
                      const count = row.counts[outcome];
                      const intensity = count === 0 ? 0 : 0.16 + (count / Math.max(1, assessed.length)) * 0.7;
                      return (
                        <td key={outcome} className="p-0">
                          <div
                            data-noglass
                            title={`${row.area} · ${outcome}: ${count}`}
                            className="w-full h-10 rounded-lg grid place-items-center border"
                            style={{
                              background:
                                count === 0
                                  ? 'var(--bg-sunken)'
                                  : `color-mix(in srgb, ${IMPACT_TONE[outcome]} ${Math.round(intensity * 100)}%, transparent)`,
                              borderColor:
                                count === 0
                                  ? 'var(--border-subtle)'
                                  : `color-mix(in srgb, ${IMPACT_TONE[outcome]} 50%, transparent)`,
                            }}
                          >
                            <span
                              className="tnum text-[13px] font-extrabold"
                              style={{
                                color: count === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                              }}
                            >
                              {count}
                            </span>
                          </div>
                        </td>
                      );
                    })}

                    <td className="p-0">
                      <div
                        data-noglass
                        className="w-full h-10 rounded-lg grid place-items-center border border-[var(--border-color)] bg-[var(--bg-badge)]"
                      >
                        <span className="tnum text-[13px] font-extrabold text-[var(--text-primary)]">
                          {row.affected}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Assessed changes */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex flex-col gap-4">
        <SectionHeader
          title="Assessed Changes"
          subtitle={
            areaFilter === 'all'
              ? 'Every change carrying a completed impact assessment.'
              : `Changes with a governance impact on ${areaFilter}.`
          }
          icon="📐"
          action={
            <button
              onClick={() => navigate('/change-requests')}
              className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
            >
              Change register →
            </button>
          }
        />

        <div className="flex flex-col gap-2">
          {filteredChanges.map(change => {
            const def = getCategoryDefinition(change.category);
            return (
              <button
                key={change.id}
                onClick={() => navigate('/change-requests')}
                data-noglass
                className="text-left flex flex-col sm:flex-row sm:items-center gap-3 px-3.5 py-3 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
              >
                <span
                  className="tnum shrink-0 w-12 h-12 grid place-items-center rounded-xl text-[15px] font-extrabold border"
                  style={{
                    color: change.magnitude ? MAGNITUDE_TONE[change.magnitude] : 'var(--text-muted)',
                    borderColor: change.magnitude
                      ? `color-mix(in srgb, ${MAGNITUDE_TONE[change.magnitude]} 40%, transparent)`
                      : 'var(--border-subtle)',
                    background: change.magnitude
                      ? `color-mix(in srgb, ${MAGNITUDE_TONE[change.magnitude]} 12%, transparent)`
                      : 'var(--bg-sunken)',
                  }}
                >
                  {change.impactScore ?? '—'}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="mono block text-[10px] text-[var(--accent-primary)]">
                    {change.changeRef} · {def.icon} {change.category}
                  </span>
                  <span className="block text-[12.5px] font-semibold text-[var(--text-primary)] mt-0.5">
                    {change.title}
                  </span>
                  <span className="block text-[10.5px] text-[var(--text-muted)] mt-0.5">
                    {change.assetName}
                  </span>
                </span>

                <span className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  {IMPACT_AREAS.filter(
                    area => change.impact?.[area] && change.impact[area] !== 'No Impact'
                  ).map(area => (
                    <span
                      key={area}
                      title={`${area}: ${change.impact?.[area]}`}
                      className="w-2 h-6 rounded-sm"
                      style={{
                        background: IMPACT_TONE[change.impact?.[area] as ImpactOutcome],
                      }}
                    />
                  ))}
                  {change.reassessment && (
                    <Pill
                      label={change.reassessment.replace(' Required', '')}
                      tone={REASSESSMENT_TONE[change.reassessment]}
                    />
                  )}
                </span>
              </button>
            );
          })}

          {filteredChanges.length === 0 && (
            <p className="py-10 text-center text-[13px] text-[var(--text-muted)]">
              No assessed changes affect this governance area.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};
