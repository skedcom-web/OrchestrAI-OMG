/**
 * OMG Navigation Architecture — UX Modernization Release.
 *
 * Navigation is organised around ten business‑capability workspaces, not
 * release history. Each workspace answers one governance question and
 * contains Level 2 groups (a real sub‑heading, not a flat list) and Level 3
 * screens (the actual routed pages — unchanged paths, unchanged permissions,
 * unchanged behaviour).
 *
 * Two rules keep this scalable past Release 20 without another redesign:
 *  1. A workspace that governs one class of entity is named "[Entity]" and
 *     added as a new peer — Asset, Risk & Compliance, Assessments, Model,
 *     Knowledge, Prompt, Agent, Tool, Lifecycle, Certification Governance…
 *  2. A workspace that cuts across every entity (Executive Center, Approvals
 *     & Decisions, Audit & Oversight, Administration) doesn't grow when a
 *     new entity type is added — it just applies to one more thing.
 *
 * Release/phase labels are deliberately NOT part of this data model's
 * user‑facing surface — see ReleaseNotesPage.tsx (Administration → Product
 * Release Notes) for that history. `badge` remains available for genuine
 * product signals (e.g. a future "Beta" tag) but carries no release info.
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
  /** One-line purpose statement — shown as a tooltip and in the command palette, never inline in the menu. */
  description: string;
  /** Keywords to broaden command-palette matching. */
  keywords?: string[];
  /** Small trailing chip in the sidebar. Reserved for genuine product signals (e.g. "Beta") — never release/build labels. */
  badge?: string;
}

/** Level 2 — a named sub-group of modules within a workspace. */
export interface NavGroup {
  label: string;
  modules: NavModule[];
}

export interface NavDomain {
  id: string;
  label: string;
  /** The executive question this workspace answers. Contextual help only — never rendered inline in the nav; available as a tooltip and in the RBAC/Command Center admin surfaces. */
  question: string;
  icon: string;
  /** Accent hue used for the domain rail and headers. */
  accent: string;
  /** Level 2 groups — the real sub-headings that replace a flat module list. */
  groups: NavGroup[];
  /** Derived, flat view of every module in this workspace — kept for admin surfaces (RBAC matrix, Command Center) that reasonably want a flat count/list rather than the L2 structure. */
  modules: NavModule[];
}

