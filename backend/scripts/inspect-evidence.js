const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const names = ['Fraud Detection Sentinel Agent', 'AML Regulatory Intelligence RAG'];
  for (const name of names) {
    const asset = await prisma.aIAsset.findFirst({ where: { name } });
    if (!asset) { console.log(name, '-> NOT FOUND'); continue; }
    const evidence = await prisma.evidenceRecord.findMany({ where: { assetId: asset.id } });
    console.log(`\n=== ${name} (${asset.id}, risk=${asset.riskLevel}) — ${evidence.length} evidence row(s) ===`);
    console.log(JSON.stringify(evidence, null, 2));
  }
  await prisma.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
