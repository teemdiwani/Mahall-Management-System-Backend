import { Payment, type IPayment } from './payment.model.js';
import { Family } from '../families/family.model.js';
import { Member } from '../members/member.model.js';
import { Notification } from '../notifications/notification.model.js';
import { ApiError } from '../../utils/apiError.js';

export class PaymentsService {
  static async generateMonthlyContributions(month: string, amountPerFamily: number = 250) {
    const families = await Family.find({ status: 'ACTIVE' });
    let createdCount = 0;

    for (const fam of families) {
      const existing = await Payment.findOne({
        familyId: fam._id,
        month,
        type: 'MONTHLY',
      });

      if (!existing) {
        const paymentNumber = `PAY-${month.replace('-', '')}-${fam.familyCode}`;
        await Payment.create({
          paymentNumber,
          familyId: fam._id,
          amount: amountPerFamily,
          month,
          type: 'MONTHLY',
          status: 'PENDING',
          paymentMethod: 'ONLINE',
        });
        createdCount++;
      }
    }

    return { generated: createdCount, month };
  }

  static async listPayments(query: {
    page?: number;
    limit?: number;
    status?: string;
    month?: string;
    familyId?: string;
    type?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (query.status && query.status !== 'all') {
      filter.status = query.status.toUpperCase();
    }
    if (query.month) filter.month = query.month;
    if (query.familyId) filter.familyId = query.familyId;
    if (query.type && query.type !== 'all') {
      filter.type = query.type.toUpperCase();
    }

    const [items, total] = await Promise.all([
      Payment.find(filter)
        .populate('familyId', 'familyCode name address area phone')
        .populate('memberId', 'name phone')
        .populate('verifiedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(filter),
    ]);

    return { items, page, limit, total };
  }

  static async getMyPayments(userId: string) {
    const member = await Member.findOne({ userId });
    if (!member || !member.familyId) {
      return [];
    }

    const payments = await Payment.find({ familyId: member.familyId })
      .populate('familyId', 'familyCode name')
      .sort({ createdAt: -1 });

    return payments;
  }

  static async verifyPayment(
    paymentId: string,
    data: {
      paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'ONLINE' | 'UPI';
      transactionId?: string;
      notes?: string;
    },
    verifiedByUserId: string
  ) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw ApiError.notFound('Payment record not found');
    }

    if (payment.status === 'PAID') {
      throw ApiError.badRequest('Payment has already been marked as PAID');
    }

    const receiptNumber = `RCP-${new Date().getFullYear()}-${String(
      Math.floor(10000 + Math.random() * 90000)
    )}`;

    payment.status = 'PAID';
    payment.paymentMethod = data.paymentMethod;
    payment.transactionId = data.transactionId || `TXN-${Date.now()}`;
    payment.receiptNumber = receiptNumber;
    payment.verifiedBy = verifiedByUserId as any;
    payment.notes = data.notes;
    payment.paidAt = new Date();
    await payment.save();

    // Create notification for the family members if users exist
    const members = await Member.find({ familyId: payment.familyId, userId: { $exists: true, $ne: null } });
    for (const m of members) {
      if (m.userId) {
        await Notification.create({
          recipient: m.userId,
          type: 'PAYMENT',
          title: 'Payment Confirmed',
          message: `Your payment of ₹${payment.amount} for ${payment.month || payment.type} has been successfully verified. Receipt: ${receiptNumber}`,
        });
      }
    }

    return payment;
  }

  static async recordDirectPayment(data: {
    familyId: string;
    memberId?: string;
    amount: number;
    type: 'MONTHLY' | 'DONATION' | 'ZAKAT' | 'FITRAH' | 'EVENT' | 'OTHER';
    paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'ONLINE' | 'UPI';
    month?: string;
    notes?: string;
    verifiedByUserId: string;
  }) {
    const receiptNumber = `RCP-${new Date().getFullYear()}-${String(
      Math.floor(10000 + Math.random() * 90000)
    )}`;

    const paymentNumber = `PAY-${Date.now()}-${String(
      Math.floor(1000 + Math.random() * 9000)
    )}`;

    const payment = await Payment.create({
      paymentNumber,
      familyId: data.familyId,
      memberId: data.memberId,
      amount: data.amount,
      type: data.type,
      month: data.month,
      status: 'PAID',
      paymentMethod: data.paymentMethod,
      receiptNumber,
      verifiedBy: data.verifiedByUserId,
      notes: data.notes,
      paidAt: new Date(),
    });

    return payment;
  }
}
