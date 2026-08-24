/**
 * OMG Release 8 — Governance Intelligence Engine (Actions Edition).
 *
 * Objective 2's Action Recommendation Library (Condition -> tactical
 * action), Objective 3's Action Mapping Engine (Outcome -> procedural
 * action), and Objective 4's Governance Playbooks are all static reference
 * config here — reusable logic, not tenant data, the same reasoning that
 * keeps Release 7's Conditions/Violations/Outcomes computed rather than
 * stored. Deliberately data-in, data-out like every prior release's engine.
 */

import type {
  AIAsset,
  GovernanceConditionType,
  GovernanceFinding,
  GovernanceOutcome,
  GovernanceOutcomeStatus,
  RecommendedActionPriority,
  RecommendedActionType,
} from '../types';

interface ActionTemplate {
  actionType: RecommendedActionType;
  name: string;
  description: string;
}

/** Objective 2 — Action Recommendation Library: one tactical action per condition type. */
export const CONDITION_ACTION_TEMPLATES: Record<GovernanceConditionType, ActionTemplate> = {
  'Evidence Expired': { actionType: 'Validation', name: 'Renew Evidence', description: 'Replace the expired evidence record with a current one.' },
  'Review Overdue': { actionType: 'Review', name: 'Initiate Review', description: 'Start the overdue scheduled governance review.' },
  'Missing Validation': { actionType: 'Validation', name: 'Perform Independent Validation', description: 'Commission an independent validation for this asset.' },
  'Missing Approval': { actionType: 'Approval', name: 'Obtain Governance Approval', description: 'Route the asset for a GO / CONDITIONAL GO / NO GO decision.' },
  'Missing Reauthorization': { actionType: 'Reauthorization', name: 'Initiate Reauthorization', description: 'Reauthorize the asset following its reassessment trigger.' },
  'Missing Owner': { actionType: 'Ownership', name: 'Assign Accountable Owner', description: 'Complete the Governance Authority Profile with a named accountable owner.' },
};

/** Objective 3 — Action Mapping Engine: one procedural action per escalating outcome tier. Compliant and Attention Required need no standing procedural action. */
export const OUTCOME_ACTION_TEMPLATES: Partial<Record<GovernanceOutcomeStatus, ActionTemplate>> = {
  'Review Required': { actionType: 'Review', name: 'Create Governance Review', description: 'Schedule a governance review to address the open findings driving this outcome.' },
  'Reassessment Recommended': { actionType: 'Reassessment', name: 'Initiate Reassessment', description: 'Begin a full reassessment given the asset’s governance state.' },
  'Escalation Recommended': { actionType: 'Escalation', name: 'Escalate To Governance Authority', description: 'Escalate to the governance authority — a critical policy violation or open critical finding was detected.' },
};

const OUTCOME_PRIORITY: Record<GovernanceOutcomeStatus, RecommendedActionPriority> = {
  'Compliant': 'Low',
  'Attention Required': 'Medium',
  'Review Required': 'Medium',
  'Reassessment Recommended': 'High',
  'Escalation Recommended': 'Critical',
};

/** Objective 4 — Governance Playbooks. Reference checklists, not workflow state. */
export const GOVERNANCE_PLAYBOOKS: Record<'Review' | 'Reassessment' | 'Validation', { name: string; steps: string[] }> = {
  Review: { name: 'Review Playbook', steps: ['Create Review', 'Assign Reviewer', 'Collect Evidence', 'Record Outcome'] },
  Reassessment: { name: 'Reassessment Playbook', steps: ['Trigger Assessment', 'Update Risk Classification', 'Review Evidence', 'Reauthorize Asset'] },
  Validation: { name: 'Validation Playbook', steps: ['Assign Validator', 'Perform Validation', 'Capture Evidence', 'Record Result'] },
};

export interface RecommendedActionDraft {
  actionType: RecommendedActionType;
  name: string;
  description: string;
  assetId: string;
  policyId?: string;
  findingId?: string;
  priority: RecommendedActionPriority;
}

/**
 * Generates the draft actions a Recommended Action Engine run would raise
 * right now for one asset: one tactical action per open/under-review
 * Finding (via the Condition library), plus one procedural action for the
 * asset's current Outcome tier if it maps to one (via the Outcome mapping).
 * Recommendation only — nothing here persists or executes; the caller
 * decides which drafts are genuinely new (storageService.generateRecommendedActionsForAsset).
 */
export function generateActionDrafts(asset: AIAsset, findings: GovernanceFinding[], outcome: GovernanceOutcome | null): RecommendedActionDraft[] {
  const drafts: RecommendedActionDraft[] = [];

  findings
    .filter(f => f.status === 'Open' || f.status === 'Under Review')
    .forEach(f => {
      const template = CONDITION_ACTION_TEMPLATES[f.conditionType];
      drafts.push({
        actionType: template.actionType,
        name: template.name,
        description: template.description,
        assetId: asset.id,
        policyId: f.policyId,
        findingId: f.id,
        priority: f.severity,
      });
    });

  if (outcome) {
    const template = OUTCOME_ACTION_TEMPLATES[outcome.status];
    if (template) {
      drafts.push({
        actionType: template.actionType,
        name: template.name,
        description: template.description,
        assetId: asset.id,
        priority: OUTCOME_PRIORITY[outcome.status],
      });
    }
  }

  return drafts;
}
