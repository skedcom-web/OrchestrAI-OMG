/**
 * Landing Experience content model.
 *
 * Single source of truth for the journey-centric landing page, the interactive
 * lifecycle explorer and the guided tour, so the three cannot drift apart.
 *
 * Every stage maps to a route that actually exists in navigation.ts, and every
 * mechanism described here is implemented in the application.
 */

export interface JourneyStage {
  id: string;
  step: number;
  label: string;
  icon: string;
  /** One-line summary shown on the card. */
  summary: string;
  purpose: string;
  inputs: string[];
  outputs: string[];
  owner: string;
  decisionCriteria: string;
  /** Module this stage is performed in. */
  path: string;
  moduleLabel: string;
  accent: string;
}

/**
 * Section 2 — the governance journey.
 * Nine stages: the eight-stage asset journey plus the Phase 10 continuity loop.
 */
export const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: 'asset',
    step: 1,
    label: 'AI Asset',
    icon: '🗂️',
    summary: 'Register what exists before governing it.',
    purpose:
      'Capture every AI system the organisation runs — built or bought — in one authoritative register, so nothing is governed by memory.',
    inputs: ['Asset name, type and version', 'Owning department', 'Description and intended purpose'],
    outputs: ['A registered AI asset with a unique identity', 'Entry in the enterprise inventory'],
    owner: 'Requesting business or technical team',
    decisionCriteria: 'The asset cannot progress until it is registered and typed.',
    path: '/assets',
    moduleLabel: 'AI Asset Registry',
    accent: 'var(--stage-1)',
  },
  {
    id: 'ownership',
    step: 2,
    label: 'Ownership',
    icon: '👥',
    summary: 'Assign named accountable owners, human oversight and autonomy exposure.',
    purpose:
      'Attach real, named accountability, then declare how humans supervise the asset and how much it acts on its own. Without an owner an issue cannot be escalated and a decision cannot be defended.',
    inputs: ['Candidate owners from the user directory', 'Departmental accountability model', 'Human Oversight Classification', 'Autonomy Classification (Level 0-5)'],
    outputs: ['Business, Technical, Risk and Compliance Owners', 'A designated Approver', 'Governance Authority Profile', 'Oversight type and autonomy level on record'],
    owner: 'Governance Admin, with business sign-off',
    decisionCriteria: 'All five roles must be named. Gaps raise a policy violation automatically.',
    path: '/ownership',
    moduleLabel: 'Ownership Matrix',
    accent: 'var(--stage-2)',
  },
  {
    id: 'risk',
    step: 3,
    label: 'Risk Assessment',
    icon: '⚡',
    summary: 'Classify the risk the asset actually carries.',
    purpose:
      'Decide how much governance this asset must pass. Risk tier drives validation depth, oversight requirements and review cadence.',
    inputs: ['Data sensitivity', 'Decision impact', 'Operational impact', 'Control and oversight model'],
    outputs: ['A risk tier: Low, Medium, High or Critical', 'Named risk owner and rationale'],
    owner: 'Risk Officer',
    decisionCriteria: 'High and Critical assets are held to a stricter validation and oversight bar.',
    path: '/risk',
    moduleLabel: 'Risk Center',
    accent: 'var(--stage-3)',
  },
  {
    id: 'validation',
    step: 4,
    label: 'Validation & Testing',
    icon: '🧪',
    summary: 'Independent review across six disciplines.',
    purpose:
      'Prove the asset behaves as claimed, reviewed by someone other than the team that built it.',
    inputs: ['Test plans and results', 'Model and security assessments', 'Reviewer assignment'],
    outputs: ['Scored validation records', 'Findings raised with severity and owner'],
    owner: 'Validator, independent of the build team',
    decisionCriteria:
      'High and Critical risk assets require an approved validation before production.',
    path: '/validation',
    moduleLabel: 'Validation Center',
    accent: 'var(--stage-4)',
  },
  {
    id: 'evidence',
    step: 5,
    label: 'Evidence Collection',
    icon: '📄',
    summary: 'File the artefacts that prove governance happened.',
    purpose:
      'Assemble the audit-grade record now, so producing it later takes minutes rather than weeks.',
    inputs: ['Governance deliverables', 'Test evidence', 'Approvals and policy documents'],
    outputs: ['Versioned, attributed evidence artefacts', 'An evidence completeness position'],
    owner: 'Asset team, reviewed by Governance',
    decisionCriteria:
      'Production assets need a complete deliverable pack; shortfalls raise a policy violation.',
    path: '/evidence',
    moduleLabel: 'Evidence Center',
    accent: 'var(--stage-5)',
  },
  {
    id: 'decision',
    step: 6,
    label: 'Decision',
    icon: '⚖️',
    summary: 'A scored, justified, recorded authority decision.',
    purpose:
      'Convert the accumulated governance position into a formal decision that a named person owns.',
    inputs: ['Governance readiness score across five pillars', 'Open blockers and findings'],
    outputs: ['GO, CONDITIONAL GO or NO GO', 'Justification and decision owner on record'],
    owner: 'Designated Approver / Decision Authority',
    decisionCriteria:
      'Any failing pillar becomes a governance blocker that must be cleared before a GO.',
    path: '/decision-workbench-v4',
    moduleLabel: 'Decision Authority',
    accent: 'var(--stage-6)',
  },
  {
    id: 'monitoring',
    step: 7,
    label: 'Continuous Monitoring',
    icon: '📡',
    summary: 'Governance health is tracked while the asset runs.',
    purpose:
      'Approval is a point in time. Monitoring keeps the governance position current while the asset operates.',
    inputs: ['Live asset and operational state', 'Reviews, incidents and corrective actions'],
    outputs: ['Health score: Healthy, Watchlist or Attention Required', 'Executive alerts'],
    owner: 'Governance Admin and Risk Officer',
    decisionCriteria: 'Deterioration surfaces as an alert before it becomes an audit finding.',
    path: '/governance-monitoring',
    moduleLabel: 'Governance Monitoring',
    accent: 'var(--stage-7)',
  },
  {
    id: 'impact',
    step: 8,
    label: 'Impact Analysis',
    icon: '🔬',
    summary: 'Score what a proposed change would disturb.',
    purpose:
      'When something changes, measure the governance consequence before allowing it to proceed.',
    inputs: ['The proposed change and its category', 'Current governance position of the asset'],
    outputs: ['Impact rating across seven governance areas', 'A weighted impact score out of 100'],
    owner: 'Governance Admin with the asset owner',
    decisionCriteria: 'The score determines the change magnitude, from Minor through Critical.',
    path: '/change-impact',
    moduleLabel: 'Impact & Reassessment',
    accent: 'var(--stage-8)',
  },
  {
    id: 'reassessment',
    step: 9,
    label: 'Reassessment',
    icon: '🔁',
    summary: 'Re-earn the approval, or lose it.',
    purpose:
      'Route the change to the right approvers for the impact it carries, and record a fresh decision.',
    inputs: ['Change magnitude and reassessment requirement', 'Routed approval chain'],
    outputs: ['Reapproved, or rejected and blocked', 'A new entry in the governance state machine'],
    owner: 'Approval chain sized to the impact, up to Executive Approver',
    decisionCriteria:
      'Minor changes need owner acknowledgement; Critical changes need executive reapproval.',
    path: '/change-requests',
    moduleLabel: 'Change Request Center',
    accent: 'var(--stage-1)',
  },
];

