# OMG Phase 2.5 Master Blueprint
## Governance Identity & RBAC Foundation
### Version 1.0 (Approved Baseline)

---

# Purpose

Phase 2.5 establishes the governance identity layer for OMG.

This phase exists to prevent future rework and ensure every module built after this point is secured by a common governance model.

This is NOT a full enterprise authorization engine.

This is the RBAC Foundation.

---

# Strategic Goal

Before building:

- Validation Center
- Evidence Center
- Decision Governance Engine
- Compliance Center
- Kill Switch Center
- Audit Center

OMG must know:

- Who is accessing the system
- What role they perform
- What responsibilities they own
- What actions they can perform

---

# Guiding Principles

1. Identity First
2. Role-Based Governance
3. Least Privilege
4. Auditability
5. Expandable Architecture
6. No Overengineering

---

# Scope of Phase 2.5

Included:

✅ Authentication

✅ Role Management

✅ Seeded Demo Users

✅ Navigation-Based RBAC

✅ Backend Role Guards

✅ Audit Logging Foundation

Excluded:

❌ Fine-Grained Permissions

❌ Policy Engine

❌ Attribute-Based Access Control (ABAC)

❌ Dynamic Permission Builder

❌ Enterprise IAM Integration

These will come later.

---

# User Roles

## SUPER_ADMIN

Purpose:

Platform Owner

Capabilities:

- Full System Access
- User Management
- Role Assignment
- Platform Settings
- Governance Configuration

---

## GOVERNANCE_ADMIN

Purpose:

AI Governance Program Manager

Capabilities:

- Manage AI Assets
- Manage Ownership
- Manage Reviews
- View Governance Dashboards

Cannot:

- Change Platform Configuration

---

## RISK_OFFICER

Purpose:

Risk Governance

Capabilities:

- Risk Assessments
- Risk Reviews
- Risk Dashboards
- Risk Reporting

---

## BUSINESS_OWNER

Purpose:

Business Accountability

Capabilities:

- Create Assets
- View Assigned Assets
- Submit Reviews
- Participate in Decisions

---

## VALIDATOR

Purpose:

Validation Activities

Capabilities:

- Validation Reviews
- Evidence Submission
- Validation Reporting

---

## AUDITOR

Purpose:

Independent Audit

Capabilities:

- Read Only Access
- Audit Logs
- Evidence Review
- Compliance Review

Cannot:

- Modify Governance Records

---

## VIEWER

Purpose:

Executive Visibility

Capabilities:

- Dashboard Access
- Read-Only Reporting

---

# Authentication

Technology:

Firebase Authentication

Supported Methods:

- Email Login
- Password Login

Future:

- SSO
- Azure AD
- Okta

---

# Seeded Demo Access

Development Only

Login Screen:

Quick Access Cards

- Super Admin
- Governance Admin
- Risk Officer
- Business Owner
- Validator
- Auditor
- Viewer

Purpose:

Accelerate Testing

---

# Database Design

## User

Fields:

- Id
- Name
- Email
- Role
- Department
- Active
- CreatedDate

---

## Role

Fields:

- Id
- RoleName
- Description

---

## Audit Log

Fields:

- User
- Action
- Entity
- EntityId
- Timestamp

---

# Navigation RBAC

## SUPER_ADMIN

Visible:

- Dashboard
- Registry
- Ownership
- Risk Center
- Decision Center
- User Management
- Settings

---

## GOVERNANCE_ADMIN

Visible:

- Dashboard
- Registry
- Ownership
- Risk Center
- Decision Center

---

## RISK_OFFICER

Visible:

- Dashboard
- Registry
- Risk Center

---

## BUSINESS_OWNER

Visible:

- Dashboard
- My Assets
- My Reviews

---

## VALIDATOR

Visible:

- Dashboard
- Validation Center

---

## AUDITOR

Visible:

- Dashboard
- Audit Center
- Evidence Center

---

## VIEWER

Visible:

- Dashboard
- Reports

---

# Backend Security

Every API must support:

Role Guard

Examples:

Registry APIs

Allowed:

- SUPER_ADMIN
- GOVERNANCE_ADMIN
- BUSINESS_OWNER

Risk APIs

Allowed:

- SUPER_ADMIN
- GOVERNANCE_ADMIN
- RISK_OFFICER

---

# Audit Logging Foundation

Every future module must generate:

- User
- Action
- Entity
- Timestamp

Examples:

Create Asset

Update Asset

Approve Risk

Submit Validation

Decision Outcome

---

# UI Requirements

Maintain Current OMG Design Language

Mandatory:

- Light Theme
- Dark Theme
- Glassmorphism Theme

Role Badge Display:

Top Navigation

Example:

Logged In As:
Governance Admin

---

# Acceptance Criteria

Authentication Working

Seeded Users Available

Role Assignment Working

Navigation Filtering Working

Backend Role Guards Working

Audit Logging Working

No Unauthorized Access

---

# Deliverables

1. Login Screen

2. Seeded Demo Access

3. Role Model

4. User Management Module

5. Navigation RBAC

6. Backend Authorization Guards

7. Audit Log Foundation

---

# Exit Criteria

Phase 2.5 is complete when:

Every user has an identity.

Every identity has a role.

Every role has controlled access.

Every action is attributable.

Every future OMG module can inherit this governance foundation.

---

# Next Phase

Phase 3

OMG Validation & Evidence Command Center

Mission:

Can this AI asset prove it is ready?
