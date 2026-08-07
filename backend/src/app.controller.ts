import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('api')
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  getHealth() {
    return { status: 'OPERATIONAL', app: 'OrchestrAI Model Governance (OMG)', timestamp: new Date().toISOString() };
  }

  // --- ASSETS ENDPOINTS ---
  @Get('assets')
  async getAssets() {
    return this.prisma.aIAsset.findMany({
      include: { owners: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('assets')
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

  // --- USERS ENDPOINTS ---
  @Get('users')
  async getUsers() {
    return this.prisma.user.findMany();
  }

  @Post('users')
  async createUser(@Body() body: any) {
    return this.prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        role: body.role || 'GOVERNANCE_ADMIN',
        department: body.department || 'AI Governance Office',
      },
    });
  }

  // --- AUDIT LOGS ENDPOINTS ---
  @Get('audit-logs')
  async getAuditLogs() {
    return this.prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
  }
}