function domain(input: Omit<NavDomain, 'modules'>): NavDomain {
  return { ...input, modules: input.groups.flatMap(g => g.modules) };
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
  domain({
    id: 'executive',
    label: 'Executive Center',
    question: 'Is enterprise AI under control?',
    icon: '🏛️',
    accent: '#F59E0B',
    groups: [
      {
        label: 'Posture & Scorecards',
        modules: [
          { path: '/executive-hub', label: 'Executive Hub', icon: '🏛️', description: 'Executive AI governance posture in five minutes, tuned to the CIO, CRO, Compliance or Board lens.', keywords: ['executive', 'cio', 'cro', 'board', 'hub', 'leadership'] },
          { path: '/governance-scorecards', label: 'Governance Scorecards', icon: '🗂️', description: 'Ownership, risk, validation, evidence and decision readiness scored across the estate.', keywords: ['scorecard', 'health index', 'readiness', 'score'] },
          { path: '/governance-readiness', label: 'Governance Readiness Dashboard', icon: '🛡️', description: 'Ownership, Risk, Controls, Evidence, Reviews and Governance Decision — identify gaps before they reach a decision review.', keywords: ['readiness', 'prevention', 'controls', 'gaps', 'score'] },
          { path: '/executive-heatmaps', label: 'Executive Heatmaps', icon: '🔥', description: 'Risk concentration by business unit, AI category and governance lifecycle stage.', keywords: ['heatmap', 'business unit', 'concentration', 'exposure'] },
          { path: '/governance-insights', label: 'Governance Insights', icon: '💡', description: 'Trends and the shortest path from governance posture to executive action.', keywords: ['insight', 'trend', 'analytics', 'direction'] },
        ],
      },
      {
        label: 'Effectiveness & Value',
        modules: [
          { path: '/governance-value', label: 'Governance Value Dashboard', icon: '📊', description: 'Governance effectiveness, measured — readiness, evidence coverage, review and reassessment compliance, findings resolution, SLA and approval cycle time.', keywords: ['value', 'metrics', 'kpi', 'effectiveness', 'board-friendly'] },
          { path: '/governance-effectiveness', label: 'Effectiveness Score', icon: '🧮', description: 'Is governance improving over time — evidence, review, findings, reassessment, policy and drift trends, compared to the last recorded reading.', keywords: ['effectiveness', 'score', 'trend', 'improvement'] },
          { path: '/governance-roi', label: 'Governance ROI', icon: '💰', description: 'Governance activity translated into business language — operational savings, risk avoidance, estimated value delivered.', keywords: ['roi', 'value', 'savings', 'business case'] },
          { path: '/governance-maturity', label: 'Governance Maturity', icon: '📶', description: 'Reactive through Optimized, by domain — governance program, evidence, decisions, compliance, accountability, continuous assurance.', keywords: ['maturity', 'reactive', 'optimized', 'domain'] },
          { path: '/governance-benchmarking', label: 'Governance Benchmarking', icon: '📐', description: 'Compare governance effectiveness against industry reference benchmarks — gap analysis and improvement opportunities.', keywords: ['benchmark', 'industry', 'comparison', 'gap analysis'] },
          { path: '/governance-outcomes', label: 'Governance Outcomes', icon: '🎯', description: 'What value did governance deliver — risks prevented, drift resolved, gaps eliminated, not just activity performed.', keywords: ['outcomes', 'value delivered', 'risks prevented'] },
        ],
      },
      {
        label: 'Drift, Health & Reporting',
        modules: [
          { path: '/governance-drift', label: 'Governance Drift Center', icon: '📉', description: 'Detects degradation of governance process effectiveness over time — ownership, review, evidence, reassessment, control and approval drift.', keywords: ['drift', 'degradation', 'ownership drift', 'review drift', 'evidence drift'] },
          { path: '/governance-health', label: 'Governance Health Center', icon: '💚', description: 'One executive governance health indicator, combining readiness, drift, evidence, reviews, reassessment, findings and control assurance.', keywords: ['health', 'health index', 'executive indicator'] },
          { path: '/board-reporting', label: 'Board & Regulator Reporting', icon: '📑', description: 'Executive Governance Report and Audit Readiness Report generated from the live record.', keywords: ['board', 'regulator', 'report', 'pack', 'audit readiness'] },
        ],
      },
    ],
  }),

  domain({
    id: 'registry',
    label: 'AI Inventory & Registry',
    question: 'What AI exists?',
    icon: '📦',
    accent: '#6366F1',
    groups: [
      {
        label: 'Inventory',
        modules: [
          { path: '/assets', label: 'AI Asset Registry', icon: '🗂️', description: 'Authoritative inventory of every governed AI asset across the enterprise.', keywords: ['inventory', 'assets', 'register', 'catalog'] },
          { path: '/ownership', label: 'Ownership Matrix', icon: '👥', description: 'Five-role RACIS accountability for business, technical, risk, compliance and approval.', keywords: ['racis', 'owner', 'accountability', 'raci'] },
        ],
      },
      {
        label: 'Lifecycle',
        modules: [
          { path: '/asset-lifecycle', label: 'Asset Lifecycle', icon: '🔄', description: 'Where every asset sits on the eight-stage governance journey.', keywords: ['journey', 'stage', 'lifecycle', 'pipeline'] },
          { path: '/retirement', label: 'Asset Retirement', icon: '📦', description: 'Controlled decommissioning and archival of AI assets.', keywords: ['decommission', 'archive', 'sunset', 'retire'] },
          { path: '/archived-assets', label: 'Archived Assets', icon: '🗄️', description: 'Soft-deleted assets, restorable by an authorised role — nothing is ever physically removed.', keywords: ['archive', 'restore', 'deleted', 'soft delete', 'audit history'] },
        ],
      },
      {
        label: 'Models',
        modules: [
          { path: '/models', label: 'Model Registry', icon: '🧬', description: 'Every AI model governed as a first-class, reusable asset — registered once, used by many.', keywords: ['model', 'registry', 'llm', 'foundation model'] },
          { path: '/model-lifecycle', label: 'Model Lifecycle', icon: '🔄', description: 'Stage, retraining schedule and drift signal for every governed model.', keywords: ['model lifecycle', 'retraining', 'drift'] },
          { path: '/model-risk', label: 'Model Risk & Approvals', icon: '⚖️', description: 'Risk tiering and GO / Conditional GO / No Go decisions for governed models.', keywords: ['model risk', 'model approval', 'model decision'] },
          { path: '/model-analytics', label: 'Model Analytics', icon: '📊', description: 'Which assets use which models, and where model risk concentrates across the portfolio.', keywords: ['model analytics', 'model usage', 'model portfolio'] },
        ],
      },
      {
        label: 'Knowledge',
        modules: [
          { path: '/knowledge-registry', label: 'Knowledge Registry', icon: '📚', description: 'Every knowledge source AI retrieves from — registered, owned and risk-tiered like any other governed entity.', keywords: ['knowledge', 'rag', 'retrieval', 'vector index', 'document store'] },
          { path: '/knowledge-quality', label: 'Knowledge Quality & Lifecycle', icon: '🧪', description: 'Freshness, ownership and lifecycle stage for every governed knowledge source.', keywords: ['knowledge quality', 'freshness', 'staleness'] },
          { path: '/knowledge-traceability', label: 'Knowledge Traceability', icon: '🔗', description: 'Which assets retrieve from which knowledge sources across the portfolio.', keywords: ['knowledge traceability', 'knowledge usage', 'rag lineage'] },
        ],
      },
      {
        label: 'Prompts',
        modules: [
          { path: '/prompt-library', label: 'Prompt Library', icon: '💬', description: 'Every governed prompt template, versioned — every edit is a new version, prior versions retained.', keywords: ['prompt', 'template', 'library', 'version history'] },
          { path: '/prompt-approvals', label: 'Prompt Approvals & Risk', icon: '⚖️', description: 'Risk tiering and GO / Conditional GO / No Go decisions for governed prompts.', keywords: ['prompt risk', 'prompt approval', 'prompt decision'] },
          { path: '/prompt-evidence', label: 'Prompt Evidence', icon: '🧾', description: 'Injection-control review, test transcripts and sign-off for every prompt version.', keywords: ['prompt evidence', 'injection control', 'red team', 'review sign-off'] },
        ],
      },
      {
        label: 'Agents',
        modules: [
          { path: '/agent-accountability', label: 'Agent Accountability', icon: '🕹️', description: 'Delegation scope, tool grants and human override authority for every autonomous agent.', keywords: ['agent', 'delegation', 'tool grant', 'accountability'] },
          { path: '/agent-monitoring', label: 'Agent Monitoring', icon: '📡', description: 'Behavior signal for every autonomous agent — feeds the portfolio-wide Governance Monitoring view.', keywords: ['agent monitoring', 'behavior', 'watchlist', 'agent alert'] },
        ],
      },
    ],
  }),

  domain({
    id: 'risk-compliance',
    label: 'Risk & Compliance',
    question: 'Can this AI be trusted?',
    icon: '🛡️',
    accent: '#F97316',
    groups: [
      {
        label: 'Risk & Validation',
        modules: [
          { path: '/risk', label: 'Risk Center', icon: '⚡', description: 'Risk tiering across data sensitivity, decision impact and operational impact.', keywords: ['risk', 'tier', 'classification', 'severity'] },
          { path: '/validation', label: 'Validation Center', icon: '🧪', description: 'Independent multi-disciplinary validation reviews and scoring.', keywords: ['test', 'validate', 'review', 'model risk'] },
          { path: '/findings', label: 'Findings Tracker', icon: '⚠️', description: 'Validation defects and remediation tracking through to verification.', keywords: ['defect', 'issue', 'gap', 'remediation'] },
          { path: '/validation-dashboard', label: 'Validation Analytics', icon: '📊', description: 'Portfolio validation coverage, pass rates and open defect trends.', keywords: ['analytics', 'validation', 'coverage'] },
          { path: '/governance-blockers', label: 'Governance Blockers', icon: '🧱', description: 'Hard blockers preventing an asset from receiving a production decision.', keywords: ['blocker', 'impediment', 'stop'] },
        ],
      },
      {
        label: 'Compliance Framework',
        modules: [
          { path: '/compliance-center', label: 'Compliance Center', icon: '🏛️', description: 'Regulatory control evaluation and compliance posture per asset.', keywords: ['regulation', 'rbi', 'control', 'compliance'] },
          { path: '/regulatory-library', label: 'Regulatory Library', icon: '📚', description: 'Catalogue of regulatory and internal policy controls in force.', keywords: ['rbi', 'policy', 'library', 'standards'] },
          { path: '/compliance-packs', label: 'Compliance Pack Framework', icon: '🧩', description: 'The reusable architecture every future regulation plugs into — packs, requirements, controls and evidence mappings.', keywords: ['compliance pack', 'requirement', 'control', 'coverage', 'framework', 'rbi', 'iso', 'eu ai act'] },
          { path: '/compliance-assessment', label: 'Compliance Assessment', icon: '📋', description: 'Control-by-control assessment workflow with evidence linkage.', keywords: ['assess', 'evaluate', 'control test'] },
          { path: '/compliance-findings', label: 'Compliance Gaps', icon: '🚨', description: 'Open regulatory gaps requiring remediation before audit.', keywords: ['gap', 'non-compliant', 'breach'] },
          { path: '/compliance-dashboard', label: 'Compliance Analytics', icon: '📈', description: 'Tenant-wide regulatory alignment scoring and coverage.', keywords: ['rbi score', 'analytics', 'alignment'] },
        ],
      },
      {
        label: 'Regulatory Foundation',
        modules: [
          { path: '/mapping-workspace', label: 'Mapping Workspace', icon: '🗺️', description: 'The reusable foundation every future regulation plugs into — sources, requirements, obligations, controls and evidence mappings.', keywords: ['regulatory source', 'obligation', 'mapping workspace', 'foundation', 'knowledge engine'] },
          { path: '/requirement-registry', label: 'Requirement Registry', icon: '📋', description: 'Every requirement registered across every regulatory source.', keywords: ['requirement registry', 'catalogue', 'regulatory'] },
          { path: '/obligation-library', label: 'Obligation Library', icon: '🎯', description: 'Every requirement translated into actionable obligations, browsable across sources.', keywords: ['obligation library', 'named owner', 'approval authority', 'escalation'] },
        ],
      },
      {
        label: 'Policy',
        modules: [
          { path: '/policy-management', label: 'Policy Registry', icon: '📕', description: 'The enterprise AI rulebook: governance, risk, security, privacy and vendor policy.', keywords: ['policy', 'rulebook', 'registry', 'standard'] },
          { path: '/policy-mapping', label: 'Policy Mapping', icon: '🔗', description: 'Bind policies to assets, asset types, vendors and business units; coverage is computed.', keywords: ['mapping', 'binding', 'coverage', 'applies to'] },
          { path: '/policy-violations', label: 'Policy Violations', icon: '🚨', description: 'Detected and logged policy breaches through to accepted, remediated or closed.', keywords: ['violation', 'breach', 'non-compliance', 'exception'] },
        ],
      },
    ],
  }),

  domain({
    id: 'assessments',
    label: 'Assessments & Reviews',
    question: 'How well‑governed is this AI, really?',
    icon: '🧭',
    accent: '#0EA5E9',
    groups: [
      {
        label: 'Assess',
        modules: [
          { path: '/assessment-center', label: 'Assessment Center', icon: '📝', description: 'Record a standardized governance assessment — ten categories, one 1-5 scale, every time.', keywords: ['assessment', 'score', 'record', 'evaluate'] },
          { path: '/assessment-playbooks', label: 'Assessment Playbooks', icon: '📖', description: 'Structured guidance for each assessment type — objective, scope, criteria, and how to read the score.', keywords: ['playbook', 'guidance', 'methodology', 'prompts'] },
        ],
      },
      {
        label: 'Calibrate',
        modules: [
          { path: '/calibration-library', label: 'Calibration Library', icon: '📚', description: 'The standardized scoring rubric, and worked examples of it applied to real scenarios.', keywords: ['calibration', 'scoring template', 'reference', 'rubric'] },
          { path: '/variance-analysis', label: 'Variance Analysis', icon: '📊', description: 'Observed dispersion in recorded assessment scores — no acceptable-variance threshold assumed.', keywords: ['variance', 'reliability', 'consistency', 'dispersion'] },
          { path: '/assessor-certification', label: 'Assessor Certification', icon: '🏅', description: 'Score benchmark scenarios from the Calibration Library and see your calibration accuracy.', keywords: ['certification', 'calibration accuracy', 'training', 'assessor'] },
          { path: '/consensus-assessments', label: 'Multi-Assessor Consensus', icon: '👥', description: 'Multiple assessors independently score the same asset — hidden until the round closes, then a consensus report.', keywords: ['consensus', 'multi-assessor', 'independent scoring', 'variance'] },
          { path: '/benchmark-recommendations', label: 'Benchmark Recommendations', icon: '🧭', description: 'Pick Use Case, Risk Category and Asset Type — get the most relevant playbooks, reference examples and typical scoring ranges.', keywords: ['benchmark', 'recommendation', 'guided assessment', 'similar assets'] },
        ],
      },
      {
        label: 'Review',
        modules: [
          { path: '/review-workbench', label: 'Review Workbench', icon: '🧰', description: 'Reviewer working surface for validation and governance review execution.', keywords: ['reviewer', 'workbench', 'assess'] },
          { path: '/review-calendar', label: 'Review Calendar', icon: '📅', description: 'Scheduled governance review cadence and overdue review tracking.', keywords: ['schedule', 'cadence', 'calendar', 'due'] },
        ],
      },
      {
        label: 'Learn',
        modules: [
          { path: '/assessment-academy', label: 'Assessment Academy', icon: '🎓', description: 'Guidance on assessment concepts, scoring methodology, evidence expectations, and best practices.', keywords: ['academy', 'training', 'onboarding', 'best practices'] },
        ],
      },
    ],
  }),

  domain({
    id: 'decisions',
    label: 'Approvals & Decisions',
    question: 'Can this AI move?',
    icon: '⚖️',
    accent: '#8B5CF6',
    groups: [
      {
        label: 'Decide',
        modules: [
          { path: '/decision-workbench-v4', label: 'Decision Authority', shortLabel: 'Decision Authority', icon: '🖋️', description: 'Record GO / CONDITIONAL GO / NO GO decisions with full justification.', keywords: ['approve', 'go', 'no go', 'authority', 'sign off'] },
          { path: '/decision-intelligence', label: 'Decision Intelligence', icon: '⚖️', description: 'Governance readiness scoring and recommended decision outcome per asset.', keywords: ['readiness', 'score', 'recommendation'] },
          { path: '/decision-dashboard', label: 'Decision Queue', icon: '🗳️', description: 'Live queue of pending, conditional and approved governance decisions.', keywords: ['queue', 'pending', 'approvals', 'decisions'] },
        ],
      },
    ],
  }),

  domain({
    id: 'evidence',
    label: 'Evidence & Traceability',
    question: 'Can we prove it?',
    icon: '📄',
    accent: '#14B8A6',
    groups: [
      {
        label: 'Evidence',
        modules: [
          { path: '/evidence', label: 'Evidence Center', icon: '📄', description: 'ODF governance deliverables and audit-grade evidence library.', keywords: ['document', 'odf', 'deliverable', 'proof'] },
          { path: '/evidence-registry', label: 'Evidence Registry', icon: '🗃️', description: 'Universal governance evidence object — ownership, traceability, lifecycle and expiry.', keywords: ['evidence', 'registry', 'traceability', 'lifecycle', 'expiry'] },
          { path: '/decision-traceability', label: 'Decision Traceability', icon: '🧭', description: 'Reconstruct any governance decision end-to-end — Condition → Policy → Violation → Finding → Outcome → Recommended Action → Human Decision.', keywords: ['decision traceability', 'trace', 'replay', 'explainability', 'audit package', 'evidence pack'] },
        ],
      },
    ],
  }),

  domain({
    id: 'oversight',
    label: 'Audit & Oversight',
    question: 'Prove what happened.',
    icon: '🔍',
    accent: '#10B981',
    groups: [
      {
        label: 'Trail & Trends',
        modules: [
          { path: '/governance-timeline', label: 'Governance Timeline', icon: '⏱️', description: 'Chronological governance event history for any AI asset.', keywords: ['history', 'timeline', 'events', 'chronology'] },
          { path: '/governance-trends', label: 'Governance Trends', icon: '📈', description: 'Portfolio governance health trajectory and directional analytics.', keywords: ['trend', 'analytics', 'health score'] },
          { path: '/audit-logs', label: 'Audit Logs', icon: '📜', description: 'Immutable Day-1 audit trail of every governance action taken.', keywords: ['audit', 'log', 'immutable', 'trail'] },
          { path: '/audit-readiness-intelligence', label: 'Audit Readiness Intelligence', icon: '📄', description: 'What evidence supports compliance today — asset-level and framework-level readiness, combined.', keywords: ['audit readiness', 'evidence gaps', 'audit intelligence'] },
        ],
      },
    ],
  }),

  domain({
    id: 'operations',
    label: 'Operations & Monitoring',
    question: 'What is happening now?',
    icon: '📡',
    accent: '#06B6D4',
    groups: [
      {
        label: 'Monitor',
        modules: [
          { path: '/operations-dashboard', label: 'Operations Dashboard', icon: '📉', description: 'Runtime posture of production AI: active, suspended and under review.', keywords: ['runtime', 'production', 'live'] },
          { path: '/governance-monitoring', label: 'Governance Monitoring', icon: '👁️', description: 'Continuous governance health scoring across the AI portfolio.', keywords: ['health', 'monitor', 'continuous'] },
          { path: '/governance-alerts', label: 'Governance Alerts', icon: '🔔', description: 'Exception alerts for expired validation, overdue reviews and critical incidents.', keywords: ['alert', 'exception', 'warning'] },
        ],
      },
      {
        label: 'Control',
        modules: [
          { path: '/operations-center', label: 'Operations Center', icon: '🎛️', description: 'Operational oversight of running AI systems and their control state.', keywords: ['control', 'operations', 'oversight'] },
          { path: '/kill-switch', label: 'Kill Switch Console', icon: '🛑', description: 'Emergency suspension of autonomous AI execution.', keywords: ['emergency', 'stop', 'suspend', 'circuit breaker'] },
          { path: '/override-center', label: 'Human Override', icon: '✋', description: 'Human-in-the-loop interventions on autonomous AI decisions.', keywords: ['intervention', 'human', 'override'] },
        ],
      },
      {
        label: 'Respond',
        modules: [
          { path: '/incidents', label: 'Incident Management', icon: '⚡', description: 'AI incident triage, investigation, mitigation and closure.', keywords: ['incident', 'anomaly', 'outage'] },
          { path: '/corrective-actions', label: 'Corrective Actions', icon: '🛠️', description: 'Assigned remediation actions through to verified closure.', keywords: ['capa', 'remediate', 'fix', 'action'] },
        ],
      },
      {
        label: 'Change Management',
        modules: [
          { path: '/change-requests', label: 'Change Request Center', icon: '🔁', description: 'Raise, classify, impact-assess and route every significant change to a governed AI asset.', keywords: ['change', 'request', 'crq', 'amendment', 'modification'] },
          { path: '/change-impact', label: 'Impact & Reassessment', icon: '🔬', description: 'Governance impact profile across seven areas, and the rules that decide who must reapprove.', keywords: ['impact', 'reassessment', 'rules', 'magnitude', 'routing'] },
          { path: '/change-dashboard', label: 'Change Dashboard', icon: '📊', description: 'Executive visibility into change activity, bottlenecks and pending reapprovals.', keywords: ['change dashboard', 'bottleneck', 'throughput', 'pipeline'] },
          { path: '/change-history', label: 'Change History & States', icon: '📜', description: 'Immutable change audit trail and the governance state machine for every asset.', keywords: ['history', 'state machine', 'transition', 'lifecycle', 'trail'] },
          { path: '/governance-triggers', label: 'Governance Triggers', icon: '🔔', description: 'Rules that convert change conditions into governance work automatically.', keywords: ['trigger', 'automation', 'escalation', 'rule'] },
        ],
      },
      {
        label: 'Tools',
        modules: [
          { path: '/tool-registry', label: 'Tool Registry', icon: '🧰', description: 'Every tool and external capability an AI agent can call — classified, owned and risk-tiered.', keywords: ['tool', 'registry', 'function calling', 'capability'] },
          { path: '/tool-approvals', label: 'Tool Approvals & Risk', icon: '⚖️', description: 'Risk tiering and GO / Conditional GO / No Go decisions for governed tools.', keywords: ['tool risk', 'tool approval', 'tool decision'] },
          { path: '/tool-monitoring', label: 'Tool Call Monitoring', icon: '📶', description: 'Which agents are granted which tools, and where tool-access risk concentrates.', keywords: ['tool monitoring', 'tool usage', 'tool grants'] },
        ],
      },
    ],
  }),

  domain({
    id: 'intelligence',
    label: 'Knowledge & Intelligence',
    question: 'What does the platform already know?',
    icon: '🧠',
    accent: '#EC4899',
    groups: [
      {
        label: 'Reasoning Engine',
        modules: [
          { path: '/governance-intelligence', label: 'Governance Intelligence', icon: '🧠', description: 'Policy → Condition → Violation → Finding → Outcome, every outcome explainable — governance reasoning, not just governance records.', keywords: ['governance intelligence', 'policy', 'condition', 'finding', 'outcome', 'explainability', 'reasoning'] },
          { path: '/governance-actions', label: 'Governance Actions', icon: '🛠️', description: 'Recommended actions raised from governance outcomes — Accept, Reject or Defer. Nothing executes automatically; humans remain accountable.', keywords: ['governance actions', 'recommended action', 'accept', 'reject', 'defer', 'playbook'] },
          { path: '/governance-studio', label: 'Governance Intelligence Studio', icon: '🎛️', description: 'Configure governance logic without code changes — Condition, Outcome and Action Designers, Rule Mapping, Compliance Pack Builder and Customer Governance Profiles.', keywords: ['governance studio', 'condition designer', 'outcome designer', 'action designer', 'rule mapping', 'compliance pack builder', 'customer profile', 'configuration'] },
        ],
      },
      {
        label: 'Regulatory Intelligence',
        modules: [
          { path: '/regulatory-applicability', label: 'Regulatory Applicability', icon: '🌐', description: 'Which regulations apply to this tenant, scoped by the active Governance Profile.', keywords: ['applicability', 'which regulations apply', 'scope'] },
          { path: '/cross-framework-mapping', label: 'Cross-Framework Mapping', icon: '🔗', description: 'What controls satisfy multiple frameworks — evidence already doing double duty across compliance packs and regulatory sources.', keywords: ['cross-framework', 'reuse', 'control mapping', 'evidence reuse'] },
          { path: '/compliance-impact-analysis', label: 'Compliance Impact Analysis', icon: '🔁', description: "What changed recently, and what's the compliance impact — cross-referenced against the affected asset's governance posture.", keywords: ['change impact', 'compliance impact', 'what changed'] },
          { path: '/regulatory-change-readiness', label: 'Regulatory Change Readiness', icon: '📶', description: 'Active regulatory sources ranked by how ready this organization is if that regulation changed tomorrow.', keywords: ['change readiness', 'regulatory readiness', 'coverage ranking'] },
        ],
      },
    ],
  }),

  domain({
    id: 'administration',
    label: 'Administration',
    question: 'Who can do what?',
    icon: '⚙️',
    accent: '#94A3B8',
    groups: [
      {
        label: 'Access',
        modules: [
          { path: '/users', label: 'User Management', icon: '🔐', description: 'Enterprise user directory and governance role assignment.', keywords: ['users', 'people', 'directory'] },
          { path: '/rbac', label: 'RBAC Administration', icon: '🧬', description: 'Role-to-module authorisation matrix across all governance personas.', keywords: ['permission', 'role', 'access', 'authorisation', 'rbac'] },
        ],
      },
      {
        label: 'Platform',
        modules: [
          { path: '/tenant-settings', label: 'Tenant Settings', icon: '🏢', description: 'Tenant profile, governance thresholds and platform experience defaults.', keywords: ['settings', 'configuration', 'tenant', 'thresholds'] },
          { path: '/release-notes', label: 'Product Release Notes', icon: '🗞️', description: 'Platform release history and what shipped in each version — moved out of everyday navigation so it never gets in the way of governance work.', keywords: ['release', 'release notes', 'version', 'changelog', 'what shipped', 'history'] },
        ],
      },
    ],
  }),
];

