# OMG Release 20 — Interoperability & Governance Position Exchange
## Independent Architecture Assessment Report (Analysis-Only — No Implementation)

**Method note:** every current-state claim below is grounded directly in the Release 19/19.1/19.2 code and data model actually built and verified in production this session — not aspiration. Where something doesn't exist, it's marked as such rather than assumed.

---

## 1. Executive Summary

OMG's current architecture already embodies the correct philosophical stance for interoperability: every Release 19 engine is explicitly a *signal provider*, never itself authoritative, and the Governance State Resolution Layer (GSRL) exists precisely to prevent any single input from becoming a silent second source of truth. This discipline is the single best asset Release 20 has to build on.

But the actual interoperability surface today is **zero**. `AuthorisedGovernancePosition`, `AuthorityProvenanceRecord`, and `GovernancePositionContract` are pure client-side, human-entered, localStorage-resident records. `GovernancePositionContract` can be exported as a one-way JSON download; nothing can be imported. No API exists for an external system to push or pull anything. No verification, signature, or provenance-chain mechanism exists beyond a plain-string `authoritySource` field. This is not a regression — it is exactly where a platform that has deliberately never claimed to be an integration layer should be before its first interoperability release.

The core risk for Release 20 is scope creep in one specific direction: pulling *governance formation* (how an external board or methodology arrives at a decision) into OMG Core, when OMG's stated and defended mission is *governance operations* (what happens to that decision once it exists). This report's central recommendation is a narrow, import-first, human-accepted exchange model — not a live API, not a two-way sync, not a formation engine — that lets OMG consume an externally authorised position without ever becoming, or appearing to become, the authority that produced it.

---

## 2. Current State Assessment

Grounded directly in the Release 19/19.1 implementation:

| Capability | Current Reality |
|---|---|
| `AuthorisedGovernancePosition` | A record of *what was authorised* — state, conditions, obligations, assumptions, a validity window, links to reliance elements and authority references. Created only via the OMG UI, by an internal `GOVERNANCE_ADMIN`/`SUPER_ADMIN` persona. No concept of an external origin. |
| `AuthorityProvenanceRecord` | `authoritySource` is a free-text string (e.g. "AI Governance Committee"). No structured representation of *which* external system or process asserted this, no verifiable chain back to it. |
| `GovernancePositionContract` | A one-way, exportable JSON snapshot of an AGP, explicitly documented in code as "for a downstream runtime/execution system to consume." Export exists (`handleExportContract`, JSON download). **Import does not exist.** |
| Versioning | Exactly one mechanism: `status: 'Active' \| 'Superseded' \| 'Expired' \| 'Suspended'`, with auto-supersession (a new AGP for the same asset flips the old one to `Superseded`). No version numbers, no diff, no changelog between versions, no way to represent "this position was reauthorised with modifications" versus "replaced entirely." |
| Verification / integrity | None. No signature, no hash, no cryptographic attestation anywhere in the codebase (confirmed repeatedly across this session's audits). |
| External system exchange | None. The earlier Javier/Aegis analysis this session confirmed zero references to any named external decisioning system, and the only related artifact is one aspirational, explicitly-unbuilt catalog entry (`ext-webhook` in `customerWorkspaceFoundation.ts`). |
| Governance Continuity / Reauthorisation | Real, working, and — critically for Release 20 — already model "something changed, re-earn the decision" as a first-class concept. This is the natural anchor point for *externally triggered* reauthorisation, not a new concept. |

**The gap Release 20 would close** is narrow and specific: OMG can represent an authorised position once a human has typed it in; it cannot receive one that was authorised somewhere else.

---

## 3. Architectural Boundary Analysis

### What must cross the boundary
- **The position itself**: authorised state, conditions, obligations, assumptions, validity window — the *content* of the decision.
- **A reference to authority**: who/what body authorised it, and under what process — as a citation, not a re-creation of that process.
- **A validity/expiry signal**: when this position stops being assumed valid without OMG needing to know *why* the external process decided that.
- **A provenance identifier**: something OMG can use to say "this came from system/process X, asserted on date Y" — for traceability, not for OMG to evaluate the legitimacy of X itself.

### What must never cross the boundary
- **The formation logic**: voting rules, committee quorum, escalation paths, deliberation records. This is Governance Formation, explicitly out of scope per the Release 19 blueprint's own non-goals, and re-affirmed here.
- **Credentials or live authority to act on OMG's behalf**: an imported position should never carry, e.g., an API key that lets the external system later mutate OMG state unilaterally. Import is a one-time (or explicitly re-triggered) ingestion, not a standing trust relationship.
- **Customer-specific process semantics**: "how Customer X's governance board works" is exactly the kind of thing that has repeatedly, correctly, been kept out of OMG Core throughout this session's architecture reviews (see the Kechagias assessment's Common/Configurable/ODF/Customer scoping). It belongs in ODF-delivered, customer-specific mapping logic, not a general OMG feature.

