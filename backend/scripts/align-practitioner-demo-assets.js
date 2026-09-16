/**
 * Release 19.2 — Production Data Alignment (Certification Remediation).
 *
 * One-time, idempotent, name-keyed alignment of real Neon asset records so
 * the existing (unmodified) Release 18 Authority Currency engine naturally
 * differentiates the practitioner demonstration set across canonical
 * Unified Governance States. Does NOT touch governance logic, does NOT add
 * new fields, does NOT invent assets — only updates lastReviewDate on
 * assets that already exist, by name, plus files one ordinary
 * ReassessmentTrigger through the existing Release 18 mechanism.
 *
 * Safe to re-run: every write is idempotent (same target value each time;
 * the trigger insert is skipped if an open one already exists for that
 * asset and reason).
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Today, per this environment: keep in sync with the session date this
// remediation was performed under.
const TODAY = new Date('2026-09-16T00:00:00.000Z');
const daysAgo = (n) => new Date(TODAY.getTime() - n * 24 * 60 * 60 * 1000);

const ALIGNMENTS = [
  // Governed — authority freshly confirmed.
  { name: 'Fraud Detection Sentinel Agent', lastReviewDate: daysAgo(6) },
  // Conditionally Governed — authority current; a Reliance Degraded seed
  // record (frontend, by name) supplies the "conditions exist" signal.
  { name: 'Customer Concierge Copilot', lastReviewDate: daysAgo(11) },
  // Pending Reauthorisation — authority current; absence of an Authorised
  // Governance Position (frontend seed) plus the trigger below drive the state.
  { name: 'AML Regulatory Intelligence RAG', lastReviewDate: daysAgo(4) },
  // Governance At Risk — authority in the Review-Required band (60-90 days).
  { name: 'Retail Credit Scoring Engine', lastReviewDate: daysAgo(73) },
  // Enterprise Portfolio Multi-Agent System (Governance Invalid) and
  // QA Audit Test Asset (Retired) are left untouched — already correct.
];

async function main() {
  for (const { name, lastReviewDate } of ALIGNMENTS) {
    const asset = await prisma.aIAsset.findFirst({ where: { name } });
    if (!asset) { console.warn(`SKIP: no asset named "${name}" found.`); continue; }
    await prisma.aIAsset.update({ where: { id: asset.id }, data: { lastReviewDate } });
    console.log(`Aligned "${name}" (${asset.id}) — lastReviewDate -> ${lastReviewDate.toISOString()}`);
  }

  const amlAsset = await prisma.aIAsset.findFirst({ where: { name: 'AML Regulatory Intelligence RAG' } });
  if (amlAsset) {
    const existingOpenTrigger = await prisma.reassessmentTrigger.findFirst({
      where: { assetId: amlAsset.id, status: 'OPEN', triggerType: 'REGULATORY_CHANGE' },
    });
    if (existingOpenTrigger) {
      console.log(`SKIP: an open Regulatory Change trigger already exists for "${amlAsset.name}".`);
    } else {
      const trigger = await prisma.reassessmentTrigger.create({
        data: {
          assetId: amlAsset.id,
          triggerType: 'REGULATORY_CHANGE',
          severity: 'HIGH',
          owner: 'David Chen (Governance Admin)',
          status: 'OPEN',
          comments: 'Regulatory filing cycle updated — the knowledge base underlying this asset requires reassessment before its Authorised Governance Position can be reissued.',
        },
      });
      console.log(`Filed ReassessmentTrigger ${trigger.id} for "${amlAsset.name}".`);
    }
  }

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
