import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { PortfolioGroupSummary } from '../../services/governanceIntelligence';

interface PortfolioSummaryProps {
  groups: PortfolioGroupSummary[];
}

/** Phase 8F — AI Portfolio Summary. */
export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ groups }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
      {groups.map(group => (
        <button
          key={group.label}
          onClick={() => navigate('/assets')}
          className="text-left rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3.5 glow-on-hover cursor-pointer"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-lg" aria-hidden>
              {group.icon}
            </span>
            <span className="tnum text-[9.5px] font-extrabold text-[var(--text-muted)]">
              {group.share}%
            </span>
          </div>

          <p className="tnum text-2xl font-extrabold text-[var(--text-primary)] mt-2 leading-none">
            {group.count}
          </p>
          <p className="text-[11px] font-semibold text-[var(--text-secondary)] mt-1">
            {group.label}
          </p>

          <div
            className="mt-2.5 h-1 w-full rounded-full overflow-hidden"
            style={{ background: 'var(--bg-sunken)' }}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${group.share}%`, background: 'var(--grad-brand)' }}
            />
          </div>

          <div className="flex items-center gap-3 mt-2.5">
            <span className="tnum text-[10px] font-bold" style={{ color: 'var(--status-success)' }}>
              {group.production} live
            </span>
            <span className="tnum text-[10px] font-bold" style={{ color: 'var(--status-danger)' }}>
              {group.highRisk} high risk
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};