### What should remain external
The governance formation system itself — its UI, its workflow engine, its committee/voting logic, its own audit trail of *how* the decision was reached. OMG has no business modeling any of this, and doing so would directly contradict the "OMG SHALL NOT become the governance formation system" principle Release 19 was built under.

### What should become OMG-managed
Once accepted: the position's lifecycle from that point forward — its interaction with Reliance Basis, Authority Currency, Reauthorisation, and the GSRL. This is squarely Governance Operations, and is where OMG already has real, working machinery.

### Recommended boundary model
**A one-way, human-gated import boundary**, not a bidirectional sync:

```
External Governance Formation System
        │
        │  (a Governance Position Package — data only, Area 6)
        ▼
   OMG Import Surface  ──►  human review & explicit Accept  ──►  AuthorisedGovernancePosition
        │
        ▼
   (rejected / needs more information → returned, not silently discarded)
```

The human-Accept step is not bureaucratic friction — it is the exact mechanism that keeps OMG from becoming a second source of authority. An imported position becomes real in OMG only when an OMG-accountable person (an existing RBAC-gated action, exactly like `governancePosition:create` today) says "yes, I accept this." This mirrors the "OMG human-accountable, no auto-block" discipline already governing every existing engine in this codebase — extended here to importing, not just to acting.

---

## 4. Governance Position Exchange Analysis

| Function | Feasibility Today | Assessment |
|---|---|---|
| **Export** | Already exists (one-way JSON) | Solid starting point. Needs richer metadata (below) before it's a real exchange format rather than a debugging artifact. |
| **Import** | Does not exist | The actual gap. Should be built as data-in, human-review, explicit-accept — not an auto-ingest pipeline. |
| **Verification** | Does not exist | Minimum viable: a checksum/hash over the package content, so OMG can at least detect "this file was altered after export" — not a full PKI signature scheme, which would be disproportionate for a v1. |
| **Validation** | Partially exists in spirit | OMG already validates *internally created* AGPs implicitly (required fields, RBAC). An imported package needs the same structural validation, plus a check that referenced entities (the asset it targets) actually exist in this tenant. |
| **Acceptance** | Does not exist, but the pattern exists | Model it exactly like `saveAuthorisedGovernancePosition`'s existing auto-supersession behavior — accepting an imported position supersedes whatever was Active for that asset, using the mechanism already built, not a new one. |
| **Versioning** | Minimal (status flags only) | See Area 5 — the biggest real gap. |
| **Lifecycle management** | Exists post-acceptance (Reliance, Reauthorisation, GSRL) | Once accepted, an imported position is indistinguishable from a native one and gets full lifecycle treatment for free. This is a genuine strength: build the import boundary once, and everything downstream already works. |

**Required metadata for a genuine exchange record** (conceptual, not a schema to implement): source system identifier, source process/methodology identifier, external position identifier (so re-imports of the same position update rather than duplicate), issuance timestamp, an integrity token, and an explicit "this package format version" tag — the last of which is what makes Area 5's versioning problem tractable at the *package* level, distinct from versioning the *position* itself.

