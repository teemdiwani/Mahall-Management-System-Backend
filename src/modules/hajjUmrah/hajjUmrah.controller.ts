import type { Request, Response, NextFunction } from 'express';
import { HajjUmrahService } from './hajjUmrah.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class HajjUmrahController {
  static async listPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const posts = await HajjUmrahService.listPosts({
        status: req.query.status as string,
        type: req.query.type as string,
        search: req.query.search as string,
      });
      return ApiResponse.success(res, posts);
    } catch (error) {
      next(error);
    }
  }

  static async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await HajjUmrahService.getPostById(req.params.id as string);
      return ApiResponse.success(res, post);
    } catch (error) {
      next(error);
    }
  }

  static async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await HajjUmrahService.createPost(req.body, req.user?._id);
      return ApiResponse.success(res, post, 201, 'Hajj/Umrah registration post created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await HajjUmrahService.updatePost(req.params.id as string, req.body);
      return ApiResponse.success(res, post, 200, 'Package post updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      await HajjUmrahService.deletePost(req.params.id as string);
      return ApiResponse.success(res, null, 200, 'Package post deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await HajjUmrahService.register(
        req.params.id as string,
        req.body,
        req.user?._id
      );
      return ApiResponse.success(
        res,
        result,
        201,
        'Registration successful! Confirmation email has been sent. Please contact the travels partner to grab your seats.'
      );
    } catch (error) {
      next(error);
    }
  }

  static async listRegistrations(req: Request, res: Response, next: NextFunction) {
    try {
      const registrations = await HajjUmrahService.listRegistrations({
        postId: req.query.postId as string,
        status: req.query.status as string,
        search: req.query.search as string,
      });
      return ApiResponse.success(res, registrations);
    } catch (error) {
      next(error);
    }
  }

  static async getMyRegistrations(req: Request, res: Response, next: NextFunction) {
    try {
      const registrations = await HajjUmrahService.getMyRegistrations(
        req.user?._id,
        req.user?.email
      );
      return ApiResponse.success(res, registrations);
    } catch (error) {
      next(error);
    }
  }

  static async updateRegistrationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const registration = await HajjUmrahService.updateRegistrationStatus(
        req.params.id as string,
        req.body.status
      );
      return ApiResponse.success(res, registration, 200, 'Registration status updated');
    } catch (error) {
      next(error);
    }
  }

  static async resendEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const registration = await HajjUmrahService.resendRegistrationEmail(
        req.params.id as string
      );
      return ApiResponse.success(
        res,
        registration,
        200,
        'Confirmation email resent successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await HajjUmrahService.getStats();
      return ApiResponse.success(res, stats);
    } catch (error) {
      next(error);
    }
  }
}
