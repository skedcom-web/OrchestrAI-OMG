/**
 * OMG Release 4.1 — Seed script.
 *
 * "Demo Mode does NOT mean local storage. Demo Mode means seeded data in the
 * real production database." This populates Neon with the same demo dataset
 * the frontend previously only kept in `mockData.ts` / localStorage, so a
 * fresh browser or machine sees identical content by reading it from the API.
 *
 * Idempotent: does nothing if AIAsset already has rows (run once per
 * environment; re-run only after a deliberate reset).
 *
 * Run with: node prisma/seed.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const users = [
  { name: 'Sarah Jenkins', email: 'sarah.jenkins@enterprise-bank.com', role: 'SUPER_ADMIN', department: 'Enterprise AI & Architecture' },
  { name: 'David Chen', email: 'david.chen@enterprise-bank.com', role: 'GOVERNANCE_ADMIN', department: 'AI Governance Office' },
  { name: 'Elena Rostova', email: 'elena.rostova@enterprise-bank.com', role: 'RISK_OFFICER', department: 'Model Risk Management' },
  { name: 'Marcus Vance', email: 'marcus.vance@enterprise-bank.com', role: 'BUSINESS_OWNER', department: 'Retail Banking & Wealth' },
  { name: 'Dr. Aris Thorne', email: 'aris.thorne@enterprise-bank.com', role: 'VALIDATOR', department: 'AI Validation & Testing Center' },
  { name: 'Robert Vance', email: 'robert.vance@enterprise-bank.com', role: 'AUDITOR', department: 'Internal Audit & Compliance' },
  { name: 'Claire Sterling', email: 'claire.sterling@enterprise-bank.com', role: 'VIEWER', department: 'Executive Board Observer' },
];

// Keyed by the demo id used in frontend/src/services/mockData.ts, so evidence/
// trigger/review records below can reference the right asset by that key.
const assets = [
  {
    key: 'ast-101',
    name: 'Fraud Detection Sentinel Agent',
    type: 'AGENT',
    description: 'Autonomous agent monitoring real-time transactions for fraud anomalies using graph embeddings.',
    department: 'Cyber Security & Fraud',
    version: '2.4.0',
    status: 'PRODUCTION',
    operationalStatus: 'Active',
    riskLevel: 'CRITICAL',
    techStack: ['Python', 'PyTorch', 'Kafka', 'Neo4j'],
    dataSensitivity: 'PII/Sensitive',
    validationScore: 94,
    decisionOutcome: 'GO',
    tags: ['Real-Time', 'Autonomous', 'High-Impact'],
    ownershipJson: { businessOwner: 'Marcus Vance', technicalOwner: 'Sarah Jenkins', riskOwner: 'Elena Rostova', complianceOwner: 'David Chen', approver: 'David Chen' },
    accountableOwner: 'Marcus Vance', governanceSponsor: 'David Chen', authorityRiskOwner: 'Elena Rostova', authorityTechnicalOwner: 'Sarah Jenkins',
    humanOverrideAuthority: 'Marcus Vance', killSwitchAuthority: 'Sarah Jenkins', reassessmentAuthority: 'David Chen',
    oversightType: 'HUMAN_IN_COMMAND', autonomyLevel: 4,
    governanceClassification: 'AGENTIC_WORKFLOW', governanceState: 'MONITORING', nextReviewDate: '2026-08-20',
  },
  {
    key: 'ast-102',
    name: 'Retail Credit Scoring Engine',
    type: 'MODEL',
    description: 'Machine learning model calculating credit risk scores for personal loan underwriting.',
    department: 'Retail Credit & Underwriting',
    version: '3.1.2',
    status: 'VALIDATION',
    operationalStatus: 'Under Review',
    riskLevel: 'HIGH',
    techStack: ['XGBoost', 'Scikit-Learn', 'FastAPI'],
    dataSensitivity: 'Confidential',
    validationScore: 88,
    decisionOutcome: 'CONDITIONAL_GO',
    tags: ['Credit', 'Regulated', 'Underwriting'],
    ownershipJson: { businessOwner: 'Marcus Vance', technicalOwner: 'Sarah Jenkins', riskOwner: 'Elena Rostova', complianceOwner: 'David Chen' },
    accountableOwner: 'Marcus Vance', governanceSponsor: 'David Chen', authorityRiskOwner: 'Elena Rostova', authorityTechnicalOwner: 'Sarah Jenkins', authorityComplianceOwner: 'David Chen',
    oversightType: 'HUMAN_IN_COMMAND', autonomyLevel: 2,
    governanceClassification: 'REGULATED_AI', governanceState: 'CONDITIONAL_GO', nextReviewDate: '2026-09-15',
  },
  {
    key: 'ast-103',
    name: 'Customer Concierge Copilot',
    type: 'COPILOT',
    description: 'LLM-powered conversational assistant helping branch reps resolve customer inquiries.',
    department: 'Customer Operations',
    version: '1.2.0',
    status: 'PRODUCTION',
    operationalStatus: 'Active',
    riskLevel: 'MEDIUM',
    techStack: ['Azure OpenAI', 'LangChain', 'React'],
    dataSensitivity: 'Internal',
    validationScore: 91,
    decisionOutcome: 'GO',
    tags: ['Customer Service', 'LLM', 'Copilot'],
    ownershipJson: { businessOwner: 'Marcus Vance', technicalOwner: 'Sarah Jenkins', riskOwner: 'Elena Rostova', complianceOwner: 'David Chen', approver: 'David Chen' },
    accountableOwner: 'Marcus Vance', governanceSponsor: 'David Chen', authorityRiskOwner: 'Elena Rostova', authorityTechnicalOwner: 'Sarah Jenkins', authorityComplianceOwner: 'David Chen',
    humanOverrideAuthority: 'Marcus Vance',
    oversightType: 'HUMAN_IN_THE_LOOP', autonomyLevel: 1,
    governanceClassification: 'CUSTOMER_FACING', governanceState: 'MONITORING', nextReviewDate: '2026-08-15',
  },
  {
    key: 'ast-104',
    name: 'AML Regulatory Intelligence RAG',
    type: 'RAG_SYSTEM',
    description: 'Retrieval-augmented generation system querying financial crime compliance regulations.',
    department: 'Financial Crime & AML',
    version: '1.0.4',
    status: 'REVIEW',
    operationalStatus: 'Planned',
    riskLevel: 'HIGH',
    techStack: ['Pinecone', 'LlamaIndex', 'GPT-4o'],
    dataSensitivity: 'Confidential',
    validationScore: 82,
    decisionOutcome: 'PENDING',
    tags: ['AML', 'Compliance', 'RAG'],
    ownershipJson: { businessOwner: 'David Chen', technicalOwner: 'David Chen', riskOwner: 'Elena Rostova' },
    accountableOwner: 'David Chen', governanceSponsor: 'Sarah Jenkins', authorityRiskOwner: 'Elena Rostova', authorityTechnicalOwner: 'David Chen',
    oversightType: 'HUMAN_IN_COMMAND', autonomyLevel: 2,
    governanceClassification: 'DECISION_SUPPORT', governanceState: 'SUBMITTED', nextReviewDate: '2026-09-01',
  },
  {
    key: 'ast-105',
    name: 'Mortgage Document Intelligence Workflow',
    type: 'AI_WORKFLOW',
    description: 'Automated OCR & extraction pipeline parsing applicant income docs and tax returns.',
    department: 'Mortgage Services',
    version: '2.0.1',
    status: 'PRODUCTION',
    operationalStatus: 'Active',
    riskLevel: 'MEDIUM',
    techStack: ['AWS Textract', 'Python', 'Temporal'],
    dataSensitivity: 'PII/Sensitive',
    validationScore: 95,
    decisionOutcome: 'GO',
    tags: ['Document AI', 'Workflow', 'Mortgage'],
    ownershipJson: { businessOwner: 'Marcus Vance', technicalOwner: 'Sarah Jenkins', riskOwner: 'Elena Rostova', complianceOwner: 'David Chen', approver: 'David Chen' },
    accountableOwner: 'Marcus Vance', governanceSponsor: 'David Chen', authorityRiskOwner: 'Elena Rostova', authorityTechnicalOwner: 'Sarah Jenkins', authorityComplianceOwner: 'David Chen',
    reassessmentAuthority: 'David Chen',
    oversightType: 'HUMAN_IN_THE_LOOP', autonomyLevel: 3,
    governanceClassification: 'OPERATIONAL_AUTOMATION', governanceState: 'MONITORING', nextReviewDate: '2026-11-30',
  },
  {
    key: 'ast-106',
    name: 'Enterprise Portfolio Multi-Agent System',
    type: 'MULTI_AGENT_SYSTEM',
    description: 'Multi-agent orchestration swarm conducting automated stress testing & asset rebalancing.',
    department: 'Capital Markets & Wealth',
    version: '0.9.1',
    status: 'DRAFT',
    operationalStatus: 'Suspended',
    riskLevel: 'CRITICAL',
    techStack: ['AutoGen', 'CrewAI', 'Python'],
    dataSensitivity: 'Restricted',
    validationScore: 65,
    decisionOutcome: 'NO_GO',
    tags: ['Trading', 'Multi-Agent', 'High-Risk'],
    ownershipJson: { businessOwner: 'Marcus Vance', technicalOwner: 'Sarah Jenkins' },
    accountableOwner: 'Marcus Vance', governanceSponsor: 'Sarah Jenkins', authorityRiskOwner: 'Elena Rostova', authorityTechnicalOwner: 'Sarah Jenkins',
    humanOverrideAuthority: 'Elena Rostova', killSwitchAuthority: 'Sarah Jenkins', reassessmentAuthority: 'David Chen',
    oversightType: 'HUMAN_IN_COMMAND', autonomyLevel: 5,
    governanceClassification: 'AGENTIC_WORKFLOW', governanceState: 'NO_GO', nextReviewDate: '2026-08-25',
  },
];

const evidenceByAssetKey = {
  'ast-101': [
    { name: 'Fraud Sentinel Agent — Independent Validation Report', evidenceType: 'VALIDATION_REPORT', status: 'ACTIVE', createdDate: '2026-07-28', expiryDate: '2027-07-28', description: 'Independent validation of fraud detection accuracy, bias and security posture.', evidenceOwner: 'Dr. Aris Thorne', businessOwner: 'Marcus Vance', reviewer: 'David Chen', approvalAuthority: 'Sarah Jenkins', decisionRecordRef: 'Decision Authority Gatekeeper — GO' },
    { name: 'Fraud Sentinel Agent — Kill Switch Control Assessment', evidenceType: 'CONTROL_ASSESSMENT', status: 'ACTIVE', createdDate: '2026-08-11', expiryDate: '2026-09-10', description: 'Assessment of the emergency kill switch and circuit-breaker control for the agent.', evidenceOwner: 'Elena Rostova', reviewer: 'Sarah Jenkins' },
  ],
  'ast-102': [
    { name: 'Credit Scoring Engine — Risk Assessment', evidenceType: 'RISK_ASSESSMENT', status: 'ACTIVE', createdDate: '2026-03-10', expiryDate: '2027-03-10', description: 'Formal risk tiering covering data sensitivity, decision impact and operational impact.', evidenceOwner: 'Elena Rostova', businessOwner: 'Marcus Vance', approvalAuthority: 'David Chen', riskAssessmentRef: 'High Risk Tier — RiskAssessment' },
    { name: 'Credit Scoring Engine — Conditional GO Approval Record', evidenceType: 'APPROVAL_RECORD', status: 'ACTIVE', createdDate: '2026-08-05', description: 'Approval record for the Conditional GO decision following model-change reassessment.', evidenceOwner: 'David Chen', approvalAuthority: 'David Chen', decisionRecordRef: 'CONDITIONAL GO — 2026-08-05' },
  ],
  'ast-103': [
    { name: 'Concierge Copilot — Agent Handling Training Record', evidenceType: 'TRAINING_RECORD', status: 'ACTIVE', createdDate: '2026-02-20', expiryDate: '2026-08-25', description: 'Branch representative training on AI-assisted customer handling and escalation.', evidenceOwner: 'Marcus Vance', reviewer: 'David Chen' },
    { name: 'Concierge Copilot — Data Handling Policy', evidenceType: 'POLICY_DOCUMENT', status: 'ACTIVE', createdDate: '2026-02-01', expiryDate: '2027-01-01', description: 'Internal policy governing customer data handling within the copilot conversation flow.', evidenceOwner: 'David Chen', approvalAuthority: 'David Chen' },
  ],
  'ast-104': [
    { name: 'AML RAG — Vendor Data Provider Assessment', evidenceType: 'THIRD_PARTY_ASSESSMENT', status: 'DRAFT', createdDate: '2026-08-06', description: 'Assessment of the third-party financial crime data provider feeding the RAG index.', evidenceOwner: 'David Chen', reviewer: 'Elena Rostova' },
    { name: 'AML RAG — Q2 Governance Review', evidenceType: 'GOVERNANCE_REVIEW', status: 'EXPIRED', createdDate: '2026-05-01', expiryDate: '2026-08-01', description: 'Quarterly governance review of the AML regulatory intelligence RAG system.', evidenceOwner: 'Elena Rostova', reviewer: 'David Chen' },
  ],
  'ast-105': [
    { name: 'Mortgage Workflow — OCR Control Assessment', evidenceType: 'CONTROL_ASSESSMENT', status: 'ACTIVE', createdDate: '2026-06-30', expiryDate: '2027-06-30', description: 'Control assessment of document extraction accuracy and human review checkpoints.', evidenceOwner: 'Sarah Jenkins', businessOwner: 'Marcus Vance' },
    { name: 'Mortgage Workflow — Legacy Extraction Audit Finding', evidenceType: 'AUDIT_FINDING', status: 'ARCHIVED', createdDate: '2026-04-15', description: 'Closed audit finding on an earlier document extraction accuracy gap, now remediated.', evidenceOwner: 'Robert Vance' },
  ],
  'ast-106': [
    { name: 'Multi-Agent System — Consensus Loop Incident Report', evidenceType: 'INCIDENT_REPORT', status: 'ACTIVE', createdDate: '2026-08-06', description: 'Incident report for the swarm consensus volatility anomaly during stress testing.', evidenceOwner: 'Dr. Aris Thorne', reviewer: 'Sarah Jenkins', timelineEventRef: 'Swarm Consensus Loop Volatility Anomaly — inc-601' },
    { name: 'Multi-Agent System — Pre-Incident Validation Report', evidenceType: 'VALIDATION_REPORT', status: 'SUPERSEDED', createdDate: '2026-07-15', expiryDate: '2026-08-06', description: 'Original validation report, superseded following the circuit-breaker finding.', evidenceOwner: 'Dr. Aris Thorne' },
  ],
};

const triggersByAssetKey = {
  'ast-102': [{ triggerType: 'MODEL_CHANGE', dateDetected: '2026-08-01', severity: 'HIGH', owner: 'Elena Rostova (Risk Officer)', status: 'RESOLVED', comments: 'Underlying XGBoost model retrained on updated bureau data. Reassessment required before continued use in underwriting decisions.' }],
  'ast-106': [{ triggerType: 'CONTROL_FAILURE', dateDetected: '2026-08-06', severity: 'CRITICAL', owner: 'Sarah Jenkins (Super Admin)', status: 'OPEN', comments: 'Swarm consensus circuit breaker missing. Reassessment required before any production consideration.' }],
};

const reauthorizationsByAssetKey = {
  'ast-102': [{ reviewedBy: 'David Chen (Governance Admin)', reviewDate: '2026-08-05', decision: 'CONDITIONAL_GO', reason: 'Model change validated. Retrained model shows acceptable bias and performance drift within tolerance under continued monitoring.', supportingNotes: 'Conditional on monthly drift monitoring and quarterly revalidation until full reauthorization.', previousState: 'REASSESSMENT_REQUIRED', newState: 'CONDITIONAL_GO' }],
};

const reviewsByAssetKey = {
  'ast-101': [{ reviewType: 'Quarterly Review', owner: 'Elena Rostova', dueDate: '2026-08-20', status: 'Scheduled' }],
  'ast-103': [{ reviewType: 'Monthly Review', owner: 'David Chen', dueDate: '2026-08-15', status: 'In Progress' }],
};

// Release 5.1 — Compliance Persistence Alignment. The three demo packs from
// frontend/src/services/mockData.ts, now seeded into Neon so "the demo runs
// entirely from Neon" per Capability 7. Evidence mappings reference evidence
// records looked up by name (not a remembered id), since compliance seeding
// can run in a later pass than asset/evidence seeding once Neon already has
// rows — see the idByKey vs. by-name distinction in main() below.
async function seedCompliance() {
  const existingPackCount = await prisma.compliancePack.count();
  if (existingPackCount > 0) {
    console.log(`Skipping compliance seed — CompliancePack already has ${existingPackCount} row(s).`);
    return;
  }

  console.log('Seeding compliance packs, requirements, controls and evidence mappings...');

  const packs = [
    {
      id: 'pack-rbi-demo', name: 'RBI Demo Pack', version: '1.0', status: 'ACTIVE', owner: 'David Chen',
      description: 'Sample pack illustrating how a banking regulator framework plugs into the Compliance Pack Framework. Structure only — not real RBI content.',
      industry: 'Banking & Financial Services', effectiveDate: '2026-01-01',
    },
    {
      id: 'pack-iso-demo', name: 'ISO Demo Pack', version: '1.0', status: 'ACTIVE', owner: 'Elena Rostova',
      description: 'Sample pack illustrating a cross-industry management-system standard. Structure only — not real ISO 42001 content.',
      industry: 'Cross-Industry', effectiveDate: '2026-02-01',
    },
    {
      id: 'pack-euai-demo', name: 'EU AI Demo Pack', version: '0.1', status: 'DRAFT', owner: 'Robert Vance',
      description: 'Sample pack illustrating a risk-tiered regional regulation. Structure only — not real EU AI Act content.',
      industry: 'Cross-Industry · EU Operations', effectiveDate: '2026-06-01',
    },
  ];
  for (const p of packs) {
    const { effectiveDate, ...rest } = p;
    await prisma.compliancePack.create({ data: { ...rest, effectiveDate: new Date(effectiveDate) } });
  }

  const requirements = [
    { id: 'RBI-REQ-001', name: 'Named Accountable Ownership', description: 'Every in-scope AI system must have named, accountable ownership on record.', packId: 'pack-rbi-demo', category: 'Governance', priority: 'CRITICAL', status: 'ACTIVE' },
    { id: 'RBI-REQ-002', name: 'Independent Control Assessment', description: 'In-scope AI systems must undergo independent control assessment.', packId: 'pack-rbi-demo', category: 'Validation', priority: 'HIGH', status: 'ACTIVE' },
    { id: 'ISO-REQ-101', name: 'AI Management System Documentation', description: 'A documented AI management system policy must be maintained.', packId: 'pack-iso-demo', category: 'Documentation', priority: 'HIGH', status: 'ACTIVE' },
    { id: 'ISO-REQ-102', name: 'Risk Assessment Process', description: 'A repeatable risk assessment process must be documented and evidenced.', packId: 'pack-iso-demo', category: 'Risk', priority: 'HIGH', status: 'ACTIVE' },
    { id: 'EUAI-REQ-210', name: 'High-Risk System Human Oversight', description: 'High-risk AI systems must have documented human oversight arrangements.', packId: 'pack-euai-demo', category: 'Oversight', priority: 'CRITICAL', status: 'DRAFT' },
  ];
  for (const r of requirements) {
    await prisma.complianceRequirement.create({ data: r });
  }

  const controls = [
    { id: 'ctl-rbi-001a', name: 'Ownership Matrix Control', description: 'Verifies every in-scope asset has a complete Governance Authority Profile.', requirementId: 'RBI-REQ-001', owner: 'David Chen', status: 'ACTIVE' },
    { id: 'ctl-rbi-002a', name: 'Independent Assessment Control', description: 'Verifies an independent control assessment has been performed and filed.', requirementId: 'RBI-REQ-002', owner: 'Dr. Aris Thorne', status: 'ACTIVE' },
    { id: 'ctl-iso-101a', name: 'AIMS Policy Control', description: 'Verifies a current AI management system policy document is on file.', requirementId: 'ISO-REQ-101', owner: 'Elena Rostova', status: 'ACTIVE' },
    { id: 'ctl-iso-102a', name: 'Risk Process Control', description: 'Verifies a documented, evidenced risk assessment process exists.', requirementId: 'ISO-REQ-102', owner: 'Elena Rostova', status: 'ACTIVE' },
    { id: 'ctl-euai-210a', name: 'Human Oversight Control', description: 'Verifies documented human oversight arrangements for high-risk systems.', requirementId: 'EUAI-REQ-210', owner: null, status: 'DRAFT' },
  ];
  for (const c of controls) {
    await prisma.packControl.create({ data: c });
  }

  // Evidence collected once (Release 3) and reused across packs — RBI ends up
  // fully Covered, ISO Partially Covered, EU AI Not Covered, demonstrating
  // all three live coverage outcomes.
  const mappingSpecs = [
    { controlId: 'ctl-rbi-001a', evidenceName: 'Fraud Sentinel Agent — Independent Validation Report' },
    { controlId: 'ctl-rbi-002a', evidenceName: 'Mortgage Workflow — OCR Control Assessment' },
    { controlId: 'ctl-iso-101a', evidenceName: 'Concierge Copilot — Data Handling Policy' },
  ];
  let mappingCount = 0;
  for (const m of mappingSpecs) {
    const evidence = await prisma.evidenceRecord.findFirst({ where: { name: m.evidenceName } });
    if (!evidence) {
      console.warn(`  Evidence record not found for mapping: "${m.evidenceName}" — skipping.`);
      continue;
    }
    await prisma.evidenceMapping.create({ data: { controlId: m.controlId, evidenceRecordId: evidence.id } });
    mappingCount++;
  }

  console.log(`  Compliance packs: ${packs.length}, requirements: ${requirements.length}, controls: ${controls.length}, evidence mappings: ${mappingCount}`);
}

// Release 6 — Universal Regulatory Knowledge & Obligation Engine (Foundation
// Edition). One generic sample source illustrating Source -> Requirement ->
// Obligation -> Control -> Evidence — no RBI/ISO/EU AI Act/NIST content, per
// the blueprint's explicit "foundation, not regulation" scoping. Neon-backed
// from day one, so this seeds unconditionally alongside (not deferred like
// Release 5's compliance packs were).
async function seedRegulatoryKnowledge() {
  const existingSourceCount = await prisma.regulatorySource.count();
  if (existingSourceCount > 0) {
    console.log(`Skipping regulatory knowledge seed — RegulatorySource already has ${existingSourceCount} row(s).`);
    return;
  }

  console.log('Seeding regulatory sources, requirements, obligations, controls and evidence mappings...');

  await prisma.regulatorySource.create({
    data: {
      id: 'src-demo-001', name: 'Sample Regulatory Source', sourceType: 'FRAMEWORK', status: 'ACTIVE',
      jurisdiction: 'Cross-Jurisdiction', industry: 'Cross-Industry', version: '1.0',
      effectiveDate: new Date('2026-01-01'), reviewDate: new Date('2026-12-01'),
    },
  });

  const requirements = [
    { id: 'REQ-OVERSIGHT-001', name: 'Human Oversight Required', description: 'In-scope AI systems must have documented, effective human oversight arrangements.', category: 'Oversight', criticality: 'CRITICAL', status: 'ACTIVE', sourceId: 'src-demo-001' },
    { id: 'REQ-VALIDATION-001', name: 'Independent Validation Required', description: 'In-scope AI systems must undergo independent validation before production use.', category: 'Validation', criticality: 'HIGH', status: 'ACTIVE', sourceId: 'src-demo-001' },
    { id: 'REQ-AUDIT-001', name: 'Audit Trail Required', description: 'In-scope AI systems must maintain a retrievable audit trail of governance decisions.', category: 'Audit', criticality: 'HIGH', status: 'ACTIVE', sourceId: 'src-demo-001' },
    { id: 'REQ-REVIEW-001', name: 'Periodic Review Required', description: 'In-scope AI systems must undergo periodic governance review on a defined cadence.', category: 'Review', criticality: 'MEDIUM', status: 'DRAFT', sourceId: 'src-demo-001' },
  ];
  for (const r of requirements) {
    await prisma.regulatoryRequirement.create({ data: r });
  }

  const obligations = [
    { id: 'obl-named-owner', name: 'Named Owner', description: 'A named individual is accountable for human oversight of the system.', owner: 'David Chen', status: 'ACTIVE', requirementId: 'REQ-OVERSIGHT-001' },
    { id: 'obl-approval-authority', name: 'Approval Authority', description: 'A named authority must approve the system before it operates autonomously.', owner: 'David Chen', status: 'ACTIVE', requirementId: 'REQ-OVERSIGHT-001' },
    { id: 'obl-escalation-path', name: 'Escalation Path', description: 'A defined path exists for escalating oversight concerns.', owner: 'Elena Rostova', status: 'ACTIVE', requirementId: 'REQ-OVERSIGHT-001' },
    { id: 'obl-override-capability', name: 'Override Capability', description: 'A human can override or halt the system’s autonomous action.', owner: null, status: 'DRAFT', requirementId: 'REQ-OVERSIGHT-001' },
    { id: 'obl-validation-signoff', name: 'Validation Sign-Off', description: 'An independent validator signs off before production use.', owner: 'Dr. Aris Thorne', status: 'ACTIVE', requirementId: 'REQ-VALIDATION-001' },
    { id: 'obl-audit-log-retention', name: 'Audit Log Retention', description: 'Governance decisions are logged and retained for the audit trail.', owner: 'Robert Vance', status: 'ACTIVE', requirementId: 'REQ-AUDIT-001' },
  ];
  for (const o of obligations) {
    await prisma.obligation.create({ data: o });
  }

  const controls = [
    { id: 'octl-authority-profile', name: 'Governance Authority Profile Control', description: 'Verifies the asset’s Governance Authority Profile names an accountable owner.', owner: 'David Chen', status: 'ACTIVE', obligationId: 'obl-named-owner' },
    { id: 'octl-approval-authority', name: 'Approval Authority Control', description: 'Verifies a named approval authority signed off before autonomous operation.', owner: 'David Chen', status: 'ACTIVE', obligationId: 'obl-approval-authority' },
    { id: 'octl-escalation-path', name: 'Escalation Path Control', description: 'Verifies a documented escalation path exists for oversight concerns.', owner: 'Elena Rostova', status: 'ACTIVE', obligationId: 'obl-escalation-path' },
    { id: 'octl-override-capability', name: 'Override Capability Control', description: 'Verifies a human override or kill switch capability exists.', owner: null, status: 'DRAFT', obligationId: 'obl-override-capability' },
    { id: 'octl-validation-signoff', name: 'Validation Sign-Off Control', description: 'Verifies independent validation was completed and recorded.', owner: 'Dr. Aris Thorne', status: 'ACTIVE', obligationId: 'obl-validation-signoff' },
    { id: 'octl-audit-log-retention', name: 'Audit Log Retention Control', description: 'Verifies governance decisions are logged and retained.', owner: 'Robert Vance', status: 'ACTIVE', obligationId: 'obl-audit-log-retention' },
  ];
  for (const c of controls) {
    await prisma.obligationControl.create({ data: c });
  }

  // Evidence collected once (Release 3) and reused here too — three of six
  // controls end up Covered, two Not Covered (missing evidence / missing
  // both owner and evidence) and the Draft requirement is Not Applicable, so
  // the Coverage Engine demonstrates every live outcome from one source.
  const mappingSpecs = [
    { controlId: 'octl-authority-profile', evidenceName: 'Fraud Sentinel Agent — Independent Validation Report' },
    { controlId: 'octl-approval-authority', evidenceName: 'Credit Scoring Engine — Conditional GO Approval Record' },
    { controlId: 'octl-validation-signoff', evidenceName: 'Credit Scoring Engine — Risk Assessment' },
  ];
  let mappingCount = 0;
  for (const m of mappingSpecs) {
    const evidence = await prisma.evidenceRecord.findFirst({ where: { name: m.evidenceName } });
    if (!evidence) {
      console.warn(`  Evidence record not found for mapping: "${m.evidenceName}" — skipping.`);
      continue;
    }
    await prisma.obligationEvidenceMapping.create({ data: { controlId: m.controlId, evidenceRecordId: evidence.id } });
    mappingCount++;
  }

  console.log(`  Regulatory sources: 1, requirements: ${requirements.length}, obligations: ${obligations.length}, controls: ${controls.length}, evidence mappings: ${mappingCount}`);
}

// Release 7 — Governance Intelligence Engine (Foundation Edition). One
// policy per condition type the Condition Engine detects, matching the
// blueprint's four named examples plus two more for full coverage. No
// findings are seeded — Conditions, Violations and Outcomes are computed
// live against real asset data, and the Governance Intelligence Workspace
// generates Findings from whatever violations are actually detected, so a
// hardcoded finding can never drift from what the engine currently sees.
async function seedGovernanceIntelligence() {
  const existingPolicyCount = await prisma.governancePolicy.count();
  if (existingPolicyCount > 0) {
    console.log(`Skipping governance intelligence seed — GovernancePolicy already has ${existingPolicyCount} row(s).`);
    return;
  }

  console.log('Seeding governance policies...');

  const policies = [
    { id: 'POL-EVIDENCE-CURRENT', name: 'Evidence Must Be Current', description: 'All evidence supporting a governance decision must be unexpired.', category: 'Evidence', severity: 'HIGH', status: 'ACTIVE', triggerCondition: 'EVIDENCE_EXPIRED', linkedControlIds: [] },
    { id: 'POL-REVIEW-PERFORMED', name: 'Review Must Be Performed', description: 'Scheduled governance reviews must be completed by their due date.', category: 'Review', severity: 'MEDIUM', status: 'ACTIVE', triggerCondition: 'REVIEW_OVERDUE', linkedControlIds: [] },
    { id: 'POL-APPROVAL-BEFORE-GO', name: 'Approval Required Before GO', description: 'No AI asset may operate without a recorded GO / CONDITIONAL GO / NO GO decision.', category: 'Decision', severity: 'CRITICAL', status: 'ACTIVE', triggerCondition: 'MISSING_APPROVAL', obligationId: 'obl-approval-authority', linkedControlIds: ['octl-approval-authority'] },
    { id: 'POL-VALIDATION-REQUIRED', name: 'Independent Validation Required', description: 'AI assets must carry at least one approved independent validation.', category: 'Validation', severity: 'HIGH', status: 'ACTIVE', triggerCondition: 'MISSING_VALIDATION', obligationId: 'obl-validation-signoff', linkedControlIds: ['octl-validation-signoff'] },
    { id: 'POL-NAMED-OWNERSHIP', name: 'Named Ownership Required', description: 'Every AI asset must have a complete Governance Authority Profile.', category: 'Governance', severity: 'MEDIUM', status: 'ACTIVE', triggerCondition: 'MISSING_OWNER', obligationId: 'obl-named-owner', linkedControlIds: ['octl-authority-profile'] },
    { id: 'POL-REAUTH-REQUIRED', name: 'Reauthorization Required After Reassessment', description: 'Assets in Reassessment Required must reach a recorded reauthorization decision.', category: 'Continuity', severity: 'CRITICAL', status: 'ACTIVE', triggerCondition: 'MISSING_REAUTHORIZATION', linkedControlIds: [] },
  ];
  for (const p of policies) {
    await prisma.governancePolicy.create({ data: p });
  }

  console.log(`  Governance policies: ${policies.length}`);
}

// Release 10 — Governance Intelligence Studio (Customer Configuration
// Edition). Seeds the Studio's four catalogues once: ConditionDefinition and
// OutcomeRule are fixed one-row-per-platform-primitive catalogues (all
// enabled, matching the exact set the engine has always evaluated);
// ActionRule mirrors the hardcoded CONDITION_ACTION_TEMPLATES /
// OUTCOME_ACTION_TEMPLATES defaults from governanceActionsEngine.ts so
// out-of-the-box behavior is unchanged; GovernanceProfile seeds the five
// named industry presets with Banking active, matching the demo tenant's
// "Enterprise Banking Tenant" narrative. triggerValue on ActionRule is
// stored as the frontend-readable string (not the backend enum) since the
// Api repository passes it through unmapped, matching what the reasoning
// engine's conditionType/outcome.status values look like at match time.
async function seedGovernanceStudio() {
  const existingCount = await prisma.conditionDefinition.count();
  if (existingCount > 0) {
    console.log(`Skipping governance studio seed — ConditionDefinition already has ${existingCount} row(s).`);
    return;
  }

  console.log('Seeding governance intelligence studio...');

  const conditionDefinitions = [
    { id: 'cond-evidence-expired', conditionType: 'EVIDENCE_EXPIRED', label: 'Evidence Expired', description: 'One or more evidence records supporting this asset have passed their expiry date.', defaultSeverity: 'HIGH', enabled: true },
    { id: 'cond-review-overdue', conditionType: 'REVIEW_OVERDUE', label: 'Review Overdue', description: 'A scheduled governance review has passed its due date without completion.', defaultSeverity: 'MEDIUM', enabled: true },
    { id: 'cond-missing-approval', conditionType: 'MISSING_APPROVAL', label: 'Missing Approval', description: 'No GO / CONDITIONAL GO / NO GO decision is on record for this asset.', defaultSeverity: 'CRITICAL', enabled: true },
    { id: 'cond-missing-owner', conditionType: 'MISSING_OWNER', label: 'Missing Owner', description: "The asset's Governance Authority Profile is missing a mandatory role.", defaultSeverity: 'MEDIUM', enabled: true },
    { id: 'cond-missing-validation', conditionType: 'MISSING_VALIDATION', label: 'Missing Validation', description: 'No approved independent validation is on record for this asset.', defaultSeverity: 'HIGH', enabled: true },
    { id: 'cond-missing-reauthorization', conditionType: 'MISSING_REAUTHORIZATION', label: 'Missing Reauthorization', description: 'Asset is in Reassessment Required but has no reauthorization decision on record.', defaultSeverity: 'CRITICAL', enabled: true },
  ];
  for (const c of conditionDefinitions) await prisma.conditionDefinition.create({ data: c });

  const outcomeRules = [
    { id: 'outc-compliant', outcomeStatus: 'COMPLIANT', description: 'No governance conditions detected, no policy violations, evidence valid.', enabled: true },
    { id: 'outc-attention-required', outcomeStatus: 'ATTENTION_REQUIRED', description: 'A policy violation or governance condition was detected but does not yet require review or escalation.', enabled: true },
    { id: 'outc-review-required', outcomeStatus: 'REVIEW_REQUIRED', description: 'A scheduled review is overdue or open governance findings await review.', enabled: true },
    { id: 'outc-reassessment-recommended', outcomeStatus: 'REASSESSMENT_RECOMMENDED', description: 'Governance State is Reassessment Required, or no reauthorization decision has been recorded since reassessment was triggered.', enabled: true },
    { id: 'outc-escalation-recommended', outcomeStatus: 'ESCALATION_RECOMMENDED', description: 'A critical policy violation or open critical finding was detected.', enabled: true },
  ];
  for (const o of outcomeRules) await prisma.outcomeRule.create({ data: o });

  const actionRules = [
    { triggerType: 'CONDITION', triggerValue: 'Evidence Expired', actionType: 'VALIDATION', actionName: 'Renew Evidence', actionDescription: 'Replace the expired evidence record with a current one.', enabled: true },
    { triggerType: 'CONDITION', triggerValue: 'Review Overdue', actionType: 'REVIEW', actionName: 'Initiate Review', actionDescription: 'Start the overdue scheduled governance review.', enabled: true },
    { triggerType: 'CONDITION', triggerValue: 'Missing Validation', actionType: 'VALIDATION', actionName: 'Perform Independent Validation', actionDescription: 'Commission an independent validation for this asset.', enabled: true },
    { triggerType: 'CONDITION', triggerValue: 'Missing Approval', actionType: 'APPROVAL', actionName: 'Obtain Governance Approval', actionDescription: 'Route the asset for a GO / CONDITIONAL GO / NO GO decision.', enabled: true },
    { triggerType: 'CONDITION', triggerValue: 'Missing Reauthorization', actionType: 'REAUTHORIZATION', actionName: 'Initiate Reauthorization', actionDescription: 'Reauthorize the asset following its reassessment trigger.', enabled: true },
    { triggerType: 'CONDITION', triggerValue: 'Missing Owner', actionType: 'OWNERSHIP', actionName: 'Assign Accountable Owner', actionDescription: 'Complete the Governance Authority Profile with a named accountable owner.', enabled: true },
    { triggerType: 'OUTCOME', triggerValue: 'Review Required', actionType: 'REVIEW', actionName: 'Create Governance Review', actionDescription: 'Schedule a governance review to address the open findings driving this outcome.', enabled: true },
    { triggerType: 'OUTCOME', triggerValue: 'Reassessment Recommended', actionType: 'REASSESSMENT', actionName: 'Initiate Reassessment', actionDescription: "Begin a full reassessment given the asset's governance state.", enabled: true },
    { triggerType: 'OUTCOME', triggerValue: 'Escalation Recommended', actionType: 'ESCALATION', actionName: 'Escalate To Governance Authority', actionDescription: 'Escalate to the governance authority — a critical policy violation or open critical finding was detected.', enabled: true },
  ];
  for (const a of actionRules) await prisma.actionRule.create({ data: a });

  const governanceProfiles = [
    { id: 'profile-banking', name: 'Banking', industry: 'Banking', description: 'Governance configuration for banking and lending AI — credit, fraud, and prudential-risk oriented controls.', isActive: true },
    { id: 'profile-insurance', name: 'Insurance', industry: 'Insurance', description: 'Governance configuration for insurance AI — underwriting, claims, and actuarial-risk oriented controls.', isActive: false },
    { id: 'profile-healthcare', name: 'Healthcare', industry: 'Healthcare', description: 'Governance configuration for healthcare AI — clinical safety and patient-data oriented controls.', isActive: false },
    { id: 'profile-government', name: 'Government', industry: 'Government', description: 'Governance configuration for public-sector AI — transparency and citizen-impact oriented controls.', isActive: false },
    { id: 'profile-enterprise', name: 'Enterprise', industry: 'Enterprise', description: 'General-purpose governance configuration for enterprise AI outside a regulated vertical.', isActive: false },
  ];
  for (const p of governanceProfiles) await prisma.governanceProfile.create({ data: p });

  console.log(`  Condition definitions: ${conditionDefinitions.length}, outcome rules: ${outcomeRules.length}, action rules: ${actionRules.length}, governance profiles: ${governanceProfiles.length}`);
}

async function main() {
  const existingAssetCount = await prisma.aIAsset.count();
  if (existingAssetCount > 0) {
    console.log(`AIAsset already has ${existingAssetCount} row(s) — skipping asset/evidence/continuity seed.`);
    await seedCompliance();
    await seedRegulatoryKnowledge();
    await seedGovernanceIntelligence();
    await seedGovernanceStudio();
    return;
  }

  console.log('Seeding users...');
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { name: u.name, email: u.email, role: u.role, department: u.department },
    });
  }

  console.log('Seeding assets, evidence and continuity records...');
  const idByKey = {};

  for (const a of assets) {
    const { key, nextReviewDate, ...data } = a;
    const created = await prisma.aIAsset.create({
      data: { ...data, nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : undefined },
    });
    idByKey[key] = created.id;
    console.log(`  Asset: ${created.name} -> ${created.id}`);
  }

  let evidenceCount = 0;
  for (const [key, records] of Object.entries(evidenceByAssetKey)) {
    for (const r of records) {
      const { createdDate, expiryDate, ...rest } = r;
      await prisma.evidenceRecord.create({
        data: {
          ...rest,
          assetId: idByKey[key],
          createdDate: new Date(createdDate),
          expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        },
      });
      evidenceCount++;
    }
  }
  console.log(`  Evidence records: ${evidenceCount}`);

  let triggerCount = 0;
  for (const [key, triggers] of Object.entries(triggersByAssetKey)) {
    for (const t of triggers) {
      const { dateDetected, ...rest } = t;
      await prisma.reassessmentTrigger.create({
        data: { ...rest, assetId: idByKey[key], dateDetected: new Date(dateDetected) },
      });
      triggerCount++;
    }
  }
  console.log(`  Reassessment triggers: ${triggerCount}`);

  let reauthCount = 0;
  for (const [key, records] of Object.entries(reauthorizationsByAssetKey)) {
    for (const r of records) {
      const { reviewDate, ...rest } = r;
      await prisma.governanceReauthorizationRecord.create({
        data: { ...rest, assetId: idByKey[key], reviewDate: new Date(reviewDate) },
      });
      reauthCount++;
    }
  }
  console.log(`  Reauthorization records: ${reauthCount}`);

  let reviewCount = 0;
  for (const [key, reviews] of Object.entries(reviewsByAssetKey)) {
    for (const r of reviews) {
      await prisma.scheduledReview.create({ data: { ...r, dueDate: new Date(r.dueDate), assetId: idByKey[key] } });
      reviewCount++;
    }
  }
  console.log(`  Scheduled reviews: ${reviewCount}`);

  await seedCompliance();
  await seedRegulatoryKnowledge();
  await seedGovernanceIntelligence();
  await seedGovernanceStudio();

  console.log('Seed complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
