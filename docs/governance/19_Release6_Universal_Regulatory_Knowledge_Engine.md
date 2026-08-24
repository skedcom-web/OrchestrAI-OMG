# OMG Release 6 — Universal Regulatory Knowledge & Obligation Engine
> **Foundation Edition**

This document records what Release 6 added to OrchestrAI Model Governance (OMG), why, and where to find it. It supplements the Phase 1-10 documents and the Release 1-5.1 addenda in this directory.

---

## 1. What Release 6 Is — and Isn't

> Build the foundation once. Onboard compliance layers later as data.

Release 6 generalizes Release 5's Compliance Pack Framework one layer deeper: **Source → Requirement → Obligation → Control → Evidence**, replacing "Pack" with a generic **Regulatory Source** and inserting an explicit **Obligation** layer between Requirement and Control. **No RBI, ISO 42001, EU AI Act or NIST content is implemented in this release** — the one demo source is deliberately generic sample structure, not regulatory advice. Release 9+ is where real regulation packs land, as data plugged into this foundation, not a platform redesign.

Unlike Release 5 — which deliberately shipped its framework on local storage and only became Neon-backed in the 5.1 correction — Release 6 is **API-first and Neon-backed from day one**, per its own explicit production principles. There is no "5.1 for Release 6" to come; this release absorbed that lesson at launch.

## 2. The Architecture: Source → Requirement → Obligation → Control → Evidence

| Capability | Object | Key fields |
|---|---|---|
| 1. Regulatory Source Registry | `RegulatorySource` | id, name, source type, jurisdiction, industry, version, effective/review date, status |
| 2. Requirement Registry | `RegulatoryRequirement` | id (human-readable, e.g. `REQ-OVERSIGHT-001`), name, description, source, category, criticality, status |
| 3. Obligation Engine | `Obligation` | id, name, description, requirement, owner, status — translates a requirement into actionable obligations |
| 4. Control Mapping Engine | `ObligationControl` | id, name, description, obligation, owner, status — maps an obligation to the OMG control that satisfies it |
| 5. Evidence Mapping Engine | `ObligationEvidenceMapping` | control ↔ an existing Release 3 `EvidenceRecord` |
| 6. Coverage Engine | computed | `Covered` / `Partially Covered` / `Not Covered` / `Not Applicable` — **no percentages, no maturity or trust scores** |
| 7. Gap Engine | computed | `Missing Control`, `Missing Evidence`, `Missing Review`, `Missing Approval`, `Missing Ownership` |

A control is **Covered** when at least one mapped evidence record is not expired. Coverage rolls up: control → obligation → requirement → source, exactly mirroring Release 5's roll-up logic one layer deeper.

## 3. How This Relates to the Existing Compliance Pack Framework

Release 5's Compliance Pack Framework (`/compliance-packs`) is **unchanged** and still fully functional — its three demo packs, Pack → Requirement → Control → Evidence chain, and Neon persistence (since 5.1) all continue to work exactly as before. Release 6 does not migrate or redesign that data; it adds a **separate, additive foundation** one layer more general, ahead of a future where real regulation content (Release 9+) needs the extra Obligation layer to translate abstract requirements into concrete, ownable actions. The two frameworks will likely converge in a later release once a real regulation pack proves which shape wins — until then both coexist.

## 4. Demo Data

One sample source illustrates all four live coverage outcomes across its requirements, matching the blueprint's own "Human Oversight Required → Named Owner / Approval Authority / Escalation Path / Override Capability" example:

| Requirement | Criticality | Status | Coverage | Why |
|---|---|---|---|---|
| Human Oversight Required | Critical | Active | **Partially Covered** | 2 of 4 obligation-controls covered (Named Owner, Approval Authority); Escalation Path has no evidence, Override Capability has neither owner nor evidence |
| Independent Validation Required | High | Active | **Covered** | Its one control (Validation Sign-Off) is mapped to valid, unexpired evidence |
| Audit Trail Required | High | Active | **Not Covered** | Its one control (Audit Log Retention) has an owner but no evidence mapped |
| Periodic Review Required | Medium | Draft | **Not Applicable** | No obligations defined yet |

Every evidence mapping reuses a Release 3 evidence record already on file — the same "collect once, apply everywhere" principle Release 5 demonstrated, now shown working across two independent frameworks referencing the same evidence pool.

## 5. Where To Look In The Product

