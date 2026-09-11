# GOVERN THE GOVERNANCE — Runtime Governability Gap Analysis

**Scope:** `frontend/src` (React/TypeScript). All findings are grounded in files actually read this session. Every claim is traceable to a file, and every "not found" is an explicit negative search result, not an inference.

**Business context:** *"Evidence may persist. Authority may still exist. But when context changes, the admissibility of continued execution should not necessarily persist by inheritance."* Core question: **Can OMG determine whether continued execution remains governable and admissible when conditions change?**

---

## PHASE 1 — Existing Capability Inventory (21 Areas)

| # | Area | Capability Name | Location (file:line) | Behavior |
|---|---|---|---|---|
| 1 | Governance Continuity | `GOVERNANCE_STATES` state model + `computeReauthorizationStatus()` | governanceContinuity.ts:47-87 | 8-state lifecycle (Draft→...→Retired). Reauthorization currency is pure date-math off `nextReviewDate`: `<-90d`→Expired, `<0`→Overdue, `≤30d`→Due Soon, else Active. Header comment: "Descriptive only — no scoring, no workflow automation." Computed on every read, never persisted. |
| 2 | Governance Reassessment | `ReassessmentTrigger` + auto governanceState flip | types/index.ts:337-352, `saveReassessmentTrigger()` storageService.ts:1908-1963 | 13 trigger types (Model Change, Control Failure, Risk Threshold Breach, etc.). Creating a trigger for an Authorized/Monitoring asset auto-flips `governanceState` → `'Reassessment Required'` (storageService.ts:1942-1945) — the one real automatic state transition found anywhere in the codebase, but it's a side-effect of the trigger being created, not an independent monitor. No page/form that creates a `ReassessmentTrigger` could be located — only 2 records exist, both seeded. |
| 3 | Governance Reviews | `nextReviewDate` / review scheduling, `computeReviewReadiness()` | readinessFoundation.ts:110-127 | 3-boolean check: reviews scheduled, reviews completed, reassessments up to date → Ready/Partially Ready/Not Ready. Display-only. |
| 4 | Governance Monitoring | `AIAsset.governanceState = 'Monitoring'` + Governance Journey Timeline | governanceContinuity.ts:51, `getGovernanceTimeline()` storageService.ts:~1422-1661 | "Monitoring" is a static state label, not an active monitoring process. Real-time signal aggregation exists only as the Journey Timeline (evidence/findings/CAPAs/certs/incidents merged chronologically) — a read aggregator, not a watcher. |
| 5 | Governance Findings | `getFindings()` | storageService.ts:770 | CRUD list of `Finding` records tied to assets; feeds `computeGovernanceOutcome()`'s `criticalOpenFindings` check. |
| 6 | Governance Incidents | `getIncidents()` | storageService.ts:1327 | CRUD list of `GovernanceIncident`; feeds `calculateAssetGovernanceHealthScore()`'s Operational pillar (storageService.ts:1778-1834). |
| 7 | Corrective Actions | `getCorrectiveActions()`, `getCorrectiveActionsForEntity()` | storageService.ts:4575, 4580 | Polymorphic `entityType`+`entityId` CAPA records; feeds `computeCertificationReadiness()`'s `openCorrectiveActionsCount` input. |
| 8 | Certification Governance | `getCertificationRecords()`, `computeCertificationReadiness()` | storageService.ts:2956; readinessFoundation.ts:201-223 | Uses `entityType: 'Asset'\|'Model'\|'Tool'` + `entityId` (no `assetId`). 6-boolean readiness check → statusFromCount. |
| 9 | Approval Governance | `asset.decisionOutcome` + Approval Gate | governanceGatesEngine.ts:99-106 | `decisionRecorded = !!decisionOutcome && decisionOutcome !== 'PENDING'` → PASS/FAIL. Binary presence check, not re-validation of the decision's continued validity. |
| 10 | Delegation Governance | `delegationScope` (free text) | types/index.ts:1091; AgentAccountabilityPage.tsx:77-84 | Plain string field, edited via a text box, no parsing/validation/expiry anywhere (confirmed via full-codebase grep). |
| 11 | Authority Management | `GovernanceAuthorityProfile` + `authorityProfileCompleteness()` | governanceAuthority.ts:103-107 | Counts non-empty mandatory fields (0-4). File's own header: "descriptive reference data — there is no scoring and no workflow automation." `killSwitchAuthority`/`humanOverrideAuthority`/`reassessmentAuthority` fields exist but are never read anywhere except type declarations. |
| 12 | Escalation Management | `'Escalation Recommended'` outcome + `'Escalation'` action type + `'Executive Escalation'` trigger | governanceReasoningEngine.ts:119-138; governanceActionsEngine.ts:43; changeManagementService.ts:447-497 | Three unrelated uses of the word; none is a standing timer/auto-severity-bump/auto-reassignment. All are computed-on-read labels or human-clicked drafts. |
| 13 | Governance Readiness | `computeGovernanceReadiness()` | readinessFoundation.ts:74-90 | 4-boolean check (ownership, oversight type, autonomy level, `governanceState ∈ VALID_GOVERNANCE_STATES`) → statusFromCount. The 4th check is a set-membership test against a stored field, not a re-derivation. |
| 14 | Evidence Management | `EvidenceRecord`, `getEvidenceRecordsForAsset()` | storageService.ts (evidence module) | Polymorphic `assetId`/`entityType`+`entityId`. Basis for `computeEvidenceReadiness()`. |
| 15 | Evidence Traceability | `computeEvidenceReadiness()` | readinessFoundation.ts:92-108 | `evidenceExists = assetEvidence.length > 0` — presence only, no minimum count, no type/relevance matching, no sufficiency scoring. `evidenceNotExpired` is the only qualitative check. |
| 16 | Risk Management | `asset.riskLevel`, `asset.dataSensitivity`, Risk Gate | governanceGatesEngine.ts:72-81 | `riskSignals = [!!riskLevel, !!dataSensitivity].filter(Boolean).length` — presence-of-classification check, not a live risk re-score. |
| 17 | Risk Reassessment | `'Risk Threshold Breach'` reassessment trigger type | governanceContinuity.ts:116 | A trigger type exists in the enum; NOT FOUND — no function computes or detects an actual risk-threshold breach automatically; trigger creation is manual/unreachable-from-UI. |
| 18 | Kill Switches | `KillSwitchRecord`, `requestKillSwitch()`, `releaseKillSwitch()` | types/index.ts:1608-1619; storageService.ts:1223-1288; KillSwitchCenterPage.tsx:22-44 | 100% human-form-driven (RBAC-gated via `canPerform`). Activation synchronously sets `asset.operationalStatus='Suspended'` as part of the same human-invoked function — not an independently polled mechanism. No health-score or monitoring signal ever calls it automatically (only call site in the entire codebase). |
| 19 | Suspension Controls | `operationalStatus` field, `updateAssetOperationalStatus()` | storageService.ts:439, 596-612, 1245, 1273, 1403 | Every write-site traces to a human action (registration form, dropdown editor, kill-switch engage/release, retirement). NOT FOUND: any write keyed to a computed score/threshold. |
| 20 | Governance Intelligence | `GovernanceIntelligenceWorkspacePage`, `computeGovernanceOutcome()`, `CONDITION_ACTION_TEMPLATES` | governanceReasoningEngine.ts (full file); governanceActionsEngine.ts:1-80 | 5-tier outcome ladder (Escalation Recommended > Reassessment Recommended > Review Required > Attention Required > Compliant) with explainable `reasons[]`, mapped to `RecommendedActionDraft` templates. Page header: "Detection and recommendation only — no automatic state changes." Drafts persist only after human Accept. |
| 21 | Governance Status Calculation | `calculateAssetGovernanceHealthScore()`, `computeGovernanceGates()`, `detectDrift()` | storageService.ts:1778-1834; governanceGatesEngine.ts:55-128; governanceDriftEngine.ts (full file) | Health score: genuine 0-100 weighted 5-pillar score (Ownership/Risk/Validation/Compliance/Operational, 20% each) → Healthy/Watchlist/Attention Required bands. Gates: 5-gate PASS/PENDING/FAIL → Ready/Partially Ready/Not Ready deployment readiness. Drift: 6-category detection + a "Compound Drift Rule" (`applyCompoundEscalation()`: 2+ simultaneous issues escalate everything to Critical). All three are display-only — confirmed via exhaustive grep of every `disabled={...}` in `frontend/src/pages/**` (~130 sites): every one gates on RBAC or local form state, never on any of these computations. Route guarding (`ProtectedRoute.tsx:15-42`) checks only auth + RBAC path permission. |

