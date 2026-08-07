import React from 'react';

export type KpiTone = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const TONE_VARS: Record<KpiTone, { fg: string; bg: string; border: string }> = {
  accent: { fg: 'var(--accent-primary)', bg: 'var(--accent-light)', border: 'var(--accent-border)' },
  success: { fg: 'var(--status-success)', bg: 'var(--status-success-bg)', border: 'var(--status-success-border)' },
  warning: { fg: 'var(--status-warning)', bg: 'var(--status-warning-bg)', border: 'var(--status-warning-border)' },
  danger: { fg: 'var(--status-danger)', bg: 'var(--status-danger-bg)', border: 'var(--status-danger-border)' },
  info: { fg: 'var(--status-info)', bg: 'var(--status-info-bg)', border: 'var(--status-info-border)' },
  neutral: { fg: 'var(--status-neutral)', bg: 'var(--status-neutral-bg)', border: 'var(--status-neutral-border)' },
};

interface KpiCardProps {
  label: string;
  value: string | number;
  /** Short qualifier under the figure, e.g. "of 42 registered". */
  caption?: string;
  icon?: React.ReactNode;
  tone?: KpiTone;
  /** 0–100. Renders a thin capacity bar beneath the figure. */
  progress?: number;
  /** Small delta chip, e.g. "3 new this week". */
  delta?: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  caption,
  icon,
  tone = 'accent',
  progress,
  delta,
  onClick,
}) => {
  const t = TONE_VARS[tone];
  const interactive = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={`group relative overflow-hidden rounded-2xl border p-5 flex flex-col gap-3 bg-[var(--bg-card)] border-[var(--border-color)] shadow-[var(--shadow-sm)] ${
        interactive ? 'glow-on-hover cursor-pointer' : ''
      }`}
    >
      {/* Tone rail */}
      <span
        aria-hidden
        className="absolute left-0 top-0 h-full w-[3px]"
        style={{ background: t.fg, opacity: 0.85 }}
      />

      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--text-muted)] leading-snug">
          {label}
        </p>
        {icon && (
          <span
            data-noglass
            className="shrink-0 w-9 h-9 grid place-items-center rounded-xl text-base border"
            style={{ background: t.bg, borderColor: t.border, color: t.fg }}
          >
            {icon}
          </span>
        )}
      </div>

      <div className="flex items-end gap-2">
        <span className="tnum text-[2rem] leading-none font-extrabold text-[var(--text-primary)]">
          {value}
        </span>
        {delta && (
          <span
            data-noglass
            className="mb-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border"
            style={{ background: t.bg, borderColor: t.border, color: t.fg }}
          >
            {delta}
          </span>
        )}
      </div>

      {typeof progress === 'number' && (
        <div
          className="h-1.5 w-full rounded-full overflow-hidden"
          style={{ background: 'var(--bg-sunken)' }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-700 ease-out"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%`, background: t.fg }}
          />
        </div>
      )}

      {caption && (
        <p className="text-[11px] text-[var(--text-secondary)] leading-snug">{caption}</p>
      )}
    </div>
  );
};
