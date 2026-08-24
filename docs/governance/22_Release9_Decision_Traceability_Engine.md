# OMG Release 9 — Governance Decision Traceability Engine

This document records what Release 9 added to OrchestrAI Model Governance (OMG), why, and where to find it. It supplements the Phase 1-10 documents and the Release 1-8 addenda in this directory.

---

## 1. What Release 9 Is

> Make every governance decision reconstructable.

Release 9 is the capstone over Releases 5-8: it makes the full chain — **Source → Requirement → Obligation → Policy → Control → Evidence → Condition → Violation → Finding → Outcome → Recommended Action → Human Decision** — reconstructable end-to-end for any asset, with a Decision Trace Engine, a Decision Evidence Pack, Governance Replay (the Timeline view), an Explainability Workspace, Audit Package Generation, and an Executive Traceability View. Nothing here is a new governance capability in the R1-R8 sense — it is the proof layer over capabilities that already exist.

## 2. A Deliberate Architectural Choice: No New Persisted Domain Object

A `DecisionTrace` is **not** a database table. It is assembled live, on every read, from data every prior release already produces:

| Trace content | Source |
|---|---|
| Inputs Evaluated | Live counts of Evidence, Reviews, Validations, Reauthorizations for the asset |
| Conditions Triggered | Release 7's `detectGovernanceConditions()` — computed |
| Policies Evaluated | Release 7's persisted `GovernancePolicy` rows (active ones) |
| Violations Detected | Release 7's `evaluatePolicyViolations()` — computed |
| Findings Generated | Release 7's persisted `GovernanceFinding` rows |
| Outcomes Produced | Release 7's `computeGovernanceOutcome()` — computed |
| Actions Recommended | Release 8's persisted `RecommendedAction` rows |
| Human Decisions Taken | Release 8's `RecommendedAction` rows where a human decided |

This is the same "computed, not stored" discipline Release 7 established for Conditions/Violations/Outcomes, extended one layer further: since every input to a Decision Trace is already either computed live or already persisted, storing the trace itself would just be a stale, driftable copy of data that already exists in one place. `frontend/src/config/decisionTraceabilityEngine.ts` is pure and data-in/data-out, like every prior release's engine.

## 3. The One Genuine Schema Change: "Who Acted"

