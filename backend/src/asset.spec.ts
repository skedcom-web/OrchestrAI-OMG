/**
 * Q1 Stabilization — Phase 5 (Test Automation).
 * Asset lifecycle: create (with/without required owners), read, update,
 * archive (soft delete), restore, and 404 boundary behavior.
 * See test-setup.ts for the shared-live-database discipline this file follows.
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, assetFixture, testTag, NONEXISTENT_ID, ROLE_HEADER } from './test/test-app';
import { PrismaService } from './prisma.service';

describe('Asset lifecycle (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: any;
  const createdIds: string[] = [];

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
    server = app.getHttpServer();
  });

  afterAll(async () => {
    for (const id of createdIds) {
      try {
        await prisma.aIAsset.delete({ where: { id } });
      } catch {
        // already removed or never persisted — fine, cleanup best-effort.
      }
    }
    await app.close();
  });

  it('creates an asset when all 4 required governance owners are supplied', async () => {
    const res = await request(server)
      .post('/api/assets')
      .set(ROLE_HEADER, 'SUPER_ADMIN')
      .send(assetFixture());

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.accountableOwner).toBe('Jest Accountable Owner');
    createdIds.push(res.body.id);
  });

  it('rejects creation missing an owner with a 400 naming the missing field', async () => {
    const payload = assetFixture();
    delete (payload as any).authorityRiskOwner;

    const res = await request(server)
      .post('/api/assets')
      .set(ROLE_HEADER, 'SUPER_ADMIN')
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual(expect.stringContaining('Risk Owner'));
  });

  it('rejects creation when every owner is missing, naming all four fields', async () => {
    const payload = assetFixture({
      accountableOwner: '',
      governanceSponsor: '',
      authorityRiskOwner: '',
      authorityTechnicalOwner: '',
    });

    const res = await request(server)
      .post('/api/assets')
      .set(ROLE_HEADER, 'SUPER_ADMIN')
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual(expect.stringContaining('Accountable Owner'));
    expect(res.body.message).toEqual(expect.stringContaining('Governance Sponsor'));
    expect(res.body.message).toEqual(expect.stringContaining('Risk Owner'));
    expect(res.body.message).toEqual(expect.stringContaining('Technical Owner'));
  });

  it('updates an asset', async () => {
    const created = await request(server)
      .post('/api/assets')
      .set(ROLE_HEADER, 'SUPER_ADMIN')
      .send(assetFixture());
    createdIds.push(created.body.id);

    const newDept = testTag('Dept');
    const res = await request(server)
      .patch(`/api/assets/${created.body.id}`)
      .set(ROLE_HEADER, 'SUPER_ADMIN')
      .send({ department: newDept });

    expect(res.status).toBe(200);
    expect(res.body.department).toBe(newDept);
  });

  it('archives an asset via DELETE (soft delete, not a hard remove)', async () => {
    const created = await request(server)
      .post('/api/assets')
      .set(ROLE_HEADER, 'SUPER_ADMIN')
      .send(assetFixture());
    createdIds.push(created.body.id);

    const res = await request(server)
      .delete(`/api/assets/${created.body.id}`)
      .set(ROLE_HEADER, 'SUPER_ADMIN')
      .send({ archivedBy: 'Jest', archiveReason: 'Phase 5 lifecycle test' });

    expect(res.status).toBe(200);
    expect(res.body.archived).toBe(true);
    expect(res.body.asset.isArchived).toBe(true);
    expect(res.body.asset.status).toBe('RETIREMENT');

    // The row must still exist — this is a soft delete, not a hard delete.
    const stillThere = await prisma.aIAsset.findUnique({ where: { id: created.body.id } });
    expect(stillThere).not.toBeNull();
  });

  it('excludes an archived asset from GET /api/assets by default, includes it with includeArchived=true', async () => {
    const created = await request(server)
      .post('/api/assets')
      .set(ROLE_HEADER, 'SUPER_ADMIN')
      .send(assetFixture());
    createdIds.push(created.body.id);

    await request(server)
      .delete(`/api/assets/${created.body.id}`)
      .set(ROLE_HEADER, 'SUPER_ADMIN')
      .send({});

    const defaultList = await request(server).get('/api/assets').set(ROLE_HEADER, 'SUPER_ADMIN');
    expect(defaultList.status).toBe(200);
    expect(defaultList.body.some((a: any) => a.id === created.body.id)).toBe(false);

    const fullList = await request(server)
      .get('/api/assets?includeArchived=true')
      .set(ROLE_HEADER, 'SUPER_ADMIN');
    expect(fullList.status).toBe(200);
    expect(fullList.body.some((a: any) => a.id === created.body.id)).toBe(true);
  });

  it('restores an archived asset', async () => {
    const created = await request(server)
      .post('/api/assets')
      .set(ROLE_HEADER, 'SUPER_ADMIN')
      .send(assetFixture());
    createdIds.push(created.body.id);

    await request(server)
      .delete(`/api/assets/${created.body.id}`)
      .set(ROLE_HEADER, 'SUPER_ADMIN')
      .send({});

    const res = await request(server)
      .patch(`/api/assets/${created.body.id}/restore`)
      .set(ROLE_HEADER, 'SUPER_ADMIN');

    expect(res.status).toBe(200);
    expect(res.body.restored).toBe(true);
    expect(res.body.asset.isArchived).toBe(false);
    expect(res.body.asset.archivedAt).toBeNull();
  });

  it('returns 404 (not a raw 500) for GET/PATCH/DELETE/restore on a nonexistent id', async () => {
    const getRes = await request(server)
      .get(`/api/assets/${NONEXISTENT_ID}`)
      .set(ROLE_HEADER, 'SUPER_ADMIN');
    expect(getRes.status).toBe(404);

    const patchRes = await request(server)
      .patch(`/api/assets/${NONEXISTENT_ID}`)
      .set(ROLE_HEADER, 'SUPER_ADMIN')
      .send({ department: 'X' });
    expect(patchRes.status).toBe(404);

    const deleteRes = await request(server)
      .delete(`/api/assets/${NONEXISTENT_ID}`)
      .set(ROLE_HEADER, 'SUPER_ADMIN')
      .send({});
    expect(deleteRes.status).toBe(404);

    const restoreRes = await request(server)
      .patch(`/api/assets/${NONEXISTENT_ID}/restore`)
      .set(ROLE_HEADER, 'SUPER_ADMIN');
    expect(restoreRes.status).toBe(404);
  });

  it('denies asset creation for a role outside SUPER_ADMIN/GOVERNANCE_ADMIN', async () => {
    const res = await request(server)
      .post('/api/assets')
      .set(ROLE_HEADER, 'VIEWER')
      .send(assetFixture());
    expect(res.status).toBe(403);
  });

  it('fails closed when no role header is supplied at all', async () => {
    const res = await request(server).post('/api/assets').send(assetFixture());
    expect(res.status).toBe(403);
  });
});
