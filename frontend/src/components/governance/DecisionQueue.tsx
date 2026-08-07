import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { AIAsset, DecisionOutcome } from '../../types';

interface DecisionQueueProps {
  breakdown: Record<DecisionOutcome, number>;
  /** Assets awaiting an authority decision, highest risk first. */
  pendingAssets: AIAsset[];
}

const OUTCOME_META: Record<
  DecisionOutcome,
  { label: string; color: string; bg: string; border: string; icon: string; meaning: string }
> = {
  GO: {
    label: 'GO',
    color: 'var(--status-success)',
    bg: 'var(--status-success-bg)',
    border: 'var(--status-success-border)',
    icon: '✔',
    meaning: 'Approved for production',
  },
  'CONDITIONAL GO': {
    label: 'Conditional GO',
    color: 'var(--status-warning)',
    bg: 'var(--status-warning-bg)',
    border: 'var(--status-warning-border)',
    icon: '◐',
    meaning: 'Approved with conditions',
  },
  'NO GO': {
    label: 'NO GO',
    color: 'var(--status-danger)',
    bg: 'var(--status-danger-bg)',
    border: 'var(--status-danger-border)',
    icon: '✕',
    meaning: 'Blocked from production',
  },
  PENDING: {
    label: 'Pending',
    color: 'var(--status-info)',
    bg: 'var(--status-info-bg)',
    border: 'var(--status-info-border)',
    icon: '◷',
    meaning: 'Awaiting decision authority',
  },
};

const RISK_COLOR: Record<string, string> = {
  Low: 'var(--risk-low)',
  Medium: 'var(--risk-medium)',
  High: 'var(--risk-high)',
  Critical: 'var(--risk-critical)',
};

/** Phase 8B — Executive Decision Queue. */
export const DecisionQueue: React.FC<DecisionQueueProps> = ({ breakdown, pendingAssets }) => {
  const navigate = useNavigate();
  const order: DecisionOutcome[] = ['GO', 'CONDITIONAL GO', 'NO GO', 'PENDING'];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {order.map(outcome => {
          const meta = OUTCOME_META[outcome];
          return (
            <button
              key={outcome}
              onClick={() => navigate('/decision-dashboard')}
              data-noglass
              className="text-left rounded-xl border p-3 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              style={{ background: meta.bg, borderColor: meta.border }}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-black" style={{ color: meta.color }} aria-hidden>
                  {meta.icon}
                </span>
                <span
                  className="text-[10px] font-extrabold uppercase tracking-[0.08em]"
                  style={{ color: meta.color }}
                >
                  {meta.label}
                </span>
              </div>
              <p className="tnum text-2xl font-extrabold mt-1.5 text-[var(--text-primary)] leading-none">
                {breakdown[outcome] ?? 0}
              </p>
              <p className="text-[10px] text-[var(--text-secondary)] mt-1.5 leading-snug">
                {meta.meaning}
              </p>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-[var(--border-subtle)] overflow-hidden">
        <div className="px-3.5 py-2 bg-[var(--bg-sunken)] flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Awaiting Decision Authority
          </span>
          <button
            onClick={() => navigate('/decision-workbench-v4')}
            className="text-[10px] font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
          >
            Open Workbench →
          </button>
        </div>

        {pendingAssets.length === 0 ? (
          <p className="px-3.5 py-6 text-center text-[12px] text-[var(--text-muted)]">
            No assets are awaiting a governance decision.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border-subtle)]">
            {pendingAssets.map(asset => (
              <li key={asset.id}>
                <button
                  onClick={() => navigate('/decision-workbench-v4')}
                  className="w-full text-left px-3.5 py-2.5 flex items-center gap-3 hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
                >
                  <span
                    className="w-1.5 h-8 rounded-full shrink-0"
                    style={{ background: RISK_COLOR[asset.riskLevel] }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] font-semibold text-[var(--text-primary)] truncate">
                      {asset.name}
                    </span>
                    <span className="block text-[10.5px] text-[var(--text-muted)] truncate">
                      {asset.type} · {asset.department}
                    </span>
                  </span>
                  <span
                    data-noglass
                    className="shrink-0 text-[9.5px] font-extrabold uppercase px-2 py-1 rounded-md border"
                    style={{
                      color: RISK_COLOR[asset.riskLevel],
                      borderColor: `color-mix(in srgb, ${RISK_COLOR[asset.riskLevel]} 45%, transparent)`,
                      background: `color-mix(in srgb, ${RISK_COLOR[asset.riskLevel]} 12%, transparent)`,
                    }}
                  >
                    {asset.riskLevel}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
