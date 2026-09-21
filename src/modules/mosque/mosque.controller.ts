import type { Request, Response, NextFunction } from 'express';
import { MosqueService } from './mosque.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class MosqueController {
  static async getInfo(_req: Request, res: Response, next: NextFunction) {
    try {
      const mosque = await MosqueService.getMosqueInfo();
      return ApiResponse.success(res, mosque);
    } catch (error) {
      next(error);
    }
  }

  static async updateTimings(req: Request, res: Response, next: NextFunction) {
    try {
      const { prayerTimings, jumahDetails } = req.body;
      const updated = await MosqueService.updatePrayerTimings(prayerTimings, jumahDetails);
      return ApiResponse.success(res, updated, 200, 'Prayer timings updated');
    } catch (error) {
      next(error);
    }
  }

  static async updatePrograms(req: Request, res: Response, next: NextFunction) {
    try {
      const { programs } = req.body;
      const updated = await MosqueService.updatePrograms(programs);
      return ApiResponse.success(res, updated, 200, 'Programs updated');
    } catch (error) {
      next(error);
    }
  }
}

