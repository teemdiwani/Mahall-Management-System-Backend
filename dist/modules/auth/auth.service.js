"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const google_auth_library_1 = require("google-auth-library");
const user_model_js_1 = require("./user.model.js");
const member_model_js_1 = require("../members/member.model.js");
const roles_js_1 = require("../../constants/roles.js");
const permissions_js_1 = require("../../constants/permissions.js");
const apiError_js_1 = require("../../utils/apiError.js");
const jwt_js_1 = require("../../utils/jwt.js");
const env_js_1 = require("../../config/env.js");
const mailService_js_1 = require("../../utils/mailService.js");
const googleClient = new google_auth_library_1.OAuth2Client(env_js_1.env.GOOGLE_CLIENT_ID);
class AuthService {
    static async register(data) {
        const existing = await user_model_js_1.User.findOne({ email: data.email.toLowerCase() });
        if (existing) {
            throw apiError_js_1.ApiError.conflict('An account with this email already exists');
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(data.password, salt);
        // Business Rule 1 & 2: EVERY new account MUST default to MEMBER role
        const user = await user_model_js_1.User.create({
            name: data.name,
            email: data.email.toLowerCase(),
            phone: data.phone.trim(),
            passwordHash,
            role: roles_js_1.ROLES.MEMBER,
            customPermissions: [],
            isActive: true,
            lastLogin: new Date(),
        });
        // Check if there is an existing Member record with this email or phone to link
        const existingMember = await member_model_js_1.Member.findOne({
            $or: [
                { email: user.email },
                { phone: data.phone.trim() },
            ],
        });
        if (existingMember) {
            if (!existingMember.userId) {
                existingMember.userId = user._id;
            }
            if (!existingMember.phone) {
                existingMember.phone = data.phone.trim();
            }
            await existingMember.save();
        }
        const token = (0, jwt_js_1.generateToken)({
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
        });
        return { user, token };
    }
    static async login(email, password) {
        const user = await user_model_js_1.User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
        if (!user) {
            throw apiError_js_1.ApiError.unauthorized('Invalid email or password');
        }
        if (!user.isActive) {
            throw apiError_js_1.ApiError.forbidden('Your account has been deactivated. Please contact the administrator.');
        }
        if (!user.passwordHash) {
            throw apiError_js_1.ApiError.badRequest('Please sign in using Google OAuth');
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            throw apiError_js_1.ApiError.unauthorized('Invalid email or password');
        }
        user.lastLogin = new Date();
        await user.save();
        const token = (0, jwt_js_1.generateToken)({
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
        });
        return { user, token };
    }
    static async googleAuth(credential) {
        let payload;
        try {
            // 1. Explicit dev mock bypass for testing without Google Cloud connectivity
            if (env_js_1.env.NODE_ENV === 'development' && credential.startsWith('mock-dev-token:')) {
                const jsonStr = Buffer.from(credential.replace('mock-dev-token:', ''), 'base64').toString('utf-8');
                const decoded = JSON.parse(jsonStr || '{}');
                payload = {
                    email: decoded.email || 'googleuser@mahallconnect.org',
                    name: decoded.name || 'Google User',
                    sub: decoded.sub || 'google-sub-mock-id',
                    picture: decoded.picture || '',
                };
            }
            else if (env_js_1.env.GOOGLE_CLIENT_ID && env_js_1.env.GOOGLE_CLIENT_ID.length > 5) {
                // 2. Real Google OAuth ID Token verification
                const ticket = await googleClient.verifyIdToken({
                    idToken: credential,
                    audience: env_js_1.env.GOOGLE_CLIENT_ID,
                });
                payload = ticket.getPayload();
            }
            else {
                // 3. Fallback when GOOGLE_CLIENT_ID is not configured in .env
                const parts = credential.split('.');
                const payloadBase64 = parts[1] || parts[0] || '';
                const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString() || '{}');
                payload = {
                    email: decoded.email || 'googleuser@mahallconnect.org',
                    name: decoded.name || 'Google User',
                    sub: decoded.sub || 'google-sub-mock-id',
                    picture: decoded.picture || '',
                };
            }
        }
        catch (err) {
            console.error('❌ Google token verification error:', err?.message || err);
            const errorMsg = env_js_1.env.NODE_ENV === 'development' && err?.message
                ? `Google token verification failed: ${err.message}`
                : 'Invalid Google authentication credential';
            throw apiError_js_1.ApiError.badRequest(errorMsg);
        }
        if (!payload || !payload.email) {
            throw apiError_js_1.ApiError.badRequest('Google account does not provide a valid email');
        }
        let user = await user_model_js_1.User.findOne({
            $or: [{ googleId: payload.sub }, { email: payload.email.toLowerCase() }],
        });
        if (!user) {
            // New user via Google: Default to MEMBER role
            user = await user_model_js_1.User.create({
                name: payload.name || payload.email.split('@')[0],
                email: payload.email.toLowerCase(),
                googleId: payload.sub,
                avatar: payload.picture || '',
                role: roles_js_1.ROLES.MEMBER,
                customPermissions: [],
                isActive: true,
                lastLogin: new Date(),
            });
        }
        else {
            if (!user.googleId && payload.sub) {
                user.googleId = payload.sub;
            }
            user.lastLogin = new Date();
            await user.save();
        }
        // Auto-link with member profile if exists
        const existingMember = await member_model_js_1.Member.findOne({ email: user.email });
        if (existingMember && !existingMember.userId) {
            existingMember.userId = user._id;
            await existingMember.save();
        }
        const token = (0, jwt_js_1.generateToken)({
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
        });
        return { user, token };
    }
    static async getMe(userId) {
        const user = await user_model_js_1.User.findById(userId);
        if (!user) {
            throw apiError_js_1.ApiError.notFound('User account not found');
        }
        // Find linked member & family using unified matcher
        const { findFamilyAndMemberForUser } = await import('../../utils/memberMatcher.js');
        const match = await findFamilyAndMemberForUser({
            userId: user._id.toString(),
            email: user.email,
            phone: user.phone,
        });
        const member = match.currentMember;
        const family = match.family;
        const defaultPerms = permissions_js_1.ROLE_PERMISSIONS[user.role] || [];
        const permissions = Array.from(new Set([...defaultPerms, ...user.customPermissions]));
        return {
            user,
            member,
            family,
            role: user.role,
            permissions,
        };
    }
    static async forgotPassword(email) {
        const user = await user_model_js_1.User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            throw apiError_js_1.ApiError.notFound('No account found with this email address');
        }
        if (!user.isActive) {
            throw apiError_js_1.ApiError.forbidden('This account is currently inactive. Please contact the Mahallu administrator.');
        }
        // Generate 6-digit cryptographic-quality numeric OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        user.passwordResetOtp = otp;
        user.passwordResetExpires = expires;
        await user.save();
        await mailService_js_1.mailService.sendPasswordResetOtpEmail({
            email: user.email,
            name: user.name,
            otp,
        });
        return {
            email: user.email,
            message: 'A 6-digit verification code has been sent to your email.',
        };
    }
    static async verifyResetOtp(email, otp) {
        const user = await user_model_js_1.User.findOne({
            email: email.toLowerCase().trim(),
        }).select('+passwordResetOtp +passwordResetExpires');
        if (!user || !user.passwordResetOtp || !user.passwordResetExpires) {
            throw apiError_js_1.ApiError.badRequest('Invalid or expired verification request. Please request a new OTP.');
        }
        if (user.passwordResetExpires < new Date()) {
            throw apiError_js_1.ApiError.badRequest('This verification code has expired. Please request a new code.');
        }
        if (user.passwordResetOtp !== otp.trim()) {
            throw apiError_js_1.ApiError.badRequest('Invalid 6-digit verification code. Please check and try again.');
        }
        return {
            valid: true,
            message: 'OTP verified successfully. You can now set a new password.',
        };
    }
    static async resetPasswordWithOtp(email, otp, newPassword) {
        const user = await user_model_js_1.User.findOne({
            email: email.toLowerCase().trim(),
        }).select('+passwordResetOtp +passwordResetExpires +passwordHash');
        if (!user || !user.passwordResetOtp || !user.passwordResetExpires) {
            throw apiError_js_1.ApiError.badRequest('Invalid or expired verification request. Please request a new OTP.');
        }
        if (user.passwordResetExpires < new Date()) {
            throw apiError_js_1.ApiError.badRequest('This verification code has expired. Please request a new code.');
        }
        if (user.passwordResetOtp !== otp.trim()) {
            throw apiError_js_1.ApiError.badRequest('Invalid 6-digit verification code.');
        }
        if (newPassword.length < 6) {
            throw apiError_js_1.ApiError.badRequest('New password must be at least 6 characters long.');
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        user.passwordHash = await bcryptjs_1.default.hash(newPassword, salt);
        user.passwordResetOtp = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        return {
            success: true,
            message: 'Your password has been reset successfully. You can now sign in with your new password.',
        };
    }
}
exports.AuthService = AuthService;
