import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';

/**
 * Role-based authorisation guard.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THIS GUARD PERFORMS AUTHORISATION ONLY. IT DOES NOT PERFORM AUTHENTICATION.
 *
 * The caller's role is read from the `x-user-role` request header, which is
 * supplied by the client and is NOT cryptographically verified. A caller can
 * therefore still assert any role they choose.
 *
 * The guard is deliberately written to FAIL CLOSED: a missing, malformed or
 * unrecognised role claim is denied rather than admitted. That closes the
 * "no header means full access" hole, but it does not — and cannot — make the
 * role claim itself trustworthy.
 *
 * Making the claim trustworthy requires real authentication (signed session or
 * JWT issued after credential verification, with the role resolved server-side
 * from the authenticated user record rather than read from a header).
 * Until that exists, treat every endpoint behind this guard as protected
 * against accident, not against a determined caller.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  /** Runtime allow-list of valid roles, derived from the Prisma enum. */
  private static readonly VALID_ROLES = new Set<string>(Object.values(UserRole));

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No @Roles() on the handler or controller => the route is public by design.
    // Only genuinely non-sensitive endpoints (e.g. /api/health) should be left
    // undecorated; every data-bearing endpoint declares its required roles.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const claimedRole = request.headers['x-user-role'] as string | undefined;

    // FAIL CLOSED — absent claim is denied, not admitted.
    if (!claimedRole) {
      this.logger.warn(
        `Denied ${request.method} ${request.url}: no x-user-role header supplied`,
      );
      throw new ForbiddenException(
        'A role claim is required for this endpoint. Supply the x-user-role header.',
      );
    }

    // FAIL CLOSED — a role outside the known enum is denied.
    if (!RolesGuard.VALID_ROLES.has(claimedRole)) {
      this.logger.warn(
        `Denied ${request.method} ${request.url}: unrecognised role "${claimedRole}"`,
      );
      throw new ForbiddenException('Unrecognised role claim.');
    }

    // No implicit super-user bypass. SUPER_ADMIN is granted access only where
    // the endpoint explicitly lists it, exactly like every other role.
    if (!requiredRoles.includes(claimedRole as UserRole)) {
      this.logger.warn(
        `Denied ${request.method} ${request.url}: role "${claimedRole}" not in [${requiredRoles.join(', ')}]`,
      );
      throw new ForbiddenException(
        'Your role is not authorised for this endpoint.',
      );
    }

    return true;
  }
}
