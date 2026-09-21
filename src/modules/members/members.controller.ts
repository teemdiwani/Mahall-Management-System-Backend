import type { Request, Response, NextFunction } from 'express';
import { MembersService } from './members.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class MembersController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MembersService.listMembers(req.query);
      return ApiResponse.paginate(res, result.items, result.page, result.limit, result.total);
    } catch (error) {
      next(error);
    }
  }

  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req.query.q as string) || '';
      const results = await MembersService.searchMembers(query);
      return ApiResponse.success(res, results);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await MembersService.getMemberById(req.params.id as string);
      return ApiResponse.success(res, member);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await MembersService.createMember(req.body);
      return ApiResponse.success(res, member, 201, 'Member registered successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await MembersService.updateMember(req.params.id as string, req.body);
      return ApiResponse.success(res, member, 200, 'Member details updated');
    } catch (error) {
      next(error);
    }
  }

  static async transfer(req: Request, res: Response, next: NextFunction) {
    try {
      const { newFamilyId, newRelationship } = req.body;
      const member = await MembersService.transferMember(req.params.id as string, newFamilyId, newRelationship);
      return ApiResponse.success(res, member, 200, 'Member transferred to new family');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MembersService.deleteMember(req.params.id as string);
      return ApiResponse.success(res, result, 200, 'Member deactivated');
    } catch (error) {
      next(error);
    }
  }
}
