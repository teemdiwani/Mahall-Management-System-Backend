import type { Request, Response, NextFunction } from 'express';
import { ROLES, type UserRole } from '../constants/roles.js';
import type { Permission } from '../constants/permissions.js';
import { ApiError } from '../utils/apiError.js';

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    // Super Admin has all privileges
    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
};

export const requirePermission = (...requiredPermissions: Permission[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    // Super Admin bypasses permission checks
    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    const userPermissions = req.permissions || [];
    const hasAll = requiredPermissions.every((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasAll) {
      return next(
        ApiError.forbidden(
          `Access denied. Missing required permission: ${requiredPermissions.join(
            ', '
          )}`
        )
      );
    }

    next();
  };
};
