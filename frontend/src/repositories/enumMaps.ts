/**
 * OMG Release 4 — Persistence Foundation.
 *
 * The frontend domain model uses readable string literals ('Human-in-Command',
 * 'Conditional GO'); the Prisma/Postgres schema uses UPPER_SNAKE_CASE enum
 * members. This module is the single place that translates between them, so
 * the API repository implementations stay simple pass-throughs.
 */

import type {
  AssetType,
  CompliancePackStatus,
  DecisionOutcome,
  EvidenceRecordStatus,
  EvidenceRecordType,
  FindingSeverity,
  GovernanceClassification,
  GovernanceState,
  GovernanceStatus,
  HumanOversightType,
  ObligationControlStatus,
  ObligationStatus,
  PackControlStatus,
  ReassessmentTriggerStatus,
  ReassessmentTriggerType,
  RegulatoryRequirementStatus,
  RegulatorySourceStatus,
  RegulatorySourceType,
  RequirementCriticality,
  RequirementPriority,
  RequirementStatus,
  RiskLevel,
} from '../types';

function toBackend<T extends string>(map: Record<T, string>) {
  return (value: T): string => map[value];
}

function toFrontend<T extends string>(map: Record<T, string>) {
  const reversed = Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k])) as Record<string, T>;
  return (value: string): T => reversed[value];
}

const ASSET_TYPE: Record<AssetType, string> = {
  'Application': 'APPLICATION',
  'Agent': 'AGENT',
  'Model': 'MODEL',
  'LLM': 'LLM',
  'Copilot': 'COPILOT',
  'RAG System': 'RAG_SYSTEM',
  'AI Workflow': 'AI_WORKFLOW',
  'Multi-Agent System': 'MULTI_AGENT_SYSTEM',
  'Third-Party AI Service': 'THIRD_PARTY_SERVICE',
};

const RISK_LEVEL: Record<RiskLevel, string> = { 'Low': 'LOW', 'Medium': 'MEDIUM', 'High': 'HIGH', 'Critical': 'CRITICAL' };

const GOVERNANCE_STATUS: Record<GovernanceStatus, string> = {
  'Draft': 'DRAFT', 'Review': 'REVIEW', 'Validation': 'VALIDATION',
  'Approval': 'APPROVAL', 'Production': 'PRODUCTION', 'Retirement': 'RETIREMENT',
};

const DECISION_OUTCOME: Record<DecisionOutcome, string> = {
  'GO': 'GO', 'CONDITIONAL GO': 'CONDITIONAL_GO', 'NO GO': 'NO_GO', 'PENDING': 'PENDING',
};

const OVERSIGHT_TYPE: Record<HumanOversightType, string> = {
  'Human-in-Command': 'HUMAN_IN_COMMAND',
  'Human-in-the-Loop': 'HUMAN_IN_THE_LOOP',
  'Human-on-the-Loop': 'HUMAN_ON_THE_LOOP',
  'Autonomous with Controls': 'AUTONOMOUS_WITH_CONTROLS',
};

const GOVERNANCE_CLASSIFICATION: Record<GovernanceClassification, string> = {
  'Internal Productivity': 'INTERNAL_PRODUCTIVITY',
  'Customer Facing': 'CUSTOMER_FACING',
  'Decision Support': 'DECISION_SUPPORT',
  'Operational Automation': 'OPERATIONAL_AUTOMATION',
  'Agentic Workflow': 'AGENTIC_WORKFLOW',
  'Regulated AI': 'REGULATED_AI',
};

const GOVERNANCE_STATE: Record<GovernanceState, string> = {
  'Draft': 'DRAFT', 'Submitted': 'SUBMITTED', 'Authorized': 'AUTHORIZED',
  'Monitoring': 'MONITORING', 'Reassessment Required': 'REASSESSMENT_REQUIRED',
  'Conditional GO': 'CONDITIONAL_GO', 'No GO': 'NO_GO', 'Retired': 'RETIRED',
};

