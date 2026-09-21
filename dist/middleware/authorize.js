"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = exports.requireRole = void 0;
const roles_js_1 = require("../constants/roles.js");
const apiError_js_1 = require("../utils/apiError.js");
const requireRole = (...allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(apiError_js_1.ApiError.unauthorized('Authentication required'));
        }
        // Super Admin has all privileges
        if (req.user.role === roles_js_1.ROLES.SUPER_ADMIN) {
            return next();
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(apiError_js_1.ApiError.forbidden(`Access denied. Requires one of roles: ${allowedRoles.join(', ')}`));
        }
        next();
    };
};
exports.requireRole = requireRole;
const requirePermission = (...requiredPermissions) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(apiError_js_1.ApiError.unauthorized('Authentication required'));
        }
        // Super Admin bypasses permission checks
        if (req.user.role === roles_js_1.ROLES.SUPER_ADMIN) {
            return next();
        }
        const userPermissions = req.permissions || [];
        const hasAll = requiredPermissions.every((perm) => userPermissions.includes(perm));
        if (!hasAll) {
            return next(apiError_js_1.ApiError.forbidden(`Access denied. Missing required permission: ${requiredPermissions.join(', ')}`));
        }
        next();
    };
};
exports.requirePermission = requirePermission;
