import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { GovernanceScorecard, ScorecardMetric } from '../../types';

const TONE_COLOR: Record<ScorecardMetric['tone'], string> = {
  success: 'var(--status-success)',
  warning: 'var(--status-warning)',
  danger: 'var(--status-danger)',
  info: 'var(--status-info)',
  neutral: 'var(--status-neutral)',
};

function scoreTone(score: number): string {
  if (score >= 85) return 'var(--status-success)';
  if (score >= 70) return 'var(--status-info)';
  if (score >= 50) return 'var(--status-warning)';
  return 'var(--status-danger)';
}

interface ScorecardPanelProps {
  scorecard: GovernanceScorecard;
  compact?: boolean;
}

/** Phase 9 WS2 — a single governance scorecard. */
export const ScorecardPanel: React.FC<ScorecardPanelProps> = ({ scorecard, compact = false }) => {
  const navigate = useNavigate();
  const tone = scoreTone(scorecard.score);

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 flex flex-col gap-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            data-noglass
            className="w-9 h-9 grid place-items-center rounded-xl text-base shrink-0 border"
            style={{
              background: `color-mix(in srgb, ${tone} 12%, transparent)`,
              borderColor: `color-mix(in srgb, ${tone} 38%, transparent)`,
            }}
            aria-hidden
          >
            {scorecard.icon}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[var(--text-primary)] truncate">
              {scorecard.title}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">
              {scorecard.metrics.length} measures
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="tnum text-2xl font-extrabold leading-none" style={{ color: tone }}>
            {scorecard.score}
          </p>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)] mt-1">
            /100
          </p>
        </div>
      </div>

      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--bg-sunken)' }}>
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${scorecard.score}%`, background: tone }}
        />
      </div>

      <ul className="flex flex-col gap-1.5">
        {scorecard.metrics.map(metric => (
          <li
            key={metric.label}
            className="flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg"
            style={{ background: 'var(--bg-sunken)' }}
          >
            <span className="flex items-center gap-2 min-w-0">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: TONE_COLOR[metric.tone] }}
                aria-hidden
              />
              <span className="text-[11.5px] font-semibold text-[var(--text-secondary)] truncate">
                {metric.label}
              </span>
            </span>
            <span
              className="tnum text-[13px] font-extrabold shrink-0"
              style={{ color: TONE_COLOR[metric.tone] }}
            >
              {metric.value}
            </span>
          </li>
        ))}
      </ul>

      {!compact && (
        <button
          onClick={() => navigate(scorecard.actionPath)}
          className="self-start text-[11px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
        >
          Open module →
        </button>
      )}
    </div>
  );
};
