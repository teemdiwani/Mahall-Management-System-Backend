import mongoose from 'mongoose';
import { FamilyChangeRequest, type IFamilyChangeRequest, type FamilyRequestType } from './familyChangeRequest.model.js';
import { Family } from './family.model.js';
import { Member } from '../members/member.model.js';
import { FamiliesService } from './families.service.js';
import { ApiError } from '../../utils/apiError.js';
import { ROLES } from '../../constants/roles.js';

export class FamilyChangeRequestService {
  static async generateRequestCode(): Promise<string> {
    const count = await FamilyChangeRequest.countDocuments();
    let nextNum = count + 1;
    let code = `REQ-FAM-${String(nextNum).padStart(6, '0')}`;
    while (await FamilyChangeRequest.findOne({ requestCode: code })) {
      nextNum++;
      code = `REQ-FAM-${String(nextNum).padStart(6, '0')}`;
    }
    return code;
  }

  static async createRequest(
    userId: string,
    userRole: string,
    data: {
      familyId: string;
      requestType: FamilyRequestType;
      targetMemberId?: string;
      relationship?: string;
      relatedToMemberId?: string;
      newFamilyHeadId?: string;
      updateData?: Record<string, any>;
      proposedData?: Record<string, any>;
      transferToFamilyId?: string;
      reason?: string;
    }
  ) {
    const family = await Family.findById(data.familyId);
    if (!family) throw ApiError.notFound('Family not found');

    // If user is Family Head or Member, verify they belong to this family
    const roleUpper = (userRole || '').toUpperCase();
    const isStaff = [ROLES.SUPER_ADMIN, ROLES.SECRETARY].map((r) => r.toUpperCase()).includes(roleUpper);

    if (!isStaff) {
      const member = await Member.findOne({
        $or: [{ userId: new mongoose.Types.ObjectId(userId) }],
      });
      if (!member || member.familyId?.toString() !== family._id.toString()) {
        throw ApiError.forbidden('You can only submit requests for your own family');
      }
    }

    const code = await this.generateRequestCode();

    const request = await FamilyChangeRequest.create({
      requestCode: code,
      familyId: family._id,
      requestedBy: new mongoose.Types.ObjectId(userId),
      requestType: data.requestType,
      targetMemberId: data.targetMemberId ? new mongoose.Types.ObjectId(data.targetMemberId) : undefined,
      relationship: data.relationship || (data.proposedData as any)?.relationship,
      relatedToMemberId: data.relatedToMemberId ? new mongoose.Types.ObjectId(data.relatedToMemberId) : undefined,
      newFamilyHeadId: data.newFamilyHeadId ? new mongoose.Types.ObjectId(data.newFamilyHeadId) : undefined,
      updateData: data.updateData || data.proposedData,
      proposedData: data.proposedData || data.updateData,
      transferToFamilyId: data.transferToFamilyId ? new mongoose.Types.ObjectId(data.transferToFamilyId) : undefined,
      reason: data.reason?.trim(),
      status: 'PENDING',
      statusHistory: [
        {
          oldStatus: 'NONE',
          newStatus: 'PENDING',
          changedBy: new mongoose.Types.ObjectId(userId),
          comment: data.reason || 'Change request submitted',
          timestamp: new Date(),
        },
      ],
    });

    return request;
  }

  static async listRequests(query: {
    familyId?: string;
    status?: string;
    requestType?: string;
    page?: number;
    limit?: number;
  }, user?: any) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    const roleUpper = (user?.role || '').toUpperCase();
    const isStaff = [ROLES.SUPER_ADMIN, ROLES.SECRETARY, ROLES.TREASURER, ROLES.IMAM].map((r) => r.toUpperCase()).includes(roleUpper);

    if (!isStaff && user) {
      // Find user's member and family
      const member = await Member.findOne({ userId: user._id });
      if (member && member.familyId) {
        filter.familyId = member.familyId;
      } else {
        filter.requestedBy = user._id;
      }
    } else if (query.familyId) {
      filter.familyId = query.familyId;
    }

    if (query.status && query.status !== 'ALL') filter.status = query.status;
    if (query.requestType && query.requestType !== 'ALL') filter.requestType = query.requestType;

    const [items, total] = await Promise.all([
      FamilyChangeRequest.find(filter)
        .populate('familyId', 'familyCode name area')
        .populate('requestedBy', 'name email role')
        .populate('targetMemberId', 'name memberCode phone email occupation relationship')
        .populate('relatedToMemberId', 'name memberCode')
        .populate('newFamilyHeadId', 'name memberCode')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      FamilyChangeRequest.countDocuments(filter),
    ]);

