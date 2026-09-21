import type { Request, Response, NextFunction } from 'express';
import { ApplicationsService } from './applications.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { logAudit } from '../../middleware/auditLogger.js';

export class ApplicationsController {
  static async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await ApplicationsService.submitApplication(
        req.user!._id.toString(),
        req.body
      );

      await logAudit(
        req,
        'APPLICATION_SUBMITTED',
        'Application',
        application._id.toString(),
        null,
        { type: application.type, applicationNumber: application.applicationNumber }
      );

      return ApiResponse.success(res, application, 201, 'Application submitted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ApplicationsService.listApplications(
        req.user!.role,
        req.user!._id.toString(),
        req.query
      );
      return ApiResponse.paginate(res, result.items, result.page, result.limit, result.total);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ApplicationsService.getApplicationById(
        req.params.id as string,
        req.user!.role,
        req.user!._id.toString()
      );
      return ApiResponse.success(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, comment, decision } = req.body;
      const application = await ApplicationsService.updateStatus(
        req.params.id as string,
        status,
        req.user!._id.toString(),
        comment,
        decision
      );

      await logAudit(
        req,
        'APPLICATION_STATUS_UPDATED',
        'Application',
        application._id.toString(),
        null,
        { newStatus: status, comment }
      );

      return ApiResponse.success(res, application, 200, `Application moved to ${status}`);
    } catch (error) {
      next(error);
    }
  }
}
