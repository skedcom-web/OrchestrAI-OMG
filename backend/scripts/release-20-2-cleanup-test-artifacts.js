/**
 * Release 20.2 — Workstream C: Production Data Cleanup.
 *
 * Removes the specific Governance Position Intake / Position / Contract /
 * Evidence Link / Reassessment / Reauthorisation records created during
 * Release 20 and 20.1 interoperability certification testing, identified by
 * direct inspection (see scripts/_inspect-test-artifacts.js output reviewed
 * before running this script). These records are certification/testing
 * artifacts, not part of the curated Release 19.2 baseline demonstration
 * dataset, and are removed by exact id — nothing is removed by pattern
 * matching, so no legitimate seeded content is at risk.
 *
 * After removal, Customer Concierge Copilot's original Internal Release
 * 19.2 position (superseded by the test data) is restored to Active.
 * Mortgage Document Intelligence Workflow never had a curated position
 * before this testing — after cleanup it correctly has none, matching its
 * original state.
 *
 * Idempotent: every delete is a no-op if the row is already gone.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EVIDENCE_LINK_IDS = ['94b3cba0-515f-4409-b29d-a7c7b7a90792', 'a4e7a3f5-a23a-4e7f-a6ca-be2bac361ee0'];
const REASSESSMENT_REQUEST_IDS = ['9227badc-5e68-456b-b461-1ea0ddf9fbb6', 'ceaaf04d-7756-4ae8-9f8b-71d9cfdad84d'];
const REAUTHORISATION_REQUEST_IDS = ['fe5eddc0-4857-49ba-acf2-5b30f07a1f72', 'e6c17355-6d26-4a1c-b336-4a6e359fbf34', 'df226e58-bb39-4edf-82aa-f80cf107b1d1'];
const CONTRACT_IDS = ['ec50fb5e-4bdb-4fe7-b150-800c99080f5a', '26cb417b-e12a-44b5-94fb-dabebe31d2c0'];
const POSITION_IDS = ['00937c10-ed5b-465c-b491-c543fbcf8835', 'b46995ed-8e8c-4e32-9ad8-ec49fb0586ad', '0cba2252-c5f2-482f-bef0-96d40a64121c'];
const INTAKE_IDS = ['26b6d288-e882-4366-a42c-09c27a40eb82', '8acf6141-4530-45c9-8f0f-178df07cf977', '97406491-f8b8-48c7-9c28-55572d80be6f'];

const RESTORE_POSITION_ID = '4944732f-4347-4ab2-968d-ed9a0b7cd19f'; // Customer Concierge Copilot, Internal, Release 19.2 baseline

async function deleteMany(label, fn, ids) {
  let count = 0;
  for (const id of ids) {
    try {
      await fn(id);
      count++;
    } catch (e) {
      if (e.code === 'P2025') { console.log(`SKIP (already gone): ${label} ${id}`); continue; }
      throw e;
    }
  }
  console.log(`Deleted ${count} ${label} row(s).`);
}

async function main() {
  await deleteMany('GovernancePositionEvidence', id => prisma.governancePositionEvidence.delete({ where: { id } }), EVIDENCE_LINK_IDS);
  await deleteMany('ReassessmentRequest', id => prisma.reassessmentRequest.delete({ where: { id } }), REASSESSMENT_REQUEST_IDS);
  await deleteMany('ReauthorisationRequest', id => prisma.reauthorisationRequest.delete({ where: { id } }), REAUTHORISATION_REQUEST_IDS);
  await deleteMany('GovernancePositionContract', id => prisma.governancePositionContract.delete({ where: { id } }), CONTRACT_IDS);
  await deleteMany('AuthorisedGovernancePosition', id => prisma.authorisedGovernancePosition.delete({ where: { id } }), POSITION_IDS);
  await deleteMany('GovernancePositionIntake', id => prisma.governancePositionIntake.delete({ where: { id } }), INTAKE_IDS);

  const restored = await prisma.authorisedGovernancePosition.update({
    where: { id: RESTORE_POSITION_ID },
    data: { status: 'Active' },
  });
  console.log(`Restored baseline position ${restored.id} (${restored.assetName}) to status=${restored.status}.`);

  await prisma.$disconnect();
}

main().catch(async e => { console.error(e); await prisma.$disconnect(); process.exit(1); });
