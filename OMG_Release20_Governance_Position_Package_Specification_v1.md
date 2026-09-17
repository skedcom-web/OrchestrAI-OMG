# OMG Release 20 — Governance Position Package Specification v1
## Architecture & Specification Paper (Analysis Only — No Implementation)

---

## Section 1 — Executive Summary

**Purpose:** Define the minimum, precise information contract that lets an upstream authority or governance-formation process hand OMG an already-authorised governance position — without OMG ever needing, or being able, to reconstruct *how* that authorisation was reached.

**Scope:** The package's field contract, its integrity model, its acceptance lifecycle, and the resulting Governance Position states. Explicitly out of scope: any implementation, any UI, any code, any engine, any API.

**Architectural intent:** OMG sits in Layer 2 (Governance Operations) by design and by repeated, deliberate choice across Releases 18 through 19.2. This specification exists to let Layer 1 (Organisational Authority Formation) hand work to Layer 2 without Layer 2 absorbing Layer 1's responsibilities — the same boundary this session's architecture reviews have defended from multiple angles (the Kechagias assessment's Common/Configurable/ODF/Customer model, the Javier/Aegis analysis's finding that OMG has no external decisioning surface, and Release 19's own explicit non-goals).

**Key design principles:**
1. **The package answers "what was decided," never "how."** If a candidate field would let a reviewer reconstruct the deliberation, it doesn't belong in the package.
2. **Citation, not recreation.** Authority, evidence, policy, and regulatory context all cross the boundary as references/citations to something that exists elsewhere — never as re-implemented content inside OMG.
3. **One write path, not two.** An accepted package must produce exactly the same kind of record, through exactly the same mechanism, RBAC gate, and audit trail as a manually-created governance position. The package is a new *input*, not a new *entity type* or a parallel *mechanism*.
4. **Human acceptance is the boundary, not a formality.** The moment a package becomes governance-effective in OMG is the moment an OMG-accountable person says so — never on import alone.
5. **Enterprise-ready, not enterprise-mandatory.** The specification should accommodate a signing/PKI-capable enterprise without requiring every adopter to have one on day one.

---

## Section 2 — Governance Position Package Definition

**What is it?** A self-contained, data-only artefact that represents one authorised governance position for one governed asset — what was authorised, under what conditions and obligations, by what named authority, effective when, and accountable to whom. It is a *snapshot handed across a boundary*, not a live connection.

**What problem does it solve?** Today (confirmed directly in the Release 19 codebase), an `AuthorisedGovernancePosition` can only be created by a human retyping its content into OMG's own UI. There is no way to say "this position was actually authorised by the AI Governance Committee on this date, under this reference number" in a way OMG can verify came from that process rather than from whoever happened to type it in. The package closes that specific, narrow gap — traceability of origin, not richness of new governance concepts.

**Why would a customer use it?** Any enterprise that already runs a governance committee, board process, or dedicated Governance Formation tool wants that process's output to land in OMG *as itself* — traceably, without a manual re-entry step that silently discards the paper trail back to the real authorising body. It is the difference between "someone in OMG believes this was approved" and "OMG can show you exactly which committee decision this position traces to."

---

## Section 3 — Package Structure

### Mandatory Fields — analysed, not assumed

| Candidate Field | Recommendation | Reasoning |
|---|---|---|
| **Position ID** | **Mandatory — but must be two distinct identifiers, not one.** An *external* Position ID (assigned by the source system) plus OMG's own internal id (assigned only at Accept). | Conflating these is a real design trap: if OMG treats the external id as its own primary key, a second import of the same external position (e.g., a corrected re-export) becomes ambiguous — is it an update or a duplicate? Keeping them distinct lets OMG treat a repeat external id as "a new version of a position I've seen before," which directly supports Section 7's lifecycle. |
| **Position Name** | *Reclassified to Optional.* | Human-readable convenience only — `AuthorisedGovernancePosition` today has no name field, only a state label. Useful for review screens, not load-bearing for any governance computation. |
| **Source System** | **Mandatory.** | This is the core provenance fact the whole specification exists to carry. Without it, "Authority Provenance" is a label with nothing behind it. |
| **Source Authority** | **Mandatory — as a citation string only** (e.g., "AI Governance Committee"), never as a structured representation of the body itself (membership, voting weight, etc.). | This is the exact line Section 4 draws. Mirrors the existing `authoritySource` field on `AuthorityProvenanceRecord` — reuse the pattern, don't invent a richer one. |
| **Authority Reference** | **Mandatory.** | A document/decision reference (e.g., "GOV-2026-014") — directly analogous to the existing `delegationRef` field. Reuse, don't reinvent. |
| **Effective Date** | **Mandatory.** | Maps to the existing `validFrom` field. |
| **Expiry Date** | **Optional.** | Many authorised positions are open-ended until superseded, exactly as `validUntil` is already optional today. |
| **Scope** | **Split into two, both needed, one Mandatory / one Optional.** Applicability (which asset) is Mandatory. A free-text description of the *bounds of authorised action* is Optional. | Conflating "which asset does this apply to" with "what is this asset allowed to do" was the ambiguity in the source list. They're different questions, both real, and OMG already has a precedent for the second (`delegationScope` on agent-type assets) — reuse that pattern for the optional half. |
| **Conditions** | **Mandatory.** | Already a first-class field on `AuthorisedGovernancePosition`. Direct pass-through. |
| **Obligations** | **Mandatory.** | Same — direct pass-through. |
| **Review Triggers** | *Reclassified to Optional, advisory only.* | OMG already has its own `ReauthorisationTriggerType` taxonomy and its own Reauthorisation Engine that *detects* material change independently. A package-supplied trigger hint should inform a reviewer, never override or bypass what OMG's own engine would otherwise detect. |
| **Applicability** | **Mandatory, but tightly constrained.** Must resolve to exactly one target asset (or an explicit "unresolved — requires human mapping at import" placeholder). | Explicitly recommend **against** open-ended, criteria-based, multi-asset applicability (e.g., "applies to all Critical-risk agents") — see Release 20's prior architecture assessment, which identified this as the one genuinely new concept in this whole space and recommended deferring it. Keep v1 single-asset. |
| **Accountability References** | **Mandatory — as named-role citations**, mirroring the existing five accountability roles (`accountableOwner`, `governanceSponsor`, `riskOwner`, `technicalOwner`, `complianceOwner`). | Do not invent a new accountability model; supply values for the model that already exists. |

### Optional Fields — analysed, not assumed

| Candidate Field | Recommendation | Reasoning |
|---|---|---|
| Evidence references | **Optional — citation/identifier only, never embedded content.** | Aligns with the existing `GovernanceRelianceElement` type `'Required Evidence'`. The evidence itself stays in its system of record; the package only names what's expected. |
| Supporting documents | **Optional — link/reference only, never embedded.** | Keeps the package small and avoids the package becoming a document-custody problem or an IP-transfer concern in its own right. |
| Risk references | **Optional — citation only.** | Informs, does not replace, OMG's own `riskLevel` field on the asset. |
| Policy references | **Optional — citation only.** | Same principle. |
| Regulatory references | **Optional — citation only**, with a light future-compatibility note: a mature version could map these onto OMG's existing `RegulatorySource` identifiers, but v1 should not require that mapping to exist. | Avoids forcing every source system to already know OMG's internal regulatory taxonomy. |
| **Metadata (format version, issuance timestamp, integrity token)** | **Reclassified to Mandatory — this is not optional.** | This is the single correction most worth making to the source list. Every prior finding in this session's Release 20 work (and the Contract Assessment specifically) identified missing version metadata as the mechanism by which a format silently breaks across releases. This is package-level plumbing, not content — it must always be present, regardless of what content the package carries. |

---

## Section 4 — Explicit Exclusions (Most Important Section)

**The litmus test:** *if a field would let a reviewer reconstruct HOW a decision was reached, rather than cite WHAT was decided and WHO is accountable for it, it does not belong in the package.*

| Excluded Item | Why it must never cross |
|---|---|
| Committee votes | A tally is a fragment of deliberation, not a decision artefact. Its presence in OMG would make OMG a repository of formation mechanics. |
| Internal deliberations | Meeting minutes, debate transcripts, dissent records — these are formation-process records, explicitly Layer 1. |
| Voting records | Same class as committee votes — who voted which way is process, not position. |
| Authority aggregation logic | The *rule* by which multiple approvers become one decision (quorum, weighting, escalation) is methodology, not outcome. If OMG ever needed to represent this, it would be modeling governance formation — the exact thing Release 19 was built to avoid becoming. |
| Governance formation methodology | Frameworks, playbooks, or methodologies used by the source process. Irrelevant to operating the resulting position. |
| Governance judgement reasoning | The sharpest line in this table: OMG may know **that** evidence X was reviewed (an evidence reference, Section 3, Optional) but must never carry **why** that evidence led to this specific judgement call. The first is a fact; the second is reasoning that belongs to the authority that did the reasoning. |
| Internal approval mechanics | Routing steps, sign-off chains, workflow states *within the source system*. OMG's own Accept step (Section 6) is a different, OMG-side mechanism and must not be confused with, or fed by, the source's internal routing. |

A useful secondary check: **would a Governance Formation vendor consider this field part of their own product's IP?** If yes, it should not be in the package — it should stay behind that vendor's boundary, cited by reference at most.

---

## Section 5 — Package Integrity Model

**Recommendation: a tiered trust model, not a single mandatory mechanism.**

- **Tier 0 — No integrity marker.** The package is accepted for human review but cannot be Accepted into an Active position without an explicit, logged risk acknowledgment by the accepting reviewer. Exists so the format is usable by a source system with zero cryptographic capability, without silently pretending that's safe.
- **Tier 1 — Content hash present** (a straightforward checksum over canonicalized package content). **Recommended baseline for v1.** Lets OMG detect "this file was altered or corrupted after export" without requiring any PKI infrastructure from the source system. This is the "avoid over-engineering" answer the brief asks for.
- **Tier 2 — Cryptographic signature metadata present**, reserved as a field in the spec but **not required for v1**. A source system that already has signing capability can populate it now; OMG does not need to build signature *verification* logic until real demand exists for Tier 2 trust. This is what "assume enterprise adoption" actually means in practice — the field exists so the door isn't closed, not so every adopter is forced through it immediately.

**Provenance markers** (Source System, Source Authority, Authority Reference, package format version, issuance timestamp) are all already Mandatory per Section 3 — no additional mechanism needed here beyond what the field contract already requires.

**Explicitly avoid:** requiring a full PKI trust chain, requiring OMG to maintain a certificate authority relationship, or requiring real-time signature verification against an external key server. All three would be disproportionate infrastructure for a v1 whose actual adoption evidence doesn't exist yet.

---

## Section 6 — Acceptance Model

**Lifecycle: Import → Review → Accept / Reject → (post-acceptance) Supersede / Suspend / Expire.**

- **Import** is a mechanical, structural event: does the package have every Mandatory field, does the hash (if present) validate, does the referenced asset exist in this tenant. **No human judgement required at this step** — it can be automated/batched. Its output is a package sitting in a reviewable, pre-effective state; it must never silently become a real governance position.
- **Review** is a mandatory human step, deliberately separated from Import: an accountable person actually reads the package's conditions, obligations, and accountability references against the target asset's real current context.
- **Accept** is a mandatory, RBAC-gated human action — recommend the *same* permission tier already governing manual `governancePosition:create` today (Admin-tier), so accepting an external package is never easier to do than creating one manually. Accept must route through the **identical creation mechanism** used for manually-entered positions — this is the top architectural-risk guard from the prior Release 20 report, repeated here because it matters most at exactly this step.
- **Reject** must be a first-class, logged outcome — not merely "the file is ignored." Since v1 has no live channel back to the source system (no API, per the Non-Goals), rejection is recorded inside OMG only; there is no mechanism to automatically notify the source. **This is a genuine v1 limitation, stated plainly rather than glossed over.**
- **Supersede / Suspend / Expire** happen entirely after acceptance and should reuse 100% of the machinery Release 19 already built (auto-supersession on a new Active position for the same asset, date-driven expiry) — nothing new required here beyond Section 7's state additions.

**Recommend distinguishing two permissions, not one:** the ability to *import* a package (lower bar — any governance-facing role could reasonably trigger ingestion for review) versus the ability to *accept* it (Admin-tier only). Collapsing these into one permission would either make import too privileged to be useful, or acceptance too easy to be safe.

**Audit requirement:** every step — Import, Review outcome, Accept, Reject — must produce an audit record through the **same** mechanism every other write path in this codebase already uses. This is not a new logging concept; it's the existing pattern, applied here.

---

## Section 7 — Governance Position Lifecycle

**Critically evaluating the candidate state list, not accepting it:**

- **"Draft"** — recommend this does **not** become a state of the governance position at all. A package should only ever be exported once finalised on the source side; if a source system insists on sending unfinished positions, that belongs to the *package's own* pre-import handling, never to the `AuthorisedGovernancePosition` record itself, which should only exist once something real has happened.
- **"Imported"** — recommend **keeping**, as a genuinely distinct, meaningful state: structurally valid, referenced asset confirmed to exist, awaiting human Review — but carrying no governance effect yet.
- **"Accepted"** — recommend **not** treating as a separate persistent state. The moment of acceptance is an *event* (logged in history), and the resulting persistent state is simply Active (or naturally not-yet-effective if `validFrom` is future-dated — a case OMG's date logic already handles elsewhere, not a new state).
- **"Active"** — **keep**, unchanged from today.
- **"Suspended"** — **keep**, unchanged — meaning "temporarily not relied upon due to a detected internal problem" (e.g., Release 19.2's own broken-reliance scenario).
- **"Superseded"** — **keep**, unchanged.
- **"Expired"** — **keep**, unchanged, date-driven.
- **"Revoked"** — **recommend adding, as genuinely new and distinct from Suspended.** This is the one real gap identified in the prior Release 20 report: "the authorising body withdrew this position" is a fundamentally different fact from "OMG detected a reliance failure," and a reviewer asking "why isn't this Active" deserves a different, honest answer for each.

**Recommended final state set:** `Active | Superseded | Expired | Suspended | Revoked` — five persistent states, with `Imported` existing only as a *pre-acceptance* package status that never touches the real position record until Accept happens.

---

## Section 8 — Interoperability Models

*(Comparison reused and extended from the prior Release 20 assessment, with an explicit adoption sequence added per this brief's request.)*

| Model | Benefits | Risks | Complexity | Governance Implications |
|---|---|---|---|---|
| **A — Manual Entry** (status quo) | Already works, zero new risk surface | No traceability to real source; error-prone re-entry | None | Weakest of the four |
| **B — Package Import** | Closes the actual gap; human-gated; reuses existing machinery | Format versioning discipline required; no live sync | Low–Medium | **Recommended** — matches OMG's existing advisory, human-accountable posture exactly |
| **C — API Exchange** | Removes manual handling; near-real-time propagation | Makes OMG a standing trust endpoint — the exact "second source of authority" risk this whole specification exists to avoid | High | Materially changes OMG's risk posture; needs its own dedicated review, separately, later |
| **D — Hybrid** | Gets B's benefit now without foreclosing C later | Slight risk of over-designing for a future that may not arrive | Same as B, plus disciplined metadata | **Also recommended** — as the *design discipline*, not a separate build |

**Recommended adoption sequence:** A (today) → B (Release 20 candidate scope, designed per D's discipline) → C only after B has operated inside at least one real enterprise deployment and produced concrete evidence that live synchronization would deliver value proportionate to the trust-surface risk it introduces. Do not schedule C now, even tentatively.

---

## Section 9 — OMG Core vs ODF Boundary

**OMG Core (common governance baseline, built once):**
- The Governance Position Package schema itself.
- The Import → Review → Accept → Reject mechanism and its RBAC gates.
- The hash-level integrity check (Tier 1) and the reserved Tier 2 signature field.
- The five-state position lifecycle, the `supersedes` link, and the `Revoked` state.
- Full audit logging of every lifecycle step.

**ODF Customer Implementation (never Core):**
- The **adapter** that translates a specific customer's actual Governance Formation tool's native export format into the OMG package shape — every GRC platform, committee tool, or bespoke internal process will have its own format; this translation is customer-specific integration work by definition.
- Any customer-specific configuration of which source systems are pre-trusted, and by whom, at that customer's site.
- Any customer-specific mapping of *which* internal role may Accept packages from *which* source — a policy decision belonging to the customer's own operating model, not a platform default.

**Outside OMG entirely:**
- The Governance Formation tool/process itself — its UI, its workflow engine, its committee and voting mechanics.
- Any organisational-authority-management system.
- Any deliberation, reasoning, or judgement-formation record of any kind.

---

## Section 10 — Candidate Release 20 Opportunities

**Belongs in OMG Core:**
- Package schema v1 (Section 3's mandatory/optional field set).
- Import surface: structural validation + Tier 1 hash check.
- Review/Accept/Reject workflow, routed through the existing position-creation mechanism and existing RBAC.
- `supersedes` backward-link on the position record.
- `Revoked` as a distinct lifecycle state.
- Full audit trail across the lifecycle.

**Should NOT be implemented (this release or speculatively):**
- A live API endpoint (Model C) — no demonstrated need yet, and it changes OMG's trust posture materially.
- Mandatory cryptographic signature verification — the field should exist; the enforcement should not, until real signing-capable partners exist.
- Multi-asset, criteria-based applicability — a meaningfully larger concept than anything else in this specification, with nothing today asking for it.
- Any auto-accept pathway, under any configuration, in Core.
- Embedding evidence or supporting documents as content rather than references — turns the package into a document repository, which it must never become.

---

## Section 11 — Risks & Trade-offs

**Architectural:** the single largest risk, repeated because it matters most — an import path that bypasses the same validation and RBAC gate the manual path enforces, creating two ways to reach the same record with different guarantees.

**Product:** pressure from an early adopter to skip straight to Model C before Model B has been proven anywhere. Guard explicitly via the Non-Goals in Section 10.

**Governance:** an imported package's conditions/obligations may not map cleanly onto OMG's existing Reliance Basis vocabulary, producing a technically valid but practically meaningless position. Mitigate with structural validation only (does the referenced asset exist, are mandatory fields present) — never semantic validation of the *content* of external authority, which would itself cross the Section 4 boundary in the other direction.

**Interoperability:** no real external Governance Formation system exists today to validate this schema against (confirmed: zero such integration exists anywhere in the current codebase). Recommend piloting against at least one concrete real-world export format — even a manually-assembled one from an actual customer's committee process — before finalising the schema as fixed.

**Commercial:** a well-specified, published package format is a genuine strategic choice point, not just an engineering artefact. Published openly, it could become a differentiator that partners build toward; kept private, it protects competitive distinctiveness longer but slows partner adoption. This is a product-strategy decision that sits above this specification and should be made deliberately, not by default.

**IP boundary:** the customer-specific adapter (Section 9) must be built and maintained as ODF-delivered code/configuration, never merged into the OMG Core repository — the same discipline this session's other architecture reviews have already established and enforced.

---

## Section 12 — Final Recommendation

**Recommended Governance Position Package v1:** the field set in Section 3 — Mandatory: dual Position ID (external + internal), Source System, Source Authority citation, Authority Reference citation, Effective Date, Applicability (single-asset), Conditions, Obligations, Accountability References, package format version, issuance timestamp, content hash. Optional: Position Name, Expiry Date, authorised-scope description, Review Trigger hints, Evidence/Document/Risk/Policy/Regulatory citations, reserved signature metadata field.

**Recommended OMG Scope:** Import/Review/Accept/Reject surface reusing existing creation and RBAC mechanisms; Tier 1 hash-level integrity; the five-state lifecycle plus `supersedes` link and `Revoked` state; full audit trail.

**Recommended Non-Goals:** live API exchange; mandatory cryptographic signing; multi-asset applicability rules; any form of committee/voting/deliberation modeling; auto-accept under any configuration; embedded document/evidence content.

**Recommended Future Evolution Path:** ship v1 exactly as scoped here → validate it against at least one real ODF customer integration → only then evaluate, with actual evidence in hand, whether a v2 needs Tier 2 signature enforcement or an API transport layer. Every prior architecture assessment in this session has reached the same conclusion about integration timing from a different angle; this specification reaches it again from the package-design angle, which is itself a reassuring form of internal consistency rather than coincidence.
