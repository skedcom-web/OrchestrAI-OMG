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

/** Command Center sits above the domain structure — it is the landing surface. */
export const COMMAND_CENTER: NavModule = {
  path: '/',
  label: 'Command Center',
  icon: '◎',
  description: 'Enterprise Governance Command Center — portfolio-wide governance posture.',
  keywords: ['home', 'overview', 'executive', 'kpi', 'start'],
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
      {
        path: '/platform-overview',
        label: 'Platform Overview',
        icon: '📘',
        description: 'What OMG governs, why it exists and how the operating model works.',
        keywords: ['about', 'help', 'overview', 'introduction'],
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
    path: '/executive-hub',
    label: 'Executive Governance Hub',
    icon: '🌐',
    phase: 'Phase 9',
    description: 'Board-level governance narrative, committee packs and executive attestation.',
    capabilities: [
      'Board & committee reporting packs',
      'Executive attestation workflow',
      'Governance narrative generation',
      'Cross-domain escalation routing',
    ],
  },
  {
    path: '/policy-management',
    label: 'Policy Management',
    icon: '📕',
    phase: 'Phase 10',
    description: 'Authoring, versioning and attestation of enterprise AI policy.',
    capabilities: [
      'Policy authoring & versioning',
      'Policy-to-control mapping',
      'Attestation & acknowledgement tracking',
      'Exception and waiver register',
    ],
  },
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
      COMMAND_CENTER,
      EXECUTIVE_DASHBOARD,
      {
        path: '/decision-dashboard',
        label: 'Decision Queue',
        icon: '🗳️',
        description: 'Pending, conditional and approved AI decisions awaiting authority.',
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
  COMMAND_CENTER.path,
  EXECUTIVE_DASHBOARD.path,
  ...NAV_DOMAINS.flatMap(d => d.modules.map(m => m.path)),
];

/** Flat, searchable module list used by the command palette. */
export const SEARCHABLE_MODULES: { module: NavModule; domainLabel: string }[] = [
  { module: COMMAND_CENTER, domainLabel: 'Command Center' },
  { module: EXECUTIVE_DASHBOARD, domainLabel: 'Command Center' },
  ...NAV_DOMAINS.flatMap(domain =>
    domain.modules.map(module => ({ module, domainLabel: domain.label }))
  ),
];
