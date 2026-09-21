"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilyChangeRequestService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const familyChangeRequest_model_js_1 = require("./familyChangeRequest.model.js");
const family_model_js_1 = require("./family.model.js");
const member_model_js_1 = require("../members/member.model.js");
const families_service_js_1 = require("./families.service.js");
const apiError_js_1 = require("../../utils/apiError.js");
const roles_js_1 = require("../../constants/roles.js");
class FamilyChangeRequestService {
    static async generateRequestCode() {
        const count = await familyChangeRequest_model_js_1.FamilyChangeRequest.countDocuments();
        let nextNum = count + 1;
        let code = `REQ-FAM-${String(nextNum).padStart(6, '0')}`;
        while (await familyChangeRequest_model_js_1.FamilyChangeRequest.findOne({ requestCode: code })) {
            nextNum++;
            code = `REQ-FAM-${String(nextNum).padStart(6, '0')}`;
        }
        return code;
    }
    static async createRequest(userId, userRole, data) {
        const family = await family_model_js_1.Family.findById(data.familyId);
        if (!family)
            throw apiError_js_1.ApiError.notFound('Family not found');
        // If user is Family Head or Member, verify they belong to this family
        const roleUpper = (userRole || '').toUpperCase();
        const isStaff = [roles_js_1.ROLES.SUPER_ADMIN, roles_js_1.ROLES.SECRETARY].map((r) => r.toUpperCase()).includes(roleUpper);
        if (!isStaff) {
            const member = await member_model_js_1.Member.findOne({
                $or: [{ userId: new mongoose_1.default.Types.ObjectId(userId) }],
            });
            if (!member || member.familyId?.toString() !== family._id.toString()) {
                throw apiError_js_1.ApiError.forbidden('You can only submit requests for your own family');
            }
        }
        const code = await this.generateRequestCode();
        const request = await familyChangeRequest_model_js_1.FamilyChangeRequest.create({
            requestCode: code,
            familyId: family._id,
            requestedBy: new mongoose_1.default.Types.ObjectId(userId),
            requestType: data.requestType,
            targetMemberId: data.targetMemberId ? new mongoose_1.default.Types.ObjectId(data.targetMemberId) : undefined,
            relationship: data.relationship || data.proposedData?.relationship,
            relatedToMemberId: data.relatedToMemberId ? new mongoose_1.default.Types.ObjectId(data.relatedToMemberId) : undefined,
            newFamilyHeadId: data.newFamilyHeadId ? new mongoose_1.default.Types.ObjectId(data.newFamilyHeadId) : undefined,
            updateData: data.updateData || data.proposedData,
            proposedData: data.proposedData || data.updateData,
            transferToFamilyId: data.transferToFamilyId ? new mongoose_1.default.Types.ObjectId(data.transferToFamilyId) : undefined,
            reason: data.reason?.trim(),
            status: 'PENDING',
            statusHistory: [
                {
                    oldStatus: 'NONE',
                    newStatus: 'PENDING',
                    changedBy: new mongoose_1.default.Types.ObjectId(userId),
                    comment: data.reason || 'Change request submitted',
                    timestamp: new Date(),
                },
            ],
        });
        return request;
    }
    static async listRequests(query, user) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
        const skip = (page - 1) * limit;
        const filter = {};
        const roleUpper = (user?.role || '').toUpperCase();
        const isStaff = [roles_js_1.ROLES.SUPER_ADMIN, roles_js_1.ROLES.SECRETARY, roles_js_1.ROLES.TREASURER, roles_js_1.ROLES.IMAM].map((r) => r.toUpperCase()).includes(roleUpper);
        if (!isStaff && user) {
            // Find user's member and family
            const member = await member_model_js_1.Member.findOne({ userId: user._id });
            if (member && member.familyId) {
                filter.familyId = member.familyId;
            }
            else {
                filter.requestedBy = user._id;
            }
        }
        else if (query.familyId) {
            filter.familyId = query.familyId;
        }
        if (query.status && query.status !== 'ALL')
            filter.status = query.status;
        if (query.requestType && query.requestType !== 'ALL')
            filter.requestType = query.requestType;
        const [items, total] = await Promise.all([
            familyChangeRequest_model_js_1.FamilyChangeRequest.find(filter)
                .populate('familyId', 'familyCode name area')
                .populate('requestedBy', 'name email role')
                .populate('targetMemberId', 'name memberCode phone email occupation relationship')
                .populate('relatedToMemberId', 'name memberCode')
                .populate('newFamilyHeadId', 'name memberCode')
                .populate('reviewedBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            familyChangeRequest_model_js_1.FamilyChangeRequest.countDocuments(filter),
        ]);
        return { items, page, limit, total };
    }
    static async getRequestById(id) {
        const request = await familyChangeRequest_model_js_1.FamilyChangeRequest.findById(id)
            .populate('familyId', 'familyCode name address area phone email')
            .populate('requestedBy', 'name email role')
            .populate('targetMemberId', 'name memberCode phone email occupation relationship dateOfBirth gender')
            .populate('relatedToMemberId', 'name memberCode relationship')
            .populate('newFamilyHeadId', 'name memberCode phone')
            .populate('transferToFamilyId', 'familyCode name area')
            .populate('reviewedBy', 'name email')
            .populate('statusHistory.changedBy', 'name email role');
        if (!request)
            throw apiError_js_1.ApiError.notFound('Family change request not found');
        return request;
    }
    static async approveRequest(id, reviewerId, comment) {
        const request = await familyChangeRequest_model_js_1.FamilyChangeRequest.findById(id);
        if (!request)
            throw apiError_js_1.ApiError.notFound('Change request not found');
        if (request.status !== 'PENDING' && request.status !== 'UNDER_REVIEW') {
            throw apiError_js_1.ApiError.badRequest(`Cannot approve request that is already ${request.status}`);
        }
        // Execute actual database modifications based on requestType
        switch (request.requestType) {
            case 'ADD_MEMBER': {
                const pData = request.proposedData || request.updateData;
                const rel = request.relationship || pData?.relationship || 'OTHER';
                if (request.targetMemberId) {
                    await families_service_js_1.FamiliesService.addMemberToFamily(request.familyId.toString(), {
                        memberId: request.targetMemberId.toString(),
                        relationship: rel,
                        relatedToMemberId: request.relatedToMemberId?.toString(),
                    });
                }
                else if (pData && pData.name) {
                    await families_service_js_1.FamiliesService.addMemberToFamily(request.familyId.toString(), {
                        name: pData.name,
                        gender: pData.gender,
                        dateOfBirth: pData.dateOfBirth,
                        phone: pData.phone,
                        occupation: pData.occupation,
                        education: pData.education,
                        relationship: rel,
                        relatedToMemberId: request.relatedToMemberId?.toString(),
                    });
                }
                else {
                    throw apiError_js_1.ApiError.badRequest('Missing target member or proposed member details for ADD_MEMBER');
                }
                break;
            }
            case 'REMOVE_MEMBER': {
                if (!request.targetMemberId) {
                    throw apiError_js_1.ApiError.badRequest('Missing target member for REMOVE_MEMBER');
                }
                await families_service_js_1.FamiliesService.removeMemberFromFamily(request.familyId.toString(), request.targetMemberId.toString());
                break;
            }
            case 'CHANGE_RELATIONSHIP': {
                if (!request.targetMemberId || !request.relationship) {
                    throw apiError_js_1.ApiError.badRequest('Missing target member or relationship');
                }
                await families_service_js_1.FamiliesService.updateFamilyMember(request.familyId.toString(), request.targetMemberId.toString(), {
                    relationship: request.relationship,
                    relatedToMemberId: request.relatedToMemberId?.toString(),
                });
                break;
            }
            case 'CHANGE_FAMILY_HEAD': {
                if (!request.newFamilyHeadId) {
                    throw apiError_js_1.ApiError.badRequest('Missing new family head member');
                }
                await families_service_js_1.FamiliesService.updateFamilyMember(request.familyId.toString(), request.newFamilyHeadId.toString(), { isFamilyHead: true, relationship: 'HEAD' });
                break;
            }
            case 'UPDATE_FAMILY_INFORMATION': {
                if (!request.updateData) {
                    throw apiError_js_1.ApiError.badRequest('Missing update data for family information');
                }
                await families_service_js_1.FamiliesService.updateFamily(request.familyId.toString(), { ...request.updateData, updatedBy: reviewerId });
                break;
            }
            case 'TRANSFER_MEMBER': {
                if (!request.targetMemberId || !request.transferToFamilyId) {
                    throw apiError_js_1.ApiError.badRequest('Missing target member or destination family for transfer');
                }
                await families_service_js_1.FamiliesService.transferMember(request.targetMemberId.toString(), request.familyId.toString(), request.transferToFamilyId.toString(), request.relationship || 'OTHER');
                break;
            }
            default:
                throw apiError_js_1.ApiError.badRequest(`Unknown request type: ${request.requestType}`);
        }
        const oldStatus = request.status;
        request.status = 'APPROVED';
        request.reviewedBy = new mongoose_1.default.Types.ObjectId(reviewerId);
        request.reviewedAt = new Date();
        request.statusHistory.push({
            oldStatus,
            newStatus: 'APPROVED',
            changedBy: new mongoose_1.default.Types.ObjectId(reviewerId),
            comment: comment || 'Approved and changes applied to database',
            timestamp: new Date(),
        });
        await request.save();
        return this.getRequestById(request._id.toString());
    }
    static async rejectRequest(id, reviewerId, reason) {
        if (!reason || !reason.trim()) {
            throw apiError_js_1.ApiError.badRequest('Rejection reason is required');
        }
        const request = await familyChangeRequest_model_js_1.FamilyChangeRequest.findById(id);
        if (!request)
            throw apiError_js_1.ApiError.notFound('Change request not found');
        if (request.status !== 'PENDING' && request.status !== 'UNDER_REVIEW') {
            throw apiError_js_1.ApiError.badRequest(`Cannot reject request that is already ${request.status}`);
        }
        const oldStatus = request.status;
        request.status = 'REJECTED';
        request.rejectionReason = reason.trim();
        request.reviewedBy = new mongoose_1.default.Types.ObjectId(reviewerId);
        request.reviewedAt = new Date();
        request.statusHistory.push({
            oldStatus,
            newStatus: 'REJECTED',
            changedBy: new mongoose_1.default.Types.ObjectId(reviewerId),
            comment: reason.trim(),
            timestamp: new Date(),
        });
        await request.save();
        return this.getRequestById(request._id.toString());
    }
}
exports.FamilyChangeRequestService = FamilyChangeRequestService;
