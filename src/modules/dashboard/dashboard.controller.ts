import type { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service.js';
import { WelfareService } from '../welfare/welfare.service.js';
import { MadrasaService } from '../madrasa/madrasa.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { ApiError } from '../../utils/apiError.js';

export class DashboardController {
  static async getAdminDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getAdminDashboard();
      return ApiResponse.success(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async getDashboardStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getDashboardStats();
      return ApiResponse.success(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async getDashboardCharts(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getDashboardCharts();
      return ApiResponse.success(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async getMemberDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const searchNumber = (req.query.number as string) || (req.query.phone as string) || undefined;
      const data = await DashboardService.getMemberDashboard(
        req.user!._id.toString(),
        req.user!.email,
        req.user!.phone,
        searchNumber
      );
      return ApiResponse.success(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async linkFamilyByPhone(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone } = req.body;
      if (!phone || typeof phone !== 'string' || !phone.trim()) {
        throw ApiError.badRequest('Please provide a valid phone number');
      }
      const data = await DashboardService.getMemberDashboard(
        req.user!._id.toString(),
        req.user!.email,
        req.user!.phone,
        phone.trim()
      );
      if (!data.family) {
        throw ApiError.notFound(
          'No family household found matching this number. Please check the number or contact the Mahall Secretary office.'
        );
      }
      return ApiResponse.success(res, data, 200, 'Household connected successfully!');
    } catch (error) {
      next(error);
    }
  }

  static async getTreasurerDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getTreasurerDashboard();
      return ApiResponse.success(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async getSecretaryDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getSecretaryDashboard();
      return ApiResponse.success(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async getWelfareDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await WelfareService.getWelfareDashboard();
      return ApiResponse.success(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async getMadrasaDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MadrasaService.getMadrasaDashboard();
      return ApiResponse.success(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async getImamDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getImamDashboard();
      return ApiResponse.success(res, data);
    } catch (error) {
      next(error);
    }
  }
}
