export type ThemeMode = 'light' | 'dark' | 'glass';

export type AssetType = 
  | 'Application'
  | 'Agent'
  | 'Model'
  | 'LLM'
  | 'Copilot'
  | 'RAG System'
  | 'AI Workflow'
  | 'Multi-Agent System'
  | 'Third-Party AI Service';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type GovernanceStatus = 
  | 'Draft'
  | 'Review'
  | 'Validation'
  | 'Approval'
  | 'Production'
  | 'Retirement';

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'GOVERNANCE_ADMIN'
  | 'RISK_OFFICER'
  | 'BUSINESS_OWNER'
  | 'VALIDATOR'
  | 'AUDITOR'
  | 'VIEWER';

export type OwnershipRoleType = 
  | 'businessOwner'
  | 'technicalOwner'
  | 'riskOwner'
  | 'complianceOwner'
  | 'approver';

export interface OwnershipAssignment {
  businessOwner?: string; // User ID or Name
  technicalOwner?: string;
  riskOwner?: string;
  complianceOwner?: string;
  approver?: string;
}

export interface RiskAssessmentData {
  id?: string;
  assetId: string;
  assetContextScore: number;
  dataSensitivity: 'Public' | 'Internal' | 'Confidential' | 'Restricted' | 'PII/Sensitive';
  decisionImpact: 'Low' | 'Moderate' | 'High' | 'Critical';
  operationalImpact: 'Low' | 'Moderate' | 'High' | 'Critical';
  controlOversight: 'Automated' | 'Human-in-the-loop' | 'Human-on-the-loop' | 'Full Manual Override';
  overallRiskTier: RiskLevel;
  keyRisks: string[];
  mitigations: string[];
  assessedBy: string;
  assessedAt: string;
}

export type DecisionOutcome = 'GO' | 'CONDITIONAL GO' | 'NO GO' | 'PENDING';

export interface DecisionReadinessChecklist {
  ownershipComplete: boolean;
  riskAssessmentComplete: boolean;
  requiredReviewsComplete: boolean;
  validationComplete: boolean;
  monitoringDefined: boolean;
  auditRequirementsMet: boolean;
  humanOverrideAvailable: boolean;
  killSwitchDefined: boolean;
}

export interface DecisionRecord {
  id: string;
  assetId: string;
  outcome: DecisionOutcome;
  checklist: DecisionReadinessChecklist;
  decisionOwner: string;
  decisionDate: string;
  justification: string;
  conditions?: string[];
}

export type OperationalStatus = 'Planned' | 'Active' | 'Suspended' | 'Under Review' | 'Retired';

/* ------------- RELEASE 1 — Governance Authority Foundation -------------- */
/**
 * Capability 1 — Governance Authority Profile.
 * Accountable Owner, Governance Sponsor, Risk Owner and Technical Owner are
 * mandatory on every asset; the remaining four roles are optional.
 */
export interface GovernanceAuthorityProfile {
  accountableOwner: string;
  governanceSponsor: string;
  riskOwner: string;
  technicalOwner: string;
  complianceOwner?: string;
  humanOverrideAuthority?: string;
  killSwitchAuthority?: string;
  reassessmentAuthority?: string;
}

/** Capability 2 — Human Oversight Classification. */
export type HumanOversightType =
  | 'Human-in-Command'
  | 'Human-in-the-Loop'
  | 'Human-on-the-Loop'
  | 'Autonomous with Controls';

/** Capability 3 — Autonomy Classification, Level 0 (No AI) through Level 5 (High Autonomy). */
export type AutonomyLevel = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Release 1 recommendation, carried forward into Release 2 — Governance
 * Classification. Business context only; reused by Governance Continuity
 * and by future Compliance Packs / RBI / ISO layers. No workflow logic.
 */
export type GovernanceClassification =
  | 'Internal Productivity'
  | 'Customer Facing'
  | 'Decision Support'
  | 'Operational Automation'
  | 'Agentic Workflow'
  | 'Regulated AI';

/**
 * Capability 4 — Authority Matrix. Reference guidance only: baseline oversight
 * and approval expectations by risk tier. No workflow automation in Release 1.
 */
export interface AuthorityMatrixEntry {
  riskLevel: RiskLevel;
  oversightType: HumanOversightType;
  approvalAuthority: string;
}

/* --------------- RELEASE 2 — Governance Continuity Foundation ----------- */

/**
 * Capability 1 — Governance State Model. Tracks whether an asset's
 * authorization remains valid, distinct from `GovernanceStatus` (which
 * tracks pipeline stage — Draft through Production).
 */
export type GovernanceState =
  | 'Draft'
  | 'Submitted'
  | 'Authorized'
  | 'Monitoring'
  | 'Reassessment Required'
  | 'Conditional GO'
  | 'No GO'
  | 'Retired';

/** Capability 3 — Reassessment Trigger Framework baseline trigger types. */
export type ReassessmentTriggerType =
  | 'Model Change'
  | 'Prompt Change'
  | 'Agent Behavior Change'
  | 'New Integration'
  | 'New Tool'
  | 'Data Source Change'
  | 'Permission Change'
  | 'Access Scope Change'
  | 'Control Failure'
  | 'Risk Threshold Breach'
  | 'Performance Drift'
  | 'Regulatory Change'
  | 'Policy Change';

export type ReassessmentTriggerStatus = 'Open' | 'Under Review' | 'Resolved' | 'Dismissed';

export interface ReassessmentTrigger {
  id: string;
  assetId: string;
  assetName: string;
  triggerType: ReassessmentTriggerType;
  dateDetected: string;
  severity: FindingSeverity;
  owner: string;
  status: ReassessmentTriggerStatus;
  comments: string;
}

