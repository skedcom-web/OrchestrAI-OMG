/**
 * Release 21.1 — Baseline Freeze Remediation, Stream F (data-only fixes).
 *
 * Closes two certification findings that are pure seed-data corrections,
 * not code defects:
 *
 *  P3-01 — the archived "QA Audit Test Asset" (self-described "safe to
 *          delete") is hard-deleted rather than left archived.
 *  P6-01 — Fraud Detection Sentinel Agent's Decision record named a
 *          different "decision owner" (Sarah Jenkins) than its own
 *          ownership record's named approver (David Chen). The approver
 *          field is the more specific, role-scoped source of truth, so the
 *          Decision record is corrected to match it.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const QA_TEST_ASSET_ID = '67df14bc-b5ee-4720-bf21-51eb08c59ef4';
const FRAUD_DECISION_ID = '2da39f44-da4f-4c51-9fa7-51b45ba77287';
const CORRECT_DECISION_OWNER = 'David Chen';

async function main() {
  const asset = await prisma.aIAsset.findUnique({ where: { id: QA_TEST_ASSET_ID } });
  if (asset) {
    await prisma.aIAsset.delete({ where: { id: QA_TEST_ASSET_ID } });
    console.log(`Deleted archived test asset "${asset.name}" (${QA_TEST_ASSET_ID}).`);
  } else {
    console.log('QA Audit Test Asset already gone.');
  }

  const decision = await prisma.decisionRecord.findUnique({ where: { id: FRAUD_DECISION_ID } });
  if (decision && decision.decisionOwner !== CORRECT_DECISION_OWNER) {
    await prisma.decisionRecord.update({
      where: { id: FRAUD_DECISION_ID },
      data: { decisionOwner: CORRECT_DECISION_OWNER },
    });
    console.log(`Decision ${FRAUD_DECISION_ID}: decisionOwner "${decision.decisionOwner}" -> "${CORRECT_DECISION_OWNER}".`);
  } else if (decision) {
    console.log('Decision already reconciled.');
  } else {
    console.log(`Decision ${FRAUD_DECISION_ID} not found.`);
  }

  await prisma.$disconnect();
}

main().catch(async e => { console.error(e); await prisma.$disconnect(); process.exit(1); });
