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
      version: 'Phase 3 (Validation & Evidence Command Center)',
      timestamp: new Date().toISOString(),
    };
  }

  // --- ASSETS ENDPOINTS ---
  @Get('assets')
  async getAssets() {
    return this.prisma.aIAsset.findMany({
      include: { owners: true, validations: true, evidence: true, findings: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('assets')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'BUSINESS_OWNER')
  async createAsset(@Body() body: any) {
    return this.prisma.aIAsset.create({
      data: {
        name: body.name,
        type: body.type || 'AGENT',
        description: body.description || '',
        department: body.department || 'Enterprise AI',
        version: body.version || '1.0.0',
        status: body.status || 'DRAFT',
        riskLevel: body.riskLevel || 'MEDIUM',
        techStack: body.techStack || [],
        dataSensitivity: body.dataSensitivity || 'Confidential',
      },
    });
  }

  // --- PHASE 3: VALIDATIONS ENDPOINTS ---
  @Get('validations')
  async getValidations() {
    return this.prisma.validationRecord.findMany({
      orderBy: { reviewDate: 'desc' },
    });
  }

  @Post('validations')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'VALIDATOR', 'RISK_OFFICER')
  async createValidation(@Body() body: any) {
    return this.prisma.validationRecord.create({
      data: {
        assetId: body.assetId,
        category: body.category,
        reviewer: body.reviewer || 'Dr. Aris Thorne',
        reviewerRole: body.reviewerRole || 'VALIDATOR',
        status: body.status || 'Approved',
        score: body.score ?? 100,
        findings: body.findings || '',
        recommendations: body.recommendations || '',
      },
    });
  }

  // --- PHASE 3: EVIDENCE ENDPOINTS ---
  @Get('evidence')
  async getEvidence() {
    return this.prisma.evidenceDocument.findMany({
      orderBy: { uploadDate: 'desc' },
    });
  }

  @Post('evidence')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'BUSINESS_OWNER', 'VALIDATOR')
  async createEvidence(@Body() body: any) {
    return this.prisma.evidenceDocument.create({
      data: {
        title: body.title,
        category: body.category,
        deliverableType: body.deliverableType,
        assetId: body.assetId,
        uploadedBy: body.uploadedBy,
        version: body.version || '1.0',
        status: body.status || 'Submitted',
        description: body.description || '',
      },
    });
  }

  // --- PHASE 3: FINDINGS ENDPOINTS ---
  @Get('findings')
  async getFindings() {
    return this.prisma.finding.findMany({
      orderBy: { reportedDate: 'desc' },
    });
  }

  @Post('findings')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'VALIDATOR', 'RISK_OFFICER')
  async createFinding(@Body() body: any) {
    return this.prisma.finding.create({
      data: {
        title: body.title,
        assetId: body.assetId,
        severity: body.severity || 'Medium',
        status: body.status || 'Open',
        assignedTo: body.assignedTo || 'Sarah Jenkins',
        reportedBy: body.reportedBy || 'Dr. Aris Thorne',
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
