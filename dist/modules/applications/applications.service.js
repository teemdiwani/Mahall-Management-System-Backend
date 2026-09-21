"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsService = void 0;
const application_model_js_1 = require("./application.model.js");
const applicationHistory_model_js_1 = require("./applicationHistory.model.js");
const member_model_js_1 = require("../members/member.model.js");
const user_model_js_1 = require("../auth/user.model.js");
const notification_model_js_1 = require("../notifications/notification.model.js");
const apiError_js_1 = require("../../utils/apiError.js");
const roles_js_1 = require("../../constants/roles.js");
class ApplicationsService {
    static async submitApplication(applicantUserId, data) {
        const user = await user_model_js_1.User.findById(applicantUserId);
        const member = await member_model_js_1.Member.findOne({
            $or: [
                { userId: applicantUserId },
                ...(user?.email ? [{ email: user.email.toLowerCase() }] : []),
                ...(user?.phone ? [{ phone: user.phone }] : []),
            ],
        });
        const count = await application_model_js_1.Application.countDocuments();
        const applicationNumber = `APP-${new Date().getFullYear()}-${String(count + 1001).padStart(5, '0')}`;
        const application = await application_model_js_1.Application.create({
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
        await applicationHistory_model_js_1.ApplicationHistory.create({
            applicationId: application._id,
            changedBy: applicantUserId,
            oldStatus: 'PENDING',
            newStatus: 'PENDING',
            comment: 'Application submitted by applicant',
            timestamp: new Date(),
        });
        return application;
    }
    static async listApplications(userRole, userId, query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
        const skip = (page - 1) * limit;
        const filter = {};
        // RULE 6 & 10: Members can only see their own applications
        if (userRole === roles_js_1.ROLES.MEMBER || userRole === roles_js_1.ROLES.FAMILY_HEAD || userRole === roles_js_1.ROLES.VOLUNTEER) {
            filter.applicant = userId;
        }
        else if (userRole === roles_js_1.ROLES.WELFARE_OFFICER) {
            // Welfare officer only handles ZAKAT and WELFARE applications
            filter.type = { $in: ['ZAKAT', 'WELFARE'] };
        }
        if (query.status)
            filter.status = query.status;
        if (query.type)
            filter.type = query.type;
        if (query.search) {
            filter.$or = [
                { applicationNumber: { $regex: query.search, $options: 'i' } },
                { title: { $regex: query.search, $options: 'i' } },
            ];
        }
        const [items, total] = await Promise.all([
            application_model_js_1.Application.find(filter)
                .populate('applicant', 'name email')
                .populate('member', 'name phone')
                .populate('family', 'familyCode name area')
                .populate('reviewer', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            application_model_js_1.Application.countDocuments(filter),
        ]);
        return { items, page, limit, total };
    }
    static async getApplicationById(id, userRole, userId) {
        const application = await application_model_js_1.Application.findById(id)
            .populate('applicant', 'name email')
            .populate('member', 'name phone email relationship dateOfBirth')
            .populate('family', 'familyCode name address area phone')
            .populate('reviewer', 'name email');
        if (!application) {
            throw apiError_js_1.ApiError.notFound('Application not found');
        }
        // Confidentiality check
        if ((userRole === roles_js_1.ROLES.MEMBER || userRole === roles_js_1.ROLES.FAMILY_HEAD || userRole === roles_js_1.ROLES.VOLUNTEER) &&
            application.applicant._id.toString() !== userId) {
            throw apiError_js_1.ApiError.forbidden('You are not authorized to view this application');
        }
        const history = await applicationHistory_model_js_1.ApplicationHistory.find({ applicationId: application._id })
            .populate('changedBy', 'name email role')
            .sort({ timestamp: 1 });
        return { application, history };
    }
    static async updateStatus(id, newStatus, reviewerUserId, comment, decision) {
        const application = await application_model_js_1.Application.findById(id);
        if (!application) {
            throw apiError_js_1.ApiError.notFound('Application not found');
        }
        const oldStatus = application.status;
        application.status = newStatus;
        application.reviewer = reviewerUserId;
        if (comment)
            application.reviewNotes = comment;
        if (decision)
            application.decision = decision;
        if (newStatus === 'APPROVED' || newStatus === 'REJECTED') {
            application.decisionAt = new Date();
        }
        if (newStatus === 'COMPLETED') {
            application.completedAt = new Date();
        }
        await application.save();
        // RULE 11: Application status changes must be recorded in history
        await applicationHistory_model_js_1.ApplicationHistory.create({
            applicationId: application._id,
            changedBy: reviewerUserId,
            oldStatus,
            newStatus,
            comment: comment || `Status moved from ${oldStatus} to ${newStatus}`,
            timestamp: new Date(),
        });
        // Notify applicant
        await notification_model_js_1.Notification.create({
            recipient: application.applicant,
            type: 'APPLICATION',
            title: `Application ${application.applicationNumber} Status: ${newStatus}`,
            message: `Your ${application.type} application status has been updated to ${newStatus}.${comment ? ` Note: ${comment}` : ''}`,
            link: `/applications`,
        });
        return application;
    }
}
exports.ApplicationsService = ApplicationsService;
