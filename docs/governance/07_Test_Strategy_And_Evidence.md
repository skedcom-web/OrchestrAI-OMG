# ODF Deliverable 07: Test Strategy & Evidence
> **OrchestrAI Model Governance (OMG) Enterprise Platform**
> **Framework Standard**: ODF Universal Governance Standard v1.0
> **Version**: 2.0 — Core Platform v1.0 Complete (Releases 1–10 + Final Strategic Positioning)

---

## 1. Current State — Stated Plainly

**No automated test suite exists today.** There is no test runner configured, no `.test.` or `.spec.` files in the frontend or backend application code, and no CI pipeline. This is recorded here in full rather than implied away, consistent with the ODF principle that a governance deliverable must be honest about gaps.

What has substituted for automated testing to date is a **manual, browser-based verification workflow, repeated for every release**:

1. **Compile-gate verification.** Every release is required to pass `tsc --noEmit` (strict TypeScript) on both `frontend/` and `backend/` before deployment, and `npm run build` must complete cleanly.
2. **Schema-sync verification.** `prisma db push` is run against live Neon after every schema change, and the CLI's own diff output (an empty migration) is treated as the pass condition.
3. **Live browser verification.** For every release touching the UI, a local backend is pointed at production Neon, the relevant page is exercised end-to-end in a real browser session (create/edit/toggle the new capability), and the resulting Neon state is inspected directly (via API calls) to confirm the mutation actually persisted — not just that the UI appeared to accept it.
4. **Cross-session/cross-device equivalence.** Because the frontend caches data in localStorage per browser origin, verification of "does this change apply everywhere" is performed by querying the live API directly (architecturally equivalent to a second browser or device), rather than only trusting a single browser tab's rendered state.
5. **State restoration.** Test mutations made during verification (toggling a condition, creating a scratch record) are reverted afterward so Neon is left in its seeded baseline state.

This process has been the actual quality gate for every one of the ten releases and the final positioning update documented in `docs/governance/`. It is real evidence of correctness for the specific changes it exercised, but it is **not** a substitute for a maintained, repeatable automated suite: it does not run unattended, does not prevent regression in code paths not touched by the current release, and depends on a human remembering to run it.

---

## 2. Unit Testing — Strategy (Not Yet Implemented)

**Priority target when implemented**: the reasoning and rules engines first, because they encode the governance logic itself and are pure, data-in/data-out functions — the cheapest and highest-value code to unit test in this codebase:

- `governanceReasoningEngine.ts` — `detectGovernanceConditions()`, `evaluatePolicyViolations()`, `computeGovernanceOutcome()`
- `governanceActionsEngine.ts` — `generateActionDrafts()`
- `decisionTraceabilityEngine.ts` — `buildDecisionTrace()`
- `readinessFoundation.ts` — the five-pillar scoring math
- `compliancePackFramework.ts` / `regulatoryKnowledgeEngine.ts` — coverage computation

## 3. Integration Testing — Strategy (Not Yet Implemented)

Target: the Repository Pattern's cache-then-network behaviour (optimistic cache update → API persist → reconciliation) and the NestJS controller's role-guard enforcement across all 85 endpoints — verifying that every data-bearing route actually declares and enforces its `@Roles(...)` list, not just the routes exercised manually to date.

## 4. System Testing — Strategy (Not Yet Implemented)

Target: end-to-end flows spanning the full governance chain — asset registration through ownership, risk, validation, evidence, decision, and into the Governance Intelligence Engine's condition-detection and outcome-computation — run against a disposable database rather than production Neon.

## 5. UAT Strategy

To date, UAT has taken the form of the live browser verification described in §1, performed by the same party building the release. A production engagement should separate this: UAT performed by the customer's own governance team against a staging environment, following the acceptance criteria in [02_Functional_Requirements_Specification.md](02_Functional_Requirements_Specification.md).

## 6. Regression Strategy — Strategy (Not Yet Implemented)

Without an automated suite, regression risk is currently managed only by the discipline of re-verifying the specific area touched by each release, plus the "computed, not stored" architectural choice (governance state is derived live rather than duplicated, reducing the number of places a regression can hide). A CI pipeline running the unit and integration suites above on every commit is the recommended next step — see [09_Production_Readiness_Assessment.md](09_Production_Readiness_Assessment.md).

---

## 7. Test Maturity Summary

| Dimension | Status |
|---|---|
| Compile-gate (`tsc --noEmit`, `npm run build`) | Enforced manually before every release |
| Schema-sync check (`prisma db push`) | Enforced manually before every release |
| Manual browser + live-Neon verification | Performed for every UI-facing release, not automated |
| Unit tests | None |
| Integration tests | None |
| System/E2E tests | None |
| CI pipeline | None |
| **Test and CI maturity rating** | **0%** — see [09_Production_Readiness_Assessment.md](09_Production_Readiness_Assessment.md) |
