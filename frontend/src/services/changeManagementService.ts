/**
 * OMG Phase 10 — Governance Change Management Engine.
 *
 * Approval is not permanent. This module governs the change itself:
 * classification (WS2), impact analysis (WS3), the reassessment rules engine
 * (WS4), approval routing (WS5), the governance state machine (WS7), an
 * immutable change history (WS8) and governance triggers (WS9).
 */

import { addAuditLog, getAssets } from './storageService';
import type {
  ApprovalDecision,
  ApproverRole,
  ChangeApproval,
  ChangeCategory,
  ChangeCategoryDefinition,
  ChangeGovernanceMetrics,
  ChangeHistoryEntry,
  ChangeRequest,
  ChangeRiskTrendPoint,
  ChangeStatus,
  FiredTrigger,
  GovernanceBottleneck,
  GovernanceState,
  GovernanceTriggerRule,
  ImpactArea,
  ImpactAssessment,
  ImpactOutcome,
  ReassessmentRequirement,
  ReassessmentRule,
  StateTransition,
} from '../types/changeManagement';
import {
  INITIAL_CHANGE_REQUESTS,
  INITIAL_STATE_TRANSITIONS,
  INITIAL_TRIGGER_RULES,
} from './changeSeedData';

const KEYS = {
  CHANGES: 'omg_change_requests_v10',
  HISTORY: 'omg_change_history_v10',
  TRANSITIONS: 'omg_state_transitions_v10',
  TRIGGER_RULES: 'omg_trigger_rules_v10',
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return fallback;
  }
}

function write<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

