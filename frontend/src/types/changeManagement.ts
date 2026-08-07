/**
 * OMG Phase 10 — Governance Change Management types.
 *
 * Core principle: approval is not permanent. Any significant change to an AI
 * asset must be evaluated, governed and approved before it proceeds.
 */

import type { AssetType, RiskLevel } from './index';

/* ==================== WS1 — Change Request Record ======================== */

export type ChangeStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Implemented'
  | 'Closed';

/* ==================== WS2 — Change Classification ======================== */

export type ChangeCategory =
  | 'Model Change'
  | 'Vendor Change'
  | 'Data Change'
  | 'Prompt Change'
  | 'Policy Change'
  | 'Operational Change';

export interface ChangeCategoryDefinition {
  category: ChangeCategory;
  icon: string;
  accent: string;
  description: string;
  examples: string[];
  /** Baseline governance weight this category carries before impact analysis. */
  baseWeight: number;
}

/* ==================== WS3 — Change Impact Analysis ======================= */

export type ImpactArea =
  | 'Ownership'
  | 'Risk'
  | 'Validation'
  | 'Evidence'
  | 'Policy'
  | 'Compliance'
  | 'Monitoring';

export type ImpactOutcome =
  | 'No Impact'
  | 'Low Impact'
  | 'Medium Impact'
  | 'High Impact'
  | 'Critical Impact';

export type ImpactAssessment = Record<ImpactArea, ImpactOutcome>;

/* ================== WS4 — Reassessment Rules Engine ===================== */

export type ChangeMagnitude = 'Minor' | 'Moderate' | 'Major' | 'Critical';

export type ReassessmentRequirement =
  | 'No Reassessment'
  | 'Risk Review Required'
  | 'Full Governance Review'
  | 'Executive Approval Required';

export interface ReassessmentRule {
  magnitude: ChangeMagnitude;
  requirement: ReassessmentRequirement;
  description: string;
  /** Inclusive lower bound of the computed impact score that triggers this rule. */
  minScore: number;
  approvers: ApproverRole[];
}

/* ====================== WS5 — Approval Routing ========================== */

export type ApproverRole =
  | 'Asset Owner'
  | 'Reviewer'
  | 'Governance Lead'
  | 'Risk Manager'
  | 'Compliance Officer'
  | 'Executive Approver';

export type ApprovalDecision = 'Pending' | 'Approved' | 'Rejected';

export interface ChangeApproval {
  role: ApproverRole;
  approver: string;
  decision: ApprovalDecision;
  decidedAt?: string;
  notes?: string;
}

/* ====================== The change request itself ======================= */

export interface ChangeRequest {
  id: string;
  /** Human-facing reference, e.g. CHG-0007. */
  changeRef: string;
  title: string;
  description: string;
  assetId: string;
  assetName: string;
  assetType: AssetType;
  assetRiskLevel: RiskLevel;
  requestedBy: string;
  requestedByRole: string;
  category: ChangeCategory;
  businessJustification: string;
  requestedDate: string;
  status: ChangeStatus;

  /** WS3 — populated when the impact assessment is performed. */
  impact?: ImpactAssessment;
  /** WS4 — derived from the impact assessment by the rules engine. */
  impactScore?: number;
  magnitude?: ChangeMagnitude;
  reassessment?: ReassessmentRequirement;
  /** WS5 — approval chain derived from the reassessment requirement. */
  approvals?: ChangeApproval[];

  submittedDate?: string;
  decidedDate?: string;
  implementedDate?: string;
  closedDate?: string;
  decisionRationale?: string;
}

/* =================== WS7 — Governance State Machine ===================== */

export type GovernanceState =
  | 'Draft'
  | 'Review'
  | 'Approved'
  | 'Production'
  | 'Monitoring'
  | 'Change Requested'
  | 'Impact Assessment'
  | 'Reassessment'
  | 'Reapproved'
  | 'Retirement';

export interface StateTransition {
  id: string;
  assetId: string;
  assetName: string;
  fromState: GovernanceState;
  toState: GovernanceState;
  changeId?: string;
  changeRef?: string;
  actor: string;
  timestamp: string;
  reason: string;
}

/* =================== WS8 — Change History entry ========================= */

export interface ChangeHistoryEntry {
  id: string;
  changeId: string;
  changeRef: string;
  assetId: string;
  assetName: string;
  /** What changed. */
  action: string;
  /** Who changed it. */
  actor: string;
  actorRole: string;
  /** When it changed. */
  timestamp: string;
  /** Why it changed. */
  rationale: string;
  /** Who approved it, where applicable. */
  approvedBy?: string;
  fromStatus?: ChangeStatus;
  toStatus?: ChangeStatus;
}

/* ==================== WS9 — Governance Triggers ========================= */

export type TriggerCondition =
  | 'Vendor Changed'
  | 'Policy Updated'
  | 'Critical Risk Increased'
  | 'Model Replaced'
  | 'New Data Source Introduced'
  | 'Monitoring Control Changed';

export type TriggerActionType =
  | 'Create Review'
  | 'Identify Affected Assets'
  | 'Executive Escalation'
  | 'Require Revalidation'
  | 'Require Evidence Refresh'
  | 'Notify Compliance';

export interface GovernanceTriggerRule {
  id: string;
  condition: TriggerCondition;
  action: TriggerActionType;
  description: string;
  /** Change categories that arm this trigger. */
  categories: ChangeCategory[];
  enabled: boolean;
}

export interface FiredTrigger {
  id: string;
  ruleId: string;
  condition: TriggerCondition;
  action: TriggerActionType;
  changeId: string;
  changeRef: string;
  assetId: string;
  assetName: string;
  firedAt: string;
  detail: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

/* ============ WS6 / WS10 — Dashboard & Executive Intelligence =========== */

export interface ChangeGovernanceMetrics {
  totalChanges: number;
  openChanges: number;
  approvedChanges: number;
  rejectedChanges: number;
  pendingReviews: number;
  highRiskChanges: number;
  criticalChanges: number;
  implementedChanges: number;
  closedChanges: number;
  awaitingReapproval: number;
  byCategory: Record<ChangeCategory, number>;
  byStatus: Record<ChangeStatus, number>;
  /** Mean days from submission to decision for decided changes. */
  averageDecisionDays: number;
}

export interface GovernanceBottleneck {
  role: ApproverRole;
  pendingCount: number;
  oldestWaitDays: number;
  changeRefs: string[];
}

export interface ChangeRiskTrendPoint {
  period: string;
  submitted: number;
  approved: number;
  criticalMagnitude: number;
}
