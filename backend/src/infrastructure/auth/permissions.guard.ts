import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.permisos) {
      throw new ForbiddenException('No posees los permisos necesarios para realizar esta acción');
    }

    // SuperAdmin tiene bypass total
    if (user.roles && user.roles.includes('SUPERADMIN')) {
      return true;
    }

    const hasPermission = requiredPermissions.every((permission) =>
      user.permisos.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(`Permisos insuficientes: Requiere [${requiredPermissions.join(', ')}]`);
    }

    return true;
  }
}
