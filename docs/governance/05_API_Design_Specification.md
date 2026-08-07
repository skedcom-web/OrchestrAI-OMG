# ODF Deliverable 05: API Design Specification
> **OrchestrAI Model Governance (OMG) Enterprise Platform**  
> **Framework Standard**: ODF Universal Governance Standard v1.0  
> **Version**: 1.0 (Phases 1 - 6 Approved Baseline)  

---

## 1. REST API Endpoint Directory

### System & Health
- **`GET /api/health`**: Returns application status, active phase (`Phase 6`), and ISO timestamp.

### AI Assets Management
- **`GET /api/assets`**: Fetches all registered AI assets with populated relations (*owners, validations, evidence, findings, compliance, killSwitches*).
- **`POST /api/assets`**: Creates a new AI asset record.
- **`PUT /api/assets/:id`**: Updates metadata or operational status of an asset.

### Compliance & Regulatory Intelligence (Phase 5)
- **`GET /api/compliance/assessments`**: Fetches all RBI & policy control assessment records.
- **`POST /api/compliance/assessments`**: Records an evaluation (`Compliant`, `Partially Compliant`, `Non-Compliant`) for a control. Restricted to `@Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER', 'AUDITOR')`.

### Operational Governance & Kill Switch (Phase 6)
- **`GET /api/operations/kill-switches`**: Fetches active and historical kill switch suspension events.
- **`POST /api/operations/kill-switches`**: Engages emergency circuit breaker for an asset, setting operational status to `Suspended`. Restricted to `@Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')`.
- **`GET /api/operations/overrides`**: Fetches human override records.
- **`GET /api/operations/incidents`**: Fetches governance incidents.

### User Management & RBAC
- **`GET /api/users`**: Fetches user directory and role assignments.

### Audit Trail
- **`GET /api/audit-logs`**: Fetches top 50 recent audit logs. Restricted to `@Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER', 'AUDITOR')`.

---

## 2. Standardized Request & Response Structures

### Standard Success Response
```json
{
  "status": "OPERATIONAL",
  "app": "OrchestrAI Model Governance (OMG)",
  "version": "Phase 6 (Operational Governance & Kill Switch Center)",
  "timestamp": "2026-08-07T17:00:00.000Z"
}
```

### Standard Error Response
```json
{
  "statusCode": 403,
  "message": "Forbidden resource. Role AUDITOR is not authorized to engage Kill Switch.",
  "error": "Forbidden"
}
```
