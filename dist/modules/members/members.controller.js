"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembersController = void 0;
const members_service_js_1 = require("./members.service.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
class MembersController {
    static async list(req, res, next) {
        try {
            const result = await members_service_js_1.MembersService.listMembers(req.query);
            return apiResponse_js_1.ApiResponse.paginate(res, result.items, result.page, result.limit, result.total);
        }
        catch (error) {
            next(error);
        }
    }
    static async search(req, res, next) {
        try {
            const query = req.query.q || '';
            const results = await members_service_js_1.MembersService.searchMembers(query);
            return apiResponse_js_1.ApiResponse.success(res, results);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const member = await members_service_js_1.MembersService.getMemberById(req.params.id);
            return apiResponse_js_1.ApiResponse.success(res, member);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const member = await members_service_js_1.MembersService.createMember(req.body);
            return apiResponse_js_1.ApiResponse.success(res, member, 201, 'Member registered successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const member = await members_service_js_1.MembersService.updateMember(req.params.id, req.body);
            return apiResponse_js_1.ApiResponse.success(res, member, 200, 'Member details updated');
        }
        catch (error) {
            next(error);
        }
    }
    static async transfer(req, res, next) {
        try {
            const { newFamilyId, newRelationship } = req.body;
            const member = await members_service_js_1.MembersService.transferMember(req.params.id, newFamilyId, newRelationship);
            return apiResponse_js_1.ApiResponse.success(res, member, 200, 'Member transferred to new family');
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const result = await members_service_js_1.MembersService.deleteMember(req.params.id);
            return apiResponse_js_1.ApiResponse.success(res, result, 200, 'Member deactivated');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MembersController = MembersController;