**Required provenance and traceability**: this is where `AuthorityProvenanceRecord`'s existing `authoritySource` free-text field should evolve into something that can also carry a system/process reference — not a new engine, just a richer instance of a field that already exists for exactly this purpose.

---

## 5. Governance Position Contract Assessment

**Strengths:** the concept is already right — a data-only package, explicitly documented as not carrying runtime authority, which is exactly the posture Release 20 needs. It already decomposes into the right categories (conditions, obligations, monitoring/review/reporting expectations).

**Gaps:**
- No `contractVersion` or schema version field — an importer (OMG or otherwise) has no way to know if the shape it received matches what it expects.
- No reference back to *why* it was issued (which reauthorisation event, which material change) — it's a snapshot, not a link in a chain.
- No integrity mechanism (see Area 4).
- `monitoringExpectations`/`reviewRequirements`/`reportingRequirements` are currently free-text string arrays — sufficient for human reading, insufficient for another system to act on programmatically. This is fine for a v1 human-mediated exchange; it becomes a real gap only if Release 20 (or a later release) pursues option C in Area 4 below.

**Risks:** none of the above are dangerous today because nothing consumes the contract automatically. They become real risks only in proportion to how automated any future exchange becomes — which argues strongly for the narrow, human-gated model this report recommends, rather than solving contract robustness prematurely for an automation level OMG isn't pursuing yet.

**Interoperability readiness:** low today, deliberately — it was built as an internal "package the decision" concept (Release 19), not an external exchange format. Release 20's job is to decide how much of that gap to close, not to declare it already closed.

---

## 6. Interoperability Options Comparison

| Model | Benefits | Risks | Complexity | Governance Implications |
|---|---|---|---|---|
| **A. Manual creation inside OMG** (status quo) | Simplest; already works; zero new surface area | Doesn't solve the actual problem — external authority still has to be re-typed by a human, error-prone, no traceability to the real source | None (nothing to build) | Weakest traceability of the four; the "why" lives outside OMG entirely |
| **B. Governance position import** (file/package-based, human-gated) | Closes the real gap; preserves the human-accept boundary; reuses existing acceptance/supersession machinery; smallest new surface area that actually solves the problem | Package format needs versioning discipline (Area 5); no live sync, so staleness is possible if the external system changes its mind after export | Low–Medium | **Recommended** — matches OMG's existing "advisory, human-accountable" posture exactly |
| **C. API-driven exchange** (live, system-to-system) | Removes manual file-handling; enables near-real-time reauthorisation propagation | Turns OMG into a standing integration endpoint — the exact "becoming the source of authority" risk Area 1 warns against, since a live API implies OMG trusts inbound calls with some level of automation; credential/trust management burden; contradicts the explicit Release 18/19 non-goal of not building integration surfaces speculatively | High | Materially changes OMG's risk posture; would need its own dedicated security review before any Release 20-scale commitment |
| **D. Hybrid** (import today, API-ready package format for later) | Gets the benefit of B now without foreclosing C later, if a real customer need for live sync ever materializes | Slight over-engineering risk if the "later" never comes | Low (same as B, plus disciplined metadata design) | **Also recommended**, as the specific flavor of B: design the package format so it *could* travel over an API later, without building that API now |

**Recommendation: B, shaped as D.** Build the import boundary and package format now; do not build the API. This is consistent with this codebase's own established discipline — Release 18's Integration Architecture finding was explicit that speculative integrations should not be built ahead of demonstrated customer need, and nothing in Release 19/19.1/19.2 has changed that calculus.

---

## 7. Versioning Analysis

Current mechanism (`AGPStatus`: Active/Superseded/Expired/Suspended) is a **state flag, not a version history**. For the five scenarios asked about:

