import type { 
  AIAsset, 
  User, 
  AuditLog, 
  PersonaDemoUser, 
  ValidationRecord, 
  EvidenceDocument, 
  Finding,
  ComplianceControl,
  ComplianceAssessmentRecord,
  KillSwitchRecord,
  OverrideRecord,
  GovernanceIncident,
  RetirementRecord,
  GovernanceAlert,
  ScheduledReview,
  CorrectiveAction,
  ReassessmentTrigger,
  GovernanceReauthorizationRecord,
  EvidenceRecord,
  CompliancePack,
  ComplianceRequirement,
  PackControl,
  EvidenceMapping,
  RegulatorySource,
  RegulatoryRequirement,
  Obligation,
  ObligationControl,
  ObligationEvidenceMapping,
  GovernancePolicy,
  GovernanceFinding,
  RecommendedAction
} from '../types';

export const SEEDED_COMPLIANCE_CONTROLS: ComplianceControl[] = [
  {
    id: 'RBI-001',
    controlName: 'Named Accountable Ownership Required',
    category: 'RBI AI Governance',
    source: 'RBI Standards',
    description: 'Every AI asset must have explicit Business, Technical, and Risk Owners assigned in the RACIS matrix.',
    mandatory: true,
  },
  {
    id: 'RBI-002',
    controlName: 'Centralized AI & Model Inventory',
    category: 'RBI AI Governance',
    source: 'RBI Standards',
    description: '100% of enterprise AI applications, models, agents, copilots, and RAG systems must be registered in the central asset registry.',
    mandatory: true,
  },
  {
    id: 'RBI-003',
    controlName: 'Independent Multi-Disciplinary Validation',
    category: 'RBI AI Governance',
    source: 'RBI Standards',
    description: 'Independent validation reviews across Security, Model, Compliance, and Technical domains with score >= 80%.',
    mandatory: true,
  },
  {
    id: 'RBI-004',
    controlName: 'Human Oversight & Override Control',
    category: 'RBI AI Governance',
    source: 'RBI Standards',
    description: 'High and Critical risk AI systems must enforce human-in-the-loop or human-on-the-loop override authority.',
    mandatory: true,
  },
  {
    id: 'RBI-005',
    controlName: 'Day-1 Immutable Auditability',
    category: 'RBI AI Governance',
    source: 'RBI Standards',
    description: 'All governance actions, reviews, approvals, and decisions must generate immutable audit log records.',
    mandatory: true,
  },
  {
    id: 'RBI-006',
    controlName: 'Risk Classification & Tiering Assessment',
    category: 'RBI AI Governance',
    source: 'RBI Standards',
    description: 'Formal risk tier assessment evaluating data sensitivity, decision impact, and operational impact.',
    mandatory: true,
  },
  {
    id: 'RBI-007',
    controlName: 'Third-Party AI Service Accountability',
    category: 'RBI AI Governance',
    source: 'RBI Standards',
    description: 'SaaS and 3rd party AI services must undergo vendor security review and data privacy compliance verification.',
    mandatory: true,
  },
  {
    id: 'RBI-008',
    controlName: 'Emergency Kill Switch & Suspension Capability',
    category: 'RBI AI Governance',
    source: 'RBI Standards',
    description: 'Operational kill switch or circuit breaker protocol defined to suspend autonomous AI execution instantly.',
    mandatory: true,
  },
  {
    id: 'POL-101',
    controlName: 'Information Security & PII Protection',
    category: 'Information Security',
    source: 'Internal Policy',
    description: 'Strict encryption in transit & at rest for PII/Sensitive and Restricted data sensitivity classifications.',
    mandatory: true,
  },
  {
    id: 'POL-102',
    controlName: 'Algorithmic Fairness & Bias Audit',
    category: 'Data Privacy',
    source: 'Internal Policy',
    description: 'Demographic disparate impact and model explainability audit for customer-impacting AI models.',
    mandatory: false,
  },
];

