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
  CorrectiveAction
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
      '/validation', '/evidence', '/review-workbench', '/findings', '/validation-dashboard', 
      '/decision-intelligence', '/governance-blockers', '/decision-workbench-v4', '/decision-dashboard',
      '/compliance-center', '/regulatory-library', '/compliance-assessment', '/compliance-findings', '/compliance-dashboard',
      '/operations-center', '/kill-switch', '/override-center', '/incidents', '/operations-dashboard', '/retirement', '/governance-timeline',
      '/governance-monitoring', '/governance-alerts', '/review-calendar', '/corrective-actions', '/governance-trends',
      '/users', '/audit-logs',
      // Phase 8 — Governance Operating System
      '/asset-lifecycle', '/rbac', '/tenant-settings', '/command-center',
      // Phase 9 — Executive Governance & Policy Governance
      '/executive-hub', '/governance-scorecards', '/executive-heatmaps', '/governance-insights',
      '/board-reporting', '/policy-management', '/policy-mapping', '/policy-violations',
      // Phase 10 — Governance Change Management
      '/change-requests', '/change-impact', '/change-dashboard', '/change-history', '/governance-triggers'
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
      '/validation', '/evidence', '/review-workbench', '/findings', '/validation-dashboard', 
      '/decision-intelligence', '/governance-blockers', '/decision-workbench-v4', '/decision-dashboard',
      '/compliance-center', '/regulatory-library', '/compliance-assessment', '/compliance-findings', '/compliance-dashboard',
      '/operations-center', '/kill-switch', '/override-center', '/incidents', '/operations-dashboard', '/retirement', '/governance-timeline',
      '/governance-monitoring', '/governance-alerts', '/review-calendar', '/corrective-actions', '/governance-trends',
      '/audit-logs',
      // Phase 8 — Governance Operating System
      '/asset-lifecycle', '/tenant-settings', '/command-center',
      // Phase 9 — Executive Governance & Policy Governance
      '/executive-hub', '/governance-scorecards', '/executive-heatmaps', '/governance-insights',
      '/board-reporting', '/policy-management', '/policy-mapping', '/policy-violations',
      // Phase 10 — Governance Change Management
      '/change-requests', '/change-impact', '/change-dashboard', '/change-history', '/governance-triggers'
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
      '/', '/dashboard', '/assets', '/risk', '/evidence', '/review-workbench', '/findings', 
      '/decision-intelligence', '/governance-blockers', '/decision-dashboard',
      '/compliance-center', '/regulatory-library', '/compliance-findings', '/compliance-dashboard',
      '/operations-center', '/kill-switch', '/override-center', '/incidents', '/operations-dashboard', '/governance-timeline',
      '/governance-monitoring', '/governance-alerts', '/review-calendar', '/corrective-actions', '/governance-trends', '/audit-logs',
      // Phase 8 — Governance Operating System
      '/asset-lifecycle', '/command-center',
      // Phase 9 — Executive Governance & Policy Governance
      '/executive-hub', '/governance-scorecards', '/executive-heatmaps', '/governance-insights',
      '/policy-management', '/policy-violations',
      // Phase 10 — Governance Change Management
      '/change-requests', '/change-impact', '/change-dashboard', '/change-history', '/governance-triggers'
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
      '/', '/dashboard', '/assets', '/ownership', '/evidence', '/decision-intelligence', 
      '/compliance-center', '/operations-center', '/kill-switch', '/incidents', '/governance-timeline',
      '/governance-monitoring', '/review-calendar', '/corrective-actions',
      // Phase 8 — Governance Operating System
      '/asset-lifecycle', '/command-center',
      // Phase 9 — Executive Governance & Policy Governance
      '/executive-hub', '/policy-management', '/policy-violations',
      // Phase 10 — Governance Change Management
      '/change-requests', '/change-dashboard', '/change-history'
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
      '/', '/dashboard', '/assets', '/validation', '/evidence', '/review-workbench', '/findings', 
      '/validation-dashboard', '/decision-intelligence', '/compliance-assessment', '/incidents', '/governance-timeline',
      '/governance-monitoring', '/corrective-actions',
      // Phase 8 — Governance Operating System
      '/asset-lifecycle', '/command-center',
      // Phase 9 — Executive Governance & Policy Governance
      '/governance-scorecards', '/policy-management', '/policy-violations',
      // Phase 10 — Governance Change Management
      '/change-requests', '/change-impact', '/change-history'
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
      '/', '/dashboard', '/assets', '/evidence', '/findings', '/decision-dashboard',
      '/compliance-center', '/regulatory-library', '/compliance-findings', '/compliance-dashboard',
      '/operations-center', '/kill-switch', '/override-center', '/incidents', '/operations-dashboard', '/retirement', '/governance-timeline',
      '/governance-monitoring', '/governance-alerts', '/review-calendar', '/corrective-actions', '/governance-trends', '/audit-logs',
      // Phase 8 — Governance Operating System
      '/asset-lifecycle', '/rbac', '/command-center',
      // Phase 9 — Executive Governance & Policy Governance
      '/executive-hub', '/governance-scorecards', '/executive-heatmaps', '/governance-insights',
      '/board-reporting', '/policy-management', '/policy-mapping', '/policy-violations',
      // Phase 10 — Governance Change Management
      '/change-requests', '/change-impact', '/change-dashboard', '/change-history', '/governance-triggers'
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
      '/change-dashboard'
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
