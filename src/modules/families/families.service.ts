import mongoose from 'mongoose';
import { Family, type IFamily } from './family.model.js';
import { Member, type IMember } from '../members/member.model.js';
import { FamilyMember, type FamilyRelationship } from './familyMember.model.js';
import { ApiError } from '../../utils/apiError.js';

export class FamiliesService {
  static async generateFamilyCode(): Promise<string> {
    const count = await Family.countDocuments();
    let nextNum = count + 1;
    let code = `MHL-FAM-${String(nextNum).padStart(6, '0')}`;
    while (await Family.findOne({ familyCode: code })) {
      nextNum++;
      code = `MHL-FAM-${String(nextNum).padStart(6, '0')}`;
    }
    return code;
  }

  static async listFamilies(query: {
    page?: number;
    limit?: number;
    search?: string;
    area?: string;
    status?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (query.search) {
      filter.$or = [
        { familyCode: { $regex: query.search, $options: 'i' } },
        { name: { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } },
        { area: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.area) filter.area = query.area;
    if (query.status) {
      filter.status = query.status;
    } else {
      filter.status = { $ne: 'ARCHIVED' };
    }

    const [items, total] = await Promise.all([
      Family.find(filter)
        .populate('familyHead', 'name phone email memberCode occupation')
        .sort({ familyCode: 1 })
        .skip(skip)
        .limit(limit),
      Family.countDocuments(filter),
    ]);

    const familyIds = items.map((f) => f._id);
    const counts = await Member.aggregate([
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

  static async getFamilyById(id: string) {
    const family = await Family.findById(id).populate('familyHead', 'name phone email memberCode occupation education');
    if (!family) {
      throw ApiError.notFound('Family not found');
    }

    // Retrieve relational family members
    let familyMembers = await FamilyMember.find({ familyId: family._id, status: 'ACTIVE' })
      .populate('memberId')
      .populate('relatedToMemberId', 'name memberCode relationship')
      .sort({ isFamilyHead: -1, relationship: 1, createdAt: 1 });

    // Backward compatibility: If no FamilyMember collection records exist yet for this family, sync from Member collection
    if (familyMembers.length === 0) {
      const existingMembers = await Member.find({ familyId: family._id }).sort({ relationship: 1, dateOfBirth: 1 });
      if (existingMembers.length > 0) {
        for (const m of existingMembers) {
          const isHead = m.relationship === 'HEAD' || (family.familyHead && family.familyHead._id?.toString() === m._id.toString());
          await FamilyMember.findOneAndUpdate(
            { familyId: family._id, memberId: m._id },
            {
              familyId: family._id,
              memberId: m._id,
              relationship: (m.relationship as FamilyRelationship) || (isHead ? 'HEAD' : 'OTHER'),
              isFamilyHead: Boolean(isHead),
              status: 'ACTIVE',
              joinedAt: m.createdAt || new Date(),
            },
            { upsert: true, new: true }
          );
        }

        familyMembers = await FamilyMember.find({ familyId: family._id, status: 'ACTIVE' })
          .populate('memberId')
          .populate('relatedToMemberId', 'name memberCode relationship')
          .sort({ isFamilyHead: -1, relationship: 1, createdAt: 1 });
      }
    }

    const members = familyMembers
      .filter((fm) => fm.memberId != null)
      .map((fm: any) => {
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

  static async getMyFamily(userIdOrMemberId: string) {
    const member = await Member.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(userIdOrMemberId) ? userIdOrMemberId : undefined },
        { userId: mongoose.isValidObjectId(userIdOrMemberId) ? userIdOrMemberId : undefined },
      ].filter(Boolean),
    });

    if (!member || !member.familyId) {
      throw ApiError.notFound('No family linked to this user/member');
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

  static async createFamily(data: {
    familyCode?: string;
    name: string;
    address: string;
    area: string;
    phone: string;
    email?: string;
    familyHeadMemberId?: string;
    headName?: string;
    headPhone?: string;
    headDob?: string;
    headOccupation?: string;
    headGender?: string;
    createdBy?: string;
  }) {
    let code = data.familyCode?.trim();
    if (!code) {
      code = await this.generateFamilyCode();
    } else {
      code = code.toUpperCase();
      const existing = await Family.findOne({ familyCode: code });
      if (existing) {
        throw ApiError.conflict(`Family code ${code} is already in use`);
      }
    }

    let headMember: any = null;

    // Option A: Link an existing Member as Family Head
    const headId = data.familyHeadMemberId || (data as any).headMemberId;
    if (headId) {
      headMember = await Member.findById(headId);
      if (!headMember) {
        throw ApiError.notFound('Selected head member was not found');
      }
      if (headMember.familyId) {
        const currentFamily = await Family.findById(headMember.familyId);
        if (currentFamily && currentFamily.status === 'ACTIVE') {
          throw ApiError.badRequest(
            `Member ${headMember.name} already belongs to active family "${currentFamily.name}" (${currentFamily.familyCode})`
          );
        }
      }
    } else if (data.headName && data.headName.trim()) {
      // Option B: Create a new Member record for the head
      const memberCount = await Member.countDocuments();
      const mCode = `MHL-${String(memberCount + 1).padStart(6, '0')}`;

      headMember = await Member.create({
        memberCode: mCode,
        name: data.headName.trim(),
        gender: (data.headGender as any) || 'MALE',
        phone: data.headPhone || data.phone,
        email: data.email,
        dateOfBirth: data.headDob ? new Date(data.headDob) : new Date('1980-01-01'),
        occupation: data.headOccupation || 'Family Head',
        relationship: 'HEAD',
        membershipStatus: 'ACTIVE',
      });
    }

    const family = await Family.create({
      familyCode: code,
      name: data.name.trim(),
      address: data.address.trim(),
      area: data.area.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim(),
      familyHead: headMember ? headMember._id : undefined,
      status: 'ACTIVE',
      createdBy: data.createdBy ? new mongoose.Types.ObjectId(data.createdBy) : undefined,
    });

    // Update head member and create FamilyMember relationship
    if (headMember) {
      headMember.familyId = family._id;
      headMember.relationship = 'HEAD';
      await headMember.save();

      await FamilyMember.create({
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

  static async updateFamily(
    id: string,
    data: Partial<{
      name: string;
      address: string;
      area: string;
      phone: string;
      email: string;
      status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
      updatedBy: string;
    }>
  ) {
    const family = await Family.findById(id);
    if (!family) {
      throw ApiError.notFound('Family not found');
    }

    if (data.name) family.name = data.name.trim();
    if (data.address) family.address = data.address.trim();
    if (data.area) family.area = data.area.trim();
    if (data.phone) family.phone = data.phone.trim();
    if (data.email !== undefined) family.email = data.email?.trim();
    if (data.status) family.status = data.status;
    if (data.updatedBy) family.updatedBy = new mongoose.Types.ObjectId(data.updatedBy);

    await family.save();
    return this.getFamilyById(family._id.toString());
  }

  static async archiveFamily(familyId: string, force: boolean = false) {
    const family = await Family.findById(familyId);
    if (!family) {
      throw ApiError.notFound('Family not found');
    }

    const activeMemberCount = await FamilyMember.countDocuments({
      familyId: family._id,
      status: 'ACTIVE',
    });

    if (activeMemberCount > 0 && !force) {
      throw ApiError.badRequest(
        `Family has ${activeMemberCount} active members. Please reassign or confirm archiving.`
      );
    }

    family.status = 'ARCHIVED';
    await family.save();

    return { message: 'Family successfully archived', family };
  }

  static async addMemberToFamily(
    familyId: string,
    data: {
      memberId?: string;
      name?: string;
      gender?: string;
      dateOfBirth?: string | Date;
      phone?: string;
      occupation?: string;
      education?: string;
      relationship: FamilyRelationship;
      relatedToMemberId?: string;
    }
  ) {
    const family = await Family.findById(familyId);
    if (!family) {
      throw ApiError.notFound('Family not found');
    }

    let member: any;
    if (data.memberId) {
      member = await Member.findById(data.memberId);
      if (!member) {
        throw ApiError.notFound('Member not found');
      }
    } else if (data.name) {
      const memberCount = await Member.countDocuments();
      const mCode = `MHL-${String(memberCount + 1).padStart(6, '0')}`;
      member = await Member.create({
        memberCode: mCode,
        name: data.name.trim(),
        gender: (data.gender as any) || 'MALE',
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : new Date('2000-01-01'),
        phone: data.phone?.trim() || undefined,
        occupation: data.occupation?.trim() || undefined,
        education: data.education?.trim() || undefined,
        relationship: data.relationship || 'OTHER',
        membershipStatus: 'ACTIVE',
      });
    } else {
      throw ApiError.badRequest('Either memberId or member name must be provided');
    }

    // Check if member is already an active member of THIS family
    const existing = await FamilyMember.findOne({
      familyId: family._id,
      memberId: member._id,
      status: 'ACTIVE',
    });
    if (existing) {
      throw ApiError.badRequest(`Member ${member.name} is already registered in this family`);
    }

    // If member was in another active family, verify or unlink
    if (member.familyId && member.familyId.toString() !== family._id.toString()) {
      const otherFamily = await Family.findById(member.familyId);
      if (otherFamily && otherFamily.status === 'ACTIVE') {
        throw ApiError.badRequest(
          `Member ${member.name} already belongs to "${otherFamily.name}" (${otherFamily.familyCode}). Use Transfer Member instead.`
        );
      }
    }

    // Check if adding as HEAD when family already has a head
    const isHead = data.relationship === 'HEAD';
    if (isHead && family.familyHead && family.familyHead.toString() !== member._id.toString()) {
      // Downgrade previous head in FamilyMember
      await FamilyMember.updateMany(
        { familyId: family._id, isFamilyHead: true },
        { isFamilyHead: false, relationship: 'OTHER' }
      );
      family.familyHead = member._id as any;
      await family.save();
    }

    member.familyId = family._id;
    member.relationship = data.relationship;
    await member.save();

    await FamilyMember.create({
      familyId: family._id,
      memberId: member._id,
      relationship: data.relationship,
      relatedToMemberId: data.relatedToMemberId ? new mongoose.Types.ObjectId(data.relatedToMemberId) : undefined,
      isFamilyHead: isHead,
      status: 'ACTIVE',
      joinedAt: new Date(),
    });

    return this.getFamilyById(family._id.toString());
  }

  static async updateFamilyMember(
    familyId: string,
    memberId: string,
    data: {
      relationship?: FamilyRelationship;
      relatedToMemberId?: string;
      isFamilyHead?: boolean;
    }
  ) {
    const family = await Family.findById(familyId);
    if (!family) throw ApiError.notFound('Family not found');

    const fm = await FamilyMember.findOne({
      familyId: family._id,
      memberId: new mongoose.Types.ObjectId(memberId),
      status: 'ACTIVE',
    });
    if (!fm) throw ApiError.notFound('Family member relationship not found');

    if (data.relationship) fm.relationship = data.relationship;
    if (data.relatedToMemberId !== undefined) {
      fm.relatedToMemberId = data.relatedToMemberId ? new mongoose.Types.ObjectId(data.relatedToMemberId) : undefined;
    }

    if (data.isFamilyHead || data.relationship === 'HEAD') {
      await FamilyMember.updateMany(
        { familyId: family._id, isFamilyHead: true },
        { isFamilyHead: false, relationship: 'OTHER' }
      );
      fm.isFamilyHead = true;
      fm.relationship = 'HEAD';
      family.familyHead = fm.memberId as any;
      await family.save();
    }

    await fm.save();
    await Member.findByIdAndUpdate(memberId, { relationship: fm.relationship });

    return this.getFamilyById(family._id.toString());
  }

  static async removeMemberFromFamily(familyId: string, memberId: string) {
    const family = await Family.findById(familyId);
    if (!family) throw ApiError.notFound('Family not found');

    const fm = await FamilyMember.findOne({
      familyId: family._id,
      memberId: new mongoose.Types.ObjectId(memberId),
      status: 'ACTIVE',
    });
    if (!fm) throw ApiError.notFound('Member is not active in this family');

    if (fm.isFamilyHead) {
      const otherMembers = await FamilyMember.find({
        familyId: family._id,
        memberId: { $ne: fm.memberId },
        status: 'ACTIVE',
      });
      if (otherMembers.length > 0) {
        throw ApiError.badRequest('Cannot remove the Family Head without assigning a new Head first');
      }
      family.familyHead = undefined;
      await family.save();
    }

    // Soft deactivate relationship & unset familyId from Member
    fm.status = 'INACTIVE';
    fm.leftAt = new Date();
    await fm.save();

    await Member.findByIdAndUpdate(memberId, { $unset: { familyId: 1 }, relationship: 'OTHER' });

    return this.getFamilyById(family._id.toString());
  }

  static async transferMember(
    memberId: string,
    fromFamilyId: string,
    toFamilyId: string,
    newRelationship: FamilyRelationship = 'OTHER'
  ) {
    const [fromFamily, toFamily, member] = await Promise.all([
      Family.findById(fromFamilyId),
      Family.findById(toFamilyId),
      Member.findById(memberId),
    ]);

    if (!fromFamily) throw ApiError.notFound('Source family not found');
    if (!toFamily) throw ApiError.notFound('Destination family not found');
    if (!member) throw ApiError.notFound('Member not found');

    // Deactivate in old family
    await FamilyMember.updateMany(
      { familyId: fromFamily._id, memberId: member._id, status: 'ACTIVE' },
      { status: 'INACTIVE', leftAt: new Date() }
    );

    if (fromFamily.familyHead?.toString() === member._id.toString()) {
      fromFamily.familyHead = undefined;
      await fromFamily.save();
    }

    // Activate in new family
    member.familyId = toFamily._id;
    member.relationship = newRelationship;
    await member.save();

    await FamilyMember.create({
      familyId: toFamily._id,
      memberId: member._id,
      relationship: newRelationship,
      isFamilyHead: newRelationship === 'HEAD',
      status: 'ACTIVE',
      joinedAt: new Date(),
    });

    if (newRelationship === 'HEAD') {
      toFamily.familyHead = member._id as any;
      await toFamily.save();
    }

    return { message: 'Member transferred successfully', member, toFamily };
  }
}
