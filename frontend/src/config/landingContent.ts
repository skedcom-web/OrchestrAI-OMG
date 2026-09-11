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
    summary: 'File the artefacts, then register the evidence object that traces to them.',
    purpose:
      'Assemble the audit-grade record now, so producing it later takes minutes rather than weeks. Every artefact becomes a traceable Evidence Registry record with an owner, a lifecycle state and an expiry.',
    inputs: ['Governance deliverables', 'Test evidence', 'Approvals and policy documents', 'Links to risk assessments, reviews, decisions and reauthorizations'],
    outputs: ['Versioned, attributed evidence artefacts', 'An evidence completeness position', 'Evidence Registry records with ownership and expiry tracking'],
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
    summary: 'Governance health is tracked, and continuity is enforced, while the asset runs.',
    purpose:
      'Approval is a point in time. Monitoring keeps the governance position current, and a Governance State tracks whether that authorization still holds — Authorized, Monitoring, Reassessment Required, Conditional GO, No GO or Retired.',
    inputs: ['Live asset and operational state', 'Reviews, incidents and corrective actions', 'Reassessment triggers: model, data, permission and control changes'],
    outputs: ['Health score: Healthy, Watchlist or Attention Required', 'Executive alerts', 'Governance State and next review date', 'Reauthorization record when a trigger forces a fresh decision'],
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
  { problem: 'Cannot reconstruct why a decision was made', solution: 'Decision Traceability', path: '/decision-traceability' },
  { problem: 'Every customer or regulation needs a platform rebuild', solution: 'Governance Intelligence Studio', path: '/governance-studio' },
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
  {
    step: 7,
    title: 'Decision Traceability',
    detail: ['Condition detected: Missing Validation', 'Policy triggered: Independent Validation Required', 'Finding raised, outcome generated, action recommended'],
    outcome: 'Reconstructed end-to-end — who acted, and what evidence supported it',
    accent: 'var(--stage-1)',
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
    title: 'Evidence Registry',
    path: '/evidence-registry',
    icon: '🗃️',
    what: 'The universal governance evidence object — ten baseline types, from Policy Document to Third-Party Assessment.',
    why: 'Evidence Center holds deliverable artefacts; the Evidence Registry is the governance record that ties evidence to everything it supports.',
    look: 'Every record links to an AI asset and carries its own ownership, lifecycle state and expiry.',
  },
  {
    n: 9,
    title: 'Evidence Ownership',
    path: '/evidence-registry',
    icon: '👥',
    what: 'Evidence Owner, Business Owner, Reviewer and Approval Authority on every record.',
    look: 'The Executive Hub reports how many records have complete ownership on record.',
    why: 'Evidence nobody owns cannot be defended in an audit.',
  },
  {
    n: 10,
    title: 'Evidence Traceability',
    path: '/evidence-registry',
    icon: '🔗',
    what: 'Evidence can link to the AI asset, a risk assessment, a governance review, a decision record, a reauthorization record, or a governance timeline event.',
    why: 'A decision is only as defensible as the evidence chain behind it.',
    look: 'Open any evidence record’s detail card to see what it traces back to.',
  },
  {
    n: 11,
    title: 'Evidence Lifecycle',
    path: '/evidence-registry',
    icon: '🔁',
    what: 'Draft, Active, Expired, Archived or Superseded — every evidence record carries a lifecycle state.',
    why: 'Stale evidence is worse than no evidence if nobody notices it has expired.',
    look: 'Expiry tracking shows Valid, Expiring Soon or Expired at a glance, with days remaining.',
  },
  {
    n: 12,
    title: 'Evidence Timeline',
    path: '/evidence-registry',
    icon: '⏱️',
    what: 'Created, Updated, Reviewed, Approved, Expired, Archived — the lifecycle of a single evidence record.',
    why: 'Executives should be able to see how a piece of evidence came to be trusted.',
    look: 'Open any evidence record’s detail card to see its timeline.',
  },
  {
    n: 13,
    title: 'Decision Authority',
    path: '/decision-workbench-v4',
    icon: '⚖️',
    what: 'Where a named approver records GO, CONDITIONAL GO or NO GO.',
    why: 'An approval nobody owns is not an approval. Every decision carries a name and a justification.',
    look: 'Readiness is scored out of 100 first; failing pillars appear as blockers that must be cleared. The Authority Matrix shows the baseline approval expectation for the asset’s risk tier.',
  },
  {
    n: 14,
    title: 'Governance Monitoring',
    path: '/governance-monitoring',
    icon: '📡',
    what: 'Continuous health scoring across the live AI portfolio.',
    why: 'Governance does not stop at approval — posture drifts, and drift needs to be visible.',
    look: 'Assets are classified Healthy, Watchlist or Attention Required, with alerts for exceptions.',
  },
  {
    n: 15,
    title: 'Governance State',
    path: '/assets',
    icon: '🔁',
    what: 'Every asset carries a Governance State — Draft through Authorized, Monitoring, Reassessment Required, Conditional GO, No GO or Retired.',
    why: 'A GO decision is a point in time. Governance State tracks whether that authorization still holds.',
    look: 'Shown on the registry table, the asset detail card and the Executive Dashboard — never blank.',
  },
  {
    n: 16,
    title: 'Review Schedule',
    path: '/review-calendar',
    icon: '📅',
    what: 'Quarterly, semiannual, annual and ad hoc governance reviews, each with an owner and a due date.',
    why: 'Governance should not rely on memory. A schedule means nothing gets reviewed late by accident.',
    look: 'Every asset shows its next review date; the Executive Dashboard totals reviews still due.',
  },
  {
    n: 17,
    title: 'Reassessment Trigger',
    path: '/assets',
    icon: '⚡',
    what: 'A logged event — a model change, a new integration, a control failure — that calls an authorization into question.',
    why: 'Meaningful changes must trigger reassessment; annual reviews alone are not enough.',
    look: 'Each asset’s detail card shows its reassessment history — trigger type, severity, owner and status.',
  },
  {
    n: 18,
    title: 'Governance Timeline',
    path: '/governance-timeline',
    icon: '⏱️',
    what: 'The full lifecycle for one asset: created, authorized, trigger raised, review initiated and completed, GO / Conditional GO / NO GO, retired.',
    why: 'Executives should be able to understand an asset’s governance history in under a minute.',
    look: 'Open any asset’s timeline directly from its detail card or from this module.',
  },
  {
    n: 19,
    title: 'Reauthorization History',
    path: '/governance-timeline',
    icon: '📋',
    what: 'A traceable record of every reauthorization decision: who reviewed, when, what changed, and why.',
    why: 'Governance decisions become defensible only if the reasoning behind them is on record.',
    look: 'Reauthorization events capture the previous and new Governance State side by side.',
  },
  {
    n: 20,
    title: 'Readiness Center',
    path: '/dashboard',
    icon: '✅',
    what: 'Governance, Evidence, Review and Audit Readiness for the whole portfolio, each Ready, Partially Ready or Not Ready.',
    why: 'Is governance complete and ready? — the question every other module has been building toward.',
    look: 'The Executive Dashboard rolls all four readiness dimensions up in one place, alongside open gaps.',
  },
  {
    n: 21,
    title: 'Readiness Status',
    path: '/assets',
    icon: '🧭',
    what: 'Each asset carries its own Governance, Evidence, Review and Audit Readiness status.',
    why: 'Portfolio readiness is only as real as the readiness of the assets underneath it.',
    look: 'Open any asset’s detail card for its Readiness section, right below Governance Continuity.',
  },
  {
    n: 22,
    title: 'Gap Detection',
    path: '/dashboard',
    icon: '🧱',
    what: 'Missing owner, missing oversight, missing autonomy, missing or expired evidence, missing review, missing reauthorization — named, not scored.',
    why: 'A readiness label is only useful if you can see exactly what to fix.',
    look: 'The Readiness Gaps panel lists what is missing and for which asset; each asset’s detail card lists its own Gap Summary.',
  },
  {
    n: 23,
    title: 'Audit Readiness',
    path: '/executive-hub',
    icon: '📜',
    what: 'Whether governance records, evidence and traceability are available for an asset — the examiner’s question, answered in advance.',
    why: 'Audit readiness should be a standing position, not a scramble when the request arrives.',
    look: 'The Executive Hub’s Readiness Overview reports Audit Readiness across the portfolio alongside Governance and Evidence Readiness.',
  },
  {
    n: 24,
    title: 'Compliance Center',
    path: '/compliance-center',
    icon: '🏛️',
    what: 'Where per-asset regulatory compliance and the reusable Compliance Pack Framework meet.',
    why: 'Compliance should read from governance data already on record, not a parallel paperwork exercise.',
    look: 'The Compliance Pack Framework banner shows active packs and open gaps, and links straight into the workspace.',
  },
  {
    n: 25,
    title: 'Compliance Packs',
    path: '/compliance-packs',
    icon: '🧩',
    what: 'The reusable architecture every future regulation plugs into as configuration — a Pack Registry of RBI, ISO 42001 and EU AI Act style frameworks.',
    why: 'Build once, reuse everywhere: new regulations should be added as data, not a platform redesign.',
    look: 'Three demo packs today — sample structure only, no real regulatory content yet.',
  },
  {
    n: 26,
    title: 'Requirements',
    path: '/compliance-packs',
    icon: '📋',
    what: 'Each pack breaks down into named requirements — what the regulation actually asks for.',
    why: 'A requirement is the unit compliance work is organised around, not the asset or the pack as a whole.',
    look: 'Requirement IDs follow the pattern real regulations use — RBI-REQ-001, ISO-REQ-101, EUAI-REQ-210.',
  },
  {
    n: 27,
    title: 'Controls',
    path: '/compliance-packs',
    icon: '🧱',
    what: 'Each requirement is satisfied by one or more controls, each with a named owner.',
    why: 'A requirement without a control is just a sentence in a regulation — the control is what makes it operational.',
    look: 'Every control shows its owner and status; an unassigned owner is exactly the kind of thing the Gap Register catches.',
  },
  {
    n: 28,
    title: 'Coverage',
    path: '/compliance-packs',
    icon: '✅',
    what: 'Every control, requirement and pack rolls up to Covered, Partially Covered, Not Covered or Not Applicable.',
    why: 'No percentages, no maturity or trust scores — coverage is a plain, defensible status, not a number to argue with.',
    look: 'Evidence Mapping is what drives coverage: a control with no evidence mapped to it cannot be Covered.',
  },
  {
    n: 29,
    title: 'Gaps',
    path: '/compliance-packs',
    icon: '🚨',
    what: 'Missing Evidence, Missing Control, Missing Owner, Expired Evidence, Missing Review — named, not scored.',
    why: 'A coverage status is only actionable if you can see exactly what to fix underneath it.',
    look: 'The Executive Dashboard and Executive Hub both surface the same gap register for portfolio-wide visibility.',
  },
  {
    n: 30,
    title: 'Change & Reassessment',
    path: '/change-requests',
    icon: '🔁',
    what: 'Governs the change itself: classify, assess impact, route approvals, reapprove.',
    why: 'This is what makes approval conditional rather than permanent.',
    look: 'A weighted impact score sets the change magnitude, which decides who must reapprove — up to executive authority.',
  },
  {
    n: 31,
    title: 'Audit & Reporting',
    path: '/audit-logs',
    icon: '📜',
    what: 'The append-only record of every governance action, plus board and regulator reports.',
    why: 'This is the answer to "prove it" — assembled continuously rather than retrospectively.',
    look: 'Executive Governance and Audit Readiness reports are generated from the live record on demand.',
  },
  {
    n: 32,
    title: 'Regulatory Knowledge Engine',
    path: '/mapping-workspace',
    icon: '🗺️',
    what: 'The reusable foundation every future regulation plugs into: Source → Requirement → Obligation → Control → Evidence.',
    why: 'A new regulation should onboard as data — register the source, add requirements and obligations, map controls and evidence — not a platform redesign.',
    look: 'One sample source demonstrates all four coverage outcomes; the Requirement Registry and Obligation Library browse the same data across every source.',
  },
  {
    n: 33,
    title: 'Governance Intelligence',
    path: '/governance-intelligence',
    icon: '🧠',
    what: 'Governance reasoning: Policy → Condition → Violation → Finding → Outcome, with every outcome explainable.',
    why: 'Moves OMG from governance records to governance reasoning — detection and recommendation only, never an automatic state change.',
    look: 'Open any asset to see its triggered conditions, violated policies and the exact reasons behind its recommended outcome.',
  },
  {
    n: 34,
    title: 'Governance Actions',
    path: '/governance-actions',
    icon: '🛠️',
    what: 'Outcome → Recommended Action, with a human Accept / Reject / Defer decision layer.',
    why: 'Recommendation-driven, not automation-driven — nothing executes automatically, and humans remain accountable for every decision.',
    look: 'Open, Accepted, Deferred and Completed actions are filterable by asset, priority, owner and due date, with the full lifecycle audited.',
  },
  {
    n: 35,
    title: 'Decision Traceability',
    path: '/decision-traceability',
    icon: '🧭',
    what: 'Reconstructs any governance decision end-to-end: Condition → Policy → Violation → Finding → Outcome → Recommended Action → Human Decision.',
    why: 'A reviewer should be able to understand exactly why a decision occurred, who acted, and what evidence supported it — not just that it happened.',
    look: 'The Timeline view replays the full reasoning chain for any asset; Generate a Decision Evidence Pack for the audit-ready version.',
  },
  {
    n: 36,
    title: 'Governance Intelligence Studio',
    path: '/governance-studio',
    icon: '🎛️',
    what: 'Configure governance logic without code changes: Condition, Outcome and Action Designers, a Rule Mapping Engine, the Compliance Pack Builder foundation and Customer Governance Profiles.',
    why: 'Built Once. Configured Many Times. The same platform serves Banking, Insurance, Healthcare, Government and Enterprise by configuration, not by rebuilding — the final core-platform release before customer-specific compliance packs.',
    look: 'Toggle a condition or outcome tier off and the reasoning engine skips it immediately; edit an action rule and the next generated recommendation reflects it — no deployment required.',
  },
  {
    n: 37,
    title: 'Agent Accountability',
    path: '/agent-accountability',
    icon: '🕹️',
    what: 'Business Owner, Technical Owner, Risk Owner and Approver, assigned by name for every autonomous agent — Complete or Incomplete, at a glance.',
    why: 'An agent acts with delegated authority. It needs a human accountable behind it, exactly like any other governed AI system.',
    look: 'Compare a fully-owned agent against one with gaps — the platform never disguises an incomplete accountability picture.',
  },
  {
    n: 38,
    title: 'Agent Reauthorization',
    path: '/agent-accountability',
    icon: '🔁',
    what: 'Approval date, last review, next review and review frequency — with Active, Due Soon, Overdue or Expired computed automatically.',
    why: 'An approval from a year ago does not mean an agent is still safe today. Governance has to stay current, not just get granted once.',
    look: 'Overdue and expired agents surface on the Executive Dashboard\'s Overdue Reviews KPI, not just on their own record.',
  },
  {
    n: 39,
    title: 'Agent Decision Traceability',
    path: '/agent-accountability',
    icon: '🧭',
    what: 'Agent → Tool Used → Action Performed → Evidence Generated → Outcome, reconstructed live from the audit trail and evidence registry.',
    why: 'When an agent acts autonomously, you need to reconstruct exactly what it did and why — not just that it acted.',
    look: 'Open the Traceability Chain on any agent — it is assembled fresh from real records, never a pre-scripted narrative.',
  },
  {
    n: 40,
    title: 'Tool Governance',
    path: '/tool-registry',
    icon: '🧰',
    what: 'Every capability an agent can call, classified from Read-Only to Destructive, risk-tiered and owned.',
    why: 'An agent is only as safe as the tools it is allowed to use.',
    look: 'Tool Call Monitoring shows exactly which agents hold which grants, and where destructive access concentrates.',
  },
  {
    n: 41,
    title: 'Control Governance',
    path: '/control-library',
    icon: '🧱',
    what: 'A single control library, attached to any Asset, Model, Knowledge Asset, Prompt or Tool — one control, many attachments.',
    why: 'A control declared but never tested protects nothing on paper only.',
    look: 'Control Effectiveness shows real pass/fail test history driving each control\'s Effective, Partially Effective or Ineffective rating.',
  },
  {
    n: 42,
    title: 'Certification Governance',
    path: '/certification-records',
    icon: '🏆',
    what: 'Formal credentials — issued, renewed or revoked against any Asset, Model or Tool, backed by assessment evidence.',
    why: 'A certification is a stronger, more externally legible claim than an internal decision record alone.',
    look: 'See Active, Expiring Soon and Revoked side by side — a live register, never a static PDF.',
  },
  {
    n: 43,
    title: 'Universal Lifecycle Console',
    path: '/lifecycle-console',
    icon: '🔄',
    what: 'One portfolio-wide view of every Model, Knowledge Asset, Prompt and Tool\'s current lifecycle stage.',
    why: 'Register, Assess, Approve, Operate, Monitor, Reassess, Retire — knowing where everything sits, at a glance.',
    look: 'Filter by entity type or stage to spot anything stalled early or lingering past retirement.',
  },
  {
    n: 44,
    title: 'Governance Reports',
    path: '/governance-reports',
    icon: '📊',
    what: 'Seven executive report views — coverage, readiness, evidence, control effectiveness, certification, continuity and accountability.',
    why: 'Different audiences ask the same underlying governance data different questions.',
    look: 'Switch the report selector live to see one engine answering seven questions, not seven separate tools.',
  },
  {
    n: 45,
    title: 'Executive Dashboard',
    path: '/dashboard',
    icon: '🏛️',
    what: 'Ten KPIs and seven widgets rolling up risk, readiness, evidence, certifications, accountability, reauthorization, findings and controls across the whole portfolio.',
    why: 'A governance leader needs one screen that answers "are we in control?" without opening ten different tools.',
    look: 'Every widget is live — drilling into a KPI takes you to the exact records behind it, not a static snapshot.',
  },
  {
    n: 46,
    title: 'Governance Health',
    path: '/dashboard',
    icon: '💠',
    what: 'A portfolio-wide read on whether governance activity — ownership, evidence, review, reauthorization — is actually keeping pace.',
    why: 'Health measures whether governance is happening, not whether outcomes are good — it never blocks anything, it just tells the truth.',
    look: 'Watch the same health signal for a well-governed asset versus one with open gaps, side by side.',
  },
  {
    n: 47,
    title: 'Ownership',
    path: '/ownership',
    icon: '👤',
    what: 'The single Ownership Matrix — Business Owner, Technical Owner, Risk Owner, Compliance Owner and Approver — used everywhere on the platform, for every entity type.',
    why: 'One shared ownership model means an agent, a model and a tool are all held to the same accountability bar — no separate framework per entity type.',
    look: 'Complete or Incomplete, per entity, at a glance — an incomplete ownership picture is never hidden.',
  },
  {
    n: 48,
    title: 'Findings',
    path: '/findings',
    icon: '🧾',
    what: 'Every validation defect and governance issue, tracked from discovery through to verified resolution.',
    why: 'A finding that isn’t tracked to closure is just an email nobody followed up on.',
    look: 'Severity, owner and status are visible on every finding — nothing sits open without an assigned name.',
  },
  {
    n: 49,
    title: 'Corrective Actions',
    path: '/corrective-actions',
    icon: '🛠️',
    what: 'Remediation tasks raised against a finding or a failed control, tracked through to verified completion.',
    why: 'A failed control or an open finding needs an owner, a deadline and proof it was actually fixed.',
    look: 'Closed-loop by design — an action only leaves Open once its fix is verified, not just claimed.',
  },
  {
    n: 50,
    title: 'Certification Evidence',
    path: '/certification-evidence',
    icon: '📎',
    what: 'The assessment proof — reports, test results, sign-offs — filed behind every issued certification.',
    why: 'A certification is only as strong as the evidence an auditor could pull behind it.',
    look: 'Every certification record links straight to the evidence that justified it — nothing is certified on assertion alone.',
  },
  {
    n: 51,
    title: 'Governance Journey Explorer',
    path: '/governance-journey',
    icon: '🧭',
    what: 'Before: reconstructing what happened to an asset meant manually opening Inventory, Risk, Evidence, Findings, Corrective Actions and Certification one at a time. After: one screen assembles the Timeline, Decision Reconstruction, Governance Story and Governance Value straight from those same records.',
    why: 'The story was always there, split across modules. Making it visible in one place turns governance data into governance understanding — without adding a single new record type.',
    look: 'Select the Fraud Detection Sentinel Agent for a clean approval story, or the Enterprise Portfolio Multi-Agent System to see a real reassessment, an open finding and a revoked certification play out — every field traced to a record on file, or marked Not Recorded.',
  },
  {
    n: 52,
    title: 'Product Release Notes',
    path: '/release-notes',
    icon: '🗞️',
    what: 'A single evolution timeline, oldest release first, showing how OMG grew from an AI asset registry into the full governance operating system it is today.',
    why: 'Releases matter because governance capability is not static — practitioner feedback, audit observations and real governance gaps become new capability over time, through the OrchestrAI Delivery Framework (ODF). Seeing that history builds confidence that the platform keeps closing real gaps, not just adding features.',
    look: 'The current release is marked; every earlier release lists exactly what it added, in the order it shipped — the same order the underlying governance model matured.',
  },
  {
    n: 53,
    title: 'Environment Management',
    path: '/environment-management',
    icon: '🧪',
    what: 'Foundation for future DEV / QA / PROD environment separation — a registry, a Super-Admin-only selector and health indicators, built without touching how the app runs today.',
    why: 'Productionizing OMG later should not require redesigning it. Laying the environment architecture now — before it is load-bearing — means DEV, QA and PROD can separate cleanly when a real customer needs it.',
    look: 'Only DEV is Active and Fully Seeded; QA and PROD are visibly Planned and Not Provisioned — nothing here pretends more exists than actually does.',
  },
  {
    n: 54,
    title: 'Tenant Registry',
    path: '/tenant-management',
    icon: '🏢',
    what: 'Foundation for future customer onboarding — a tenant registry and a Tenant Context Service, alongside illustrative sample tenants Bank Alpha and Insurance Beta.',
    why: 'Multi-tenant isolation is a future capability, not today\'s. Preparing the data architecture now avoids a rebuild later, while today\'s single shared Demo Tenant keeps working exactly as it does now.',
    look: 'The Tenant Context Service always resolves to the Demo Tenant — the two illustrative tenants are clearly marked Planned, for demonstration only.',
  },
  {
    n: 55,
    title: 'Customer Workspace Foundation',
    path: '/customer-workspace',
    icon: '🗃️',
    what: 'The seam between common OMG platform capability and customer-specific extensions — a workspace registry, configuration layer, extension catalog, solution blueprints and a readiness dashboard, illustrated with Banking, Insurance and Telecom.',
    why: 'ODF-driven customization needs a real place to plug into. This release draws that boundary explicitly, so customer-specific work never has to be forced into platform code.',
    look: 'Every extension in the catalog is labeled ODF Implementation or Customer-Specific — the boundary is visible, not assumed.',
  },
  {
    n: 56,
    title: 'Governability Dashboard',
    path: '/governability-dashboard',
    icon: '🛡️',
    what: 'Whether governance legitimacy can still be established, portfolio-wide — Governable, Governable With Conditions, Review Required, Governance Attention Required, or Not Governable, computed live.',
    why: 'Governance Continuity asks whether a decision\'s date is still valid. Governability asks the harder question: given everything that has changed since, does the decision still hold up? OMG answers this as intelligence, not enforcement.',
    look: 'Every status traces to real Evidence Sufficiency, Authority Currency and Admissibility signals, listed underneath — nothing here is a black-box score.',
  },
  {
    n: 57,
    title: 'Evidence Sufficiency',
    path: '/governance-journey?tab=governability',
    icon: '🗃️',
    what: 'Five dimensions beyond "does evidence exist": Availability, Recency, Completeness, Relevance and Context Alignment.',
    why: 'Presence is not the same as sufficiency. A single expired report satisfies "evidence exists" but should not satisfy "evidence supports this decision".',
    look: 'Select the Enterprise Portfolio Multi-Agent System to see which of the five checks actually fail, and why.',
  },
  {
    n: 58,
    title: 'Authority Currency',
    path: '/governance-journey?tab=governability',
    icon: '🪪',
    what: 'Whether decision authority still exists, is still recently confirmed, and is still matched to the asset\'s current risk tier.',
    why: 'A named owner from a year ago is not the same claim as a currently-confirmed one — especially once risk has moved and oversight has not kept pace.',
    look: 'Days since last review, and whether current oversight still matches what the Authority Matrix expects for this risk tier.',
  },
  {
    n: 59,
    title: 'Admissibility',
    path: '/governance-journey?tab=governability',
    icon: '⚖️',
    what: 'Whether the next governance decision remains legitimate: Continue, Continue With Conditions, Escalate, Reauthorize, or Pause.',
    why: 'This is the composition that turns "conditions now" into a recommendation — advisory only, never an automatic suspension.',
    look: 'Every outcome carries its reasons — composed from the existing Governance Outcome ladder, Evidence Sufficiency and Authority Currency, nothing invented.',
  },
  {
    n: 60,
    title: 'Reassessment',
    path: '/governability-dashboard',
    icon: '🔁',
    what: 'Report a material change — Model, Prompt, Vendor, Ownership, Risk, Regulatory, Policy Change or Control Failure — and see it raise a Governance Alert, a reassessment requirement, and a timeline entry.',
    why: 'The reassessment trigger taxonomy already worked end to end; what was missing was a human-facing way to actually use it. This closes that gap.',
    look: 'File a trigger and watch the asset\'s Governability status update immediately — computed, not just recorded.',
  },
  {
    n: 61,
    title: 'Decision Reconstruction',
    path: '/governance-journey?tab=decision',
    icon: '⚖️',
    what: 'Why was it approved, what evidence supported it, who approved it, what authority existed, and what reassessments followed — all reconstructed from records already on file.',
    why: 'An auditor should never have to manually cross-reference five modules to answer "why is this asset allowed to run".',
    look: 'The Governability tab sits right alongside this reconstruction — the "why" and the "is it still true" live together.',
  },
  {
    n: 62,
    title: 'Export Pack',
    path: '/governance-journey',
    icon: '📦',
    what: 'Decision Chain, Evidence Chain, Approval Chain, Reassessment History and the Governability Assessment, exported as JSON, CSV, or printed to PDF.',
    why: 'Governance records that cannot leave the platform are not audit-ready. An auditor or regulator needs to take the record with them.',
    look: 'Export buttons appear in the header the moment an asset is selected — every format pulls from the exact same live data as the screen.',
  },
  {
    n: 63,
    title: 'Workspace Login',
    path: '/login',
    icon: '🔑',
    what: 'A second login path, alongside the seeded demo personas — email and password resolve into an isolated workspace instead of the shared demo dataset.',
    why: 'A real evaluator brings their own AI systems to govern, not the demo\'s. Workspace Login is where that separate, isolated evaluation begins.',
    look: 'Toggle to "Workspace Login" on the sign-in screen — try chris@company.com / demo1234, a demo-only credential, never a claim of real authentication.',
  },
  {
    n: 64,
    title: 'Persona Selection',
    path: '/workspace-persona-landing',
    icon: '🎭',
    what: 'After signing into a workspace, choose a starting governance perspective — Governance Admin, Risk Officer, Business Owner, Validator, Auditor or Viewer.',
    why: 'The same workspace looks different depending on who is evaluating it — this is the same 6-persona switcher used everywhere in OMG, surfaced once up front.',
    look: 'Pick any lens to continue — nothing about RBAC changes, and the full switcher remains available afterward from the Topbar.',
  },
  {
    n: 65,
    title: 'Workspace Dashboard',
    path: '/workspace-dashboard',
    icon: '🗂️',
    what: 'Upload an asset, create a finding, and immediately see Governability, Evidence Sufficiency and Authority Currency — scoped only to this workspace.',
    why: 'Evaluation should feel like using the real product on real (evaluator-owned) data, not reading about someone else\'s demo.',
    look: 'A persistent Workspace Session Banner stays visible on every page — workspace name, user, persona, environment and status, so context is never lost.',
  },
  {
    n: 66,
    title: 'Workspace Audit Trail',
    path: '/workspace-audit-trail',
    icon: '📋',
    what: 'Every action taken inside the workspace — asset created, finding raised, persona changed, pack exported — with who did it, as which persona, and when.',
    why: 'Governance accountability applies to the evaluation itself, not just to the assets being evaluated.',
    look: 'Switch personas or upload an asset, then check back here — the entry appears immediately.',
  },
  {
    n: 67,
    title: 'Export Pack',
    path: '/workspace-dashboard',
    icon: '📦',
    what: 'A workspace-wide Governance Pack — every asset, its evidence, findings, alerts, Governability results, timeline and the workspace audit trail — as JSON, CSV or PDF.',
    why: 'An evaluation only counts if it can leave the platform — a governance team needs the record, not just the screen.',
    look: 'Export buttons sit in the Workspace Dashboard header — every format is built from the exact same live workspace data.',
  },
  {
    n: 68,
    title: 'Clone Workspace',
    path: '/workspace-directory',
    icon: '🧬',
    what: 'Duplicate a workspace — its assets, evidence, findings, alerts and reassessment triggers — into a fresh copy for a new round of testing.',
    why: 'POC testing, regression testing, scenario comparison and governance experimentation all need a clean starting point without losing the original.',
    look: '"Chris Sandbox" becomes "Chris Sandbox v2" — same starting data, completely independent from that point forward.',
  },
];