export const DEMO_PERSONAS: PersonaDemoUser[] = [
  {
    role: 'SUPER_ADMIN',
    title: 'Super Admin',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@enterprise-bank.com',
    department: 'Enterprise AI & Architecture',
    description: 'Platform Owner • Full system access, user management, platform settings & continuous monitoring oversight.',
    icon: '👑',
    allowedNav: [
      '/', '/dashboard', '/assets', '/ownership', '/risk', 
      '/validation', '/evidence', '/evidence-registry', '/review-workbench', '/findings', '/validation-dashboard', 
      '/decision-intelligence', '/governance-blockers', '/decision-workbench-v4', '/decision-dashboard',
      '/compliance-center', '/compliance-packs', '/regulatory-library', '/compliance-assessment', '/compliance-findings', '/compliance-dashboard',
      '/operations-center', '/kill-switch', '/override-center', '/incidents', '/operations-dashboard', '/retirement', '/governance-timeline',
      '/governance-monitoring', '/governance-alerts', '/review-calendar', '/corrective-actions', '/governance-trends',
      '/users', '/audit-logs',
      // Phase 8 — Governance Operating System
      '/asset-lifecycle', '/rbac', '/tenant-settings', '/command-center',
      // Phase 9 — Executive Governance & Policy Governance
      '/executive-hub', '/governance-scorecards', '/executive-heatmaps', '/governance-insights',
      '/board-reporting', '/policy-management', '/policy-mapping', '/policy-violations',
      // Phase 10 — Governance Change Management
      '/change-requests', '/change-impact', '/change-dashboard', '/change-history', '/governance-triggers',
      // OMG vNext — Governance Intelligence (Value, Drift, Health)
      '/governance-value', '/governance-drift', '/governance-health',
      // Release 11 — Governance Effectiveness & Outcomes Engine
      '/governance-effectiveness', '/governance-roi', '/governance-maturity', '/governance-benchmarking', '/governance-outcomes',
      // Release 12 — Regulatory Intelligence
      '/regulatory-applicability', '/cross-framework-mapping', '/compliance-impact-analysis', '/regulatory-change-readiness', '/audit-readiness-intelligence'
    ],
  },
  {
    role: 'GOVERNANCE_ADMIN',
    title: 'Governance Admin',
    name: 'David Chen',
    email: 'david.chen@enterprise-bank.com',
    department: 'AI Governance Office',
    description: 'Program Manager • Manage AI Assets, Review Calendar, Alerts & Governance Health Engine.',
    icon: '🛡️',
    allowedNav: [
      '/', '/dashboard', '/assets', '/ownership', '/risk', 
      '/validation', '/evidence', '/evidence-registry', '/review-workbench', '/findings', '/validation-dashboard', 
      '/decision-intelligence', '/governance-blockers', '/decision-workbench-v4', '/decision-dashboard',
      '/compliance-center', '/compliance-packs', '/regulatory-library', '/compliance-assessment', '/compliance-findings', '/compliance-dashboard',
      '/operations-center', '/kill-switch', '/override-center', '/incidents', '/operations-dashboard', '/retirement', '/governance-timeline',
      '/governance-monitoring', '/governance-alerts', '/review-calendar', '/corrective-actions', '/governance-trends',
      '/audit-logs',
      // Phase 8 — Governance Operating System
      '/asset-lifecycle', '/tenant-settings', '/command-center',
      // Phase 9 — Executive Governance & Policy Governance
      '/executive-hub', '/governance-scorecards', '/executive-heatmaps', '/governance-insights',
      '/board-reporting', '/policy-management', '/policy-mapping', '/policy-violations',
      // Phase 10 — Governance Change Management
      '/change-requests', '/change-impact', '/change-dashboard', '/change-history', '/governance-triggers',
      // Q1 Stabilization — Releases 6-10 were missing from every non-Super-Admin
      // persona's allowedNav (R-2). Every one of these GET endpoints already
      // grants all 7 roles read access on the backend, so nav visibility is
      // restored to match that reality; write actions within each page are
      // gated individually by roleActionMatrix.ts, not by hiding the page.
      '/mapping-workspace', '/requirement-registry', '/obligation-library',
      '/governance-intelligence', '/governance-actions', '/decision-traceability', '/governance-studio',
      '/archived-assets', '/governance-readiness',
      // OMG vNext — Governance Intelligence (Value, Drift, Health)
      '/governance-value', '/governance-drift', '/governance-health',
      // Release 11 — Governance Effectiveness & Outcomes Engine
      '/governance-effectiveness', '/governance-roi', '/governance-maturity', '/governance-benchmarking', '/governance-outcomes',
      // Release 12 — Regulatory Intelligence
      '/regulatory-applicability', '/cross-framework-mapping', '/compliance-impact-analysis', '/regulatory-change-readiness', '/audit-readiness-intelligence'
    ],
  },
  {
    role: 'RISK_OFFICER',
    title: 'Risk Officer',
    name: 'Elena Rostova',
    email: 'elena.rostova@enterprise-bank.com',
    department: 'Model Risk Management',
    description: 'Risk Governance • Monitor governance alerts, risk health & corrective remediation tasks.',
    icon: '⚡',
    allowedNav: [
      '/', '/dashboard', '/assets', '/risk', '/evidence', '/evidence-registry', '/review-workbench', '/findings',
      '/decision-intelligence', '/governance-blockers', '/decision-workbench-v4', '/decision-dashboard',
      '/compliance-center', '/compliance-packs', '/regulatory-library', '/compliance-findings', '/compliance-dashboard',
      '/operations-center', '/kill-switch', '/override-center', '/incidents', '/operations-dashboard', '/governance-timeline',
      '/governance-monitoring', '/governance-alerts', '/review-calendar', '/corrective-actions', '/governance-trends', '/audit-logs',
      // Phase 8 — Governance Operating System
      '/asset-lifecycle', '/command-center',
      // Phase 9 — Executive Governance & Policy Governance
      '/executive-hub', '/governance-scorecards', '/executive-heatmaps', '/governance-insights',
      '/policy-management', '/policy-violations',
      // Phase 10 — Governance Change Management
      '/change-requests', '/change-impact', '/change-dashboard', '/change-history', '/governance-triggers',
      // Q1 Stabilization — see note on Governance Admin above.
      '/mapping-workspace', '/requirement-registry', '/obligation-library',
      '/governance-intelligence', '/governance-actions', '/decision-traceability', '/governance-studio',
      '/archived-assets', '/governance-readiness',
      // OMG vNext — Governance Intelligence (Value, Drift, Health)
      '/governance-value', '/governance-drift', '/governance-health',
      // Release 11 — Governance Effectiveness & Outcomes Engine
      '/governance-effectiveness', '/governance-roi', '/governance-maturity', '/governance-benchmarking', '/governance-outcomes',
      // Release 12 — Regulatory Intelligence
      '/regulatory-applicability', '/cross-framework-mapping', '/compliance-impact-analysis', '/regulatory-change-readiness', '/audit-readiness-intelligence'
    ],
  },
  {
    role: 'BUSINESS_OWNER',
    title: 'Business Owner',
    name: 'Marcus Vance',
    email: 'marcus.vance@enterprise-bank.com',
    department: 'Retail Banking & Wealth',
    description: 'Business Accountability • Track asset governance health, assigned corrective actions & scheduled reviews.',
    icon: '💼',
    allowedNav: [
      '/', '/dashboard', '/assets', '/ownership', '/evidence', '/evidence-registry', '/decision-intelligence', 
      '/compliance-center', '/compliance-packs', '/operations-center', '/kill-switch', '/incidents', '/governance-timeline',
      '/governance-monitoring', '/review-calendar', '/corrective-actions',
      // Phase 8 — Governance Operating System
      '/asset-lifecycle', '/command-center',
      // Phase 9 — Executive Governance & Policy Governance
      '/executive-hub', '/policy-management', '/policy-violations',
      // Phase 10 — Governance Change Management
      '/change-requests', '/change-dashboard', '/change-history',
      // Q1 Stabilization — see note on Governance Admin above.
      '/mapping-workspace', '/requirement-registry', '/obligation-library',
      '/governance-intelligence', '/governance-actions', '/decision-traceability', '/governance-studio',
      '/archived-assets', '/governance-readiness',
      // OMG vNext — Governance Intelligence (Value, Drift, Health)
      '/governance-value', '/governance-drift', '/governance-health',
      // Release 11 — Governance Effectiveness & Outcomes Engine
      '/governance-effectiveness', '/governance-roi', '/governance-maturity', '/governance-benchmarking', '/governance-outcomes',
      // Release 12 — Regulatory Intelligence
      '/regulatory-applicability', '/cross-framework-mapping', '/compliance-impact-analysis', '/regulatory-change-readiness', '/audit-readiness-intelligence'
    ],
  },
  {
    role: 'VALIDATOR',
    title: 'Validator',
    name: 'Dr. Aris Thorne',
    email: 'aris.thorne@enterprise-bank.com',
    department: 'AI Validation & Testing Center',
    description: 'Validation Officer • Model validation reviews, validation health & corrective action verification.',
    icon: '🧪',
    allowedNav: [
      '/', '/dashboard', '/assets', '/validation', '/evidence', '/evidence-registry', '/review-workbench', '/findings', 
      '/validation-dashboard', '/decision-intelligence', '/compliance-assessment', '/incidents', '/governance-timeline',
      '/governance-monitoring', '/corrective-actions',
      // Phase 8 — Governance Operating System
      '/asset-lifecycle', '/command-center',
      // Phase 9 — Executive Governance & Policy Governance
      '/governance-scorecards', '/policy-management', '/policy-violations',
      // Phase 10 — Governance Change Management
      '/change-requests', '/change-impact', '/change-history',
      // Q1 Stabilization — see note on Governance Admin above.
      '/mapping-workspace', '/requirement-registry', '/obligation-library',
      '/governance-intelligence', '/governance-actions', '/decision-traceability', '/governance-studio',
      '/archived-assets', '/governance-readiness',
      // OMG vNext — Governance Intelligence (Value, Drift, Health)
      '/governance-value', '/governance-drift', '/governance-health',
      // Release 11 — Governance Effectiveness & Outcomes Engine
      '/governance-effectiveness', '/governance-roi', '/governance-maturity', '/governance-benchmarking', '/governance-outcomes',
      // Release 12 — Regulatory Intelligence
      '/regulatory-applicability', '/cross-framework-mapping', '/compliance-impact-analysis', '/regulatory-change-readiness', '/audit-readiness-intelligence'
    ],
  },
  {
    role: 'AUDITOR',
    title: 'Auditor',
    name: 'Robert Vance',
    email: 'robert.vance@enterprise-bank.com',
    department: 'Internal Audit & Compliance',
    description: 'Independent Auditor • Read-only governance health, alert logs, review calendar & trends.',
    icon: '📜',
    allowedNav: [
      '/', '/dashboard', '/assets', '/evidence', '/evidence-registry', '/findings', '/decision-workbench-v4', '/decision-dashboard',
      '/compliance-center', '/compliance-packs', '/regulatory-library', '/compliance-findings', '/compliance-dashboard',
      '/operations-center', '/kill-switch', '/override-center', '/incidents', '/operations-dashboard', '/retirement', '/governance-timeline',
      '/governance-monitoring', '/governance-alerts', '/review-calendar', '/corrective-actions', '/governance-trends', '/audit-logs',
      // Phase 8 — Governance Operating System
      '/asset-lifecycle', '/rbac', '/command-center',
      // Phase 9 — Executive Governance & Policy Governance
      '/executive-hub', '/governance-scorecards', '/executive-heatmaps', '/governance-insights',
      '/board-reporting', '/policy-management', '/policy-mapping', '/policy-violations',
      // Phase 10 — Governance Change Management
      '/change-requests', '/change-impact', '/change-dashboard', '/change-history', '/governance-triggers',
      // Q1 Stabilization — see note on Governance Admin above.
      '/mapping-workspace', '/requirement-registry', '/obligation-library',
      '/governance-intelligence', '/governance-actions', '/decision-traceability', '/governance-studio',
      '/archived-assets', '/governance-readiness',
      // OMG vNext — Governance Intelligence (Value, Drift, Health)
      '/governance-value', '/governance-drift', '/governance-health',
      // Release 11 — Governance Effectiveness & Outcomes Engine
      '/governance-effectiveness', '/governance-roi', '/governance-maturity', '/governance-benchmarking', '/governance-outcomes',
      // Release 12 — Regulatory Intelligence
      '/regulatory-applicability', '/cross-framework-mapping', '/compliance-impact-analysis', '/regulatory-change-readiness', '/audit-readiness-intelligence'
    ],
  },
  {
    role: 'VIEWER',
    title: 'Viewer',
    name: 'Claire Sterling',
    email: 'claire.sterling@enterprise-bank.com',
    department: 'Executive Board Observer',
    description: 'Executive Viewer • Governance Trends Dashboard & portfolio health score visibility.',
    icon: '👁️',
    allowedNav: [
      '/', '/dashboard', '/assets', '/validation-dashboard', '/decision-dashboard', '/compliance-dashboard', '/operations-dashboard', '/governance-trends',
      // Phase 8 — Governance Operating System
      '/asset-lifecycle', '/command-center',
      // Phase 9 — Executive Governance (board observer, read-only surfaces)
      '/executive-hub', '/governance-scorecards', '/executive-heatmaps', '/governance-insights',
      // Phase 10 — Governance Change Management
      '/change-dashboard',
      // Q1 Stabilization — see note on Governance Admin above.
      '/mapping-workspace', '/requirement-registry', '/obligation-library',
      '/governance-intelligence', '/governance-actions', '/decision-traceability', '/governance-studio',
      '/archived-assets', '/governance-readiness',
      // OMG vNext — Governance Intelligence (Value, Drift, Health)
      '/governance-value', '/governance-drift', '/governance-health',
      // Release 11 — Governance Effectiveness & Outcomes Engine
      '/governance-effectiveness', '/governance-roi', '/governance-maturity', '/governance-benchmarking', '/governance-outcomes',
      // Release 12 — Regulatory Intelligence
      '/regulatory-applicability', '/cross-framework-mapping', '/compliance-impact-analysis', '/regulatory-change-readiness', '/audit-readiness-intelligence'
    ],
  },
];

