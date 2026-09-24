import type { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { getCookieOptions } from '../../utils/jwt.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = await AuthService.register(req.body);
      res.cookie('token', token, getCookieOptions());
      return ApiResponse.success(res, { user, token }, 201, 'Registration successful');
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { user, token } = await AuthService.login(email, password);
      res.cookie('token', token, getCookieOptions());
      return ApiResponse.success(res, { user, token }, 200, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const { credential } = req.body;
      const { user, token } = await AuthService.googleAuth(credential);
      res.cookie('token', token, getCookieOptions());
      return ApiResponse.success(res, { user, token }, 200, 'Google login successful');
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AuthService.getMe(req.user!._id.toString());
      return ApiResponse.success(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('token', { path: '/' });
      return ApiResponse.success(res, { loggedOut: true }, 200, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await AuthService.forgotPassword(email);
      return ApiResponse.success(res, result, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async verifyResetOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const result = await AuthService.verifyResetOtp(email, otp);
      return ApiResponse.success(res, result, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp, newPassword } = req.body;
      const result = await AuthService.resetPasswordWithOtp(email, otp, newPassword);
      return ApiResponse.success(res, result, 200, result.message);
    } catch (error) {
      next(error);
    }
  }
}
