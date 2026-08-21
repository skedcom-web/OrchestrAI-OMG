# OMG Release 3 — Evidence Foundation
> **Release 3 Guide & Evidence Governance Guide**

This document records what Release 3 added to OrchestrAI Model Governance (OMG), why, and where to find it in the product. It supplements — and does not replace — the Phase 1-10 documents and the [Release 1](file:///C:/Users/VT348/Documents/GitHub/OrchestrAI%20OMG/docs/governance/12_Release1_Governance_Authority_Foundation.md) / [Release 2](file:///C:/Users/VT348/Documents/GitHub/OrchestrAI%20OMG/docs/governance/13_Release2_Governance_Continuity_Foundation.md) addenda in this directory.

---

## 1. What Release 3 Is

Release 1 established *who owns this AI*. Release 2 established *whether its authorization remains valid over time*. Release 3 makes **evidence** itself a first-class governance object — the thing every future compliance pack, readiness score and audit conversation will be built on.

Evidence Registry is universal: it is not tied to one deliverable format or one asset lifecycle stage. It supports today's governance operations and audit readiness, and is the foundation for the future RBI FREE-AI Pack, ISO 42001 Pack, other Compliance Packs, and Governance Intelligence — none of which are implemented in this release.

**Strategic rule carried through this release: Demo = Production Architecture.** The Evidence Registry uses the same domain model, workflow, navigation and UI in demo mode (local storage) as it will in production (backend API + Neon) — only the storage provider changes. See [[project-omg-architecture-gap]] for what still needs to be built to make that swap real.

## 2. How This Relates to the Existing Evidence Center

OMG already had an **Evidence Center** (`/evidence`) holding ODF-deliverable artefacts (`EvidenceDocument`) tied to governance packages. Release 3 does not replace or restructure it — Evidence Center is unchanged. The new **Evidence Registry** (`/evidence-registry`) is a broader, universal evidence object (`EvidenceRecord`) with its own ownership, traceability and lifecycle model, built for governance operations and audit readiness generally, not just deliverable documents.

## 3. Evidence Registry Fields (Capability 1)

Evidence ID, Evidence Name, Evidence Type, Evidence Owner, Status, Created Date, Expiry Date, Description, Linked Asset.

## 4. Evidence Types (Capability 2)

Policy Document, Risk Assessment, Validation Report, Approval Record, Governance Review, Audit Finding, Incident Report, Control Assessment, Training Record, Third-Party Assessment.

## 5. Evidence Ownership (Capability 3)

Evidence Owner (mandatory), Business Owner, Reviewer, Approval Authority (all optional) — captured per record so accountability for evidence is as explicit as accountability for the asset it supports.

## 6. Evidence Traceability (Capability 4)

Evidence can reference: the AI Asset (mandatory link), a Risk Assessment, a Governance Review, a Decision Record, a Reauthorization Record, or a Governance Timeline Event. References are loose (label/id text) rather than strict foreign keys, since not every linked record type is guaranteed to exist for a given piece of evidence.

## 7. Evidence Lifecycle (Capability 5)

Draft → Active → Expired / Archived / Superseded.

## 8. Evidence Expiry Tracking (Capability 6)

Issue Date, Expiry Date, Days Remaining, and an indicator: **Valid**, **Expiring Soon** (within 30 days), or **Expired**.

## 9. Evidence Timeline (Capability 7)

Created, Updated, Reviewed, Approved, Expired, Archived — derived from the record's own fields, visible on every evidence record's detail card.

---

## 10. Where To Look In The Product

| Surface | What changed |
|---|---|
| Evidence Registry (`/evidence-registry`) | New module — registry table, create/edit form, and a detail view combining Evidence Detail and Evidence Timeline. |
| AI Asset Registry (`/assets`) | Asset detail card gained a **Linked Evidence** section — evidence count and a summary list per asset. |
| Executive Dashboard (`/dashboard`) | New **Evidence by Type & Status** and **Expiring Evidence** panels. |
| Executive Governance Hub (`/executive-hub`) | New **Evidence Overview** panel — total records, ownership completeness, expiring/expired count, assets without evidence (plain counts, no scoring). |
| Landing / Guided Tour (`/`) | Viewer journey gained "Capture supporting evidence," "Trace governance decisions," "Demonstrate audit readiness"; guided tour grew from 16 to **21 steps**, with 5 new stops (Evidence Registry, Evidence Ownership, Evidence Traceability, Evidence Lifecycle, Evidence Timeline). |

## 11. Implementation Notes

- Frontend types: `EvidenceRecord`, `EvidenceRecordType`, `EvidenceRecordStatus`, `EvidenceOwnership`, `EvidenceTraceability`, `EvidenceTimelineEvent` in `frontend/src/types/index.ts`.
- Reference data and expiry logic: `frontend/src/config/evidenceFoundation.ts`.
- All 6 demo assets carry linked evidence spanning every lifecycle state (Draft, Active, Expired, Archived, Superseded) and both expiry indicators (Expiring Soon, Expired), so the registry never looks empty or contrived.
- Backend: new `EvidenceRecord` model in `backend/prisma/schema.prisma`, related to `AIAsset` (cascading delete), plus `EvidenceRecordType` and `EvidenceRecordStatus` enums. Additive — the existing `EvidenceDocument` model and Evidence Center are untouched. Synchronized to the live Neon database via `prisma db push`.

---

*Supersedes nothing. Read alongside [12_Release1_Governance_Authority_Foundation.md](file:///C:/Users/VT348/Documents/GitHub/OrchestrAI%20OMG/docs/governance/12_Release1_Governance_Authority_Foundation.md), [13_Release2_Governance_Continuity_Foundation.md](file:///C:/Users/VT348/Documents/GitHub/OrchestrAI%20OMG/docs/governance/13_Release2_Governance_Continuity_Foundation.md) and [02_Functional_Requirements_Specification.md](file:///C:/Users/VT348/Documents/GitHub/OrchestrAI%20OMG/docs/governance/02_Functional_Requirements_Specification.md).*
