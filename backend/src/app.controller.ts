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
      version: 'Phase 6 (Operational Governance & Kill Switch Center)',
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
        retirements: true
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- PHASE 6: OPERATIONAL ENDPOINTS ---
  @Get('operations/kill-switches')
  async getKillSwitches() {
    return this.prisma.killSwitchRecord.findMany({
      orderBy: { activatedAt: 'desc' },
    });
  }

  @Post('operations/kill-switches')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async requestKillSwitch(@Body() body: any) {
    const ks = await this.prisma.killSwitchRecord.create({
      data: {
        assetId: body.assetId,
        triggerCategory: body.triggerCategory || 'Critical Incident',
        status: body.status || 'Activated',
        requestedBy: body.requestedBy || 'Sarah Jenkins (Super Admin)',
        approvedBy: body.approvedBy || 'Sarah Jenkins (Super Admin)',
        reason: body.reason || 'Emergency circuit breaker engaged.',
      },
    });

    await this.prisma.aIAsset.update({
      where: { id: body.assetId },
      data: { operationalStatus: 'Suspended' },
    });

    return ks;
  }

  @Get('operations/overrides')
  async getOverrides() {
    return this.prisma.overrideRecord.findMany({
      orderBy: { timestamp: 'desc' },
    });
  }

  @Get('operations/incidents')
  async getIncidents() {
    return this.prisma.governanceIncident.findMany({
      orderBy: { createdAt: 'desc' },
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
