import React from 'react';
import { Card } from './Card';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  accentColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendType = 'neutral',
  icon,
}) => {
  const trendColor = {
    positive: 'text-emerald-500',
    negative: 'text-red-500',
    neutral: 'text-[var(--text-muted)]',
  }[trendType];

  return (
    <Card glowOnHover className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {title}
          </p>
          <h3 className="text-3xl font-extrabold mt-2 text-[var(--text-primary)] tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs mt-1 text-[var(--text-secondary)]">{subtitle}</p>
          )}
          {trend && (
            <span className={`text-xs font-medium mt-2 inline-block ${trendColor}`}>
              {trend}
            </span>
          )}
        </div>
        <div className="p-3 rounded-xl bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-border)] shrink-0">
          {icon}
        </div>
      </div>
    </Card>
  );
};
