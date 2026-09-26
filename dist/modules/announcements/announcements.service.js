"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementsService = void 0;
const announcement_model_js_1 = require("./announcement.model.js");
const roles_js_1 = require("../../constants/roles.js");
const notifications_service_js_1 = require("../notifications/notifications.service.js");
class AnnouncementsService {
    static async listAnnouncements(userRole) {
        const filter = { status: 'ACTIVE' };
        if (userRole && userRole !== roles_js_1.ROLES.SUPER_ADMIN && userRole !== roles_js_1.ROLES.SECRETARY) {
            filter.targetAudience = { $in: ['ALL', 'MEMBERS', userRole] };
        }
        return announcement_model_js_1.Announcement.find(filter).sort({ isPinned: -1, publishedAt: -1 });
    }
    static async createAnnouncement(data) {
        const ann = await announcement_model_js_1.Announcement.create({
            ...data,
            publishedAt: new Date(),
            status: 'ACTIVE',
        });
        // Notify all active users
        notifications_service_js_1.NotificationsService.broadcastNotification({
            type: 'ANNOUNCEMENT',
            title: `📢 Announcement: ${ann.title}`,
            message: ann.content ? ann.content.slice(0, 150) : 'New Mahall announcement published.',
            link: '/app/announcements',
        }).catch(() => { });
        return ann;
    }
    static async archiveAnnouncement(id) {
        return announcement_model_js_1.Announcement.findByIdAndUpdate(id, { status: 'ARCHIVED' }, { new: true });
    }
}
exports.AnnouncementsService = AnnouncementsService;
