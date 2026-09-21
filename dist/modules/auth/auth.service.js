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
const family_model_js_1 = require("../families/family.model.js");
const roles_js_1 = require("../../constants/roles.js");
const permissions_js_1 = require("../../constants/permissions.js");
const apiError_js_1 = require("../../utils/apiError.js");
const jwt_js_1 = require("../../utils/jwt.js");
const env_js_1 = require("../../config/env.js");
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
            if (env_js_1.env.GOOGLE_CLIENT_ID && env_js_1.env.GOOGLE_CLIENT_ID.length > 5) {
                const ticket = await googleClient.verifyIdToken({
                    idToken: credential,
                    audience: env_js_1.env.GOOGLE_CLIENT_ID,
                });
                payload = ticket.getPayload();
            }
            else {
                // Fallback for mock/local development token decode
                const decoded = JSON.parse(Buffer.from(credential.split('.')[1] || '', 'base64').toString() || '{}');
                payload = {
                    email: decoded.email || 'googleuser@mahallconnect.org',
                    name: decoded.name || 'Google User',
                    sub: decoded.sub || 'google-sub-mock-id',
                    picture: decoded.picture || '',
                };
            }
        }
        catch {
            throw apiError_js_1.ApiError.badRequest('Invalid Google authentication credential');
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
        // Find linked member record
        const member = await member_model_js_1.Member.findOne({
            $or: [{ userId: user._id }, { email: user.email }],
        });
        // Find linked family record
        let family = null;
        if (member && member.familyId) {
            family = await family_model_js_1.Family.findById(member.familyId);
        }
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
}
exports.AuthService = AuthService;
