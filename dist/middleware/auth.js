"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_js_1 = require("../utils/jwt.js");
const user_model_js_1 = require("../modules/auth/user.model.js");
const apiError_js_1 = require("../utils/apiError.js");
const permissions_js_1 = require("../constants/permissions.js");
const authenticate = async (req, _res, next) => {
    try {
        let token;
        // Check cookie
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        // Check Authorization header
        else if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return next(apiError_js_1.ApiError.unauthorized('Authentication required'));
        }
        let payload;
        try {
            payload = (0, jwt_js_1.verifyToken)(token);
        }
        catch {
            return next(apiError_js_1.ApiError.unauthorized('Invalid or expired authentication token'));
        }
        const user = await user_model_js_1.User.findById(payload.userId);
        if (!user) {
            return next(apiError_js_1.ApiError.unauthorized('User not found'));
        }
        if (!user.isActive) {
            return next(apiError_js_1.ApiError.forbidden('Your account has been deactivated'));
        }
        // Compute effective permissions
        const defaultPerms = permissions_js_1.ROLE_PERMISSIONS[user.role] || [];
        const effectivePermissions = Array.from(new Set([...defaultPerms, ...user.customPermissions]));
        req.user = user;
        req.permissions = effectivePermissions;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authenticate = authenticate;
