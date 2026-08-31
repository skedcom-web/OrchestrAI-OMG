import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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

  /**
   * Q1 Stabilization — Governance Validation (Phase 1).
   * No AI asset may be created or updated without its four named governance
   * owners. Called against the full, merged record so partial PATCH bodies
   * can't drop an owner that isn't in the request payload.
   */
  private validateGovernanceOwnership(data: {
    accountableOwner?: string | null;
    governanceSponsor?: string | null;
    authorityRiskOwner?: string | null;
    authorityTechnicalOwner?: string | null;
  }) {
    const required: Record<string, string | null | undefined> = {
      'Accountable Owner': data.accountableOwner,
      'Governance Sponsor': data.governanceSponsor,
      'Risk Owner': data.authorityRiskOwner,
      'Technical Owner': data.authorityTechnicalOwner,
    };
    const missing = Object.entries(required)
      .filter(([, v]) => !v || !v.trim())
      .map(([label]) => label);
    if (missing.length > 0) {
      throw new BadRequestException(
        `AI assets require named governance ownership before they can be saved. Missing: ${missing.join(', ')}.`,
      );
    }
  }

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
  async getAssets(@Query('includeArchived') includeArchived?: string) {
    return this.prisma.aIAsset.findMany({
      where: includeArchived === 'true' ? undefined : { isArchived: false },
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
    this.validateGovernanceOwnership(body);
    return this.prisma.aIAsset.create({ data: body });
  }

  @Patch('assets/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async updateAsset(@Param('id') id: string, @Body() body: any) {
    const existing = await this.prisma.aIAsset.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Asset ${id} not found`);
    this.validateGovernanceOwnership({ ...existing, ...body });
    return this.prisma.aIAsset.update({ where: { id }, data: body });
  }

  /**
   * Q1 Stabilization — Soft Delete / Archive Model (Phase 3).
   * Deletion is no longer destructive: the asset is archived (status moves to
   * RETIREMENT, isArchived is set) instead of removed, so every cascaded
   * evidence/finding/decision/incident record it owns stays intact.
   */
  @Delete('assets/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async archiveAsset(
    @Param('id') id: string,
    @Body() body: { archivedBy?: string; archiveReason?: string } = {},
  ) {
    const existing = await this.prisma.aIAsset.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Asset ${id} not found`);
    const asset = await this.prisma.aIAsset.update({
      where: { id },
      data: {
        status: 'RETIREMENT',
        isArchived: true,
        archivedAt: new Date(),
        archivedBy: body?.archivedBy ?? null,
        archiveReason: body?.archiveReason ?? null,
      },
    });
    return { archived: true, id, asset };
  }

  /** Q1 Stabilization — reverses an archive; restores a sensible pre-archive status. */
  @Patch('assets/:id/restore')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async restoreAsset(@Param('id') id: string) {
    const existing = await this.prisma.aIAsset.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Asset ${id} not found`);
    const restoredStatus =
      existing.governanceState === 'MONITORING' || existing.governanceState === 'AUTHORIZED'
        ? 'PRODUCTION'
        : 'DRAFT';
    const asset = await this.prisma.aIAsset.update({
      where: { id },
      data: {
        status: restoredStatus,
        isArchived: false,
        archivedAt: null,
        archivedBy: null,
        archiveReason: null,
      },
    });
    return { restored: true, id, asset };
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

  // --- RELEASE 7: GOVERNANCE INTELLIGENCE ENGINE (FOUNDATION) ---
  @Get('governance-policies')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getGovernancePolicies() {
    return this.prisma.governancePolicy.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post('governance-policies')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createGovernancePolicy(@Body() body: any) {
    return this.prisma.governancePolicy.create({ data: body });
  }

  @Patch('governance-policies/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async updateGovernancePolicy(@Param('id') id: string, @Body() body: any) {
    return this.prisma.governancePolicy.update({ where: { id }, data: body });
  }

  @Delete('governance-policies/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async deleteGovernancePolicy(@Param('id') id: string) {
    await this.prisma.governancePolicy.delete({ where: { id } });
    return { deleted: true, id };
  }

  @Get('governance-findings')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getGovernanceFindings() {
    return this.prisma.governanceFinding.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post('governance-findings')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async createGovernanceFinding(@Body() body: any) {
    return this.prisma.governanceFinding.create({ data: body });
  }

  @Patch('governance-findings/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async updateGovernanceFinding(@Param('id') id: string, @Body() body: any) {
    return this.prisma.governanceFinding.update({ where: { id }, data: body });
  }

  @Delete('governance-findings/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async deleteGovernanceFinding(@Param('id') id: string) {
    await this.prisma.governanceFinding.delete({ where: { id } });
    return { deleted: true, id };
  }

  // --- RELEASE 8: GOVERNANCE INTELLIGENCE ENGINE (ACTIONS EDITION) ---
  @Get('recommended-actions')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getRecommendedActions() {
    return this.prisma.recommendedAction.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post('recommended-actions')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async createRecommendedAction(@Body() body: any) {
    return this.prisma.recommendedAction.create({ data: body });
  }

  @Patch('recommended-actions/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER', 'BUSINESS_OWNER')
  async updateRecommendedAction(@Param('id') id: string, @Body() body: any) {
    return this.prisma.recommendedAction.update({ where: { id }, data: body });
  }

  @Delete('recommended-actions/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async deleteRecommendedAction(@Param('id') id: string) {
    await this.prisma.recommendedAction.delete({ where: { id } });
    return { deleted: true, id };
  }

  // --- RELEASE 10: GOVERNANCE INTELLIGENCE STUDIO (CUSTOMER CONFIGURATION) ---
  @Get('condition-definitions')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getConditionDefinitions() {
    return this.prisma.conditionDefinition.findMany({ orderBy: { createdAt: 'asc' } });
  }

  @Post('condition-definitions')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createConditionDefinition(@Body() body: any) {
    return this.prisma.conditionDefinition.create({ data: body });
  }

  @Patch('condition-definitions/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async updateConditionDefinition(@Param('id') id: string, @Body() body: any) {
    return this.prisma.conditionDefinition.update({ where: { id }, data: body });
  }

  @Get('outcome-rules')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getOutcomeRules() {
    return this.prisma.outcomeRule.findMany({ orderBy: { createdAt: 'asc' } });
  }

  @Post('outcome-rules')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createOutcomeRule(@Body() body: any) {
    return this.prisma.outcomeRule.create({ data: body });
  }

  @Patch('outcome-rules/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async updateOutcomeRule(@Param('id') id: string, @Body() body: any) {
    return this.prisma.outcomeRule.update({ where: { id }, data: body });
  }

  @Get('action-rules')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getActionRules() {
    return this.prisma.actionRule.findMany({ orderBy: { createdAt: 'asc' } });
  }

  @Post('action-rules')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createActionRule(@Body() body: any) {
    return this.prisma.actionRule.create({ data: body });
  }

  @Patch('action-rules/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async updateActionRule(@Param('id') id: string, @Body() body: any) {
    return this.prisma.actionRule.update({ where: { id }, data: body });
  }

  @Delete('action-rules/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async deleteActionRule(@Param('id') id: string) {
    await this.prisma.actionRule.delete({ where: { id } });
    return { deleted: true, id };
  }

  @Get('governance-profiles')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getGovernanceProfiles() {
    return this.prisma.governanceProfile.findMany({ orderBy: { createdAt: 'asc' } });
  }

  @Post('governance-profiles')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createGovernanceProfile(@Body() body: any) {
    return this.prisma.governanceProfile.create({ data: body });
  }

  @Patch('governance-profiles/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async updateGovernanceProfile(@Param('id') id: string, @Body() body: any) {
    return this.prisma.governanceProfile.update({ where: { id }, data: body });
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

  // --- OMG vNEXT — GOVERNANCE INTELLIGENCE, MODULE 2: DECISION GOVERNANCE ---
  // Extends the pre-existing DecisionRecord model/table (Release 4 baseline).
  // No new decision entity — see decisionType/authorityRole/linkedEvidenceIds
  // on the Prisma model. First-ever API surface for this table: prior to
  // vNext, decisions only ever reached local storage in Demo Mode.
  @Get('decisions')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getDecisions(@Query('assetId') assetId?: string) {
    return this.prisma.decisionRecord.findMany({
      where: assetId ? { assetId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('decisions')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async createDecision(@Body() body: any) {
    return this.prisma.decisionRecord.create({ data: body });
  }

  // --- OMG vNEXT — GOVERNANCE INTELLIGENCE, MODULE 3: GOVERNANCE DRIFT ---
  // The only new persisted entity this module introduces (Metrics/Gates/
  // Health are computed on demand from data already served by the endpoints
  // above and are deliberately NOT given their own tables or routes).
  @Get('governance-drift')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getGovernanceDrift(@Query('assetId') assetId?: string) {
    return this.prisma.governanceDrift.findMany({
      where: assetId ? { assetId } : undefined,
      orderBy: { detectedAt: 'desc' },
    });
  }

  @Post('governance-drift')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async createGovernanceDrift(@Body() body: any) {
    return this.prisma.governanceDrift.create({ data: body });
  }

  @Patch('governance-drift/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async updateGovernanceDrift(@Param('id') id: string, @Body() body: any) {
    return this.prisma.governanceDrift.update({ where: { id }, data: body });
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