- **Superseded positions**: already modeled — a new Active AGP for the same asset flips the prior one to Superseded. Works today. Gap: no link *from* the new one *to* the one it superseded (no `supersedes` field on `AuthorisedGovernancePosition`, unlike `AuthorityProvenanceRecord`, which already has exactly this field). This is the single cheapest, highest-value conceptual gap to close in a future release — extending a pattern that already exists elsewhere in the same release, not inventing one.
- **Reauthorised positions**: conceptually, a reauthorisation should produce a new version that references *why* (which Reauthorisation outcome triggered it) — today it would just look like an ordinary new AGP, indistinguishable from an unrelated one.
- **Expired positions**: modeled (`Expired` status, driven by `validUntil`). Works today, confirmed live this session.
- **Conditional positions**: already modeled structurally — `conditions[]` is a first-class field. What's not modeled is a position that is *partially* accepted (some conditions accepted, others rejected) — out of scope for a v1 exchange model; flag as a non-goal.
- **Revoked positions**: **not modeled at all**. `Suspended` is the closest existing state, but "suspended pending reliance failure" (Release 19's own usage) and "revoked because the external authority withdrew it" are semantically different events that currently collapse into the same status value. This is a real gap for external exchange specifically, since an external system revoking its own prior authorisation is a first-class event a receiving system needs to represent distinctly from an internally-detected reliance failure.

**Recommendation:** any Release 20 scope should, at minimum, add a `supersedes`-style backward link on `AuthorisedGovernancePosition` (mirroring the existing pattern on `AuthorityProvenanceRecord`) and consider whether `Revoked` deserves to be a distinct status from `Suspended`. Both are small, additive, and consistent with existing modeling — not new concepts.

---

## 8. Governance Position Package Assessment

Evaluating a transportable package covering Authority, Scope, Conditions, Obligations, Evidence requirements, Review triggers, Applicability:

**This is achievable almost entirely by *composing* existing types, not inventing new ones:**
- Authority → `AuthorityProvenanceRecord` (already exists)
- Conditions/Obligations → already fields on `AuthorisedGovernancePosition`
- Evidence requirements → doesn't exist as a distinct concept today; closest is `GovernanceRelianceElement` of type `'Required Evidence'` (already exists, Release 19 Domain E)
- Review triggers → `ReauthorisationTriggerType` already exists (Release 19 Domain F)
- Applicability → **does not exist as a concept anywhere in OMG today.** Every current entity is scoped to exactly one asset (`assetId`). A package that says "this position applies to any asset matching criteria X" (a risk tier, an asset type, a business unit) would be genuinely new — the first case in this whole analysis that isn't just composition of what already exists.

**Recommendation:** scope Release 20's package concept to the single-asset case only (composition of existing types) and explicitly defer "applicability rules" (multi-asset, criteria-based positions) as a named non-goal — it's a meaningfully larger conceptual addition than everything else in this report, and nothing in the current architecture asks for it yet.

---

## 9. Customer Customisation Boundary

**OMG Common Governance Baseline** (Core, built once):
- The import boundary mechanism itself (accept/reject a package, structural validation).
- The Governance Position Package *shape* (the composed fields above).
- Integrity checking (checksum-level).
- Everything downstream of acceptance — Reliance, Reauthorisation, GSRL — already Core, already reused for free.

**Customer-Specific ODF Implementation** (never Core):
- *Mapping* a specific customer's Governance Formation system's actual output format into the OMG package shape. Every governance board, committee tool, or GRC platform will have its own native format; translating "Customer X's committee export" into "an OMG Governance Position Package" is integration work specific to that customer's tooling, exactly the ODF Implementation Layer pattern already established and defended throughout this session's positioning work.
- Any customer-specific rule about *which* external sources are trusted, and by whom, at that customer's site.
- Any workflow automation the customer wants around "auto-accept from source X" — OMG Core should never ship an auto-accept path; if a customer insists on one, it is their own configuration/risk decision, delivered through ODF, not a platform default.

This mirrors exactly the Common/Configurable/ODF/Customer boundary already used successfully in the Kechagias architecture assessment earlier this session — Release 20 doesn't need a new boundary model, it needs to apply the existing one to a new capability.

---

## 10. Risks & Trade-offs

**Architectural risks:** the single largest risk is the import boundary becoming, in practice, a second write-path into `AuthorisedGovernancePosition` that bypasses the discipline the UI-driven path enforces (RBAC checks, required-field validation). Any implementation must route imported-and-accepted positions through the *same* `saveAuthorisedGovernancePosition` function and the *same* RBAC gate as manual creation — not a parallel path.

**Governance risks:** an imported position could assert conditions/obligations that don't map cleanly onto OMG's existing Reliance Basis vocabulary, producing a technically-valid-but-meaningless position. Mitigate by requiring at least structural validation (referenced asset exists, required fields present) at acceptance time — not semantic validation, which would require OMG to judge the *content* of external authority, exactly what Area 1 says it must not do.

**Product risks:** scope creep toward Option C (live API) driven by a single eager customer request, before the human-gated model has been proven. Guard explicitly in the release scope (Area 12/13).

**Operational risks:** package format versioning drift — if the package shape changes between OMG releases without a version tag, older exported packages become silently unimportable or misread. This is exactly why Area 5/6 both call for an explicit format version field even in a v1 that has no other consumer yet.

**Interoperability risks:** without a real second system to interoperate with today (confirmed zero external governance formation integration exists), there's a genuine risk of designing a format nobody's actual system can produce. Recommend prototyping against at least one concrete, real external format (even a spreadsheet export from an actual governance committee process) before finalizing the package schema.

**IP boundary risks:** a customer-specific ODF mapping (Area 9) could, if built carelessly, end up encoding a customer's specific governance methodology *inside* what looks like an OMG Core transformation function. Guard by keeping the mapping layer physically and organizationally separate (ODF-delivered code/config, not a PR into OMG Core's repository).

