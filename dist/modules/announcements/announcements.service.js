"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementsService = void 0;
const announcement_model_js_1 = require("./announcement.model.js");
const roles_js_1 = require("../../constants/roles.js");
class AnnouncementsService {
    static async listAnnouncements(userRole) {
        const filter = { status: 'ACTIVE' };
        if (userRole && userRole !== roles_js_1.ROLES.SUPER_ADMIN && userRole !== roles_js_1.ROLES.SECRETARY) {
            filter.targetAudience = { $in: ['ALL', 'MEMBERS', userRole] };
        }
        return announcement_model_js_1.Announcement.find(filter).sort({ isPinned: -1, publishedAt: -1 });
    }
    static async createAnnouncement(data) {
        return announcement_model_js_1.Announcement.create({
            ...data,
            publishedAt: new Date(),
            status: 'ACTIVE',
        });
    }
    static async archiveAnnouncement(id) {
        return announcement_model_js_1.Announcement.findByIdAndUpdate(id, { status: 'ARCHIVED' }, { new: true });
    }
}
exports.AnnouncementsService = AnnouncementsService;
