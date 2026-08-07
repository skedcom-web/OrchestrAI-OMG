# ODF Deliverable 03: Solution Architecture Blueprint
> **OrchestrAI Model Governance (OMG) Enterprise Platform**  
> **Framework Standard**: ODF Universal Governance Standard v1.0  
> **Version**: 1.0 (Phases 1 - 6 Approved Baseline)  

---

## 1. System Architecture Overview

```
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                            USER INTERFACE                               │
 │   React 18 + TypeScript 5 + Vite + Custom Glassmorphism CSS Engine      │
 │   (Persona Switcher, 26 Navigation Modules, Printable Executive Packages)│
 └────────────────────────────────────┬────────────────────────────────────┘
                                      │ REST API / HTTPS
 ┌────────────────────────────────────▼────────────────────────────────────┐
 │                            BACKEND API SERVICE                          │
 │   NestJS (Node.js + Express) REST Server                                │
 │   Guards: RolesGuard, AuthContext, RBAC @Roles Decorators               │
 │   Services: Asset, Risk, Decision, Validation, Evidence, Compliance, Ops │
 └────────────────────────────────────┬────────────────────────────────────┘
                                      │ Prisma ORM (v6.19.3)
 ┌────────────────────────────────────▼────────────────────────────────────┐
 │                           CLOUD DATABASE LAYER                          │
 │   Neon PostgreSQL Serverless Cloud DB (ep-soft-pine-ax5f1eh1)           │
 │   Models: AIAsset, AssetOwner, RiskAssessment, DecisionRecord,          │
 │           ValidationRecord, EvidenceDocument, Finding, Compliance,      │
 │           KillSwitchRecord, OverrideRecord, Incident, Retirement, AuditLog│
 └─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Frontend Application
- **Core Framework**: React 18.3.1 + TypeScript 5.6 (verbatim module syntax).
- **Build Tooling**: Vite 8.2.1 (instant HMR & production client bundler).
- **Styling & Design System**: Custom Vanilla CSS Tokens, High-Contrast Glassmorphism (`backdrop-filter: blur(28px)`), `@keyframes waveringAurora` fluid background animation.
- **Routing**: React Router DOM v6.22.

### Backend API Server
- **Core Framework**: NestJS v10 (Express HTTP adapter).
- **Security & Authorization**: Custom `RolesGuard`, Reflector, `@Roles(...)` metadata decorators.
- **ORM & Database Client**: Prisma ORM v6.19.3.

### Hosting & Cloud Infrastructure
- **Frontend Web Hosting**: Firebase Hosting (`https://orchestrai-omg.web.app`).
- **Backend Service**: Render.com Web Service (`https://orchestrai-omg.onrender.com`).
- **Managed Database**: Neon Serverless PostgreSQL Cloud DB.

---

## 3. Integration & Security Architecture
- **HTTPS & SSL/TLS**: Enforced across all REST communication endpoints.
- **Database Connection Pooling**: SSL Mode required (`sslmode=require`) connected via Neon connection string.
- **Audit Traceability**: Immutable `AuditLog` table populated synchronously on every state mutation.
