import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, NotFoundException } from '@nestjs/common';
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

  @Get('assets/:id')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getAsset(@Param('id') id: string) {
    const asset = await this.prisma.aIAsset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException(`Asset ${id} not found`);
    return asset;
  }

  @Post('assets')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createAsset(@Body() body: any) {
    return this.prisma.aIAsset.create({ data: body });
  }

  @Patch('assets/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async updateAsset(@Param('id') id: string, @Body() body: any) {
    return this.prisma.aIAsset.update({ where: { id }, data: body });
  }

  @Delete('assets/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async deleteAsset(@Param('id') id: string) {
    await this.prisma.aIAsset.delete({ where: { id } });
    return { deleted: true, id };
  }

  // --- RELEASE 4: EVIDENCE REPOSITORY ENDPOINTS ---
  @Get('evidence-records')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getEvidenceRecords() {
    return this.prisma.evidenceRecord.findMany({ orderBy: { createdDate: 'desc' } });
  }

  @Get('evidence-records/:id')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getEvidenceRecord(@Param('id') id: string) {
    const record = await this.prisma.evidenceRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`Evidence record ${id} not found`);
    return record;
  }

  @Post('evidence-records')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async createEvidenceRecord(@Body() body: any) {
    return this.prisma.evidenceRecord.create({ data: body });
  }

  @Patch('evidence-records/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async updateEvidenceRecord(@Param('id') id: string, @Body() body: any) {
    return this.prisma.evidenceRecord.update({ where: { id }, data: body });
  }

  @Delete('evidence-records/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async deleteEvidenceRecord(@Param('id') id: string) {
    await this.prisma.evidenceRecord.delete({ where: { id } });
    return { deleted: true, id };
  }

  // --- RELEASE 4: GOVERNANCE (CONTINUITY) REPOSITORY ENDPOINTS ---
  @Get('reassessment-triggers')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER', 'AUDITOR')
  async getReassessmentTriggers() {
    return this.prisma.reassessmentTrigger.findMany({ orderBy: { dateDetected: 'desc' } });
  }

  @Post('reassessment-triggers')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async createReassessmentTrigger(@Body() body: any) {
    return this.prisma.reassessmentTrigger.create({ data: body });
  }

  @Patch('reassessment-triggers/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async updateReassessmentTrigger(@Param('id') id: string, @Body() body: any) {
    return this.prisma.reassessmentTrigger.update({ where: { id }, data: body });
  }

  @Get('reauthorization-records')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER', 'AUDITOR')
  async getReauthorizationRecords() {
    return this.prisma.governanceReauthorizationRecord.findMany({ orderBy: { reviewDate: 'desc' } });
  }

  @Post('reauthorization-records')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createReauthorizationRecord(@Body() body: any) {
    return this.prisma.governanceReauthorizationRecord.create({ data: body });
  }

  // --- RELEASE 5: COMPLIANCE PACK FRAMEWORK ENDPOINTS ---
  @Get('compliance-packs')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getCompliancePacks() {
    return this.prisma.compliancePack.findMany({
      include: { requirements: { include: { controls: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('compliance-packs')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createCompliancePack(@Body() body: any) {
    return this.prisma.compliancePack.create({ data: body });
  }

  @Patch('compliance-packs/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async updateCompliancePack(@Param('id') id: string, @Body() body: any) {
    return this.prisma.compliancePack.update({ where: { id }, data: body });
  }

  @Delete('compliance-packs/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async deleteCompliancePack(@Param('id') id: string) {
    await this.prisma.compliancePack.delete({ where: { id } });
    return { deleted: true, id };
  }

  @Get('compliance-requirements')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getComplianceRequirements() {
    return this.prisma.complianceRequirement.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post('compliance-requirements')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createComplianceRequirement(@Body() body: any) {
    return this.prisma.complianceRequirement.create({ data: body });
  }

  @Patch('compliance-requirements/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async updateComplianceRequirement(@Param('id') id: string, @Body() body: any) {
    return this.prisma.complianceRequirement.update({ where: { id }, data: body });
  }

  @Delete('compliance-requirements/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async deleteComplianceRequirement(@Param('id') id: string) {
    await this.prisma.complianceRequirement.delete({ where: { id } });
    return { deleted: true, id };
  }

  @Get('pack-controls')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getPackControls() {
    return this.prisma.packControl.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post('pack-controls')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createPackControl(@Body() body: any) {
    return this.prisma.packControl.create({ data: body });
  }

  @Patch('pack-controls/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async updatePackControl(@Param('id') id: string, @Body() body: any) {
    return this.prisma.packControl.update({ where: { id }, data: body });
  }

  @Delete('pack-controls/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async deletePackControl(@Param('id') id: string) {
    await this.prisma.packControl.delete({ where: { id } });
    return { deleted: true, id };
  }

  @Get('evidence-mappings')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getEvidenceMappings() {
    return this.prisma.evidenceMapping.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post('evidence-mappings')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async createEvidenceMapping(@Body() body: any) {
    return this.prisma.evidenceMapping.create({ data: body });
  }

  @Patch('evidence-mappings/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async updateEvidenceMapping(@Param('id') id: string, @Body() body: any) {
    return this.prisma.evidenceMapping.update({ where: { id }, data: body });
  }

  @Delete('evidence-mappings/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async deleteEvidenceMapping(@Param('id') id: string) {
    await this.prisma.evidenceMapping.delete({ where: { id } });
    return { deleted: true, id };
  }

  // --- RELEASE 6: UNIVERSAL REGULATORY KNOWLEDGE & OBLIGATION ENGINE ---
  @Get('regulatory-sources')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getRegulatorySources() {
    return this.prisma.regulatorySource.findMany({
      include: { requirements: { include: { obligations: { include: { controls: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('regulatory-sources')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createRegulatorySource(@Body() body: any) {
    return this.prisma.regulatorySource.create({ data: body });
  }

  @Patch('regulatory-sources/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async updateRegulatorySource(@Param('id') id: string, @Body() body: any) {
    return this.prisma.regulatorySource.update({ where: { id }, data: body });
  }

  @Delete('regulatory-sources/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async deleteRegulatorySource(@Param('id') id: string) {
    await this.prisma.regulatorySource.delete({ where: { id } });
    return { deleted: true, id };
  }

  @Get('regulatory-requirements')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getRegulatoryRequirements() {
    return this.prisma.regulatoryRequirement.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post('regulatory-requirements')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createRegulatoryRequirement(@Body() body: any) {
    return this.prisma.regulatoryRequirement.create({ data: body });
  }

  @Patch('regulatory-requirements/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async updateRegulatoryRequirement(@Param('id') id: string, @Body() body: any) {
    return this.prisma.regulatoryRequirement.update({ where: { id }, data: body });
  }

  @Delete('regulatory-requirements/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async deleteRegulatoryRequirement(@Param('id') id: string) {
    await this.prisma.regulatoryRequirement.delete({ where: { id } });
    return { deleted: true, id };
  }

  @Get('obligations')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getObligations() {
    return this.prisma.obligation.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post('obligations')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createObligation(@Body() body: any) {
    return this.prisma.obligation.create({ data: body });
  }

  @Patch('obligations/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async updateObligation(@Param('id') id: string, @Body() body: any) {
    return this.prisma.obligation.update({ where: { id }, data: body });
  }

  @Delete('obligations/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async deleteObligation(@Param('id') id: string) {
    await this.prisma.obligation.delete({ where: { id } });
    return { deleted: true, id };
  }

  @Get('obligation-controls')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getObligationControls() {
    return this.prisma.obligationControl.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post('obligation-controls')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createObligationControl(@Body() body: any) {
    return this.prisma.obligationControl.create({ data: body });
  }

  @Patch('obligation-controls/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async updateObligationControl(@Param('id') id: string, @Body() body: any) {
    return this.prisma.obligationControl.update({ where: { id }, data: body });
  }

  @Delete('obligation-controls/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async deleteObligationControl(@Param('id') id: string) {
    await this.prisma.obligationControl.delete({ where: { id } });
    return { deleted: true, id };
  }

  @Get('obligation-evidence-mappings')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getObligationEvidenceMappings() {
    return this.prisma.obligationEvidenceMapping.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post('obligation-evidence-mappings')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async createObligationEvidenceMapping(@Body() body: any) {
    return this.prisma.obligationEvidenceMapping.create({ data: body });
  }

  @Patch('obligation-evidence-mappings/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async updateObligationEvidenceMapping(@Param('id') id: string, @Body() body: any) {
    return this.prisma.obligationEvidenceMapping.update({ where: { id }, data: body });
  }

  @Delete('obligation-evidence-mappings/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async deleteObligationEvidenceMapping(@Param('id') id: string) {
    await this.prisma.obligationEvidenceMapping.delete({ where: { id } });
    return { deleted: true, id };
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

  @Patch('monitoring/reviews/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async updateScheduledReview(@Param('id') id: string, @Body() body: any) {
    return this.prisma.scheduledReview.update({ where: { id }, data: body });
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