const today = () => new Date().toISOString().split('T')[0];
const nowStamp = () => {
  const now = new Date();
  return `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
};

/* ================== WS2 — Change Classification Engine =================== */

export const CHANGE_CATEGORIES: ChangeCategoryDefinition[] = [
  {
    category: 'Model Change',
    icon: '🧠',
    accent: '#8B5CF6',
    description: 'The underlying model powering the asset is upgraded, replaced or retrained.',
    examples: ['Model Upgrade', 'Model Replacement', 'Model Fine-Tuning'],
    baseWeight: 3,
  },
  {
    category: 'Vendor Change',
    icon: '🔌',
    accent: '#EC4899',
    description: 'The third-party providing the AI capability or its contract terms change.',
    examples: ['Provider Switch', 'Vendor Contract Change', 'Vendor Service Change'],
    baseWeight: 3,
  },
  {
    category: 'Data Change',
    icon: '🗄️',
    accent: '#0EA5E9',
    description: 'The data the asset consumes changes in source, scope or sensitivity.',
    examples: ['New Data Source', 'Additional Data Feed', 'External Data Introduction'],
    baseWeight: 3,
  },
  {
    category: 'Prompt Change',
    icon: '💬',
    accent: '#F59E0B',
    description: 'Prompt, workflow or agent reasoning logic is modified.',
    examples: ['Prompt Update', 'Workflow Update', 'Agent Logic Change'],
    baseWeight: 2,
  },
  {
    category: 'Policy Change',
    icon: '📕',
    accent: '#10B981',
    description: 'A governing policy or regulatory obligation changes for this asset.',
    examples: ['Policy Revision', 'Regulatory Update', 'Compliance Requirement Update'],
    baseWeight: 3,
  },
  {
    category: 'Operational Change',
    icon: '🎛️',
    accent: '#64748B',
    description: 'Monitoring, thresholds or operational controls are adjusted.',
    examples: ['Monitoring Change', 'Alert Threshold Change', 'Control Change'],
    baseWeight: 1,
  },
];

export function getCategoryDefinition(category: ChangeCategory): ChangeCategoryDefinition {
  return CHANGE_CATEGORIES.find(c => c.category === category) || CHANGE_CATEGORIES[0];
}

/* ==================== WS3 — Change Impact Analysis ====================== */

export const IMPACT_AREAS: ImpactArea[] = [
  'Ownership',
  'Risk',
  'Validation',
  'Evidence',
  'Policy',
  'Compliance',
  'Monitoring',
];

export const IMPACT_OUTCOMES: ImpactOutcome[] = [
  'No Impact',
  'Low Impact',
  'Medium Impact',
  'High Impact',
  'Critical Impact',
];

const IMPACT_SCORE: Record<ImpactOutcome, number> = {
  'No Impact': 0,
  'Low Impact': 1,
  'Medium Impact': 2,
  'High Impact': 3,
  'Critical Impact': 4,
};

export const EMPTY_IMPACT: ImpactAssessment = {
  Ownership: 'No Impact',
  Risk: 'No Impact',
  Validation: 'No Impact',
  Evidence: 'No Impact',
  Policy: 'No Impact',
  Compliance: 'No Impact',
  Monitoring: 'No Impact',
};

/**
 * Proposes an impact assessment from the change category and the asset's own
 * risk position. Reviewers can override every line — this is a starting point,
 * not a verdict.
 */
export function proposeImpact(category: ChangeCategory, assetId: string): ImpactAssessment {
  const asset = getAssets().find(a => a.id === assetId);
  const highRisk = asset?.riskLevel === 'High' || asset?.riskLevel === 'Critical';
  const bump = (base: ImpactOutcome): ImpactOutcome => {
    if (!highRisk) return base;
    const i = IMPACT_OUTCOMES.indexOf(base);
    return IMPACT_OUTCOMES[Math.min(IMPACT_OUTCOMES.length - 1, i + 1)];
  };

  const proposal: ImpactAssessment = { ...EMPTY_IMPACT };

  switch (category) {
    case 'Model Change':
      proposal.Risk = bump('High Impact');
      proposal.Validation = bump('High Impact');
      proposal.Evidence = bump('Medium Impact');
      proposal.Monitoring = bump('Medium Impact');
      break;
    case 'Vendor Change':
      proposal.Risk = bump('High Impact');
      proposal.Policy = bump('High Impact');
      proposal.Compliance = bump('High Impact');
      proposal.Evidence = bump('Medium Impact');
      break;
    case 'Data Change':
      proposal.Risk = bump('Medium Impact');
      proposal.Compliance = bump('High Impact');
      proposal.Policy = bump('Medium Impact');
      proposal.Validation = bump('Medium Impact');
      break;
    case 'Prompt Change':
      proposal.Validation = bump('Medium Impact');
      proposal.Monitoring = bump('Low Impact');
      proposal.Risk = bump('Low Impact');
      break;
    case 'Policy Change':
      proposal.Policy = bump('Critical Impact');
      proposal.Compliance = bump('High Impact');
      proposal.Evidence = bump('Medium Impact');
      proposal.Ownership = bump('Low Impact');
      break;
    case 'Operational Change':
      proposal.Monitoring = bump('Medium Impact');
      proposal.Risk = bump('Low Impact');
      break;
  }

  return proposal;
}

/** Weighted 0-100 impact score across the seven governance impact areas. */
export function scoreImpact(impact: ImpactAssessment, category: ChangeCategory): number {
  const areaWeights: Record<ImpactArea, number> = {
    Ownership: 1,
    Risk: 1.6,
    Validation: 1.4,
    Evidence: 1,
    Policy: 1.3,
    Compliance: 1.5,
    Monitoring: 0.9,
  };

  const weightedTotal = IMPACT_AREAS.reduce(
    (sum, area) => sum + IMPACT_SCORE[impact[area]] * areaWeights[area],
    0
  );
  const maxTotal = IMPACT_AREAS.reduce((sum, area) => sum + 4 * areaWeights[area], 0);

  const base = (weightedTotal / maxTotal) * 100;
  // Category weight nudges the score so a model swap never reads as trivial.
  const categoryBoost = getCategoryDefinition(category).baseWeight * 2;

  return Math.min(100, Math.round(base + categoryBoost));
}

/* ================== WS4 — Reassessment Rules Engine ===================== */

export const REASSESSMENT_RULES: ReassessmentRule[] = [
  {
    magnitude: 'Critical',
    requirement: 'Executive Approval Required',
    description:
      'Governance posture materially changes. Executive authority must reapprove before the change proceeds.',
    minScore: 70,
    approvers: [
      'Asset Owner',
      'Reviewer',
      'Risk Manager',
      'Compliance Officer',
      'Governance Lead',
      'Executive Approver',
    ],
  },
  {
    magnitude: 'Major',
    requirement: 'Full Governance Review',
    description:
      'Multiple governance dimensions are affected. The asset re-enters full governance review.',
    minScore: 45,
    approvers: ['Asset Owner', 'Reviewer', 'Risk Manager', 'Governance Lead'],
  },
  {
    magnitude: 'Moderate',
    requirement: 'Risk Review Required',
    description: 'Risk position may shift. A targeted risk review is required before approval.',
    minScore: 20,
    approvers: ['Asset Owner', 'Risk Manager'],
  },
  {
    magnitude: 'Minor',
    requirement: 'No Reassessment',
    description:
      'Governance posture is unchanged. Owner acknowledgement is sufficient to proceed.',
    minScore: 0,
    approvers: ['Asset Owner'],
  },
];

export function resolveReassessment(score: number): ReassessmentRule {
  return (
    REASSESSMENT_RULES.find(rule => score >= rule.minScore) ||
    REASSESSMENT_RULES[REASSESSMENT_RULES.length - 1]
  );
}

/* ====================== WS5 — Approval Routing ========================== */

const ROLE_DEFAULT_APPROVER: Record<ApproverRole, string> = {
  'Asset Owner': 'Marcus Vance',
  Reviewer: 'Dr. Aris Thorne',
  'Governance Lead': 'David Chen',
  'Risk Manager': 'Elena Rostova',
  'Compliance Officer': 'Robert Vance',
  'Executive Approver': 'Sarah Jenkins',
};

/** Builds the approval chain for a change from its reassessment requirement. */
export function routeApprovals(
  requirement: ReassessmentRequirement,
  assetId: string
): ChangeApproval[] {
  const rule =
    REASSESSMENT_RULES.find(r => r.requirement === requirement) ||
    REASSESSMENT_RULES[REASSESSMENT_RULES.length - 1];

  const asset = getAssets().find(a => a.id === assetId);

  return rule.approvers.map(role => ({
    role,
    approver:
      role === 'Asset Owner'
        ? asset?.ownership?.businessOwner || ROLE_DEFAULT_APPROVER[role]
        : role === 'Risk Manager'
          ? asset?.ownership?.riskOwner || ROLE_DEFAULT_APPROVER[role]
          : role === 'Compliance Officer'
            ? asset?.ownership?.complianceOwner || ROLE_DEFAULT_APPROVER[role]
            : ROLE_DEFAULT_APPROVER[role],
    decision: 'Pending' as ApprovalDecision,
  }));
}

/* ===================== WS1 — Change Request Store ======================= */

export function getChangeRequests(): ChangeRequest[] {
  return read<ChangeRequest[]>(KEYS.CHANGES, INITIAL_CHANGE_REQUESTS);
}

export function getChangeRequestById(id: string): ChangeRequest | undefined {
  return getChangeRequests().find(c => c.id === id);
}

export function getChangesForAsset(assetId: string): ChangeRequest[] {
  return getChangeRequests().filter(c => c.assetId === assetId);
}

function persistChanges(changes: ChangeRequest[]): void {
  write(KEYS.CHANGES, changes);
}

function nextChangeRef(existing: ChangeRequest[]): string {
  const highest = existing.reduce((max, c) => {
    const n = parseInt(c.changeRef.replace(/\D/g, ''), 10);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return `CHG-${String(highest + 1).padStart(4, '0')}`;
}

/* ==================== WS8 — Change History & Audit ====================== */

export function getChangeHistory(): ChangeHistoryEntry[] {
  return read<ChangeHistoryEntry[]>(KEYS.HISTORY, []);
}

function appendHistory(entry: Omit<ChangeHistoryEntry, 'id' | 'timestamp'>): void {
  const history = getChangeHistory();
  write(KEYS.HISTORY, [
    { ...entry, id: `chh-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, timestamp: nowStamp() },
    ...history,
  ]);
}

