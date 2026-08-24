# OMG Release 10 — Governance Intelligence Studio (Customer Configuration Edition)

This document records what Release 10 added to OrchestrAI Model Governance (OMG), why, and where to find it. It supplements the Phase 1-10 documents and the Release 1-9 addenda in this directory.

---

## 1. What Release 10 Is

> Configure governance logic without code changes.

Release 10 is **the final core-platform release before customer-specific compliance packs** — "Core OMG Platform = Baseline Complete" after this. It converts the parts of the Release 7/8 reasoning engine that were hardcoded TypeScript config into genuinely editable, Neon-backed rules: a Condition Designer, an Outcome Designer, an Action Designer, a Rule Mapping Engine, a Compliance Pack Builder foundation, and Customer Governance Profiles — all surfaced in one new module, the Governance Intelligence Studio.

## 2. A Deliberate Architectural Boundary

The blueprint's ask ("configure governance logic without code changes") could easily balloon into an over-engineered rules DSL nobody asked for — exactly what every prior release's "foundation, not a rules engine" discipline exists to avoid. Release 10 draws the line precisely:

- **Detection mechanisms stay platform code.** How "Evidence Expired" or "Missing Owner" is detected (`detectGovernanceConditions()`) is unchanged, tested, verified logic from Release 7.
- **Outcome evaluation order stays a platform primitive.** Escalation always outranks Reassessment, which always outranks Review, which always outranks Attention — that ladder never changes.
- **What's configurable is which of them are switched on**, and **what the resulting actions are named, typed and described**.

This mirrors Release 7-9's "computed, not stored" discipline one layer further: the reasoning functions themselves stay pure and data-in/data-out, now accepting an *optional* configuration filter that changes nothing when omitted.

## 3. Schema: Four New Tables

| Model | Purpose | Delete? |
|---|---|---|
| `ConditionDefinition` | One row per `GovernanceConditionType` (6 rows, fixed) — `enabled` gates whether `detectGovernanceConditions()` ever raises that condition type | No — fixed catalogue |
| `OutcomeRule` | One row per `GovernanceOutcomeStatus` (5 rows, fixed) — `enabled` gates whether `computeGovernanceOutcome()` can land on that tier | No — fixed catalogue |
| `ActionRule` | One row per Condition or Outcome trigger — replaces the hardcoded `CONDITION_ACTION_TEMPLATES` / `OUTCOME_ACTION_TEMPLATES` maps from Release 8 | Yes — genuinely user-managed |
| `GovernanceProfile` | Named industry presets (Banking, Insurance, Healthcare, Government, Enterprise); exactly one `isActive` at a time | No — stable seeded set, activate/deactivate only |

No new table was needed for Condition → Policy: that link has been data since Release 7 (`GovernancePolicy.triggerCondition`). `ActionRule.triggerValue` is a loose string reference (same pattern as `GovernancePolicy.obligationId`), storing the frontend-readable label (e.g. `"Evidence Expired"`, `"Review Required"`) so it matches directly against the values the reasoning engine already produces — no enum translation needed at the match point.

## 4. Core Features Delivered (the 8 Blueprint Objectives)

| # | Objective | Where |
|---|---|---|
| 1 | Governance Intelligence Studio | New module at `/governance-studio`, 7 tabs |
| 2 | Policy Designer | Reuses Release 7's Policy Registry — a read-only summary tab plus a link into the existing Governance Intelligence Workspace for full CRUD |
| 3 | Condition Designer | `ConditionDefinition` CRUD (enable/disable + metadata) |
| 4 | Outcome Designer | `OutcomeRule` CRUD (enable/disable + description) |
| 5 | Action Designer | `ActionRule` full CRUD |
| 6 | Rule Mapping Engine | Read-only visualization: Condition → Policy → Outcome → Action, assembled live from the four catalogues above plus Release 7's Policy Registry |
| 7 | Compliance Pack Builder Foundation | Read-only visualization over existing Release 6 data (Source → Requirement → Obligation → Control) cross-linked to the Release 7 Policies that enforce each obligation — no new schema required |
| 8 | Customer Governance Profiles | `GovernanceProfile` CRUD with single-active enforcement |

## 5. Engine Changes: Optional, Backward-Compatible Filters

- `detectGovernanceConditions(...)` (`governanceReasoningEngine.ts`) gained an optional `enabledConditionTypes?: Set<...>` parameter. A disabled condition type is never pushed, for any asset. Omitted, behavior is identical to Release 7-9.
- `computeGovernanceOutcome(...)` gained an optional `disabledOutcomes?: Set<...>` parameter. Each tier's own trigger check is now gated by `isEnabled(status)`; a disabled tier's condition being true no longer short-circuits the cascade — evaluation falls through to the next tier's independent check, preserving the fixed escalation order. Omitted, behavior is identical to Release 7-9.
- `generateActionDrafts(...)` (`governanceActionsEngine.ts`) gained an optional `actionRules?: ActionRule[]` parameter. A matching **enabled** rule (by `triggerType` + `triggerValue`) overrides the hardcoded template's name/description/type; a matching **disabled** rule suppresses the draft entirely; no match falls back to the original hardcoded template. Omitted, behavior is identical to Release 8-9.

