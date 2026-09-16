const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const asset = await prisma.aIAsset.findFirst({ where: { name: 'Fraud Detection Sentinel Agent' } });
  const reviews = await prisma.scheduledReview.findMany({ where: { assetId: asset.id } });
  console.log(JSON.stringify(reviews, null, 2));
  await prisma.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
