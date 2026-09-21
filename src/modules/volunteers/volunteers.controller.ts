import type { Request, Response, NextFunction } from 'express';
import { VolunteersService } from './volunteers.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { Volunteer } from './volunteer.model.js';

export class VolunteersController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const volunteers = await VolunteersService.listVolunteers(req.query);
      return ApiResponse.success(res, volunteers);
    } catch (error) {
      next(error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const volunteer = await VolunteersService.registerVolunteer(req.user!._id.toString(), req.body);
      return ApiResponse.success(res, volunteer, 201, 'Volunteer registration successful');
    } catch (error) {
      next(error);
    }
  }

  static async updateAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await Volunteer.findByIdAndUpdate(
        req.params.id,
        { availability: req.body.availability, emergencyVolunteer: req.body.emergencyVolunteer },
        { new: true }
      );
      return ApiResponse.success(res, updated, 200, 'Availability updated');
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await Volunteer.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true }
      );
      return ApiResponse.success(res, updated, 200, 'Status updated');
    } catch (error) {
      next(error);
    }
  }
}