`storageService.ts` wires all three: `getGovernanceConditionsForAsset()`, `getGovernanceOutcomeForAsset()` / `getAllGovernanceOutcomes()`, and `generateRecommendedActionsForAsset()` now pass the live Studio caches through. `getEnabledConditionTypes()` / `getDisabledOutcomes()` return `undefined` when the catalogue cache is empty, so a cold-started backend degrades to "everything enabled" rather than "everything disabled."

## 6. New Module: Governance Intelligence Studio

`/governance-studio` — 7 tabs: Condition Designer, Policy Designer, Outcome Designer, Action Designer, Rule Mapping Engine, Compliance Pack Builder, Customer Profiles. Placed in the navigation alongside Governance Intelligence and Governance Actions (Release 7/8's module group), tagged `Release 10`.

## 7. The Mandatory Positioning Updates

Per the blueprint's required Landing Page, Viewer Journey and Sales Positioning updates:

- **`CAPABILITIES`** (Section 7): grew from 15 to 16 — added Governance Intelligence Studio.
- **`TOUR_STEPS`** (Guided Tour): grew from 35 to 36 — added Governance Intelligence Studio as the final step.
- **`ENTERPRISE_PROBLEMS`** (Section 1): grew from 9 to 10 — added "Every customer or regulation needs a platform rebuild → Governance Intelligence Studio".
- **New Section 8.5 — "Built Once. Configured Many Times."**: a two-column Sales Positioning block on `OmgOverviewPage.tsx` contrasting the **Current Platform** (everything shipped, live today) against **Future Customer Add-ons** — five named configuration packs (Banking, Insurance, Healthcare, Government, Enterprise), each described as a Governance Profile plus a set of Condition/Outcome/Action rules configured through the Studio, not new code.
- **Hero tagline**: "Built Once. Configured Many Times." added directly under the hero subtitle.
- The per-asset `JOURNEY_STAGES` (Section 2, "How OMG Works", 9 stages) were deliberately left unchanged, continuing Release 9's precedent: Customer Customization is a tenant-level configuration capability, not a stage a single asset progresses through, so it belongs in Capabilities, the Tour and the new positioning section — not the asset lifecycle.

Unlike every prior release, Release 10's blueprint specifies **no Dashboard or Executive Hub enhancement** — none was added, to match the blueprint precisely rather than pad scope.

## 8. Seed Data

`backend/prisma/seed.js` gained `seedGovernanceStudio()` (idempotent, checks `ConditionDefinition` row count): 6 Condition Definitions (one per `GovernanceConditionType`, all enabled), 5 Outcome Rules (one per `GovernanceOutcomeStatus`, all enabled), 9 Action Rules (mirroring the exact hardcoded `CONDITION_ACTION_TEMPLATES` / `OUTCOME_ACTION_TEMPLATES` defaults from Release 8, so out-of-the-box behavior is byte-for-byte unchanged), and 5 Governance Profiles (Banking active by default, matching the demo tenant's "Enterprise Banking Tenant" narrative; Insurance, Healthcare, Government, Enterprise inactive).

## 9. Validation

Verified end-to-end against live Neon through a local backend and the actual UI:

1. Condition Designer, Outcome Designer and Action Designer all loaded their full seeded catalogues (6 / 5 / 9 rows respectively) with live data.
2. Rule Mapping Engine correctly chained all 6 conditions through their policies to their action rules, and all 5 outcome tiers through to their procedural actions.
3. Compliance Pack Builder correctly rendered the live Source → Requirement → Obligation → Control tree, cross-linked to the 3 Release 7 policies that reference an obligation.
4. Customer Governance Profiles showed all 5 profiles with Banking marked ACTIVE.
5. Toggled "Evidence Expired" off in the Condition Designer — the UI updated to "Disabled" and a direct API call confirmed `EVIDENCE_EXPIRED: false` persisted to Neon.
6. Opened the Governance Intelligence Workspace for the Enterprise Portfolio Multi-Agent System (an asset with genuinely expired evidence) and confirmed the "Evidence Expired" condition no longer appeared — only "Missing Validation" — proving the Studio toggle changes live reasoning-engine output, not just its own display.
7. Re-enabled "Evidence Expired" and confirmed via API it persisted back to `true`.
8. Confirmed final Neon state matches the seed exactly: all 6 conditions enabled, all 5 outcomes enabled, 9 action rules, Banking still the sole active profile.

## 10. What's Still Out of Scope

Per the blueprint: the customer-specific compliance packs themselves (Banking/Insurance/Healthcare/Government/Enterprise rule *content*) are future releases — Release 10 builds the configuration mechanism they will be delivered through, not the packs. Also unchanged: no automatic state changes, no regulation-specific hardcoded logic, detection mechanisms and outcome evaluation order remain platform primitives.

## 11. Success Criteria

A governance admin can change which conditions are detected, which outcome tiers are active, and what action a given condition or outcome produces — entirely through the Studio UI, with the change taking effect on the next reasoning-engine read, with zero code changes or redeploys. Verified directly against the live demo portfolio, not just the design.

---

*Supersedes nothing. Read alongside [22_Release9_Decision_Traceability_Engine.md](22_Release9_Decision_Traceability_Engine.md) and [02_Functional_Requirements_Specification.md](02_Functional_Requirements_Specification.md).*