/* ================== Section 5b — seven named guided tours ================= */

export interface GuidedTourDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  stepTitles: string[];
}

/**
 * Seven named tours, each a curated path through TOUR_STEPS (by title — a
 * step can appear in more than one tour, e.g. Findings belongs to both the
 * Lifecycle and Audit tours). Refresh of the single 36-stop tour above into
 * named, audience-specific paths — no new step content beyond what R16–R20.1
 * actually shipped (steps 37–44); Release 18 added the sixth, Governability
 * Intelligence, and the Release 18.1 Patch adds the seventh, Workspace
 * Evaluation, the same way.
 */
export const GUIDED_TOURS: GuidedTourDefinition[] = [
  {
    id: 'executive-overview',
    name: 'Executive Overview',
    description: 'Governance health, readiness, certifications, findings and evidence coverage, in ten minutes.',
    icon: '🏛️',
    stepTitles: ['Executive Dashboard', 'Governance Health', 'Readiness Center', 'Certification Governance', 'Findings', 'Evidence Registry', 'Governance Reports', 'Product Release Notes', 'Environment Management', 'Tenant Registry', 'Customer Workspace Foundation'],
  },
  {
    id: 'governance-lifecycle',
    name: 'Governance Lifecycle',
    description: 'Register, own, classify, validate, approve, evidence, control, remediate, certify, reassess — the full journey.',
    icon: '🔄',
    stepTitles: ['AI Asset Registry', 'Ownership', 'Risk Center', 'Validation Center', 'Decision Authority', 'Evidence Registry', 'Control Governance', 'Findings', 'Corrective Actions', 'Certification Governance', 'Change & Reassessment', 'Reauthorization History', 'Governance Journey Explorer'],
  },
  {
    id: 'agent-governance',
    name: 'Agent Governance',
    description: 'Accountability, ownership, approval, reauthorization, and decision traceability for autonomous agents.',
    icon: '🕹️',
    stepTitles: ['AI Asset Registry', 'Agent Accountability', 'Ownership', 'Decision Authority', 'Agent Reauthorization', 'Agent Decision Traceability', 'Evidence Registry', 'Governance Monitoring'],
  },
  {
    id: 'audit-assurance',
    name: 'Audit & Assurance',
    description: 'Evidence, audit trail, lifecycle visibility, reporting, certification evidence, findings and corrective actions.',
    icon: '🔍',
    stepTitles: ['Evidence Registry', 'Audit & Reporting', 'Universal Lifecycle Console', 'Governance Reports', 'Certification Evidence', 'Findings', 'Corrective Actions', 'Governance Journey Explorer'],
  },
  {
    id: 'governance-intelligence',
    name: 'Governance Intelligence',
    description: 'Regulatory mapping, compliance packs, readiness scoring, governance analytics and executive reporting.',
    icon: '🧠',
    stepTitles: ['Regulatory Knowledge Engine', 'Compliance Packs', 'Readiness Center', 'Governance Intelligence', 'Governance Reports'],
  },
  {
    id: 'governability-intelligence',
    name: 'Governability Intelligence',
    description: 'Governance Continuity vs. Runtime Governability — Evidence Sufficiency, Authority Currency, Admissibility and Post-Intervention Revalidation.',
    icon: '🛡️',
    stepTitles: ['Governability Dashboard', 'Evidence Sufficiency', 'Authority Currency', 'Admissibility', 'Reassessment', 'Decision Reconstruction', 'Export Pack'],
  },
  {
    id: 'workspace-evaluation',
    name: 'Workspace Evaluation',
    description: 'Sign into an isolated workspace, pick a governance perspective, govern your own assets, and export the record — Release 18.1 Patch.',
    icon: '🗂️',
    stepTitles: ['Workspace Login', 'Persona Selection', 'Workspace Dashboard', 'Workspace Audit Trail', 'Export Pack', 'Clone Workspace'],
  },
];

