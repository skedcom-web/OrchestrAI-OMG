import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { RiskLevel } from '../../types';
import type { HeatmapRow } from '../../services/governanceIntelligence';

const RISK_ORDER: RiskLevel[] = ['Low', 'Medium', 'High', 'Critical'];

const RISK_COLOR: Record<RiskLevel, string> = {
  Low: 'var(--risk-low)',
  Medium: 'var(--risk-medium)',
  High: 'var(--risk-high)',
  Critical: 'var(--risk-critical)',
};

interface RiskHeatmapProps {
  rows: HeatmapRow[];
}

/** Phase 8B — Executive Risk Heatmap: risk concentration across AI categories. */
export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ rows }) => {
  const navigate = useNavigate();
  const max = Math.max(1, ...rows.flatMap(r => RISK_ORDER.map(level => r.cells[level])));

  const columnTotals = RISK_ORDER.reduce<Record<RiskLevel, number>>(
    (acc, level) => {
      acc[level] = rows.reduce((sum, r) => sum + r.cells[level], 0);
      return acc;
    },
    { Low: 0, Medium: 0, High: 0, Critical: 0 }
  );

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="w-full min-w-[34rem] border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="text-left text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)] pb-1 pl-1">
              AI Category
            </th>
            {RISK_ORDER.map(level => (
              <th key={level} className="pb-1">
                <span className="flex items-center justify-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-sm"
                    style={{ background: RISK_COLOR[level] }}
                    aria-hidden
                  />
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                    {level}
                  </span>
                </span>
              </th>
            ))}
            <th className="pb-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)] text-center">
              Total
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map(row => (
            <tr key={row.category}>
              <td className="pr-2 py-1">
                <span className="flex items-center gap-2">
                  <span className="text-[13px]" aria-hidden>
                    {row.icon}
                  </span>
                  <span className="text-[12px] font-semibold text-[var(--text-primary)] whitespace-nowrap">
                    {row.category}
                  </span>
                </span>
              </td>

              {RISK_ORDER.map(level => {
                const count = row.cells[level];
                const intensity = count === 0 ? 0 : 0.14 + (count / max) * 0.72;
                return (
                  <td key={level} className="p-0">
                    <button
                      onClick={() => navigate('/risk')}
                      title={`${row.category} · ${level} risk: ${count} asset${count === 1 ? '' : 's'}`}
                      data-noglass
                      className="w-full h-11 rounded-lg grid place-items-center border transition-all duration-200 hover:scale-[1.04] cursor-pointer"
                      style={{
                        background:
                          count === 0
                            ? 'var(--bg-sunken)'
                            : `color-mix(in srgb, ${RISK_COLOR[level]} ${Math.round(intensity * 100)}%, transparent)`,
                        borderColor:
                          count === 0
                            ? 'var(--border-subtle)'
                            : `color-mix(in srgb, ${RISK_COLOR[level]} 55%, transparent)`,
                      }}
                    >
                      <span
                        className="tnum text-[15px] font-extrabold"
                        style={{
                          color: count === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  </td>
                );
              })}

              <td className="p-0">
                <div
                  data-noglass
                  className="w-full h-11 rounded-lg grid place-items-center border border-[var(--border-color)] bg-[var(--bg-badge)]"
                >
                  <span className="tnum text-[14px] font-extrabold text-[var(--text-primary)]">
                    {row.total}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <td className="pt-1 pl-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]">
              Portfolio
            </td>
            {RISK_ORDER.map(level => (
              <td key={level} className="pt-1 text-center">
                <span
                  className="tnum text-[13px] font-extrabold"
                  style={{ color: RISK_COLOR[level] }}
                >
                  {columnTotals[level]}
                </span>
              </td>
            ))}
            <td className="pt-1 text-center">
              <span className="tnum text-[13px] font-extrabold text-[var(--text-primary)]">
                {rows.reduce((sum, r) => sum + r.total, 0)}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