/* --------------------------------------------------------------------------
 * Future module architecture preparation.
 * Routes and navigation entries exist now; implementation lands in later
 * releases. Named to match the governance disciplines already planned —
 * each is a peer workspace, added the same way, whenever it ships.
 * ----------------------------------------------------------------------- */
export interface FutureModule extends NavModule {
  phase: string;
  capabilities: string[];
}

export const FUTURE_MODULES: FutureModule[] = [
  // R13 Model, R14 Knowledge, R15 Prompt, R16 Agent and R17 Tool Governance
  // all shipped as real workspaces above — no longer roadmap placeholders.
  {
    path: '/ai-control-library',
    label: 'Control Governance',
    icon: '🧱',
    phase: 'Planned',
    description: 'A reusable, testable AI control catalogue with automated control testing and inheritance across assets.',
    capabilities: ['Reusable control catalogue', 'Control effectiveness testing', 'Automated control evidence capture', 'Control inheritance across assets'],
  },
  {
    path: '/lifecycle-governance',
    label: 'Lifecycle Governance',
    icon: '🔄',
    phase: 'Planned',
    description: 'Deeper lifecycle automation for AI assets, extending Asset Governance with automated stage transitions.',
    capabilities: ['Automated stage transitions', 'Lifecycle policy enforcement', 'Cross-stage evidence continuity'],
  },
  {
    path: '/certification-governance',
    label: 'Certification Governance',
    icon: '🏅',
    phase: 'Planned',
    description: 'Formal, auditable certification programs for AI systems, extending Assessments & Reviews with issued credentials.',
    capabilities: ['Certification program design', 'Credential issuance', 'Recertification scheduling'],
  },
];

/* --------------------------------------------------------------------------
 * Executive experience.
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
  group?: NavGroup;
}

const MODULE_INDEX: Record<string, ModuleLocation> = (() => {
  const index: Record<string, ModuleLocation> = {
    [OMG_OVERVIEW.path]: { module: OMG_OVERVIEW },
    [COMMAND_CENTER.path]: { module: COMMAND_CENTER },
    [EXECUTIVE_DASHBOARD.path]: { module: EXECUTIVE_DASHBOARD },
  };
  NAV_DOMAINS.forEach(d => {
    d.groups.forEach(group => {
      group.modules.forEach(module => {
        index[module.path] = { module, domain: d, group };
      });
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
  ...NAV_DOMAINS.flatMap(d =>
    d.modules.map(module => ({ module, domainLabel: d.label }))
  ),
];
