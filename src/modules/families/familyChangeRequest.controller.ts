import type { Request, Response, NextFunction } from 'express';
import { FamilyChangeRequestService } from './familyChangeRequest.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { logAudit } from '../../middleware/auditLogger.js';

export class FamilyChangeRequestController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FamilyChangeRequestService.listRequests(req.query, req.user);
      return ApiResponse.paginate(res, result.items, result.page, result.limit, result.total);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FamilyChangeRequestService.getRequestById(req.params.id as string);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const request = await FamilyChangeRequestService.createRequest(
        req.user!._id.toString(),
        req.user!.role,
        req.body
      );

      await logAudit(
        req,
        'FAMILY_REQUEST_SUBMITTED',
        'FamilyChangeRequest',
        request._id.toString(),
        null,
        { requestCode: request.requestCode, requestType: request.requestType, familyId: request.familyId }
      );

      return ApiResponse.success(res, request, 201, 'Family change request submitted');
    } catch (error) {
      next(error);
    }
  }

  static async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const { comment } = req.body;
      const result = await FamilyChangeRequestService.approveRequest(
        req.params.id as string,
        req.user!._id.toString(),
        comment
      );

      await logAudit(
        req,
        'FAMILY_REQUEST_APPROVED',
        'FamilyChangeRequest',
        req.params.id as string,
        null,
        { comment }
      );

      return ApiResponse.success(res, result, 200, 'Family change request approved and applied');
    } catch (error) {
      next(error);
    }
  }

  static async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body;
      const result = await FamilyChangeRequestService.rejectRequest(
        req.params.id as string,
        req.user!._id.toString(),
        reason
      );

      await logAudit(
        req,
        'FAMILY_REQUEST_REJECTED',
        'FamilyChangeRequest',
        req.params.id as string,
        null,
        { reason }
      );

      return ApiResponse.success(res, result, 200, 'Family change request rejected');
    } catch (error) {
      next(error);
    }
  }
}
