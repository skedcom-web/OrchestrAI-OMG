/**
 * OMG Release 1 — Governance Authority Foundation.
 *
 * Reference data for the three new governance dimensions introduced in
 * Release 1: Human Oversight Classification, Autonomy Classification and the
 * baseline Authority Matrix. Everything here is descriptive reference data —
 * there is no scoring and no workflow automation in this release.
 */

import type {
  AuthorityMatrixEntry,
  AutonomyLevel,
  GovernanceAuthorityProfile,
  HumanOversightType,
  RiskLevel,
} from '../types';

/* ==================== Capability 2 — Human Oversight ===================== */

export interface OversightTypeDefinition {
  type: HumanOversightType;
  icon: string;
  description: string;
}

export const OVERSIGHT_TYPES: OversightTypeDefinition[] = [
  {
    type: 'Human-in-Command',
    icon: '🧑‍✈️',
    description: 'A human directs every consequential action; the AI cannot act without explicit instruction.',
  },
  {
    type: 'Human-in-the-Loop',
    icon: '✋',
    description: 'A human reviews and approves each AI recommendation before it takes effect.',
  },
  {
    type: 'Human-on-the-Loop',
    icon: '👁️',
    description: 'The AI acts independently while a human monitors and can intervene at any time.',
  },
  {
    type: 'Autonomous with Controls',
    icon: '🤖',
    description: 'The AI operates without per-action human review, bounded by defined controls and limits.',
  },
];

export function getOversightDefinition(type: HumanOversightType): OversightTypeDefinition {
  return OVERSIGHT_TYPES.find(o => o.type === type) || OVERSIGHT_TYPES[1];
}

/* =================== Capability 3 — Autonomy Classification ============== */

export interface AutonomyLevelDefinition {
  level: AutonomyLevel;
  label: string;
  description: string;
}

export const AUTONOMY_LEVELS: AutonomyLevelDefinition[] = [
  { level: 0, label: 'Level 0 — No AI', description: 'No AI involvement in the process or decision.' },
  { level: 1, label: 'Level 1 — Assist', description: 'AI assists a human who performs the task.' },
  { level: 2, label: 'Level 2 — Recommend', description: 'AI recommends an action; a human decides.' },
  { level: 3, label: 'Level 3 — Execute with Approval', description: 'AI executes only after a human approves.' },
  { level: 4, label: 'Level 4 — Controlled Autonomy', description: 'AI executes independently within defined, bounded controls.' },
  { level: 5, label: 'Level 5 — High Autonomy', description: 'AI operates with broad independence and minimal per-action control.' },
];

export function getAutonomyDefinition(level: AutonomyLevel): AutonomyLevelDefinition {
  return AUTONOMY_LEVELS.find(a => a.level === level) || AUTONOMY_LEVELS[0];
}

/* ====================== Capability 4 — Authority Matrix =================== */

/**
 * Baseline governance expectations by risk tier. Reference guidance only —
 * shown to inform registration and review; nothing here is enforced
 * automatically in Release 1.
 */
export const AUTHORITY_MATRIX: AuthorityMatrixEntry[] = [
  { riskLevel: 'Low', oversightType: 'Human-on-the-Loop', approvalAuthority: 'Manager Approval' },
  { riskLevel: 'Medium', oversightType: 'Human-in-the-Loop', approvalAuthority: 'Director Approval' },
  { riskLevel: 'High', oversightType: 'Human-in-Command', approvalAuthority: 'Governance Board Approval' },
  { riskLevel: 'Critical', oversightType: 'Human-in-Command', approvalAuthority: 'Executive Committee Approval (Human Approval Mandatory)' },
];

export function getAuthorityMatrixEntry(riskLevel: RiskLevel): AuthorityMatrixEntry {
  return AUTHORITY_MATRIX.find(m => m.riskLevel === riskLevel) || AUTHORITY_MATRIX[1];
}

/** A risk-tier-appropriate starting point for a newly registered asset. */
export function defaultAuthorityProfile(): GovernanceAuthorityProfile {
  return {
    accountableOwner: '',
    governanceSponsor: '',
    riskOwner: '',
    technicalOwner: '',
  };
}

/** Completeness across the four mandatory Governance Authority Profile roles. */
export function authorityProfileCompleteness(profile?: GovernanceAuthorityProfile): number {
  if (!profile) return 0;
  const mandatory = [profile.accountableOwner, profile.governanceSponsor, profile.riskOwner, profile.technicalOwner];
  return mandatory.filter(Boolean).length;
}
