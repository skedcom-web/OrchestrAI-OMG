# ODF Deliverable 04: Database Design Document
> **OrchestrAI Model Governance (OMG) Enterprise Platform**  
> **Framework Standard**: ODF Universal Governance Standard v1.0  
> **Version**: 1.0 (Phases 1 - 6 Approved Baseline)  

---

## 1. Database Schema Overview & Entity Relationship
Connected to **Neon PostgreSQL Serverless Cloud DB** (`neondb`).  
Managed via **Prisma ORM** (`backend/prisma/schema.prisma`).

---

## 2. Table Definitions & Schemas

### Table: `ai_assets`
- `id` (UUID, Primary Key)
- `name` (VarChar)
- `type` (Enum: `APPLICATION`, `AGENT`, `MODEL`, `LLM`, `COPILOT`, `RAG_SYSTEM`, `AI_WORKFLOW`, `MULTI_AGENT_SYSTEM`, `THIRD_PARTY_SERVICE`)
- `description` (Text)
- `department` (VarChar)
- `version` (VarChar)
- `status` (Enum: `DRAFT`, `REVIEW`, `VALIDATION`, `APPROVAL`, `PRODUCTION`, `RETIREMENT`)
- `operationalStatus` (VarChar: `Active`, `Suspended`, `Under Review`, `Planned`, `Retired`)
- `riskLevel` (Enum: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- `dataSensitivity` (VarChar)
- `validationScore` (Int, Nullable)
- `decisionOutcome` (Enum: `GO`, `CONDITIONAL_GO`, `NO_GO`, `PENDING`)
- `createdAt` / `updatedAt` (Timestamp)

### Table: `asset_owners`
- `id` (UUID, Primary Key)
- `assetId` (UUID, Foreign Key -> `ai_assets.id`, Unique)
- `businessOwnerId` / `technicalOwnerId` / `riskOwnerId` / `complianceOwnerId` / `approverId` (Foreign Keys -> `users.id`)

### Table: `risk_assessments`
- `id` (UUID, PK)
- `assetId` (FK -> `ai_assets.id`)
- `overallRiskTier` (Enum: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- `context` / `dataSensitivity` / `decisionImpact` / `operationalImpact` / `controlOversight` / `assessedBy` (VarChar)

### Table: `decision_records`
- `id` (UUID, PK)
- `assetId` (FK -> `ai_assets.id`)
- `outcome` (Enum: `GO`, `CONDITIONAL_GO`, `NO_GO`, `PENDING`)
- `checklist` (JSON)
- `decisionOwner` (VarChar)
- `justification` (Text)

### Table: `validation_records`
- `id` (UUID, PK)
- `assetId` (FK -> `ai_assets.id`)
- `category` / `reviewer` / `reviewerRole` / `status` (VarChar)
- `score` (Int)
- `findings` / `recommendations` (Text)

### Table: `evidence_documents`
- `id` (UUID, PK)
- `title` / `category` / `deliverableType` / `assetId` / `uploadedBy` / `version` / `status` (VarChar)
- `description` (Text)

### Table: `findings`
- `id` (UUID, PK)
- `title` / `assetId` / `severity` / `status` / `assignedTo` / `reportedBy` (VarChar)
- `description` (Text)

### Table: `compliance_assessments`
- `id` (UUID, PK)
- `assetId` (FK -> `ai_assets.id`)
- `controlId` / `controlName` / `status` (VarChar)
- `score` (Int)
- `assessor` (VarChar)
- `notes` (Text)

### Table: `kill_switches`
- `id` (UUID, PK)
- `assetId` (FK -> `ai_assets.id`)
- `triggerCategory` / `status` / `requestedBy` / `approvedBy` (VarChar)
- `activatedAt` (Timestamp)
- `reason` / `resolutionNotes` (Text)

### Table: `overrides`
- `id` (UUID, PK)
- `assetId` (FK -> `ai_assets.id`)
- `triggerReason` / `requestedBy` / `approvedBy` / `actionTaken` (Text/VarChar)
- `timestamp` (Timestamp)

### Table: `incidents`
- `id` (UUID, PK)
- `assetId` (FK -> `ai_assets.id`)
- `title` / `type` / `severity` / `status` / `reportedBy` / `assignedTo` (VarChar)
- `description` (Text)

### Table: `retirements`
- `id` (UUID, PK)
- `assetId` (FK -> `ai_assets.id`)
- `reason` / `requestedBy` / `approvedBy` (VarChar)
- `evidenceArchivedCount` (Int)
- `notes` (Text)

### Table: `audit_logs`
- `id` (UUID, PK)
- `timestamp` (Timestamp)
- `userId` / `userName` / `userRole` / `action` / `entityType` / `entityId` / `entityName` / `ipAddress` (VarChar)
- `details` (Text)

---

## 3. Indexes & Constraints
- Unique index on `users.email`.
- Unique constraint on `asset_owners.assetId`.
- Foreign key constraints with `onDelete: Cascade` from `ai_assets` to all dependent child records.
