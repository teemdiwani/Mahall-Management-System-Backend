import { User } from '../auth/user.model.js';
import { ApiError } from '../../utils/apiError.js';
import type { UserRole } from '../../constants/roles.js';

export class UsersService {
  static async listUsers(query: { page?: number; limit?: number; search?: string; role?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
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
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return { items, page, limit, total };
  }

  static async getUserById(id: string) {
    const user = await User.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  static async updateUserRole(id: string, newRole: UserRole, customPermissions?: string[]) {
    const user = await User.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const oldRole = user.role;
    user.role = newRole;
    if (customPermissions) {
      user.customPermissions = customPermissions;
    }
    await user.save();

    return { user, oldRole, newRole };
  }

  static async updateUserStatus(id: string, isActive: boolean) {
    const user = await User.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    user.isActive = isActive;
    await user.save();
    return user;
  }
}
