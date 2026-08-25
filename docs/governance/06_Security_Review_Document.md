# ODF Deliverable 06: Security Review Document
> **OrchestrAI Model Governance (OMG) Enterprise Platform**
> **Framework Standard**: ODF Universal Governance Standard v1.0
> **Version**: 2.0 — Core Platform v1.0 Complete (Releases 1–10 + Final Strategic Positioning)

---

## 1. Authentication Model

**Current state: authorisation only, not authentication.** There is no password field, credential store, or session/token issuance anywhere in the codebase. The frontend's persona switcher selects a role for the demo experience; the backend trusts whatever role is presented in the `x-user-role` request header.

This is a deliberate, documented gap rather than an oversight — it is the top-ranked item in both the [09_Production_Readiness_Assessment.md](09_Production_Readiness_Assessment.md) and the technical roadmap. **A caller who can reach the API can currently assert any role.** Closing this gap requires credential verification issuing a signed session or JWT, with the role resolved server-side from the authenticated user record rather than trusted from a header — before the platform is exposed to untrusted clients or multiple real users sharing one deployment.

---

## 2. Authorisation Model

- **Mechanism**: NestJS `RolesGuard`, applied via `@Roles(...)` decorator metadata on every data-bearing endpoint across all 85 API routes.
- **Fail-closed design**: a missing role header, a role claim outside the Prisma `UserRole` enum, or a role not listed in the endpoint's required roles is denied with HTTP 403 — the guard never admits by default.
- **No super-user bypass**: `SUPER_ADMIN` is granted access only where an endpoint's `@Roles(...)` list explicitly includes it, exactly like every other role — there is no implicit "admin sees everything" shortcut in the guard itself.
- **Denial logging**: every denied request is logged server-side with the method, URL and the claimed role.
- **Client-side layer**: `navigation.ts` declares every route as an RBAC key; each persona carries an `allowedNav` list, enforced at the route boundary by `ProtectedRoute`. This is a UX-layer guard (it prevents accidental navigation) and is not a substitute for server-side enforcement — the client can be bypassed by calling the API directly, which is exactly why the server-side `RolesGuard` exists independently.
- **Seven role types**: `SUPER_ADMIN`, `GOVERNANCE_ADMIN`, `RISK_OFFICER`, `BUSINESS_OWNER`, `VALIDATOR`, `AUDITOR`, `VIEWER` — defined once in the Prisma `UserRole` enum and consumed by both the guard and the frontend's navigation config, so the two cannot drift apart.

---

## 3. Data Protection

- **Transport**: all traffic to Firebase Hosting, Render, and Neon is HTTPS/TLS by default on each managed platform.
- **Database connection**: Neon's connection string is supplied exclusively via the `DATABASE_URL` environment variable and is never committed to source control.
- **CORS**: an explicit origin allow-list (`CORS_ORIGINS` environment variable, defaulting to the production Hosting origin and localhost for development), not an open `*` policy.
- **Data sensitivity classification**: every AI asset carries a `dataSensitivity` field (default `"Confidential"`), letting the registry distinguish PII/sensitive assets from general internal ones.

---

## 4. Secrets Handling

- `.env` and `.env.local` are excluded from source control via `.gitignore`.
- No hardcoded credentials, API keys, or connection strings exist in the application source (`backend/src`, `frontend/src`).
- Backend runtime secrets (`DATABASE_URL`, `CORS_ORIGINS`, `PORT`) are read exclusively from `process.env` at startup.
- Frontend build-time configuration (`VITE_API_URL`) is read via `import.meta.env`, defaulting to the production Render URL when unset.

---

## 5. Security Risks & Mitigation Strategy

| Risk | Current Mitigation | Residual Exposure |
|---|---|---|
| Unauthenticated role assertion | RolesGuard fails closed on every endpoint; denials logged | The role claim itself is not cryptographically verified — see §1 |
| Cross-origin abuse | Explicit CORS allow-list, not open | Allow-list must be kept current as new frontend origins are added |
| Audit trail tampering | Audit entries are append-only by application convention — no update/delete code path exists | The audit log is still written to browser localStorage (see [03_Solution_Architecture_Blueprint.md](03_Solution_Architecture_Blueprint.md)); a user with developer tools access could edit or clear local entries, and timestamps/IP are client-generated, not server-issued |
| Unindexed query surface | N/A — this is a performance/availability risk, not a confidentiality risk | Zero secondary database indexes exist today; see [09_Production_Readiness_Assessment.md](09_Production_Readiness_Assessment.md) |
| Secret leakage | `.env`/`.env.local` gitignored; no hardcoded secrets found in source | Standard operational discipline (secret rotation, least-privilege DB credentials) remains an operator responsibility outside this codebase's scope |

---

## 6. Priority Remediation

1. **Server-side authentication** — signed session or JWT, credential verification, role resolved from the authenticated user record. Closes the RolesGuard residual described in §1.
2. **Move audit log writes server-side** — server-issued timestamps, real client IP capture, and database-level append-only enforcement, closing the localStorage tamper surface described in §5.
3. **Database indexing** — index every foreign key and common filter column before any volume load, both for performance and to reduce the blast radius of slow/expensive queries.

*Full sequencing and rationale: [09_Production_Readiness_Assessment.md](09_Production_Readiness_Assessment.md).*
