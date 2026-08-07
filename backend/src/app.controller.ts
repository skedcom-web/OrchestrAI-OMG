import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Roles } from './auth/roles.decorator';
import { RolesGuard } from './auth/roles.guard';

@Controller('api')
@UseGuards(RolesGuard)
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  getHealth() {
    return {
      status: 'OPERATIONAL',
      app: 'OrchestrAI Model Governance (OMG)',
      version: 'Phase 7 (Continuous Monitoring & Governance Review Center)',
      timestamp: new Date().toISOString(),
    };
  }

  // --- ASSETS ENDPOINTS ---
  @Get('assets')
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
        alerts: true
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- PHASE 7: CONTINUOUS MONITORING ENDPOINTS ---
  @Get('monitoring/alerts')
  async getAlerts() {
    return this.prisma.governanceAlert.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('monitoring/reviews')
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
  @Get('users')
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
