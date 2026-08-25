# ODF Deliverable 04: Database Design Document
> **OrchestrAI Model Governance (OMG) Enterprise Platform**
> **Framework Standard**: ODF Universal Governance Standard v1.0
> **Version**: 2.0 — Core Platform v1.0 Complete (Releases 1–10 + Final Strategic Positioning)

---

## 1. Schema Overview

- **Database**: Neon serverless PostgreSQL, connected via `DATABASE_URL` (never committed to the repository).
- **Schema management**: Prisma ORM, `backend/prisma/schema.prisma` (1,345 lines), pushed with `prisma db push` and verified in sync with Neon after every release.
- **Scale**: 44 models, 42 enums, 51 relations, 0 secondary indexes (see §4).

This document lists every domain cluster and gives full field detail for the hub entity (`AIAsset`) and the four models introduced by the most recent release (the Governance Intelligence Studio). Every other model's field-level detail is authoritative in `backend/prisma/schema.prisma` itself — reproducing all 44 models' complete field lists here would risk drifting from the schema faster than this document could be kept current; the domain-cluster table below is the traceable index into it.

---

## 2. Domain Clusters (44 models)

| Cluster | Vintage | Models | Count |
|---|---|---|---|
| Identity & Core | Baseline | User, AIAsset, AssetOwner | 3 |
| Assurance | Baseline | RiskAssessment, ValidationRecord, EvidenceDocument, Finding, ComplianceAssessmentRecord | 5 |
| Decision | Baseline | DecisionRecord | 1 |
| Operations | Baseline | KillSwitchRecord, OverrideRecord, GovernanceIncident, RetirementRecord, ScheduledReview, CorrectiveAction, GovernanceAlert | 7 |
| Policy (Phase 9) | Baseline | Policy, PolicyMapping, PolicyViolation | 3 |
| Change (Phase 10) | Baseline | ChangeRequest, ChangeApproval, StateTransition, ChangeHistoryEntry, GovernanceTriggerRule | 5 |
| Continuity & Evidence | Releases 3–4 | EvidenceRecord, ReassessmentTrigger, GovernanceReauthorizationRecord | 3 |
| Compliance Pack Framework | Release 5 / 5.1 | CompliancePack, ComplianceRequirement, PackControl, EvidenceMapping | 4 |
| Regulatory Knowledge Engine | Release 6 | RegulatorySource, RegulatoryRequirement, Obligation, ObligationControl, ObligationEvidenceMapping | 5 |
| Governance Intelligence | Releases 7–9 | GovernancePolicy, GovernanceFinding, RecommendedAction | 3 |
| Governance Intelligence Studio | Release 10 | ConditionDefinition, OutcomeRule, ActionRule, GovernanceProfile | 4 |
| Audit | Baseline | AuditLog | 1 |

**AIAsset is the hub**: 15+ child relations cascade on delete. Every governance artefact — validation, evidence, decision, incident, policy violation, change request, condition, outcome, recommended action — hangs off the asset.

---

## 3. Detailed Table Definitions

### `AIAsset` (hub entity)

Core fields (a non-exhaustive selection — see schema.prisma for the complete set, which also carries the Release 1 Governance Authority Profile fields):

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | `@default(uuid())` |
| `name` | String | |
| `type` | Enum `AssetType` | Application, Agent, Model, LLM, Copilot, RAG_System, AI_Workflow, Multi_Agent_System, Third_Party_Service |
| `description` | Text | |
| `department` | String | |
| `version` | String | default `"1.0.0"` |
| `status` | Enum `GovernanceStatus` | default `DRAFT` |
| `operationalStatus` | String | default `"Active"` |
| `riskLevel` | Enum `RiskLevel` | default `MEDIUM` |
| `techStack` | String[] | |
| `dataSensitivity` | String | default `"Confidential"` |
| `validationScore` | Int? | nullable |
| `decisionOutcome` | Enum `DecisionOutcome` | default `PENDING` |
| `tags` | String[] | |
| `accountableOwner`, `governanceSponsor`, `humanOverrideAuthority`, `killSwitchAuthority`, `reassessmentAuthority` | String? | Release 1 Governance Authority Profile |
| `authorityRiskOwner`, `authorityTechnicalOwner`, `authorityComplianceOwner` | String? | Release 4 — API-writable Authority Profile scalars |
| `ownershipJson` | Json? | Release 4 — the free-text five-role Ownership Matrix |
| `oversightType` | Enum `HumanOversightType`? | Release 1 — Human Oversight Classification |
| `autonomyLevel` | Int? | Release 1 — Autonomy Classification, Level 0–5 |
| `createdAt` / `updatedAt` | DateTime | |

### `ConditionDefinition` (Release 10 — Condition Designer)

| Field | Type | Notes |
|---|---|---|
| `id` | String (PK) | |
| `conditionType` | Enum `GovernanceConditionType`, unique | one row per condition type |
| `label` | String | |
| `description` | Text | |
| `defaultSeverity` | Enum `GovernancePolicySeverity`, default `MEDIUM` | |
| `enabled` | Boolean, default `true` | gates whether the reasoning engine ever raises this condition type |
| `createdAt` / `updatedAt` | DateTime | |

### `OutcomeRule` (Release 10 — Outcome Designer)

| Field | Type | Notes |
|---|---|---|
| `id` | String (PK) | |
| `outcomeStatus` | Enum `GovernanceOutcomeStatus`, unique | one row per outcome tier |
| `description` | Text | |
| `enabled` | Boolean, default `true` | gates whether the reasoning engine can land on this tier |
| `createdAt` / `updatedAt` | DateTime | |

### `ActionRule` (Release 10 — Action Designer)

| Field | Type | Notes |
|---|---|---|
| `id` | String (PK), `@default(uuid())` | |
| `triggerType` | Enum `ActionRuleTriggerType` | `CONDITION` or `OUTCOME` |
| `triggerValue` | String | loose reference to a condition or outcome value |
| `actionType` | Enum `RecommendedActionType` | |
| `actionName` | String | |
| `actionDescription` | Text | |
| `enabled` | Boolean, default `true` | |
| `createdAt` / `updatedAt` | DateTime | |
| — | `@@unique([triggerType, triggerValue])` | one rule per trigger |

### `GovernanceProfile` (Release 10 — Customer Governance Profiles)

| Field | Type | Notes |
|---|---|---|
| `id` | String (PK) | |
| `name` | String | e.g. "Banking" |
| `industry` | String | |
| `description` | Text | |
| `isActive` | Boolean, default `false` | exactly one active row per tenant, enforced at the application layer |
| `createdAt` / `updatedAt` | DateTime | |

---

## 4. Relationships, Keys & Index Strategy

- **Primary keys**: every model uses a string or UUID primary key; several Release 10 catalogue tables (`ConditionDefinition`, `OutcomeRule`, `GovernanceProfile`) use a deterministic string `id` rather than a generated UUID, since they are seeded, fixed-cardinality catalogues.
- **Foreign keys**: 51 `@relation` declarations across the schema. `AIAsset` is the parent of the majority of them, with `onDelete: Cascade` on its child relations.
- **Composite uniques**: at least two — `AssetOwner.assetId` (one ownership row per asset) and `ActionRule.[triggerType, triggerValue]` (one rule per trigger).
- **Secondary indexes**: **zero** `@@index` or `@index` declarations exist in the schema today. This is a genuine, current gap, not a design choice — see [09_Production_Readiness_Assessment.md](09_Production_Readiness_Assessment.md) for the remediation sequence (index every foreign key and common filter column before any volume load).

---

*Source of truth for every field not reproduced above: `backend/prisma/schema.prisma`.*