**Cross-cutting existing asset:** Governance Journey Explorer (`getGovernanceTimeline`, `getDecisionReconstruction`, `getGovernanceStory`, `getGovernanceValueSummary`) already aggregates 16 stages across evidence/findings/CAPAs/certification/incidents chronologically per asset — the closest existing capability to a "governability history," though it is retrospective narrative, not a forward-looking admissibility check.

---

## PHASE 2 — Szilvia Challenge Coverage Matrix

| # | Can OMG determine... | Rating | Evidence |
|---|---|---|---|
| 1 | Material context change occurred? | **PARTIALLY** | `ReassessmentTriggerType` enum names 13 valid change categories — the taxonomy exists. But detection is not automatic: no page or background process creates a `ReassessmentTrigger`; a human must know a change occurred and manually file it. Gap: taxonomy exists, detection does not. |
| 2 | Evidence sufficiency (not just presence)? | **NOT IMPLEMENTED** | `evidenceExists` is literally `assetEvidence.length > 0` (readinessFoundation.ts:92-108) — one record of any type/age/relevance satisfies it. No minimum count, no evidence-type-to-requirement matching, no sufficiency scoring exists anywhere. |
| 3 | Authority validity (re-derived, not just stored)? | **NOT IMPLEMENTED** | `computeGovernanceReadiness()` checks `governanceState ∈ VALID_GOVERNANCE_STATES` — a set-membership test against a stored field. `authorityProfileCompleteness()` counts non-empty name fields — presence of a name, not validity of that person's current authority. |
| 4 | Approval admissibility under changed conditions? | **NOT IMPLEMENTED** | Approval Gate is `decisionRecorded = !!decisionOutcome && decisionOutcome !== 'PENDING'` — binary "was a decision ever recorded," with zero linkage back to whether the conditions that produced that decision still hold. |
| 5 | Certification validity under changed conditions? | **PARTIALLY** | `computeCertificationReadiness()` is a 6-boolean point-in-time check that does include review-currency, so a stale review degrades status. But it does not diff original certification conditions (model version, data source, risk tier at cert time) against current state. |
| 6 | Continued execution governability (should this asset keep running)? | **NOT IMPLEMENTED** | Multiple advisory signals exist (health score, gates, drift, outcome ladder) but none produces a single "is continued execution still governable" verdict, and none affects `operationalStatus`. A "Not Ready"/FAIL/Critical-drift asset can remain `operationalStatus: 'Active'` indefinitely. |
| 7 | Suspension necessity? | **NOT IMPLEMENTED** | Suspension is set in exactly one code path (`requestKillSwitch`), reachable only via a human form submit. No computed signal ever recommends or triggers suspension. |
| 8 | Escalation necessity? | **PARTIALLY** | `computeGovernanceOutcome()` computes `'Escalation Recommended'` from real signals (critical policy violations OR critical open findings) — a genuine, evidenced recommendation. But it stops there: no timer-based escalation, no age-based severity bump, no auto-reassignment. |
| 9 | Reauthorization necessity? | **FULLY** (for the narrow date-based case) | `computeReauthorizationStatus()` is a real, working, evidenced computation: Expired/Overdue/Due Soon/Active from `nextReviewDate` math, computed not stored. The most complete answer to any Szilvia statement. Limitation: date-only; doesn't fold in other context-change types. |
| 10 | Legitimacy re-establishment necessity? | **NOT IMPLEMENTED** | No concept of "legitimacy" or "re-establishment" as a distinct computed state exists. The closest adjacent concept (`governanceState = 'Reassessment Required'`) is set automatically only as a side-effect of a `ReassessmentTrigger` being created — and triggers aren't reachable from any UI, so this path is dormant in practice. |

