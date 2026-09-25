"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommitteeController = void 0;
const committee_service_js_1 = require("./committee.service.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
class CommitteeController {
    static async listMembers(_req, res, next) {
        try {
            const members = await committee_service_js_1.CommitteeService.listMembers();
            return apiResponse_js_1.ApiResponse.success(res, members);
        }
        catch (error) {
            next(error);
        }
    }
    static async createMember(req, res, next) {
        try {
            const member = await committee_service_js_1.CommitteeService.createMember(req.body);
            return apiResponse_js_1.ApiResponse.success(res, member, 201, 'Committee member added');
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteMember(req, res, next) {
        try {
            await committee_service_js_1.CommitteeService.deleteMember(req.params.id);
            return apiResponse_js_1.ApiResponse.success(res, null, 200, 'Committee member removed');
        }
        catch (error) {
            next(error);
        }
    }
    static async listMeetings(_req, res, next) {
        try {
            const meetings = await committee_service_js_1.CommitteeService.listMeetings();
            return apiResponse_js_1.ApiResponse.success(res, meetings);
        }
        catch (error) {
            next(error);
        }
    }
    static async scheduleMeeting(req, res, next) {
        try {
            const meeting = await committee_service_js_1.CommitteeService.scheduleMeeting(req.body);
            return apiResponse_js_1.ApiResponse.success(res, meeting, 201, 'Meeting scheduled');
        }
        catch (error) {
            next(error);
        }
    }
    static async updateMinutes(req, res, next) {
        try {
            const meeting = await committee_service_js_1.CommitteeService.updateMeetingMinutes(req.params.id, req.body);
            return apiResponse_js_1.ApiResponse.success(res, meeting, 200, 'Meeting minutes and resolutions recorded');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CommitteeController = CommitteeController;
