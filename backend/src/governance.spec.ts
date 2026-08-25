/**
 * Q1 Stabilization — Phase 5 (Test Automation).
 * Governance continuity lifecycle: reassessment-triggers and
 * reauthorization-records — create/read/update, plus role-based 403s.
 * See test-setup.ts for the shared-live-database discipline this file follows.
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, testTag, ROLE_HEADER } from './test/test-app';
import { PrismaService } from './prisma.service';

describe('Governance continuity lifecycle (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: any;
  let assetId: string;
  const triggerIds: string[] = [];
  const reauthIds: string[] = [];

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
    server = app.getHttpServer();

    const asset = await prisma.aIAsset.create({
      data: {
        name: testTag('GovAsset'),
        type: 'MODEL',
        description: 'Jest governance-continuity lifecycle fixture asset.',
        department: 'QA',
        accountableOwner: 'Jest Accountable Owner',
        governanceSponsor: 'Jest Governance Sponsor',
        authorityRiskOwner: 'Jest Risk Owner',
        authorityTechnicalOwner: 'Jest Technical Owner',
      },
    });
    assetId = asset.id;
  });

  afterAll(async () => {
    for (const id of triggerIds) {
      try {
        await prisma.reassessmentTrigger.delete({ where: { id } });
      } catch {
        // best-effort cleanup
      }
    }
    for (const id of reauthIds) {
      try {
        await prisma.governanceReauthorizationRecord.delete({ where: { id } });
      } catch {
        // best-effort cleanup
      }
    }
    try {
      await prisma.aIAsset.delete({ where: { id: assetId } });
    } catch {
      // best-effort cleanup
    }
    await app.close();
  });

  describe('reassessment-triggers', () => {
    it('creates a reassessment trigger', async () => {
      const res = await request(server)
        .post('/api/reassessment-triggers')
        .set(ROLE_HEADER, 'SUPER_ADMIN')
        .send({
          assetId,
          triggerType: 'MODEL_CHANGE',
          severity: 'MEDIUM',
          owner: 'Jest Owner',
          comments: 'Created by Jest lifecycle test.',
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.status).toBe('OPEN');
      triggerIds.push(res.body.id);
    });

    it('reads the created trigger back via the list endpoint', async () => {
      const res = await request(server)
        .get('/api/reassessment-triggers')
        .set(ROLE_HEADER, 'SUPER_ADMIN');

      expect(res.status).toBe(200);
      expect(res.body.some((t: any) => triggerIds.includes(t.id))).toBe(true);
    });

    it('updates a trigger (e.g. moving it to RESOLVED)', async () => {
      const id = triggerIds[0];
      const res = await request(server)
        .patch(`/api/reassessment-triggers/${id}`)
        .set(ROLE_HEADER, 'SUPER_ADMIN')
        .send({ status: 'RESOLVED' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('RESOLVED');
    });

    it('denies a VIEWER role write with 403, not a silent success', async () => {
      const res = await request(server)
        .post('/api/reassessment-triggers')
        .set(ROLE_HEADER, 'VIEWER')
        .send({
          assetId,
          triggerType: 'MODEL_CHANGE',
          severity: 'LOW',
          owner: 'Jest',
          comments: 'Should be denied.',
        });

      expect(res.status).toBe(403);
    });

    it('fails closed with 403 when no role header is supplied', async () => {
      const res = await request(server).post('/api/reassessment-triggers').send({
        assetId,
        triggerType: 'MODEL_CHANGE',
        severity: 'LOW',
        owner: 'Jest',
        comments: 'Should be denied.',
      });
      expect(res.status).toBe(403);
    });
  });

  describe('reauthorization-records', () => {
    it('creates a reauthorization record', async () => {
      const res = await request(server)
        .post('/api/reauthorization-records')
        .set(ROLE_HEADER, 'SUPER_ADMIN')
        .send({
          assetId,
          reviewedBy: 'Jest Reviewer',
          decision: 'GO',
          reason: 'Created by Jest lifecycle test.',
          previousState: 'REASSESSMENT_REQUIRED',
          newState: 'AUTHORIZED',
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      reauthIds.push(res.body.id);
    });

    it('reads the created reauthorization record back via the list endpoint', async () => {
      const res = await request(server)
        .get('/api/reauthorization-records')
        .set(ROLE_HEADER, 'SUPER_ADMIN');

      expect(res.status).toBe(200);
      expect(res.body.some((r: any) => reauthIds.includes(r.id))).toBe(true);
    });

    it('denies a VIEWER role write with 403 (only SUPER_ADMIN/GOVERNANCE_ADMIN may create)', async () => {
      const res = await request(server)
        .post('/api/reauthorization-records')
        .set(ROLE_HEADER, 'VIEWER')
        .send({
          assetId,
          reviewedBy: 'Jest',
          decision: 'GO',
          reason: 'Should be denied.',
          previousState: 'DRAFT',
          newState: 'AUTHORIZED',
        });

      expect(res.status).toBe(403);
    });

    it('denies a RISK_OFFICER write too — reauthorization is admin-only, unlike triggers', async () => {
      const res = await request(server)
        .post('/api/reauthorization-records')
        .set(ROLE_HEADER, 'RISK_OFFICER')
        .send({
          assetId,
          reviewedBy: 'Jest',
          decision: 'GO',
          reason: 'Should be denied.',
          previousState: 'DRAFT',
          newState: 'AUTHORIZED',
        });

      expect(res.status).toBe(403);
    });
  });
});
