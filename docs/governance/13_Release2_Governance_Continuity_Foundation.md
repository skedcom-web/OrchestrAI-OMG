# OMG Release 2 — Governance Continuity Foundation
> **Governance Continuity Overview & User Guide Addendum**

This document records what Release 2 added to OrchestrAI Model Governance (OMG), why, and where to find it in the product. It supplements — and does not replace — the Phase 1-10 documents and the [Release 1 addendum](file:///C:/Users/VT348/Documents/GitHub/OrchestrAI%20OMG/docs/governance/12_Release1_Governance_Authority_Foundation.md) in this directory.

---

## 1. What Release 2 Is

Release 1 answered *who owns this AI, how is it overseen, and what autonomy level does it have?* Release 2 answers the next question:

> **How do we know an approved AI asset remains approved over time?**

It introduces Governance Continuity: a Governance State Model, a Reassessment Trigger Framework, a Governance Review Schedule, Governance Reauthorization Records, and an enriched Governance Timeline. It also carries forward a Release 1 recommendation — **Governance Classification** — a simple business-context tag with no workflow logic of its own.

Release 2 does **not** introduce Compliance Packs, RBI FREE-AI, ISO 42001, Readiness Scoring, a Governance Health Score, a Trust Dashboard, monitoring automation, email notifications, or workflow automation. Those remain future releases.

---

## 2. Governance Classification (Release 1 recommendation, carried forward)

One of: Internal Productivity, Customer Facing, Decision Support, Operational Automation, Agentic Workflow, Regulated AI. Business context only — reused by Governance Continuity today, and by future Compliance Packs / RBI / ISO layers.

## 3. Governance State Model

Distinct from the existing `status` field (Draft → Review → Validation → Approval → Production → Retirement, which tracks *pipeline stage*), `governanceState` tracks *whether the asset's authorization is still valid*:

`Draft → Submitted → Authorized → Monitoring → Reassessment Required → Conditional GO / No GO → Monitoring → Retired`

No automation moves an asset between states in Release 2 — a reassessment trigger or reauthorization record does, and both are logged, traceable actions.

## 4. Reassessment Trigger Framework

A manually logged register of the events that call an authorization into question: Model Change, Prompt Change, Agent Behavior Change, New Integration, New Tool, Data Source Change, Permission Change, Access Scope Change, Control Failure, Risk Threshold Breach, Performance Drift, Regulatory Change, Policy Change. Each entry carries type, date detected, severity, owner, status and comments.

This is a lighter-weight, always-on log — distinct from the existing Phase 10 **Governance Triggers** (`/governance-triggers`), which is an automated rule engine that converts change conditions into governance work. Release 2 explicitly excludes workflow automation, so the two coexist rather than merge.

## 5. Governance Review Schedule

Reuses the existing Scheduled Review mechanism (`/review-calendar`), extended with two new review types: Semiannual Review and Ad Hoc Review (Quarterly, Annual and Monthly already existed).

## 6. Governance Reauthorization Record

Captures who reviewed, when, the decision (GO / Conditional GO / NO GO), the reason, supporting notes, and the previous and new Governance State — making every reauthorization decision traceable.

## 7. Governance Timeline

The existing Governance Timeline (`/governance-timeline`) now also surfaces continuity events: Authorized, Trigger Raised, Review Initiated, Review Completed, and Reauthorization Decision (GO / Conditional GO / NO GO), alongside the existing registration, risk, validation, decision, override, kill switch and retirement events.

---

## 8. Where To Look In The Product

| Surface | What changed |
|---|---|
| AI Asset Registry (`/assets`) | Registry table gained a Governance State column with next review date; registration form gained a Governance Continuity section (Classification, State, Next Review Date); asset detail gained a Governance Continuity card with reassessment history, upcoming reviews and a link to the full timeline. |
| Governance Timeline (`/governance-timeline`) | Now includes continuity events; deep-links from the asset detail card (`?assetId=`). |
| Executive Dashboard (`/dashboard`) | New "Assets by Governance State" and "Assets by Governance Classification" panel, plus a "Governance Continuity Load" card (Reassessments Due, Reviews Due). |
| Executive Governance Hub (`/executive-hub`) | New "Governance Continuity Overview" panel — Assets Awaiting Review, Assets Requiring Reauthorization, governance state mix (plain counts, no scoring). |
| Landing / Guided Tour (`/`) | Viewer journey message updated; guided tour gained five new steps (Governance State, Review Schedule, Reassessment Trigger, Governance Timeline, Reauthorization History) between Decision Authority/Governance Monitoring and Change & Reassessment. |

## 9. Implementation Notes

- Frontend types: `GovernanceClassification`, `GovernanceState`, `ReassessmentTrigger`, `GovernanceReauthorizationRecord` in `frontend/src/types/index.ts`.
- Reference data: `frontend/src/config/governanceContinuity.ts`.
- Existing local demo data (and any assets saved before this release) is backfilled transparently by `normalizeAsset()` in `frontend/src/services/storageService.ts`, inferring a starting Governance State from the asset's existing decision outcome and pipeline status.
- Backend: `AIAsset` in `backend/prisma/schema.prisma` gained matching optional fields (`governanceClassification`, `governanceState`, `nextReviewDate`), plus two new models: `ReassessmentTrigger` and `GovernanceReauthorizationRecord`. The Release 2 state enum is named `AssetGovernanceState` (not `GovernanceState`) to avoid colliding with the pre-existing Phase 10 `GovernanceState` enum, which tracks a different concern (the change-management state machine). All additive and nullable — no existing data is affected.

---

*Supersedes nothing. Read alongside [12_Release1_Governance_Authority_Foundation.md](file:///C:/Users/VT348/Documents/GitHub/OrchestrAI%20OMG/docs/governance/12_Release1_Governance_Authority_Foundation.md) and [02_Functional_Requirements_Specification.md](file:///C:/Users/VT348/Documents/GitHub/OrchestrAI%20OMG/docs/governance/02_Functional_Requirements_Specification.md).*
