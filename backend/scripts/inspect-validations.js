const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const asset = await prisma.aIAsset.findFirst({ where: { name: 'Fraud Detection Sentinel Agent' } });
  const validations = await prisma.validationRecord.findMany({ where: { assetId: asset.id } });
  console.log('VALIDATIONS:', JSON.stringify(validations, null, 2));
  const evidenceDocs = await prisma.evidenceDocument.findMany({ where: { assetId: asset.id } });
  console.log('EVIDENCE DOCS:', JSON.stringify(evidenceDocs, null, 2));
  await prisma.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
