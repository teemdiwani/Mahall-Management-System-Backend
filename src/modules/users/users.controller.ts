import type { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { logAudit } from '../../middleware/auditLogger.js';

export class UsersController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UsersService.listUsers(req.query);
      return ApiResponse.paginate(res, result.items, result.page, result.limit, result.total);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UsersService.getUserById(req.params.id as string);
      return ApiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  }

  static async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, customPermissions } = req.body;
      const { user, oldRole, newRole } = await UsersService.updateUserRole(
        req.params.id as string,
        role,
        customPermissions
      );

      await logAudit(
        req,
        'USER_ROLE_CHANGED',
        'User',
        user._id.toString(),
        { role: oldRole },
        { role: newRole }
      );

      return ApiResponse.success(res, user, 200, `User role updated to ${newRole}`);
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { isActive } = req.body;
      const user = await UsersService.updateUserStatus(req.params.id as string, isActive);

      await logAudit(
        req,
        'USER_STATUS_CHANGED',
        'User',
        user._id.toString(),
        null,
        { isActive }
      );

      return ApiResponse.success(res, user, 200, `User account ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      next(error);
    }
  }
}