    return { items, page, limit, total };
  }

  static async getRequestById(id: string) {
    const request = await FamilyChangeRequest.findById(id)
      .populate('familyId', 'familyCode name address area phone email')
      .populate('requestedBy', 'name email role')
      .populate('targetMemberId', 'name memberCode phone email occupation relationship dateOfBirth gender')
      .populate('relatedToMemberId', 'name memberCode relationship')
      .populate('newFamilyHeadId', 'name memberCode phone')
      .populate('transferToFamilyId', 'familyCode name area')
      .populate('reviewedBy', 'name email')
      .populate('statusHistory.changedBy', 'name email role');

    if (!request) throw ApiError.notFound('Family change request not found');
    return request;
  }

  static async approveRequest(id: string, reviewerId: string, comment?: string) {
    const request = await FamilyChangeRequest.findById(id);
    if (!request) throw ApiError.notFound('Change request not found');

    if (request.status !== 'PENDING' && request.status !== 'UNDER_REVIEW') {
      throw ApiError.badRequest(`Cannot approve request that is already ${request.status}`);
    }

    // Execute actual database modifications based on requestType
    switch (request.requestType) {
      case 'ADD_MEMBER': {
        const pData = request.proposedData || request.updateData;
        const rel = request.relationship || pData?.relationship || 'OTHER';
        if (request.targetMemberId) {
          await FamiliesService.addMemberToFamily(request.familyId.toString(), {
            memberId: request.targetMemberId.toString(),
            relationship: rel as any,
            relatedToMemberId: request.relatedToMemberId?.toString(),
          });
        } else if (pData && pData.name) {
          await FamiliesService.addMemberToFamily(request.familyId.toString(), {
            name: pData.name,
            gender: pData.gender,
            dateOfBirth: pData.dateOfBirth,
            phone: pData.phone,
            occupation: pData.occupation,
            education: pData.education,
            relationship: rel as any,
            relatedToMemberId: request.relatedToMemberId?.toString(),
          });
        } else {
          throw ApiError.badRequest('Missing target member or proposed member details for ADD_MEMBER');
        }
        break;
      }

      case 'REMOVE_MEMBER': {
        if (!request.targetMemberId) {
          throw ApiError.badRequest('Missing target member for REMOVE_MEMBER');
        }
        await FamiliesService.removeMemberFromFamily(
          request.familyId.toString(),
          request.targetMemberId.toString()
        );
        break;
      }

      case 'CHANGE_RELATIONSHIP': {
        if (!request.targetMemberId || !request.relationship) {
          throw ApiError.badRequest('Missing target member or relationship');
        }
        await FamiliesService.updateFamilyMember(
          request.familyId.toString(),
          request.targetMemberId.toString(),
          {
            relationship: request.relationship as any,
            relatedToMemberId: request.relatedToMemberId?.toString(),
          }
        );
        break;
      }

      case 'CHANGE_FAMILY_HEAD': {
        if (!request.newFamilyHeadId) {
          throw ApiError.badRequest('Missing new family head member');
        }
        await FamiliesService.updateFamilyMember(
          request.familyId.toString(),
          request.newFamilyHeadId.toString(),
          { isFamilyHead: true, relationship: 'HEAD' }
        );
        break;
      }

      case 'UPDATE_FAMILY_INFORMATION': {
        if (!request.updateData) {
          throw ApiError.badRequest('Missing update data for family information');
        }
        await FamiliesService.updateFamily(
          request.familyId.toString(),
          { ...request.updateData, updatedBy: reviewerId }
        );
        break;
      }

      case 'TRANSFER_MEMBER': {
        if (!request.targetMemberId || !request.transferToFamilyId) {
          throw ApiError.badRequest('Missing target member or destination family for transfer');
        }
        await FamiliesService.transferMember(
          request.targetMemberId.toString(),
          request.familyId.toString(),
          request.transferToFamilyId.toString(),
          (request.relationship as any) || 'OTHER'
        );
        break;
      }

      default:
        throw ApiError.badRequest(`Unknown request type: ${request.requestType}`);
    }

    const oldStatus = request.status;
    request.status = 'APPROVED';
    request.reviewedBy = new mongoose.Types.ObjectId(reviewerId);
    request.reviewedAt = new Date();
    request.statusHistory.push({
      oldStatus,
      newStatus: 'APPROVED',
      changedBy: new mongoose.Types.ObjectId(reviewerId),
      comment: comment || 'Approved and changes applied to database',
      timestamp: new Date(),
    });

    await request.save();
    return this.getRequestById(request._id.toString());
  }

  static async rejectRequest(id: string, reviewerId: string, reason: string) {
    if (!reason || !reason.trim()) {
      throw ApiError.badRequest('Rejection reason is required');
    }

    const request = await FamilyChangeRequest.findById(id);
    if (!request) throw ApiError.notFound('Change request not found');

    if (request.status !== 'PENDING' && request.status !== 'UNDER_REVIEW') {
      throw ApiError.badRequest(`Cannot reject request that is already ${request.status}`);
    }

    const oldStatus = request.status;
    request.status = 'REJECTED';
    request.rejectionReason = reason.trim();
    request.reviewedBy = new mongoose.Types.ObjectId(reviewerId);
    request.reviewedAt = new Date();
    request.statusHistory.push({
      oldStatus,
      newStatus: 'REJECTED',
      changedBy: new mongoose.Types.ObjectId(reviewerId),
      comment: reason.trim(),
      timestamp: new Date(),
    });

    await request.save();
    return this.getRequestById(request._id.toString());
  }
}
