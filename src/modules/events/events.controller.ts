import type { Request, Response, NextFunction } from 'express';
import { EventsService } from './events.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class EventsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const events = await EventsService.listEvents(req.query);
      return ApiResponse.success(res, events);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await EventsService.getEventById(req.params.id as string);
      return ApiResponse.success(res, event);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await EventsService.createEvent(req.body, req.user!._id.toString());
      return ApiResponse.success(res, event, 201, 'Event created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await EventsService.registerForEvent(req.params.id as string, req.user!._id.toString());
      return ApiResponse.success(res, event, 200, 'Registered for event');
    } catch (error) {
      next(error);
    }
  }
}
