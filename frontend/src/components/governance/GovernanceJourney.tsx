import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { GovernanceJourneyStage } from '../../types';

const STAGE_ROUTES: Record<string, string> = {
  asset: '/assets',
  ownership: '/ownership',
  risk: '/risk',
  validation: '/validation',
  evidence: '/evidence',
  decision: '/decision-workbench-v4',
  production: '/operations-dashboard',
  monitoring: '/governance-monitoring',
};

const STAGE_HUES = [
  'var(--stage-1)',
  'var(--stage-2)',
  'var(--stage-3)',
  'var(--stage-4)',
  'var(--stage-5)',
  'var(--stage-6)',
  'var(--stage-7)',
  'var(--stage-8)',
];

interface GovernanceJourneyProps {
  stages: GovernanceJourneyStage[];
}

/**
 * Phase 8C — the OMG signature visualization.
 * AI Asset → Ownership → Risk → Validation → Evidence → Decision → Production → Monitoring
 */
export const GovernanceJourney: React.FC<GovernanceJourneyProps> = ({ stages }) => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Connective spine */}
      <div
        aria-hidden
        className="hidden xl:block absolute left-0 right-0 top-[3.15rem] h-[2px] rounded-full"
        style={{
          background:
            'linear-gradient(90deg, var(--stage-1), var(--stage-3), var(--stage-5), var(--stage-7), var(--stage-8))',
          opacity: 0.35,
        }}
      />

      <div className="relative grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 stagger">
        {stages.map((stage, i) => {
          const hue = STAGE_HUES[i % STAGE_HUES.length];
          const route = STAGE_ROUTES[stage.key];

          return (
            <button
              key={stage.key}
              onClick={() => route && navigate(route)}
              title={stage.purpose}
              className="group text-left rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3.5 flex flex-col gap-3 glow-on-hover cursor-pointer"
            >
              {/* Stage marker */}
              <div className="flex items-center gap-2">
                <span
                  data-noglass
                  className="w-8 h-8 grid place-items-center rounded-full text-[13px] shrink-0 border-2 font-bold"
                  style={{
                    borderColor: hue,
                    color: hue,
                    background: 'var(--bg-card)',
                    boxShadow: `0 0 0 3px color-mix(in srgb, ${hue} 12%, transparent)`,
                  }}
                >
                  {stage.icon}
                </span>
                <span className="tnum text-[9px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                  Stage {i + 1}
                </span>
              </div>

              <div>
                <p className="text-[12.5px] font-bold text-[var(--text-primary)] leading-tight">
                  {stage.label}
                </p>
                <p className="tnum text-[10px] text-[var(--text-muted)] mt-0.5">
                  {stage.approved}/{stage.total} cleared
                </p>
              </div>

              {/* Clearance bar */}
              <div
                className="h-1.5 w-full rounded-full overflow-hidden"
                style={{ background: 'var(--bg-sunken)' }}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{ width: `${stage.clearanceRate}%`, background: hue }}
                />
              </div>

              {/* Counts */}
              <div className="grid grid-cols-3 gap-1 text-center">
                <div>
                  <p
                    className="tnum text-[13px] font-extrabold leading-none"
                    style={{ color: 'var(--status-success)' }}
                  >
                    {stage.approved}
                  </p>
                  <p className="text-[8.5px] font-bold uppercase tracking-wide text-[var(--text-muted)] mt-1">
                    Appr
                  </p>
                </div>
                <div>
                  <p
                    className="tnum text-[13px] font-extrabold leading-none"
                    style={{ color: 'var(--status-warning)' }}
                  >
                    {stage.pending}
                  </p>
                  <p className="text-[8.5px] font-bold uppercase tracking-wide text-[var(--text-muted)] mt-1">
                    Pend
                  </p>
                </div>
                <div>
                  <p
                    className="tnum text-[13px] font-extrabold leading-none"
                    style={{ color: 'var(--status-danger)' }}
                  >
                    {stage.blocked}
                  </p>
                  <p className="text-[8.5px] font-bold uppercase tracking-wide text-[var(--text-muted)] mt-1">
                    Blkd
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
