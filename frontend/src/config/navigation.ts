/**
 * OMG Phase 8A — Governance Navigation Architecture
 *
 * Navigation is organised around governance *journeys*, not feature lists.
 * Six governance domains answer six executive questions:
 *
 *   1. Registry     → What AI exists?
 *   2. Assurance    → Can this AI be trusted?
 *   3. Decision     → Can this AI move?
 *   4. Operations   → What is happening now?
 *   5. Oversight    → Prove what happened.
 *   6. Administration → Who can do what?
 *
 * Every route in the application is declared here exactly once. The sidebar,
 * breadcrumbs, command palette and RBAC administration matrix are all derived
 * from this single source of truth.
 */

export type ExperienceMode = 'executive' | 'governance';

export interface NavModule {
  /** Router path — also the RBAC permission key. */
  path: string;
  /** Label shown in navigation. */
  label: string;
  /** Short label used in the executive experience / breadcrumbs. */
  shortLabel?: string;
  icon: string;
  /** One-line purpose statement shown in the command palette and tooltips. */
  description: string;
  /** Keywords to broaden command-palette matching. */
  keywords?: string[];
  /** Small trailing chip in the sidebar. */
  badge?: string;
}

export interface NavDomain {
  id: string;
  label: string;
  /** The executive question this domain answers. */
  question: string;
  icon: string;
  /** Accent hue used for the domain rail and headers. */
  accent: string;
  modules: NavModule[];
}

/**
 * OMG Overview is the landing surface. Anyone signing in should first
 * understand what OMG is and why it exists, before the operational detail.
 */
export const OMG_OVERVIEW: NavModule = {
  path: '/',
  label: 'OMG Overview',
  icon: '📘',
  description: 'What OMG governs, why it exists and how the operating model works.',
  keywords: ['home', 'about', 'introduction', 'overview', 'start', 'what is omg', 'platform'],
};

/** The operational landing surface once the reader knows what OMG is. */
export const COMMAND_CENTER: NavModule = {
  path: '/command-center',
  label: 'Command Center',
  icon: '◎',
  description: 'Enterprise Governance Command Center — portfolio-wide governance posture.',
  keywords: ['command', 'executive', 'kpi', 'posture', 'dashboard'],
};

export const EXECUTIVE_DASHBOARD: NavModule = {
  path: '/dashboard',
  label: 'Executive Dashboard',
  icon: '▤',
  description: 'Single pane of glass across inventory, risk, ownership and decisions.',
  keywords: ['metrics', 'kpi', 'board', 'summary'],
};