/* ==================== Section 1 — problem / solution ==================== */

export const ENTERPRISE_PROBLEMS: { problem: string; solution: string; path: string }[] = [
  { problem: 'No centralized AI inventory', solution: 'Central AI Registry', path: '/assets' },
  { problem: 'Unclear ownership and accountability', solution: 'Ownership & Accountability', path: '/ownership' },
  { problem: 'Inconsistent risk assessments', solution: 'Risk Classification', path: '/risk' },
  { problem: 'Scattered evidence and documentation', solution: 'Evidence Management', path: '/evidence' },
  { problem: 'Approval decisions are hard to defend', solution: 'Decision Governance', path: '/decision-workbench-v4' },
  { problem: 'Limited audit readiness', solution: 'Audit Trail & Reporting', path: '/audit-logs' },
  { problem: 'Governance silos across teams', solution: 'One Governance Operating Model', path: '/command-center' },
  { problem: 'No reassessment after deployment', solution: 'Governance Continuity', path: '/change-requests' },
];

/* ============ Section 3 — worked example (illustrative walkthrough) ====== */

export interface ExampleStep {
  step: number;
  title: string;
  detail: string[];
  outcome: string;
  accent: string;
}

export const WORKED_EXAMPLE_STEPS: ExampleStep[] = [
  {
    step: 1,
    title: 'Register AI Asset',
    detail: ['Name: Customer Service Agent', 'Type: Agent', 'Owner: Operations Team'],
    outcome: 'Registered in the AI inventory',
    accent: 'var(--stage-1)',
  },
  {
    step: 2,
    title: 'Risk Assessment',
    detail: ['Accesses customer data', 'Customer-facing decisions', 'Human able to intervene'],
    outcome: 'Risk rating: Medium',
    accent: 'var(--stage-3)',
  },
  {
    step: 3,
    title: 'Validation & Testing',
    detail: ['Security testing', 'Bias testing', 'Performance testing'],
    outcome: 'Validation approved, 2 findings raised',
    accent: 'var(--stage-4)',
  },
  {
    step: 4,
    title: 'Evidence Collection',
    detail: ['Test results filed', 'Security review document', 'Policies and approvals attached'],
    outcome: 'Evidence pack complete',
    accent: 'var(--stage-5)',
  },
  {
    step: 5,
    title: 'Decision',
    detail: ['Readiness scored across five pillars', 'No open blockers', 'Residual risk accepted'],
    outcome: 'GO — conditions met',
    accent: 'var(--stage-6)',
  },
  {
    step: 6,
    title: 'Change & Reassessment',
    detail: ['Underlying model upgraded', 'Data permissions widened', 'Impact scored automatically'],
    outcome: 'Reassessment triggered — approval must be re-earned',
    accent: 'var(--stage-8)',
  },
];

