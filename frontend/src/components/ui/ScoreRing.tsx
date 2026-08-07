import React from 'react';

interface ScoreRingProps {
  /** 0–100 */
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  caption?: string;
}

function toneForScore(score: number): string {
  if (score >= 85) return 'var(--status-success)';
  if (score >= 70) return 'var(--status-info)';
  if (score >= 50) return 'var(--status-warning)';
  return 'var(--status-danger)';
}

/** Radial governance readiness gauge (0–100). */
export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 148,
  strokeWidth = 12,
  label,
  caption,
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;
  const color = toneForScore(clamped);
  const gradientId = React.useId();

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.65" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-color)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          style={{ transition: 'stroke-dasharray 900ms var(--ease-out-quint)' }}
        />
      </svg>

      <div className="absolute inset-0 grid place-items-center text-center px-4">
        <div>
          <div className="tnum text-3xl font-extrabold leading-none" style={{ color }}>
            {clamped}
          </div>
          {label && (
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)] mt-1.5">
              {label}
            </div>
          )}
          {caption && (
            <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">{caption}</div>
          )}
        </div>
      </div>
    </div>
  );
};