export function getTourSteps(tour: GuidedTourDefinition): TourStep[] {
  return tour.stepTitles
    .map(title => TOUR_STEPS.find(s => s.title === title))
    .filter((s): s is TourStep => !!s);
}

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

export type CapabilityGroup = 'foundation' | 'operations' | 'assurance' | 'intelligence' | 'oversight';

/**
 * Product Experience Refresh — the five capability sections a first-time
 * reviewer sees on the landing page, matching the same five names used for
 * the primary navigation groups so the product reads as one consistent
 * model rather than two different taxonomies.
 */
export const CAPABILITY_GROUP_INFO: Record<CapabilityGroup, { label: string; tagline: string; icon: string }> = {
  foundation: { label: 'Governance Foundation', tagline: 'What exists, and who is accountable for it.', icon: '🗂️' },
  operations: { label: 'Governance Operations', tagline: 'How risk, validation and approval actually happen.', icon: '⚙️' },
  assurance: { label: 'Governance Assurance', tagline: 'The proof, the fixes, and the credentials behind every claim.', icon: '🛡️' },
  intelligence: { label: 'Governance Intelligence', tagline: 'Regulatory context and reasoning, applied to what you govern.', icon: '🧠' },
  oversight: { label: 'Governance Oversight', tagline: 'Whether governance is holding up, continuously — not just at approval.', icon: '👁️' },
};

