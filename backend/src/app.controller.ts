import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Roles } from './auth/roles.decorator';
import { RolesGuard } from './auth/roles.guard';

/**
 * OMG governance API.
 *
 * Every data-bearing endpoint declares the roles permitted to reach it. Only
 * /api/health is intentionally public. See RolesGuard for the authorisation
 * model and its documented limitation (role is claimed, not authenticated).
 */
@Controller('api')
@UseGuards(RolesGuard)
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  /** Public liveness probe. Deliberately exposes no governance data. */
  @Get('health')
  getHealth() {
    return {
      status: 'OPERATIONAL',
      app: 'OrchestrAI Model Governance (OMG)',
      version: 'Phase 10 (Governance Change Management)',
      timestamp: new Date().toISOString(),
    };
  }

  // --- ASSETS ENDPOINTS ---
  @Get('assets')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getAssets() {
    return this.prisma.aIAsset.findMany({
      include: {
        owners: true,
        validations: true,
        evidence: true,
        findings: true,
        complianceAssessments: true,
        killSwitches: true,
        overrides: true,
        incidents: true,
        retirements: true,
        scheduledReviews: true,
        correctiveActions: true,
        alerts: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- PHASE 7: CONTINUOUS MONITORING ENDPOINTS ---
  @Get('monitoring/alerts')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER', 'AUDITOR')
  async getAlerts() {
    return this.prisma.governanceAlert.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('monitoring/reviews')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'AUDITOR',
  )
  async getScheduledReviews() {
    return this.prisma.scheduledReview.findMany({
      orderBy: { dueDate: 'asc' },
    });
  }

  @Post('monitoring/reviews')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async scheduleReview(@Body() body: any) {
    return this.prisma.scheduledReview.create({
      data: {
        assetId: body.assetId,
        reviewType: body.reviewType || 'Quarterly Review',
        owner: body.owner || 'David Chen (Governance Admin)',
        dueDate: new Date(body.dueDate || Date.now()),
        status: body.status || 'Scheduled',
      },
    });
  }

  @Get('monitoring/corrective-actions')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
  )
  async getCorrectiveActions() {
    return this.prisma.correctiveAction.findMany({
      orderBy: { dueDate: 'asc' },
    });
  }

  @Post('monitoring/corrective-actions')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER', 'VALIDATOR')
  async createCorrectiveAction(@Body() body: any) {
    return this.prisma.correctiveAction.create({
      data: {
        assetId: body.assetId,
        title: body.title,
        status: body.status || 'Open',
        severity: body.severity || 'Medium',
        assignedTo: body.assignedTo || 'Sarah Jenkins',
        dueDate: new Date(body.dueDate || Date.now()),
        description: body.description || '',
      },
    });
  }

  // --- USERS ENDPOINTS ---
  // The user directory is administrative data; restricted to administrators.
  @Get('users')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async getUsers() {
    return this.prisma.user.findMany();
  }

  // --- AUDIT LOGS ENDPOINTS ---
  @Get('audit-logs')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER', 'AUDITOR')
  async getAuditLogs() {
    return this.prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
  }
}
