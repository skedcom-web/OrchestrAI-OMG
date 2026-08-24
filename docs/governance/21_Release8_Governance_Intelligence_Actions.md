# OMG Release 8 — Governance Intelligence Engine
> **Actions Edition**

This document records what Release 8 added to OrchestrAI Model Governance (OMG), why, and where to find it. It supplements the Phase 1-10 documents and the Release 1-7 addenda in this directory.

---

## 1. What Release 8 Is — and Isn't

> Governance Intelligence → Governance Action Recommendations, with human accountability preserved.

Release 7 established governance reasoning: **Policy → Condition → Violation → Finding → Outcome**, with every outcome explainable. Release 8 extends the chain one link further — **Outcome → Recommended Action** — and adds a human decision layer on top: every recommendation can be **Accepted, Rejected or Deferred**, and nothing executes automatically. This is the bridge between Governance Intelligence and Governance Execution, not Governance Execution itself; autonomous governance actions, automatic GO/NO-GO decisions, automatic reassessments and automatic escalations are all explicitly out of scope, same discipline as every prior release.

## 2. The Architecture: Outcome → Recommended Action → Human Decision → Lifecycle

The final architecture the blueprint carries forward:

```
Source → Requirement → Obligation → Policy → Control → Evidence
       → Condition → Violation → Finding → Outcome → Recommended Action
```

| Objective | Object | Persisted or computed |
|---|---|---|
| 1. Recommended Action Engine | `RecommendedAction` | Persisted (Neon, Api-first from day one) |
| 2. Action Recommendation Library | Condition → tactical action templates | Static config (`governanceActionsEngine.ts`) |
| 3. Action Mapping Engine | Outcome → procedural action templates | Static config, same file |
| 4. Governance Playbooks | Review / Reassessment / Validation checklists | Static config, same file — reference material, not workflow state |
| 5. Governance Actions Workspace | Open / Accepted / Deferred / Completed views, filtered by Asset / Priority / Owner / Status / overdue | New page, `/governance-actions` |
| 6. Human Decision Layer | Accept / Reject / Defer | Manual, recorded to the immutable audit trail — nothing executes automatically |
| 7. Governance Execution Readiness | Open → Accepted → In Progress → Completed | Full lifecycle, every transition audited |

A `RecommendedAction` can trace to either a specific `GovernanceFinding` (tactical — e.g. "Renew Evidence" for an expired-evidence finding) or directly to an asset's `Outcome` tier with no specific finding (procedural — e.g. "Escalate To Governance Authority" for an Escalation Recommended outcome). Both paths flow through the same engine and the same lifecycle.

## 3. Why the Library, Mapping and Playbooks Are Config, Not Tables

The Action Recommendation Library (Objective 2), Action Mapping Engine (Objective 3) and Governance Playbooks (Objective 4) are reusable *logic* — the same six condition-to-action mappings and three outcome-to-action mappings apply to every tenant, every asset, every regulation. They are not tenant data, so they live as static config (`frontend/src/config/governanceActionsEngine.ts`), the same reasoning that keeps Release 7's Condition detection and Outcome computation as pure functions rather than database rows. Only the `RecommendedAction` itself — the record of "this specific action was recommended for this specific asset, and a human is now accountable for it" — is genuinely persisted.

## 4. Demo Data

No actions are seeded, for the same reason Release 7 seeds no findings: a hardcoded action could drift out of sync with what the engine actually detects against the live asset portfolio. Instead, the Governance Intelligence Workspace's Outcomes tab gained a "Generate Recommended Actions" button, and the flow was verified against the real Release 1-7 demo portfolio: the AML Regulatory Intelligence RAG asset (decision `PENDING`, already the demo asset that trips the Critical "Approval Required Before GO" policy since Release 7) produces an "Escalation Recommended" outcome, which generates a real "Escalate To Governance Authority" action — Critical priority, Open status — exactly the blueprint's own worked example.

## 5. Where To Look In The Product