export const INITIAL_USERS: User[] = DEMO_PERSONAS.map((p, idx) => ({
  id: `usr-${idx + 1}`,
  name: p.name,
  email: p.email,
  role: p.role,
  department: p.department,
  status: 'Active',
  lastLogin: '2026-08-07 10:15',
  assignedAssetsCount: (idx % 3) + 2,
}));

export const INITIAL_ASSETS: AIAsset[] = [
  {
    id: 'ast-101',
    name: 'Fraud Detection Sentinel Agent',
    type: 'Agent',
    description: 'Autonomous agent monitoring real-time transactions for fraud anomalies using graph embeddings.',
    department: 'Cyber Security & Fraud',
    version: '2.4.0',
    status: 'Production',
    operationalStatus: 'Active',
    riskLevel: 'Critical',
    ownership: {
      businessOwner: 'Marcus Vance',
      technicalOwner: 'Sarah Jenkins',
      riskOwner: 'Elena Rostova',
      complianceOwner: 'David Chen',
      approver: 'David Chen',
    },
    authorityProfile: {
      accountableOwner: 'Marcus Vance',
      governanceSponsor: 'David Chen',
      riskOwner: 'Elena Rostova',
      technicalOwner: 'Sarah Jenkins',
      complianceOwner: 'David Chen',
      humanOverrideAuthority: 'Marcus Vance',
      killSwitchAuthority: 'Sarah Jenkins',
      reassessmentAuthority: 'David Chen',
    },
    oversightType: 'Human-in-Command',
    autonomyLevel: 4,
    governanceClassification: 'Agentic Workflow',
    governanceState: 'Monitoring',
    nextReviewDate: '2026-08-20',
    techStack: ['Python', 'PyTorch', 'Kafka', 'Neo4j'],
    dataSensitivity: 'PII/Sensitive',
    validationScore: 94,
    createdAt: '2026-01-15',
    updatedAt: '2026-08-02',
    lastReviewDate: '2026-07-20',
    decisionOutcome: 'GO',
    tags: ['Real-Time', 'Autonomous', 'High-Impact'],
  },
  {
    id: 'ast-102',
    name: 'Retail Credit Scoring Engine',
    type: 'Model',
    description: 'Machine learning model calculating credit risk scores for personal loan underwriting.',
    department: 'Retail Credit & Underwriting',
    version: '3.1.2',
    status: 'Validation',
    operationalStatus: 'Under Review',
    riskLevel: 'High',
    ownership: {
      businessOwner: 'Marcus Vance',
      technicalOwner: 'Sarah Jenkins',
      riskOwner: 'Elena Rostova',
      complianceOwner: 'David Chen',
    },
    authorityProfile: {
      accountableOwner: 'Marcus Vance',
      governanceSponsor: 'David Chen',
      riskOwner: 'Elena Rostova',
      technicalOwner: 'Sarah Jenkins',
      complianceOwner: 'David Chen',
    },
    oversightType: 'Human-in-Command',
    autonomyLevel: 2,
    governanceClassification: 'Regulated AI',
    governanceState: 'Conditional GO',
    nextReviewDate: '2026-09-15',
    techStack: ['XGBoost', 'Scikit-Learn', 'FastAPI'],
    dataSensitivity: 'Confidential',
    validationScore: 88,
    createdAt: '2026-03-10',
    updatedAt: '2026-08-05',
    lastReviewDate: '2026-07-28',
    decisionOutcome: 'CONDITIONAL GO',
    tags: ['Credit', 'Regulated', 'Underwriting'],
  },
  {
    id: 'ast-103',
    name: 'Customer Concierge Copilot',
    type: 'Copilot',
    description: 'LLM-powered conversational assistant helping branch reps resolve customer inquiries.',
    department: 'Customer Operations',
    version: '1.2.0',
    status: 'Production',
    operationalStatus: 'Active',
    riskLevel: 'Medium',
    ownership: {
      businessOwner: 'Marcus Vance',
      technicalOwner: 'Sarah Jenkins',
      riskOwner: 'Elena Rostova',
      complianceOwner: 'David Chen',
      approver: 'David Chen',
    },
    authorityProfile: {
      accountableOwner: 'Marcus Vance',
      governanceSponsor: 'David Chen',
      riskOwner: 'Elena Rostova',
      technicalOwner: 'Sarah Jenkins',
      complianceOwner: 'David Chen',
      humanOverrideAuthority: 'Marcus Vance',
    },
    oversightType: 'Human-in-the-Loop',
    autonomyLevel: 1,
    governanceClassification: 'Customer Facing',
    governanceState: 'Monitoring',
    nextReviewDate: '2026-08-15',
    techStack: ['Azure OpenAI', 'LangChain', 'React'],
    dataSensitivity: 'Internal',
    validationScore: 91,
    createdAt: '2026-02-01',
    updatedAt: '2026-07-15',
    lastReviewDate: '2026-07-15',
    decisionOutcome: 'GO',
    tags: ['Customer Service', 'LLM', 'Copilot'],
  },
  {
    id: 'ast-104',
    name: 'AML Regulatory Intelligence RAG',
    type: 'RAG System',
    description: 'Retrieval-augmented generation system querying financial crime compliance regulations.',
    department: 'Financial Crime & AML',
    version: '1.0.4',
    status: 'Review',
    operationalStatus: 'Planned',
    riskLevel: 'High',
    ownership: {
      businessOwner: 'David Chen',
      technicalOwner: 'David Chen',
      riskOwner: 'Elena Rostova',
    },
    authorityProfile: {
      accountableOwner: 'David Chen',
      governanceSponsor: 'Sarah Jenkins',
      riskOwner: 'Elena Rostova',
      technicalOwner: 'David Chen',
    },
    oversightType: 'Human-in-Command',
    autonomyLevel: 2,
    governanceClassification: 'Decision Support',
    governanceState: 'Submitted',
    nextReviewDate: '2026-09-01',
    techStack: ['Pinecone', 'LlamaIndex', 'GPT-4o'],
    dataSensitivity: 'Confidential',
    validationScore: 82,
    createdAt: '2026-05-12',
    updatedAt: '2026-08-06',
    lastReviewDate: '2026-08-01',
    decisionOutcome: 'PENDING',
    tags: ['AML', 'Compliance', 'RAG'],
  },
  {
    id: 'ast-105',
    name: 'Mortgage Document Intelligence Workflow',
    type: 'AI Workflow',
    description: 'Automated OCR & extraction pipeline parsing applicant income docs and tax returns.',
    department: 'Mortgage Services',
    version: '2.0.1',
    status: 'Production',
    operationalStatus: 'Active',
    riskLevel: 'Medium',
    ownership: {
      businessOwner: 'Marcus Vance',
      technicalOwner: 'Sarah Jenkins',
      riskOwner: 'Elena Rostova',
      complianceOwner: 'David Chen',
      approver: 'David Chen',
    },
    authorityProfile: {
      accountableOwner: 'Marcus Vance',
      governanceSponsor: 'David Chen',
      riskOwner: 'Elena Rostova',
      technicalOwner: 'Sarah Jenkins',
      complianceOwner: 'David Chen',
      reassessmentAuthority: 'David Chen',
    },
    oversightType: 'Human-in-the-Loop',
    autonomyLevel: 3,
    governanceClassification: 'Operational Automation',
    governanceState: 'Monitoring',
    nextReviewDate: '2026-11-30',
    techStack: ['AWS Textract', 'Python', 'Temporal'],
    dataSensitivity: 'PII/Sensitive',
    validationScore: 95,
    createdAt: '2026-02-20',
    updatedAt: '2026-06-30',
    lastReviewDate: '2026-06-30',
    decisionOutcome: 'GO',
    tags: ['Document AI', 'Workflow', 'Mortgage'],
  },
  {
    id: 'ast-106',
    name: 'Enterprise Portfolio Multi-Agent System',
    type: 'Multi-Agent System',
    description: 'Multi-agent orchestration swarm conducting automated stress testing & asset rebalancing.',
    department: 'Capital Markets & Wealth',
    version: '0.9.1',
    status: 'Draft',
    operationalStatus: 'Suspended',
    riskLevel: 'Critical',
    ownership: {
      businessOwner: 'Marcus Vance',
      technicalOwner: 'Sarah Jenkins',
    },
    authorityProfile: {
      accountableOwner: 'Marcus Vance',
      governanceSponsor: 'Sarah Jenkins',
      riskOwner: 'Elena Rostova',
      technicalOwner: 'Sarah Jenkins',
      humanOverrideAuthority: 'Elena Rostova',
      killSwitchAuthority: 'Sarah Jenkins',
      reassessmentAuthority: 'David Chen',
    },
    oversightType: 'Human-in-Command',
    autonomyLevel: 5,
    governanceClassification: 'Agentic Workflow',
    governanceState: 'No GO',
    nextReviewDate: '2026-08-25',
    techStack: ['AutoGen', 'CrewAI', 'Python'],
    dataSensitivity: 'Restricted',
    validationScore: 65,
    createdAt: '2026-07-01',
    updatedAt: '2026-08-04',
    decisionOutcome: 'NO GO',
    tags: ['Trading', 'Multi-Agent', 'High-Risk'],
  },
];

