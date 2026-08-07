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
      version: 'Phase 5 (Compliance & Regulatory Intelligence Center)',
      timestamp: new Date().toISOString(),
    };
  }

  // --- ASSETS ENDPOINTS ---
  @Get('assets')
  async getAssets() {
    return this.prisma.aIAsset.findMany({
      include: { owners: true, validations: true, evidence: true, findings: true, complianceAssessments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- PHASE 5: COMPLIANCE ASSESSMENTS ENDPOINTS ---
  @Get('compliance/assessments')
  async getComplianceAssessments() {
    return this.prisma.complianceAssessmentRecord.findMany({
      orderBy: { assessedDate: 'desc' },
    });
  }

  @Post('compliance/assessments')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER', 'AUDITOR')
  async createComplianceAssessment(@Body() body: any) {
    return this.prisma.complianceAssessmentRecord.create({
      data: {
        assetId: body.assetId,
        controlId: body.controlId,
        controlName: body.controlName || '',
        status: body.status || 'Compliant',
        score: body.score ?? 100,
        assessor: body.assessor || 'Robert Vance (Auditor)',
        notes: body.notes || '',
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
