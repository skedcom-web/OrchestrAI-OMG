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

  // --- R13: MODEL GOVERNANCE ENDPOINTS ---
  @Get('models')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getModels(@Query('includeArchived') includeArchived?: string) {
    return this.prisma.model.findMany({
      where: includeArchived === 'true' ? undefined : { isArchived: false },
      include: { assetUsages: { include: { asset: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('models/:id')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getModel(@Param('id') id: string) {
    const model = await this.prisma.model.findUnique({
      where: { id },
      include: { assetUsages: { include: { asset: true } } },
    });
    if (!model) throw new NotFoundException(`Model ${id} not found`);
    return model;
  }

  @Post('models')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createModel(@Body() body: any) {
    if (!body.accountableOwner || !body.modelOwner) {
      throw new BadRequestException('Models require a named Accountable Owner and Model Owner before they can be saved.');
    }
    return this.prisma.model.create({ data: body });
  }

  @Patch('models/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async updateModel(@Param('id') id: string, @Body() body: any) {
    const existing = await this.prisma.model.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Model ${id} not found`);
    return this.prisma.model.update({ where: { id }, data: body });
  }

  /** Soft delete — mirrors the Asset archive pattern, never a destructive removal. */
  @Delete('models/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async archiveModel(
    @Param('id') id: string,
    @Body() body: { archivedBy?: string; archiveReason?: string } = {},
  ) {
    const existing = await this.prisma.model.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Model ${id} not found`);
    const model = await this.prisma.model.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
        archivedBy: body?.archivedBy ?? null,
        archiveReason: body?.archiveReason ?? null,
      },
    });
    return { archived: true, id, model };
  }

  @Patch('models/:id/restore')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async restoreModel(@Param('id') id: string) {
    const existing = await this.prisma.model.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Model ${id} not found`);
    const model = await this.prisma.model.update({
      where: { id },
      data: { isArchived: false, archivedAt: null, archivedBy: null, archiveReason: null },
    });
    return { restored: true, id, model };
  }

  /** Model-level decision — same GO / Conditional GO / No Go vocabulary as Decision Authority, recorded as flat state on the model rather than a DecisionRecord row (see schema comment). */
  @Post('models/:id/decision')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async recordModelDecision(
    @Param('id') id: string,
    @Body() body: { outcome: string; justification: string; decisionOwner: string },
  ) {
    const existing = await this.prisma.model.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Model ${id} not found`);
    if (!body.justification || !body.decisionOwner) {
      throw new BadRequestException('A model decision requires a justification and a named decision owner.');
    }
    return this.prisma.model.update({
      where: { id },
      data: {
        decisionOutcome: body.outcome as any,
        decisionJustification: body.justification,
        decisionOwner: body.decisionOwner,
        decisionDate: new Date(),
      },
    });
  }

  @Post('asset-model-usages')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createAssetModelUsage(@Body() body: { assetId: string; modelId: string }) {
    return this.prisma.assetModelUsage.create({ data: body });
  }

  @Delete('asset-model-usages/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async deleteAssetModelUsage(@Param('id') id: string) {
    await this.prisma.assetModelUsage.delete({ where: { id } });
    return { deleted: true, id };
  }

  // --- R14: KNOWLEDGE GOVERNANCE ENDPOINTS ---
  @Get('knowledge-assets')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getKnowledgeAssets(@Query('includeArchived') includeArchived?: string) {
    return this.prisma.knowledgeAsset.findMany({
      where: includeArchived === 'true' ? undefined : { isArchived: false },
      include: { assetUsages: { include: { asset: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('knowledge-assets/:id')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getKnowledgeAsset(@Param('id') id: string) {
    const record = await this.prisma.knowledgeAsset.findUnique({
      where: { id },
      include: { assetUsages: { include: { asset: true } } },
    });
    if (!record) throw new NotFoundException(`Knowledge asset ${id} not found`);
    return record;
  }

  @Post('knowledge-assets')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createKnowledgeAsset(@Body() body: any) {
    if (!body.accountableOwner || !body.knowledgeOwner) {
      throw new BadRequestException('Knowledge sources require a named Accountable Owner and Knowledge Owner before they can be saved.');
    }
    return this.prisma.knowledgeAsset.create({ data: body });
  }

  @Patch('knowledge-assets/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async updateKnowledgeAsset(@Param('id') id: string, @Body() body: any) {
    const existing = await this.prisma.knowledgeAsset.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Knowledge asset ${id} not found`);
    return this.prisma.knowledgeAsset.update({ where: { id }, data: body });
  }

  @Delete('knowledge-assets/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async archiveKnowledgeAsset(
    @Param('id') id: string,
    @Body() body: { archivedBy?: string; archiveReason?: string } = {},
  ) {
    const existing = await this.prisma.knowledgeAsset.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Knowledge asset ${id} not found`);
    const record = await this.prisma.knowledgeAsset.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
        archivedBy: body?.archivedBy ?? null,
        archiveReason: body?.archiveReason ?? null,
      },
    });
    return { archived: true, id, record };
  }

  @Patch('knowledge-assets/:id/restore')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async restoreKnowledgeAsset(@Param('id') id: string) {
    const existing = await this.prisma.knowledgeAsset.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Knowledge asset ${id} not found`);
    const record = await this.prisma.knowledgeAsset.update({
      where: { id },
      data: { isArchived: false, archivedAt: null, archivedBy: null, archiveReason: null },
    });
    return { restored: true, id, record };
  }

  @Post('knowledge-assets/:id/decision')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async recordKnowledgeDecision(
    @Param('id') id: string,
    @Body() body: { outcome: string; justification: string; decisionOwner: string },
  ) {
    const existing = await this.prisma.knowledgeAsset.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Knowledge asset ${id} not found`);
    if (!body.justification || !body.decisionOwner) {
      throw new BadRequestException('A knowledge source decision requires a justification and a named decision owner.');
    }
    return this.prisma.knowledgeAsset.update({
      where: { id },
      data: {
        decisionOutcome: body.outcome as any,
        decisionJustification: body.justification,
        decisionOwner: body.decisionOwner,
        decisionDate: new Date(),
      },
    });
  }

  @Post('asset-knowledge-usages')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createAssetKnowledgeUsage(@Body() body: { assetId: string; knowledgeAssetId: string }) {
    return this.prisma.assetKnowledgeUsage.create({ data: body });
  }

  @Delete('asset-knowledge-usages/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async deleteAssetKnowledgeUsage(@Param('id') id: string) {
    await this.prisma.assetKnowledgeUsage.delete({ where: { id } });
    return { deleted: true, id };
  }

  // --- R15: PROMPT GOVERNANCE ENDPOINTS ---
  @Get('prompts')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getPrompts(@Query('includeArchived') includeArchived?: string) {
    return this.prisma.prompt.findMany({
      where: includeArchived === 'true' ? undefined : { isArchived: false },
      include: {
        versions: { orderBy: { versionNumber: 'desc' } },
        assetUsages: { include: { asset: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('prompts/:id')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getPrompt(@Param('id') id: string) {
    const record = await this.prisma.prompt.findUnique({
      where: { id },
      include: {
        versions: { orderBy: { versionNumber: 'desc' } },
        assetUsages: { include: { asset: true } },
      },
    });
    if (!record) throw new NotFoundException(`Prompt ${id} not found`);
    return record;
  }

  /** Creates the prompt plus its version 1 in one call — a prompt cannot exist without an initial template. */
  @Post('prompts')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createPrompt(@Body() body: any) {
    if (!body.accountableOwner || !body.promptOwner) {
      throw new BadRequestException('Prompts require a named Accountable Owner and Prompt Owner before they can be saved.');
    }
    if (!body.templateBody) {
      throw new BadRequestException('A prompt cannot be registered without an initial template body.');
    }
    const { templateBody, changeNotes, createdBy, ...promptData } = body;
    return this.prisma.prompt.create({
      data: {
        ...promptData,
        versions: {
          create: { versionNumber: 1, templateBody, changeNotes: changeNotes || 'Initial version', createdBy: createdBy || promptData.promptOwner },
        },
      },
      include: { versions: true },
    });
  }

  @Patch('prompts/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async updatePrompt(@Param('id') id: string, @Body() body: any) {
    const existing = await this.prisma.prompt.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Prompt ${id} not found`);
    return this.prisma.prompt.update({ where: { id }, data: body });
  }

  @Delete('prompts/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async archivePrompt(
    @Param('id') id: string,
    @Body() body: { archivedBy?: string; archiveReason?: string } = {},
  ) {
    const existing = await this.prisma.prompt.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Prompt ${id} not found`);
    const record = await this.prisma.prompt.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
        archivedBy: body?.archivedBy ?? null,
        archiveReason: body?.archiveReason ?? null,
      },
    });
    return { archived: true, id, record };
  }

  @Patch('prompts/:id/restore')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async restorePrompt(@Param('id') id: string) {
    const existing = await this.prisma.prompt.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Prompt ${id} not found`);
    const record = await this.prisma.prompt.update({
      where: { id },
      data: { isArchived: false, archivedAt: null, archivedBy: null, archiveReason: null },
    });
    return { restored: true, id, record };
  }

  @Post('prompts/:id/decision')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async recordPromptDecision(
    @Param('id') id: string,
    @Body() body: { outcome: string; justification: string; decisionOwner: string },
  ) {
    const existing = await this.prisma.prompt.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Prompt ${id} not found`);
    if (!body.justification || !body.decisionOwner) {
      throw new BadRequestException('A prompt decision requires a justification and a named decision owner.');
    }
    return this.prisma.prompt.update({
      where: { id },
      data: {
        decisionOutcome: body.outcome as any,
        decisionJustification: body.justification,
        decisionOwner: body.decisionOwner,
        decisionDate: new Date(),
      },
    });
  }

  /** Every edit is a new version — never overwrites prompt_versions in place. */
  @Post('prompts/:id/versions')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createPromptVersion(
    @Param('id') id: string,
    @Body() body: { templateBody: string; changeNotes?: string; createdBy: string },
  ) {
    const prompt = await this.prisma.prompt.findUnique({ where: { id }, include: { versions: true } });
    if (!prompt) throw new NotFoundException(`Prompt ${id} not found`);
    if (!body.templateBody || !body.createdBy) {
      throw new BadRequestException('A new prompt version requires a template body and a named author.');
    }
    const nextVersion = Math.max(0, ...prompt.versions.map(v => v.versionNumber)) + 1;
    return this.prisma.promptVersion.create({
      data: {
        promptId: id,
        versionNumber: nextVersion,
        templateBody: body.templateBody,
        changeNotes: body.changeNotes,
        createdBy: body.createdBy,
      },
    });
  }

  /** Injection-control / evidence review recorded against a specific version. */
  @Patch('prompt-versions/:id/review')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async reviewPromptVersion(
    @Param('id') id: string,
    @Body() body: { reviewStatus: string; reviewedBy: string; reviewNotes?: string; testTranscriptRef?: string },
  ) {
    const existing = await this.prisma.promptVersion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Prompt version ${id} not found`);
    if (!body.reviewedBy) {
      throw new BadRequestException('A prompt version review requires a named reviewer.');
    }
    return this.prisma.promptVersion.update({
      where: { id },
      data: {
        reviewStatus: body.reviewStatus as any,
        reviewedBy: body.reviewedBy,
        reviewNotes: body.reviewNotes,
        testTranscriptRef: body.testTranscriptRef,
        reviewedAt: new Date(),
      },
    });
  }

  @Post('asset-prompt-usages')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createAssetPromptUsage(@Body() body: { assetId: string; promptId: string }) {
    return this.prisma.assetPromptUsage.create({ data: body });
  }

  @Delete('asset-prompt-usages/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async deleteAssetPromptUsage(@Param('id') id: string) {
    await this.prisma.assetPromptUsage.delete({ where: { id } });
    return { deleted: true, id };
  }

  // --- R16: AGENT GOVERNANCE ENDPOINTS ---
  // Note: delegationScope / behaviorMonitoringStatus are new AIAsset fields
  // handled by the existing GET/PATCH /assets endpoints above — no new asset
  // endpoints needed.

  /**
   * Tool's data model, brought forward from R17 per the Release Dependency
   * Map — AgentToolGrant needs a real table to reference. Basic CRUD only;
   * Tool's own registry/lifecycle/risk screens ship in R17.
   */
  @Get('tools')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getTools(@Query('includeArchived') includeArchived?: string) {
    return this.prisma.tool.findMany({
      where: includeArchived === 'true' ? undefined : { isArchived: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('tools')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createTool(@Body() body: any) {
    if (!body.accountableOwner || !body.toolOwner) {
      throw new BadRequestException('Tools require a named Accountable Owner and Tool Owner before they can be saved.');
    }
    return this.prisma.tool.create({ data: body });
  }

  @Patch('tools/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async updateTool(@Param('id') id: string, @Body() body: any) {
    const existing = await this.prisma.tool.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Tool ${id} not found`);
    return this.prisma.tool.update({ where: { id }, data: body });
  }

  @Delete('tools/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async archiveTool(
    @Param('id') id: string,
    @Body() body: { archivedBy?: string; archiveReason?: string } = {},
  ) {
    const existing = await this.prisma.tool.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Tool ${id} not found`);
    const record = await this.prisma.tool.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
        archivedBy: body?.archivedBy ?? null,
        archiveReason: body?.archiveReason ?? null,
      },
    });
    return { archived: true, id, record };
  }

  @Patch('tools/:id/restore')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async restoreTool(@Param('id') id: string) {
    const existing = await this.prisma.tool.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Tool ${id} not found`);
    const record = await this.prisma.tool.update({
      where: { id },
      data: { isArchived: false, archivedAt: null, archivedBy: null, archiveReason: null },
    });
    return { restored: true, id, record };
  }

  /** R17 — Tool Governance. Same GO / Conditional GO / No Go vocabulary as every other domain. */
  @Post('tools/:id/decision')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async recordToolDecision(
    @Param('id') id: string,
    @Body() body: { outcome: string; justification: string; decisionOwner: string },
  ) {
    const existing = await this.prisma.tool.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Tool ${id} not found`);
    if (!body.justification || !body.decisionOwner) {
      throw new BadRequestException('A tool decision requires a justification and a named decision owner.');
    }
    return this.prisma.tool.update({
      where: { id },
      data: {
        decisionOutcome: body.outcome as any,
        decisionJustification: body.justification,
        decisionOwner: body.decisionOwner,
        decisionDate: new Date(),
      },
    });
  }

  /** Which agents (AIAsset) are authorized to call which tools. */
  @Get('agent-tool-grants')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getAgentToolGrants() {
    return this.prisma.agentToolGrant.findMany({
      include: { asset: true, tool: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('agent-tool-grants')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createAgentToolGrant(@Body() body: { assetId: string; toolId: string; grantedBy: string; grantNotes?: string }) {
    if (!body.grantedBy) {
      throw new BadRequestException('A tool grant requires a named grantor.');
    }
    return this.prisma.agentToolGrant.create({ data: body, include: { asset: true, tool: true } });
  }

  @Delete('agent-tool-grants/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async deleteAgentToolGrant(@Param('id') id: string) {
    await this.prisma.agentToolGrant.delete({ where: { id } });
    return { deleted: true, id };
  }

  // --- R18: CONTROL GOVERNANCE ENDPOINTS ---
  @Get('governance-controls')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getGovernanceControls(@Query('includeArchived') includeArchived?: string) {
    return this.prisma.governanceControl.findMany({
      where: includeArchived === 'true' ? undefined : { isArchived: false },
      include: { attachments: { include: { testResults: { orderBy: { testDate: 'desc' } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('governance-controls/:id')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getGovernanceControl(@Param('id') id: string) {
    const record = await this.prisma.governanceControl.findUnique({
      where: { id },
      include: { attachments: { include: { testResults: { orderBy: { testDate: 'desc' } } } } },
    });
    if (!record) throw new NotFoundException(`Control ${id} not found`);
    return record;
  }

  @Post('governance-controls')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createGovernanceControl(@Body() body: any) {
    if (!body.accountableOwner || !body.controlOwner) {
      throw new BadRequestException('Controls require a named Accountable Owner and Control Owner before they can be saved.');
    }
    if (!body.category || !body.testProcedure) {
      throw new BadRequestException('Controls require a category and a documented test procedure before they can be saved.');
    }
    return this.prisma.governanceControl.create({ data: body });
  }

  @Patch('governance-controls/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async updateGovernanceControl(@Param('id') id: string, @Body() body: any) {
    const existing = await this.prisma.governanceControl.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Control ${id} not found`);
    return this.prisma.governanceControl.update({ where: { id }, data: body });
  }

  @Delete('governance-controls/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async archiveGovernanceControl(
    @Param('id') id: string,
    @Body() body: { archivedBy?: string; archiveReason?: string } = {},
  ) {
    const existing = await this.prisma.governanceControl.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Control ${id} not found`);
    const record = await this.prisma.governanceControl.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
        archivedBy: body?.archivedBy ?? null,
        archiveReason: body?.archiveReason ?? null,
      },
    });
    return { archived: true, id, record };
  }

  @Patch('governance-controls/:id/restore')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async restoreGovernanceControl(@Param('id') id: string) {
    const existing = await this.prisma.governanceControl.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Control ${id} not found`);
    const record = await this.prisma.governanceControl.update({
      where: { id },
      data: { isArchived: false, archivedAt: null, archivedBy: null, archiveReason: null },
    });
    return { restored: true, id, record };
  }

  /** Attach a control to any governed entity — Asset, Model, Knowledge, Prompt or Tool. */
  @Post('control-attachments')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createControlAttachment(
    @Body() body: { controlId: string; entityType: string; entityId: string; entityName: string; attachedBy: string },
  ) {
    if (!body.attachedBy) {
      throw new BadRequestException('A control attachment requires a named attacher.');
    }
    return this.prisma.controlAttachment.create({ data: body });
  }

  @Delete('control-attachments/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async deleteControlAttachment(@Param('id') id: string) {
    await this.prisma.controlAttachment.delete({ where: { id } });
    return { deleted: true, id };
  }

  /**
   * Records a test result against one attachment, recomputes the parent
   * control's overall effectiveness from the latest result per attachment,
   * and — on a failed test — raises a CorrectiveAction against the attached
   * entity via the polymorphic entityType/entityId Foundation already added
   * to that table. Reuses the existing corrective-action workflow rather
   * than inventing a new one.
   */
  @Post('control-attachments/:id/test-results')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async recordControlTestResult(
    @Param('id') attachmentId: string,
    @Body() body: { tester: string; outcome: string; findings?: string; evidenceRef?: string },
  ) {
    const attachment = await this.prisma.controlAttachment.findUnique({
      where: { id: attachmentId },
      include: { control: { include: { attachments: { include: { testResults: { orderBy: { testDate: 'desc' }, take: 1 } } } } } },
    });
    if (!attachment) throw new NotFoundException(`Control attachment ${attachmentId} not found`);
    if (!body.tester || !body.outcome) {
      throw new BadRequestException('A control test result requires a named tester and an outcome.');
    }

    const testResult = await this.prisma.controlTestResult.create({
      data: {
        attachmentId,
        tester: body.tester,
        outcome: body.outcome as any,
        findings: body.findings,
        evidenceRef: body.evidenceRef,
      },
    });

    // Recompute overall effectiveness from the latest result per attachment.
    const latestPerAttachment = attachment.control.attachments.map(a =>
      a.id === attachmentId ? body.outcome : a.testResults[0]?.outcome,
    ).filter(Boolean);
    latestPerAttachment.push(body.outcome);
    const outcomes = [...new Set(latestPerAttachment)];
    const rating =
      outcomes.length === 0 ? 'NOT_YET_TESTED' :
      outcomes.every(o => o === 'PASS') ? 'EFFECTIVE' :
      outcomes.every(o => o === 'FAIL') ? 'INEFFECTIVE' :
      'PARTIALLY_EFFECTIVE';
    await this.prisma.governanceControl.update({ where: { id: attachment.controlId }, data: { effectivenessRating: rating as any } });

    if (body.outcome === 'FAIL') {
      await this.prisma.correctiveAction.create({
        data: {
          entityType: attachment.entityType,
          entityId: attachment.entityId,
          entityName: attachment.entityName,
          title: `Control test failed: ${attachment.control.name}`,
          status: 'Open',
          severity: attachment.control.riskLevel === 'CRITICAL' || attachment.control.riskLevel === 'HIGH' ? 'High' : 'Medium',
          assignedTo: attachment.control.controlOwner,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          description: body.findings || `Test by ${body.tester} recorded a FAIL outcome for control "${attachment.control.name}" against ${attachment.entityName}.`,
        },
      });
    }

    return testResult;
  }

  // --- R20: CERTIFICATION GOVERNANCE ENDPOINTS ---
  @Get('certification-programs')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getCertificationPrograms(@Query('includeArchived') includeArchived?: string) {
    return this.prisma.certificationProgram.findMany({
      where: includeArchived === 'true' ? undefined : { isArchived: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('certification-programs')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async createCertificationProgram(@Body() body: any) {
    if (!body.name || !body.criteria || !body.validityPeriodDays) {
      throw new BadRequestException('A certification program requires a name, criteria and a validity period.');
    }
    return this.prisma.certificationProgram.create({ data: body });
  }

  @Patch('certification-programs/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async updateCertificationProgram(@Param('id') id: string, @Body() body: any) {
    const existing = await this.prisma.certificationProgram.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Certification program ${id} not found`);
    return this.prisma.certificationProgram.update({ where: { id }, data: body });
  }

  @Delete('certification-programs/:id')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async archiveCertificationProgram(
    @Param('id') id: string,
    @Body() body: { archivedBy?: string; archiveReason?: string } = {},
  ) {
    const existing = await this.prisma.certificationProgram.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Certification program ${id} not found`);
    const record = await this.prisma.certificationProgram.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
        archivedBy: body?.archivedBy ?? null,
        archiveReason: body?.archiveReason ?? null,
      },
    });
    return { archived: true, id, record };
  }

  @Patch('certification-programs/:id/restore')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async restoreCertificationProgram(@Param('id') id: string) {
    const existing = await this.prisma.certificationProgram.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Certification program ${id} not found`);
    const record = await this.prisma.certificationProgram.update({
      where: { id },
      data: { isArchived: false, archivedAt: null, archivedBy: null, archiveReason: null },
    });
    return { restored: true, id, record };
  }

  @Get('certification-records')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getCertificationRecords() {
    return this.prisma.certificationRecord.findMany({
      include: { program: true, evidence: { orderBy: { submittedAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Issue — the "Assess -> Issue" transition. expiresAt is computed from the program's validity period. */
  @Post('certification-records')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async issueCertificationRecord(
    @Body() body: { programId: string; entityType: string; entityId: string; entityName: string; issuedBy: string },
  ) {
    if (!body.issuedBy) {
      throw new BadRequestException('Issuing a certification requires a named issuer.');
    }
    const program = await this.prisma.certificationProgram.findUnique({ where: { id: body.programId } });
    if (!program) throw new NotFoundException(`Certification program ${body.programId} not found`);
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + program.validityPeriodDays * 24 * 60 * 60 * 1000);
    return this.prisma.certificationRecord.create({
      data: {
        programId: body.programId,
        entityType: body.entityType,
        entityId: body.entityId,
        entityName: body.entityName,
        issuedBy: body.issuedBy,
        issuedAt,
        expiresAt,
      },
      include: { program: true, evidence: true },
    });
  }

  /** Renew — extends expiresAt by the program's validity period from today. A recorded human decision, not automatic. */
  @Post('certification-records/:id/renew')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN')
  async renewCertificationRecord(
    @Param('id') id: string,
    @Body() body: { renewedBy: string; renewalNotes?: string },
  ) {
    const existing = await this.prisma.certificationRecord.findUnique({ where: { id }, include: { program: true } });
    if (!existing) throw new NotFoundException(`Certification record ${id} not found`);
    if (!body.renewedBy) {
      throw new BadRequestException('Renewing a certification requires a named renewer.');
    }
    const renewedAt = new Date();
    const expiresAt = new Date(renewedAt.getTime() + existing.program.validityPeriodDays * 24 * 60 * 60 * 1000);
    return this.prisma.certificationRecord.update({
      where: { id },
      data: { status: 'ACTIVE', renewedAt, renewedBy: body.renewedBy, renewalNotes: body.renewalNotes, expiresAt },
      include: { program: true, evidence: true },
    });
  }

  /** Revoke — a recorded human decision with a required reason. Informational only; never gates the underlying entity. */
  @Post('certification-records/:id/revoke')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async revokeCertificationRecord(
    @Param('id') id: string,
    @Body() body: { revokedBy: string; revocationReason: string },
  ) {
    const existing = await this.prisma.certificationRecord.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Certification record ${id} not found`);
    if (!body.revokedBy || !body.revocationReason) {
      throw new BadRequestException('Revoking a certification requires a named revoker and a reason.');
    }
    return this.prisma.certificationRecord.update({
      where: { id },
      data: { status: 'REVOKED', revokedAt: new Date(), revokedBy: body.revokedBy, revocationReason: body.revocationReason },
      include: { program: true, evidence: true },
    });
  }

  /** Certification Evidence & Assessments — assessment evidence filed against a specific certification record. */
  @Post('certification-records/:id/evidence')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER', 'VALIDATOR')
  async addCertificationEvidence(
    @Param('id') recordId: string,
    @Body() body: { title: string; description: string; evidenceRef?: string; submittedBy: string },
  ) {
    const existing = await this.prisma.certificationRecord.findUnique({ where: { id: recordId } });
    if (!existing) throw new NotFoundException(`Certification record ${recordId} not found`);
    if (!body.title || !body.submittedBy) {
      throw new BadRequestException('Certification evidence requires a title and a named submitter.');
    }
    return this.prisma.certificationEvidence.create({
      data: {
        recordId,
        title: body.title,
        description: body.description,
        evidenceRef: body.evidenceRef,
        submittedBy: body.submittedBy,
      },
    });
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

  // --- RELEASE 11 — GOVERNANCE EFFECTIVENESS & OUTCOMES ENGINE ---
  // Effectiveness/Maturity are the only two persisted domains this release
  // adds — Trend/Previous Score/Improvement % are impossible to compute
  // without a stored prior point. ROI, Benchmarking and Outcomes are
  // computed client-side from data these endpoints (and existing ones)
  // already serve — no new routes for those, consistent with how Gates/
  // Metrics/Health stayed compute-only in the prior release.
  @Get('governance-effectiveness-snapshots')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getGovernanceEffectivenessSnapshots() {
    return this.prisma.governanceEffectivenessSnapshot.findMany({ orderBy: { recordedAt: 'desc' } });
  }

  @Post('governance-effectiveness-snapshots')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async createGovernanceEffectivenessSnapshot(@Body() body: any) {
    return this.prisma.governanceEffectivenessSnapshot.create({ data: body });
  }

  @Get('governance-maturity-snapshots')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getGovernanceMaturitySnapshots() {
    return this.prisma.governanceMaturitySnapshot.findMany({ orderBy: { recordedAt: 'desc' } });
  }

  @Post('governance-maturity-snapshots')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'RISK_OFFICER')
  async createGovernanceMaturitySnapshot(@Body() body: any) {
    return this.prisma.governanceMaturitySnapshot.create({ data: body });
  }

  // --- GOVERNANCE ASSESSMENT CALIBRATION & CONSISTENCY FRAMEWORK (GACF) ---
  // The only new persisted entity across all six GACF initiatives — see the
  // schema comment on GovernanceAssessmentRecord. Playbooks/Scoring
  // Templates/Calibration Library/Prompt Library/Academy are static
  // reference content shipped as frontend config, not database rows.
  @Get('governance-assessment-records')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getGovernanceAssessmentRecords(@Query('assetId') assetId?: string) {
    return this.prisma.governanceAssessmentRecord.findMany({
      where: assetId ? { assetId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('governance-assessment-records')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'VALIDATOR')
  async createGovernanceAssessmentRecord(@Body() body: any) {
    return this.prisma.governanceAssessmentRecord.create({ data: body });
  }

  // --- GACF PHASE 2 ("Release 13 Extension") — Assessor Certification ---
  // Certification attempts against the existing Calibration Library's
  // benchmark scenarios. Read is platform-wide (same as the base assessment
  // records); attempting certification is limited to the roles who record
  // real assessments plus Auditor, per the blueprint's RBAC list for this
  // capability.
  @Get('assessor-certifications')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getAssessorCertifications() {
    return this.prisma.assessorCertification.findMany({ orderBy: { certificationDate: 'desc' } });
  }

  @Post('assessor-certifications')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'VALIDATOR', 'AUDITOR')
  async createAssessorCertification(@Body() body: any) {
    return this.prisma.assessorCertification.create({ data: body });
  }

  // --- GACF PHASE 2 — Multi-Assessor Consensus Assessment ---
  // A round is OPEN while participants submit independently (each submission
  // is a normal governance-assessment-records POST tagged with the round's
  // id), then CLOSED once every participant has submitted or an admin closes
  // it early, at which point aggregate stats are computed and frozen here.
  @Get('consensus-assessments')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getConsensusAssessments() {
    return this.prisma.consensusAssessment.findMany({
      include: { submittedScores: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('consensus-assessments')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'VALIDATOR')
  async createConsensusAssessment(@Body() body: any) {
    return this.prisma.consensusAssessment.create({ data: body });
  }

  // Marks one participant's independent submission, persisting the
  // updated participants JSON — called on every submission, closing or
  // not, so "who has submitted" survives a reload rather than living only
  // in the submitting browser's local cache until the round happens to close.
  @Patch('consensus-assessments/:id/participants')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'VALIDATOR')
  async updateConsensusParticipants(@Param('id') id: string, @Body() body: { participants: unknown }) {
    return this.prisma.consensusAssessment.update({
      where: { id },
      data: { participants: body.participants as any },
    });
  }

  @Patch('consensus-assessments/:id/close')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'VALIDATOR')
  async closeConsensusAssessment(@Param('id') id: string, @Body() body: { consensusScore: number; varianceScore: number }) {
    return this.prisma.consensusAssessment.update({
      where: { id },
      data: { status: 'CLOSED', closedAt: new Date(), consensusScore: body.consensusScore, varianceScore: body.varianceScore },
    });
  }

  // --- GACF PHASE 2 — Confidence Scoring ---
  // One row per governance-assessment-record, linked 1:1. Additive only —
  // absent entirely for every assessment recorded before this shipped.
  @Get('confidence-assessments')
  @Roles(
    'SUPER_ADMIN',
    'GOVERNANCE_ADMIN',
    'RISK_OFFICER',
    'BUSINESS_OWNER',
    'VALIDATOR',
    'AUDITOR',
    'VIEWER',
  )
  async getConfidenceAssessments() {
    return this.prisma.confidenceAssessment.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post('confidence-assessments')
  @Roles('SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'VALIDATOR')
  async createConfidenceAssessment(@Body() body: any) {
    return this.prisma.confidenceAssessment.create({ data: body });
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