/** Capability 5 — Governance Reauthorization Record. */
export interface GovernanceReauthorizationRecord {
  id: string;
  assetId: string;
  assetName: string;
  reviewedBy: string;
  reviewDate: string;
  decision: DecisionOutcome;
  reason: string;
  supportingNotes: string;
  previousState: GovernanceState;
  newState: GovernanceState;
}

/* ----------------- RELEASE 3 — Evidence Foundation ----------------------- */

/** Capability 2 — Evidence Types (baseline). */
export type EvidenceRecordType =
  | 'Policy Document'
  | 'Risk Assessment'
  | 'Validation Report'
  | 'Approval Record'
  | 'Governance Review'
  | 'Audit Finding'
  | 'Incident Report'
  | 'Control Assessment'
  | 'Training Record'
  | 'Third-Party Assessment';

/** Capability 5 — Evidence Lifecycle. */
export type EvidenceRecordStatus = 'Draft' | 'Active' | 'Expired' | 'Archived' | 'Superseded';

/** Capability 6 — Evidence Expiry Tracking indicator. */
export type EvidenceExpiryIndicator = 'Valid' | 'Expiring Soon' | 'Expired' | 'No Expiry Set';

/** Capability 3 — Evidence Ownership. */
export interface EvidenceOwnership {
  evidenceOwner: string;
  businessOwner?: string;
  reviewer?: string;
  approvalAuthority?: string;
}

/**
 * Capability 4 — Evidence Traceability. Loose references (id + label) rather
 * than strict foreign keys, since not every linked record type is guaranteed
 * to exist for a given evidence record.
 */
export interface EvidenceTraceability {
  riskAssessmentRef?: string;
  governanceReviewRef?: string;
  decisionRecordRef?: string;
  reauthorizationRecordRef?: string;
  timelineEventRef?: string;
}

/** Capability 1 — Evidence Registry. The universal governance evidence object. */
export interface EvidenceRecord {
  id: string;
  name: string;
  evidenceType: EvidenceRecordType;
  status: EvidenceRecordStatus;
  createdDate: string;
  expiryDate?: string;
  description: string;
  assetId: string;
  assetName: string;
  ownership: EvidenceOwnership;
  traceability?: EvidenceTraceability;
}

/** Capability 7 — Evidence Timeline event. */
export interface EvidenceTimelineEvent {
  id: string;
  evidenceId: string;
  timestamp: string;
  event: 'Created' | 'Updated' | 'Reviewed' | 'Approved' | 'Expired' | 'Archived';
  actor: string;
  details: string;
}

/* ------------------ RELEASE 4 — Readiness Foundation --------------------- */

export type ReadinessStatus = 'Ready' | 'Partially Ready' | 'Not Ready';

export interface GovernanceReadinessResult {
  status: ReadinessStatus;
  ownershipAssigned: boolean;
  oversightAssigned: boolean;
  autonomyAssigned: boolean;
  governanceStateValid: boolean;
}

export interface EvidenceReadinessResult {
  status: ReadinessStatus;
  evidenceExists: boolean;
  evidenceOwnershipExists: boolean;
  evidenceNotExpired: boolean;
}

export interface ReviewReadinessResult {
  status: ReadinessStatus;
  reviewsScheduled: boolean;
  reviewsCompleted: boolean;
  reassessmentsUpToDate: boolean;
}

export interface AuditReadinessResult {
  status: ReadinessStatus;
  governanceRecordsAvailable: boolean;
  evidenceAvailable: boolean;
  traceabilityAvailable: boolean;
}

export type GovernanceGapType =
  | 'Missing Owner'
  | 'Missing Oversight'
  | 'Missing Autonomy'
  | 'Missing Evidence'
  | 'Expired Evidence'
  | 'Missing Review'
  | 'Missing Reauthorization';

export interface GovernanceGap {
  assetId: string;
  assetName: string;
  gapType: GovernanceGapType;
  detail: string;
}

/* -------------- RELEASE 5 — Universal Compliance Pack Framework --------- */
/**
 * The reusable architecture every future regulation (RBI, ISO 42001, EU AI
 * Act, ...) plugs into as configuration — packs, requirements, controls and
 * evidence mappings — not platform redesign. No regulation content, no
 * scoring: Capability 5 is explicit that coverage is Covered / Partially
 * Covered / Not Covered / Not Applicable only.
 */

export type CompliancePackStatus = 'Active' | 'Draft' | 'Retired';

/** Capability 1 — Compliance Pack Registry. */
export interface CompliancePack {
  id: string;
  name: string;
  version: string;
  status: CompliancePackStatus;
  owner: string;
  description: string;
  industry: string;
  effectiveDate: string;
}

export type RequirementPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type RequirementStatus = 'Draft' | 'Active' | 'Retired';

/** Capability 2 — Requirement Registry. */
export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  packId: string;
  packName: string;
  category: string;
  priority: RequirementPriority;
  status: RequirementStatus;
}

export type PackControlStatus = 'Draft' | 'Active' | 'Retired';

/** Capability 3 — Control Registry. */
export interface PackControl {
  id: string;
  name: string;
  description: string;
  requirementId: string;
  requirementName: string;
  owner: string;
  status: PackControlStatus;
}

/**
 * Capability 4 — Evidence Mapping Framework. Requirement → Control →
 * Evidence, so one evidence record can be collected once and reused across
 * every pack that needs it.
 */
