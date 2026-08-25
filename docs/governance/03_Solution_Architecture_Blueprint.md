# ODF Deliverable 03: Solution Architecture Blueprint
> **OrchestrAI Model Governance (OMG) Enterprise Platform**
> **Framework Standard**: ODF Universal Governance Standard v1.0
> **Version**: 2.0 — Core Platform v1.0 Complete (Releases 1–10 + Final Strategic Positioning)

---

## 1. System Architecture Overview

```
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                          BROWSER TIER (React SPA)                       │
 │  React 19 + TypeScript 6 + Vite 8, 62 pages, 35 components, 3 contexts  │
 │  navigation.ts — 9 domains, 56 modules, single source for sidebar,      │
 │  breadcrumbs, command palette and the RBAC matrix                       │
 │                                   │                                     │
 │  Repository Pattern (20 factories, Api-first since Release 6)           │
 │  Cache-then-network: reads synchronous from cache; writes persist,      │
 │  then reconcile with the server response                                │
 │                                   │                                     │
 │  localStorage — 38 keys — paint-fast cache + offline fallback only,     │
 │  never the primary record for the domains it backs                     │
 └───────────────────────────────────┬───────────────────────────────────┘
                                      │ HTTPS / REST, x-user-role header
 ┌───────────────────────────────────▼───────────────────────────────────┐
 │                       SERVER TIER (NestJS API)                        │
 │  1 controller, 85 endpoints, 785 lines — main.ts, app.module.ts,      │
 │  app.controller.ts, prisma.service.ts, auth/roles.guard.ts,           │
 │  auth/roles.decorator.ts                                              │
 │  RolesGuard: fails closed, validates against the Prisma UserRole      │
 │  enum, no super-user bypass, denials logged                            │
 └───────────────────────────────────┬───────────────────────────────────┘
                                      │ Prisma Client 6.19 (ORM)
 ┌───────────────────────────────────▼───────────────────────────────────┐
 │                    DATA TIER (Neon Serverless PostgreSQL)             │
 │  44 models · 42 enums · 51 relations · 0 secondary indexes            │
 │  AIAsset is the hub — 15+ child relations cascade on delete           │
 └─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Frontend Application
- **Core framework**: React 19.2 + TypeScript 6.0.
- **Build tooling**: Vite 8.2, `@tailwindcss/vite` for utility styling.
- **Routing**: React Router DOM 7.18, 59 governed routes.
- **State management**: no external state library — three React Contexts (Auth, Theme, Experience) plus local component state.
- **Design system**: token-based (CSS custom properties in `tokens.css`), three themes — light, dark, glass.
- **Dependency surface**: deliberately small — only `react`, `react-dom` and `react-router-dom` as runtime dependencies. No UI kit, no chart library.

### Backend API Server
- **Core framework**: NestJS 11.0 (Express HTTP adapter).
- **ORM**: Prisma Client 6.19.
- **Authorisation**: a single `RolesGuard` reading `@Roles(...)` metadata, applied per endpoint.
- **Footprint**: the entire backend is 6 files and 946 lines — the domain logic lives in the frontend's derivation layers, not the API.

### Data Layer
- **Database**: Neon serverless PostgreSQL (managed via `DATABASE_URL`, never committed to the repository).
- **Schema management**: Prisma migrations (`prisma db push`), verified in sync with Neon after every release.

### Hosting & Cloud Infrastructure
- **Frontend hosting**: Firebase Hosting.
- **Backend hosting**: Render.com Web Service.
- **Database**: Neon serverless PostgreSQL.
- **Source control**: GitHub (`skedcom-web/OrchestrAI-OMG`).

---

## 3. Frontend Derivation Layers

Governance state is computed, not typed in. Three layers sit between persistence and the UI:

1. **`storageService.ts`** — persistence orchestration and the Repository Pattern's cache-then-network logic (3,486 lines).
2. **Reasoning and derivation engines** — `governanceReasoningEngine.ts`, `governanceActionsEngine.ts`, `decisionTraceabilityEngine.ts`, `regulatoryKnowledgeEngine.ts`, `compliancePackFramework.ts`, `readinessFoundation.ts` — pure, data-in/data-out functions introduced across Releases 1–10.
3. **`executiveGovernance.ts`** — aggregation, scorecards and report generation (734 lines).

---

## 4. Integration & Persistence Design

- **Repository Pattern**: every governance domain since Release 6 is Api-first — the Local (localStorage) implementation exists only as a fallback utility, never selected by default.
- **What is genuinely server-persisted**: roughly 26 of the platform's 44 data models — every domain from Release 4 onward (Assets, Evidence, Continuity, the Compliance Pack Framework, the Regulatory Knowledge Engine, Governance Intelligence, Governance Actions, and the Governance Intelligence Studio).
- **What remains client-side only**: the audit log, plus the earlier Risk Assessment, Validation, Decision, Policy (Phase 9) and Change (Phase 10) and Operations domains — roughly 18 models — pending a write API (see [09_Production_Readiness_Assessment.md](09_Production_Readiness_Assessment.md)).
- **CORS**: an explicit allow-list (`CORS_ORIGINS` environment variable, defaulting to the production Firebase Hosting origin and localhost for development) — not an open policy.

---

## 5. Hosting Architecture

| Tier | Provider | Notes |
|---|---|---|
| Frontend | Firebase Hosting | Static SPA build (`frontend/dist`), SPA rewrite to `index.html` |
| Backend API | Render.com | NestJS service, build `prisma generate && nest build`, start `node dist/main` |
| Database | Neon | Serverless PostgreSQL, connection string via `DATABASE_URL` |

See [08_Deployment_Blueprint.md](08_Deployment_Blueprint.md) for the deployment workflow and rollback strategy.