/* ================= Section 4 — governance continuity ==================== */

/**
 * Reassessment triggers. Each maps to an implemented change category or
 * detection mechanism — nothing here is aspirational.
 */
export const REASSESSMENT_TRIGGERS: { trigger: string; mechanism: string }[] = [
  { trigger: 'Material change to a model, prompt or agent behaviour', mechanism: 'Model Change · Prompt Change' },
  { trigger: 'New integrations, tools or external dependencies', mechanism: 'Vendor Change' },
  { trigger: 'Data source additions or modifications', mechanism: 'Data Change' },
  { trigger: 'Regulatory, policy or compliance changes', mechanism: 'Policy Change' },
  { trigger: 'Control, threshold or monitoring changes', mechanism: 'Operational Change' },
  { trigger: 'Risk threshold breaches and control failures', mechanism: 'Governance triggers & alerts' },
  { trigger: 'Performance drift or unexpected outcomes', mechanism: 'Incident management' },
];

/** The implemented governance state machine, framed as a continuity loop. */
export const CONTINUITY_STATES: { label: string; kind: 'steady' | 'change' | 'decision' }[] = [
  { label: 'Approved', kind: 'steady' },
  { label: 'Production', kind: 'steady' },
  { label: 'Monitoring', kind: 'steady' },
  { label: 'Change Requested', kind: 'change' },
  { label: 'Impact Assessment', kind: 'change' },
  { label: 'Reassessment', kind: 'change' },
  { label: 'Reapproved', kind: 'decision' },
];

/* ==================== Section 5 — guided tour =========================== */