export const INITIAL_GOVERNANCE_ALERTS: GovernanceAlert[] = [
  {
    id: 'alt-701',
    assetId: 'ast-106',
    assetName: 'Enterprise Portfolio Multi-Agent System',
    alertType: 'Critical Incident Open',
    severity: 'Critical',
    createdAt: '2026-08-06 14:15',
    message: 'Active Kill Switch & open critical incident reported for multi-agent swarm.',
    resolutionPath: '/incidents',
  },
  {
    id: 'alt-702',
    assetId: 'ast-102',
    assetName: 'Retail Credit Scoring Engine',
    alertType: 'Compliance Review Overdue',
    severity: 'High',
    createdAt: '2026-08-05 09:00',
    message: 'Quarterly RBI control validation review is overdue by 7 days.',
    resolutionPath: '/compliance-assessment',
  },
];

export const INITIAL_SCHEDULED_REVIEWS: ScheduledReview[] = [
  {
    id: 'sch-701',
    assetId: 'ast-101',
    assetName: 'Fraud Detection Sentinel Agent',
    reviewType: 'Quarterly Review',
    owner: 'Elena Rostova',
    dueDate: '2026-08-20',
    status: 'Scheduled',
  },
  {
    id: 'sch-702',
    assetId: 'ast-103',
    assetName: 'Customer Concierge Copilot',
    reviewType: 'Monthly Review',
    owner: 'David Chen',
    dueDate: '2026-08-15',
    status: 'In Progress',
  },
];

export const INITIAL_CORRECTIVE_ACTIONS: CorrectiveAction[] = [
  {
    id: 'act-701',
    assetId: 'ast-106',
    assetName: 'Enterprise Portfolio Multi-Agent System',
    title: 'Implement Swarm Agent Hard Execution Circuit Breaker',
    status: 'In Progress',
    severity: 'Critical',
    assignedTo: 'Sarah Jenkins',
    dueDate: '2026-08-12',
    description: 'Add hard-coded volatility exit condition to prevent infinite agent consensus loop.',
  },
];

export const INITIAL_KILL_SWITCH_RECORDS: KillSwitchRecord[] = [
  {
    id: 'ks-601',
    assetId: 'ast-106',
    assetName: 'Enterprise Portfolio Multi-Agent System',
    triggerCategory: 'Critical Incident',
    status: 'Activated',
    requestedBy: 'Elena Rostova (Risk Officer)',
    approvedBy: 'Sarah Jenkins (Super Admin)',
    activatedAt: '2026-08-06 14:22',
    reason: 'Swarm agent loop exhibited unauthorized high-frequency trade rebalancing simulation during volatility test.',
    resolutionNotes: 'Under root-cause investigation by AI Validation & Risk teams.',
  },
];

