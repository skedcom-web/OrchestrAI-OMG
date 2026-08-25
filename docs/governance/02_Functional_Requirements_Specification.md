# ODF Deliverable 02: Functional Requirements Specification
> **OrchestrAI Model Governance (OMG) Enterprise Platform**
> **Framework Standard**: ODF Universal Governance Standard v1.0
> **Version**: 2.0 — Core Platform v1.0 Complete (Releases 1–10 + Final Strategic Positioning)

---

## 1. Feature Specifications by Governance Domain

### AI Governance Registry
- Centralized registry supporting 9 AI asset types: Application, Agent, Model, LLM, Copilot, RAG System, AI Workflow, Multi-Agent System, Third-Party AI Service.
- Asset metadata, versioning, department ownership, tech stack tags and data sensitivity classification.
- A derived, eight-stage lifecycle position (AI Asset → Ownership → Risk → Validation → Evidence → Decision → Production → Monitoring) computed from live governance state, not stored as a status field.

### Executive Governance
- Command Center and Executive Hub with four role-tuned lenses (CIO/CTO, CRO, Compliance, Board).
- Governance scorecards, executive heatmaps, governance insights, and Board & Regulator reporting generated from the live record.

### Policy Governance
- A policy registry with seven automatic policy-breach detection rules evaluated continuously against live governance state.
- Policy-to-asset mapping and a policy violation tracker.

### Risk, Compliance & Intelligence
- **Risk classification**: a five-dimension risk assessment (context, data sensitivity, decision impact, operational impact, control oversight) producing one of four risk tiers (Low, Medium, High, Critical).
- **Validation**: independent review across six disciplines (Business, Technical, Security, Compliance, Operational, Model), with a findings tracker running Open → In Progress → Resolved → Verified.
- **Evidence**: ten mandatory ODF deliverable types per asset, each versioned, attributed and status-tracked.
- **Compliance Pack Framework** (Release 5/5.1): Pack → Requirement → Control → Evidence, coverage computed from real linkage rather than a hand-entered score.
- **Regulatory Knowledge Engine** (Release 6): Source → Requirement → Obligation → Control → Evidence, the reusable foundation any future regulation configures onto.
- **Governance Intelligence Engine** (Release 7): Policy → Condition → Violation → Finding → Outcome, computed live, with every Outcome carrying its own explicit reasons.
- **Governance Actions Engine** (Release 8): Outcome/Finding → Recommended Action, with a human Accept / Reject / Defer decision layer — nothing executes automatically.
- **Governance Decision Traceability** (Release 9): full chain reconstruction (Condition → Policy → Violation → Finding → Outcome → Action → Human Decision) plus a printable Decision Evidence Pack.
- **Governance Intelligence Studio** (Release 10): a Condition Designer, Outcome Designer and Action Designer that make the reasoning engine's configuration editable at runtime, a Rule Mapping Engine visualization, a Compliance Pack Builder visualization, and Customer Governance Profiles (Banking, Insurance, Healthcare, Government, Enterprise) with exactly one active per tenant.

### Decision Governance
- A five-pillar governance readiness score (Ownership 25%, Risk 20%, Validation 20%, Decision 20%, Evidence 15%) computed out of 100.
- A governance blockers evaluator surfacing any failing pillar as an explicit blocker.
- Decision Authority workbench recording a formal outcome — GO, CONDITIONAL GO, NO GO, or PENDING — with a named decision owner and justification.

### Change Governance
- Change classification across six categories (Model, Vendor, Data, Prompt, Policy, Operational).
- Impact assessment across seven governance areas, producing a weighted 0–100 impact score.
- A reassessment rules engine resolving the score to a change magnitude (Minor / Moderate / Major / Critical), each routing to a different approval depth.
- A ten-state governance state machine (Draft, Review, Approved, Production, Monitoring, Change Requested, Impact Assessment, Reassessment, Reapproved, Retirement) with six trigger rules that convert a detected change condition into governance work automatically.

### Operations & Monitoring
- Continuous governance health scoring across five pillars (ownership, risk, validation, compliance, operational), rolling up to Healthy / Watchlist / Attention Required.
- Emergency Kill Switch console, Human Override tracker, Governance Incident management, Corrective Actions, and a Scheduled Review calendar.
- Executive alerting derived live from governance state (Critical Risk, Missing Ownership, Policy Violation, Expired Review).

### Audit & Oversight
- An append-only audit log capturing who did what, when, and why, across every governance action.
- Four reconstruction views: Governance Timeline, Change History, Board & Regulator Reporting, and Decision Traceability.

