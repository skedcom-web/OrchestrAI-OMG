# OMG Release 1 — Governance Authority Foundation
> **Governance Overview & User Guide Addendum**

This document records what Release 1 added to OrchestrAI Model Governance (OMG), why, and where to find it in the product. It supplements — and does not replace — the Phase 1-10 documents in this directory.

---

## 1. What Release 1 Is

Release 1 introduces foundational governance intelligence without disrupting any existing OMG module:

1. **Governance Authority Profile** — named accountability on every AI asset.
2. **Human Oversight Classification** — how humans supervise each asset.
3. **Autonomy Classification** — how independently each asset acts, Level 0-5.
4. **Authority Matrix** — baseline approval expectations by risk tier (reference only).
5. **Experience Alignment** — the viewer journey, guided tour, executive narrative and demo data all reflect the above.

Release 1 does **not** introduce Compliance Packs, ISO 42001, RBI FREE-AI, Readiness Scoring, Governance Intelligence Scores, Trust Metrics, Continuous Monitoring changes or Workflow Automation. Those remain future releases.

---

## 2. Governance Authority Profile

Every AI asset carries a `authorityProfile` alongside its existing Ownership Matrix:

| Field | Required | Purpose |
|---|---|---|
| Accountable Owner | Yes | The individual ultimately answerable for the asset. |
| Governance Sponsor | Yes | The executive/governance sponsor backing the asset. |
| Risk Owner | Yes | Owns the asset's risk posture. |
| Technical Owner | Yes | Owns the engineering and architecture. |
| Compliance Owner | Optional | Regulatory and data privacy accountability. |
| Human Override Authority | Optional | Who can override an autonomous decision. |
| Kill Switch Authority | Optional | Who can suspend the asset. |
| Reassessment Authority | Optional | Who triggers and owns reassessment. |

This is additive to, and independent from, the existing five-role Ownership Matrix (`/ownership`), which is unchanged.

**Where it appears:** AI Asset Registry (registration form, detail card), Executive Governance Hub.

## 3. Human Oversight Classification

One of: `Human-in-Command`, `Human-in-the-Loop`, `Human-on-the-Loop`, `Autonomous with Controls`. Set at registration and shown wherever the asset is reviewed.

## 4. Autonomy Classification

Level 0 (No AI) through Level 5 (High Autonomy). Shown on the asset registry, asset detail and Executive Dashboard.

## 5. Authority Matrix

Baseline reference guidance only — not enforced automatically in Release 1:

| Risk Tier | Oversight | Approval Authority |
|---|---|---|
| Low | Human-on-the-Loop | Manager Approval |
| Medium | Human-in-the-Loop | Director Approval |
| High | Human-in-Command | Governance Board Approval |
| Critical | Human-in-Command | Executive Committee Approval (mandatory) |

The matrix is shown as reference text on the asset registration form and as "Approval Authority" on the Governance Summary Card — it does not gate or automate any workflow.

## 6. Where To Look In The Product

| Surface | What changed |
|---|---|
| AI Asset Registry (`/assets`) | Registration form gained Governance Authority, Oversight and Autonomy sections; asset detail gained a Governance Summary Card. |
| Executive Dashboard (`/dashboard`) | New "Assets by Oversight Model" and "Assets by Autonomy Level" panels. |
| Executive Governance Hub (`/executive-hub`) | New "Accountability, Oversight & Autonomy" panel (plain counts, no scoring). |
| Landing / Guided Tour (`/`) | Viewer journey message and the guided tour gained three new steps between "AI Asset Registry" and "Risk Center". |

## 7. Implementation Notes

- Frontend types: `GovernanceAuthorityProfile`, `HumanOversightType`, `AutonomyLevel`, `AuthorityMatrixEntry` in `frontend/src/types/index.ts`.
- Reference data: `frontend/src/config/governanceAuthority.ts`.
- Existing local demo data (and any assets saved before this release) is backfilled transparently by `normalizeAsset()` in `frontend/src/services/storageService.ts` so nothing renders blank.
- Backend: `AIAsset` in `backend/prisma/schema.prisma` gained matching optional fields (`accountableOwner`, `governanceSponsor`, `humanOverrideAuthority`, `killSwitchAuthority`, `reassessmentAuthority`, `oversightType`, `autonomyLevel`). These are additive and nullable — no existing data is affected. A `prisma migrate dev` (or `db push`) against the live database is required before the API surfaces them; the frontend does not depend on this, as asset data is served from local/mock storage today.

---

*Supersedes nothing. Read alongside [02_Functional_Requirements_Specification.md](file:///C:/Users/VT348/Documents/GitHub/OrchestrAI%20OMG/docs/governance/02_Functional_Requirements_Specification.md) for the full feature baseline.*
