import type { Request, Response, NextFunction } from 'express';
import { CommitteeService } from './committee.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class CommitteeController {
  static async listMembers(_req: Request, res: Response, next: NextFunction) {
    try {
      const members = await CommitteeService.listMembers();
      return ApiResponse.success(res, members);
    } catch (error) {
      next(error);
    }
  }

  static async createMember(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await CommitteeService.createMember(req.body);
      return ApiResponse.success(res, member, 201, 'Committee member added');
    } catch (error) {
      next(error);
    }
  }

  static async deleteMember(req: Request, res: Response, next: NextFunction) {
    try {
      await CommitteeService.deleteMember(req.params.id as string);
      return ApiResponse.success(res, null, 200, 'Committee member removed');
    } catch (error) {
      next(error);
    }
  }

  static async listMeetings(_req: Request, res: Response, next: NextFunction) {
    try {
      const meetings = await CommitteeService.listMeetings();
      return ApiResponse.success(res, meetings);
    } catch (error) {
      next(error);
    }
  }

  static async scheduleMeeting(req: Request, res: Response, next: NextFunction) {
    try {
      const meeting = await CommitteeService.scheduleMeeting(req.body);
      return ApiResponse.success(res, meeting, 201, 'Meeting scheduled');
    } catch (error) {
      next(error);
    }
  }

  static async updateMinutes(req: Request, res: Response, next: NextFunction) {
    try {
      const meeting = await CommitteeService.updateMeetingMinutes(req.params.id as string, req.body);
      return ApiResponse.success(res, meeting, 200, 'Meeting minutes and resolutions recorded');
    } catch (error) {
      next(error);
    }
  }
}