export interface TourStep {
  n: number;
  title: string;
  path: string;
  icon: string;
  what: string;
  why: string;
  look: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    n: 1,
    title: 'AI Asset Registry',
    path: '/assets',
    icon: '🗂️',
    what: 'The authoritative inventory of every AI system the enterprise runs.',
    why: 'You cannot govern what you have not written down. Everything else keys off this register.',
    look: 'Nine asset types are supported — applications, agents, models, LLMs, copilots, RAG systems, workflows, multi-agent systems and third-party services.',
  },
  {
    n: 2,
    title: 'Governance Authority Profile',
    path: '/assets',
    icon: '👥',
    what: 'Every AI asset carries an Accountable Owner, Governance Sponsor, Risk Owner and Technical Owner.',
    why: 'You cannot own what has no owner. Accountability has to be a name, not a department.',
    look: 'Ownership is captured at registration and shown on every asset card, detail view and executive summary.',
  },
  {
    n: 3,
    title: 'Human Oversight Classification',
    path: '/assets',
    icon: '✋',
    what: 'Classifies how humans supervise each asset: Human-in-Command, Human-in-the-Loop, Human-on-the-Loop, or Autonomous with Controls.',
    why: 'Different AI needs different supervision. Oversight has to be a deliberate choice, not an assumption.',
    look: 'Oversight type is set on the asset and visible wherever the asset is reviewed or reported on.',
  },
  {
    n: 4,
    title: 'Autonomy Classification',
    path: '/assets',
    icon: '🤖',
    what: 'A six-level model from Level 0 (No AI) to Level 5 (High Autonomy) rating how independently an asset acts.',
    why: 'Executives can immediately see autonomy exposure across the portfolio, not just risk tier.',
    look: 'The Executive Dashboard breaks down the full portfolio by autonomy level, from Assist through High Autonomy.',
  },
  {
    n: 5,
    title: 'Risk Center',
    path: '/risk',
    icon: '⚡',
    what: 'Classifies each asset as Low, Medium, High or Critical risk.',
    why: 'Risk tier decides how much governance the asset must pass before it can operate.',
    look: 'High and Critical assets pick up stricter validation, oversight and review obligations automatically.',
  },
  {
    n: 6,
    title: 'Validation Center',
    path: '/validation',
    icon: '🧪',
    what: 'Independent review across six disciplines: business, technical, security, compliance, operational and model.',
    why: 'Validation is what turns a claim about an AI system into evidence.',
    look: 'Issues become tracked findings that close only after independent verification.',
  },
  {
    n: 7,
    title: 'Evidence Center',
    path: '/evidence',
    icon: '📄',
    what: 'The audit-grade document library, holding ten governance deliverable types per asset.',
    why: 'When a regulator asks you to prove governance happened, the proof already exists.',
    look: 'Every artefact is versioned, attributed to an uploader and carries an approval status.',
  },
  {
    n: 8,
    title: 'Decision Authority',
    path: '/decision-workbench-v4',
    icon: '⚖️',
    what: 'Where a named approver records GO, CONDITIONAL GO or NO GO.',
    why: 'An approval nobody owns is not an approval. Every decision carries a name and a justification.',
    look: 'Readiness is scored out of 100 first; failing pillars appear as blockers that must be cleared. The Authority Matrix shows the baseline approval expectation for the asset’s risk tier.',
  },
  {
    n: 9,
    title: 'Governance Monitoring',
    path: '/governance-monitoring',
    icon: '📡',
    what: 'Continuous health scoring across the live AI portfolio.',
    why: 'Governance does not stop at approval — posture drifts, and drift needs to be visible.',
    look: 'Assets are classified Healthy, Watchlist or Attention Required, with alerts for exceptions.',
  },
  {
    n: 10,
    title: 'Change & Reassessment',
    path: '/change-requests',
    icon: '🔁',
    what: 'Governs the change itself: classify, assess impact, route approvals, reapprove.',
    why: 'This is what makes approval conditional rather than permanent.',
    look: 'A weighted impact score sets the change magnitude, which decides who must reapprove — up to executive authority.',
  },
  {
    n: 11,
    title: 'Audit & Reporting',
    path: '/audit-logs',
    icon: '📜',
    what: 'The append-only record of every governance action, plus board and regulator reports.',
    why: 'This is the answer to "prove it" — assembled continuously rather than retrospectively.',
    look: 'Executive Governance and Audit Readiness reports are generated from the live record on demand.',
  },
];

