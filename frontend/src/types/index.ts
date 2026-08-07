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
  | 'Super Admin'
  | 'Governance Admin'
  | 'Risk Officer'
  | 'Business Owner'
  | 'Viewer';

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

export interface AIAsset {
  id: string;
  name: string;
  type: AssetType;
  description: string;
  department: string;
  version: string;
  status: GovernanceStatus;
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
  entityType: 'Asset' | 'User' | 'Ownership' | 'Risk' | 'Decision';
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
  ownershipCompletionRate: number; // Percentage
  highRiskUnapprovedCount: number;
}
