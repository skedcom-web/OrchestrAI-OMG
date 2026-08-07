import React from 'react';
import type { HeatmapMatrixRow, RiskLevel } from '../../types';

const RISK_ORDER: RiskLevel[] = ['Low', 'Medium', 'High', 'Critical'];

const RISK_COLOR: Record<RiskLevel, string> = {
  Low: 'var(--risk-low)',
  Medium: 'var(--risk-medium)',
  High: 'var(--risk-high)',
  Critical: 'var(--risk-critical)',
};

interface HeatmapMatrixProps {
  rows: HeatmapMatrixRow[];
  /** Column header for the first column, e.g. "Business Unit". */
  dimensionLabel: string;
  /** Show a governance health column alongside the risk distribution. */
  showHealth?: boolean;
  onCellClick?: (row: HeatmapMatrixRow, level: RiskLevel) => void;
}

/** Phase 9 WS6 — reusable executive heatmap grid. */
export const HeatmapMatrix: React.FC<HeatmapMatrixProps> = ({
  rows,
  dimensionLabel,
  showHealth = true,
  onCellClick,
}) => {
  const max = Math.max(1, ...rows.flatMap(r => RISK_ORDER.map(level => r.cells[level])));

  const totals = RISK_ORDER.reduce<Record<RiskLevel, number>>(
    (acc, level) => {
      acc[level] = rows.reduce((sum, r) => sum + r.cells[level], 0);
      return acc;
    },
    { Low: 0, Medium: 0, High: 0, Critical: 0 }
  );

  const healthTone = (health: number) =>
    health >= 85
      ? 'var(--status-success)'
      : health >= 70
        ? 'var(--status-info)'
        : health >= 50
          ? 'var(--status-warning)'
          : 'var(--status-danger)';

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="w-full min-w-[38rem] border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="text-left text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)] pb-1 pl-1">
              {dimensionLabel}
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
            {showHealth && (
              <th className="pb-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)] text-center">
                Health
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {rows.map(row => (
            <tr key={row.label}>
              <td className="pr-2 py-1">
                <span className="flex items-center gap-2">
                  {row.icon && (
                    <span className="text-[13px] shrink-0" aria-hidden>
                      {row.icon}
                    </span>
                  )}
                  <span className="text-[12px] font-semibold text-[var(--text-primary)] whitespace-nowrap">
                    {row.label}
                  </span>
                </span>
              </td>

              {RISK_ORDER.map(level => {
                const count = row.cells[level];
                const intensity = count === 0 ? 0 : 0.14 + (count / max) * 0.72;
                const interactive = Boolean(onCellClick) && count > 0;

                return (
                  <td key={level} className="p-0">
                    <button
                      type="button"
                      disabled={!interactive}
                      onClick={() => onCellClick?.(row, level)}
                      title={`${row.label} · ${level} risk: ${count} asset${count === 1 ? '' : 's'}`}
                      data-noglass
                      className={`w-full h-11 rounded-lg grid place-items-center border transition-all duration-200 ${
                        interactive ? 'hover:scale-[1.04] cursor-pointer' : 'cursor-default'
                      }`}
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
                        style={{ color: count === 0 ? 'var(--text-muted)' : 'var(--text-primary)' }}
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

              {showHealth && (
                <td className="p-0">
                  <div
                    data-noglass
                    className="w-full h-11 rounded-lg flex flex-col items-center justify-center gap-1 border border-[var(--border-subtle)] bg-[var(--bg-sunken)] px-2"
                  >
                    <span
                      className="tnum text-[12px] font-extrabold leading-none"
                      style={{ color: healthTone(row.health) }}
                    >
                      {row.total === 0 ? '—' : row.health}
                    </span>
                    <span
                      className="w-full h-1 rounded-full overflow-hidden"
                      style={{ background: 'var(--bg-card)' }}
                    >
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${row.total === 0 ? 0 : row.health}%`,
                          background: healthTone(row.health),
                        }}
                      />
                    </span>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <td className="pt-1 pl-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)]">
              Enterprise
            </td>
            {RISK_ORDER.map(level => (
              <td key={level} className="pt-1 text-center">
                <span className="tnum text-[13px] font-extrabold" style={{ color: RISK_COLOR[level] }}>
                  {totals[level]}
                </span>
              </td>
            ))}
            <td className="pt-1 text-center">
              <span className="tnum text-[13px] font-extrabold text-[var(--text-primary)]">
                {rows.reduce((sum, r) => sum + r.total, 0)}
              </span>
            </td>
            {showHealth && <td />}
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