**Score: 1 Fully / 4 Partially / 5 Not Implemented** out of 10.

---

## PHASE 3 — Common Baseline vs. Customer Customization

| Category | Capability | Justification |
|---|---|---|
| **A — OMG Common Product** | Governability Scoring, Authority Health, Evidence Sufficiency, Admissibility Status | Generic governance-math concepts applicable to every OMG customer — same category as the existing health score/gates/drift engines they'd extend. Building as customer-specific work would fragment the core product. |
| **A — OMG Common Product** | Extended `ReassessmentTriggerType` taxonomy, reauthorization date logic, a generalized "context diff" (decision-time vs now) | Pure computation over existing OMG entities — no external dependency, fits the existing "computed, not stored" convention exactly. |
| **A — OMG Common Product** | Kill Switch execution UI, Suspension state machine | Already core product; any new "should this be suspended" signal belongs in A, feeding the existing human-gated mechanism — not a new mechanism. |
| **B — Should Be Configurable** | Evidence sufficiency thresholds (min count/type per classification), reauthorization windows (30/90-day), what counts as "material change," escalation severity mappings | Policy parameters, not new capabilities — OMG already has this exact pattern (`REVIEW_FREQUENCY_DAYS`, `VALID_GOVERNANCE_STATES`). A regulated customer needs stricter thresholds than an internal-tooling customer. |
| **B — Should Be Configurable** | Which `GovernanceAuthorityProfile` fields are "mandatory" per customer org structure | Some customers may not have a distinct `complianceOwner`; should be a configurable set, not a hardcoded array. |
| **C — Customer Customization (out of OMG core)** | CloudWatch/Datadog/ServiceNow/Jira runtime event connectors | Confirmed zero existing code (exhaustive grep, zero matches). Building bespoke ITSM/monitoring integrations per customer is services work, not product. Recommend a generic, documented event-ingestion contract (Category A) that customers wire their own tools into (Category C), not N point integrations. |
| **C — Customer Customization** | Automatic agent shutdown / automatic runtime enforcement without a human click | Conflicts with the "human-accountable, no auto-block" architecture confirmed consistently across readinessFoundation.ts, governanceGatesEngine.ts, governanceReasoningEngine.ts, governanceDriftEngine.ts, governanceAuthority.ts, governanceContinuity.ts — all explicitly disclaim automation. This is a philosophy commitment, not a gap. |

