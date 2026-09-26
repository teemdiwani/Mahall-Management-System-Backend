"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const notification_model_js_1 = require("./notification.model.js");
const user_model_js_1 = require("../auth/user.model.js");
const member_model_js_1 = require("../members/member.model.js");
class NotificationsService {
    static async getMyNotifications(userId) {
        return notification_model_js_1.Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .limit(30);
    }
    static async getUnreadCount(userId) {
        return notification_model_js_1.Notification.countDocuments({ recipient: userId, read: false });
    }
    static async markAsRead(id, userId) {
        return notification_model_js_1.Notification.findOneAndUpdate({ _id: id, recipient: userId }, { read: true }, { new: true });
    }
    static async markAllAsRead(userId) {
        await notification_model_js_1.Notification.updateMany({ recipient: userId, read: false }, { read: true });
        return { success: true };
    }
    /**
     * Broadcast notification to all active users or filtered by roles
     */
    static async broadcastNotification(data) {
        try {
            const userFilter = { isActive: { $ne: false } };
            if (data.roleFilter && data.roleFilter.length > 0) {
                userFilter.role = { $in: data.roleFilter };
            }
            const users = await user_model_js_1.User.find(userFilter).select('_id');
            if (!users.length)
                return;
            const docs = users.map((u) => ({
                recipient: u._id,
                type: data.type,
                title: data.title,
                message: data.message,
                link: data.link,
                read: false,
            }));
            await notification_model_js_1.Notification.insertMany(docs, { ordered: false });
        }
        catch (err) {
            console.error('Failed to broadcast notification:', err);
        }
    }
    /**
     * Send notification to all registered user accounts under a specific family
     */
    static async notifyFamilyMembers(familyId, data) {
        try {
            const members = await member_model_js_1.Member.find({ familyId, userId: { $exists: true, $ne: null } });
            for (const m of members) {
                if (m.userId) {
                    await notification_model_js_1.Notification.create({
                        recipient: m.userId,
                        type: data.type,
                        title: data.title,
                        message: data.message,
                        link: data.link,
                        read: false,
                    });
                }
            }
        }
        catch (err) {
            console.error('Failed to notify family members:', err);
        }
    }
}
exports.NotificationsService = NotificationsService;
