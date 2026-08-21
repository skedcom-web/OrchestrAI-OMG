# OMG Release 5 — Universal Compliance Pack Framework
> **Release 5 Guide & Compliance Framework Guide**

This document records what Release 5 added to OrchestrAI Model Governance (OMG), why, and where to find it. It supplements the Phase 1-10 documents and the Release 1-4.1 addenda in this directory.

---

## 1. What Release 5 Is — and Isn't

> Build once. Reuse everywhere.

Release 5 builds the **reusable architecture** every future regulation (RBI FREE-AI, ISO 42001, EU AI Act, DPDP, NIST, ...) will plug into as configuration — not the regulations themselves. **No RBI, ISO 42001 or EU AI Act control content is implemented in this release.** The three demo packs are explicitly sample structure, not real regulatory advice.

## 2. The Architecture: Pack → Requirement → Control → Evidence

| Capability | Object | Key fields |
|---|---|---|
| 1. Pack Registry | `CompliancePack` | id, name, version, status, owner, description, industry, effective date |
| 2. Requirement Registry | `ComplianceRequirement` | id (human-readable, e.g. `RBI-REQ-001`), name, description, pack, category, priority, status |
| 3. Control Registry | `PackControl` | id, name, description, requirement, owner, status |
| 4. Evidence Mapping | `EvidenceMapping` | control ↔ an existing Release 3 `EvidenceRecord` |
| 5. Coverage | computed | `Covered` / `Partially Covered` / `Not Covered` / `Not Applicable` — **no percentages, no maturity or trust scores** |
| 6. Gap Register | computed | `Missing Evidence`, `Missing Control`, `Missing Owner`, `Expired Evidence`, `Missing Review` |
| 7. Assessment Workspace | UI | tabs for Requirements, Controls, Evidence, Coverage, Gaps, per pack |

A control is **Covered** when at least one mapped evidence record is not expired. A requirement is covered when all its controls are; a pack is covered when all its requirements' controls are. This is the whole point of Capability 4 — evidence collected once in the Evidence Registry (Release 3) is reused across every pack that needs it, rather than re-uploaded per regulation.

## 3. How This Relates to the Existing Compliance Center

OMG already had a Phase 5 Compliance Center — per-asset, RBI-control-scored (0-100%, Compliant/Partially Compliant/Non-Compliant). That system is **unchanged**. Release 5's Compliance Pack Framework is a separate, additive layer: pack/requirement/control-centric rather than asset-centric, and deliberately unscored. The two coexist — Compliance Center now links directly into the new Compliance Pack Framework workspace, but neither redesigns the other.

## 4. Demo Data

Three demo packs illustrate all three live coverage outcomes:

| Pack | Status | Coverage | Why |
|---|---|---|---|
| RBI Demo Pack | Active | **Covered** | Both controls mapped to valid, unexpired evidence |
| ISO Demo Pack | Active | **Partially Covered** | One control mapped, one has no evidence |
| EU AI Demo Pack | Draft | **Not Covered** | Its one control has neither an owner nor mapped evidence |

## 5. Where To Look In The Product

| Surface | What changed |
|---|---|
| Compliance Pack Framework (`/compliance-packs`, new) | Pack Registry plus the full Assessment Workspace (Requirements / Controls / Evidence / Coverage / Gaps tabs) for the selected pack. |
| Compliance Center (`/compliance-center`) | New banner linking into the framework; existing per-asset compliance table untouched. |
| Executive Dashboard (`/dashboard`) | New Compliance Coverage Overview and Compliance Gap Summary panels. |
| Executive Governance Hub (`/executive-hub`) | New Compliance Readiness Overview — active packs, their coverage, and top gaps. |
| Landing / Guided Tour (`/`) | Viewer journey gained "Assess compliance obligations," "Understand compliance coverage," "Identify compliance gaps"; guided tour grew from 25 to **31 steps** (Compliance Center, Compliance Packs, Requirements, Controls, Coverage, Gaps). |

## 6. Implementation Notes

- Frontend types: `CompliancePack`, `ComplianceRequirement`, `PackControl`, `EvidenceMapping`, `ComplianceCoverageResult`, `PackGap` in `frontend/src/types/index.ts` — deliberately namespaced (`PackControl`, `PackGap`) to avoid colliding with the existing Phase 5 `ComplianceControl`/`ComplianceGap` types, which are a different, asset-scored concept.
- Coverage and gap logic: `frontend/src/config/compliancePackFramework.ts`, pure and data-in/data-out like Release 4's readiness functions.
- **Scoping decision:** unlike Assets/Evidence/Continuity (API-first since Release 4.1), the Compliance Pack Framework's frontend runs on local storage, matching the pattern every domain used before that architecture change. The backend schema and full CRUD API exist and are tested end-to-end (`CompliancePack`, `ComplianceRequirement`, `PackControl`, `EvidenceMapping` models, cascading relations, `GET/POST/PATCH/DELETE` on `backend/src/app.controller.ts`), satisfying the backend acceptance criteria — but wiring the frontend to it live is deferred until a real regulation pack (Release 6+) gives this domain something worth the same investment Assets/Evidence/Continuity got. This is a deliberate "framework before regulation" choice, not an oversight.
- A subtlety worth knowing: because Evidence is API-first (Release 4.1) but Evidence Mapping is local-only (this release), a demo mapping's `evidenceId` can point at an id that no longer exists once Neon-seeded evidence replaces the local fallback. Coverage resolution therefore matches on the evidence record's `name` as a fallback whenever the `id` doesn't resolve — see `resolveMappedEvidence()` in `compliancePackFramework.ts`.

---

*Supersedes nothing. Read alongside [15_Release4_Readiness_Persistence_Foundation.md](15_Release4_Readiness_Persistence_Foundation.md), [16_Release4_1_Persistence_Completion.md](16_Release4_1_Persistence_Completion.md) and [02_Functional_Requirements_Specification.md](02_Functional_Requirements_Specification.md).*
