# ODF Deliverable 08: Deployment Blueprint
> **OrchestrAI Model Governance (OMG) Enterprise Platform**  
> **Framework Standard**: ODF Universal Governance Standard v1.0  
> **Version**: 1.0 (Phases 1 - 6 Approved Baseline)  

---

## 1. Hosting Architecture & Endpoints

| Architecture Tier | Technology Provider | Target URL / Connection |
|-------------------|--------------------|------------------------|
| **Frontend Web App** | Firebase Hosting | 🔗 **[https://orchestrai-omg.web.app](https://orchestrai-omg.web.app)** |
| **Backend REST API** | Render.com Web Service | 🔗 **[https://orchestrai-omg.onrender.com](https://orchestrai-omg.onrender.com)** |
| **Managed Cloud Database** | Neon PostgreSQL Serverless | ⚡ `postgresql://neondb_owner:...@ep-soft-pine-ax5f1eh1...` |
| **Source Code Repository** | GitHub | 🐙 **[skedcom-web/OrchestrAI-OMG](https://github.com/skedcom-web/OrchestrAI-OMG)** |

---

## 2. Automated Deployment Workflow

### 1. Frontend Build & Firebase Hosting Deployment
```bash
cd frontend
npm run build
npx firebase-tools deploy --only hosting
```

### 2. Backend Migration & Cloud Database Push
```bash
cd backend
npx prisma db push --schema=prisma/schema.prisma
```

### 3. Git Version Control & Commit Pipeline
```bash
git add .
git commit -m "Implement Phase 6 Operational Governance & Kill Switch Center"
```

---

## 3. Environment Rollback Strategy
- **Firebase Hosting Rollback**: Standard 1-click version release rollback via Firebase Console (`https://console.firebase.google.com/project/orchestrai-omg/overview`).
- **Prisma Schema Rollback**: Revert `schema.prisma` and execute `npx prisma db push`.