export const NAV_DOMAINS: NavDomain[] = [
  {
    id: 'executive',
    label: 'Executive Governance',
    question: 'Is enterprise AI under control?',
    icon: '🏛️',
    accent: '#F59E0B',
    modules: [
      {
        path: '/executive-hub',
        label: 'Executive Hub',
        icon: '🏛️',
        description:
          'Executive AI governance posture in five minutes, tuned to the CIO, CRO, Compliance or Board lens.',
        keywords: ['executive', 'cio', 'cro', 'board', 'hub', 'leadership'],
        badge: 'Phase 9',
      },
      {
        path: '/governance-scorecards',
        label: 'Governance Scorecards',
        icon: '🗂️',
        description:
          'Ownership, risk, validation, evidence and decision readiness scored across the estate.',
        keywords: ['scorecard', 'health index', 'readiness', 'score'],
      },
      {
        path: '/executive-heatmaps',
        label: 'Executive Heatmaps',
        icon: '🔥',
        description:
          'Risk concentration by business unit, AI category and governance lifecycle stage.',
        keywords: ['heatmap', 'business unit', 'concentration', 'exposure'],
      },
      {
        path: '/governance-insights',
        label: 'Governance Insights',
        icon: '💡',
        description: 'Trends and the shortest path from governance posture to executive action.',
        keywords: ['insight', 'trend', 'analytics', 'direction'],
      },
      {
        path: '/board-reporting',
        label: 'Board & Regulator Reporting',
        icon: '📑',
        description:
          'Executive Governance Report and Audit Readiness Report generated from the live record.',
        keywords: ['board', 'regulator', 'report', 'pack', 'audit readiness'],
      },
    ],
  },
  {
    id: 'policy',
    label: 'Policy Governance',
    question: 'What rules govern our AI?',
    icon: '📕',
    accent: '#EC4899',
    modules: [
      {
        path: '/policy-management',
        label: 'Policy Registry',
        icon: '📕',
        description:
          'The enterprise AI rulebook: governance, risk, security, privacy and vendor policy.',
        keywords: ['policy', 'rulebook', 'registry', 'standard'],
        badge: 'Phase 9',
      },
      {
        path: '/policy-mapping',
        label: 'Policy Mapping',
        icon: '🔗',
        description:
          'Bind policies to assets, asset types, vendors and business units; coverage is computed.',
        keywords: ['mapping', 'binding', 'coverage', 'applies to'],
      },
      {
        path: '/policy-violations',
        label: 'Policy Violations',
        icon: '🚨',
        description:
          'Detected and logged policy breaches through to accepted, remediated or closed.',
        keywords: ['violation', 'breach', 'non-compliance', 'exception'],
      },
    ],
  },
  {
    id: 'change',
    label: 'Change Governance',
    question: 'What changed, and who approved it?',
    icon: '🔁',
    accent: '#14B8A6',
    modules: [
      {
        path: '/change-requests',
        label: 'Change Request Center',
        icon: '🔁',
        description:
          'Raise, classify, impact-assess and route every significant change to a governed AI asset.',
        keywords: ['change', 'request', 'crq', 'amendment', 'modification'],
        badge: 'Phase 10',
      },
      {
        path: '/change-impact',
        label: 'Impact & Reassessment',
        icon: '🔬',
        description:
          'Governance impact profile across seven areas, and the rules that decide who must reapprove.',
        keywords: ['impact', 'reassessment', 'rules', 'magnitude', 'routing'],
      },
      {
        path: '/change-dashboard',
        label: 'Change Dashboard',
        icon: '📊',
        description:
          'Executive visibility into change activity, bottlenecks and pending reapprovals.',
        keywords: ['change dashboard', 'bottleneck', 'throughput', 'pipeline'],
      },
      {
        path: '/change-history',
        label: 'Change History & States',
        icon: '📜',
        description:
          'Immutable change audit trail and the governance state machine for every asset.',
        keywords: ['history', 'state machine', 'transition', 'lifecycle', 'trail'],
      },
      {
        path: '/governance-triggers',
        label: 'Governance Triggers',
        icon: '🔔',
        description:
          'Rules that convert change conditions into governance work automatically.',
        keywords: ['trigger', 'automation', 'escalation', 'rule'],
      },
    ],
  },
  {
    id: 'registry',
    label: 'AI Governance Registry',
    question: 'What AI exists?',
    icon: '📦',
    accent: '#6366F1',
    modules: [
      {
        path: '/assets',
        label: 'AI Asset Registry',
        icon: '🗂️',
        description: 'Authoritative inventory of every governed AI asset across the enterprise.',
        keywords: ['inventory', 'assets', 'register', 'catalog'],
        badge: 'Inventory',
      },
      {
        path: '/ownership',
        label: 'Ownership Matrix',
        icon: '👥',
        description: 'Five-role RACIS accountability for business, technical, risk, compliance and approval.',
        keywords: ['racis', 'owner', 'accountability', 'raci'],
        badge: 'RACIS',
      },
      {
        path: '/asset-lifecycle',
        label: 'Asset Lifecycle',
        icon: '🔄',
        description: 'Where every asset sits on the eight-stage governance journey.',
        keywords: ['journey', 'stage', 'lifecycle', 'pipeline'],
        badge: 'Journey',
      },
      {
        path: '/retirement',
        label: 'Asset Retirement',
        icon: '📦',
        description: 'Controlled decommissioning and archival of AI assets.',
        keywords: ['decommission', 'archive', 'sunset', 'retire'],
      },
    ],
  },
  {
    id: 'assurance',
    label: 'Risk & Compliance',
    question: 'Can this AI be trusted?',
    icon: '🛡️',
    accent: '#F97316',
    modules: [
      {
        path: '/risk',
        label: 'Risk Center',
        icon: '⚡',
        description: 'Risk tiering across data sensitivity, decision impact and operational impact.',
        keywords: ['risk', 'tier', 'classification', 'severity'],
      },
      {
        path: '/validation',
        label: 'Validation Center',
        icon: '🧪',
        description: 'Independent multi-disciplinary validation reviews and scoring.',
        keywords: ['test', 'validate', 'review', 'model risk'],
      },
      {
        path: '/evidence',
        label: 'Evidence Center',
        icon: '📄',
        description: 'ODF governance deliverables and audit-grade evidence library.',
        keywords: ['document', 'odf', 'deliverable', 'proof'],
      },
      {
        path: '/evidence-registry',
        label: 'Evidence Registry',
        icon: '🗃️',
        description: 'Universal governance evidence object — ownership, traceability, lifecycle and expiry.',
        keywords: ['evidence', 'registry', 'traceability', 'lifecycle', 'expiry'],
        badge: 'Release 3',
      },
      {
        path: '/findings',
        label: 'Findings Tracker',
        icon: '⚠️',
        description: 'Validation defects and remediation tracking through to verification.',
        keywords: ['defect', 'issue', 'gap', 'remediation'],
      },
      {
        path: '/governance-blockers',
        label: 'Governance Blockers',
        icon: '🧱',
        description: 'Hard blockers preventing an asset from receiving a production decision.',
        keywords: ['blocker', 'impediment', 'stop'],
      },
      {
        path: '/validation-dashboard',
        label: 'Validation Analytics',
        icon: '📊',
        description: 'Portfolio validation coverage, pass rates and open defect trends.',
        keywords: ['analytics', 'validation', 'coverage'],
      },
      {
        path: '/compliance-center',
        label: 'Compliance Center',
        icon: '🏛️',
        description: 'Regulatory control evaluation and compliance posture per asset.',
        keywords: ['regulation', 'rbi', 'control', 'compliance'],
      },
      {
        path: '/regulatory-library',
        label: 'Regulatory Library',
        icon: '📚',
        description: 'Catalogue of regulatory and internal policy controls in force.',
        keywords: ['rbi', 'policy', 'library', 'standards'],
      },
      {
        path: '/compliance-packs',
        label: 'Compliance Pack Framework',
        icon: '🧩',
        description: 'The reusable architecture every future regulation plugs into — packs, requirements, controls and evidence mappings.',
        keywords: ['compliance pack', 'requirement', 'control', 'coverage', 'framework', 'rbi', 'iso', 'eu ai act'],
        badge: 'Release 5',
      },
      {
        path: '/compliance-assessment',
        label: 'Compliance Assessment',
        icon: '📋',
        description: 'Control-by-control assessment workflow with evidence linkage.',
        keywords: ['assess', 'evaluate', 'control test'],
      },
      {
        path: '/compliance-findings',
        label: 'Compliance Gaps',
        icon: '🚨',
        description: 'Open regulatory gaps requiring remediation before audit.',
        keywords: ['gap', 'non-compliant', 'breach'],
      },
      {
        path: '/compliance-dashboard',
        label: 'Compliance Analytics',
        icon: '📈',
        description: 'Tenant-wide regulatory alignment scoring and coverage.',
        keywords: ['rbi score', 'analytics', 'alignment'],
      },
      {
        path: '/mapping-workspace',
        label: 'Mapping Workspace',
        icon: '🗺️',
        description: 'The reusable foundation every future regulation plugs into — sources, requirements, obligations, controls and evidence mappings.',
        keywords: ['regulatory source', 'obligation', 'mapping workspace', 'foundation', 'knowledge engine'],
        badge: 'Release 6',
      },
      {
        path: '/requirement-registry',
        label: 'Requirement Registry',
        icon: '📋',
        description: 'Every requirement registered across every regulatory source.',
        keywords: ['requirement registry', 'catalogue', 'regulatory'],
      },
      {
        path: '/obligation-library',
        label: 'Obligation Library',
        icon: '🎯',
        description: 'Every requirement translated into actionable obligations, browsable across sources.',
        keywords: ['obligation library', 'named owner', 'approval authority', 'escalation'],
      },
      {
        path: '/governance-intelligence',
        label: 'Governance Intelligence',
        icon: '🧠',
        description: 'Policy → Condition → Violation → Finding → Outcome, every outcome explainable — governance reasoning, not just governance records.',
        keywords: ['governance intelligence', 'policy', 'condition', 'finding', 'outcome', 'explainability', 'reasoning'],
        badge: 'Release 7',
      },
      {
        path: '/governance-actions',
        label: 'Governance Actions',
        icon: '🛠️',
        description: 'Recommended actions raised from governance outcomes — Accept, Reject or Defer. Nothing executes automatically; humans remain accountable.',
        keywords: ['governance actions', 'recommended action', 'accept', 'reject', 'defer', 'playbook'],
        badge: 'Release 8',
      },
    ],
  },
  {
    id: 'decision',
    label: 'Decision Governance',
    question: 'Can this AI move?',
    icon: '⚖️',
    accent: '#8B5CF6',
    modules: [
      {
        path: '/decision-workbench-v4',
        label: 'Decision Authority',
        shortLabel: 'Decision Authority',
        icon: '🖋️',
        description: 'Record GO / CONDITIONAL GO / NO GO decisions with full justification.',
        keywords: ['approve', 'go', 'no go', 'authority', 'sign off'],
        badge: 'Core',
      },
      {
        path: '/decision-intelligence',
        label: 'Decision Intelligence',
        icon: '⚖️',
        description: 'Governance readiness scoring and recommended decision outcome per asset.',
        keywords: ['readiness', 'score', 'recommendation'],
      },
      {
        path: '/review-workbench',
        label: 'Review Workbench',
        icon: '🧰',
        description: 'Reviewer working surface for validation and governance review execution.',
        keywords: ['reviewer', 'workbench', 'assess'],
      },
      {
        path: '/review-calendar',
        label: 'Review Calendar',
        icon: '📅',
        description: 'Scheduled governance review cadence and overdue review tracking.',
        keywords: ['schedule', 'cadence', 'calendar', 'due'],
      },
      {
        path: '/decision-dashboard',
        label: 'Decision Queue',
        icon: '🗳️',
        description: 'Live queue of pending, conditional and approved governance decisions.',
        keywords: ['queue', 'pending', 'approvals', 'decisions'],
      },
    ],
  },
  {
    id: 'operations',
    label: 'Operations & Monitoring',
    question: 'What is happening now?',
    icon: '📡',
    accent: '#06B6D4',
    modules: [
      {
        path: '/operations-dashboard',
        label: 'Operations Dashboard',
        icon: '📉',
        description: 'Runtime posture of production AI: active, suspended and under review.',
        keywords: ['runtime', 'production', 'live'],
      },
      {
        path: '/governance-monitoring',
        label: 'Governance Monitoring',
        icon: '👁️',
        description: 'Continuous governance health scoring across the AI portfolio.',
        keywords: ['health', 'monitor', 'continuous'],
      },
      {
        path: '/governance-alerts',
        label: 'Governance Alerts',
        icon: '🔔',
        description: 'Exception alerts for expired validation, overdue reviews and critical incidents.',
        keywords: ['alert', 'exception', 'warning'],
      },
      {
        path: '/corrective-actions',
        label: 'Corrective Actions',
        icon: '🛠️',
        description: 'Assigned remediation actions through to verified closure.',
        keywords: ['capa', 'remediate', 'fix', 'action'],
      },
      {
        path: '/operations-center',
        label: 'Operations Center',
        icon: '🎛️',
        description: 'Operational oversight of running AI systems and their control state.',
        keywords: ['control', 'operations', 'oversight'],
      },
      {
        path: '/kill-switch',
        label: 'Kill Switch Console',
        icon: '🛑',
        description: 'Emergency suspension of autonomous AI execution.',
        keywords: ['emergency', 'stop', 'suspend', 'circuit breaker'],
        badge: 'Critical',
      },
      {
        path: '/override-center',
        label: 'Human Override',
        icon: '✋',
        description: 'Human-in-the-loop interventions on autonomous AI decisions.',
        keywords: ['intervention', 'human', 'override'],
      },
      {
        path: '/incidents',
        label: 'Incident Management',
        icon: '⚡',
        description: 'AI incident triage, investigation, mitigation and closure.',
        keywords: ['incident', 'anomaly', 'outage'],
      },
    ],
  },
  {
    id: 'oversight',
    label: 'Audit & Oversight',
    question: 'Prove what happened.',
    icon: '🔍',
    accent: '#10B981',
    modules: [
      {
        path: '/governance-timeline',
        label: 'Governance Timeline',
        icon: '⏱️',
        description: 'Chronological governance event history for any AI asset.',
        keywords: ['history', 'timeline', 'events', 'chronology'],
      },
      {
        path: '/governance-trends',
        label: 'Governance Trends',
        icon: '📈',
        description: 'Portfolio governance health trajectory and directional analytics.',
        keywords: ['trend', 'analytics', 'health score'],
      },
      {
        path: '/audit-logs',
        label: 'Audit Logs',
        icon: '📜',
        description: 'Immutable Day-1 audit trail of every governance action taken.',
        keywords: ['audit', 'log', 'immutable', 'trail'],
        badge: 'Day 1',
      },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    question: 'Who can do what?',
    icon: '⚙️',
    accent: '#94A3B8',
    modules: [
      {
        path: '/users',
        label: 'User Management',
        icon: '🔐',
        description: 'Enterprise user directory and governance role assignment.',
        keywords: ['users', 'people', 'directory'],
      },
      {
        path: '/rbac',
        label: 'RBAC Administration',
        icon: '🧬',
        description: 'Role-to-module authorisation matrix across all governance personas.',
        keywords: ['permission', 'role', 'access', 'authorisation', 'rbac'],
      },
      {
        path: '/tenant-settings',
        label: 'Tenant Settings',
        icon: '🏢',
        description: 'Tenant profile, governance thresholds and platform experience defaults.',
        keywords: ['settings', 'configuration', 'tenant', 'thresholds'],
      },
    ],
  },
];

/* --------------------------------------------------------------------------
 * Phase 8G — Future module architecture preparation.
 * Routes and navigation entries exist now; implementation lands in later phases.
 * ----------------------------------------------------------------------- */
export interface FutureModule extends NavModule {
  phase: string;
  capabilities: string[];
}

export const FUTURE_MODULES: FutureModule[] = [
  {
    path: '/regulatory-compliance-center',
    label: 'Regulatory Compliance Center',
    icon: '🏛️',
    phase: 'Phase 10',
    description: 'Multi-jurisdiction regulatory obligation mapping and readiness.',
    capabilities: [
      'Multi-regulator obligation library',
      'Jurisdictional applicability engine',
      'Regulatory change management',
      'Examination readiness workspace',
    ],
  },
  {
    path: '/ai-control-library',
    label: 'AI Control Library',
    icon: '🧱',
    phase: 'Phase 11',
    description: 'Reusable AI control catalogue with automated control testing.',
    capabilities: [
      'Reusable control catalogue',
      'Control effectiveness testing',
      'Automated control evidence capture',
      'Control inheritance across assets',
    ],
  },
  {
    path: '/enterprise-reporting',
    label: 'Enterprise Reporting Suite',
    icon: '📑',
    phase: 'Phase 11',
    description: 'Configurable enterprise governance reporting and scheduled distribution.',
    capabilities: [
      'Report builder & templates',
      'Scheduled distribution',
      'Regulator-ready export formats',
      'Cross-tenant benchmarking',
    ],
  },
];

/* --------------------------------------------------------------------------
 * Phase 8D — Executive experience.
 * A deliberately narrow surface for CIO / CRO / CTO / Board audiences.
 * ----------------------------------------------------------------------- */
export const EXECUTIVE_NAV: { label: string; modules: NavModule[] }[] = [
  {
    label: 'Executive Surface',
    modules: [
      OMG_OVERVIEW,
      COMMAND_CENTER,
      {
        path: '/executive-hub',
        label: 'Executive Hub',
        icon: '🏛️',
        description: 'Governance posture through the CIO, CRO, Compliance or Board lens.',
      },
      EXECUTIVE_DASHBOARD,
      {
        path: '/decision-dashboard',
        label: 'Decision Queue',
        icon: '🗳️',
        description: 'Pending, conditional and approved AI decisions awaiting authority.',
      },
      {
        path: '/board-reporting',
        label: 'Board Reporting',
        icon: '📑',
        description: 'Executive governance and audit readiness reports for the board pack.',
      },
      {
        path: '/policy-violations',
        label: 'Policy Violations',
        icon: '🚨',
        description: 'Breaches of enterprise AI policy awaiting disposition.',
      },
      {
        path: '/risk',
        label: 'Risk Overview',
        icon: '⚡',
        description: 'Enterprise AI risk concentration and high-risk exposure.',
      },
      {
        path: '/assets',
        label: 'Production Assets',
        icon: '🗂️',
        description: 'AI assets approved and operating in production.',
      },
      {
        path: '/audit-logs',
        label: 'Audit Overview',
        icon: '📜',
        description: 'Immutable evidence that governance was applied.',
      },
    ],
  },
];

/* --------------------------------------------------------------------------
 * Derived lookups
 * ----------------------------------------------------------------------- */

export interface ModuleLocation {
  module: NavModule;
  domain?: NavDomain;
}

const MODULE_INDEX: Record<string, ModuleLocation> = (() => {
  const index: Record<string, ModuleLocation> = {
    [OMG_OVERVIEW.path]: { module: OMG_OVERVIEW },
    [COMMAND_CENTER.path]: { module: COMMAND_CENTER },
    [EXECUTIVE_DASHBOARD.path]: { module: EXECUTIVE_DASHBOARD },
  };
  NAV_DOMAINS.forEach(domain => {
    domain.modules.forEach(module => {
      index[module.path] = { module, domain };
    });
  });
  FUTURE_MODULES.forEach(module => {
    index[module.path] = { module };
  });
  return index;
})();

export function findModule(path: string): ModuleLocation | undefined {
  return MODULE_INDEX[path];
}

/** All navigable module paths (excluding future placeholders). */
export const ALL_MODULE_PATHS: string[] = [
  OMG_OVERVIEW.path,
  COMMAND_CENTER.path,
  EXECUTIVE_DASHBOARD.path,
  ...NAV_DOMAINS.flatMap(d => d.modules.map(m => m.path)),
];

/** Flat, searchable module list used by the command palette. */
export const SEARCHABLE_MODULES: { module: NavModule; domainLabel: string }[] = [
  { module: OMG_OVERVIEW, domainLabel: 'Start Here' },
  { module: COMMAND_CENTER, domainLabel: 'Command Center' },
  { module: EXECUTIVE_DASHBOARD, domainLabel: 'Command Center' },
  ...NAV_DOMAINS.flatMap(domain =>
    domain.modules.map(module => ({ module, domainLabel: domain.label }))
  ),
];