---

## PHASE 4 — Configuration-First Analysis

| Variability | Configuration Mechanism | Precedent Already in Codebase |
|---|---|---|
| Evidence sufficiency rules (min count, required types by classification/risk tier) | A threshold/policy config object keyed by `GovernanceClassification` or `riskLevel`, read by `computeEvidenceReadiness()` | `REVIEW_FREQUENCY_DAYS: Record<string, number>` (governanceContinuity.ts:96-98) is the exact existing pattern. |
| Reauthorization windows (Due Soon / Overdue / Expired thresholds) | Table-driven instead of the current inline literals `-90`/`0`/`30` in `computeReauthorizationStatus()` | Same lookup-table pattern as above. |
| Which fields count toward Authority completeness | A configurable `mandatoryAuthorityFields` list per customer/tenant | `authorityProfileCompleteness()`'s `mandatory` array (governanceAuthority.ts:105) is currently hardcoded — same refactor shape. |
| Escalation trigger conditions ("critical" definitions) | Extend the existing `isEnabled('Escalation Recommended')` feature-flag-style gate to a full rules/policy object | `getDisabledOutcomes()` / `isEnabled()` is direct existing precedent. |
| "Material change" definitions | Make `ReassessmentTriggerType` an editable "Governance Playbook" list per customer rather than a fixed TS union | `GOVERNANCE_PLAYBOOKS` already exists in `governanceActionsEngine.ts` — extend rather than invent. |
| Runtime event ingestion (connectors) | A generic inbound event schema/webhook contract (Category A) mapping external signals → existing `ReassessmentTrigger`/`Finding` creation; customer supplies the connector (Category C) | No existing precedent — genuinely net-new, but fits the "data-in, data-out" convention already used elsewhere. |

---

## PHASE 5 — Gap Analysis

**Existing Capability Score:** Strong. All 21 named areas have real, working, evidenced code — none is a total void except Runtime Connectors (genuinely absent) and reachable Reassessment-Trigger creation UI (dormant, not absent). The advisory computation layer (readiness, gates, drift, health score, outcome ladder) is mature and consistent.

**Missing Capability Score:** Concentrated almost entirely in turning presence/existence checks into sufficiency/validity/admissibility checks, and connecting computed signals to the operational-status/suspension mechanism as a recommendation (never as automation).