### Administration
- User management (create, edit role, activate/deactivate).
- An RBAC Administration screen rendering the live role-to-module authorisation matrix, generated from the same navigation configuration the product itself uses.

---

## 2. Representative User Stories & Acceptance Criteria

**US-01 — Register an AI asset.** *As a Business Owner, I want to register a new AI system with its type, department and intended purpose, so that it enters the governed inventory before anyone starts using it.*
- **AC-01a**: The asset cannot progress past Draft status until it is typed and named.
- **AC-01b**: The asset appears immediately in the AI Governance Registry and in the derived eight-stage journey view.

**US-02 — Assign accountable ownership.** *As a Governance Admin, I want to name a Business, Technical, Risk and Compliance Owner and an Approver for an asset, so that there is always someone accountable.*
- **AC-02a**: Ownership completeness is scored and weighted 25% of the readiness score — the single heaviest pillar.
- **AC-02b**: A missing mandatory role raises a "Missing Owner" governance condition automatically.

**US-03 — Move an asset to production.** *As a Decision Authority, I want to see a deterministic readiness score and any blockers before recording GO / CONDITIONAL GO / NO GO, so that the decision is informed, not arbitrary.*
- **AC-03a**: Any failing pillar becomes an explicit governance blocker that must be cleared or accepted before a GO.
- **AC-03b**: The decision is written to the audit log with the decision owner and justification.

**US-04 — Configure governance logic for a new customer.** *As a Governance Admin, I want to enable or disable a condition type, an outcome tier, or edit an action's recommendation text, so that OMG's reasoning matches our own governance model without a code change.*
- **AC-04a**: A disabled condition type is never raised, for any asset, from the next read onward.
- **AC-04b**: A disabled outcome tier is skipped by the reasoning engine, which falls through to the next enabled tier in the fixed escalation order.

**US-05 — Reconstruct a governance decision.** *As an Auditor, I want to replay the full reasoning chain behind any recorded decision — from the regulatory obligation through to who accepted the recommended action — so that I can produce audit-ready evidence on demand.*
- **AC-05a**: The Timeline view renders the chain in causal order (Condition → Policy → Violation → Finding → Outcome → Action → Decision), not wall-clock order.
- **AC-05b**: A Decision Evidence Pack can be generated as a printable, structured document for any traced asset.

---

## 3. Business Rules

- **BR-1**: High and Critical risk assets require an approved independent validation before production (policy rule `REQUIRE_VALIDATION_FOR_HIGH_RISK`).
- **BR-2**: An asset is evidence-complete at three or more approved deliverables; below that threshold a production asset raises policy rule `REQUIRE_EVIDENCE_FOR_PRODUCTION`.
- **BR-3**: Reassessment magnitude is resolved from the impact score: Critical ≥ 70 (Executive Approval Required), Major ≥ 45 (Full Governance Review), Moderate ≥ 20 (Risk Review Required), Minor ≥ 0 (No Reassessment).
- **BR-4**: Governance readiness score weights are fixed at Ownership 25%, Risk 20%, Validation 20%, Decision 20%, Evidence 15% — always summing to 100.
- **BR-5**: Governance Intelligence Studio condition and outcome detection *mechanisms* and the outcome escalation *order* are platform primitives and cannot be reordered through configuration — only which of them are switched on.
- **BR-6**: Exactly one Customer Governance Profile is active per tenant at any time; activating one deactivates all others.
- **BR-7**: Audit log entries are append-only by construction — no update or delete path exists for an audit record anywhere in the application code.

---

## 4. Assumptions

- A production deployment will replace the seeded demo personas with the customer's own named individuals in each of the seven roles.
- The customer accepts that role authorisation is currently enforced server-side by role claim (see [06_Security_Review_Document.md](06_Security_Review_Document.md)) and that closing the authentication gap is a prerequisite for multi-user production use with untrusted clients.
- Regulatory content for named frameworks (ISO 42001, EU AI Act, NIST AI RMF, an expanded RBI mapping) will be configured through the Regulatory Knowledge Engine and the Governance Intelligence Studio as part of a customer engagement, not delivered pre-loaded in this baseline.

## 5. Constraints

- Single-tenant per deployment today — multi-tenancy is not implemented (see [09_Production_Readiness_Assessment.md](09_Production_Readiness_Assessment.md)).
- No automated test suite or CI pipeline exists yet; verification to date has been manual, browser-based, and re-run against every release (see [07_Test_Strategy_And_Evidence.md](07_Test_Strategy_And_Evidence.md)).
- Roughly 18 of the platform's 44 data models — spanning risk assessment, validation, decision, the earlier policy/change domains, and the operations console — do not yet have a corresponding write API and remain client-side only pending Release 11+ work.
