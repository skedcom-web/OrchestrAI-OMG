# OMG Release 4 — Readiness & Persistence Foundation
> **Release 4 Guide · Production Readiness Guide · Persistence Architecture Guide**

This document records what Release 4 added to OrchestrAI Model Governance (OMG), why, and where to find it in the product. It supplements — and does not replace — the Phase 1-10 documents and the [Release 1](12_Release1_Governance_Authority_Foundation.md) / [Release 2](13_Release2_Governance_Continuity_Foundation.md) / [Release 3](14_Release3_Evidence_Foundation.md) addenda in this directory.

Release 4 answers two questions: **Is governance complete and ready?** (Workstream A — Readiness Foundation) and **Can OMG operate as a real system of record?** (Workstream B — Persistence Foundation).

---

# Part 1 — Release 4 Guide

## Readiness Foundation (Workstream A)

Four readiness dimensions, each evaluated per asset and rolled up for the portfolio. Every dimension outputs one of exactly three values — **Ready**, **Partially Ready**, **Not Ready** — never a score.

| Dimension | Evaluates | Ready when |
|---|---|---|
| Governance Readiness | Ownership assigned, oversight assigned, autonomy assigned, governance state valid | All four criteria pass |
| Evidence Readiness | Evidence exists, evidence ownership exists, evidence not expired | All three criteria pass |
| Review Readiness | Reviews scheduled, reviews completed, reassessments up to date | All three criteria pass |
| Audit Readiness | Governance records available, evidence available, traceability available | All three criteria pass |

**Gap Detection** names exactly what's missing, per asset: Missing Owner, Missing Oversight, Missing Autonomy, Missing Evidence, Expired Evidence, Missing Review, Missing Reauthorization.