export const CAPABILITIES: { label: string; icon: string; path: string; blurb: string; group: CapabilityGroup }[] = [
  { label: 'AI Registry', icon: '🗂️', path: '/assets', blurb: 'Prevent unmanaged AI from entering production', group: 'foundation' },
  { label: 'Lifecycle Management', icon: '🔄', path: '/asset-lifecycle', blurb: 'Registration to retirement', group: 'foundation' },
  { label: 'Risk Management', icon: '⚡', path: '/risk', blurb: 'Four-tier classification', group: 'operations' },
  { label: 'Validation', icon: '🧪', path: '/validation', blurb: 'Six independent disciplines', group: 'operations' },
  { label: 'Decision Workbench', icon: '⚖️', path: '/decision-workbench-v4', blurb: 'GO / Conditional / NO GO', group: 'operations' },
  { label: 'Assessment Center', icon: '📝', path: '/assessment-center', blurb: 'Record a standardized governance assessment', group: 'operations' },
  { label: 'Assessment Playbooks', icon: '📖', path: '/assessment-playbooks', blurb: 'Structured guidance for every assessment type', group: 'operations' },
  { label: 'Calibration Library', icon: '📚', path: '/calibration-library', blurb: 'Scoring rubric and worked reference examples', group: 'operations' },
  { label: 'Variance Analysis', icon: '📊', path: '/variance-analysis', blurb: 'Observed dispersion in recorded assessment scores', group: 'operations' },
  { label: 'Assessment Academy', icon: '🎓', path: '/assessment-academy', blurb: 'Guidance on consistent, well-evidenced assessment', group: 'operations' },
  { label: 'Multi-Assessor Consensus', icon: '👥', path: '/consensus-assessments', blurb: 'Independent scoring, hidden until the round closes', group: 'operations' },
  { label: 'Benchmark Recommendations', icon: '🧭', path: '/benchmark-recommendations', blurb: 'Guided playbooks, examples and scoring ranges', group: 'operations' },
  { label: 'Evidence Management', icon: '📄', path: '/evidence', blurb: 'Preserve the evidence you will need before regulators ask for it', group: 'assurance' },
  { label: 'Governance Continuity', icon: '🔁', path: '/change-requests', blurb: 'Change-driven reassessment', group: 'assurance' },
  { label: 'Assessor Certification', icon: '🏅', path: '/assessor-certification', blurb: 'Calibration accuracy against benchmark scenarios', group: 'assurance' },
  { label: 'Compliance Pack Framework', icon: '🧩', path: '/compliance-packs', blurb: 'Pack, requirement, control, coverage', group: 'intelligence' },
  { label: 'Regulatory Knowledge Engine', icon: '🗺️', path: '/mapping-workspace', blurb: 'Source, requirement, obligation, evidence', group: 'intelligence' },
  { label: 'Governance Intelligence', icon: '🧠', path: '/governance-intelligence', blurb: 'Stop high-risk AI from bypassing governance controls', group: 'intelligence' },
  { label: 'Governance Actions', icon: '🛠️', path: '/governance-actions', blurb: 'Accept, reject or defer — human-governed', group: 'intelligence' },
  { label: 'Governance Intelligence Studio', icon: '🎛️', path: '/governance-studio', blurb: 'Configure governance logic without code changes', group: 'intelligence' },
  { label: 'Regulatory Applicability', icon: '🌐', path: '/regulatory-applicability', blurb: 'Which regulations apply to this tenant', group: 'intelligence' },
  { label: 'Cross-Framework Mapping', icon: '🔗', path: '/cross-framework-mapping', blurb: 'Controls that satisfy multiple frameworks at once', group: 'intelligence' },
  { label: 'Compliance Impact Analysis', icon: '🔁', path: '/compliance-impact-analysis', blurb: 'What changed recently, and its compliance impact', group: 'intelligence' },
  { label: 'Regulatory Change Readiness', icon: '📶', path: '/regulatory-change-readiness', blurb: 'Ready if a regulation changed tomorrow', group: 'intelligence' },
  { label: 'Human Oversight', icon: '✋', path: '/override-center', blurb: 'Override and kill switch', group: 'oversight' },
  { label: 'Monitoring', icon: '📡', path: '/governance-monitoring', blurb: 'Identify governance gaps before they become business risks', group: 'oversight' },
  { label: 'Audit & Reporting', icon: '📜', path: '/audit-logs', blurb: 'Append-only trail', group: 'oversight' },
  { label: 'Decision Traceability', icon: '🧭', path: '/decision-traceability', blurb: 'Reconstruct any decision end-to-end', group: 'oversight' },
  { label: 'Audit Readiness Intelligence', icon: '📄', path: '/audit-readiness-intelligence', blurb: 'What evidence supports compliance today', group: 'oversight' },
  { label: 'Governance Value Dashboard', icon: '📊', path: '/governance-value', blurb: 'Governance effectiveness, measured — the board-friendly view', group: 'oversight' },
  { label: 'Governance Drift Center', icon: '📉', path: '/governance-drift', blurb: 'Detect governance process degradation before it compounds', group: 'oversight' },
  { label: 'Governance Health Center', icon: '💚', path: '/governance-health', blurb: 'One executive indicator for governance health, advisory only', group: 'oversight' },
  { label: 'Governance Effectiveness Score', icon: '🧮', path: '/governance-effectiveness', blurb: 'Is governance actually improving over time', group: 'oversight' },
  { label: 'Governance ROI', icon: '💰', path: '/governance-roi', blurb: 'Governance activity translated into business value', group: 'oversight' },
  { label: 'Governance Maturity', icon: '📶', path: '/governance-maturity', blurb: 'Reactive through Optimized, by domain', group: 'oversight' },
  { label: 'Governance Benchmarking', icon: '📐', path: '/governance-benchmarking', blurb: 'Compare against industry reference benchmarks', group: 'oversight' },
  { label: 'Governance Outcomes', icon: '🎯', path: '/governance-outcomes', blurb: 'What value governance delivered, not just activity', group: 'oversight' },
];

