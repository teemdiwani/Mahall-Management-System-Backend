import { Member, type IMember } from './member.model.js';
import { Family } from '../families/family.model.js';
import { FamilyMember } from '../families/familyMember.model.js';
import { ApiError } from '../../utils/apiError.js';

export class MembersService {
  static async listMembers(query: {
    page?: number;
    limit?: number;
    search?: string;
    familyId?: string;
    membershipStatus?: string;
    gender?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.familyId) filter.familyId = query.familyId;
    if (query.membershipStatus) filter.membershipStatus = query.membershipStatus;
    if (query.gender) filter.gender = query.gender;

    const [items, total] = await Promise.all([
      Member.find(filter)
        .populate('familyId', 'familyCode name address area')
        .populate('userId', 'email role isActive')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),
      Member.countDocuments(filter),
    ]);

    return { items, page, limit, total };
  }

  static async searchMembers(q: string) {
    if (!q || !q.trim()) return [];
    const query = q.trim();
    const regex = new RegExp(query, 'i');

    const filter: Record<string, any> = {
      $or: [
        { memberCode: regex },
        { name: regex },
        { phone: regex },
        { email: regex },
      ],
      membershipStatus: { $ne: 'DECEASED' },
    };

    const members = await Member.find(filter)
      .populate('familyId', 'familyCode name area')
      .limit(20)
      .lean();

    return members.map((m: any) => ({
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

  static async getMemberById(id: string) {
    const member = await Member.findById(id)
      .populate('familyId', 'familyCode name address area phone')
      .populate('userId', 'email role isActive lastLogin');

    if (!member) {
      throw ApiError.notFound('Member not found');
    }
    return member;
  }

  static async createMember(data: {
    name: string;
    dateOfBirth: Date | string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    phone: string;
    email?: string;
    familyId?: string;
    relationship?: 'HEAD' | 'SPOUSE' | 'SON' | 'DAUGHTER' | 'FATHER' | 'MOTHER' | 'BROTHER' | 'SISTER' | 'OTHER';
    occupation?: string;
    education?: string;
    memberCode?: string;
    userId?: string;
  }) {
    if (!data.phone || !data.phone.trim()) {
      throw ApiError.badRequest('Contact phone number is required');
    }

    let family: any = null;
    if (data.familyId) {
      family = await Family.findById(data.familyId);
      if (!family) {
        throw ApiError.notFound('Referenced family not found');
      }
    }

    let mCode = data.memberCode;
    if (!mCode) {
      const count = await Member.countDocuments();
      mCode = `MHL-${String(count + 1).padStart(6, '0')}`;
    }

    const member = await Member.create({
      ...data,
      memberCode: mCode,
      familyId: family ? family._id : undefined,
      relationship: data.relationship || 'OTHER',
      membershipStatus: 'ACTIVE',
    });

    if (family) {
      // If marked as HEAD, update familyHead
      if (data.relationship === 'HEAD') {
        family.familyHead = member._id as any;
        await family.save();
      }

      // Upsert FamilyMember relational record
      await FamilyMember.findOneAndUpdate(
        { familyId: family._id, memberId: member._id },
        {
          familyId: family._id,
          memberId: member._id,
          relationship: data.relationship || 'OTHER',
          isFamilyHead: data.relationship === 'HEAD',
          status: 'ACTIVE',
          joinedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    return member;
  }

  static async updateMember(id: string, data: Partial<IMember>) {
    const member = await Member.findById(id);
    if (!member) {
      throw ApiError.notFound('Member not found');
    }

    // If family is changing
    if (data.familyId && data.familyId.toString() !== member.familyId?.toString()) {
      const targetFamily = await Family.findById(data.familyId);
      if (!targetFamily) {
        throw ApiError.notFound('Target family not found');
      }
    }

    Object.assign(member, data);
    await member.save();

    // Synchronize FamilyMember relational link if member has a family
    const effectiveFamilyId = member.familyId;
    if (effectiveFamilyId) {
      const isHead = member.relationship === 'HEAD';
      await FamilyMember.findOneAndUpdate(
        { memberId: member._id },
        {
          familyId: effectiveFamilyId,
          memberId: member._id,
          relationship: member.relationship || 'OTHER',
          isFamilyHead: isHead,
          status: member.membershipStatus === 'DECEASED' ? 'INACTIVE' : 'ACTIVE',
        },
        { upsert: true }
      );

      if (isHead) {
        await Family.findByIdAndUpdate(effectiveFamilyId, { familyHead: member._id });
      }
    }

    return member;
  }

  static async transferMember(memberId: string, newFamilyId: string, newRelationship: string) {
    const member = await Member.findById(memberId);
    if (!member) {
      throw ApiError.notFound('Member not found');
    }

    const targetFamily = await Family.findById(newFamilyId);
    if (!targetFamily) {
      throw ApiError.notFound('Target family not found');
    }

    member.familyId = targetFamily._id as any;
    member.relationship = newRelationship as any;
    await member.save();

    return member;
  }

  static async deleteMember(id: string) {
    const member = await Member.findById(id);
    if (!member) {
      throw ApiError.notFound('Member not found');
    }

    // Soft delete: change status to INACTIVE
    member.membershipStatus = 'INACTIVE';
    await member.save();

    return { deleted: true, member };
  }
}