export interface EvidenceMapping {
  id: string;
  controlId: string;
  controlName: string;
  evidenceId: string;
  evidenceName: string;
}

/** Capability 5 — Compliance Coverage. No percentages, no scores. */
export type ComplianceCoverageStatus = 'Covered' | 'Partially Covered' | 'Not Covered' | 'Not Applicable';

export interface ComplianceCoverageResult {
  status: ComplianceCoverageStatus;
  controlsTotal: number;
  controlsCovered: number;
}

/** Capability 6 — Compliance Gap Register. */
export type PackGapType = 'Missing Evidence' | 'Missing Control' | 'Missing Owner' | 'Expired Evidence' | 'Missing Review';

export interface PackGap {
  packId: string;
  packName: string;
  requirementId?: string;
  controlId?: string;
  gapType: PackGapType;
  detail: string;
}

/**
 * Release 6 — Universal Regulatory Knowledge & Obligation Engine (Foundation
 * Edition). Generalizes Release 5's Pack -> Requirement -> Control ->
 * Evidence chain one layer deeper: Source -> Requirement -> Obligation ->
 * Control -> Evidence. No RBI/ISO/EU AI Act/NIST content — foundation only,
 * so a future regulation onboards as data, not a platform redesign. No
 * scoring: coverage is Covered / Partially Covered / Not Covered / Not
 * Applicable only, same as every prior release.
 */

export type RegulatorySourceType = 'Regulation' | 'Standard' | 'Framework' | 'Internal Policy' | 'Guidance';
export type RegulatorySourceStatus = 'Draft' | 'Active' | 'Superseded' | 'Retired';

/** Capability 1 — Regulatory Source Registry. */
export interface RegulatorySource {
  id: string;
  name: string;
  sourceType: RegulatorySourceType;
  jurisdiction: string;
  industry: string;
  version: string;
  effectiveDate: string;
  reviewDate?: string;
  status: RegulatorySourceStatus;
}

export type RequirementCriticality = 'Low' | 'Medium' | 'High' | 'Critical';
export type RegulatoryRequirementStatus = 'Draft' | 'Active' | 'Retired';

/** Capability 2 — Requirement Registry. */
export interface RegulatoryRequirement {
  id: string;
  name: string;
  description: string;
  category: string;
  criticality: RequirementCriticality;
  status: RegulatoryRequirementStatus;
  sourceId: string;
  sourceName: string;
}

export type ObligationStatus = 'Draft' | 'Active' | 'Retired';

/** Capability 3 — Obligation Engine: translates a requirement into actionable obligations. */
export interface Obligation {
  id: string;
  name: string;
  description: string;
  owner: string;
  status: ObligationStatus;
  requirementId: string;
  requirementName: string;
}

export type ObligationControlStatus = 'Draft' | 'Active' | 'Retired';

/** Capability 4 — Control Mapping Engine: maps an obligation to the OMG control that satisfies it. */
export interface ObligationControl {
  id: string;
  name: string;
  description: string;
  owner: string;
  status: ObligationControlStatus;
  obligationId: string;
  obligationName: string;
}

/** Capability 5 — Evidence Mapping Engine: Control -> Evidence, reusing Release 3's Evidence Registry. */
export interface ObligationEvidenceMapping {
  id: string;
  controlId: string;
  controlName: string;
  evidenceId: string;
  evidenceName: string;
}

/** Capability 6 — Coverage Engine. No percentages, no maturity scores. */
export interface RegulatoryCoverageResult {
  status: ComplianceCoverageStatus;
  controlsTotal: number;
  controlsCovered: number;
}

/** Capability 7 — Gap Engine. */
export type RegulatoryGapType = 'Missing Control' | 'Missing Evidence' | 'Missing Review' | 'Missing Approval' | 'Missing Ownership';

export interface RegulatoryGap {
  sourceId: string;
  sourceName: string;
  requirementId?: string;
  obligationId?: string;
  controlId?: string;
  gapType: RegulatoryGapType;
  detail: string;
}

/**
 * Release 7 — Governance Intelligence Engine (Foundation Edition). Moves OMG
 * from governance records to governance reasoning: Policy -> Condition ->
 * Violation -> Finding -> Outcome, every outcome explainable. Detection and
 * recommendation only — no automatic state changes (Release 8's scope).
 * Named GovernancePolicy/GovernanceFinding, not Policy/Finding, to avoid
 * colliding with the existing Phase 9 Policy and Phase 3 Finding concepts,
 * which are different, unrelated objects.
 */

/** Objective 2 — Condition Engine. Detected live from existing governance data, never persisted. */
export type GovernanceConditionType =
  | 'Evidence Expired'
  | 'Review Overdue'
  | 'Missing Approval'
  | 'Missing Owner'
  | 'Missing Validation'
  | 'Missing Reauthorization';

export interface GovernanceCondition {
  assetId: string;
  assetName: string;
  conditionType: GovernanceConditionType;
  detail: string;
}

export type GovernancePolicySeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type GovernancePolicyStatus = 'Draft' | 'Active' | 'Retired';

/** Objective 1 — Policy Registry. */
export interface GovernancePolicy {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: GovernancePolicySeverity;
  status: GovernancePolicyStatus;
  /** The condition type that activates this policy (Objective 3 — Governance Rule Engine). */
  triggerCondition: GovernanceConditionType;
  obligationId?: string;
  obligationName?: string;
  linkedControlIds: string[];
}

/** Objective 3 — Governance Rule Engine output: a policy evaluated true against a detected condition. */
export interface GovernancePolicyViolation {
  policyId: string;
  policyName: string;
  assetId: string;
  assetName: string;
  conditionType: GovernanceConditionType;
  detail: string;
  severity: GovernancePolicySeverity;
}