export const INITIAL_OVERRIDE_RECORDS: OverrideRecord[] = [
  {
    id: 'ovr-601',
    assetId: 'ast-101',
    assetName: 'Fraud Detection Sentinel Agent',
    triggerReason: 'High-value corporate wire transfer flagged as anomaly during system migration window.',
    requestedBy: 'Marcus Vance (Business Owner)',
    approvedBy: 'David Chen (Governance Admin)',
    timestamp: '2026-08-04 11:15',
    actionTaken: 'Human Supervisor approved transaction override after manual phone verification.',
  },
];

export const INITIAL_GOVERNANCE_INCIDENTS: GovernanceIncident[] = [
  {
    id: 'inc-601',
    assetId: 'ast-106',
    assetName: 'Enterprise Portfolio Multi-Agent System',
    title: 'Swarm Consensus Loop Volatility Anomaly',
    type: 'Operational Failure',
    severity: 'Critical',
    status: 'Investigating',
    reportedBy: 'Dr. Aris Thorne',
    assignedTo: 'Sarah Jenkins',
    createdAt: '2026-08-06 14:10',
    description: 'Autonomous agents engaged in infinite consensus verification loop during simulated stress test.',
  },
];

export const INITIAL_RETIREMENT_RECORDS: RetirementRecord[] = [
  {
    id: 'ret-601',
    assetId: 'ast-099',
    assetName: 'Legacy Credit Rating Decision Tree (v1.0)',
    reason: 'Technology Replacement',
    requestedBy: 'Marcus Vance',
    approvedBy: 'David Chen',
    retiredAt: '2026-05-10',
    evidenceArchivedCount: 6,
    notes: 'Replaced by Retail Credit Scoring Engine (ast-102). Evidence archived in S3 Glacier.',
  },
];

export const INITIAL_VALIDATIONS: ValidationRecord[] = [
  {
    id: 'val-201',
    assetId: 'ast-101',
    assetName: 'Fraud Detection Sentinel Agent',
    category: 'Security',
    reviewer: 'Dr. Aris Thorne',
    reviewerRole: 'VALIDATOR',
    reviewDate: '2026-08-02',
    status: 'Approved',
    score: 100,
    findings: 'Penetration test passed with zero critical vulnerabilities. API secret key rotation verified.',
    recommendations: 'Enable automated daily key rotation in HashiCorp Vault.',
    evidenceRefs: ['evd-301', 'evd-302'],
  },
];

export const INITIAL_EVIDENCE: EvidenceDocument[] = [
  {
    id: 'evd-301',
    title: 'Security Architecture & Penetration Test Report',
    category: 'Security Evidence',
    deliverableType: 'Security Review Document',
    assetId: 'ast-101',
    assetName: 'Fraud Detection Sentinel Agent',
    uploadedBy: 'Sarah Jenkins',
    uploadDate: '2026-07-28',
    version: '2.0',
    status: 'Approved',
    description: 'Comprehensive security review, threat model, and 3rd party penetration test evidence for Sentinel Agent.',
  },
];

export const INITIAL_FINDINGS: Finding[] = [
  {
    id: 'fnd-401',
    title: 'Agent Consensus Circuit Breaker Missing',
    assetId: 'ast-106',
    assetName: 'Enterprise Portfolio Multi-Agent System',
    severity: 'Critical',
    status: 'Open',
    assignedTo: 'Sarah Jenkins',
    reportedBy: 'Dr. Aris Thorne',
    reportedDate: '2026-08-05',
    description: 'Multi-agent swarm lacks hard-coded execution kill switch if market volatility exceeds 15% threshold within 60 seconds.',
  },
];

export const INITIAL_COMPLIANCE_ASSESSMENTS: ComplianceAssessmentRecord[] = [
  {
    id: 'cmp-501',
    assetId: 'ast-101',
    assetName: 'Fraud Detection Sentinel Agent',
    controlId: 'RBI-001',
    controlName: 'Named Accountable Ownership Required',
    status: 'Compliant',
    score: 100,
    evidenceRefs: ['evd-301'],
    assessor: 'Robert Vance (Auditor)',
    assessedDate: '2026-08-05',
    notes: 'All 5 RACIS ownership roles assigned and verified.',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1001',
    timestamp: '2026-08-07 10:42:15',
    userId: 'usr-2',
    userName: 'David Chen',
    userRole: 'GOVERNANCE_ADMIN',
    action: 'MONITORING_ALERT_TRIGGERED',
    entityType: 'ScheduledReview',
    entityId: 'ast-106',
    entityName: 'Enterprise Portfolio Multi-Agent System',
    details: 'Triggered automated Governance Health Alert for ast-106 following critical incident engagement.',
    ipAddress: '10.240.12.88',
  },
];

// ------------------- RELEASE 2 — GOVERNANCE CONTINUITY -------------------

export const INITIAL_REASSESSMENT_TRIGGERS: ReassessmentTrigger[] = [
  {
    id: 'trg-901',
    assetId: 'ast-102',
    assetName: 'Retail Credit Scoring Engine',
    triggerType: 'Model Change',
    dateDetected: '2026-08-01',
    severity: 'High',
    owner: 'Elena Rostova (Risk Officer)',
    status: 'Resolved',
    comments: 'Underlying XGBoost model retrained on updated bureau data. Reassessment required before continued use in underwriting decisions.',
  },
  {
    id: 'trg-902',
    assetId: 'ast-106',
    assetName: 'Enterprise Portfolio Multi-Agent System',
    triggerType: 'Control Failure',
    dateDetected: '2026-08-06',
    severity: 'Critical',
    owner: 'Sarah Jenkins (Super Admin)',
    status: 'Open',
    comments: 'Swarm consensus circuit breaker missing. Reassessment required before any production consideration.',
  },
];

export const INITIAL_REAUTHORIZATION_RECORDS: GovernanceReauthorizationRecord[] = [
  {
    id: 'reauth-801',
    assetId: 'ast-102',
    assetName: 'Retail Credit Scoring Engine',
    reviewedBy: 'David Chen (Governance Admin)',
    reviewDate: '2026-08-05',
    decision: 'CONDITIONAL GO',
    reason: 'Model change validated. Retrained model shows acceptable bias and performance drift within tolerance under continued monitoring.',
    supportingNotes: 'Conditional on monthly drift monitoring and quarterly revalidation until full reauthorization.',
    previousState: 'Reassessment Required',
    newState: 'Conditional GO',
  },
];

// ------------------- RELEASE 3 — EVIDENCE FOUNDATION -------------------

