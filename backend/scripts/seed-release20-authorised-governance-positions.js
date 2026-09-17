/**
 * Release 20 — Governance Position Lifecycle Interoperability Foundation.
 *
 * AuthorisedGovernancePosition and GovernancePositionContract were migrated
 * from frontend-only/localStorage (Release 19) to real Prisma/Neon
 * persistence. This is a one-time migration of the existing, already-
 * verified Release 19.2 practitioner demonstration dataset (4 real
 * production assets, matched by name — never a hardcoded id) into the new
 * backend table, so the "one asset per canonical Unified Governance State"
 * narrative established in Release 19.2 survives the migration instead of
 * resetting to "no position" for every asset.
 *
 * AML Regulatory Intelligence RAG is deliberately excluded — it has no
 * Authorised Governance Position by design, driving its Pending
 * Reauthorisation state (see mockData.ts's own comment on this).
 *
 * Idempotent: skips any asset that already has an AuthorisedGovernancePosition row.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const POSITIONS = [
  {
    assetName: 'Fraud Detection Sentinel Agent',
    authorisedGovernanceState: 'Monitoring',
    conditions: ['Human Oversight required on every account-freeze recommendation', 'Monthly Review of behavior monitoring status'],
    obligations: ['Escalate any Watchlist/Alert behavior status within 24 hours'],
    assumptions: ['Transaction data feed remains within its documented latency bounds'],
    authorityProvenanceRef: 'GOV-2026-014',
    evidenceRequirements: ['Independent Validation Report', 'Kill Switch Control Assessment'],
    validFrom: '2026-01-15', validUntil: '2026-12-31', status: 'Active',
  },
  {
    assetName: 'Customer Concierge Copilot',
    authorisedGovernanceState: 'Monitoring',
    conditions: ['Human-in-the-loop review remains available for escalated conversations'],
    obligations: ['Restore full conversation monitoring coverage within 30 days of a degradation'],
    assumptions: ['Monitoring vendor migration is a temporary condition, not a permanent reduction in coverage'],
    authorityProvenanceRef: 'GOV-2026-021',
    evidenceRequirements: ['Agent Handling Training Record', 'Data Handling Policy'],
    validFrom: '2026-06-01', validUntil: '2026-12-31', status: 'Active',
  },
  {
    assetName: 'Retail Credit Scoring Engine',
    authorisedGovernanceState: 'Conditional GO',
    conditions: ['Fair lending bias testing performed each release cycle', 'Human sign-off required above the auto-decision threshold'],
    obligations: ['Refresh authority review before the current review period lapses'],
    assumptions: ['Underlying credit bureau data feed composition remains materially unchanged'],
    authorityProvenanceRef: 'GOV-2026-017',
    evidenceRequirements: ['Risk Assessment', 'Conditional GO Approval Record'],
    validFrom: '2026-03-01', validUntil: '2026-12-31', status: 'Active',
  },
  {
    assetName: 'Enterprise Portfolio Multi-Agent System',
    authorisedGovernanceState: 'No GO',
    conditions: ['Trade execution limited to the configured risk band', 'Human sign-off required above the Portfolio Rebalancing Directive threshold'],
    obligations: ['Maintain current vendor certification for the underlying trade execution model'],
    assumptions: ['Vendor certification for the trade execution model remains valid'],
    authorityProvenanceRef: 'GOV-2026-009',
    evidenceRequirements: ['Consensus Loop Incident Report'],
    validFrom: '2026-07-01', validUntil: '2026-08-04', status: 'Suspended',
  },
];

async function main() {
  for (const p of POSITIONS) {
    const asset = await prisma.aIAsset.findFirst({ where: { name: p.assetName } });
    if (!asset) { console.warn(`SKIP: asset "${p.assetName}" not found.`); continue; }

    const existing = await prisma.authorisedGovernancePosition.findFirst({ where: { assetId: asset.id } });
    if (existing) { console.log(`SKIP: "${p.assetName}" already has an AuthorisedGovernancePosition (${existing.id}).`); continue; }

    const created = await prisma.authorisedGovernancePosition.create({
      data: {
        assetId: asset.id,
        assetName: asset.name,
        authorisedGovernanceState: p.authorisedGovernanceState,
        conditions: p.conditions,
        obligations: p.obligations,
        assumptions: p.assumptions,
        positionOrigin: 'Internal',
        authorityProvenanceRef: p.authorityProvenanceRef,
        evidenceRequirements: p.evidenceRequirements,
        validFrom: new Date(p.validFrom),
        validUntil: new Date(p.validUntil),
        status: p.status,
        createdBy: 'David Chen (Governance Admin)',
      },
    });
    console.log(`Created AuthorisedGovernancePosition for "${p.assetName}" -> ${created.id} (${created.status}, ${created.authorisedGovernanceState}).`);
  }
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
