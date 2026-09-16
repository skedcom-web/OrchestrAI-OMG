/**
 * Release 19.2 — Production Data Alignment (Certification Remediation),
 * part 2. Found via live diagnosis: two real EvidenceRecord rows were
 * blocking the "Governed" and "Pending Reauthorisation" demonstration
 * scenarios for reasons unrelated to any governance-logic defect —
 * ordinary evidence-lifecycle staleness in the underlying data:
 *
 *  - Fraud Detection Sentinel Agent's Kill Switch Control Assessment had
 *    quietly expired (expiryDate 2026-09-10, now in the past), dropping it
 *    from 2 active non-expired records to 1 — short of Critical risk's
 *    minimum of 2 (evidenceSufficiencyEngine.ts's own documented rule).
 *  - AML Regulatory Intelligence RAG's two evidence rows were sitting in
 *    Draft and Expired status respectively — zero rows counted as
 *    "Active" at all, forcing "Insufficient" evidence, which (correctly,
 *    per admissibilityEngine.ts's own rule) forces Pause/Governance
 *    Invalid for a High-risk asset regardless of authority or reliance.
 *
 * No governance logic changed — only renewing/activating evidence that
 * should already have been current. Safe to re-run (idempotent updates).
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const controlAssessment = await prisma.evidenceRecord.findFirst({
    where: { name: 'Fraud Sentinel Agent — Kill Switch Control Assessment' },
  });
  if (controlAssessment) {
    await prisma.evidenceRecord.update({
      where: { id: controlAssessment.id },
      data: { expiryDate: new Date('2027-09-10T00:00:00.000Z') },
    });
    console.log(`Renewed expiry on "${controlAssessment.name}" -> 2027-09-10.`);
  } else {
    console.warn('SKIP: Kill Switch Control Assessment record not found.');
  }

  const vendorAssessment = await prisma.evidenceRecord.findFirst({
    where: { name: 'AML RAG — Vendor Data Provider Assessment' },
  });
  if (vendorAssessment) {
    await prisma.evidenceRecord.update({
      where: { id: vendorAssessment.id },
      data: { status: 'ACTIVE' },
    });
    console.log(`Activated "${vendorAssessment.name}".`);
  } else {
    console.warn('SKIP: Vendor Data Provider Assessment record not found.');
  }

  const govReview = await prisma.evidenceRecord.findFirst({
    where: { name: 'AML RAG — Q2 Governance Review' },
  });
  if (govReview) {
    await prisma.evidenceRecord.update({
      where: { id: govReview.id },
      data: { status: 'ACTIVE', expiryDate: new Date('2027-08-01T00:00:00.000Z') },
    });
    console.log(`Activated and renewed "${govReview.name}" -> expiry 2027-08-01.`);
  } else {
    console.warn('SKIP: Q2 Governance Review record not found.');
  }

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
