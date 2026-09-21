import type { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service.js';
import { WelfareService } from '../welfare/welfare.service.js';
import { MadrasaService } from '../madrasa/madrasa.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

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
      const data = await DashboardService.getMemberDashboard(req.user!._id.toString(), req.user!.email);
      return ApiResponse.success(res, data);
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
