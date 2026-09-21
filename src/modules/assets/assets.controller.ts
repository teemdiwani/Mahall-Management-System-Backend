import type { Request, Response, NextFunction } from 'express';
import { AssetsService } from './assets.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class AssetsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const assets = await AssetsService.listAssets(req.query);
      return ApiResponse.success(res, assets);
    } catch (error) {
      next(error);
    }
  }

  static async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AssetsService.getAssetStats();
      return ApiResponse.success(res, stats);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await AssetsService.createAsset(req.body);
      return ApiResponse.success(res, created, 201, 'Asset registered');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await AssetsService.updateAsset(req.params.id as string, req.body);
      return ApiResponse.success(res, updated, 200, 'Asset updated');
    } catch (error) {
      next(error);
    }
  }
}
