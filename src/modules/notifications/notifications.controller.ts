import type { Request, Response, NextFunction } from 'express';
import { NotificationsService } from './notifications.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class NotificationsController {
  static async getMy(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await NotificationsService.getMyNotifications(req.user!._id.toString());
      const unreadCount = await NotificationsService.getUnreadCount(req.user!._id.toString());
      return ApiResponse.success(res, { notifications: list, unreadCount });
    } catch (error) {
      next(error);
    }
  }

  static async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await NotificationsService.markAsRead(
        req.params.id as string,
        req.user!._id.toString()
      );
      return ApiResponse.success(res, updated);
    } catch (error) {
      next(error);
    }
  }

  static async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await NotificationsService.markAllAsRead(req.user!._id.toString());
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
