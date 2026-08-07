import type { RiskLevel } from '../../types';

interface BadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md';
}

export const RiskBadge: React.FC<BadgeProps> = ({ level, size = 'md' }) => {
  const styles = {
    Low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    Medium: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    High: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
    Critical: 'bg-red-500/15 text-red-500 border-red-500/40 font-bold animate-pulse',
  }[level];

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full border ${padding} ${styles}`}>
      <span className="w-1.5 h-1.5 rounded-full fill-current" />
      {level} Risk
    </span>
  );
};
