"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_js_1 = require("./auth.service.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
const jwt_js_1 = require("../../utils/jwt.js");
const env_js_1 = require("../../config/env.js");
class AuthController {
    static async register(req, res, next) {
        try {
            const { user, token } = await auth_service_js_1.AuthService.register(req.body);
            res.cookie('token', token, (0, jwt_js_1.getCookieOptions)());
            return apiResponse_js_1.ApiResponse.success(res, { user, token }, 201, 'Registration successful');
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const { user, token } = await auth_service_js_1.AuthService.login(email, password);
            res.cookie('token', token, (0, jwt_js_1.getCookieOptions)());
            return apiResponse_js_1.ApiResponse.success(res, { user, token }, 200, 'Login successful');
        }
        catch (error) {
            next(error);
        }
    }
    static async googleAuth(req, res, next) {
        try {
            const { credential } = req.body;
            const { user, token } = await auth_service_js_1.AuthService.googleAuth(credential);
            res.cookie('token', token, (0, jwt_js_1.getCookieOptions)());
            return apiResponse_js_1.ApiResponse.success(res, { user, token }, 200, 'Google login successful');
        }
        catch (error) {
            next(error);
        }
    }
    static async getMe(req, res, next) {
        try {
            const data = await auth_service_js_1.AuthService.getMe(req.user._id.toString());
            return apiResponse_js_1.ApiResponse.success(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(_req, res, next) {
        try {
            res.clearCookie('token', { path: '/' });
            return apiResponse_js_1.ApiResponse.success(res, { loggedOut: true }, 200, 'Logged out successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const result = await auth_service_js_1.AuthService.forgotPassword(email);
            return apiResponse_js_1.ApiResponse.success(res, result, 200, result.message);
        }
        catch (error) {
            next(error);
        }
    }
    static async verifyResetOtp(req, res, next) {
        try {
            const { email, otp } = req.body;
            const result = await auth_service_js_1.AuthService.verifyResetOtp(email, otp);
            return apiResponse_js_1.ApiResponse.success(res, result, 200, result.message);
        }
        catch (error) {
            next(error);
        }
    }
    static async resetPassword(req, res, next) {
        try {
            const { email, otp, newPassword } = req.body;
            const result = await auth_service_js_1.AuthService.resetPasswordWithOtp(email, otp, newPassword);
            return apiResponse_js_1.ApiResponse.success(res, result, 200, result.message);
        }
        catch (error) {
            next(error);
        }
    }
    static async getConfig(_req, res) {
        return apiResponse_js_1.ApiResponse.success(res, {
            googleClientId: env_js_1.env.GOOGLE_CLIENT_ID || '',
        }, 200, 'Auth configuration retrieved');
    }
}
exports.AuthController = AuthController;