const EVIDENCE_TYPE: Record<EvidenceRecordType, string> = {
  'Policy Document': 'POLICY_DOCUMENT',
  'Risk Assessment': 'RISK_ASSESSMENT',
  'Validation Report': 'VALIDATION_REPORT',
  'Approval Record': 'APPROVAL_RECORD',
  'Governance Review': 'GOVERNANCE_REVIEW',
  'Audit Finding': 'AUDIT_FINDING',
  'Incident Report': 'INCIDENT_REPORT',
  'Control Assessment': 'CONTROL_ASSESSMENT',
  'Training Record': 'TRAINING_RECORD',
  'Third-Party Assessment': 'THIRD_PARTY_ASSESSMENT',
};

const EVIDENCE_STATUS: Record<EvidenceRecordStatus, string> = {
  'Draft': 'DRAFT', 'Active': 'ACTIVE', 'Expired': 'EXPIRED', 'Archived': 'ARCHIVED', 'Superseded': 'SUPERSEDED',
};

const TRIGGER_TYPE: Record<ReassessmentTriggerType, string> = {
  'Model Change': 'MODEL_CHANGE',
  'Prompt Change': 'PROMPT_CHANGE',
  'Agent Behavior Change': 'AGENT_BEHAVIOR_CHANGE',
  'New Integration': 'NEW_INTEGRATION',
  'New Tool': 'NEW_TOOL',
  'Data Source Change': 'DATA_SOURCE_CHANGE',
  'Permission Change': 'PERMISSION_CHANGE',
  'Access Scope Change': 'ACCESS_SCOPE_CHANGE',
  'Control Failure': 'CONTROL_FAILURE',
  'Risk Threshold Breach': 'RISK_THRESHOLD_BREACH',
  'Performance Drift': 'PERFORMANCE_DRIFT',
  'Regulatory Change': 'REGULATORY_CHANGE',
  'Policy Change': 'POLICY_CHANGE',
};

const TRIGGER_STATUS: Record<ReassessmentTriggerStatus, string> = {
  'Open': 'OPEN', 'Under Review': 'UNDER_REVIEW', 'Resolved': 'RESOLVED', 'Dismissed': 'DISMISSED',
};

const SEVERITY: Record<FindingSeverity, string> = { 'Low': 'LOW', 'Medium': 'MEDIUM', 'High': 'HIGH', 'Critical': 'CRITICAL' };

const COMPLIANCE_PACK_STATUS: Record<CompliancePackStatus, string> = {
  'Active': 'ACTIVE', 'Draft': 'DRAFT', 'Retired': 'RETIRED',
};

const REQUIREMENT_PRIORITY: Record<RequirementPriority, string> = {
  'Low': 'LOW', 'Medium': 'MEDIUM', 'High': 'HIGH', 'Critical': 'CRITICAL',
};

const REQUIREMENT_STATUS: Record<RequirementStatus, string> = {
  'Draft': 'DRAFT', 'Active': 'ACTIVE', 'Retired': 'RETIRED',
};

const PACK_CONTROL_STATUS: Record<PackControlStatus, string> = {
  'Draft': 'DRAFT', 'Active': 'ACTIVE', 'Retired': 'RETIRED',
};

const REGULATORY_SOURCE_TYPE: Record<RegulatorySourceType, string> = {
  'Regulation': 'REGULATION', 'Standard': 'STANDARD', 'Framework': 'FRAMEWORK',
  'Internal Policy': 'INTERNAL_POLICY', 'Guidance': 'GUIDANCE',
};

const REGULATORY_SOURCE_STATUS: Record<RegulatorySourceStatus, string> = {
  'Draft': 'DRAFT', 'Active': 'ACTIVE', 'Superseded': 'SUPERSEDED', 'Retired': 'RETIRED',
};

const REQUIREMENT_CRITICALITY: Record<RequirementCriticality, string> = {
  'Low': 'LOW', 'Medium': 'MEDIUM', 'High': 'HIGH', 'Critical': 'CRITICAL',
};

