# ODF Deliverable 06: Security Review Document
> **OrchestrAI Model Governance (OMG) Enterprise Platform**  
> **Framework Standard**: ODF Universal Governance Standard v1.0  
> **Version**: 1.0 (Phases 1 - 6 Approved Baseline)  

---

## 1. Authentication & Role-Based Authorization Model

### Persona Switcher & AuthContext
OMG enforces role-based security via `AuthContext` and custom NestJS `@Roles(...)` metadata decorators enforced by `RolesGuard`.

### Standardized 7 Governance Roles Matrix
1. **`SUPER_ADMIN`**: Full platform authority, kill switch engagement, user management, policy updates.
2. **`GOVERNANCE_ADMIN`**: Governance score oversight, decision execution, blocker resolution.
3. **`RISK_OFFICER`**: Risk Wizard execution, risk tier classification, risk blocker review.
4. **`BUSINESS_OWNER`**: Asset registration, RACIS ownership assignment, evidence upload.
5. **`VALIDATOR`**: Multi-discipline validation scorecards (`/validation`, `/review-workbench`).
6. **`AUDITOR`**: Read-only compliance inspection, RBI control audit, immutable audit log review.
7. **`VIEWER`**: Executive dashboard visibility only.

---

## 2. Data Protection & Secrets Handling
- **Database Transport Encryption**: Enforced SSL Mode (`sslmode=require`) on Neon Cloud PostgreSQL connection string.
- **Data Sensitivity Classifications**: Assets tagged with data sensitivity (`Public`, `Internal`, `Confidential`, `Restricted`, `PII/Sensitive`). `PII/Sensitive` assets trigger mandatory `POL-101` Information Security compliance checks.
- **Zero Secrets in Codebase**: Environment variables managed via `.env` files; zero hardcoded passwords or API keys.

---

## 3. Threat Model & Mitigation Rationale
- **Unauthorized Decision Execution**: Guarded by `ProtectedRoute` and `RolesGuard`.
- **Bypassing Kill Switch**: Kill Switch activation immediately writes an immutable audit record and updates DB operational status to `Suspended`.
- **Audit Trail Tampering**: Audit logs are append-only.
