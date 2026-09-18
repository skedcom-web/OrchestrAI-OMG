/**
 * Release 21 — removes the one diagnostic probe record created while
 * live-debugging a real 500 error in the deployed Consequential Action
 * Governance page (see the assetName-mapper fix in apiRepositories.ts).
 * Not part of the mandatory Section 9 demonstration workflow, which is the
 * separate, real record left in place (reason: "Reassessment of the
 * detected model drift completed...").
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DIAGNOSTIC_RECORD_ID = '5449e825-31dd-4b40-bb85-5e010377c49e';

async function main() {
  try {
    const deleted = await prisma.consequentialActionRecord.delete({ where: { id: DIAGNOSTIC_RECORD_ID } });
    console.log(`Deleted diagnostic record ${deleted.id} (reason: "${deleted.reason}").`);
  } catch (e) {
    if (e.code === 'P2025') { console.log('Already gone.'); } else { throw e; }
  }
  await prisma.$disconnect();
}

main().catch(async e => { console.error(e); await prisma.$disconnect(); process.exit(1); });
