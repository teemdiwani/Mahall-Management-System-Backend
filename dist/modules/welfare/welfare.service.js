"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WelfareService = void 0;
const application_model_js_1 = require("../applications/application.model.js");
const payment_model_js_1 = require("../payments/payment.model.js");
class WelfareService {
    static async getWelfareDashboard() {
        const [pendingCount, underReviewCount, approvedCount, completedCount] = await Promise.all([
            application_model_js_1.Application.countDocuments({ type: { $in: ['WELFARE', 'ZAKAT'] }, status: 'PENDING' }),
            application_model_js_1.Application.countDocuments({ type: { $in: ['WELFARE', 'ZAKAT'] }, status: 'UNDER_REVIEW' }),
            application_model_js_1.Application.countDocuments({ type: { $in: ['WELFARE', 'ZAKAT'] }, status: 'APPROVED' }),
            application_model_js_1.Application.countDocuments({ type: { $in: ['WELFARE', 'ZAKAT'] }, status: 'COMPLETED' }),
        ]);
        const disbursedAgg = await application_model_js_1.Application.aggregate([
            { $match: { type: { $in: ['WELFARE', 'ZAKAT'] }, status: { $in: ['APPROVED', 'COMPLETED'] }, requestedAmount: { $exists: true, $ne: null } } },
            { $group: { _id: null, total: { $sum: '$requestedAmount' } } },
        ]);
        const totalDisbursed = disbursedAgg[0]?.total || 0;
        const zakatFundAgg = await payment_model_js_1.Payment.aggregate([
            { $match: { type: { $in: ['ZAKAT', 'FITRAH'] }, status: 'PAID' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const totalZakatFund = zakatFundAgg[0]?.total || 0;
        const recentCases = await application_model_js_1.Application.find({ type: { $in: ['WELFARE', 'ZAKAT', 'SCHOLARSHIP', 'MEDICAL'] } })
            .populate('applicant', 'name email')
            .populate('member', 'name phone')
            .populate('family', 'familyCode name area')
            .sort({ createdAt: -1 })
            .limit(10);
        return {
            cards: { pending: pendingCount, underReview: underReviewCount, approved: approvedCount, completed: completedCount, totalDisbursed, totalZakatFund, netZakatBalance: Math.max(0, totalZakatFund - totalDisbursed) },
            recentCases,
        };
    }
    static async listCases(query) {
        const { status, type, page = 1, limit = 20 } = query;
        const filter = { type: { $in: ['WELFARE', 'ZAKAT', 'SCHOLARSHIP', 'MEDICAL', 'FINANCIAL_AID', 'EMERGENCY'] } };
        if (status)
            filter.status = status.toUpperCase();
        if (type)
            filter.type = type.toUpperCase();
        const skip = (Number(page) - 1) * Number(limit);
        const [items, total] = await Promise.all([
            application_model_js_1.Application.find(filter).populate('applicant', 'name email').populate('member', 'name phone').populate('family', 'familyCode area').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
            application_model_js_1.Application.countDocuments(filter),
        ]);
        return { items, total, page: Number(page), limit: Number(limit) };
    }
    static async createCase(data) {
        return application_model_js_1.Application.create({ ...data, status: 'PENDING' });
    }
    static async updateCaseStatus(id, status, reviewedBy, note) {
        const app = await application_model_js_1.Application.findById(id);
        if (!app)
            throw new Error('Case not found');
        const historyEntry = { status: status.toUpperCase(), changedBy: reviewedBy, changedAt: new Date(), note };
        app.statusHistory = [...(app.statusHistory || []), historyEntry];
        app.status = status.toUpperCase();
        return app.save();
    }
    static async listBeneficiaries(query) {
        const { type, page = 1, limit = 20 } = query;
        const filter = {
            type: { $in: ['WELFARE', 'ZAKAT', 'SCHOLARSHIP', 'MEDICAL', 'FINANCIAL_AID', 'EMERGENCY'] },
            status: { $in: ['APPROVED', 'COMPLETED'] },
        };
        if (type)
            filter.type = type.toUpperCase();
        const skip = (Number(page) - 1) * Number(limit);
        const [items, total] = await Promise.all([
            application_model_js_1.Application.find(filter).populate('applicant', 'name email phone').populate('member', 'name phone').populate('family', 'familyCode area').sort({ updatedAt: -1 }).skip(skip).limit(Number(limit)),
            application_model_js_1.Application.countDocuments(filter),
        ]);
        return { items, total, page: Number(page), limit: Number(limit) };
    }
    static async getZakatSummary() {
        const [collected, distributed, fitrah] = await Promise.all([
            payment_model_js_1.Payment.aggregate([{ $match: { type: 'ZAKAT', status: 'PAID' } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
            application_model_js_1.Application.aggregate([{ $match: { type: 'ZAKAT', status: { $in: ['APPROVED', 'COMPLETED'] } } }, { $group: { _id: null, total: { $sum: '$requestedAmount' }, count: { $sum: 1 } } }]),
            payment_model_js_1.Payment.aggregate([{ $match: { type: 'FITRAH', status: 'PAID' } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
        ]);
        const totalCollected = (collected[0]?.total || 0) + (fitrah[0]?.total || 0);
        const totalDistributed = distributed[0]?.total || 0;
        const recentDistributions = await application_model_js_1.Application.find({ type: 'ZAKAT', status: { $in: ['APPROVED', 'COMPLETED'] } })
            .populate('applicant', 'name')
            .sort({ updatedAt: -1 })
            .limit(10);
        return {
            totalCollected, totalDistributed, balance: Math.max(0, totalCollected - totalDistributed),
            collectedCount: (collected[0]?.count || 0) + (fitrah[0]?.count || 0),
            distributedCount: distributed[0]?.count || 0,
            recentDistributions,
        };
    }
    static async distributeZakat(data) {
        return application_model_js_1.Application.create({ ...data, type: 'ZAKAT', status: 'APPROVED' });
    }
}
exports.WelfareService = WelfareService;
