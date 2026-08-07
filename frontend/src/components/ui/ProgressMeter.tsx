import React from 'react';

export interface MeterSegment {
  label: string;
  value: number;
  color: string;
}

interface ProgressMeterProps {
  segments: MeterSegment[];
  /** Show the legend beneath the bar. */
  showLegend?: boolean;
  height?: number;
  /** Optional caption rendered above the bar, right aligned. */
  caption?: string;
}

/** Stacked proportional meter — used for compliance readiness and portfolio splits. */
export const ProgressMeter: React.FC<ProgressMeterProps> = ({
  segments,
  showLegend = true,
  height = 12,
  caption,
}) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="flex flex-col gap-3 w-full">
      {caption && (
        <p className="text-[11px] text-[var(--text-muted)] font-semibold text-right">{caption}</p>
      )}

      <div
        data-noglass
        className="flex w-full overflow-hidden rounded-full border border-[var(--border-color)]"
        style={{ height, background: 'var(--bg-sunken)' }}
        role="img"
        aria-label={segments.map(s => `${s.label}: ${s.value}`).join(', ')}
      >
        {total === 0 ? null : segments.map(s => (
          <div
            key={s.label}
            title={`${s.label}: ${s.value}`}
            className="h-full transition-[flex-grow] duration-700 ease-out"
            style={{ flexGrow: s.value, background: s.color, minWidth: s.value > 0 ? 4 : 0 }}
          />
        ))}
      </div>

      {showLegend && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {segments.map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ background: s.color }}
                aria-hidden
              />
              <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                {s.label}
              </span>
              <span className="tnum text-[11px] font-bold text-[var(--text-primary)]">
                {s.value}
              </span>
              {total > 0 && (
                <span className="tnum text-[10px] text-[var(--text-muted)]">
                  ({Math.round((s.value / total) * 100)}%)
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
