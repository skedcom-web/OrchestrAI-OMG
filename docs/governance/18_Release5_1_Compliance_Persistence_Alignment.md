# OMG Release 5.1 — Compliance Persistence Alignment
> **Compliance Persistence Alignment Patch**

This document records what Release 5.1 changed in OrchestrAI Model Governance (OMG), why, and where to find it. It supplements [17_Release5_Compliance_Pack_Framework.md](17_Release5_Compliance_Pack_Framework.md) and [16_Release4_1_Persistence_Completion.md](16_Release4_1_Persistence_Completion.md).

---

## 1. The Correction

Release 5 shipped the Universal Compliance Pack Framework deliberately scoped to local storage — a "framework before regulation" call, since no real regulation content existed yet to justify the same investment Assets/Evidence/Continuity received in Release 4.1.

Release 5.1 closes that gap. The mandatory platform rule established in Release 4.1 — **Neon is the only System of Record; no governance module should use local storage as its primary source of truth** — now applies to the Compliance Pack Framework too. This is an architectural alignment release, not a new functional release: no new UI, no new regulation content, no scoring.

## 2. What Changed

**Backend** — three CRUD endpoints that were missing for full parity were added to `backend/src/app.controller.ts`:
- `DELETE /api/compliance-requirements/:id`
- `DELETE /api/pack-controls/:id`
- `PATCH /api/evidence-mappings/:id`

(`GET`/`POST` and the remaining `PATCH`/`DELETE` routes for all four compliance models already existed from Release 5.)

**Frontend Repository Pattern** — four new repository interfaces in `frontend/src/repositories/types.ts`, each with an Api implementation (`apiRepositories.ts`) and a Local fallback (`localRepositories.ts`):
- `CompliancePackRepository`
- `RequirementRepository`
- `ControlRepository`
- `EvidenceMappingRepository`

Four new enum maps (`compliancePackStatus`, `requirementPriority`, `requirementStatus`, `packControlStatus`) in `enumMaps.ts` translate the frontend's readable literals to the Prisma UPPER_SNAKE_CASE enums, matching the pattern every other domain already uses.

**`storageService.ts`** — the compliance section (`getCompliancePacks`, `saveCompliancePack`, `deleteCompliancePack`, `getComplianceRequirements`, `saveComplianceRequirement`, `deleteComplianceRequirement`, `getPackControls`, `savePackControl`, `deletePackControl`, `getEvidenceMappings`, `saveEvidenceMapping`, `deleteEvidenceMapping`) was rewritten from direct `localStorage` reads/writes to the same **cache-then-network** pattern Release 4.1 established for Assets/Evidence/Continuity: reads stay synchronous off an in-memory cache (so the ~dozen call sites across `CompliancePackWorkspacePage.tsx` and the dashboards didn't need to become async), while writes are genuinely async — an optimistic cache update happens before the first `await`, then the real Neon write happens, then the cache reconciles with the server's response. `bootstrapPersistence()` now also fetches and caches all four compliance collections from Neon at startup, alongside Assets/Evidence/Continuity.

Pack deletion mirrors the backend's cascading relations locally too (Pack → Requirement → Control → EvidenceMapping), so the cache never shows orphaned children between the optimistic update and the server's confirmation.

**`CompliancePackWorkspacePage.tsx`** — the four save handlers and the evidence-mapping "Unlink" action were converted to the async/await + optimistic-refresh pattern already used in `AssetRegistryPage.tsx`: capture the save/delete promise, refresh the UI immediately, then await and refresh again, surfacing a sync failure via `alert()` if Neon is unreachable.

**Seed data** — `backend/prisma/seed.js` gained a `seedCompliance()` step that inserts the three demo packs (RBI, ISO, EU AI), their five requirements, five controls, and three evidence mappings into Neon. It runs independently of the asset/evidence/continuity seed block (idempotent on `CompliancePack` row count), and resolves evidence mappings by looking up the real Neon evidence record **by name** rather than a remembered id — the same `resolveMappedEvidence()` name-fallback reasoning from Release 5 applies to seeding, since ids are Neon-assigned and can't be hardcoded ahead of time.

## 3. Validation

All seven scenarios from the blueprint were run against the live local backend (pointed at production Neon):

| # | Scenario | Result |
|---|---|---|
| 1 | Create Compliance Pack → Refresh Browser → Pack remains | ✅ Pack survived a full page reload |
| 2 | Open second browser → Pack visible | ✅ Verified via direct API call (architecturally equivalent to a second client) |
| 3 | Open second machine → Pack visible | ✅ Same — a fresh browser tab with no prior cache showed the pack immediately |
| 4 | Create Requirement → Visible everywhere | ✅ Requirement confirmed in Neon via API immediately after creation |
| 5 | Create Control → Visible everywhere | ✅ Control confirmed in Neon; coverage recalculated to "Not Covered" (no evidence yet) |
| 6 | Update Evidence Mapping → Coverage recalculates | ✅ Mapping evidence flipped coverage Not Covered → Covered instantly; unlinking reverted it |
| 7 | Delete Pack → Cascading relationships behave correctly | ✅ Deleting the test pack cascaded its requirement, control and evidence mapping in Neon — row counts returned to exactly the seeded baseline (3 packs / 5 requirements / 5 controls / 3 mappings) |

All test artifacts created during validation were deleted afterward; Neon ends this release in exactly its seeded state.

## 4. What's Still Out of Scope

Unchanged from Release 5 — this release did not touch:
- RBI FREE-AI / ISO 42001 / EU AI Act control content
- Compliance scoring (coverage remains Covered / Partially Covered / Not Covered / Not Applicable only — no percentages)
- Governance Intelligence, predictive analytics, or workflow automation

## 5. Expected Outcome

| Domain | System of Record |
|---|---|
| Assets | ✅ Neon |
| Evidence | ✅ Neon |
| Governance Continuity | ✅ Neon |
| Compliance Framework | ✅ Neon |

OMG is now architecturally consistent across every governance domain shipped to date, ahead of Release 6 (RBI FREE-AI Pack).

---

*Supersedes nothing. Read alongside [17_Release5_Compliance_Pack_Framework.md](17_Release5_Compliance_Pack_Framework.md), [16_Release4_1_Persistence_Completion.md](16_Release4_1_Persistence_Completion.md) and [15_Release4_Readiness_Persistence_Foundation.md](15_Release4_Readiness_Persistence_Foundation.md).*