| Gap | Classification | Reasoning |
|---|---|---|
| Evidence sufficiency (vs. presence) | **Critical** | Directly named in the practitioner's original challenge; single-line fix location but currently structurally incapable of ever failing once any evidence exists — a false-positive risk in an audit context. |
| Authority re-derivation (vs. stored-state check) | **Critical** | Both authority checks confirm something was once true, never that it's still true under current context — the exact gap the practitioner's quote names. |
| Approval/certification admissibility under changed conditions | **Critical** | No diffing mechanism exists between decision-time state and current state anywhere in the codebase. |
| Reachable UI for `ReassessmentTrigger` creation | **Important** | Not a missing capability so much as a missing entry point — type, storage function, and downstream auto-state-flip all work; only the human-facing "report a material change" form is absent. Smaller build than it looks. |
| Runtime/event connectors | **Nice-to-Have** (belongs outside core per Phase 3) | Zero existing code; recommend NOT building customer-specific connectors as Critical/Important OMG-core work. |
| Escalation timers/auto-severity-bump/auto-reassignment | **Nice-to-Have** | Recommendation-generation half already works well; SLA timers are a workflow-productivity enhancement, not a governability-correctness gap. |
| A unified "Governability/Admissibility Status" per asset | **Important** | Not missing due to lack of underlying data — every input it needs already exists and is already computed. A composition gap, not a data gap — the cheapest Critical-adjacent win available. |

**False-gap check:** "Governance Monitoring" looked absent as a distinct engine — it is real, expressed as the `governanceState: 'Monitoring'` label plus the Journey Timeline aggregator, not a dedicated monitoring service. "Risk Reassessment" looked like a dedicated workflow — it is actually just one value (`'Risk Threshold Breach'`) inside the existing Reassessment Trigger taxonomy. Neither should be built again.

---

## PHASE 6 — Blueprint Input Reports

**A) Current Capability Matrix** — Phase 1 table.
**B) Szilvia Challenge Coverage Matrix** — Phase 2 table (1 Fully / 4 Partially / 5 Not Implemented).
**C) Baseline vs. Customization Matrix** — Phase 3 table.
**D) Configuration-First Architecture Recommendations** — Phase 4 table.

**E) Minimal Enhancement Set for ~95% Coverage** (ordered by leverage, reuse-first):
1. **Evidence Sufficiency** — extend `computeEvidenceReadiness()` with a configurable minimum-count/type-match rule. Closes Szilvia #2 fully.
2. **Authority Re-Validation** — add `authorityStillValid()`, re-deriving from current org/role data rather than trusting stored names. Partially closes #3.
3. **Admissibility Diff** — a new pure function `computeAdmissibilityStatus(asset, decisionSnapshot, currentState)` comparing conditions at decision/certification time vs. now, reusing `EvidenceRecord`/`CertificationRecord`/`asset.riskLevel` already in memory. Closes #4, #5, #6, #10 as a single composition, no new stored data, consistent with the "computed, not stored" convention already used everywhere else.
4. **Unified Governability Status** — compose health score + gates + drift + the new admissibility function into one advisory status surfaced on the asset detail page and Journey Explorer — same aggregation pattern already used for `getGovernanceStory()`.
5. **Reassessment Trigger entry-point UI** — a small human-facing "Report a Material Change" form wired to the already-working `saveReassessmentTrigger()`. Closes the practical half of #1.
6. **Escalation Recommendation surfacing** — no new logic, just visibility of existing `'Escalation Recommended'` outcomes wherever the new Governability Status is shown.

None of these require a new stored table, a new domain, or a new workflow — all are pure functions over existing entities.

**F) Capabilities That Should NOT Be Added to OMG Core:**
- Automatic runtime enforcement / auto-suspend / auto-kill-switch triggered by any computed score — would break the "human-accountable, no auto-block" architecture confirmed as deliberate and consistent across 6+ engine files.
- Customer-specific monitoring/ITSM connectors (CloudWatch, Datadog, ServiceNow, Jira) built as bespoke OMG-core integrations — offer a generic event-ingestion contract instead.
- A separate "Escalation Management" module with its own timers/SLA engine — the existing recommendation-draft pattern already handles the accountable-decision part; SLA/timer logic risks scope creep into a ticketing system.
- Any new persisted "Governability Score" history/trending table — every analogous engine explicitly defers historical trending to a future roadmap phase by design; stay consistent rather than introducing the first persisted computed-metric table in the codebase.

---

## Verdict

*"Can OMG determine whether continued execution remains governable and admissible when conditions change?"* — **Not yet, but narrowly.** OMG already has essentially all the raw signal (evidence, authority, certification, health, drift, reauthorization-by-date) computed live, following the right architectural conventions (pure functions, computed not stored, advisory not blocking). What's missing is not new governance domains or new data — it's one composition layer that diffs "conditions now" against "conditions when authority was granted," and turns presence-checks into sufficiency-checks. This is a strict extension of what exists, not an invention, and fits entirely inside Category A of the baseline classification above.

This is analysis only, per the directive. No code has been changed.