---

## 11. Recommended Direction

Adopt **Interoperability Model B, shaped as D** (Area 4): a human-gated Governance Position Package import mechanism, reusing existing acceptance/supersession/RBAC machinery, with no live API in this release. Extend `AuthorisedGovernancePosition` with a `supersedes` backward-link (mirroring the pattern already on `AuthorityProvenanceRecord`) and consider a distinct `Revoked` status. Scope the package concept to single-asset positions only; explicitly defer multi-asset "applicability" rules.

---

## 12. Candidate Release 20 Scope

- A conceptual **Governance Position Package** format — composed from existing types (Authority Provenance, AGP fields, Reliance-typed evidence requirements, Reauthorisation trigger types) plus a small number of genuinely new package-level metadata fields (source system/process identifier, external position identifier, package format version, integrity token).
- An **import surface**: structural validation → human review → explicit Accept, routed through the existing `saveAuthorisedGovernancePosition` path (no parallel write path).
- A **`supersedes` link** on `AuthorisedGovernancePosition`, closing the one clean gap identified in Area 7.
- Consideration of a distinct **`Revoked`** AGP status, separate from `Suspended`.
- Enriching `GovernancePositionContract`'s export with a schema/version field and a reference to the triggering reauthorisation event — strengthening the existing export path before building anything new on the import side.

## 13. Candidate Release 20 Non-Goals

- No live API / system-to-system exchange (Option C) — explicitly deferred, not attempted.
- No governance formation modeling of any kind — no committees, no voting, no board workflow.
- No multi-asset "applicability" rules for packages — single-asset scope only.
- No cryptographic signature/PKI scheme — a checksum-level integrity check only, proportionate to the human-gated model.
- No auto-accept pathway for any imported package, under any configuration, in Core.
- No customer-specific format-mapping logic inside OMG Core — every such mapping is ODF Implementation Layer work, per Area 9.
- No new UI components beyond what's structurally necessary to review/accept a package (explicitly, this analysis does not specify or design that UI — per the directive's own instruction not to design new UI components).
