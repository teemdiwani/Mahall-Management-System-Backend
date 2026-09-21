"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementsController = void 0;
const announcements_service_js_1 = require("./announcements.service.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
class AnnouncementsController {
    static async list(req, res, next) {
        try {
            const announcements = await announcements_service_js_1.AnnouncementsService.listAnnouncements(req.user?.role);
            return apiResponse_js_1.ApiResponse.success(res, announcements);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const announcement = await announcements_service_js_1.AnnouncementsService.createAnnouncement(req.body);
            return apiResponse_js_1.ApiResponse.success(res, announcement, 201, 'Announcement published');
        }
        catch (error) {
            next(error);
        }
    }
    static async archive(req, res, next) {
        try {
            const announcement = await announcements_service_js_1.AnnouncementsService.archiveAnnouncement(req.params.id);
            return apiResponse_js_1.ApiResponse.success(res, announcement, 200, 'Announcement archived');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AnnouncementsController = AnnouncementsController;
