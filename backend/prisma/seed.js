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

async function main() {
  const existingAssetCount = await prisma.aIAsset.count();
  if (existingAssetCount > 0) {
    console.log(`Skipping seed — AIAsset already has ${existingAssetCount} row(s). Delete them first if you want to reseed.`);
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