### Where to look
- **Asset Detail** (`/assets`): a Readiness section (all four dimensions) and a Gap Summary, below Governance Continuity and Linked Evidence.
- **Evidence Detail** (`/evidence-registry`): Readiness Contribution (does this specific record count toward its asset's readiness right now?) and Linked Governance Objects.
- **Executive Dashboard** (`/dashboard`): a Readiness Summary (all four dimensions, portfolio-wide) and a Readiness Gaps list.
- **Executive Governance Hub** (`/executive-hub`): a Readiness Overview covering Governance, Evidence and Audit Readiness (Review Readiness is deliberately Dashboard-only, per the blueprint's own scoping).

Implementation: `frontend/src/config/readinessFoundation.ts` holds the pure compute functions (data in, data out — they don't read storage themselves, so they work unchanged if the data ever comes from the API instead of local storage).

## Experience Alignment

The viewer journey message was replaced (not extended) with Release 4's own message: *Know what AI exists → Assign accountability → Maintain governance continuity → Capture supporting evidence → Measure governance readiness → Identify governance gaps → Prepare for audits.* The guided tour grew from 21 to **25 steps**, adding Readiness Center, Readiness Status, Gap Detection and Audit Readiness.

---

# Part 2 — Persistence Architecture Guide

## Strategic principle: Demo = Production Architecture

Domain models, navigation, screens, workflows and the governance lifecycle are identical in both modes. **Only the storage provider changes.**

## Repository Pattern

`frontend/src/repositories/` defines three repository interfaces — `AssetRepository`, `EvidenceRepository`, `GovernanceRepository` (the latter covering Reassessment Triggers, Reauthorization Records and the Review Schedule together, as "governance data") — each with two real implementations:

- **`localRepositories.ts`** — thin async wrappers over the existing, unchanged `storageService.ts`. This is Demo Mode: identical behaviour to every prior release.
- **`apiRepositories.ts`** — real HTTP calls to the NestJS backend, via `apiClient.ts` (same base-URL convention as the existing `services/api.ts`, `x-user-role` header sourced from the same `omg_auth_user` localStorage key `AuthContext` writes). This is Production Mode.

`repositories/index.ts` is the factory: `getDataMode()` / `setDataMode()` persist the active mode (`'demo' | 'production'`, default `'demo'`) and `getAssetRepository()` / `getEvidenceRepository()` / `getGovernanceRepository()` return whichever implementation is active.

Enum and shape translation between the frontend's readable string literals (`'Human-in-Command'`) and the backend's Prisma enums (`HUMAN_IN_COMMAND`) lives in `repositories/enumMaps.ts`, `assetMapper.ts` and `evidenceMapper.ts` — the single place this translation happens, so the repository implementations themselves stay simple pass-throughs.

## Backend CRUD API

`backend/src/app.controller.ts` gained full CRUD for the three domains, following the file's existing single-controller convention and RBAC pattern (`@Roles` per endpoint, same fail-closed `RolesGuard`):

- **Assets**: `GET/POST /api/assets`, `GET/PATCH/DELETE /api/assets/:id`
- **Evidence**: `GET/POST /api/evidence-records`, `GET/PATCH/DELETE /api/evidence-records/:id`
- **Continuity**: `GET/POST /api/reassessment-triggers`, `PATCH /api/reassessment-triggers/:id`; `GET/POST /api/reauthorization-records`; `PATCH /api/monitoring/reviews/:id` (reviews reuse the existing Phase 7 `GET/POST /api/monitoring/reviews`)

All verified locally with a full create → read → update → delete cycle against the live Neon database before being wired into the frontend.

### Schema notes
`AIAsset` gained `ownershipJson` (a JSON column holding the free-text five-role Ownership Matrix — the legacy `AssetOwner` relation expects real `User` rows, which demo/API ownership by name doesn't have) and three scalar columns completing the Authority Profile as flat, API-writable fields: `authorityRiskOwner`, `authorityTechnicalOwner`, `authorityComplianceOwner` (Release 1 had already added the other five). `EvidenceRecord` needed no changes — Release 3 already designed it flat, matching the frontend type field-for-field.

## Data Migration Utility

**Local Storage → Neon.** `frontend/src/services/migrationService.ts` reads every local asset, evidence record, reassessment trigger, reauthorization record and scheduled review, and creates each one via the Api repositories — always writing through the API regardless of the current Data Mode. Assets get new backend-assigned ids; every dependent record is re-pointed at the new id so referential integrity survives the move. Exposed as a one-click action in **Tenant Settings → System of Record**, with a live result summary and per-record error reporting.

## Demo Mode and Product Mode

**Tenant Settings** (`/tenant-settings`) gained a System of Record section: the Demo Tenant identity ("OMG Demo Organization"), a Data Mode toggle, a backend connection health check, and the Migration Utility. Demo Mode remains the default — every existing page keeps working exactly as it always has. Multi-tenant support for a real customer (a bank, an insurer, an enterprise customer) is prepared by this architecture, not yet active.

---

# Part 3 — Production Readiness Guide

## What "production-ready" means today, and what it doesn't yet

**Ready today:**
- A complete, tested, RBAC-guarded CRUD API for Assets, Evidence and Continuity records, backed by Neon.
- A working Repository Pattern with interchangeable Local/Api implementations.
- A working, verified Local → Neon migration path.
- Readiness and gap detection that works identically regardless of where the data ultimately comes from.

**Deliberately not done in this release** (tracked, not hidden):
- **Individual pages are not yet wired to call the Api repository live.** Switching a tenant to Production Mode today enables the Migration Utility and the connection check; it does not yet make the Asset Registry, Evidence Registry, or Continuity screens read and write through the API by default. Converting ~15+ pages from synchronous local-storage reads to async API calls, with proper loading and error states, is real, substantial engineering — the next scoped increment, not a checkbox.
- **Real authentication.** `RolesGuard` still trusts a client-supplied `x-user-role` header (see its own doc comment); a determined caller can claim any role. Real auth (signed session or JWT, server-resolved role) is a prerequisite for genuinely opening Production Mode to a real customer.
- **Multi-tenancy.** The schema and API are single-tenant today. The Demo Tenant / Customer Tenant split described in this release is a naming convention, not an enforced boundary.

This scoping is deliberate: forcing every page onto async API calls in one pass risked breaking the working demo the moment anything went wrong, which conflicts with the standing instruction to keep demo/production deviation minimal and predictable. The safer sequence is: solid backend + solid repository layer + a working migration path (this release), then incremental per-page cutover once each page's loading/error states can be verified individually.

---

*Supersedes nothing. Read alongside [12_Release1_Governance_Authority_Foundation.md](12_Release1_Governance_Authority_Foundation.md), [13_Release2_Governance_Continuity_Foundation.md](13_Release2_Governance_Continuity_Foundation.md), [14_Release3_Evidence_Foundation.md](14_Release3_Evidence_Foundation.md) and [02_Functional_Requirements_Specification.md](02_Functional_Requirements_Specification.md).*
