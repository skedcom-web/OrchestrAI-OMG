const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const asset = await prisma.aIAsset.findFirst({ where: { name: 'Fraud Detection Sentinel Agent' } });
  const findings = await prisma.finding.findMany({ where: { assetId: asset.id } });
  console.log('FINDINGS:', JSON.stringify(findings, null, 2));
  await prisma.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
