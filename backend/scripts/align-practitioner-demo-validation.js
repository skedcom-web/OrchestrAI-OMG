const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const asset = await prisma.aIAsset.findFirst({ where: { name: 'Fraud Detection Sentinel Agent' } });
  const existing = await prisma.validationRecord.findFirst({ where: { assetId: asset.id, status: 'Approved' } });
  if (existing) { console.log('SKIP: an Approved validation already exists.'); await prisma.$disconnect(); return; }
  const v = await prisma.validationRecord.create({
    data: {
      assetId: asset.id,
      category: 'Model Performance & Bias',
      reviewer: 'Dr. Aris Thorne',
      reviewerRole: 'Independent Validator',
      reviewDate: new Date('2026-07-28T00:00:00.000Z'),
      status: 'Approved',
      score: 94,
      findings: 'Fraud detection precision and recall both within target range; no material bias detected across reviewed demographic segments.',
      recommendations: 'Continue quarterly monitoring cadence; no corrective action required.',
    },
  });
  console.log('Created Approved ValidationRecord', v.id, 'for Fraud Detection Sentinel Agent.');
  await prisma.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
