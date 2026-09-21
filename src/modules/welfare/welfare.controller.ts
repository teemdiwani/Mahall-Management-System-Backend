import type { Request, Response, NextFunction } from 'express';
import { WelfareService } from './welfare.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class WelfareController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WelfareService.getWelfareDashboard();
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async listCases(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WelfareService.listCases(req.query);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async createCase(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WelfareService.createCase({ ...req.body, applicant: req.user!._id });
      return ApiResponse.success(res, result, 201, 'Welfare case created');
    } catch (error) {
      next(error);
    }
  }

  static async updateCaseStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WelfareService.updateCaseStatus(
        req.params.id as string,
        req.body.status,
        req.user!._id.toString(),
        req.body.note
      );
      return ApiResponse.success(res, result, 200, 'Case status updated');
    } catch (error) {
      next(error);
    }
  }

  static async listBeneficiaries(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WelfareService.listBeneficiaries(req.query);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getZakatSummary(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WelfareService.getZakatSummary();
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async distributeZakat(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WelfareService.distributeZakat({ ...req.body, distributedBy: req.user!._id });
      return ApiResponse.success(res, result, 201, 'Zakat distribution recorded');
    } catch (error) {
      next(error);
    }
  }
}