export type GovernanceFindingStatus = 'Open' | 'Under Review' | 'Accepted Risk' | 'Resolved';

/** Objective 4 — Findings Engine. Persisted with a manually-managed lifecycle. */
export interface GovernanceFinding {
  id: string;
  assetId: string;
  assetName: string;
  policyId: string;
  policyName: string;
  conditionType: GovernanceConditionType;
  severity: GovernancePolicySeverity;
  status: GovernanceFindingStatus;
  detail: string;
  createdDate: string;
  resolutionDate?: string;
  resolutionNotes?: string;
}

/** Objective 5 — Governance Outcome Engine. Recommendations only, no automatic state changes. */
export type GovernanceOutcomeStatus = 'Compliant' | 'Attention Required' | 'Review Required' | 'Reassessment Recommended' | 'Escalation Recommended';

/** Objective 6 — Explainability Layer: `reasons` is why the outcome was generated, folded directly into the outcome. */
export interface GovernanceOutcome {
  assetId: string;
  assetName: string;
  status: GovernanceOutcomeStatus;
  reasons: string[];
}

/**
 * Release 8 — Governance Intelligence Engine (Actions Edition). The bridge
 * between Governance Intelligence and Governance Execution: Outcome ->
 * Recommended Action, with a human Accept / Reject / Defer decision layer.
 * Recommendation-driven, not automation-driven — nothing here executes
 * automatically or changes an asset's governance state.
 */

export type RecommendedActionType = 'Review' | 'Reassessment' | 'Validation' | 'Approval' | 'Reauthorization' | 'Ownership' | 'Escalation';
export type RecommendedActionPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type RecommendedActionStatus = 'Open' | 'Accepted' | 'Deferred' | 'Rejected' | 'In Progress' | 'Completed';

/** Objective 1 — Recommended Action Engine. */
export interface RecommendedAction {
  id: string;
  actionType: RecommendedActionType;
  name: string;
  description: string;
  assetId: string;
  assetName: string;
  policyId?: string;
  policyName?: string;
  findingId?: string;
  priority: RecommendedActionPriority;
  owner?: string;
  dueDate?: string;
  status: RecommendedActionStatus;
  /** Release 9 — Objective 6 made traceable: set only when a human actually decided (Accept / Reject / Defer). */
  decidedBy?: string;
  decidedAt?: string;
  createdAt?: string;
}

/**
 * Release 10 — Governance Intelligence Studio (Customer Configuration
 * Edition). Converts the parts of the reasoning engine that were hardcoded
 * config into genuinely editable Neon-backed rules — "configure governance
 * logic without code changes." Condition -> Policy is already data (Release
 * 7's GovernancePolicy.triggerCondition); this covers Policy -> Outcome
 * (enable/disable a tier) and Outcome/Condition -> Action (the Action
 * Recommendation Library, made editable), plus the Condition catalogue and
 * Customer Governance Profiles.
 */

/** Objective 3 — Condition Designer. */
export interface ConditionDefinition {
  id: string;
  conditionType: GovernanceConditionType;
  label: string;
  description: string;
  defaultSeverity: GovernancePolicySeverity;
  enabled: boolean;
}

/** Objective 4 — Outcome Designer. Severity order is a platform primitive; only enabled/disabled per tier is configurable. */
export interface OutcomeRule {
  id: string;
  outcomeStatus: GovernanceOutcomeStatus;
  description: string;
  enabled: boolean;
}

export type ActionRuleTriggerType = 'Condition' | 'Outcome';

/** Objectives 5 & 6 — Action Designer and the Outcome/Condition -> Action leg of the Rule Mapping Engine. */
export interface ActionRule {
  id: string;
  triggerType: ActionRuleTriggerType;
  triggerValue: string;
  actionType: RecommendedActionType;
  actionName: string;
  actionDescription: string;
  enabled: boolean;
}

/** Objective 8 — Customer Governance Profiles. Exactly one active at a time. */
export interface GovernanceProfile {
  id: string;
  name: string;
  industry: string;
  description: string;
  isActive: boolean;
}

export interface AIAsset {
  id: string;
  name: string;
  type: AssetType;
  description: string;
  department: string;
  version: string;
  status: GovernanceStatus;
  operationalStatus?: OperationalStatus;
  riskLevel: RiskLevel;
  ownership: OwnershipAssignment;
  /** Release 1 — Governance Authority Profile. */
  authorityProfile?: GovernanceAuthorityProfile;
  /** Release 1 — how humans supervise this asset. */
  oversightType?: HumanOversightType;
  /** Release 1 — autonomy exposure, Level 0-5. */
  autonomyLevel?: AutonomyLevel;
  /** Release 1 (carried forward into Release 2) — business context. */
  governanceClassification?: GovernanceClassification;
  /** Release 2 — whether this asset's authorization remains valid. */
  governanceState?: GovernanceState;
  /** Release 2 — next scheduled governance review date. */
  nextReviewDate?: string;
  techStack?: string[];
  dataSensitivity?: string;
  validationScore?: number; // 0 - 100
  createdAt: string;
  updatedAt: string;
  lastReviewDate?: string;
  decisionOutcome?: DecisionOutcome;
  tags?: string[];
  /** Q1 Stabilization — Phase 3: soft delete/archive model. Deletion never removes the row. */
  isArchived?: boolean;
  archivedAt?: string;
  archivedBy?: string;
  archiveReason?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
  status: 'Active' | 'Inactive';
  lastLogin?: string;
  assignedAssetsCount?: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: 'Asset' | 'User' | 'Ownership' | 'Risk' | 'Decision' | 'Validation' | 'Evidence' | 'Finding' | 'DecisionPackage' | 'ComplianceAssessment' | 'CompliancePackage' | 'KillSwitch' | 'Override' | 'Incident' | 'Retirement' | 'ScheduledReview' | 'CorrectiveAction' | 'GovernanceReviewPackage' | 'Policy' | 'PolicyMapping' | 'PolicyViolation' | 'ExecutiveReport' | 'ChangeRequest' | 'StateTransition' | 'ReassessmentTrigger' | 'GovernanceReauthorizationRecord' | 'EvidenceRecord';
  entityId: string;
  entityName: string;
  details: string;
  ipAddress?: string;
}

