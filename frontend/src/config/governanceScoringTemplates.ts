/**
 * Governance Assessment Calibration & Consistency Framework (GACF).
 * Initiative 2 — Standardized Scoring Templates. The blueprint's own
 * "Example Structure" gave only three anchor points (1/3/5) and explicitly
 * left the rest to the implementation team; all five are defined here for
 * a genuinely usable rubric. Each level reuses MATURITY_LEVEL_LABELS
 * (types/index.ts) verbatim — Reactive..Optimized — rather than inventing a
 * second five-point scale for this release. One scale, platform-wide, is
 * itself part of what reduces assessor-to-assessor variance.
 */

import { MATURITY_LEVEL_LABELS, type GovernanceAssessmentCategory, type GovernanceMaturityLevel } from '../types';

export interface ScoringTemplate {
  category: GovernanceAssessmentCategory;
  icon: string;
  levels: Record<GovernanceMaturityLevel, string>;
}

export const GOVERNANCE_SCORING_TEMPLATES: ScoringTemplate[] = [
  {
    category: 'Ownership',
    icon: '👤',
    levels: {
      1: 'No named owner for this asset or capability.',
      2: 'An owner exists informally but is not recorded anywhere governance can verify.',
      3: 'A named owner is on record for some but not all mandatory roles.',
      4: 'All mandatory ownership roles are named, current, and verifiable in the registry.',
      5: 'Ownership is complete, current, and reviewed on a defined cadence with succession covered.',
    },
  },
  {
    category: 'Accountability',
    icon: '🧭',
    levels: {
      1: 'No one is answerable for outcomes; failures have no clear owner.',
      2: 'Accountability is assumed informally but not documented.',
      3: 'Accountability is documented for major decisions only.',
      4: 'Accountability is documented and consistently enforced across the portfolio.',
      5: 'Accountability is documented, enforced, and independently verified (e.g. via audit).',
    },
  },
  {
    category: 'Risk Management',
    icon: '⚡',
    levels: {
      1: 'No risk assessment has been performed.',
      2: 'Risk is assessed inconsistently, without a defined method.',
      3: 'Risk is assessed using a defined method for higher-risk assets only.',
      4: 'Risk is assessed consistently across the whole portfolio using a defined method.',
      5: 'Risk assessment is consistent, defined, and re-triggered automatically on material change.',
    },
  },
  {
    category: 'Controls',
    icon: '🧱',
    levels: {
      1: 'No controls are mapped to this asset or obligation.',
      2: 'Controls exist but are not mapped to evidence.',
      3: 'Controls are mapped to evidence for critical obligations only.',
      4: 'Controls are mapped to current, unexpired evidence across the portfolio.',
      5: 'Controls are mapped, evidenced, owned, and tested on a defined cadence.',
    },
  },
  {
    category: 'Monitoring',
    icon: '📡',
    levels: {
      1: 'No ongoing monitoring exists after initial approval.',
      2: 'Monitoring happens reactively, only after an incident.',
      3: 'Scheduled reviews exist but are inconsistently completed.',
      4: 'Scheduled reviews are consistently completed on cadence.',
      5: 'Monitoring is continuous, with drift and exceptions surfaced automatically.',
    },
  },
  {
    category: 'Evidence Management',
    icon: '📄',
    levels: {
      1: 'No evidence is on file.',
      2: 'Evidence exists but is unowned or not traceable to a control.',
      3: 'Evidence exists and is owned, but expiry is not tracked.',
      4: 'Evidence is owned, current, and traceable to the controls it supports.',
      5: 'Evidence is owned, current, traceable, and reused across frameworks where applicable.',
    },
  },
  {
    category: 'Auditability',
    icon: '📜',
    levels: {
      1: 'No audit trail exists for governance decisions.',
      2: 'An audit trail exists but is incomplete or manually assembled.',
      3: 'An audit trail exists for major decisions, automatically captured.',
      4: 'A complete, automatically-captured audit trail exists across the portfolio.',
      5: 'The audit trail is complete, immutable, and independently verifiable end to end.',
    },
  },
  {
    category: 'Escalation',
    icon: '🚨',
    levels: {
      1: 'No escalation path exists for governance exceptions.',
      2: 'An escalation path exists informally, without a defined trigger.',
      3: 'Escalation triggers are defined for critical exceptions only.',
      4: 'Escalation triggers are defined and consistently actioned across the portfolio.',
      5: 'Escalation is defined, actioned, and its timeliness is itself measured.',
    },
  },
  {
    category: 'Change Governance',
    icon: '🔁',
    levels: {
      1: 'Changes to an asset do not trigger any governance reassessment.',
      2: 'Reassessment happens informally, at the requester\'s discretion.',
      3: 'Reassessment triggers are defined for major change categories.',
      4: 'Reassessment triggers are defined and consistently actioned.',
      5: 'Reassessment is defined, actioned, and change impact is scored automatically.',
    },
  },
  {
    category: 'Regulatory Alignment',
    icon: '🌐',
    levels: {
      1: 'No mapping exists between this asset and any regulatory obligation.',
      2: 'Regulatory mapping exists but is not kept current.',
      3: 'Regulatory mapping is current for applicable, in-force sources only.',
      4: 'Regulatory mapping is current, and coverage gaps are tracked.',
      5: 'Regulatory mapping is current, gaps are tracked and closed, and change readiness is monitored.',
    },
  },
];

export function getScoringTemplate(category: GovernanceAssessmentCategory): ScoringTemplate | undefined {
  return GOVERNANCE_SCORING_TEMPLATES.find(t => t.category === category);
}

export { MATURITY_LEVEL_LABELS as SCORING_LEVEL_LABELS };
