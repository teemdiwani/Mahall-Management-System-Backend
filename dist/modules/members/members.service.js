"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembersService = void 0;
const member_model_js_1 = require("./member.model.js");
const family_model_js_1 = require("../families/family.model.js");
const familyMember_model_js_1 = require("../families/familyMember.model.js");
const apiError_js_1 = require("../../utils/apiError.js");
class MembersService {
    static async listMembers(query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
        const skip = (page - 1) * limit;
        const filter = {};
        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { phone: { $regex: query.search, $options: 'i' } },
                { email: { $regex: query.search, $options: 'i' } },
            ];
        }
        if (query.familyId)
            filter.familyId = query.familyId;
        if (query.membershipStatus)
            filter.membershipStatus = query.membershipStatus;
        if (query.gender)
            filter.gender = query.gender;
        const [items, total] = await Promise.all([
            member_model_js_1.Member.find(filter)
                .populate('familyId', 'familyCode name address area')
                .populate('userId', 'email role isActive')
                .sort({ name: 1 })
                .skip(skip)
                .limit(limit),
            member_model_js_1.Member.countDocuments(filter),
        ]);
        return { items, page, limit, total };
    }
    static async searchMembers(q) {
        if (!q || !q.trim())
            return [];
        const query = q.trim();
        const regex = new RegExp(query, 'i');
        const filter = {
            $or: [
                { memberCode: regex },
                { name: regex },
                { phone: regex },
                { email: regex },
            ],
            membershipStatus: { $ne: 'DECEASED' },
        };
        const members = await member_model_js_1.Member.find(filter)
            .populate('familyId', 'familyCode name area')
            .limit(20)
            .lean();
        return members.map((m) => ({
            _id: m._id,
            id: m._id,
            memberCode: m.memberCode || `MHL-${m._id.toString().slice(-6).toUpperCase()}`,
            name: m.name,
            phone: m.phone || '',
            email: m.email || '',
            gender: m.gender,
            occupation: m.occupation || '',
            dateOfBirth: m.dateOfBirth,
            familyId: m.familyId?._id || m.familyId || null,
            familyName: m.familyId?.name || null,
            familyCode: m.familyId?.familyCode || null,
            relationship: m.relationship || 'OTHER',
        }));
    }
    static async getMemberById(id) {
        const member = await member_model_js_1.Member.findById(id)
            .populate('familyId', 'familyCode name address area phone')
            .populate('userId', 'email role isActive lastLogin');
        if (!member) {
            throw apiError_js_1.ApiError.notFound('Member not found');
        }
        return member;
    }
    static async createMember(data) {
        if (!data.phone || !data.phone.trim()) {
            throw apiError_js_1.ApiError.badRequest('Contact phone number is required');
        }
        let family = null;
        if (data.familyId) {
            family = await family_model_js_1.Family.findById(data.familyId);
            if (!family) {
                throw apiError_js_1.ApiError.notFound('Referenced family not found');
            }
        }
        let mCode = data.memberCode;
        if (!mCode) {
            const count = await member_model_js_1.Member.countDocuments();
            mCode = `MHL-${String(count + 1).padStart(6, '0')}`;
        }
        const member = await member_model_js_1.Member.create({
            ...data,
            memberCode: mCode,
            familyId: family ? family._id : undefined,
            relationship: data.relationship || 'OTHER',
            membershipStatus: 'ACTIVE',
        });
        if (family) {
            // If marked as HEAD, update familyHead
            if (data.relationship === 'HEAD') {
                family.familyHead = member._id;
                await family.save();
            }
            // Upsert FamilyMember relational record
            await familyMember_model_js_1.FamilyMember.findOneAndUpdate({ familyId: family._id, memberId: member._id }, {
                familyId: family._id,
                memberId: member._id,
                relationship: data.relationship || 'OTHER',
                isFamilyHead: data.relationship === 'HEAD',
                status: 'ACTIVE',
                joinedAt: new Date(),
            }, { upsert: true, new: true });
        }
        return member;
    }
    static async updateMember(id, data) {
        const member = await member_model_js_1.Member.findById(id);
        if (!member) {
            throw apiError_js_1.ApiError.notFound('Member not found');
        }
        // If family is changing
        if (data.familyId && data.familyId.toString() !== member.familyId?.toString()) {
            const targetFamily = await family_model_js_1.Family.findById(data.familyId);
            if (!targetFamily) {
                throw apiError_js_1.ApiError.notFound('Target family not found');
            }
        }
        Object.assign(member, data);
        await member.save();
        // Synchronize FamilyMember relational link if member has a family
        const effectiveFamilyId = member.familyId;
        if (effectiveFamilyId) {
            const isHead = member.relationship === 'HEAD';
            await familyMember_model_js_1.FamilyMember.findOneAndUpdate({ memberId: member._id }, {
                familyId: effectiveFamilyId,
                memberId: member._id,
                relationship: member.relationship || 'OTHER',
                isFamilyHead: isHead,
                status: member.membershipStatus === 'DECEASED' ? 'INACTIVE' : 'ACTIVE',
            }, { upsert: true });
            if (isHead) {
                await family_model_js_1.Family.findByIdAndUpdate(effectiveFamilyId, { familyHead: member._id });
            }
        }
        return member;
    }
    static async transferMember(memberId, newFamilyId, newRelationship) {
        const member = await member_model_js_1.Member.findById(memberId);
        if (!member) {
            throw apiError_js_1.ApiError.notFound('Member not found');
        }
        const targetFamily = await family_model_js_1.Family.findById(newFamilyId);
        if (!targetFamily) {
            throw apiError_js_1.ApiError.notFound('Target family not found');
        }
        member.familyId = targetFamily._id;
        member.relationship = newRelationship;
        await member.save();
        return member;
    }
    static async deleteMember(id) {
        const member = await member_model_js_1.Member.findById(id);
        if (!member) {
            throw apiError_js_1.ApiError.notFound('Member not found');
        }
        // Soft delete: change status to INACTIVE
        member.membershipStatus = 'INACTIVE';
        await member.save();
        return { deleted: true, member };
    }
}
exports.MembersService = MembersService;