/* =================== WS7 — Governance State Machine ===================== */

/**
 * The enhanced Phase 10 lifecycle. A change request drives an asset out of its
 * steady state and back again through reassessment and reapproval.
 */
export const GOVERNANCE_LIFECYCLE: GovernanceState[] = [
  'Draft',
  'Review',
  'Approved',
  'Production',
  'Monitoring',
  'Change Requested',
  'Impact Assessment',
  'Reassessment',
  'Reapproved',
  'Retirement',
];

export function getStateTransitions(): StateTransition[] {
  return read<StateTransition[]>(KEYS.TRANSITIONS, INITIAL_STATE_TRANSITIONS);
}

export function getTransitionsForAsset(assetId: string): StateTransition[] {
  return getStateTransitions().filter(t => t.assetId === assetId);
}

function recordTransition(transition: Omit<StateTransition, 'id' | 'timestamp'>): void {
  const transitions = getStateTransitions();
  write(KEYS.TRANSITIONS, [
    {
      ...transition,
      id: `stt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: nowStamp(),
    },
    ...transitions,
  ]);
}

/** The governance state an asset is currently in, per the state machine. */
export function getCurrentGovernanceState(assetId: string): GovernanceState {
  const latest = getTransitionsForAsset(assetId)[0];
  if (latest) return latest.toState;

  const asset = getAssets().find(a => a.id === assetId);
  if (!asset) return 'Draft';
  if (asset.status === 'Production') return 'Monitoring';
  if (asset.status === 'Approval') return 'Approved';
  if (asset.status === 'Retirement') return 'Retirement';
  if (asset.status === 'Validation') return 'Review';
  return 'Draft';
}

const STATUS_TO_STATE: Partial<Record<ChangeStatus, GovernanceState>> = {
  Submitted: 'Change Requested',
  'Under Review': 'Impact Assessment',
  Approved: 'Reapproved',
  Implemented: 'Production',
  Closed: 'Monitoring',
};

/* ==================== WS9 — Governance Triggers ========================= */

export function getTriggerRules(): GovernanceTriggerRule[] {
  return read<GovernanceTriggerRule[]>(KEYS.TRIGGER_RULES, INITIAL_TRIGGER_RULES);
}

export function setTriggerRuleEnabled(ruleId: string, enabled: boolean): void {
  const rules = getTriggerRules().map(r => (r.id === ruleId ? { ...r, enabled } : r));
  write(KEYS.TRIGGER_RULES, rules);
}

/**
 * Triggers are evaluated from the change register rather than stored, so the
 * fired list always reflects the current state of governance.
 */
export function getFiredTriggers(): FiredTrigger[] {
  const rules = getTriggerRules().filter(r => r.enabled);
  const changes = getChangeRequests().filter(
    c => c.status !== 'Draft' && c.status !== 'Rejected'
  );

  const fired: FiredTrigger[] = [];

  changes.forEach(change => {
    rules.forEach(rule => {
      if (!rule.categories.includes(change.category)) return;

      // Risk-escalation triggers only arm on genuinely severe changes.
      if (
        rule.condition === 'Critical Risk Increased' &&
        change.magnitude !== 'Critical' &&
        change.impact?.Risk !== 'Critical Impact'
      ) {
        return;
      }

      const severity: FiredTrigger['severity'] =
        change.magnitude === 'Critical'
          ? 'Critical'
          : change.magnitude === 'Major'
            ? 'High'
            : change.magnitude === 'Moderate'
              ? 'Medium'
              : 'Low';

      fired.push({
        id: `ftr-${rule.id}-${change.id}`,
        ruleId: rule.id,
        condition: rule.condition,
        action: rule.action,
        changeId: change.id,
        changeRef: change.changeRef,
        assetId: change.assetId,
        assetName: change.assetName,
        firedAt: change.submittedDate || change.requestedDate,
        detail: `${change.changeRef} (${change.category}) on ${change.assetName} → ${rule.action}.`,
        severity,
      });
    });
  });

  const rank = { Critical: 4, High: 3, Medium: 2, Low: 1 } as const;
  return fired.sort(
    (a, b) => rank[b.severity] - rank[a.severity] || b.firedAt.localeCompare(a.firedAt)
  );
}

/* ======================= Change lifecycle actions ======================= */

export function saveChangeRequest(
  data: Partial<ChangeRequest>,
  actorName = 'Governance Admin',
  actorRole = 'GOVERNANCE_ADMIN'
): ChangeRequest {
  const changes = getChangeRequests();
  const asset = getAssets().find(a => a.id === data.assetId);
  const existingIndex = data.id ? changes.findIndex(c => c.id === data.id) : -1;

  if (existingIndex >= 0) {
    const updated: ChangeRequest = { ...changes[existingIndex], ...data } as ChangeRequest;
    changes[existingIndex] = updated;
    persistChanges(changes);

    appendHistory({
      changeId: updated.id,
      changeRef: updated.changeRef,
      assetId: updated.assetId,
      assetName: updated.assetName,
      action: 'Change request updated',
      actor: actorName,
      actorRole,
      rationale: updated.businessJustification,
    });

    return updated;
  }

  const created: ChangeRequest = {
    id: `chg-${Date.now()}`,
    changeRef: nextChangeRef(changes),
    title: data.title || 'Untitled Change',
    description: data.description || '',
    assetId: data.assetId || '',
    assetName: asset?.name || data.assetName || 'Unknown Asset',
    assetType: asset?.type || data.assetType || 'Application',
    assetRiskLevel: asset?.riskLevel || data.assetRiskLevel || 'Medium',
    requestedBy: data.requestedBy || actorName,
    requestedByRole: data.requestedByRole || actorRole,
    category: data.category || 'Operational Change',
    businessJustification: data.businessJustification || '',
    requestedDate: data.requestedDate || today(),
    status: data.status || 'Draft',
  };

  persistChanges([created, ...changes]);

  appendHistory({
    changeId: created.id,
    changeRef: created.changeRef,
    assetId: created.assetId,
    assetName: created.assetName,
    action: `Change request raised (${created.category})`,
    actor: actorName,
    actorRole,
    rationale: created.businessJustification,
    toStatus: created.status,
  });

  addAuditLog(
    'usr-2',
    actorName,
    actorRole,
    'CHANGE_REQUEST_CREATED',
    'ChangeRequest',
    created.id,
    created.assetName,
    `Raised ${created.changeRef}: ${created.title} (${created.category}) against ${created.assetName}.`
  );

  return created;
}

/** Submit a draft: runs classification, impact analysis, rules and routing. */
export function submitChangeRequest(
  changeId: string,
  impact: ImpactAssessment,
  actorName = 'Governance Admin',
  actorRole = 'GOVERNANCE_ADMIN'
): ChangeRequest | undefined {
  const changes = getChangeRequests();
  const index = changes.findIndex(c => c.id === changeId);
  if (index < 0) return undefined;

  const change = changes[index];
  const score = scoreImpact(impact, change.category);
  const rule = resolveReassessment(score);
  const approvals = routeApprovals(rule.requirement, change.assetId);

  const updated: ChangeRequest = {
    ...change,
    impact,
    impactScore: score,
    magnitude: rule.magnitude,
    reassessment: rule.requirement,
    approvals,
    status: rule.requirement === 'No Reassessment' ? 'Under Review' : 'Submitted',
    submittedDate: today(),
  };

  changes[index] = updated;
  persistChanges(changes);

  const fromState = getCurrentGovernanceState(updated.assetId);
  recordTransition({
    assetId: updated.assetId,
    assetName: updated.assetName,
    fromState,
    toState: 'Change Requested',
    changeId: updated.id,
    changeRef: updated.changeRef,
    actor: actorName,
    reason: `${updated.changeRef} submitted for governance evaluation.`,
  });

  appendHistory({
    changeId: updated.id,
    changeRef: updated.changeRef,
    assetId: updated.assetId,
    assetName: updated.assetName,
    action: `Submitted — classified ${rule.magnitude}, impact score ${score}/100`,
    actor: actorName,
    actorRole,
    rationale: rule.description,
    fromStatus: change.status,
    toStatus: updated.status,
  });

  addAuditLog(
    'usr-2',
    actorName,
    actorRole,
    'CHANGE_REQUEST_SUBMITTED',
    'ChangeRequest',
    updated.id,
    updated.assetName,
    `${updated.changeRef} submitted. Impact ${score}/100, magnitude ${rule.magnitude}, routing: ${rule.requirement}.`
  );

  return updated;
}

/** Move a submitted change into active governance review. */
export function beginReview(
  changeId: string,
  actorName = 'Governance Admin',
  actorRole = 'GOVERNANCE_ADMIN'
): ChangeRequest | undefined {
  const changes = getChangeRequests();
  const index = changes.findIndex(c => c.id === changeId);
  if (index < 0) return undefined;

  const change = changes[index];
  const updated: ChangeRequest = { ...change, status: 'Under Review' };
  changes[index] = updated;
  persistChanges(changes);

  recordTransition({
    assetId: updated.assetId,
    assetName: updated.assetName,
    fromState: 'Change Requested',
    toState: 'Impact Assessment',
    changeId: updated.id,
    changeRef: updated.changeRef,
    actor: actorName,
    reason: `${updated.changeRef} entered governance review.`,
  });

  appendHistory({
    changeId: updated.id,
    changeRef: updated.changeRef,
    assetId: updated.assetId,
    assetName: updated.assetName,
    action: 'Governance review opened',
    actor: actorName,
    actorRole,
    rationale: updated.reassessment || 'Review required',
    fromStatus: change.status,
    toStatus: updated.status,
  });

  return updated;
}

/** Record an individual approver's decision on the routed chain. */
export function recordApproval(
  changeId: string,
  role: ApproverRole,
  decision: Exclude<ApprovalDecision, 'Pending'>,
  notes: string,
  actorName = 'Governance Admin',
  actorRole = 'GOVERNANCE_ADMIN'
): ChangeRequest | undefined {
  const changes = getChangeRequests();
  const index = changes.findIndex(c => c.id === changeId);
  if (index < 0) return undefined;

  const change = changes[index];
  const approvals = (change.approvals || []).map(a =>
    a.role === role ? { ...a, decision, decidedAt: today(), notes } : a
  );

  const anyRejected = approvals.some(a => a.decision === 'Rejected');
  const allApproved = approvals.length > 0 && approvals.every(a => a.decision === 'Approved');

  let status: ChangeStatus = 'Under Review';
  if (anyRejected) status = 'Rejected';
  else if (allApproved) status = 'Approved';

  const updated: ChangeRequest = {
    ...change,
    approvals,
    status,
    decidedDate: anyRejected || allApproved ? today() : change.decidedDate,
    decisionRationale: anyRejected || allApproved ? notes : change.decisionRationale,
  };

  changes[index] = updated;
  persistChanges(changes);

  appendHistory({
    changeId: updated.id,
    changeRef: updated.changeRef,
    assetId: updated.assetId,
    assetName: updated.assetName,
    action: `${role} ${decision.toLowerCase()} the change`,
    actor: actorName,
    actorRole,
    rationale: notes || 'No rationale recorded',
    approvedBy: decision === 'Approved' ? actorName : undefined,
    fromStatus: change.status,
    toStatus: status,
  });

  if (status !== 'Under Review') {
    const toState: GovernanceState = status === 'Approved' ? 'Reapproved' : 'Monitoring';
    recordTransition({
      assetId: updated.assetId,
      assetName: updated.assetName,
      fromState: 'Reassessment',
      toState,
      changeId: updated.id,
      changeRef: updated.changeRef,
      actor: actorName,
      reason:
        status === 'Approved'
          ? `${updated.changeRef} reapproved by the full routed chain.`
          : `${updated.changeRef} rejected; asset remains on its prior approved state.`,
    });

    addAuditLog(
      'usr-2',
      actorName,
      actorRole,
      status === 'Approved' ? 'CHANGE_REQUEST_APPROVED' : 'CHANGE_REQUEST_REJECTED',
      'ChangeRequest',
      updated.id,
      updated.assetName,
      `${updated.changeRef} ${status.toLowerCase()} after ${approvals.length}-stage routing. ${notes}`
    );
  }

  return updated;
}

/** Transition an approved change to Implemented, then Closed. */
export function advanceChangeStatus(
  changeId: string,
  status: ChangeStatus,
  notes: string,
  actorName = 'Governance Admin',
  actorRole = 'GOVERNANCE_ADMIN'
): ChangeRequest | undefined {
  const changes = getChangeRequests();
  const index = changes.findIndex(c => c.id === changeId);
  if (index < 0) return undefined;

  const change = changes[index];
  const updated: ChangeRequest = {
    ...change,
    status,
    implementedDate: status === 'Implemented' ? today() : change.implementedDate,
    closedDate: status === 'Closed' ? today() : change.closedDate,
  };

  changes[index] = updated;
  persistChanges(changes);

  const toState = STATUS_TO_STATE[status];
  if (toState) {
    recordTransition({
      assetId: updated.assetId,
      assetName: updated.assetName,
      fromState: getCurrentGovernanceState(updated.assetId),
      toState,
      changeId: updated.id,
      changeRef: updated.changeRef,
      actor: actorName,
      reason: notes || `${updated.changeRef} moved to ${status}.`,
    });
  }

  appendHistory({
    changeId: updated.id,
    changeRef: updated.changeRef,
    assetId: updated.assetId,
    assetName: updated.assetName,
    action: `Change ${status.toLowerCase()}`,
    actor: actorName,
    actorRole,
    rationale: notes || `Advanced to ${status}`,
    fromStatus: change.status,
    toStatus: status,
  });

  addAuditLog(
    'usr-2',
    actorName,
    actorRole,
    `CHANGE_REQUEST_${status.toUpperCase().replace(/\s+/g, '_')}`,
    'ChangeRequest',
    updated.id,
    updated.assetName,
    `${updated.changeRef} advanced to ${status}. ${notes}`
  );

  return updated;
}

/* ============ WS6 / WS10 — Dashboard & Executive Intelligence =========== */

export function getChangeGovernanceMetrics(): ChangeGovernanceMetrics {
  const changes = getChangeRequests();

  const byCategory = CHANGE_CATEGORIES.reduce<Record<ChangeCategory, number>>(
    (acc, def) => {
      acc[def.category] = changes.filter(c => c.category === def.category).length;
      return acc;
    },
    {} as Record<ChangeCategory, number>
  );

  const statuses: ChangeStatus[] = [
    'Draft',
    'Submitted',
    'Under Review',
    'Approved',
    'Rejected',
    'Implemented',
    'Closed',
  ];
  const byStatus = statuses.reduce<Record<ChangeStatus, number>>(
    (acc, status) => {
      acc[status] = changes.filter(c => c.status === status).length;
      return acc;
    },
    {} as Record<ChangeStatus, number>
  );

  const decided = changes.filter(c => c.submittedDate && c.decidedDate);
  const averageDecisionDays =
    decided.length > 0
      ? Math.round(
          decided.reduce((sum, c) => {
            const from = new Date(c.submittedDate as string).getTime();
            const to = new Date(c.decidedDate as string).getTime();
            return sum + Math.max(0, (to - from) / 86400000);
          }, 0) / decided.length
        )
      : 0;

  return {
    totalChanges: changes.length,
    openChanges: changes.filter(
      c => c.status === 'Draft' || c.status === 'Submitted' || c.status === 'Under Review'
    ).length,
    approvedChanges: byStatus.Approved,
    rejectedChanges: byStatus.Rejected,
    pendingReviews: changes.filter(c => c.status === 'Submitted' || c.status === 'Under Review')
      .length,
    highRiskChanges: changes.filter(
      c => c.assetRiskLevel === 'High' || c.assetRiskLevel === 'Critical'
    ).length,
    criticalChanges: changes.filter(c => c.magnitude === 'Critical').length,
    implementedChanges: byStatus.Implemented,
    closedChanges: byStatus.Closed,
    awaitingReapproval: changes.filter(
      c =>
        (c.status === 'Submitted' || c.status === 'Under Review') &&
        c.reassessment !== 'No Reassessment'
    ).length,
    byCategory,
    byStatus,
    averageDecisionDays,
  };
}

/** WS10 — where change governance is stalling, by approver role. */
export function getGovernanceBottlenecks(): GovernanceBottleneck[] {
  const changes = getChangeRequests().filter(
    c => c.status === 'Submitted' || c.status === 'Under Review'
  );

  const byRole = new Map<ApproverRole, GovernanceBottleneck>();
  const now = Date.now();

  changes.forEach(change => {
    (change.approvals || [])
      .filter(a => a.decision === 'Pending')
      .forEach(approval => {
        const waitDays = change.submittedDate
          ? Math.max(0, Math.round((now - new Date(change.submittedDate).getTime()) / 86400000))
          : 0;

        const existing = byRole.get(approval.role);
        if (existing) {
          existing.pendingCount += 1;
          existing.oldestWaitDays = Math.max(existing.oldestWaitDays, waitDays);
          existing.changeRefs.push(change.changeRef);
        } else {
          byRole.set(approval.role, {
            role: approval.role,
            pendingCount: 1,
            oldestWaitDays: waitDays,
            changeRefs: [change.changeRef],
          });
        }
      });
  });

  return [...byRole.values()].sort(
    (a, b) => b.pendingCount - a.pendingCount || b.oldestWaitDays - a.oldestWaitDays
  );
}

/** WS10 — change and change-risk trend over the last six months. */
export function getChangeRiskTrend(): ChangeRiskTrendPoint[] {
  const changes = getChangeRequests();
  const now = new Date();
  const points: ChangeRiskTrendPoint[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    points.push({
      period: d.toLocaleString('en', { month: 'short' }),
      submitted: changes.filter(c => (c.submittedDate || c.requestedDate).startsWith(key)).length,
      approved: changes.filter(c => (c.decidedDate || '').startsWith(key) && c.status !== 'Rejected')
        .length,
      criticalMagnitude: changes.filter(
        c => (c.submittedDate || c.requestedDate).startsWith(key) && c.magnitude === 'Critical'
      ).length,
    });
  }

  return points;
}

/** WS10 — the critical changes leadership should know about. */
export function getRecentCriticalChanges(limit = 5): ChangeRequest[] {
  return getChangeRequests()
    .filter(
      c =>
        c.magnitude === 'Critical' ||
        c.assetRiskLevel === 'Critical' ||
        c.reassessment === 'Executive Approval Required'
    )
    .sort((a, b) => (b.submittedDate || b.requestedDate).localeCompare(a.submittedDate || a.requestedDate))
    .slice(0, limit);
}

/** Changes an asset is carrying that block a clean approved state. */
export function getPendingReapprovals(): ChangeRequest[] {
  return getChangeRequests().filter(
    c =>
      (c.status === 'Submitted' || c.status === 'Under Review') &&
      c.reassessment &&
      c.reassessment !== 'No Reassessment'
  );
}
