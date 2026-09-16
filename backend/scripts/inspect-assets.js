const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const assets = await prisma.aIAsset.findMany({
    select: {
      id: true, name: true, status: true, operationalStatus: true, riskLevel: true,
      lastReviewDate: true, nextReviewDate: true, oversightType: true, governanceState: true,
      accountableOwner: true, governanceSponsor: true, authorityRiskOwner: true,
      authorityTechnicalOwner: true, authorityComplianceOwner: true,
      humanOverrideAuthority: true, killSwitchAuthority: true, reassessmentAuthority: true,
      decisionOutcome: true, isArchived: true,
    }
  });
  console.log(JSON.stringify(assets, null, 2));
  await prisma.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
