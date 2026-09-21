import { Application } from '../applications/application.model.js';
import { Payment } from '../payments/payment.model.js';

export class WelfareService {
  static async getWelfareDashboard() {
    const [pendingCount, underReviewCount, approvedCount, completedCount] =
      await Promise.all([
        Application.countDocuments({ type: { $in: ['WELFARE', 'ZAKAT'] }, status: 'PENDING' }),
        Application.countDocuments({ type: { $in: ['WELFARE', 'ZAKAT'] }, status: 'UNDER_REVIEW' }),
        Application.countDocuments({ type: { $in: ['WELFARE', 'ZAKAT'] }, status: 'APPROVED' }),
        Application.countDocuments({ type: { $in: ['WELFARE', 'ZAKAT'] }, status: 'COMPLETED' }),
      ]);

    const disbursedAgg = await Application.aggregate([
      { $match: { type: { $in: ['WELFARE', 'ZAKAT'] }, status: { $in: ['APPROVED', 'COMPLETED'] }, requestedAmount: { $exists: true, $ne: null } } },
      { $group: { _id: null, total: { $sum: '$requestedAmount' } } },
    ]);
    const totalDisbursed = disbursedAgg[0]?.total || 0;

    const zakatFundAgg = await Payment.aggregate([
      { $match: { type: { $in: ['ZAKAT', 'FITRAH'] }, status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalZakatFund = zakatFundAgg[0]?.total || 0;

    const recentCases = await Application.find({ type: { $in: ['WELFARE', 'ZAKAT', 'SCHOLARSHIP', 'MEDICAL'] } })
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

  static async listCases(query: Record<string, any>) {
    const { status, type, page = 1, limit = 20 } = query;
    const filter: Record<string, any> = { type: { $in: ['WELFARE', 'ZAKAT', 'SCHOLARSHIP', 'MEDICAL', 'FINANCIAL_AID', 'EMERGENCY'] } };
    if (status) filter.status = status.toUpperCase();
    if (type) filter.type = type.toUpperCase();
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Application.find(filter).populate('applicant', 'name email').populate('member', 'name phone').populate('family', 'familyCode area').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Application.countDocuments(filter),
    ]);
    return { items, total, page: Number(page), limit: Number(limit) };
  }

  static async createCase(data: Record<string, any>) {
    return Application.create({ ...data, status: 'PENDING' });
  }

  static async updateCaseStatus(id: string, status: string, reviewedBy: string, note?: string) {
    const app = await Application.findById(id);
    if (!app) throw new Error('Case not found');
    const historyEntry = { status: status.toUpperCase(), changedBy: reviewedBy, changedAt: new Date(), note };
    (app as any).statusHistory = [...((app as any).statusHistory || []), historyEntry];
    app.status = status.toUpperCase() as any;
    return app.save();
  }

  static async listBeneficiaries(query: Record<string, any>) {
    const { type, page = 1, limit = 20 } = query;
    const filter: Record<string, any> = {
      type: { $in: ['WELFARE', 'ZAKAT', 'SCHOLARSHIP', 'MEDICAL', 'FINANCIAL_AID', 'EMERGENCY'] },
      status: { $in: ['APPROVED', 'COMPLETED'] },
    };
    if (type) filter.type = type.toUpperCase();
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Application.find(filter).populate('applicant', 'name email phone').populate('member', 'name phone').populate('family', 'familyCode area').sort({ updatedAt: -1 }).skip(skip).limit(Number(limit)),
      Application.countDocuments(filter),
    ]);
    return { items, total, page: Number(page), limit: Number(limit) };
  }

  static async getZakatSummary() {
    const [collected, distributed, fitrah] = await Promise.all([
      Payment.aggregate([{ $match: { type: 'ZAKAT', status: 'PAID' } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Application.aggregate([{ $match: { type: 'ZAKAT', status: { $in: ['APPROVED', 'COMPLETED'] } } }, { $group: { _id: null, total: { $sum: '$requestedAmount' }, count: { $sum: 1 } } }]),
      Payment.aggregate([{ $match: { type: 'FITRAH', status: 'PAID' } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
    ]);
    const totalCollected = (collected[0]?.total || 0) + (fitrah[0]?.total || 0);
    const totalDistributed = distributed[0]?.total || 0;
    const recentDistributions = await Application.find({ type: 'ZAKAT', status: { $in: ['APPROVED', 'COMPLETED'] } })
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

  static async distributeZakat(data: Record<string, any>) {
    return Application.create({ ...data, type: 'ZAKAT', status: 'APPROVED' });
  }
}