| Surface | What it is |
|---|---|
| Mapping Workspace (`/mapping-workspace`, new) | Regulatory Source Registry plus the full workspace (Requirements / Obligations / Controls / Evidence / Coverage / Gaps tabs) for the selected source — combines Capability 1 and the workspace UI on one screen, mirroring how Release 5 combined its Pack Registry and Assessment Workspace. |
| Requirement Registry (`/requirement-registry`, new) | Cross-source, filterable catalogue of every requirement registered across every regulatory source. Read-first — CRUD lives in the Mapping Workspace, the same relationship Compliance Center has to the Compliance Pack Framework. |
| Obligation Library (`/obligation-library`, new) | Cross-requirement, filterable catalogue of every obligation the Obligation Engine has produced. Also read-first. |
| Executive Dashboard (`/dashboard`) | New Regulatory Coverage Overview (with a Requirements-by-Category breakdown) and Open Gaps Summary (with Top Missing Controls) panels. |
| Executive Governance Hub (`/executive-hub`) | New "Regulatory Knowledge Engine Readiness" panel — Active Sources, Covered Requirements, Open Gaps, Coverage Status per source. Named distinctly from the pre-existing Workstream 8 "Regulatory Readiness" panel (a different, audit-evidence concept) to avoid confusion between the two. |

## 6. Implementation Notes

- Frontend types: `RegulatorySource`, `RegulatoryRequirement`, `Obligation`, `ObligationControl`, `ObligationEvidenceMapping`, `RegulatoryCoverageResult`, `RegulatoryGap` in `frontend/src/types/index.ts`.
- Coverage and gap logic: `frontend/src/config/regulatoryKnowledgeEngine.ts`, pure and data-in/data-out like Release 5's `compliancePackFramework.ts`.
- **Persistence:** built API-first from the start using the cache-then-network pattern established in Release 4.1 and generalized in 5.1 — `storageService.ts` keeps reads synchronous off in-memory caches while every write is async and Neon-first, with `bootstrapPersistence()` fetching all five Release 6 collections alongside Assets/Evidence/Continuity/Compliance at startup. Backend: full CRUD (`GET/POST/PATCH/DELETE`) on all five models (`RegulatorySource`, `RegulatoryRequirement`, `Obligation`, `ObligationControl`, `ObligationEvidenceMapping`) in `backend/src/app.controller.ts`, with cascading Prisma relations (`onDelete: Cascade`) from Source down through Evidence Mapping — validated end-to-end.
- Repository Pattern: `RegulatorySourceRepository`, `RegulatoryRequirementRepository`, `ObligationRepository`, `ObligationControlRepository`, `ObligationEvidenceMappingRepository` in `frontend/src/repositories/`, Api implementations as the default (Local implementations exist as fallback utilities only, matching the 5.1 precedent).
- Seed data: `backend/prisma/seed.js`'s `seedRegulatoryKnowledge()` seeds the one demo source unconditionally (idempotent on `RegulatorySource` row count), resolving evidence mappings by evidence name rather than a remembered id, for the same reason Release 5.1's compliance seeding does.

## 7. Validation

All seven scenarios from the blueprint (mirroring Release 5.1's validation shape) were run against the live local backend, pointed at production Neon:

| # | Scenario | Result |
|---|---|---|
| 1 | Create Regulatory Source → Refresh Browser → Source remains | ✅ |
| 2-3 | Cross-browser / cross-device visibility | ✅ Verified via direct API calls and a fresh browser tab with no prior cache |
| 4 | Create Requirement → Visible everywhere | ✅ |
| 5 | Create Obligation → Control → Visible everywhere | ✅ |
| 6 | Map Evidence to Control → Coverage recalculates | ✅ Not Covered → Covered instantly; unlinking reverted it |
| 7 | Delete Source → Cascading relationships behave correctly | ✅ Deleting the test source cascaded its requirement, obligation, control and evidence mapping in Neon — row counts returned to exactly the seeded baseline |

All test artifacts created during validation were deleted afterward; Neon ends this release in exactly its seeded state (1 regulatory source, 4 requirements, 6 obligations, 6 controls, 3 evidence mappings, alongside the unchanged Release 5 compliance data).

## 8. What's Still Out of Scope

Per the blueprint:
- RBI FREE-AI / ISO 42001 / EU AI Act / NIST AI RMF content (Release 9+)
- The Governance Intelligence Engine — policy evaluation, condition detection, automated reassessment/review/reauthorization triggers (Releases 7-8)
- Scoring of any kind — coverage remains Covered / Partially Covered / Not Covered / Not Applicable only

## 9. Success Criteria

A new regulation can be onboarded by: registering the source, creating requirements, creating obligations, mapping controls, mapping evidence — without redesigning OMG. This release's own demo source was built exactly that way, through the product UI, as its own proof.

---

*Supersedes nothing. Read alongside [17_Release5_Compliance_Pack_Framework.md](17_Release5_Compliance_Pack_Framework.md), [18_Release5_1_Compliance_Persistence_Alignment.md](18_Release5_1_Compliance_Persistence_Alignment.md) and [02_Functional_Requirements_Specification.md](02_Functional_Requirements_Specification.md).*
