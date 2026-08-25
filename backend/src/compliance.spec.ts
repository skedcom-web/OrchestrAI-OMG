/**
 * Q1 Stabilization — Phase 5 (Test Automation).
 * Compliance lifecycle: compliance-packs -> compliance-requirements ->
 * pack-controls CRUD, following the real Pack -> Requirement -> Control
 * hierarchy (Release 5's Universal Compliance Pack Framework).
 * See test-setup.ts for the shared-live-database discipline this file follows.
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, testTag, ROLE_HEADER } from './test/test-app';
import { PrismaService } from './prisma.service';

describe('Compliance pack lifecycle (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: any;

  const packId = testTag('PACK');
  const requirementId = testTag('REQ');
  const controlId = testTag('CTRL');

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
    server = app.getHttpServer();
  });

  afterAll(async () => {
    // Reverse-order best-effort cleanup — cascade would handle it too, but
    // being explicit means a failed earlier assertion still leaves nothing behind.
    try {
      await prisma.packControl.delete({ where: { id: controlId } });
    } catch {
      /* already removed by its own test */
    }
    try {
      await prisma.complianceRequirement.delete({ where: { id: requirementId } });
    } catch {
      /* already removed by its own test */
    }
    try {
      await prisma.compliancePack.delete({ where: { id: packId } });
    } catch {
      /* already removed by its own test */
    }
    await app.close();
  });

  it('creates a compliance pack', async () => {
    const res = await request(server)
      .post('/api/compliance-packs')
      .set(ROLE_HEADER, 'SUPER_ADMIN')
      .send({
        id: packId,
        name: testTag('Pack Name'),
        owner: 'Jest Owner',
        description: 'Created by Jest lifecycle test.',
        industry: 'Banking',
        effectiveDate: new Date().toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(packId);
    expect(res.body.status).toBe('DRAFT');
  });

  it('reads the pack back via the list endpoint', async () => {
    const res = await request(server).get('/api/compliance-packs').set(ROLE_HEADER, 'SUPER_ADMIN');
    expect(res.status).toBe(200);
    expect(res.body.some((p: any) => p.id === packId)).toBe(true);
  });

  it('updates the pack', async () => {
    const res = await request(server)
      .patch(`/api/compliance-packs/${packId}`)
      .set(ROLE_HEADER, 'SUPER_ADMIN')
      .send({ status: 'ACTIVE' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ACTIVE');
  });

  it('creates a requirement under the pack', async () => {
    const res = await request(server)
      .post('/api/compliance-requirements')
      .set(ROLE_HEADER, 'SUPER_ADMIN')
      .send({
        id: requirementId,
        name: testTag('Requirement Name'),
        description: 'Created by Jest lifecycle test.',
        packId,
        category: 'Governance',
      });

    expect(res.status).toBe(201);
    expect(res.body.packId).toBe(packId);
  });

  it('creates a control under the requirement', async () => {
    const res = await request(server)
      .post('/api/pack-controls')
      .set(ROLE_HEADER, 'SUPER_ADMIN')
      .send({
        id: controlId,
        name: testTag('Control Name'),
        description: 'Created by Jest lifecycle test.',
        requirementId,
        owner: 'Jest Control Owner',
      });

    expect(res.status).toBe(201);
    expect(res.body.requirementId).toBe(requirementId);
  });

  it('updates the control', async () => {
    const res = await request(server)
      .patch(`/api/pack-controls/${controlId}`)
      .set(ROLE_HEADER, 'SUPER_ADMIN')
      .send({ status: 'ACTIVE' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ACTIVE');
  });

  it('denies a VIEWER role write with 403', async () => {
    const res = await request(server)
      .post('/api/compliance-packs')
      .set(ROLE_HEADER, 'VIEWER')
      .send({
        id: testTag('DeniedPack'),
        name: 'Denied Pack',
        owner: 'Jest',
        description: 'Should be denied.',
        industry: 'Banking',
        effectiveDate: new Date().toISOString(),
      });

    expect(res.status).toBe(403);
  });

  it('deletes the control, then the requirement, then the pack', async () => {
    const deleteControl = await request(server)
      .delete(`/api/pack-controls/${controlId}`)
      .set(ROLE_HEADER, 'SUPER_ADMIN');
    expect(deleteControl.status).toBe(200);
    expect(await prisma.packControl.findUnique({ where: { id: controlId } })).toBeNull();

    const deleteRequirement = await request(server)
      .delete(`/api/compliance-requirements/${requirementId}`)
      .set(ROLE_HEADER, 'SUPER_ADMIN');
    expect(deleteRequirement.status).toBe(200);
    expect(await prisma.complianceRequirement.findUnique({ where: { id: requirementId } })).toBeNull();

    const deletePack = await request(server)
      .delete(`/api/compliance-packs/${packId}`)
      .set(ROLE_HEADER, 'SUPER_ADMIN');
    expect(deletePack.status).toBe(200);
    expect(await prisma.compliancePack.findUnique({ where: { id: packId } })).toBeNull();
  });
});
