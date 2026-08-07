import React from 'react';
import type { GovernanceTrendSeries } from '../../types';

interface TrendChartProps {
  series: GovernanceTrendSeries;
  height?: number;
}

/**
 * Phase 9 WS7 — governance trend line.
 * Self-contained SVG: no chart dependency, themes via design tokens.
 */
export const TrendChart: React.FC<TrendChartProps> = ({ series, height = 84 }) => {
  const gradientId = React.useId();
  const values = series.points.map(p => p.value);
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const range = max - min || 1;

  const width = 100; // viewBox units; scales to container
  const step = series.points.length > 1 ? width / (series.points.length - 1) : width;

  const coords = series.points.map((point, i) => ({
    x: i * step,
    y: height - ((point.value - min) / range) * (height - 12) - 6,
    ...point,
  }));

  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;

  const first = values[0] ?? 0;
  const last = values[values.length - 1] ?? 0;
  const delta = last - first;
  const improving = series.higherIsBetter ? delta >= 0 : delta <= 0;

  const tone = improving ? 'var(--status-success)' : 'var(--status-danger)';
  const deltaLabel = `${delta > 0 ? '+' : ''}${delta}${series.unit || ''}`;

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[15px] shrink-0" aria-hidden>
            {series.icon}
          </span>
          <p className="text-[12.5px] font-bold text-[var(--text-primary)] truncate">
            {series.label}
          </p>
        </div>
        <span
          data-noglass
          className="shrink-0 tnum text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border"
          style={{
            color: tone,
            borderColor: `color-mix(in srgb, ${tone} 40%, transparent)`,
            background: `color-mix(in srgb, ${tone} 12%, transparent)`,
          }}
          title={improving ? 'Moving in the right direction' : 'Moving in the wrong direction'}
        >
          {improving ? '▲' : '▼'} {deltaLabel}
        </span>
      </div>

      <div className="flex items-end gap-3">
        <span className="tnum text-2xl font-extrabold text-[var(--text-primary)] leading-none">
          {last}
          {series.unit && (
            <span className="text-[12px] font-bold text-[var(--text-muted)]">{series.unit}</span>
          )}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
        role="img"
        aria-label={`${series.label}: ${series.points.map(p => `${p.period} ${p.value}`).join(', ')}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tone} stopOpacity="0.28" />
            <stop offset="100%" stopColor={tone} stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line}
          fill="none"
          stroke={tone}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coords.map(c => (
          <circle
            key={c.period}
            cx={c.x}
            cy={c.y}
            r="1.6"
            fill={tone}
            vectorEffect="non-scaling-stroke"
          >
            <title>{`${c.period}: ${c.value}`}</title>
          </circle>
        ))}
      </svg>

      <div className="flex items-center justify-between">
        {series.points.map(point => (
          <span key={point.period} className="text-[9.5px] font-semibold text-[var(--text-muted)]">
            {point.period}
          </span>
        ))}
      </div>
    </div>
  );
};