export interface GovernanceMetrics {
  totalAssets: number;
  assetsByType: Record<AssetType, number>;
  riskBreakdown: Record<RiskLevel, number>;
  statusBreakdown: Record<GovernanceStatus, number>;
  pendingReviewsCount: number;
  pendingValidationCount: number;
  decisionBreakdown: Record<DecisionOutcome, number>;
  ownershipCompletionRate: number;
  highRiskUnapprovedCount: number;
  totalValidations: number;
  passedValidations: number;
  failedValidations: number;
  openFindingsCount: number;
  totalEvidenceCount: number;
  readyAssetsCount: number;
  conditionallyReadyAssetsCount: number;
  notReadyAssetsCount: number;
  totalBlockersCount: number;
  tenantComplianceScore: number; // 0-100%
  rbiAlignmentPercentage: number; // 0-100%
  compliantAssetsCount: number;
  partiallyCompliantAssetsCount: number;
  nonCompliantAssetsCount: number;
  openComplianceGapsCount: number;
  activeOperationalAssetsCount: number;
  suspendedAssetsCount: number;
  killSwitchEventsCount: number;
  overridesExecutedCount: number;
  openIncidentsCount: number;
  criticalIncidentsCount: number;
  retiredAssetsCount: number;
  // Phase 7 Extensions
  tenantGovernanceHealthScore: number; // 0-100%
  healthyAssetsCount: number;
  watchlistAssetsCount: number;
  attentionRequiredAssetsCount: number;
  activeGovernanceAlertsCount: number;
  upcomingReviewsCount: number;
  openCorrectiveActionsCount: number;
  // Release 1 — Governance Authority Foundation
  oversightBreakdown: Record<HumanOversightType, number>;
  autonomyBreakdown: Record<AutonomyLevel, number>;
  authorityProfileCompletionRate: number; // 0-100%
  // Release 2 — Governance Continuity Foundation
  governanceStateBreakdown: Record<GovernanceState, number>;
  governanceClassificationBreakdown: Record<GovernanceClassification, number>;
  reassessmentsDueCount: number;
  reviewsDueCount: number;
  // Release 3 — Evidence Foundation
  evidenceRecordsByType: Record<EvidenceRecordType, number>;
  evidenceRecordsByStatus: Record<EvidenceRecordStatus, number>;
  expiringEvidenceCount: number;
  expiredEvidenceCount: number;
  // Release 4 — Readiness Foundation
  governanceReadinessBreakdown: Record<ReadinessStatus, number>;
  evidenceReadinessBreakdown: Record<ReadinessStatus, number>;
  reviewReadinessBreakdown: Record<ReadinessStatus, number>;
  auditReadinessBreakdown: Record<ReadinessStatus, number>;
  totalGovernanceGapsCount: number;
  // Release 5 — Universal Compliance Pack Framework
  activeCompliancePacksCount: number;
  packCoverageBreakdown: Record<ComplianceCoverageStatus, number>;
  totalPackGapsCount: number;
  // Release 6 — Universal Regulatory Knowledge & Obligation Engine
  activeRegulatorySourcesCount: number;
  requirementsByCategory: Record<string, number>;
  sourceCoverageBreakdown: Record<ComplianceCoverageStatus, number>;
  totalRegulatoryGapsCount: number;
  topMissingControls: { name: string; requirementName: string }[];
  // Release 7 — Governance Intelligence Engine
  openGovernanceFindingsCount: number;
  findingsBySeverity: Record<GovernancePolicySeverity, number>;
  topTriggeredPolicies: { policyName: string; count: number }[];
  assetsRequiringAttentionCount: number;
  recommendedReviewsCount: number;
  // Release 8 — Governance Intelligence Engine (Actions Edition)
  openActionsCount: number;
  highPriorityActionsCount: number;
  overdueActionsCount: number;
  actionsByStatus: Record<RecommendedActionStatus, number>;
  actionsByOwner: { owner: string; count: number }[];
  // Release 9 — Governance Decision Traceability Engine
  traceRecordsCount: number;
  topDecisionDrivers: { conditionType: GovernanceConditionType; count: number }[];
  humanDecisionStats: { accepted: number; rejected: number; deferred: number };
}

export interface PersonaDemoUser {
  role: UserRole;
  title: string;
  name: string;
  email: string;
  department: string;
  description: string;
  icon: string;
  allowedNav: string[];
}

// ------------------- PHASE 3 TYPES -------------------

export type ValidationCategory = 
  | 'Business'
  | 'Technical'
  | 'Security'
  | 'Compliance'
  | 'Operational'
  | 'Model';

export type ValidationStatus = 'Draft' | 'In Review' | 'Approved' | 'Rejected';

