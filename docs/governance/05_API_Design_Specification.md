# ODF Deliverable 05: API Design Specification
> **OrchestrAI Model Governance (OMG) Enterprise Platform**
> **Framework Standard**: ODF Universal Governance Standard v1.0
> **Version**: 2.0 — Core Platform v1.0 Complete (Releases 1–10 + Final Strategic Positioning)

---

## 1. API Surface Overview

A single NestJS controller (`app.controller.ts`, 785 lines) exposes **85 REST endpoints** under the `/api` prefix, organised by governance domain. All routes follow the same pattern — `GET` (list/detail), `POST` (create), `PATCH` (update), and `DELETE` where the domain supports deletion.

| Domain | Base routes | Verbs |
|---|---|---|
| Health | `/api/health` | GET |
| Assets | `/api/assets` | GET, POST, PATCH, DELETE |
| Evidence Records | `/api/evidence-records` | GET, POST, PATCH, DELETE |
| Continuity | `/api/reassessment-triggers`, `/api/reauthorization-records` | GET, POST, PATCH |
| Compliance Pack Framework | `/api/compliance-packs`, `/api/compliance-requirements`, `/api/pack-controls`, `/api/evidence-mappings` | GET, POST, PATCH, DELETE |
| Regulatory Knowledge Engine | `/api/regulatory-sources`, `/api/regulatory-requirements`, `/api/obligations`, `/api/obligation-controls`, `/api/obligation-evidence-mappings` | GET, POST, PATCH, DELETE |
| Governance Intelligence | `/api/governance-policies`, `/api/governance-findings`, `/api/recommended-actions` | GET, POST, PATCH, DELETE |
| Governance Intelligence Studio | `/api/condition-definitions`, `/api/outcome-rules` (no DELETE — fixed catalogues), `/api/action-rules`, `/api/governance-profiles` (no DELETE) | GET, POST, PATCH, (DELETE on action-rules only) |
| Monitoring | `/api/monitoring/alerts`, `/api/monitoring/reviews`, `/api/monitoring/corrective-actions` | GET, POST, PATCH |
| Administration | `/api/users` | GET |
| Audit | `/api/audit-logs` | GET |

**Not yet exposed**: write endpoints for RiskAssessment, ValidationRecord, DecisionRecord, the Phase 9 Policy domain, the Phase 10 Change domain, and the Operations console (KillSwitchRecord, OverrideRecord, GovernanceIncident, RetirementRecord) — these remain client-side only pending future release work.

---

## 2. Request & Response Models

Every domain follows the same envelope shape. Example — Governance Intelligence Studio's `ConditionDefinition`:

**`GET /api/condition-definitions`**
```json
[
  {
    "id": "cond-evidence-expired",
    "conditionType": "EVIDENCE_EXPIRED",
    "label": "Evidence Expired",
    "description": "One or more evidence records supporting this asset have passed their expiry date.",
    "defaultSeverity": "HIGH",
    "enabled": true,
    "createdAt": "2026-08-24T00:00:00.000Z",
    "updatedAt": "2026-08-24T00:00:00.000Z"
  }
]
```

**`PATCH /api/condition-definitions/:id`** — request body accepts any subset of writable fields (e.g. `{ "enabled": false }`); response is the updated row.

Enum values are transmitted in their backend `UPPER_SNAKE_CASE` form (matching the Prisma schema) and translated to frontend-readable strings (e.g. `"Evidence Expired"`) by a dedicated `enumMaps.ts` mapping layer in the frontend Repository Pattern — the API itself is enum-canonical, not string-loose.

---

## 3. Authentication & Authorisation Requirements

- **Authorisation**: every data-bearing endpoint declares required roles via `@Roles(...)` metadata, enforced by `RolesGuard`. The guard fails closed — a missing, malformed or unrecognised role claim is denied (403), and there is no implicit super-user bypass.
- **Role claim transport**: the caller's role is supplied via the `x-user-role` request header.
- **Authentication**: **not yet implemented**. The role claim is not cryptographically verified — a caller can currently assert any role via the header. This is authorisation, not authentication, and is documented as the highest-priority open item in [06_Security_Review_Document.md](06_Security_Review_Document.md) and [09_Production_Readiness_Assessment.md](09_Production_Readiness_Assessment.md).
- **CORS**: an explicit origin allow-list (`CORS_ORIGINS` environment variable), not an open policy.

---

## 4. Error Handling

Standard NestJS HTTP exception shape, returned as JSON:

**Missing role claim**
```json
{
  "statusCode": 403,
  "message": "A role claim is required for this endpoint. Supply the x-user-role header.",
  "error": "Forbidden"
}
```

**Unrecognised role**
```json
{
  "statusCode": 403,
  "message": "Unrecognised role claim.",
  "error": "Forbidden"
}
```

**Role not authorised for this endpoint**
```json
{
  "statusCode": 403,
  "message": "Your role is not authorised for this endpoint.",
  "error": "Forbidden"
}
```

Every denial is logged server-side (`RolesGuard`'s internal logger) with the method, URL and the claimed role, before the 403 is returned.

---

*Source of truth: `backend/src/app.controller.ts` (route declarations), `backend/src/auth/roles.guard.ts` (authorisation logic).*
