/**
 * Q1 Stabilization — Phase 5 (Test Automation) shared test harness.
 *
 * There is no separate test database — only one live Neon Postgres instance
 * exists, the same one production and local development use (see backend/.env
 * DATABASE_URL). Every integration test therefore runs against that same
 * database. To keep this safe, every fixture created here is created and
 * torn down by the test that created it (see each *.spec.ts's afterAll),
 * using uniquely tagged names/values via testTag() so a fixture can never be
 * mistaken for real governance data, and cleanup runs even on assertion
 * failure. Do not write a test that leaves data behind.
 */
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma.service';

export const ROLE_HEADER = 'x-user-role';

/** Looks like a real UUID but was never created — used to test 404 boundaries. */
export const NONEXISTENT_ID = '00000000-0000-4000-8000-000000000000';

let counter = 0;

/** A short, uniquely-tagged string for fixture names — never collides across a full test run. */
export function testTag(prefix: string): string {
  counter += 1;
  return `${prefix}-JEST-${Date.now()}-${counter}`;
}

/** A minimal, valid AI asset payload satisfying Phase 1's required-ownership validation. */
export function assetFixture(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    name: testTag('Asset'),
    type: 'AGENT',
    description: 'Created by the Q1 Stabilization Jest suite — safe to delete.',
    department: 'QA Automation',
    accountableOwner: 'Jest Accountable Owner',
    governanceSponsor: 'Jest Governance Sponsor',
    authorityRiskOwner: 'Jest Risk Owner',
    authorityTechnicalOwner: 'Jest Technical Owner',
    ...overrides,
  };
}

/** Boots a real Nest application (the actual AppModule, actual RolesGuard, actual Prisma client) for supertest to hit. */
export async function createTestApp(): Promise<{ app: INestApplication; prisma: PrismaService }> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();

  const prisma = moduleRef.get(PrismaService);
  return { app, prisma };
}
