import type { Request, Response, NextFunction } from 'express';
import { AnnouncementsService } from './announcements.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class AnnouncementsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const announcements = await AnnouncementsService.listAnnouncements(req.user?.role);
      return ApiResponse.success(res, announcements);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const announcement = await AnnouncementsService.createAnnouncement(req.body);
      return ApiResponse.success(res, announcement, 201, 'Announcement published');
    } catch (error) {
      next(error);
    }
  }

  static async archive(req: Request, res: Response, next: NextFunction) {
    try {
      const announcement = await AnnouncementsService.archiveAnnouncement(req.params.id as string);
      return ApiResponse.success(res, announcement, 200, 'Announcement archived');
    } catch (error) {
      next(error);
    }
  }
}
