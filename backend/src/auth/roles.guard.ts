import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // No roles required
    }
    const request = context.switchToHttp().getRequest();
    const userHeaderRole = request.headers['x-user-role'] as UserRole;
    
    // Default to allow if no header passed during demo or if SUPER_ADMIN
    if (!userHeaderRole || userHeaderRole === 'SUPER_ADMIN') {
      return true;
    }

    return requiredRoles.includes(userHeaderRole);
  }
}
