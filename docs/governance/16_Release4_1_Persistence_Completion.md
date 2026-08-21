# OMG Release 4.1 — Persistence Completion & Production Data Foundation
> **Critical Clarification, Implemented**

This document records what Release 4.1 changed, why, and how it was verified. It corrects and completes the persistence work started in [Release 4](15_Release4_Readiness_Persistence_Foundation.md).

---

## 1. The Clarification

Release 4 built a real backend API and a real Repository Pattern, but left every page reading and writing through `localStorage` by default, with the API path opt-in via a "Data Mode" toggle. Release 4.1's blueprint corrected the premise directly:

> "Demo Mode does NOT mean local storage. Demo Mode means seeded data in the real production database. There is only ONE persistence architecture."

Both Demo Mode and Production Mode are `Frontend → API → Backend → Prisma → Neon`. They differ only in **whose data** is in Neon (seeded vs. customer), never in the code path. Release 4.1 makes that literally true.

## 2. What Changed

### Neon is seeded, for real
`backend/prisma/seed.js` (idempotent — a no-op if `AIAsset` already has rows) populated the live Neon database with the same demo dataset that used to live only in `frontend/src/services/mockData.ts`: 7 users, 6 AI assets carrying full Release 1-3 governance data, 12 evidence records, 2 reassessment triggers, 1 reauthorization record, 2 scheduled reviews. This is not test data to be cleaned up — it's the actual seeded content the demo now runs on.

### `storageService.ts` is API-first, with a cache — not local-storage-first
Every page in the app calls `getAssets()`, `getEvidenceRecords()`, `getReassessmentTriggers()`, `getReauthorizationRecords()`, and `getScheduledReviews()` synchronously — dozens of call sites across ~40 files, none of which could be safely rewritten to `async`/`await` in one pass without risking the whole app. The fix: these reads stay synchronous, backed by an **in-memory cache** that `bootstrapPersistence()` fills from the live API the moment the app loads (fired once at module load, non-blocking). `localStorage` still gets a mirror write, but purely as the "UI cache / offline fallback" Release 4.1 explicitly allows — never consulted as the source of truth once Neon has answered.

Writes (`saveAsset`, `deleteAsset`, `saveEvidenceRecord`, `deleteEvidenceRecord`, `saveReassessmentTrigger`, `saveReauthorizationRecord`, `saveScheduledReview`) now: update the cache optimistically (so the UI reflects the change instantly), then `await` the real API call, then reconcile the cache with whatever Neon actually stored (including the server-assigned id). They return `Promise`s and reject on failure — a Neon write failure is no longer silently swallowed.

The three primary CRUD surfaces named in the blueprint — Asset Registry, Evidence Registry, Review Calendar — now `await` their save/delete calls and surface a clear error if the Neon write fails, rather than assuming success.

Internal, secondary asset updates that were never the primary workflow (recalculating `validationScore` after a validation is approved, flipping `operationalStatus` on a kill-switch event, etc.) still call `saveAsset()` but don't block their caller on it — the synchronous cache update lands immediately either way, and a failed background sync is logged rather than silently lost. This kept the change contained to the domains Release 4.1 actually scoped (Assets, Evidence, Continuity) instead of cascading into validation, compliance, incidents, and retirement, which were never asked for.

### Tenant Settings reflects the corrected model
The "Data Mode: Demo / Production" toggle is gone — it implied a real architectural fork that no longer exists. In its place: a fixed "Persistence: Neon PostgreSQL" indicator, a connection health check, a "Reload from Neon" button (forces a fresh `bootstrapPersistence()`), and the Data Migration Utility — repositioned as a recovery tool for anything that only made it as far as the local cache, not the primary way data gets to Neon.

## 3. Validation

All five tests named in the blueprint were run against the live Neon database (via a local backend instance, since the deployed Render backend won't carry this code until pushed):

| Test | Result |
|---|---|
| Create asset → refresh browser → asset remains | ✅ Verified in-browser |
| Open second browser → asset visible | ✅ Verified via direct API query (equivalent to a second client) |
| Open second machine → asset visible | ✅ Same — the API has no client-affinity, any caller sees the same Neon row |
| Create evidence → visible everywhere | ✅ Verified in-browser + API query |
| Create review → visible everywhere | ✅ Verified in-browser + API query |

Test artifacts (one asset, one evidence record, one review created purely to run these checks) were deleted afterward — Neon was confirmed back at exactly the seeded counts (6 assets / 12 evidence / 2 triggers / 1 reauthorization / 2 reviews) before this release was considered done.

## 4. What's Still Deliberately Out

- **Dashboards "reading live API data"** (named in scope) means the same thing it means everywhere else in this release: through the cache, which is filled from the API. A dashboard mounted before `bootstrapPersistence()` resolves shows the cache's state at that instant, not a live subscription — the next navigation picks up whatever the cache holds by then. A full reactive store (so an already-open page updates the moment new data arrives) is a larger change than this release scoped.
- Real authentication and multi-tenancy remain open, as documented in Release 4's own Production Readiness Guide — unchanged by this release.

---

*Supersedes the "Data Mode" toggle described in [15_Release4_Readiness_Persistence_Foundation.md](15_Release4_Readiness_Persistence_Foundation.md) — read that document for everything else about the Repository Pattern and CRUD API, which are unchanged.*
