const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const review = await prisma.scheduledReview.findFirst({ where: { id: '5496cf8d-37e2-4ff9-91ba-9bf379ed5a32' } });
  if (!review) { console.warn('SKIP: review not found'); await prisma.$disconnect(); return; }
  await prisma.scheduledReview.update({
    where: { id: review.id },
    data: { status: 'Completed', outcome: 'No material findings — governance position reaffirmed.' },
  });
  console.log('Marked the overdue Quarterly Review for Fraud Detection Sentinel Agent as Completed.');
  await prisma.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