export const INITIAL_EVIDENCE_RECORDS: EvidenceRecord[] = [
  {
    id: 'evr-101',
    name: 'Fraud Sentinel Agent — Independent Validation Report',
    evidenceType: 'Validation Report',
    status: 'Active',
    createdDate: '2026-07-28',
    expiryDate: '2027-07-28',
    description: 'Independent validation of fraud detection accuracy, bias and security posture.',
    assetId: 'ast-101',
    assetName: 'Fraud Detection Sentinel Agent',
    ownership: {
      evidenceOwner: 'Dr. Aris Thorne',
      businessOwner: 'Marcus Vance',
      reviewer: 'David Chen',
      approvalAuthority: 'Sarah Jenkins',
    },
    traceability: { decisionRecordRef: 'Decision Authority Gatekeeper — GO' },
  },
  {
    id: 'evr-102',
    name: 'Fraud Sentinel Agent — Kill Switch Control Assessment',
    evidenceType: 'Control Assessment',
    status: 'Active',
    createdDate: '2026-08-11',
    expiryDate: '2026-09-10',
    description: 'Assessment of the emergency kill switch and circuit-breaker control for the agent.',
    assetId: 'ast-101',
    assetName: 'Fraud Detection Sentinel Agent',
    ownership: {
      evidenceOwner: 'Elena Rostova',
      reviewer: 'Sarah Jenkins',
    },
  },
  {
    id: 'evr-103',
    name: 'Credit Scoring Engine — Risk Assessment',
    evidenceType: 'Risk Assessment',
    status: 'Active',
    createdDate: '2026-03-10',
    expiryDate: '2027-03-10',
    description: 'Formal risk tiering covering data sensitivity, decision impact and operational impact.',
    assetId: 'ast-102',
    assetName: 'Retail Credit Scoring Engine',
    ownership: {
      evidenceOwner: 'Elena Rostova',
      businessOwner: 'Marcus Vance',
      approvalAuthority: 'David Chen',
    },
    traceability: { riskAssessmentRef: 'High Risk Tier — RiskAssessment' },
  },
  {
    id: 'evr-104',
    name: 'Credit Scoring Engine — Conditional GO Approval Record',
    evidenceType: 'Approval Record',
    status: 'Active',
    createdDate: '2026-08-05',
    description: 'Approval record for the Conditional GO decision following model-change reassessment.',
    assetId: 'ast-102',
    assetName: 'Retail Credit Scoring Engine',
    ownership: {
      evidenceOwner: 'David Chen',
      approvalAuthority: 'David Chen',
    },
    traceability: { decisionRecordRef: 'CONDITIONAL GO — 2026-08-05', reauthorizationRecordRef: 'reauth-801' },
  },
  {
    id: 'evr-105',
    name: 'Concierge Copilot — Agent Handling Training Record',
    evidenceType: 'Training Record',
    status: 'Active',
    createdDate: '2026-02-20',
    expiryDate: '2026-08-25',
    description: 'Branch representative training on AI-assisted customer handling and escalation.',
    assetId: 'ast-103',
    assetName: 'Customer Concierge Copilot',
    ownership: {
      evidenceOwner: 'Marcus Vance',
      reviewer: 'David Chen',
    },
  },
  {
    id: 'evr-106',
    name: 'Concierge Copilot — Data Handling Policy',
    evidenceType: 'Policy Document',
    status: 'Active',
    createdDate: '2026-02-01',
    expiryDate: '2027-01-01',
    description: 'Internal policy governing customer data handling within the copilot conversation flow.',
    assetId: 'ast-103',
    assetName: 'Customer Concierge Copilot',
    ownership: {
      evidenceOwner: 'David Chen',
      approvalAuthority: 'David Chen',
    },
  },
  {
    id: 'evr-107',
    name: 'AML RAG — Vendor Data Provider Assessment',
    evidenceType: 'Third-Party Assessment',
    status: 'Draft',
    createdDate: '2026-08-06',
    description: 'Assessment of the third-party financial crime data provider feeding the RAG index.',
    assetId: 'ast-104',
    assetName: 'AML Regulatory Intelligence RAG',
    ownership: {
      evidenceOwner: 'David Chen',
      reviewer: 'Elena Rostova',
    },
  },
  {
    id: 'evr-108',
    name: 'AML RAG — Q2 Governance Review',
    evidenceType: 'Governance Review',
    status: 'Expired',
    createdDate: '2026-05-01',
    expiryDate: '2026-08-01',
    description: 'Quarterly governance review of the AML regulatory intelligence RAG system.',
    assetId: 'ast-104',
    assetName: 'AML Regulatory Intelligence RAG',
    ownership: {
      evidenceOwner: 'Elena Rostova',
      reviewer: 'David Chen',
    },
  },
  {
    id: 'evr-109',
    name: 'Mortgage Workflow — OCR Control Assessment',
    evidenceType: 'Control Assessment',
    status: 'Active',
    createdDate: '2026-06-30',
    expiryDate: '2027-06-30',
    description: 'Control assessment of document extraction accuracy and human review checkpoints.',
    assetId: 'ast-105',
    assetName: 'Mortgage Document Intelligence Workflow',
    ownership: {
      evidenceOwner: 'Sarah Jenkins',
      businessOwner: 'Marcus Vance',
    },
  },
  {
    id: 'evr-110',
    name: 'Mortgage Workflow — Legacy Extraction Audit Finding',
    evidenceType: 'Audit Finding',
    status: 'Archived',
    createdDate: '2026-04-15',
    description: 'Closed audit finding on an earlier document extraction accuracy gap, now remediated.',
    assetId: 'ast-105',
    assetName: 'Mortgage Document Intelligence Workflow',
    ownership: {
      evidenceOwner: 'Robert Vance',
    },
  },
  {
    id: 'evr-111',
    name: 'Multi-Agent System — Consensus Loop Incident Report',
    evidenceType: 'Incident Report',
    status: 'Active',
    createdDate: '2026-08-06',
    description: 'Incident report for the swarm consensus volatility anomaly during stress testing.',
    assetId: 'ast-106',
    assetName: 'Enterprise Portfolio Multi-Agent System',
    ownership: {
      evidenceOwner: 'Dr. Aris Thorne',
      reviewer: 'Sarah Jenkins',
    },
    traceability: { timelineEventRef: 'Swarm Consensus Loop Volatility Anomaly — inc-601' },
  },
  {
    id: 'evr-112',
    name: 'Multi-Agent System — Pre-Incident Validation Report',
    evidenceType: 'Validation Report',
    status: 'Superseded',
    createdDate: '2026-07-15',
    expiryDate: '2026-08-06',
    description: 'Original validation report, superseded following the circuit-breaker finding.',
    assetId: 'ast-106',
    assetName: 'Enterprise Portfolio Multi-Agent System',
    ownership: {
      evidenceOwner: 'Dr. Aris Thorne',
    },
  },
];

// ------------------- RELEASE 5 — COMPLIANCE PACK FRAMEWORK -------------------
// Framework demonstration only — no RBI, ISO 42001 or EU AI Act control
// content. Sample requirements and controls illustrate the architecture.

export const INITIAL_COMPLIANCE_PACKS: CompliancePack[] = [
  {
    id: 'pack-rbi-demo',
    name: 'RBI Demo Pack',
    version: '1.0',
    status: 'Active',
    owner: 'David Chen',
    description: 'Sample pack illustrating how a banking regulator framework plugs into the Compliance Pack Framework. Structure only — not real RBI content.',
    industry: 'Banking & Financial Services',
    effectiveDate: '2026-01-01',
  },
  {
    id: 'pack-iso-demo',
    name: 'ISO Demo Pack',
    version: '1.0',
    status: 'Active',
    owner: 'Elena Rostova',
    description: 'Sample pack illustrating a cross-industry management-system standard. Structure only — not real ISO 42001 content.',
    industry: 'Cross-Industry',
    effectiveDate: '2026-02-01',
  },
  {
    id: 'pack-euai-demo',
    name: 'EU AI Demo Pack',
    version: '0.1',
    status: 'Draft',
    owner: 'Robert Vance',
    description: 'Sample pack illustrating a risk-tiered regional regulation. Structure only — not real EU AI Act content.',
    industry: 'Cross-Industry · EU Operations',
    effectiveDate: '2026-06-01',
  },
];