export interface ValidationRecord {
  id: string;
  assetId: string;
  assetName: string;
  category: ValidationCategory;
  reviewer: string;
  reviewerRole: UserRole;
  reviewDate: string;
  status: ValidationStatus;
  score: number;
  findings: string;
  recommendations: string;
  evidenceRefs: string[];
}

export type EvidenceCategory = 
  | 'Business Evidence'
  | 'Technical Evidence'
  | 'Security Evidence'
  | 'Compliance Evidence'
  | 'Operational Evidence'
  | 'Model Evidence';

export type EvidenceStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Archived';

export type GovernanceDeliverableType = 
  | 'Executive Solution Blueprint'
  | 'Functional Requirements Specification'
  | 'Solution Architecture Blueprint'
  | 'Database Design Document'
  | 'API Design Specification'
  | 'Security Review Document'
  | 'Test Strategy & Evidence'
  | 'Deployment Blueprint'
  | 'Production Readiness Assessment'
  | 'Project Closure Report';

export interface EvidenceDocument {
  id: string;
  title: string;
  category: EvidenceCategory;
  deliverableType: GovernanceDeliverableType;
  assetId: string;
  assetName: string;
  uploadedBy: string;
  uploadDate: string;
  version: string;
  status: EvidenceStatus;
  fileUrl?: string;
  description: string;
}

export type FindingSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type FindingStatus = 'Open' | 'In Progress' | 'Resolved' | 'Verified';

export interface Finding {
  id: string;
  title: string;
  assetId: string;
  assetName: string;
  severity: FindingSeverity;
  status: FindingStatus;
  assignedTo: string;
  reportedBy: string;
  reportedDate: string;
  description: string;
  resolutionNotes?: string;
}

// ------------------- PHASE 4 TYPES -------------------

export interface PillarScoreDetail {
  score: number;
  passed: boolean;
  message: string;
}

export type GovernanceReadinessTier = 'Ready' | 'Conditionally Ready' | 'Not Ready';

export interface GovernanceScoreBreakdown {
  ownership: PillarScoreDetail;
  risk: PillarScoreDetail;
  validation: PillarScoreDetail;
  evidence: PillarScoreDetail;
  findings: PillarScoreDetail;
  overallScore: number;
  readinessTier: GovernanceReadinessTier;
  recommendedOutcome: DecisionOutcome;
}

export interface GovernanceBlocker {
  id: string;
  assetId: string;
  assetName: string;
  category: 'Ownership' | 'Risk' | 'Validation' | 'Evidence' | 'Findings';
  blockerMessage: string;
  severity: 'Critical' | 'High' | 'Medium';
  remediationPath: string;
}

export interface DecisionPackage {
  id: string;
  assetId: string;
  assetName: string;
  assetType: AssetType;
  generatedAt: string;
  generatedBy: string;
  governanceScore: number;
  readinessTier: GovernanceReadinessTier;
  recommendedOutcome: DecisionOutcome;
  actualOutcome: DecisionOutcome;
  justification: string;
  deliverablesCount: number;
  findingsCount: number;
  ownersSummary: OwnershipAssignment;
}

// ------------------- PHASE 5 TYPES -------------------

export type ComplianceEvaluationStatus = 'Compliant' | 'Partially Compliant' | 'Non-Compliant' | 'Not Applicable';

export type ComplianceControlCategory = 
  | 'RBI AI Governance'
  | 'Information Security'
  | 'Data Privacy'
  | 'Model Risk Management'
  | 'Enterprise Policy';

export interface ComplianceControl {
  id: string;
  controlName: string;
  category: ComplianceControlCategory;
  source: 'RBI Standards' | 'Internal Policy';
  description: string;
  mandatory: boolean;
}

export interface ComplianceAssessmentRecord {
  id: string;
  assetId: string;
  assetName: string;
  controlId: string;
  controlName: string;
  status: ComplianceEvaluationStatus;
  score: number;
  evidenceRefs: string[];
  assessor: string;
  assessedDate: string;
  notes: string;
}

export interface ComplianceGap {
  id: string;
  assetId: string;
  assetName: string;
  controlId: string;
  controlName: string;
  severity: FindingSeverity;
  status: 'Open' | 'In Progress' | 'Remediated';
  remediationNotes: string;
}

export interface CompliancePackage {
  id: string;
  assetId: string;
  assetName: string;
  generatedAt: string;
  generatedBy: string;
  complianceScore: number;
  status: 'Compliant' | 'Partially Compliant' | 'Non-Compliant';
  controlsEvaluatedCount: number;
  evidenceCount: number;
  openGapsCount: number;
}

// ------------------- PHASE 6 TYPES -------------------

export type KillSwitchTriggerCategory = 
  | 'Critical Incident'
  | 'Compliance Violation'
  | 'Security Breach'
  | 'Model Failure'
  | 'Unauthorized Behavior'
  | 'Executive Directive';

export type KillSwitchStatus = 
  | 'Requested'
  | 'Approved'
  | 'Activated'
  | 'Under Investigation'
  | 'Released';

export interface KillSwitchRecord {
  id: string;
  assetId: string;
  assetName: string;
  triggerCategory: KillSwitchTriggerCategory;
  status: KillSwitchStatus;
  requestedBy: string;
  approvedBy: string;
  activatedAt: string;
  reason: string;
  resolutionNotes?: string;
}

export interface OverrideRecord {
  id: string;
  assetId: string;
  assetName: string;
  triggerReason: string;
  requestedBy: string;
  approvedBy: string;
  timestamp: string;
  actionTaken: string;
}

