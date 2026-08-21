import type { AutonomyLevel, EvidenceExpiryIndicator, EvidenceRecordStatus, GovernanceClassification, GovernanceState, HumanOversightType, RiskLevel } from '../../types';
import { EXPIRY_INDICATOR_TONE } from '../../config/evidenceFoundation';

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

/** Release 1 — Capability 2, Human Oversight Classification. */
interface OversightBadgeProps {
  type: HumanOversightType;
  size?: 'sm' | 'md';
}

export const OversightBadge: React.FC<OversightBadgeProps> = ({ type, size = 'md' }) => {
  const styles: Record<HumanOversightType, string> = {
    'Human-in-Command': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    'Human-in-the-Loop': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    'Human-on-the-Loop': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    'Autonomous with Controls': 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30',
  };
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full border ${padding} ${styles[type]}`}>
      {type}
    </span>
  );
};

/** Release 1 — Capability 3, Autonomy Classification (Level 0-5). */
interface AutonomyBadgeProps {
  level: AutonomyLevel;
  size?: 'sm' | 'md';
}

export const AutonomyBadge: React.FC<AutonomyBadgeProps> = ({ level, size = 'md' }) => {
  const styles =
    level <= 1
      ? 'bg-slate-500/10 text-slate-400 border-slate-500/30'
      : level <= 3
        ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
        : 'bg-red-500/15 text-red-500 border-red-500/40 font-bold';
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full border ${padding} ${styles}`}>
      Autonomy L{level}
    </span>
  );
};

/** Release 2 — Capability 1, Governance State Model. */
interface GovernanceStateBadgeProps {
  state: GovernanceState;
  size?: 'sm' | 'md';
}

export const GovernanceStateBadge: React.FC<GovernanceStateBadgeProps> = ({ state, size = 'md' }) => {
  const styles: Record<GovernanceState, string> = {
    'Draft': 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    'Submitted': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    'Authorized': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    'Monitoring': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    'Reassessment Required': 'bg-amber-500/15 text-amber-500 border-amber-500/40 font-bold',
    'Conditional GO': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    'No GO': 'bg-red-500/15 text-red-500 border-red-500/40 font-bold',
    'Retired': 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  };
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full border ${padding} ${styles[state]}`}>
      {state}
    </span>
  );
};

/** Release 1 recommendation (carried into Release 2) — Governance Classification. */
interface ClassificationBadgeProps {
  classification: GovernanceClassification;
  size?: 'sm' | 'md';
}

export const ClassificationBadge: React.FC<ClassificationBadgeProps> = ({ classification, size = 'md' }) => {
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full border bg-violet-500/10 text-violet-400 border-violet-500/30 ${padding}`}>
      {classification}
    </span>
  );
};

/** Release 3 — Capability 5, Evidence Lifecycle. */
interface EvidenceStatusBadgeProps {
  status: EvidenceRecordStatus;
  size?: 'sm' | 'md';
}

export const EvidenceStatusBadge: React.FC<EvidenceStatusBadgeProps> = ({ status, size = 'md' }) => {
  const styles: Record<EvidenceRecordStatus, string> = {
    'Draft': 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    'Active': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    'Expired': 'bg-red-500/15 text-red-500 border-red-500/40 font-bold',
    'Archived': 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    'Superseded': 'bg-amber-500/15 text-amber-500 border-amber-500/40',
  };
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full border ${padding} ${styles[status]}`}>
      {status}
    </span>
  );
};

/** Release 3 — Capability 6, Evidence Expiry Tracking. */
interface EvidenceExpiryBadgeProps {
  indicator: EvidenceExpiryIndicator;
  size?: 'sm' | 'md';
}

export const EvidenceExpiryBadge: React.FC<EvidenceExpiryBadgeProps> = ({ indicator, size = 'md' }) => {
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full border ${padding} ${EXPIRY_INDICATOR_TONE[indicator]}`}>
      {indicator}
    </span>
  );
};
