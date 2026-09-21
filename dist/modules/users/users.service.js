"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const user_model_js_1 = require("../auth/user.model.js");
const apiError_js_1 = require("../../utils/apiError.js");
class UsersService {
    static async listUsers(query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
        const skip = (page - 1) * limit;
        const filter = {};
        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { email: { $regex: query.search, $options: 'i' } },
            ];
        }
        if (query.role) {
            filter.role = query.role;
        }
        const [items, total] = await Promise.all([
            user_model_js_1.User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            user_model_js_1.User.countDocuments(filter),
        ]);
        return { items, page, limit, total };
    }
    static async getUserById(id) {
        const user = await user_model_js_1.User.findById(id);
        if (!user) {
            throw apiError_js_1.ApiError.notFound('User not found');
        }
        return user;
    }
    static async updateUserRole(id, newRole, customPermissions) {
        const user = await user_model_js_1.User.findById(id);
        if (!user) {
            throw apiError_js_1.ApiError.notFound('User not found');
        }
        const oldRole = user.role;
        user.role = newRole;
        if (customPermissions) {
            user.customPermissions = customPermissions;
        }
        await user.save();
        return { user, oldRole, newRole };
    }
    static async updateUserStatus(id, isActive) {
        const user = await user_model_js_1.User.findById(id);
        if (!user) {
            throw apiError_js_1.ApiError.notFound('User not found');
        }
        user.isActive = isActive;
        await user.save();
        return user;
    }
}
exports.UsersService = UsersService;