/* ======= Section 8.5 — sales positioning: platform vs. customer packs === */

/**
 * Release 10 — the platform/pack boundary. Everything under "platform" is
 * built and live today; everything under "packs" is what a customer
 * configures through the Governance Intelligence Studio — Condition, Outcome
 * and Action Designers plus a Customer Governance Profile — not a rebuild.
 */
export const PLATFORM_CAPABILITIES_SUMMARY: string[] = [
  'AI Registry, Ownership, Risk, Validation, Evidence and Decision Authority',
  'Continuous Monitoring and Governance Continuity',
  'Compliance Pack Framework and the Regulatory Knowledge Engine (Source → Requirement → Obligation → Control → Evidence)',
  'Governance Intelligence (Policy → Condition → Violation → Finding → Outcome) and Governance Actions',
  'Decision Traceability, end-to-end',
  'The Governance Intelligence Studio itself: Condition, Outcome and Action Designers, the Rule Mapping Engine, the Compliance Pack Builder foundation',
];

export const CUSTOMER_PACKS: { name: string; icon: string; detail: string }[] = [
  { name: 'Banking Pack', icon: '🏦', detail: 'Credit, fraud and prudential-risk conditions, outcome tiers and actions, mapped to the Banking Governance Profile.' },
  { name: 'Insurance Pack', icon: '📑', detail: 'Underwriting, claims and actuarial-risk conditions and controls, mapped to the Insurance Governance Profile.' },
  { name: 'Healthcare Pack', icon: '🏥', detail: 'Clinical-safety and patient-data conditions and controls, mapped to the Healthcare Governance Profile.' },
  { name: 'Government Pack', icon: '🏛️', detail: 'Transparency and citizen-impact conditions and controls, mapped to the Government Governance Profile.' },
  { name: 'Enterprise Pack', icon: '🏢', detail: 'General-purpose configuration for AI outside a regulated vertical, mapped to the Enterprise Governance Profile.' },
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

/* ======= Section 9 — Final Strategic Positioning: Founding Partners ===== */

/**
 * Final Strategic Positioning update — OMG Core Platform v1.0 is complete;
 * the platform's own next phase is co-designing configuration on top of it
 * with Founding Governance Partners, not rebuilding it. This section is
 * purely business positioning content — no new schema, no new module, per
 * the mandate's own framing ("without major architectural redesign").
 */
export const PLATFORM_STATUS_TITLE = 'OMG Core Platform v1.0 Complete';

export const PLATFORM_STATUS_STATEMENT =
  'The OMG platform baseline has been completed and is ready for customer onboarding, configuration, validation, and production deployment.';

/** One-to-one with Releases 1-10 — see docs/governance/12 through 23. */
export const PLATFORM_STATUS_CAPABILITIES: string[] = [
  'Governance Authority',
  'Governance Continuity',
  'Evidence Management',
  'Production Persistence',
  'Compliance Framework',
  'Regulatory Knowledge Engine',
  'Governance Intelligence Engine',
  'Governance Actions Engine',
  'Governance Decision Traceability',
  'Governance Intelligence Studio',
];

export interface PlatformJourneyStep {
  step: number;
  label: string;
  icon: string;
  /** A route path, or the sentinel '#partner' to scroll to the Partner With Us section on this page instead of navigating. */
  path: string;
}

/**
 * The OMG Platform Journey — eleven platform-level capability areas ending
 * in the engagement outcome ("Deploy With Confidence"), distinct from the
 * nine-stage per-asset JOURNEY_STAGES above and from the existing asset
 * lifecycle, which this deliberately does not modify. This is what a viewer
 * sees across the whole platform, not what a single AI asset progresses
 * through.
 */
export const PLATFORM_JOURNEY: PlatformJourneyStep[] = [
  { step: 1, label: 'Govern AI Assets', icon: '🗂️', path: '/assets' },
  { step: 2, label: 'Governance Continuity', icon: '🔁', path: '/change-requests' },
  { step: 3, label: 'Evidence Management', icon: '📄', path: '/evidence' },
  { step: 4, label: 'Demonstrate Readiness', icon: '📊', path: '/command-center' },
  { step: 5, label: 'Assess Compliance', icon: '🧩', path: '/compliance-center' },
  { step: 6, label: 'Map Regulatory Obligations', icon: '🗺️', path: '/mapping-workspace' },
  { step: 7, label: 'Apply Governance Intelligence', icon: '🧠', path: '/governance-intelligence' },
  { step: 8, label: 'Manage Governance Actions', icon: '🛠️', path: '/governance-actions' },
  { step: 9, label: 'Reconstruct Decisions', icon: '🧭', path: '/decision-traceability' },
  { step: 10, label: 'Configure Customer Governance', icon: '🎛️', path: '/governance-studio' },
  { step: 11, label: 'Measure Effectiveness', icon: '🧮', path: '/governance-effectiveness' },
  { step: 12, label: 'Demonstrate Outcomes', icon: '🎯', path: '/governance-outcomes' },
  { step: 13, label: 'Continuous Improvement', icon: '📶', path: '/governance-maturity' },
  { step: 14, label: 'Calibrate Assessments', icon: '📝', path: '/assessment-center' },
  { step: 15, label: 'Standardize Scoring', icon: '📚', path: '/calibration-library' },
  { step: 16, label: 'Analyze Variance', icon: '📊', path: '/variance-analysis' },
  { step: 17, label: 'Certify Assessors', icon: '🏅', path: '/assessor-certification' },
  { step: 18, label: 'Build Consensus', icon: '👥', path: '/consensus-assessments' },
  { step: 19, label: 'Recommend Benchmarks', icon: '🧭', path: '/benchmark-recommendations' },
  { step: 20, label: 'Deploy With Confidence', icon: '🤝', path: '#partner' },
];

/**
 * Release 11 — Governance Effectiveness & Outcomes Engine. Additive to the
 * hero: a positioning statement surfaced alongside the H1, the same way the
 * vNext Prevention-First box was added without touching it.
 *
 * Product Experience Refresh — the H1 itself was later changed to
 * "Enterprise AI Governance Operating System" in both hero sections
 * (OmgOverviewPage.tsx and LoginPage.tsx are independently hardcoded — keep
 * them in sync if either changes again).
 */
export const EFFECTIVENESS_POSITIONING_TAGS: string[] = [
  'Governance',
  'Compliance',
  'Traceability',
  'Accountability',
  'Effectiveness',
  'Outcomes',
  'Continuous Assurance',
];

export const EFFECTIVENESS_HERO_STATEMENT =
  'Move Beyond Governance Documentation. Measure Governance Effectiveness, Demonstrate Outcomes, and Prove Value Through Evidence-Driven Continuous Assurance.';

export const PARTNER_WITH_US_STATEMENT =
  'OMG provides the governance operating platform. We work alongside customers to configure, validate, test, and operationalize governance capabilities aligned to their regulatory, compliance, risk, and business requirements before production deployment.';

export const FOUNDING_PARTNERS_STATEMENT =
  'We are actively engaging a select group of Founding Governance Partners across Banking, NBFC, Insurance, Healthcare, Government, and Enterprise sectors to help shape industry-specific governance accelerators, operating models, and compliance packs on top of the OMG platform.';

export const DESIGN_PARTNER_INDUSTRIES: { name: string; icon: string }[] = [
  { name: 'Banking', icon: '🏦' },
  { name: 'NBFC', icon: '💳' },
  { name: 'Insurance', icon: '📑' },
  { name: 'Healthcare', icon: '🏥' },
  { name: 'Government', icon: '🏛️' },
  { name: 'Enterprise', icon: '🏢' },
];

export interface EngagementPhase {
  phase: number;
  title: string;
  items: string[];
}

export const ENGAGEMENT_PHASES: EngagementPhase[] = [
  { phase: 1, title: 'Governance Discovery', items: ['Governance Assessment', 'AI Operating Model Review', 'Compliance Assessment', 'Gap Analysis'] },
  { phase: 2, title: 'Configuration & Extension', items: ['Governance Policies', 'Conditions', 'Outcomes', 'Actions', 'Governance Profiles', 'Compliance Mappings'] },
  { phase: 3, title: 'Joint Validation & QA', items: ['Governance Walkthroughs', 'Scenario Testing', 'User Acceptance Testing', 'Executive Reviews'] },
  { phase: 4, title: 'Production Deployment', items: ['Production Rollout', 'User Enablement', 'Operational Support', 'Continuous Improvement'] },
];

export const FUTURE_COMPLIANCE_ACCELERATORS_STATEMENT =
  'OMG is designed as a configurable governance platform. Future compliance accelerators can be implemented through configuration and governance mappings without requiring platform redesign.';

/** Regulatory-framework and customer-specific accelerators — distinct from CUSTOMER_PACKS above (which are industry-scoped); each implemented as Studio configuration once co-designed with a partner in that space. */
export const REGULATORY_COMPLIANCE_PACKS: string[] = [
  'RBI Guidance',
  'ISO/IEC 42001',
  'EU AI Act',
  'NIST AI RMF',
  'Internal Enterprise Policies',
  'Customer-Specific Governance Controls',
];

export const EXECUTIVE_MESSAGE_STATEMENT =
  'Executives do not buy governance — they buy protection from regulatory exposure, uncontrolled AI usage, missing accountability, poor decisions, missing evidence, audit failures, and reputational damage. The OMG platform baseline is complete. Future work focuses on customer onboarding, governance transformation engagements, industry accelerators, compliance packs, and production deployments without requiring major architectural redesign.';

export const FINAL_DECLARATION_TITLE = 'OMG Core Platform Version 1.0 Complete';
export const FINAL_DECLARATION_STATEMENT = 'Built Once. Configured Together. Governed Continuously.';

/** vNext — Prevention-First Blueprint's Final Positioning Statement. */
export const PREVENTION_POSITIONING_STATEMENT =
  'OrchestrAI OMG helps organizations identify governance gaps, strengthen accountability, preserve evidence, and make informed decisions before governance weaknesses become business consequences.';

/**
 * Product Experience Refresh — the shift OMG asks a first-time reviewer to
 * see: from paperwork to a running system. Reused wherever the app wants to
 * reinforce category positioning (landing page, footer), never as a
 * replacement for the module-level "what/why/outcome" content.
 */
export const PRODUCT_MESSAGING_SHIFTS: { from: string; to: string }[] = [
  { from: 'Governance Documentation', to: 'Governance Operations' },
  { from: 'Point-in-Time Reviews', to: 'Continuous Governance' },
  { from: 'Compliance Repositories', to: 'Governance Operating Systems' },
];

export const GOVERNANCE_PRINCIPLE_STATEMENT =
  'Governance by Design. Governance by Evidence. Governance by Continuity.';
