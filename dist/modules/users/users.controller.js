"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const users_service_js_1 = require("./users.service.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
const auditLogger_js_1 = require("../../middleware/auditLogger.js");
class UsersController {
    static async list(req, res, next) {
        try {
            const result = await users_service_js_1.UsersService.listUsers(req.query);
            return apiResponse_js_1.ApiResponse.paginate(res, result.items, result.page, result.limit, result.total);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const user = await users_service_js_1.UsersService.getUserById(req.params.id);
            return apiResponse_js_1.ApiResponse.success(res, user);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateRole(req, res, next) {
        try {
            const { role, customPermissions } = req.body;
            const { user, oldRole, newRole } = await users_service_js_1.UsersService.updateUserRole(req.params.id, role, customPermissions);
            await (0, auditLogger_js_1.logAudit)(req, 'USER_ROLE_CHANGED', 'User', user._id.toString(), { role: oldRole }, { role: newRole });
            return apiResponse_js_1.ApiResponse.success(res, user, 200, `User role updated to ${newRole}`);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateStatus(req, res, next) {
        try {
            const { isActive } = req.body;
            const user = await users_service_js_1.UsersService.updateUserStatus(req.params.id, isActive);
            await (0, auditLogger_js_1.logAudit)(req, 'USER_STATUS_CHANGED', 'User', user._id.toString(), null, { isActive });
            return apiResponse_js_1.ApiResponse.success(res, user, 200, `User account ${isActive ? 'activated' : 'deactivated'}`);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UsersController = UsersController;