export const INITIAL_COMPLIANCE_REQUIREMENTS: ComplianceRequirement[] = [
  {
    id: 'RBI-REQ-001',
    name: 'Named Accountable Ownership',
    description: 'Every in-scope AI system must have named, accountable ownership on record.',
    packId: 'pack-rbi-demo',
    packName: 'RBI Demo Pack',
    category: 'Governance',
    priority: 'Critical',
    status: 'Active',
  },
  {
    id: 'RBI-REQ-002',
    name: 'Independent Control Assessment',
    description: 'In-scope AI systems must undergo independent control assessment.',
    packId: 'pack-rbi-demo',
    packName: 'RBI Demo Pack',
    category: 'Validation',
    priority: 'High',
    status: 'Active',
  },
  {
    id: 'ISO-REQ-101',
    name: 'AI Management System Documentation',
    description: 'A documented AI management system policy must be maintained.',
    packId: 'pack-iso-demo',
    packName: 'ISO Demo Pack',
    category: 'Documentation',
    priority: 'High',
    status: 'Active',
  },
  {
    id: 'ISO-REQ-102',
    name: 'Risk Assessment Process',
    description: 'A repeatable risk assessment process must be documented and evidenced.',
    packId: 'pack-iso-demo',
    packName: 'ISO Demo Pack',
    category: 'Risk',
    priority: 'High',
    status: 'Active',
  },
  {
    id: 'EUAI-REQ-210',
    name: 'High-Risk System Human Oversight',
    description: 'High-risk AI systems must have documented human oversight arrangements.',
    packId: 'pack-euai-demo',
    packName: 'EU AI Demo Pack',
    category: 'Oversight',
    priority: 'Critical',
    status: 'Draft',
  },
];

export const INITIAL_PACK_CONTROLS: PackControl[] = [
  {
    id: 'ctl-rbi-001a',
    name: 'Ownership Matrix Control',
    description: 'Verifies every in-scope asset has a complete Governance Authority Profile.',
    requirementId: 'RBI-REQ-001',
    requirementName: 'Named Accountable Ownership',
    owner: 'David Chen',
    status: 'Active',
  },
  {
    id: 'ctl-rbi-002a',
    name: 'Independent Assessment Control',
    description: 'Verifies an independent control assessment has been performed and filed.',
    requirementId: 'RBI-REQ-002',
    requirementName: 'Independent Control Assessment',
    owner: 'Dr. Aris Thorne',
    status: 'Active',
  },
  {
    id: 'ctl-iso-101a',
    name: 'AIMS Policy Control',
    description: 'Verifies a current AI management system policy document is on file.',
    requirementId: 'ISO-REQ-101',
    requirementName: 'AI Management System Documentation',
    owner: 'Elena Rostova',
    status: 'Active',
  },
  {
    id: 'ctl-iso-102a',
    name: 'Risk Process Control',
    description: 'Verifies a documented, evidenced risk assessment process exists.',
    requirementId: 'ISO-REQ-102',
    requirementName: 'Risk Assessment Process',
    owner: 'Elena Rostova',
    status: 'Active',
  },
  {
    id: 'ctl-euai-210a',
    name: 'Human Oversight Control',
    description: 'Verifies documented human oversight arrangements for high-risk systems.',
    requirementId: 'EUAI-REQ-210',
    requirementName: 'High-Risk System Human Oversight',
    owner: '',
    status: 'Draft',
  },
];

/**
 * Evidence collected once (Release 3's Evidence Registry) and reused across
 * packs — the whole point of Capability 4. RBI Demo Pack ends up fully
 * Covered, ISO Demo Pack Partially Covered, EU AI Demo Pack Not Covered, so
 * the Compliance Coverage capability demonstrates all three live outcomes.
 */
export const INITIAL_EVIDENCE_MAPPINGS: EvidenceMapping[] = [
  {
    id: 'map-001',
    controlId: 'ctl-rbi-001a',
    controlName: 'Ownership Matrix Control',
    evidenceId: 'evr-101',
    evidenceName: 'Fraud Sentinel Agent — Independent Validation Report',
  },
  {
    id: 'map-002',
    controlId: 'ctl-rbi-002a',
    controlName: 'Independent Assessment Control',
    evidenceId: 'evr-109',
    evidenceName: 'Mortgage Workflow — OCR Control Assessment',
  },
  {
    id: 'map-003',
    controlId: 'ctl-iso-101a',
    controlName: 'AIMS Policy Control',
    evidenceId: 'evr-106',
    evidenceName: 'Concierge Copilot — Data Handling Policy',
  },
];

/**
 * Release 6 — Universal Regulatory Knowledge & Obligation Engine (Foundation
 * Edition). Source -> Requirement -> Obligation -> Control -> Evidence, one
 * layer deeper than Release 5's Pack -> Requirement -> Control -> Evidence.
 * Deliberately generic sample structure — no RBI, ISO 42001, EU AI Act or
 * NIST content, per the blueprint's explicit "foundation, not regulation"
 * scoping. Evidence mappings reuse the same Release 3 evidence records
 * Release 5's demo packs reference, illustrating "collect once, reuse
 * everywhere" across every layer of the platform, not just one framework.
 */
export const INITIAL_REGULATORY_SOURCES: RegulatorySource[] = [
  {
    id: 'src-demo-001',
    name: 'Sample Regulatory Source',
    sourceType: 'Framework',
    jurisdiction: 'Cross-Jurisdiction',
    industry: 'Cross-Industry',
    version: '1.0',
    status: 'Active',
    effectiveDate: '2026-01-01',
    reviewDate: '2026-12-01',
  },
];

export const INITIAL_REGULATORY_REQUIREMENTS: RegulatoryRequirement[] = [
  {
    id: 'REQ-OVERSIGHT-001',
    name: 'Human Oversight Required',
    description: 'In-scope AI systems must have documented, effective human oversight arrangements.',
    category: 'Oversight',
    criticality: 'Critical',
    status: 'Active',
    sourceId: 'src-demo-001',
    sourceName: 'Sample Regulatory Source',
  },
  {
    id: 'REQ-VALIDATION-001',
    name: 'Independent Validation Required',
    description: 'In-scope AI systems must undergo independent validation before production use.',
    category: 'Validation',
    criticality: 'High',
    status: 'Active',
    sourceId: 'src-demo-001',
    sourceName: 'Sample Regulatory Source',
  },
  {
    id: 'REQ-AUDIT-001',
    name: 'Audit Trail Required',
    description: 'In-scope AI systems must maintain a retrievable audit trail of governance decisions.',
    category: 'Audit',
    criticality: 'High',
    status: 'Active',
    sourceId: 'src-demo-001',
    sourceName: 'Sample Regulatory Source',
  },
  {
    id: 'REQ-REVIEW-001',
    name: 'Periodic Review Required',
    description: 'In-scope AI systems must undergo periodic governance review on a defined cadence.',
    category: 'Review',
    criticality: 'Medium',
    status: 'Draft',
    sourceId: 'src-demo-001',
    sourceName: 'Sample Regulatory Source',
  },
];

/**
 * Capability 3 — Obligation Engine. "Human Oversight Required" translated
 * into its four actionable obligations, exactly as illustrated in the
 * blueprint.
 */
export const INITIAL_OBLIGATIONS: Obligation[] = [
  {
    id: 'obl-named-owner',
    name: 'Named Owner',
    description: 'A named individual is accountable for human oversight of the system.',
    owner: 'David Chen',
    status: 'Active',
    requirementId: 'REQ-OVERSIGHT-001',
    requirementName: 'Human Oversight Required',
  },
  {
    id: 'obl-approval-authority',
    name: 'Approval Authority',
    description: 'A named authority must approve the system before it operates autonomously.',
    owner: 'David Chen',
    status: 'Active',
    requirementId: 'REQ-OVERSIGHT-001',
    requirementName: 'Human Oversight Required',
  },
  {
    id: 'obl-escalation-path',
    name: 'Escalation Path',
    description: 'A defined path exists for escalating oversight concerns.',
    owner: 'Elena Rostova',
    status: 'Active',
    requirementId: 'REQ-OVERSIGHT-001',
    requirementName: 'Human Oversight Required',
  },
  {
    id: 'obl-override-capability',
    name: 'Override Capability',
    description: 'A human can override or halt the system’s autonomous action.',
    owner: '',
    status: 'Draft',
    requirementId: 'REQ-OVERSIGHT-001',
    requirementName: 'Human Oversight Required',
  },
  {
    id: 'obl-validation-signoff',
    name: 'Validation Sign-Off',
    description: 'An independent validator signs off before production use.',
    owner: 'Dr. Aris Thorne',
    status: 'Active',
    requirementId: 'REQ-VALIDATION-001',
    requirementName: 'Independent Validation Required',
  },
  {
    id: 'obl-audit-log-retention',
    name: 'Audit Log Retention',
    description: 'Governance decisions are logged and retained for the audit trail.',
    owner: 'Robert Vance',
    status: 'Active',
    requirementId: 'REQ-AUDIT-001',
    requirementName: 'Audit Trail Required',
  },
];

