/**
 * Q1 Stabilization — Phase 5 (Test Automation).
 * Decision traceability lifecycle (Release 7/8): governance-findings and
 * recommended-actions CRUD, built on their own fixture GovernancePolicy and
 * AIAsset so nothing here touches real governance data.
 * See test-setup.ts for the shared-live-database discipline this file follows.
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, testTag, ROLE_HEADER } from './test/test-app';
import { PrismaService } from './prisma.service';

describe('Decision traceability lifecycle (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: any;
  let assetId: string;
  let policyId: string;
  const findingIds: string[] = [];
  const actionIds: string[] = [];

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
    server = app.getHttpServer();

    const asset = await prisma.aIAsset.create({
      data: {
        name: testTag('TraceAsset'),
        type: 'MODEL',
        description: 'Jest decision-traceability lifecycle fixture asset.',
        department: 'QA',
        accountableOwner: 'Jest Accountable Owner',
        governanceSponsor: 'Jest Governance Sponsor',
        authorityRiskOwner: 'Jest Risk Owner',
        authorityTechnicalOwner: 'Jest Technical Owner',
      },
    });
    assetId = asset.id;

    policyId = testTag('POLICY');
    const policyRes = await request(server)
      .post('/api/governance-policies')
      .set(ROLE_HEADER, 'SUPER_ADMIN')
      .send({
        id: policyId,
        name: testTag('Jest Policy'),
        description: 'Jest decision-traceability fixture policy.',
        category: 'Governance',
        triggerCondition: 'MISSING_OWNER',
        linkedControlIds: [],
      });
    expect(policyRes.status).toBe(201);
  });

  afterAll(async () => {
    for (const id of actionIds) {
      try {
        await prisma.recommendedAction.delete({ where: { id } });
      } catch {
        /* already deleted by its own test */
      }
    }
    for (const id of findingIds) {
      try {
        await prisma.governanceFinding.delete({ where: { id } });
      } catch {
        /* already deleted by its own test */
      }
    }
    try {
      await prisma.governancePolicy.delete({ where: { id: policyId } });
    } catch {
      /* best-effort cleanup */
    }
    try {
      await prisma.aIAsset.delete({ where: { id: assetId } });
    } catch {
      /* best-effort cleanup */
    }
    await app.close();
  });

  describe('governance-findings', () => {
    it('creates a governance finding', async () => {
      const res = await request(server)
        .post('/api/governance-findings')
        .set(ROLE_HEADER, 'SUPER_ADMIN')
        .send({
          assetId,
          policyId,
          conditionType: 'MISSING_OWNER',
          severity: 'HIGH',
          detail: 'Created by Jest lifecycle test.',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('OPEN');
      findingIds.push(res.body.id);
    });

    it('reads the finding back via the list endpoint', async () => {
      const res = await request(server).get('/api/governance-findings').set(ROLE_HEADER, 'SUPER_ADMIN');
      expect(res.status).toBe(200);
      expect(res.body.some((f: any) => findingIds.includes(f.id))).toBe(true);
    });

    it('updates a finding (e.g. resolving it)', async () => {
      const id = findingIds[0];
      const res = await request(server)
        .patch(`/api/governance-findings/${id}`)
        .set(ROLE_HEADER, 'SUPER_ADMIN')
        .send({ status: 'RESOLVED', resolutionNotes: 'Resolved by Jest lifecycle test.' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('RESOLVED');
    });

    it('denies a VIEWER role write with 403', async () => {
      const res = await request(server)
        .post('/api/governance-findings')
        .set(ROLE_HEADER, 'VIEWER')
        .send({ assetId, policyId, conditionType: 'MISSING_OWNER', severity: 'LOW', detail: 'Should be denied.' });
      expect(res.status).toBe(403);
    });
  });

  describe('recommended-actions', () => {
    it('creates a recommended action linked to the finding', async () => {
      const res = await request(server)
        .post('/api/recommended-actions')
        .set(ROLE_HEADER, 'SUPER_ADMIN')
        .send({
          actionType: 'OWNERSHIP',
          name: testTag('Action'),
          description: 'Created by Jest lifecycle test.',
          assetId,
          policyId,
          findingId: findingIds[0],
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('OPEN');
      actionIds.push(res.body.id);
    });

    it('reads the action back via the list endpoint', async () => {
      const res = await request(server).get('/api/recommended-actions').set(ROLE_HEADER, 'SUPER_ADMIN');
      expect(res.status).toBe(200);
      expect(res.body.some((a: any) => actionIds.includes(a.id))).toBe(true);
    });

    it('updates a recommended action — a human Accept decision, per Release 9', async () => {
      const id = actionIds[0];
      const res = await request(server)
        .patch(`/api/recommended-actions/${id}`)
        .set(ROLE_HEADER, 'SUPER_ADMIN')
        .send({ status: 'ACCEPTED', decidedBy: 'Jest Reviewer', decidedAt: new Date().toISOString() });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ACCEPTED');
      expect(res.body.decidedBy).toBe('Jest Reviewer');
    });

    it('allows a BUSINESS_OWNER to update (per the widened PATCH role list) but not create', async () => {
      const patchRes = await request(server)
        .patch(`/api/recommended-actions/${actionIds[0]}`)
        .set(ROLE_HEADER, 'BUSINESS_OWNER')
        .send({ status: 'IN_PROGRESS' });
      expect(patchRes.status).toBe(200);

      const createRes = await request(server)
        .post('/api/recommended-actions')
        .set(ROLE_HEADER, 'BUSINESS_OWNER')
        .send({ actionType: 'REVIEW', name: 'Should be denied', description: 'Should be denied.', assetId });
      expect(createRes.status).toBe(403);
    });

    it('deletes a recommended action', async () => {
      const id = actionIds.pop()!;
      const res = await request(server)
        .delete(`/api/recommended-actions/${id}`)
        .set(ROLE_HEADER, 'SUPER_ADMIN');

      expect(res.status).toBe(200);
      const found = await prisma.recommendedAction.findUnique({ where: { id } });
      expect(found).toBeNull();
    });
  });
});
