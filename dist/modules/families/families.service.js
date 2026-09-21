"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamiliesService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const family_model_js_1 = require("./family.model.js");
const member_model_js_1 = require("../members/member.model.js");
const familyMember_model_js_1 = require("./familyMember.model.js");
const apiError_js_1 = require("../../utils/apiError.js");
class FamiliesService {
    static async generateFamilyCode() {
        const count = await family_model_js_1.Family.countDocuments();
        let nextNum = count + 1;
        let code = `MHL-FAM-${String(nextNum).padStart(6, '0')}`;
        while (await family_model_js_1.Family.findOne({ familyCode: code })) {
            nextNum++;
            code = `MHL-FAM-${String(nextNum).padStart(6, '0')}`;
        }
        return code;
    }
    static async listFamilies(query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
        const skip = (page - 1) * limit;
        const filter = {};
        if (query.search) {
            filter.$or = [
                { familyCode: { $regex: query.search, $options: 'i' } },
                { name: { $regex: query.search, $options: 'i' } },
                { phone: { $regex: query.search, $options: 'i' } },
                { area: { $regex: query.search, $options: 'i' } },
            ];
        }
        if (query.area)
            filter.area = query.area;
        if (query.status) {
            filter.status = query.status;
        }
        else {
            filter.status = { $ne: 'ARCHIVED' };
        }
        const [items, total] = await Promise.all([
            family_model_js_1.Family.find(filter)
                .populate('familyHead', 'name phone email memberCode occupation')
                .sort({ familyCode: 1 })
                .skip(skip)
                .limit(limit),
            family_model_js_1.Family.countDocuments(filter),
        ]);
        const familyIds = items.map((f) => f._id);
        const counts = await member_model_js_1.Member.aggregate([
            { $match: { familyId: { $in: familyIds }, membershipStatus: { $ne: 'DECEASED' } } },
            { $group: { _id: '$familyId', count: { $sum: 1 } } },
        ]);
        const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));
        const enriched = items.map((f) => {
            const obj = f.toObject();
            return {
                ...obj,
                id: obj._id,
                memberCount: countMap.get(f._id.toString()) || 0,
            };
        });
        return { items: enriched, page, limit, total };
    }
    static async getFamilyById(id) {
        const family = await family_model_js_1.Family.findById(id).populate('familyHead', 'name phone email memberCode occupation education');
        if (!family) {
            throw apiError_js_1.ApiError.notFound('Family not found');
        }
        // Retrieve relational family members
        let familyMembers = await familyMember_model_js_1.FamilyMember.find({ familyId: family._id, status: 'ACTIVE' })
            .populate('memberId')
            .populate('relatedToMemberId', 'name memberCode relationship')
            .sort({ isFamilyHead: -1, relationship: 1, createdAt: 1 });
        // Backward compatibility: If no FamilyMember collection records exist yet for this family, sync from Member collection
        if (familyMembers.length === 0) {
            const existingMembers = await member_model_js_1.Member.find({ familyId: family._id }).sort({ relationship: 1, dateOfBirth: 1 });
            if (existingMembers.length > 0) {
                for (const m of existingMembers) {
                    const isHead = m.relationship === 'HEAD' || (family.familyHead && family.familyHead._id?.toString() === m._id.toString());
                    await familyMember_model_js_1.FamilyMember.findOneAndUpdate({ familyId: family._id, memberId: m._id }, {
                        familyId: family._id,
                        memberId: m._id,
                        relationship: m.relationship || (isHead ? 'HEAD' : 'OTHER'),
                        isFamilyHead: Boolean(isHead),
                        status: 'ACTIVE',
                        joinedAt: m.createdAt || new Date(),
                    }, { upsert: true, new: true });
                }
                familyMembers = await familyMember_model_js_1.FamilyMember.find({ familyId: family._id, status: 'ACTIVE' })
                    .populate('memberId')
                    .populate('relatedToMemberId', 'name memberCode relationship')
                    .sort({ isFamilyHead: -1, relationship: 1, createdAt: 1 });
            }
        }
        const members = familyMembers
            .filter((fm) => fm.memberId != null)
            .map((fm) => {
            const m = fm.memberId;
            return {
                _id: m._id,
                id: m._id,
                relationshipId: fm._id,
                member: m,
                name: m.name,
                memberCode: m.memberCode || `MHL-${m._id.toString().slice(-6).toUpperCase()}`,
                phone: m.phone || '',
                email: m.email || '',
                gender: m.gender,
                dateOfBirth: m.dateOfBirth,
                occupation: m.occupation || '',
                education: m.education || '',
                relationship: fm.relationship,
                relatedToMember: fm.relatedToMemberId || null,
                isFamilyHead: fm.isFamilyHead || (family.familyHead && family.familyHead._id?.toString() === m._id.toString()),
                membershipStatus: m.membershipStatus || 'ACTIVE',
                status: fm.status,
                joinedAt: fm.joinedAt,
            };
        });
        return {
            family,
            familyHead: family.familyHead || members.find((m) => m.isFamilyHead)?.member || null,
            members,
            memberCount: members.length,
        };
    }
    static async getMyFamily(userIdOrMemberId) {
        const member = await member_model_js_1.Member.findOne({
            $or: [
                { _id: mongoose_1.default.isValidObjectId(userIdOrMemberId) ? userIdOrMemberId : undefined },
                { userId: mongoose_1.default.isValidObjectId(userIdOrMemberId) ? userIdOrMemberId : undefined },
            ].filter(Boolean),
        });
        if (!member || !member.familyId) {
            throw apiError_js_1.ApiError.notFound('No family linked to this user/member');
        }
        const details = await this.getFamilyById(member.familyId.toString());
        const headMemberId = details.family.familyHead?._id?.toString() || details.family.familyHead?.toString();
        const isFamilyHead = headMemberId === member._id.toString() || details.members.some(m => m.isFamilyHead && m._id.toString() === member._id.toString());
        const myRel = details.members.find(m => m._id.toString() === member._id.toString())?.relationship || 'MEMBER';
        return {
            ...details,
            isFamilyHead,
            myRelationship: myRel,
            currentMember: member,
        };
    }
    static async createFamily(data) {
        let code = data.familyCode?.trim();
        if (!code) {
            code = await this.generateFamilyCode();
        }
        else {
            code = code.toUpperCase();
            const existing = await family_model_js_1.Family.findOne({ familyCode: code });
            if (existing) {
                throw apiError_js_1.ApiError.conflict(`Family code ${code} is already in use`);
            }
        }
        let headMember = null;
        // Option A: Link an existing Member as Family Head
        const headId = data.familyHeadMemberId || data.headMemberId;
        if (headId) {
            headMember = await member_model_js_1.Member.findById(headId);
            if (!headMember) {
                throw apiError_js_1.ApiError.notFound('Selected head member was not found');
            }
            if (headMember.familyId) {
                const currentFamily = await family_model_js_1.Family.findById(headMember.familyId);
                if (currentFamily && currentFamily.status === 'ACTIVE') {
                    throw apiError_js_1.ApiError.badRequest(`Member ${headMember.name} already belongs to active family "${currentFamily.name}" (${currentFamily.familyCode})`);
                }
            }
        }
        else if (data.headName && data.headName.trim()) {
            // Option B: Create a new Member record for the head
            const memberCount = await member_model_js_1.Member.countDocuments();
            const mCode = `MHL-${String(memberCount + 1).padStart(6, '0')}`;
            headMember = await member_model_js_1.Member.create({
                memberCode: mCode,
                name: data.headName.trim(),
                gender: data.headGender || 'MALE',
                phone: data.headPhone || data.phone,
                email: data.email,
                dateOfBirth: data.headDob ? new Date(data.headDob) : new Date('1980-01-01'),
                occupation: data.headOccupation || 'Family Head',
                relationship: 'HEAD',
                membershipStatus: 'ACTIVE',
            });
        }
        const family = await family_model_js_1.Family.create({
            familyCode: code,
            name: data.name.trim(),
            address: data.address.trim(),
            area: data.area.trim(),
            phone: data.phone.trim(),
            email: data.email?.trim(),
            familyHead: headMember ? headMember._id : undefined,
            status: 'ACTIVE',
            createdBy: data.createdBy ? new mongoose_1.default.Types.ObjectId(data.createdBy) : undefined,
        });
        // Update head member and create FamilyMember relationship
        if (headMember) {
            headMember.familyId = family._id;
            headMember.relationship = 'HEAD';
            await headMember.save();
            await familyMember_model_js_1.FamilyMember.create({
                familyId: family._id,
                memberId: headMember._id,
                relationship: 'HEAD',
                isFamilyHead: true,
                status: 'ACTIVE',
                joinedAt: new Date(),
            });
        }
        return this.getFamilyById(family._id.toString());
    }
    static async updateFamily(id, data) {
        const family = await family_model_js_1.Family.findById(id);
        if (!family) {
            throw apiError_js_1.ApiError.notFound('Family not found');
        }
        if (data.name)
            family.name = data.name.trim();
        if (data.address)
            family.address = data.address.trim();
        if (data.area)
            family.area = data.area.trim();
        if (data.phone)
            family.phone = data.phone.trim();
        if (data.email !== undefined)
            family.email = data.email?.trim();
        if (data.status)
            family.status = data.status;
        if (data.updatedBy)
            family.updatedBy = new mongoose_1.default.Types.ObjectId(data.updatedBy);
        await family.save();
        return this.getFamilyById(family._id.toString());
    }
    static async archiveFamily(familyId, force = false) {
        const family = await family_model_js_1.Family.findById(familyId);
        if (!family) {
            throw apiError_js_1.ApiError.notFound('Family not found');
        }
        const activeMemberCount = await familyMember_model_js_1.FamilyMember.countDocuments({
            familyId: family._id,
            status: 'ACTIVE',
        });
        if (activeMemberCount > 0 && !force) {
            throw apiError_js_1.ApiError.badRequest(`Family has ${activeMemberCount} active members. Please reassign or confirm archiving.`);
        }
        family.status = 'ARCHIVED';
        await family.save();
        return { message: 'Family successfully archived', family };
    }
    static async addMemberToFamily(familyId, data) {
        const family = await family_model_js_1.Family.findById(familyId);
        if (!family) {
            throw apiError_js_1.ApiError.notFound('Family not found');
        }
        let member;
        if (data.memberId) {
            member = await member_model_js_1.Member.findById(data.memberId);
            if (!member) {
                throw apiError_js_1.ApiError.notFound('Member not found');
            }
        }
        else if (data.name) {
            const memberCount = await member_model_js_1.Member.countDocuments();
            const mCode = `MHL-${String(memberCount + 1).padStart(6, '0')}`;
            member = await member_model_js_1.Member.create({
                memberCode: mCode,
                name: data.name.trim(),
                gender: data.gender || 'MALE',
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : new Date('2000-01-01'),
                phone: data.phone?.trim() || undefined,
                occupation: data.occupation?.trim() || undefined,
                education: data.education?.trim() || undefined,
                relationship: data.relationship || 'OTHER',
                membershipStatus: 'ACTIVE',
            });
        }
        else {
            throw apiError_js_1.ApiError.badRequest('Either memberId or member name must be provided');
        }
        // Check if member is already an active member of THIS family
        const existing = await familyMember_model_js_1.FamilyMember.findOne({
            familyId: family._id,
            memberId: member._id,
            status: 'ACTIVE',
        });
        if (existing) {
            throw apiError_js_1.ApiError.badRequest(`Member ${member.name} is already registered in this family`);
        }
        // If member was in another active family, verify or unlink
        if (member.familyId && member.familyId.toString() !== family._id.toString()) {
            const otherFamily = await family_model_js_1.Family.findById(member.familyId);
            if (otherFamily && otherFamily.status === 'ACTIVE') {
                throw apiError_js_1.ApiError.badRequest(`Member ${member.name} already belongs to "${otherFamily.name}" (${otherFamily.familyCode}). Use Transfer Member instead.`);
            }
        }
        // Check if adding as HEAD when family already has a head
        const isHead = data.relationship === 'HEAD';
        if (isHead && family.familyHead && family.familyHead.toString() !== member._id.toString()) {
            // Downgrade previous head in FamilyMember
            await familyMember_model_js_1.FamilyMember.updateMany({ familyId: family._id, isFamilyHead: true }, { isFamilyHead: false, relationship: 'OTHER' });
            family.familyHead = member._id;
            await family.save();
        }
        member.familyId = family._id;
        member.relationship = data.relationship;
        await member.save();
        await familyMember_model_js_1.FamilyMember.create({
            familyId: family._id,
            memberId: member._id,
            relationship: data.relationship,
            relatedToMemberId: data.relatedToMemberId ? new mongoose_1.default.Types.ObjectId(data.relatedToMemberId) : undefined,
            isFamilyHead: isHead,
            status: 'ACTIVE',
            joinedAt: new Date(),
        });
        return this.getFamilyById(family._id.toString());
    }
    static async updateFamilyMember(familyId, memberId, data) {
        const family = await family_model_js_1.Family.findById(familyId);
        if (!family)
            throw apiError_js_1.ApiError.notFound('Family not found');
        const fm = await familyMember_model_js_1.FamilyMember.findOne({
            familyId: family._id,
            memberId: new mongoose_1.default.Types.ObjectId(memberId),
            status: 'ACTIVE',
        });
        if (!fm)
            throw apiError_js_1.ApiError.notFound('Family member relationship not found');
        if (data.relationship)
            fm.relationship = data.relationship;
        if (data.relatedToMemberId !== undefined) {
            fm.relatedToMemberId = data.relatedToMemberId ? new mongoose_1.default.Types.ObjectId(data.relatedToMemberId) : undefined;
        }
        if (data.isFamilyHead || data.relationship === 'HEAD') {
            await familyMember_model_js_1.FamilyMember.updateMany({ familyId: family._id, isFamilyHead: true }, { isFamilyHead: false, relationship: 'OTHER' });
            fm.isFamilyHead = true;
            fm.relationship = 'HEAD';
            family.familyHead = fm.memberId;
            await family.save();
        }
        await fm.save();
        await member_model_js_1.Member.findByIdAndUpdate(memberId, { relationship: fm.relationship });
        return this.getFamilyById(family._id.toString());
    }
    static async removeMemberFromFamily(familyId, memberId) {
        const family = await family_model_js_1.Family.findById(familyId);
        if (!family)
            throw apiError_js_1.ApiError.notFound('Family not found');
        const fm = await familyMember_model_js_1.FamilyMember.findOne({
            familyId: family._id,
            memberId: new mongoose_1.default.Types.ObjectId(memberId),
            status: 'ACTIVE',
        });
        if (!fm)
            throw apiError_js_1.ApiError.notFound('Member is not active in this family');
        if (fm.isFamilyHead) {
            const otherMembers = await familyMember_model_js_1.FamilyMember.find({
                familyId: family._id,
                memberId: { $ne: fm.memberId },
                status: 'ACTIVE',
            });
            if (otherMembers.length > 0) {
                throw apiError_js_1.ApiError.badRequest('Cannot remove the Family Head without assigning a new Head first');
            }
            family.familyHead = undefined;
            await family.save();
        }
        // Soft deactivate relationship & unset familyId from Member
        fm.status = 'INACTIVE';
        fm.leftAt = new Date();
        await fm.save();
        await member_model_js_1.Member.findByIdAndUpdate(memberId, { $unset: { familyId: 1 }, relationship: 'OTHER' });
        return this.getFamilyById(family._id.toString());
    }
    static async transferMember(memberId, fromFamilyId, toFamilyId, newRelationship = 'OTHER') {
        const [fromFamily, toFamily, member] = await Promise.all([
            family_model_js_1.Family.findById(fromFamilyId),
            family_model_js_1.Family.findById(toFamilyId),
            member_model_js_1.Member.findById(memberId),
        ]);
        if (!fromFamily)
            throw apiError_js_1.ApiError.notFound('Source family not found');
        if (!toFamily)
            throw apiError_js_1.ApiError.notFound('Destination family not found');
        if (!member)
            throw apiError_js_1.ApiError.notFound('Member not found');
        // Deactivate in old family
        await familyMember_model_js_1.FamilyMember.updateMany({ familyId: fromFamily._id, memberId: member._id, status: 'ACTIVE' }, { status: 'INACTIVE', leftAt: new Date() });
        if (fromFamily.familyHead?.toString() === member._id.toString()) {
            fromFamily.familyHead = undefined;
            await fromFamily.save();
        }
        // Activate in new family
        member.familyId = toFamily._id;
        member.relationship = newRelationship;
        await member.save();
        await familyMember_model_js_1.FamilyMember.create({
            familyId: toFamily._id,
            memberId: member._id,
            relationship: newRelationship,
            isFamilyHead: newRelationship === 'HEAD',
            status: 'ACTIVE',
            joinedAt: new Date(),
        });
        if (newRelationship === 'HEAD') {
            toFamily.familyHead = member._id;
            await toFamily.save();
        }
        return { message: 'Member transferred successfully', member, toFamily };
    }
}
exports.FamiliesService = FamiliesService;
