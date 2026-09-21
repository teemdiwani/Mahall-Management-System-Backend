import {
  Application,
  type IApplication,
  type ApplicationStatus,
  type ApplicationType,
} from './application.model.js';
import { ApplicationHistory } from './applicationHistory.model.js';
import { Member } from '../members/member.model.js';
import { User } from '../auth/user.model.js';
import { Notification } from '../notifications/notification.model.js';
import { ApiError } from '../../utils/apiError.js';
import { ROLES, type UserRole } from '../../constants/roles.js';

export class ApplicationsService {
  static async submitApplication(
    applicantUserId: string,
    data: {
      type: ApplicationType;
      title: string;
      description: string;
      requestedAmount?: number;
      documents?: { fileName: string; fileUrl: string }[];
    }
  ) {
    const user = await User.findById(applicantUserId);
    const member = await Member.findOne({
      $or: [
        { userId: applicantUserId },
        ...(user?.email ? [{ email: user.email.toLowerCase() }] : []),
        ...(user?.phone ? [{ phone: user.phone }] : []),
      ],
    });

    const count = await Application.countDocuments();
    const applicationNumber = `APP-${new Date().getFullYear()}-${String(count + 1001).padStart(5, '0')}`;

    const application = await Application.create({
      applicationNumber,
      applicant: applicantUserId,
      member: member?._id,
      family: member?.familyId,
      type: data.type,
      title: data.title,
      description: data.description,
      requestedAmount: data.requestedAmount,
      documents: data.documents || [],
      status: 'PENDING',
    });

    // Record initial history
    await ApplicationHistory.create({
      applicationId: application._id,
      changedBy: applicantUserId,
      oldStatus: 'PENDING',
      newStatus: 'PENDING',
      comment: 'Application submitted by applicant',
      timestamp: new Date(),
    });

    return application;
  }

  static async listApplications(
    userRole: UserRole,
    userId: string,
    query: {
      page?: number;
      limit?: number;
      status?: ApplicationStatus;
      type?: ApplicationType;
      search?: string;
    }
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    // RULE 6 & 10: Members can only see their own applications
    if (userRole === ROLES.MEMBER || userRole === ROLES.FAMILY_HEAD || userRole === ROLES.VOLUNTEER) {
      filter.applicant = userId;
    } else if (userRole === ROLES.WELFARE_OFFICER) {
      // Welfare officer only handles ZAKAT and WELFARE applications
      filter.type = { $in: ['ZAKAT', 'WELFARE'] };
    }

    if (query.status) filter.status = query.status;
    if (query.type) filter.type = query.type;
    if (query.search) {
      filter.$or = [
        { applicationNumber: { $regex: query.search, $options: 'i' } },
        { title: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Application.find(filter)
        .populate('applicant', 'name email')
        .populate('member', 'name phone')
        .populate('family', 'familyCode name area')
        .populate('reviewer', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Application.countDocuments(filter),
    ]);

    return { items, page, limit, total };
  }

  static async getApplicationById(id: string, userRole: UserRole, userId: string) {
    const application = await Application.findById(id)
      .populate('applicant', 'name email')
      .populate('member', 'name phone email relationship dateOfBirth')
      .populate('family', 'familyCode name address area phone')
      .populate('reviewer', 'name email');

    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    // Confidentiality check
    if (
      (userRole === ROLES.MEMBER || userRole === ROLES.FAMILY_HEAD || userRole === ROLES.VOLUNTEER) &&
      application.applicant._id.toString() !== userId
    ) {
      throw ApiError.forbidden('You are not authorized to view this application');
    }

    const history = await ApplicationHistory.find({ applicationId: application._id })
      .populate('changedBy', 'name email role')
      .sort({ timestamp: 1 });

    return { application, history };
  }

  static async updateStatus(
    id: string,
    newStatus: ApplicationStatus,
    reviewerUserId: string,
    comment?: string,
    decision?: string
  ) {
    const application = await Application.findById(id);
    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    const oldStatus = application.status;
    application.status = newStatus;
    application.reviewer = reviewerUserId as any;
    if (comment) application.reviewNotes = comment;
    if (decision) application.decision = decision;

    if (newStatus === 'APPROVED' || newStatus === 'REJECTED') {
      application.decisionAt = new Date();
    }
    if (newStatus === 'COMPLETED') {
      application.completedAt = new Date();
    }

    await application.save();

    // RULE 11: Application status changes must be recorded in history
    await ApplicationHistory.create({
      applicationId: application._id,
      changedBy: reviewerUserId,
      oldStatus,
      newStatus,
      comment: comment || `Status moved from ${oldStatus} to ${newStatus}`,
      timestamp: new Date(),
    });

    // Notify applicant
    await Notification.create({
      recipient: application.applicant,
      type: 'APPLICATION',
      title: `Application ${application.applicationNumber} Status: ${newStatus}`,
      message: `Your ${application.type} application status has been updated to ${newStatus}.${comment ? ` Note: ${comment}` : ''}`,
      link: `/applications`,
    });

    return application;
  }
}
