import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ScoreRing } from '../components/ui/ScoreRing';
import { ScorecardPanel } from '../components/governance/ScorecardPanel';
import {
  getGovernanceHealthIndex,
  getGovernanceScorecards,
} from '../services/executiveGovernance';

/** Phase 9 WS2 — Governance Scorecards. */
export const GovernanceScorecardsPage: React.FC = () => {
  const navigate = useNavigate();
  const scorecards = useMemo(() => getGovernanceScorecards(), []);
  const health = useMemo(() => getGovernanceHealthIndex(), []);

  const weakest = [...scorecards].sort((a, b) => a.score - b.score)[0];
  const strongest = [...scorecards].sort((a, b) => b.score - a.score)[0];

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Governance Scorecards</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          Five dimensions determine whether enterprise AI is governed: who owns it, how risky it is,
          whether it was validated, whether it can be evidenced, and whether it was authorised.
        </p>
      </div>

      {/* Composite index */}
      <section
        className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] p-5 sm:p-6"
        style={{ background: 'var(--grad-hero)' }}
      >
        <div className="absolute inset-0 enterprise-grid opacity-50 pointer-events-none" aria-hidden />

        <div className="relative flex flex-col lg:flex-row items-center gap-7">
          <ScoreRing score={health.score} size={160} label="Health Index" caption={health.band} />

          <div className="flex-1 w-full min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-3">
              Weighted Governance Health Index
            </p>

            <div className="flex flex-col gap-2.5">
              {health.dimensions.map(dimension => (
                <div key={dimension.label} className="flex items-center gap-3">
                  <span className="text-[11.5px] font-semibold text-[var(--text-secondary)] w-[10.5rem] shrink-0">
                    {dimension.label}
                  </span>
                  <span
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ background: 'var(--bg-sunken)' }}
                  >
                    <span
                      className="block h-full rounded-full transition-[width] duration-700 ease-out"
                      style={{
                        width: `${dimension.score}%`,
                        background:
                          dimension.score >= 80
                            ? 'var(--status-success)'
                            : dimension.score >= 60
                              ? 'var(--status-warning)'
                              : 'var(--status-danger)',
                      }}
                    />
                  </span>
                  <span className="tnum text-[12px] font-extrabold text-[var(--text-primary)] w-8 text-right">
                    {dimension.score}
                  </span>
                  <span className="tnum text-[10px] font-semibold text-[var(--text-muted)] w-12 text-right">
                    ×{dimension.weight.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-[var(--text-muted)] mt-3.5 leading-relaxed">
              Weightings favour the dimensions an examiner tests first. Ownership carries the
              heaviest weight because without named accountability no other control can be enforced.
            </p>
          </div>
        </div>
      </section>

      {/* Priority callouts */}
      {weakest && strongest && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => navigate(weakest.actionPath)}
            data-noglass
            className="text-left rounded-2xl border p-4 transition-all hover:-translate-y-0.5 cursor-pointer"
            style={{
              background: 'var(--status-danger-bg)',
              borderColor: 'var(--status-danger-border)',
            }}
          >
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--status-danger)]">
              Weakest dimension
            </p>
            <p className="text-[15px] font-bold text-[var(--text-primary)] mt-1.5">
              {weakest.icon} {weakest.title} — {weakest.score}/100
            </p>
            <p className="text-[11.5px] text-[var(--text-secondary)] mt-1">
              This is where governance debt is accumulating fastest. Open the module →
            </p>
          </button>

          <div
            data-noglass
            className="rounded-2xl border p-4"
            style={{
              background: 'var(--status-success-bg)',
              borderColor: 'var(--status-success-border)',
            }}
          >
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--status-success)]">
              Strongest dimension
            </p>
            <p className="text-[15px] font-bold text-[var(--text-primary)] mt-1.5">
              {strongest.icon} {strongest.title} — {strongest.score}/100
            </p>
            <p className="text-[11.5px] text-[var(--text-secondary)] mt-1">
              Hold this standard as the benchmark for the other four dimensions.
            </p>
          </div>
        </div>
      )}

      {/* The five scorecards */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          eyebrow="Workstream 2"
          title="The Five Governance Scorecards"
          subtitle="Every figure links to the module where it can be acted on."
          icon="🗂️"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 stagger">
          {scorecards.map(scorecard => (
            <ScorecardPanel key={scorecard.id} scorecard={scorecard} />
          ))}
        </div>
      </section>
    </div>
  );
};