/**
 * Capability 4 — Control Mapping Engine. Maps each obligation to the OMG
 * control that satisfies it, per the blueprint's "Human Oversight ->
 * Governance Authority Profile -> Human Oversight Classification -> Autonomy
 * Level -> Approval Authority" example.
 */
export const INITIAL_OBLIGATION_CONTROLS: ObligationControl[] = [
  {
    id: 'octl-authority-profile',
    name: 'Governance Authority Profile Control',
    description: 'Verifies the asset’s Governance Authority Profile names an accountable owner.',
    owner: 'David Chen',
    status: 'Active',
    obligationId: 'obl-named-owner',
    obligationName: 'Named Owner',
  },
  {
    id: 'octl-approval-authority',
    name: 'Approval Authority Control',
    description: 'Verifies a named approval authority signed off before autonomous operation.',
    owner: 'David Chen',
    status: 'Active',
    obligationId: 'obl-approval-authority',
    obligationName: 'Approval Authority',
  },
  {
    id: 'octl-escalation-path',
    name: 'Escalation Path Control',
    description: 'Verifies a documented escalation path exists for oversight concerns.',
    owner: 'Elena Rostova',
    status: 'Active',
    obligationId: 'obl-escalation-path',
    obligationName: 'Escalation Path',
  },
  {
    id: 'octl-override-capability',
    name: 'Override Capability Control',
    description: 'Verifies a human override or kill switch capability exists.',
    owner: '',
    status: 'Draft',
    obligationId: 'obl-override-capability',
    obligationName: 'Override Capability',
  },
  {
    id: 'octl-validation-signoff',
    name: 'Validation Sign-Off Control',
    description: 'Verifies independent validation was completed and recorded.',
    owner: 'Dr. Aris Thorne',
    status: 'Active',
    obligationId: 'obl-validation-signoff',
    obligationName: 'Validation Sign-Off',
  },
  {
    id: 'octl-audit-log-retention',
    name: 'Audit Log Retention Control',
    description: 'Verifies governance decisions are logged and retained.',
    owner: 'Robert Vance',
    status: 'Active',
    obligationId: 'obl-audit-log-retention',
    obligationName: 'Audit Log Retention',
  },
];

/**
 * Capability 5 — Evidence Mapping Engine. Reuses Release 3 evidence already
 * on file — three of six controls end up Covered, two Not Covered (one
 * missing evidence, one missing both owner and evidence) and one Draft
 * requirement is Not Applicable, so the Coverage Engine demonstrates every
 * live outcome from a single source.
 */
export const INITIAL_OBLIGATION_EVIDENCE_MAPPINGS: ObligationEvidenceMapping[] = [
  {
    id: 'omap-001',
    controlId: 'octl-authority-profile',
    controlName: 'Governance Authority Profile Control',
    evidenceId: 'evr-101',
    evidenceName: 'Fraud Sentinel Agent — Independent Validation Report',
  },
  {
    id: 'omap-002',
    controlId: 'octl-approval-authority',
    controlName: 'Approval Authority Control',
    evidenceId: 'evr-104',
    evidenceName: 'Credit Scoring Engine — Conditional GO Approval Record',
  },
  {
    id: 'omap-003',
    controlId: 'octl-validation-signoff',
    controlName: 'Validation Sign-Off Control',
    evidenceId: 'evr-103',
    evidenceName: 'Credit Scoring Engine — Risk Assessment',
  },
];

/**
 * Release 7 — Governance Intelligence Engine (Foundation Edition). One
 * policy per Condition Type the Condition Engine detects, matching the
 * blueprint's own four named examples plus two more for full coverage.
 * Conditions, Violations and Outcomes are computed live from real asset data
 * (governanceReasoningEngine.ts) — only Policies and Findings are persisted.
 * No Findings are seeded: the Governance Intelligence Workspace generates
 * them from currently-detected violations against real seeded asset data,
 * so a stale hardcoded finding can never drift from what the engine
 * actually detects.
 */
export const INITIAL_GOVERNANCE_POLICIES: GovernancePolicy[] = [
  {
    id: 'POL-EVIDENCE-CURRENT',
    name: 'Evidence Must Be Current',
    description: 'All evidence supporting a governance decision must be unexpired.',
    category: 'Evidence',
    severity: 'High',
    status: 'Active',
    triggerCondition: 'Evidence Expired',
    linkedControlIds: [],
  },
  {
    id: 'POL-REVIEW-PERFORMED',
    name: 'Review Must Be Performed',
    description: 'Scheduled governance reviews must be completed by their due date.',
    category: 'Review',
    severity: 'Medium',
    status: 'Active',
    triggerCondition: 'Review Overdue',
    linkedControlIds: [],
  },
  {
    id: 'POL-APPROVAL-BEFORE-GO',
    name: 'Approval Required Before GO',
    description: 'No AI asset may operate without a recorded GO / CONDITIONAL GO / NO GO decision.',
    category: 'Decision',
    severity: 'Critical',
    status: 'Active',
    triggerCondition: 'Missing Approval',
    obligationId: 'obl-approval-authority',
    obligationName: 'Approval Authority',
    linkedControlIds: ['octl-approval-authority'],
  },
  {
    id: 'POL-VALIDATION-REQUIRED',
    name: 'Independent Validation Required',
    description: 'AI assets must carry at least one approved independent validation.',
    category: 'Validation',
    severity: 'High',
    status: 'Active',
    triggerCondition: 'Missing Validation',
    obligationId: 'obl-validation-signoff',
    obligationName: 'Validation Sign-Off',
    linkedControlIds: ['octl-validation-signoff'],
  },
  {
    id: 'POL-NAMED-OWNERSHIP',
    name: 'Named Ownership Required',
    description: 'Every AI asset must have a complete Governance Authority Profile.',
    category: 'Governance',
    severity: 'Medium',
    status: 'Active',
    triggerCondition: 'Missing Owner',
    obligationId: 'obl-named-owner',
    obligationName: 'Named Owner',
    linkedControlIds: ['octl-authority-profile'],
  },
  {
    id: 'POL-REAUTH-REQUIRED',
    name: 'Reauthorization Required After Reassessment',
    description: 'Assets in Reassessment Required must reach a recorded reauthorization decision.',
    category: 'Continuity',
    severity: 'Critical',
    status: 'Active',
    triggerCondition: 'Missing Reauthorization',
    linkedControlIds: [],
  },
];

export const INITIAL_GOVERNANCE_FINDINGS: GovernanceFinding[] = [];

/**
 * Release 8 — Governance Intelligence Engine (Actions Edition). No actions
 * are seeded — same reasoning as Findings above: the Governance Actions
 * Workspace generates them from whatever the Recommended Action Engine
 * actually produces against real seeded asset data.
 */
export const INITIAL_RECOMMENDED_ACTIONS: RecommendedAction[] = [];
