# ODF Deliverable 08: Deployment Blueprint
> **OrchestrAI Model Governance (OMG) Enterprise Platform**
> **Framework Standard**: ODF Universal Governance Standard v1.0
> **Version**: 2.0 — Core Platform v1.0 Complete (Releases 1–10 + Final Strategic Positioning)

---

## 1. Infrastructure & Hosting

| Tier | Provider | Live Endpoint |
|---|---|---|
| Frontend Web App | Firebase Hosting | 🔗 [https://orchestrai-omg.web.app](https://orchestrai-omg.web.app) |
| Backend REST API | Render.com Web Service | 🔗 [https://orchestrai-omg.onrender.com](https://orchestrai-omg.onrender.com) |
| Database | Neon Serverless PostgreSQL | Connection via `DATABASE_URL` environment variable (not published in this document) |
| Source Control | GitHub | [github.com/skedcom-web/OrchestrAI-OMG](https://github.com/skedcom-web/OrchestrAI-OMG) |

---

## 2. Environment Design

- **Frontend build-time config**: `VITE_API_URL` — points the SPA at the backend API; defaults to the production Render URL when unset, and is overridden with a local `.env.local` during development/verification against a local backend.
- **Backend runtime config**: `DATABASE_URL` (Neon connection string), `CORS_ORIGINS` (comma-separated allow-list, defaults to the production Hosting origin plus localhost), `PORT` (defaults to 3000).
- No secrets are committed to source control; `.env` and `.env.local` are gitignored on both frontend and backend.

---

## 3. Deployment Workflow

Deployment is currently a **manual, developer-triggered process** — there is no CI/CD pipeline (see §5).

### Frontend
```bash
cd frontend
npm run build
npx firebase deploy --only hosting
```

### Backend schema changes
```bash
cd backend
npx prisma format
npx prisma db push
```
Render redeploys the backend service automatically on a push to the connected branch, running the build command `prisma generate && nest build` and the start command `node dist/main`.

### Version control
```bash
git add <changed files>
git commit -m "<description>"
git push
```

---

## 4. Rollback Strategy

- **Frontend**: Firebase Hosting retains prior releases; a rollback is a one-click "roll back to this version" action in the Firebase Console, requiring no rebuild.
- **Backend**: Render redeploys from the connected Git branch — a rollback is a `git revert` (or redeploying a prior commit) followed by a normal push, since there is no blue-green or canary mechanism configured.
- **Database**: schema rollback is `git revert` on `schema.prisma` followed by `prisma db push`. Prisma's `db push` does not generate a reversible migration history — there is no automated data rollback, only schema rollback. This is a genuine gap for any change that also requires a data backfill or removal.

---

## 5. CI/CD — Current State

**No automated CI/CD pipeline exists.** There is no GitHub Actions workflow, no Dockerfile, and no infrastructure-as-code for either the Render service or the Firebase project — both are configured through their respective consoles. Every deployment described in §3 is run manually by a developer, gated by the manual verification process in [07_Test_Strategy_And_Evidence.md](07_Test_Strategy_And_Evidence.md), not by an automated pipeline.

This is recorded as an open item, not implied as already solved — see [09_Production_Readiness_Assessment.md](09_Production_Readiness_Assessment.md).
