import type { GovernanceStatus, DecisionOutcome } from '../../types';

interface StatusBadgeProps {
  status: GovernanceStatus | DecisionOutcome;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyle = () => {
    switch (status) {
      case 'Draft':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      case 'Review':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Validation':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Approval':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Production':
      case 'GO':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 font-bold';
      case 'CONDITIONAL GO':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40 font-bold';
      case 'NO GO':
        return 'bg-red-500/20 text-red-400 border-red-500/40 font-bold';
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-md border ${padding} ${getStyle()}`}>
      {status}
    </span>
  );
};
