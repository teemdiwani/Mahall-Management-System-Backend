import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { User, type IUser } from '../modules/auth/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { ROLE_PERMISSIONS, type Permission } from '../constants/permissions.js';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      permissions?: Permission[];
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // Check cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // Check Authorization header
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return next(ApiError.unauthorized('Invalid or expired authentication token'));
    }

    const user = await User.findById(payload.userId);

    if (!user) {
      return next(ApiError.unauthorized('User not found'));
    }

    if (!user.isActive) {
      return next(ApiError.forbidden('Your account has been deactivated'));
    }

    // Compute effective permissions
    const defaultPerms = ROLE_PERMISSIONS[user.role] || [];
    const effectivePermissions = Array.from(
      new Set([...defaultPerms, ...(user.customPermissions as Permission[])])
    );

    req.user = user;
    req.permissions = effectivePermissions;

    next();
  } catch (error) {
    next(error);
  }
};