| Surface | What it is |
|---|---|
| Governance Intelligence Workspace (`/governance-intelligence`) | Outcomes tab gained "Generate Recommended Actions", the applicable Governance Playbook (when the outcome is Review Required or Reassessment Recommended), and the list of actions raised for the selected asset. Explanations tab now completes the chain with a `→ Recommended Action` line. |
| Governance Actions Workspace (`/governance-actions`, new) | Flat, portfolio-wide view across every recommended action — Open / Accepted / Deferred / Completed views, filterable by Asset, Priority, Owner, Status and overdue-only. Accept / Reject / Defer / Start / Complete transitions live here. |
| Executive Dashboard (`/dashboard`) | New Governance Actions (open / high-priority / overdue counts), Actions by Status, and Actions by Owner panels. |
| Executive Governance Hub (`/executive-hub`) | New "Governance Actions Overview" panel — Recommended Reviews, Recommended Reassessments, Recommended Reauthorizations, Escalation Recommendations, Action Completion (completed / total). |

## 6. Implementation Notes

- Frontend types: `RecommendedAction`, `RecommendedActionType`, `RecommendedActionPriority`, `RecommendedActionStatus` in `frontend/src/types/index.ts`.
- Action generation logic: `frontend/src/config/governanceActionsEngine.ts` — `generateActionDrafts()` is pure and data-in/data-out, mirroring Release 7's reasoning engine.
- **Persistence:** `RecommendedAction` is Neon-backed from day one using the established cache-then-network pattern — reads synchronous off an in-memory cache, writes async and Neon-first, `bootstrapPersistence()` fetching it alongside every other domain. Backend: full CRUD in `backend/src/app.controller.ts`, with `policyId` and `findingId` as nullable foreign keys (`onDelete: SetNull`) since an outcome-driven action may not trace to one specific finding.
- **Deduplication:** `generateRecommendedActionsForAsset()` only raises genuinely new actions — it skips any draft whose finding (or, for outcome-driven drafts, action type) already has a non-terminal (not Rejected/Completed) action against the same asset, so re-running "Generate" never creates duplicates.
- Repository Pattern: `RecommendedActionRepository` in `frontend/src/repositories/`, Api-first (Local implementation exists as a fallback utility only, matching the Release 6/7 precedent).

## 7. Validation

Verified end-to-end against live Neon through the actual UI:
1. Selected the AML Regulatory Intelligence RAG asset in the Governance Intelligence Workspace — its outcome was "Escalation Recommended" (unchanged from Release 7's own verification).
2. Clicked "Generate Recommended Actions" — one action, "Escalate To Governance Authority" (Critical, Open), was created and persisted to Neon.
3. The Explanations tab showed the completed chain: Condition → Policy → Outcome → **Recommended Action**.
4. In the Governance Actions Workspace, the action appeared under "Open Actions (1)" with the correct filters and explanation trail.
5. Walked the full lifecycle through the UI: **Accept** → moved to "Accepted Actions"; **Start** → "In Progress"; **Mark Completed** → "Completed Actions (1)".
6. Every transition was recorded to the immutable audit trail (`RECOMMENDED_ACTION_CREATED`, then three `RECOMMENDED_ACTION_UPDATED` entries), confirming Objective 7's "maintain complete audit history."
7. Dashboard and Executive Hub panels reflected the same live state, including "Action Completion: 1 / 1".

The test action was deleted afterward; Neon ends this release with 0 recommended actions (nothing seeded, matching the design), alongside the unchanged Release 1-7 data.

## 8. What's Still Out of Scope

Per the blueprint, explicitly not implemented:
- Automatic GO/NO-GO, automatic reviews, automatic reassessments, automatic escalations
- Autonomous governance execution of any kind
- RBI/ISO/EU AI Act-specific logic

Release 8 is recommendation-driven, not automation-driven. The Decision Traceability Engine (Evidence Expired → Policy Evaluated → Violation Created → Finding Created → Outcome Generated → Action Recommended → Human Accepted Action → Audit Record Created) is Release 9's scope.

## 9. Success Criteria

A reviewer can, for any asset: see its detected conditions, understand which policies they violate, review the resulting findings, review the recommended outcome, see the specific recommended action it produced, and Accept, Reject or Defer that action — with the full reasoning chain visible at every step. Recommendations are explainable, traceable, actionable, and every decision remains human-governed.

---

*Supersedes nothing. Read alongside [20_Release7_Governance_Intelligence_Engine.md](20_Release7_Governance_Intelligence_Engine.md) and [02_Functional_Requirements_Specification.md](02_Functional_Requirements_Specification.md).*
