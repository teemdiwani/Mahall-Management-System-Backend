"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamiliesController = void 0;
const families_service_js_1 = require("./families.service.js");
const member_model_js_1 = require("../members/member.model.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
const apiError_js_1 = require("../../utils/apiError.js");
const roles_js_1 = require("../../constants/roles.js");
const auditLogger_js_1 = require("../../middleware/auditLogger.js");
class FamiliesController {
    static async list(req, res, next) {
        try {
            const result = await families_service_js_1.FamiliesService.listFamilies(req.query);
            return apiResponse_js_1.ApiResponse.paginate(res, result.items, result.page, result.limit, result.total);
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyFamily(req, res, next) {
        try {
            const result = await families_service_js_1.FamiliesService.getMyFamily(req.user._id.toString());
            return apiResponse_js_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            // Authorization check: If non-admin/staff, can only view own family
            const roleUpper = (req.user.role || '').toUpperCase();
            const isAdminStaff = [
                roles_js_1.ROLES.SUPER_ADMIN,
                roles_js_1.ROLES.SECRETARY,
                roles_js_1.ROLES.TREASURER,
                roles_js_1.ROLES.IMAM,
                roles_js_1.ROLES.WELFARE_OFFICER,
                roles_js_1.ROLES.COMMITTEE_MEMBER,
            ].map((r) => r.toUpperCase()).includes(roleUpper);
            if (!isAdminStaff) {
                const member = await member_model_js_1.Member.findOne({
                    $or: [{ userId: req.user._id }, { email: req.user.email }],
                });
                if (!member || member.familyId?.toString() !== req.params.id) {
                    throw apiError_js_1.ApiError.forbidden('You are not authorized to view this family record');
                }
            }
            const result = await families_service_js_1.FamiliesService.getFamilyById(req.params.id);
            return apiResponse_js_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const family = await families_service_js_1.FamiliesService.createFamily({
                ...req.body,
                createdBy: req.user._id.toString(),
            });
            await (0, auditLogger_js_1.logAudit)(req, 'FAMILY_CREATED', 'Family', family.family?._id?.toString() || '', null, { familyCode: family.family.familyCode, name: family.family.name });
            return apiResponse_js_1.ApiResponse.success(res, family, 201, 'Family registered successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const family = await families_service_js_1.FamiliesService.updateFamily(req.params.id, {
                ...req.body,
                updatedBy: req.user._id.toString(),
            });
            await (0, auditLogger_js_1.logAudit)(req, 'FAMILY_UPDATED', 'Family', req.params.id, null, req.body);
            return apiResponse_js_1.ApiResponse.success(res, family, 200, 'Family updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async archive(req, res, next) {
        try {
            const force = req.query.force === 'true' || req.body.force === true;
            const result = await families_service_js_1.FamiliesService.archiveFamily(req.params.id, force);
            await (0, auditLogger_js_1.logAudit)(req, 'FAMILY_ARCHIVED', 'Family', req.params.id, null, { force });
            return apiResponse_js_1.ApiResponse.success(res, result, 200, 'Family archived successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async getMembers(req, res, next) {
        try {
            const result = await families_service_js_1.FamiliesService.getFamilyById(req.params.id);
            return apiResponse_js_1.ApiResponse.success(res, result.members);
        }
        catch (error) {
            next(error);
        }
    }
    static async addMember(req, res, next) {
        try {
            const result = await families_service_js_1.FamiliesService.addMemberToFamily(req.params.id, req.body);
            await (0, auditLogger_js_1.logAudit)(req, 'FAMILY_MEMBER_ADDED', 'Family', req.params.id, null, { details: req.body });
            return apiResponse_js_1.ApiResponse.success(res, result, 201, 'Member added to family');
        }
        catch (error) {
            next(error);
        }
    }
    static async updateMember(req, res, next) {
        try {
            const { memberId } = req.params;
            const result = await families_service_js_1.FamiliesService.updateFamilyMember(req.params.id, memberId, req.body);
            await (0, auditLogger_js_1.logAudit)(req, 'FAMILY_MEMBER_RELATIONSHIP_CHANGED', 'Family', req.params.id, null, { memberId, updates: req.body });
            return apiResponse_js_1.ApiResponse.success(res, result, 200, 'Family member relationship updated');
        }
        catch (error) {
            next(error);
        }
    }
    static async removeMember(req, res, next) {
        try {
            const { memberId } = req.params;
            const result = await families_service_js_1.FamiliesService.removeMemberFromFamily(req.params.id, memberId);
            await (0, auditLogger_js_1.logAudit)(req, 'FAMILY_MEMBER_REMOVED', 'Family', req.params.id, null, { memberId });
            return apiResponse_js_1.ApiResponse.success(res, result, 200, 'Member removed from family');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.FamiliesController = FamiliesController;