/* ==================== Section 6 — who uses OMG ========================== */

export const PERSONAS: { role: string; icon: string; need: string; startAt: string; path: string }[] = [
  {
    role: 'CIO / CTO',
    icon: '🖥️',
    need: 'Know every AI system operating across the organisation, and whether it is under control.',
    startAt: 'Command Center',
    path: '/command-center',
  },
  {
    role: 'Risk & Compliance',
    icon: '🛡️',
    need: 'Ensure AI meets policy and regulatory obligations, and see where it does not.',
    startAt: 'Policy Violations',
    path: '/policy-violations',
  },
  {
    role: 'AI Governance Team',
    icon: '⚙️',
    need: 'Run reviews, manage evidence, clear blockers and move assets through approval.',
    startAt: 'Decision Authority',
    path: '/decision-workbench-v4',
  },
  {
    role: 'Board & Executives',
    icon: '⚖️',
    need: 'Monitor governance posture and risk exposure, and be able to evidence both.',
    startAt: 'Executive Hub',
    path: '/executive-hub',
  },
];

/* ================ Section 7 — platform capabilities ===================== */

export const CAPABILITIES: { label: string; icon: string; path: string; blurb: string }[] = [
  { label: 'AI Registry', icon: '🗂️', path: '/assets', blurb: 'One inventory, nine asset types' },
  { label: 'Risk Management', icon: '⚡', path: '/risk', blurb: 'Four-tier classification' },
  { label: 'Validation', icon: '🧪', path: '/validation', blurb: 'Six independent disciplines' },
  { label: 'Evidence Management', icon: '📄', path: '/evidence', blurb: 'Ten deliverable types' },
  { label: 'Decision Workbench', icon: '⚖️', path: '/decision-workbench-v4', blurb: 'GO / Conditional / NO GO' },
  { label: 'Human Oversight', icon: '✋', path: '/override-center', blurb: 'Override and kill switch' },
  { label: 'Monitoring', icon: '📡', path: '/governance-monitoring', blurb: 'Continuous health scoring' },
  { label: 'Governance Continuity', icon: '🔁', path: '/change-requests', blurb: 'Change-driven reassessment' },
  { label: 'Audit & Reporting', icon: '📜', path: '/audit-logs', blurb: 'Append-only trail' },
  { label: 'Lifecycle Management', icon: '🔄', path: '/asset-lifecycle', blurb: 'Registration to retirement' },
];

/* ==================== Section 8 — business value ======================== */

export const BUSINESS_VALUE: { title: string; detail: string; icon: string }[] = [
  { title: 'Faster AI adoption', detail: 'A known path to approval replaces ad-hoc negotiation.', icon: '🚀' },
  { title: 'Governance visibility', detail: 'One place to see whether enterprise AI is under control.', icon: '👁️' },
  { title: 'Stronger accountability', detail: 'Five named owners on every asset, scored for completeness.', icon: '👥' },
  { title: 'Audit readiness', detail: 'Evidence and decisions accumulate continuously, not retrospectively.', icon: '📜' },
  { title: 'Reduced regulatory risk', detail: 'Policy breaches surface as they arise, not at examination.', icon: '🛡️' },
  { title: 'Continuous assurance', detail: 'Health monitoring and reassessment keep approvals current.', icon: '📡' },
  { title: 'Governance at scale', detail: 'The same operating model applies to every AI asset class.', icon: '⚖️' },
];
