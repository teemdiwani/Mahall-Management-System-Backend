"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const notifications_service_js_1 = require("./notifications.service.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
class NotificationsController {
    static async getMy(req, res, next) {
        try {
            const list = await notifications_service_js_1.NotificationsService.getMyNotifications(req.user._id.toString());
            const unreadCount = await notifications_service_js_1.NotificationsService.getUnreadCount(req.user._id.toString());
            return apiResponse_js_1.ApiResponse.success(res, { notifications: list, unreadCount });
        }
        catch (error) {
            next(error);
        }
    }
    static async markRead(req, res, next) {
        try {
            const updated = await notifications_service_js_1.NotificationsService.markAsRead(req.params.id, req.user._id.toString());
            return apiResponse_js_1.ApiResponse.success(res, updated);
        }
        catch (error) {
            next(error);
        }
    }
    static async markAllRead(req, res, next) {
        try {
            const result = await notifications_service_js_1.NotificationsService.markAllAsRead(req.user._id.toString());
            return apiResponse_js_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.NotificationsController = NotificationsController;
