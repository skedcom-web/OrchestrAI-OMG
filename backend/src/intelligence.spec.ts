/**
 * Q1 Stabilization — Phase 5 (Test Automation).
 * Intelligence lifecycle (Release 10 Governance Intelligence Studio):
 * condition-definitions, outcome-rules, action-rules.
 *
 * condition-definitions and outcome-rules are singleton catalogues — every
 * GovernanceConditionType / GovernanceOutcomeStatus already has exactly one
 * seeded row in the live database (confirmed by direct inspection before
 * writing this file), each guarded by a unique constraint. So instead of a
 * fresh POST (which would collide with the seed and is exactly the scenario
 * the unique constraint exists to prevent), those two are exercised via a
 * read + update + revert round trip, plus a test that a duplicate create is
 * genuinely rejected rather than silently corrupting the catalogue.
 *
 * action-rules has two still-unused (triggerType, triggerValue) combinations
 * in the live catalogue — OUTCOME/"Attention Required" and OUTCOME/"Compliant"
 * intentionally have no procedural action template (see
 * governanceActionsEngine.ts) — so that table gets a genuine create/read/
 * update/delete lifecycle test.
 *
 * See test-setup.ts for the shared-live-database discipline this file follows.
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, ROLE_HEADER } from './test/test-app';
import { PrismaService } from './prisma.service';

describe('Governance Intelligence Studio lifecycle (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: any;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('condition-definitions', () => {
    const targetId = 'cond-review-overdue';
    let originalDescription = '';

    beforeAll(async () => {
      const row = await prisma.conditionDefinition.findUniqueOrThrow({ where: { id: targetId } });
      originalDescription = row.description;
    });

    afterAll(async () => {
      // Revert — this is shared seed/catalogue data, not this test's own fixture.
      await prisma.conditionDefinition.update({
        where: { id: targetId },
        data: { description: originalDescription },
      });
    });

    it('reads the seeded condition-definition catalogue', async () => {
      const res = await request(server).get('/api/condition-definitions').set(ROLE_HEADER, 'SUPER_ADMIN');
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(6);
      expect(res.body.some((c: any) => c.id === targetId)).toBe(true);
    });

    it('updates a condition-definition, then the change is visible on read', async () => {
      const updated = `${originalDescription} (jest round trip)`;
      const patchRes = await request(server)
        .patch(`/api/condition-definitions/${targetId}`)
        .set(ROLE_HEADER, 'SUPER_ADMIN')
        .send({ description: updated });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.description).toBe(updated);

      const listRes = await request(server).get('/api/condition-definitions').set(ROLE_HEADER, 'SUPER_ADMIN');
      expect(listRes.body.find((c: any) => c.id === targetId).description).toBe(updated);
    });

    it('rejects creating a second definition for an already-catalogued conditionType', async () => {
      const res = await request(server)
        .post('/api/condition-definitions')
        .set(ROLE_HEADER, 'SUPER_ADMIN')
        .send({
          id: 'test-jest-duplicate-condition',
          conditionType: 'REVIEW_OVERDUE',
          label: 'Duplicate — should be rejected',
          description: 'Should be rejected — REVIEW_OVERDUE is already catalogued.',
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      const found = await prisma.conditionDefinition.findUnique({
        where: { id: 'test-jest-duplicate-condition' },
      });
      expect(found).toBeNull();
    });

    it('denies a VIEWER role write with 403', async () => {
      const res = await request(server)
        .patch(`/api/condition-definitions/${targetId}`)
        .set(ROLE_HEADER, 'VIEWER')
        .send({ description: 'should be denied' });
      expect(res.status).toBe(403);
    });
  });

  describe('outcome-rules', () => {
    const targetId = 'outc-compliant';
    let originalDescription = '';

    beforeAll(async () => {
      const row = await prisma.outcomeRule.findUniqueOrThrow({ where: { id: targetId } });
      originalDescription = row.description;
    });

    afterAll(async () => {
      await prisma.outcomeRule.update({ where: { id: targetId }, data: { description: originalDescription } });
    });

    it('reads the seeded outcome-rule ladder', async () => {
      const res = await request(server).get('/api/outcome-rules').set(ROLE_HEADER, 'SUPER_ADMIN');
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(5);
      expect(res.body.some((o: any) => o.id === targetId)).toBe(true);
    });

    it('updates an outcome-rule, then the change is visible on read', async () => {
      const updated = `${originalDescription} (jest round trip)`;
      const patchRes = await request(server)
        .patch(`/api/outcome-rules/${targetId}`)
        .set(ROLE_HEADER, 'SUPER_ADMIN')
        .send({ description: updated });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.description).toBe(updated);
    });

    it('rejects creating a second rule for an already-catalogued outcomeStatus', async () => {
      const res = await request(server)
        .post('/api/outcome-rules')
        .set(ROLE_HEADER, 'SUPER_ADMIN')
        .send({
          id: 'test-jest-duplicate-outcome',
          outcomeStatus: 'COMPLIANT',
          description: 'Should be rejected — COMPLIANT is already catalogued.',
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      const found = await prisma.outcomeRule.findUnique({ where: { id: 'test-jest-duplicate-outcome' } });
      expect(found).toBeNull();
    });
  });

  describe('action-rules', () => {
    // OUTCOME/"Attention Required" has no seeded row (Compliant and Attention
    // Required deliberately have no standing procedural action) — safe to
    // exercise a full create/update/delete lifecycle on it.
    const triggerValue = 'Attention Required';
    let createdId: string | undefined;

    afterAll(async () => {
      if (createdId) {
        try {
          await prisma.actionRule.delete({ where: { id: createdId } });
        } catch {
          /* already deleted by its own test */
        }
      }
    });

    it('creates an action-rule', async () => {
      const res = await request(server)
        .post('/api/action-rules')
        .set(ROLE_HEADER, 'SUPER_ADMIN')
        .send({
          triggerType: 'OUTCOME',
          triggerValue,
          actionType: 'REVIEW',
          actionName: 'Jest Test Action',
          actionDescription: 'Created by Jest lifecycle test.',
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      createdId = res.body.id;
    });

    it('reads the created action-rule back via the list endpoint', async () => {
      const res = await request(server).get('/api/action-rules').set(ROLE_HEADER, 'SUPER_ADMIN');
      expect(res.status).toBe(200);
      expect(res.body.some((r: any) => r.id === createdId)).toBe(true);
    });

    it('updates the action-rule', async () => {
      const res = await request(server)
        .patch(`/api/action-rules/${createdId}`)
        .set(ROLE_HEADER, 'SUPER_ADMIN')
        .send({ enabled: false });

      expect(res.status).toBe(200);
      expect(res.body.enabled).toBe(false);
    });

    it('rejects a second action-rule for the same (triggerType, triggerValue) pair', async () => {
      const res = await request(server)
        .post('/api/action-rules')
        .set(ROLE_HEADER, 'SUPER_ADMIN')
        .send({
          triggerType: 'OUTCOME',
          triggerValue,
          actionType: 'ESCALATION',
          actionName: 'Duplicate — should be rejected',
          actionDescription: 'Should be rejected — duplicate (triggerType, triggerValue) pair.',
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('deletes the action-rule', async () => {
      const res = await request(server)
        .delete(`/api/action-rules/${createdId}`)
        .set(ROLE_HEADER, 'SUPER_ADMIN');

      expect(res.status).toBe(200);
      const found = await prisma.actionRule.findUnique({ where: { id: createdId! } });
      expect(found).toBeNull();
      createdId = undefined;
    });

    it('denies a VIEWER role write with 403', async () => {
      const res = await request(server)
        .post('/api/action-rules')
        .set(ROLE_HEADER, 'VIEWER')
        .send({
          triggerType: 'OUTCOME',
          triggerValue: 'Compliant',
          actionType: 'REVIEW',
          actionName: 'Should be denied',
          actionDescription: 'Should be denied.',
        });
      expect(res.status).toBe(403);
    });
  });
});
