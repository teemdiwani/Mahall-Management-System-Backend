"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilyChangeRequestController = void 0;
const familyChangeRequest_service_js_1 = require("./familyChangeRequest.service.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
const auditLogger_js_1 = require("../../middleware/auditLogger.js");
class FamilyChangeRequestController {
    static async list(req, res, next) {
        try {
            const result = await familyChangeRequest_service_js_1.FamilyChangeRequestService.listRequests(req.query, req.user);
            return apiResponse_js_1.ApiResponse.paginate(res, result.items, result.page, result.limit, result.total);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const result = await familyChangeRequest_service_js_1.FamilyChangeRequestService.getRequestById(req.params.id);
            return apiResponse_js_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const request = await familyChangeRequest_service_js_1.FamilyChangeRequestService.createRequest(req.user._id.toString(), req.user.role, req.body);
            await (0, auditLogger_js_1.logAudit)(req, 'FAMILY_REQUEST_SUBMITTED', 'FamilyChangeRequest', request._id.toString(), null, { requestCode: request.requestCode, requestType: request.requestType, familyId: request.familyId });
            return apiResponse_js_1.ApiResponse.success(res, request, 201, 'Family change request submitted');
        }
        catch (error) {
            next(error);
        }
    }
    static async approve(req, res, next) {
        try {
            const { comment } = req.body;
            const result = await familyChangeRequest_service_js_1.FamilyChangeRequestService.approveRequest(req.params.id, req.user._id.toString(), comment);
            await (0, auditLogger_js_1.logAudit)(req, 'FAMILY_REQUEST_APPROVED', 'FamilyChangeRequest', req.params.id, null, { comment });
            return apiResponse_js_1.ApiResponse.success(res, result, 200, 'Family change request approved and applied');
        }
        catch (error) {
            next(error);
        }
    }
    static async reject(req, res, next) {
        try {
            const { reason } = req.body;
            const result = await familyChangeRequest_service_js_1.FamilyChangeRequestService.rejectRequest(req.params.id, req.user._id.toString(), reason);
            await (0, auditLogger_js_1.logAudit)(req, 'FAMILY_REQUEST_REJECTED', 'FamilyChangeRequest', req.params.id, null, { reason });
            return apiResponse_js_1.ApiResponse.success(res, result, 200, 'Family change request rejected');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.FamilyChangeRequestController = FamilyChangeRequestController;