const REGULATORY_REQUIREMENT_STATUS: Record<RegulatoryRequirementStatus, string> = {
  'Draft': 'DRAFT', 'Active': 'ACTIVE', 'Retired': 'RETIRED',
};

const OBLIGATION_STATUS: Record<ObligationStatus, string> = {
  'Draft': 'DRAFT', 'Active': 'ACTIVE', 'Retired': 'RETIRED',
};

const OBLIGATION_CONTROL_STATUS: Record<ObligationControlStatus, string> = {
  'Draft': 'DRAFT', 'Active': 'ACTIVE', 'Retired': 'RETIRED',
};

export const enumMaps = {
  assetType: { toBackend: toBackend(ASSET_TYPE), toFrontend: toFrontend(ASSET_TYPE) },
  riskLevel: { toBackend: toBackend(RISK_LEVEL), toFrontend: toFrontend(RISK_LEVEL) },
  governanceStatus: { toBackend: toBackend(GOVERNANCE_STATUS), toFrontend: toFrontend(GOVERNANCE_STATUS) },
  decisionOutcome: { toBackend: toBackend(DECISION_OUTCOME), toFrontend: toFrontend(DECISION_OUTCOME) },
  oversightType: { toBackend: toBackend(OVERSIGHT_TYPE), toFrontend: toFrontend(OVERSIGHT_TYPE) },
  governanceClassification: { toBackend: toBackend(GOVERNANCE_CLASSIFICATION), toFrontend: toFrontend(GOVERNANCE_CLASSIFICATION) },
  governanceState: { toBackend: toBackend(GOVERNANCE_STATE), toFrontend: toFrontend(GOVERNANCE_STATE) },
  evidenceType: { toBackend: toBackend(EVIDENCE_TYPE), toFrontend: toFrontend(EVIDENCE_TYPE) },
  evidenceStatus: { toBackend: toBackend(EVIDENCE_STATUS), toFrontend: toFrontend(EVIDENCE_STATUS) },
  triggerType: { toBackend: toBackend(TRIGGER_TYPE), toFrontend: toFrontend(TRIGGER_TYPE) },
  triggerStatus: { toBackend: toBackend(TRIGGER_STATUS), toFrontend: toFrontend(TRIGGER_STATUS) },
  severity: { toBackend: toBackend(SEVERITY), toFrontend: toFrontend(SEVERITY) },
  compliancePackStatus: { toBackend: toBackend(COMPLIANCE_PACK_STATUS), toFrontend: toFrontend(COMPLIANCE_PACK_STATUS) },
  requirementPriority: { toBackend: toBackend(REQUIREMENT_PRIORITY), toFrontend: toFrontend(REQUIREMENT_PRIORITY) },
  requirementStatus: { toBackend: toBackend(REQUIREMENT_STATUS), toFrontend: toFrontend(REQUIREMENT_STATUS) },
  packControlStatus: { toBackend: toBackend(PACK_CONTROL_STATUS), toFrontend: toFrontend(PACK_CONTROL_STATUS) },
  regulatorySourceType: { toBackend: toBackend(REGULATORY_SOURCE_TYPE), toFrontend: toFrontend(REGULATORY_SOURCE_TYPE) },
  regulatorySourceStatus: { toBackend: toBackend(REGULATORY_SOURCE_STATUS), toFrontend: toFrontend(REGULATORY_SOURCE_STATUS) },
  requirementCriticality: { toBackend: toBackend(REQUIREMENT_CRITICALITY), toFrontend: toFrontend(REQUIREMENT_CRITICALITY) },
  regulatoryRequirementStatus: { toBackend: toBackend(REGULATORY_REQUIREMENT_STATUS), toFrontend: toFrontend(REGULATORY_REQUIREMENT_STATUS) },
  obligationStatus: { toBackend: toBackend(OBLIGATION_STATUS), toFrontend: toFrontend(OBLIGATION_STATUS) },
  obligationControlStatus: { toBackend: toBackend(OBLIGATION_CONTROL_STATUS), toFrontend: toFrontend(OBLIGATION_CONTROL_STATUS) },
};
