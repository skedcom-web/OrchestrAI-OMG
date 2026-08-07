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
  techStack?: string[];
  dataSensitivity?: string;
  validationScore?: number; // 0 - 100
  createdAt: string;
  updatedAt: string;
  lastReviewDate?: string;
  decisionOutcome?: DecisionOutcome;
  tags?: string[];
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
  entityType: 'Asset' | 'User' | 'Ownership' | 'Risk' | 'Decision' | 'Validation' | 'Evidence' | 'Finding' | 'DecisionPackage' | 'ComplianceAssessment' | 'CompliancePackage' | 'KillSwitch' | 'Override' | 'Incident' | 'Retirement';
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
  // Phase 6 Extensions
  activeOperationalAssetsCount: number;
  suspendedAssetsCount: number;
  killSwitchEventsCount: number;
  overridesExecutedCount: number;
  openIncidentsCount: number;
  criticalIncidentsCount: number;
  retiredAssetsCount: number;
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
  id: string; // e.g. 'RBI-001'
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
  type: 'registration' | 'risk' | 'validation' | 'decision' | 'compliance' | 'override' | 'killswitch' | 'retirement';
}
