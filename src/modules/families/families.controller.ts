import type { Request, Response, NextFunction } from 'express';
import { FamiliesService } from './families.service.js';
import { Member } from '../members/member.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { ApiError } from '../../utils/apiError.js';
import { ROLES } from '../../constants/roles.js';
import { logAudit } from '../../middleware/auditLogger.js';

export class FamiliesController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FamiliesService.listFamilies(req.query);
      return ApiResponse.paginate(res, result.items, result.page, result.limit, result.total);
    } catch (error) {
      next(error);
    }
  }

  static async getMyFamily(req: Request, res: Response, next: NextFunction) {
    try {
      const searchNumber = (req.query.number as string) || (req.query.phone as string) || undefined;
      const result = await FamiliesService.getMyFamily(
        req.user!._id.toString(),
        req.user!.email,
        req.user!.phone,
        searchNumber
      );
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      // Authorization check: If non-admin/staff, can only view own family
      const roleUpper = (req.user!.role || '').toUpperCase();
      const isAdminStaff = [
        ROLES.SUPER_ADMIN,
        ROLES.SECRETARY,
        ROLES.TREASURER,
        ROLES.IMAM,
        ROLES.WELFARE_OFFICER,
        ROLES.COMMITTEE_MEMBER,
      ].map((r) => r.toUpperCase()).includes(roleUpper);

      if (!isAdminStaff) {
        const { findFamilyAndMemberForUser } = await import('../../utils/memberMatcher.js');
        const match = await findFamilyAndMemberForUser({
          userId: req.user!._id.toString(),
          email: req.user!.email,
          phone: req.user!.phone,
        });

        if (!match.family || match.family._id.toString() !== req.params.id) {
          throw ApiError.forbidden('You are not authorized to view this family record');
        }
      }

      const result = await FamiliesService.getFamilyById(req.params.id as string);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const family = await FamiliesService.createFamily({
        ...req.body,
        createdBy: req.user!._id.toString(),
      });

      await logAudit(
        req,
        'FAMILY_CREATED',
        'Family',
        (family.family as any)?._id?.toString() || '',
        null,
        { familyCode: family.family.familyCode, name: family.family.name }
      );

      return ApiResponse.success(res, family, 201, 'Family registered successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const family = await FamiliesService.updateFamily(req.params.id as string, {
        ...req.body,
        updatedBy: req.user!._id.toString(),
      });

      await logAudit(
        req,
        'FAMILY_UPDATED',
        'Family',
        req.params.id as string,
        null,
        req.body
      );

      return ApiResponse.success(res, family, 200, 'Family updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async archive(req: Request, res: Response, next: NextFunction) {
    try {
      const force = req.query.force === 'true' || req.body.force === true;
      const result = await FamiliesService.archiveFamily(req.params.id as string, force);

      await logAudit(
        req,
        'FAMILY_ARCHIVED',
        'Family',
        req.params.id as string,
        null,
        { force }
      );

      return ApiResponse.success(res, result, 200, 'Family archived successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FamiliesService.getFamilyById(req.params.id as string);
      return ApiResponse.success(res, result.members);
    } catch (error) {
      next(error);
    }
  }

  static async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FamiliesService.addMemberToFamily(req.params.id as string, req.body);

      await logAudit(
        req,
        'FAMILY_MEMBER_ADDED',
        'Family',
        req.params.id as string,
        null,
        { details: req.body }
      );

      return ApiResponse.success(res, result, 201, 'Member added to family');
    } catch (error) {
      next(error);
    }
  }

  static async updateMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { memberId } = req.params;
      const result = await FamiliesService.updateFamilyMember(
        req.params.id as string,
        memberId as string,
        req.body
      );

      await logAudit(
        req,
        'FAMILY_MEMBER_RELATIONSHIP_CHANGED',
        'Family',
        req.params.id as string,
        null,
        { memberId, updates: req.body }
      );

      return ApiResponse.success(res, result, 200, 'Family member relationship updated');
    } catch (error) {
      next(error);
    }
  }

  static async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { memberId } = req.params;
      const result = await FamiliesService.removeMemberFromFamily(
        req.params.id as string,
        memberId as string
      );

      await logAudit(
        req,
        'FAMILY_MEMBER_REMOVED',
        'Family',
        req.params.id as string,
        null,
        { memberId }
      );

      return ApiResponse.success(res, result, 200, 'Member removed from family');
    } catch (error) {
      next(error);
    }
  }
}
