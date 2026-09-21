"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const notification_model_js_1 = require("./notification.model.js");
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
}
exports.NotificationsService = NotificationsService;