The one piece of information nothing before Release 9 captured was **who** made a human decision (Accept / Reject / Defer) on a Recommended Action — Release 8 tracked the *status*, not the *actor*. Release 9 adds two nullable columns to `RecommendedAction`: `decidedBy` and `decidedAt`, set only on the three human-decision status transitions (not on Open→Accepted's sibling Start/Complete execution steps, which are process tracking, not judgment calls). This directly satisfies the blueprint's own success criterion: "understand exactly why it occurred, **who acted**, and what evidence supported it."

## 4. Core Features Delivered

| Feature | Where |
|---|---|
| 1. Decision Trace Engine | `buildDecisionTrace()` in `decisionTraceabilityEngine.ts` |
| 2. Decision Evidence Pack | `DecisionEvidencePackModal.tsx` — printable, structured reconstruction, mirrors the existing `CompliancePackageModal` pattern |
| 3. Governance Replay | The Timeline view — the reasoning chain rendered in causal order (Input → Condition → Policy → Violation → Finding → Outcome → Action → Human Decision), not wall-clock order, since Conditions/Violations/Outcomes are live-computed and have no fixed historical timestamp |
| 4. Explainability Workspace | Trace Summary + Outcomes views, reusing Release 7's `outcome.reasons` |
| 5. Audit Package Generation | The same Decision Evidence Pack modal's Print / Export action |
| 6. Executive Traceability View | Executive Hub's new "Governance Traceability Overview" panel |

## 5. New Module: Decision Traceability

`/decision-traceability` — asset-scoped, with all 8 required views: Trace Summary, Timeline, Inputs, Policies, Findings, Outcomes, Actions, Human Decisions. A "Generate Decision Evidence Pack" button is available whenever an asset is selected. Placed under **Audit & Oversight** ("Prove what happened") rather than Risk & Compliance, since reconstructing and proving a decision is precisely that domain's question — a better semantic fit than a sixth entry under Risk & Compliance.

## 6. Dashboard & Executive Hub

- **Dashboard**: Decision Trace Records (assets with a recorded finding or action behind their outcome), Top Decision Drivers (condition types ranked by frequency), Human Decision Statistics (Accepted / Rejected / Deferred counts), and Action Completion (reusing Release 8's `actionsByStatus`).
- **Executive Hub — Governance Traceability Overview**: Escalated Decisions, Reassessments, Human Overrides (Rejected actions — a human explicitly declined the system's recommendation), Traceability Coverage (% of assets with detected conditions where at least one Finding or Action was raised to address them, i.e. no unaddressed reasoning gap), and Recent Decisions (the five most recent human decisions, newest first).

## 7. The Mandatory Retroactive Fix: Landing Page, Guided Tour, Executive Overview

The blueprint's "Critical Addition" states every future release must update the Landing Page, Viewer Journey, Guided Tour and Executive Overview — and flags that Releases 6, 7 and 8 had **not** been reflected in any of them. This release closes that gap retroactively as well as adding its own content:

- **`CAPABILITIES`** (Section 7, landing page): grew from 10 to 15 — added Compliance Pack Framework, Regulatory Knowledge Engine, Governance Intelligence, Governance Actions, Decision Traceability.
- **`TOUR_STEPS`** (Guided Tour): grew from 31 to 35 — added one step each for the Regulatory Knowledge Engine, Governance Intelligence, Governance Actions and Decision Traceability, exactly the four the blueprint names.
- **`WORKED_EXAMPLE_STEPS`** (Section 3, "Governance in Action"): grew from 6 to 7 — the illustrative Customer Service Agent walkthrough now ends with its own decision reconstructed end-to-end.
- **`ENTERPRISE_PROBLEMS`** (Section 1): grew from 8 to 9 — added "Cannot reconstruct why a decision was made → Decision Traceability".
- **`OmgOverviewPage.tsx`**: updated hardcoded step/capability counts and the guided-tour narrative paragraph to match.
- The per-asset `JOURNEY_STAGES` (Section 2, "How OMG Works", 9 stages) were deliberately left unchanged — Decision Traceability is a cross-cutting reconstruction capability that operates across the whole portfolio, not a stage a single asset progresses through, so it belongs in Capabilities and the Tour, not the asset lifecycle.

## 8. Validation

Verified end-to-end against live Neon through the actual UI:
1. Opened Decision Traceability for the Enterprise Portfolio Multi-Agent System (no findings/actions on record) — correctly showed "⚠ Reasoning gap — condition detected but never addressed" and a Timeline replaying its 2 detected conditions, 2 policies, 2 violations and computed outcome.
2. Generated a Decision Evidence Pack for that asset and confirmed the printable modal renders the full reasoning chain.
3. Generated a Recommended Action for the AML Regulatory Intelligence RAG asset (Escalation Recommended outcome), then Accepted it in the Governance Actions Workspace.
4. Confirmed `decidedBy: "Sarah Jenkins"` and `decidedAt` persisted to Neon on the action row.
5. Re-opened Decision Traceability for that asset — now showed "✓ Fully traceable" and the Human Decisions view correctly read "Sarah Jenkins decided Accepted on 2026-08-24".
6. Dashboard's Decision Trace Records, Top Decision Drivers and Human Decision Statistics all reflected the live state; the audit trail recorded the decision with the actor's name.
7. Executive Hub's Governance Traceability Overview showed Escalated Decisions: 1, Traceability Coverage: 17% (1 of 6 assets with conditions fully traced), and the Recent Decisions entry.
8. Guided Tour confirmed at "Step 35 of 35 — Decision Traceability"; landing page confirmed all 15 capabilities and the updated narrative counts.

The test action was deleted afterward; Neon ends this release with 0 recommended actions and 0 findings (nothing seeded, matching Release 7/8's own design), alongside the unchanged Release 1-8 data plus the two new `decidedBy`/`decidedAt` columns.

## 9. What's Still Out of Scope

Per the blueprint: autonomous governance decisions, autonomous reviews, autonomous reassessments, autonomous escalations, and RBI/ISO/EU AI Act-specific logic. Release 9 proves and reconstructs decisions — it does not make them.

## 10. Success Criteria

A reviewer can reconstruct any governance decision end-to-end and understand exactly why it occurred, who acted, and what evidence supported it — verified directly against the live demo portfolio, not just the design.

---

*Supersedes nothing. Read alongside [21_Release8_Governance_Intelligence_Actions.md](21_Release8_Governance_Intelligence_Actions.md) and [02_Functional_Requirements_Specification.md](02_Functional_Requirements_Specification.md).*