export type IncidentType = 
  | 'Model Drift'
  | 'Hallucination Event'
  | 'Security Incident'
  | 'Compliance Breach'
  | 'Operational Failure';

export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentStatus = 'Open' | 'Investigating' | 'Mitigation' | 'Resolved' | 'Closed';

export interface GovernanceIncident {
  id: string;
  assetId: string;
  assetName: string;
  title: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reportedBy: string;
  assignedTo: string;
  createdAt: string;
  description: string;
  resolutionNotes?: string;
}

export type RetirementReason = 
  | 'End of Life'
  | 'Regulatory Requirement'
  | 'Business Decision'
  | 'Technology Replacement'
  | 'Risk Decision';

export interface RetirementRecord {
  id: string;
  assetId: string;
  assetName: string;
  reason: RetirementReason;
  requestedBy: string;
  approvedBy: string;
  retiredAt: string;
  evidenceArchivedCount: number;
  notes: string;
}

export interface GovernanceTimelineEvent {
  id: string;
  assetId: string;
  timestamp: string;
  stage: string;
  actor: string;
  details: string;
  type: 'registration' | 'risk' | 'validation' | 'decision' | 'compliance' | 'override' | 'killswitch' | 'retirement'
    // Release 2 — Governance Continuity
    | 'authorized' | 'trigger' | 'review' | 'reauthorization';
}

// ------------------- PHASE 7 TYPES -------------------

export type GovernanceHealthStatus = 'Healthy' | 'Watchlist' | 'Attention Required';

export interface GovernanceHealthBreakdown {
  ownershipHealth: PillarScoreDetail;
  riskHealth: PillarScoreDetail;
  validationHealth: PillarScoreDetail;
  complianceHealth: PillarScoreDetail;
  operationalHealth: PillarScoreDetail;
  overallHealthScore: number; // 0 - 100
  healthStatus: GovernanceHealthStatus;
}

export interface GovernanceAlert {
  id: string;
  assetId: string;
  assetName: string;
  alertType: 'Validation Expired' | 'Compliance Review Overdue' | 'Risk Review Overdue' | 'Critical Incident Open' | 'Kill Switch Event' | 'Unresolved Critical Finding';
  severity: FindingSeverity;
  createdAt: string;
  message: string;
  resolutionPath: string;
}

export type ReviewType = 'Monthly Review' | 'Quarterly Review' | 'Semiannual Review' | 'Annual Review' | 'Ad Hoc Review' | 'Incident Review' | 'Executive Review';
export type ReviewStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';

export interface ScheduledReview {
  id: string;
  assetId: string;
  assetName: string;
  reviewType: ReviewType;
  owner: string;
  dueDate: string;
  status: ReviewStatus;
  outcome?: string;
}

export type CorrectiveActionStatus = 'Open' | 'Assigned' | 'In Progress' | 'Completed' | 'Verified';

export interface CorrectiveAction {
  id: string;
  assetId: string;
  assetName: string;
  title: string;
  status: CorrectiveActionStatus;
  severity: FindingSeverity;
  assignedTo: string;
  dueDate: string;
  description: string;
  verificationNotes?: string;
}

export interface GovernanceReviewPackage {
  id: string;
  assetId: string;
  assetName: string;
  generatedAt: string;
  generatedBy: string;
  healthScore: number;
  healthStatus: GovernanceHealthStatus;
  openIncidentsCount: number;
  openActionsCount: number;
}

// ------------------- PHASE 8 TYPES -------------------

/**
 * The eight-stage OMG governance journey. Every AI asset travels this path
 * and Phase 8C visualises the portfolio's position across it.
 */
export type JourneyStageKey =
  | 'asset'
  | 'ownership'
  | 'risk'
  | 'validation'
  | 'evidence'
  | 'decision'
  | 'production'
  | 'monitoring';

export interface GovernanceJourneyStage {
  key: JourneyStageKey;
  label: string;
  icon: string;
  /** What this stage proves. */
  purpose: string;
  /** Assets that have reached (or must pass) this stage. */
  total: number;
  approved: number;
  pending: number;
  blocked: number;
  /** Percentage of in-scope assets that have cleared this stage. */
  clearanceRate: number;
}

export type JourneyStageState = 'approved' | 'pending' | 'blocked';

export interface AssetJourneyPosition {
  assetId: string;
  assetName: string;
  assetType: AssetType;
  riskLevel: RiskLevel;
  /** Furthest stage cleared, 0-indexed against the eight stages. */
  currentStageIndex: number;
  currentStageLabel: string;
  stageStates: Record<JourneyStageKey, JourneyStageState>;
  governanceScore: number;
  healthScore: number;
  blockerCount: number;
}

export type ComplianceReadinessTier = 'Audit Ready' | 'Review Required' | 'Non-Compliant';

export interface ExecutiveKpiSnapshot {
  totalGovernedAssets: number;
  productionApprovedAssets: number;
  highRiskAssets: number;
  pendingReviews: number;
  governanceBlockers: number;
  activeDecisions: number;
  complianceHealth: number;
  auditReadiness: number;
}

export interface RiskHeatmapCell {
  category: string;
  riskLevel: RiskLevel;
  count: number;
}

// ------------------- PHASE 9 TYPES -------------------
// Executive Governance Hub & Policy Governance

export type PolicyCategory =
  | 'Governance Policies'
  | 'Risk Policies'
  | 'Security Policies'
  | 'Privacy Policies'
  | 'Vendor Policies';

export type PolicyStatus = 'Active' | 'Draft' | 'Under Review' | 'Retired';

