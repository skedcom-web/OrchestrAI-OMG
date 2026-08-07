import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

/** Consistent section rhythm across every governance surface. */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  eyebrow,
  icon,
  action,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
    <div className="flex items-start gap-3 min-w-0">
      {icon && (
        <span
          data-noglass
          className="shrink-0 mt-0.5 w-9 h-9 grid place-items-center rounded-xl text-base bg-[var(--accent-light)] border border-[var(--accent-border)] text-[var(--accent-primary)]"
        >
          {icon}
        </span>
      )}
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--accent-primary)] mb-1">
            {eyebrow}
          </p>
        )}
        <h2 className="text-lg font-bold text-[var(--text-primary)] leading-tight">{title}</h2>
        {subtitle && (
          <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{subtitle}</p>
        )}
      </div>
    </div>
    {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
  </div>
);
