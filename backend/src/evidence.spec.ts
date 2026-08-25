/**
 * Q1 Stabilization — Phase 5 (Test Automation).
 * Evidence lifecycle: evidence-records CRUD, plus a negative test that an
 * evidence record referencing a nonexistent assetId is rejected rather than
 * silently persisted with a dangling foreign key.
 * See test-setup.ts for the shared-live-database discipline this file follows.
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, testTag, NONEXISTENT_ID, ROLE_HEADER } from './test/test-app';
import { PrismaService } from './prisma.service';

describe('Evidence lifecycle (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: any;
  let assetId: string;
  const evidenceIds: string[] = [];

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
    server = app.getHttpServer();

    const asset = await prisma.aIAsset.create({
      data: {
        name: testTag('EvidenceAsset'),
        type: 'MODEL',
        description: 'Jest evidence lifecycle fixture asset.',
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
    for (const id of evidenceIds) {
      try {
        await prisma.evidenceRecord.delete({ where: { id } });
      } catch {
        // already deleted by its own test, or never persisted — fine.
      }
    }
    try {
      await prisma.aIAsset.delete({ where: { id: assetId } });
    } catch {
      // best-effort cleanup
    }
    await app.close();
  });

  it('creates an evidence record', async () => {
    const res = await request(server)
      .post('/api/evidence-records')
      .set(ROLE_HEADER, 'SUPER_ADMIN')
      .send({
        name: testTag('Evidence'),
        evidenceType: 'VALIDATION_REPORT',
        assetId,
        evidenceOwner: 'Jest Evidence Owner',
        description: 'Created by Jest lifecycle test.',
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe('DRAFT');
    evidenceIds.push(res.body.id);
  });

  it('reads the evidence record back by id', async () => {
    const id = evidenceIds[0];
    const res = await request(server)
      .get(`/api/evidence-records/${id}`)
      .set(ROLE_HEADER, 'SUPER_ADMIN');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.assetId).toBe(assetId);
  });

  it('returns 404 for a nonexistent evidence record id', async () => {
    const res = await request(server)
      .get(`/api/evidence-records/${NONEXISTENT_ID}`)
      .set(ROLE_HEADER, 'SUPER_ADMIN');

    expect(res.status).toBe(404);
  });

  it('updates an evidence record', async () => {
    const id = evidenceIds[0];
    const res = await request(server)
      .patch(`/api/evidence-records/${id}`)
      .set(ROLE_HEADER, 'SUPER_ADMIN')
      .send({ status: 'ACTIVE' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ACTIVE');
  });

  it('rejects an evidence record whose assetId does not exist (not silently corrupted)', async () => {
    const res = await request(server)
      .post('/api/evidence-records')
      .set(ROLE_HEADER, 'SUPER_ADMIN')
      .send({
        name: testTag('OrphanEvidence'),
        evidenceType: 'VALIDATION_REPORT',
        assetId: NONEXISTENT_ID,
        evidenceOwner: 'Jest Evidence Owner',
        description: 'Should be rejected — assetId does not reference a real asset.',
      });

    // The API must not report success for a record with a dangling FK.
    expect(res.status).toBeGreaterThanOrEqual(400);

    // And the row must genuinely not exist afterwards.
    const found = await prisma.evidenceRecord.findFirst({ where: { assetId: NONEXISTENT_ID } });
    expect(found).toBeNull();
  });

  it('denies a VIEWER role write with 403', async () => {
    const res = await request(server)
      .post('/api/evidence-records')
      .set(ROLE_HEADER, 'VIEWER')
      .send({
        name: testTag('DeniedEvidence'),
        evidenceType: 'VALIDATION_REPORT',
        assetId,
        evidenceOwner: 'Jest',
        description: 'Should be denied.',
      });

    expect(res.status).toBe(403);
  });

  it('deletes an evidence record', async () => {
    const id = evidenceIds.pop()!;
    const res = await request(server)
      .delete(`/api/evidence-records/${id}`)
      .set(ROLE_HEADER, 'SUPER_ADMIN');

    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);

    const found = await prisma.evidenceRecord.findUnique({ where: { id } });
    expect(found).toBeNull();
  });
});