export interface Policy {
  id: string;
  /** Human-facing policy reference, e.g. POL-GOV-001. */
  policyRef: string;
  name: string;
  category: PolicyCategory;
  owner: string;
  ownerRole: string;
  effectiveDate: string;
  reviewDate: string;
  status: PolicyStatus;
  description: string;
  /** Mandatory policies produce a violation whenever their control fails. */
  mandatory: boolean;
  /** Enforcement rule key used to auto-detect violations from governance state. */
  enforcementRule?: PolicyEnforcementRule;
}

/**
 * Enforcement rules let a policy be evaluated against live governance state
 * rather than relying on manually logged violations only.
 */
export type PolicyEnforcementRule =
  | 'REQUIRE_FULL_OWNERSHIP'
  | 'REQUIRE_DECISION_BEFORE_PRODUCTION'
  | 'REQUIRE_VALIDATION_FOR_HIGH_RISK'
  | 'REQUIRE_EVIDENCE_FOR_PRODUCTION'
  | 'REQUIRE_HUMAN_OVERSIGHT_HIGH_RISK'
  | 'REQUIRE_PERIODIC_REVIEW'
  | 'REQUIRE_VENDOR_REVIEW';

export type PolicyTargetType =
  | 'AI Asset'
  | 'Asset Type'
  | 'Vendor'
  | 'Business Unit';

export interface PolicyMapping {
  id: string;
  policyId: string;
  policyName: string;
  targetType: PolicyTargetType;
  /** Asset id, asset type name, vendor name or business unit name. */
  targetId: string;
  targetName: string;
  mappedBy: string;
  mappedDate: string;
  notes?: string;
}

export type PolicyViolationStatus =
  | 'Open'
  | 'Under Review'
  | 'Accepted'
  | 'Remediated'
  | 'Closed';

export type PolicyViolationSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface PolicyViolation {
  id: string;
  policyId: string;
  policyName: string;
  violationType: string;
  assetId: string;
  assetName: string;
  severity: PolicyViolationSeverity;
  owner: string;
  detectionDate: string;
  status: PolicyViolationStatus;
  description: string;
  remediationNotes?: string;
  /** Auto-detected violations are derived from live state and cannot be deleted. */
  autoDetected?: boolean;
}

/* ---------------------- Governance Scorecards (WS2) ---------------------- */

export interface ScorecardMetric {
  label: string;
  value: number;
  tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export interface GovernanceScorecard {
  id: 'ownership' | 'risk' | 'validation' | 'evidence' | 'decision';
  title: string;
  icon: string;
  /** 0-100 rollup for this governance dimension. */
  score: number;
  metrics: ScorecardMetric[];
  /** Where an executive goes to act on this scorecard. */
  actionPath: string;
}

/* ------------------- Executive Governance Hub (WS1) --------------------- */

export interface AiEstateSummary {
  totalAssets: number;
  applications: number;
  agents: number;
  models: number;
  copilots: number;
  ragSystems: number;
  thirdPartyAi: number;
}

export type ExecutiveAlertType =
  | 'Critical Risk'
  | 'Missing Ownership'
  | 'Policy Violation'
  | 'Expired Review';

export interface ExecutiveAlert {
  id: string;
  type: ExecutiveAlertType;
  severity: PolicyViolationSeverity;
  assetId: string;
  assetName: string;
  message: string;
  actionPath: string;
}

export interface GovernanceHealthIndex {
  score: number;
  band: 'Strong' | 'Stable' | 'Fragile' | 'Critical';
  dimensions: { label: string; score: number; weight: number }[];
}

/* ----------------------- Executive Heatmaps (WS6) ----------------------- */

export interface HeatmapMatrixRow {
  label: string;
  icon?: string;
  cells: Record<RiskLevel, number>;
  total: number;
  /** Governance health of this slice, 0-100. */
  health: number;
}

/* ---------------------- Governance Insights (WS7) ----------------------- */

export interface TrendPoint {
  period: string;
  value: number;
}

export interface GovernanceTrendSeries {
  id: string;
  label: string;
  icon: string;
  points: TrendPoint[];
  /** Positive direction means "up is good". */
  higherIsBetter: boolean;
  unit?: string;
}

export interface ExecutiveInsight {
  id: string;
  title: string;
  detail: string;
  count: number;
  severity: PolicyViolationSeverity;
  actionLabel: string;
  actionPath: string;
}

/* ------------------ Board & Regulator Reporting (WS8) ------------------- */

export interface ExecutiveGovernanceReport {
  id: string;
  generatedAt: string;
  generatedBy: string;
  inventory: AiEstateSummary;
  riskSummary: Record<RiskLevel, number>;
  policyCompliance: {
    totalPolicies: number;
    activePolicies: number;
    openViolations: number;
    complianceRate: number;
  };
  decisions: Record<DecisionOutcome, number>;
  outstandingActions: number;
  governanceHealthScore: number;
}

export interface AuditReadinessReport {
  id: string;
  generatedAt: string;
  generatedBy: string;
  evidenceStatus: { complete: number; missing: number; reviewRequired: number };
  approvalHistoryCount: number;
  decisionHistoryCount: number;
  reviewHistoryCount: number;
  auditReadinessScore: number;
}

/* ------------------- Role-Based Executive Views (WS9) ------------------- */

export type ExecutiveViewId = 'cio' | 'cro' | 'compliance' | 'board';

export interface ExecutiveViewDefinition {
  id: ExecutiveViewId;
  label: string;
  audience: string;
  icon: string;
  question: string;
  /** Ordered section keys rendered for this view. */
  sections: string[];
}
