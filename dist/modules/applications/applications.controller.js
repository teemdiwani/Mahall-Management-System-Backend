"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsController = void 0;
const applications_service_js_1 = require("./applications.service.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
const auditLogger_js_1 = require("../../middleware/auditLogger.js");
class ApplicationsController {
    static async submit(req, res, next) {
        try {
            const application = await applications_service_js_1.ApplicationsService.submitApplication(req.user._id.toString(), req.body);
            await (0, auditLogger_js_1.logAudit)(req, 'APPLICATION_SUBMITTED', 'Application', application._id.toString(), null, { type: application.type, applicationNumber: application.applicationNumber });
            return apiResponse_js_1.ApiResponse.success(res, application, 201, 'Application submitted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async list(req, res, next) {
        try {
            const result = await applications_service_js_1.ApplicationsService.listApplications(req.user.role, req.user._id.toString(), req.query);
            return apiResponse_js_1.ApiResponse.paginate(res, result.items, result.page, result.limit, result.total);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const data = await applications_service_js_1.ApplicationsService.getApplicationById(req.params.id, req.user.role, req.user._id.toString());
            return apiResponse_js_1.ApiResponse.success(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateStatus(req, res, next) {
        try {
            const { status, comment, decision } = req.body;
            const application = await applications_service_js_1.ApplicationsService.updateStatus(req.params.id, status, req.user._id.toString(), comment, decision);
            await (0, auditLogger_js_1.logAudit)(req, 'APPLICATION_STATUS_UPDATED', 'Application', application._id.toString(), null, { newStatus: status, comment });
            return apiResponse_js_1.ApiResponse.success(res, application, 200, `Application moved to ${status}`);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ApplicationsController = ApplicationsController;
