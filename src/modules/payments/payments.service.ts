import crypto from 'crypto';
import Razorpay from 'razorpay';
import { Payment, type IPayment } from './payment.model.js';
import { Family } from '../families/family.model.js';
import { Member } from '../members/member.model.js';
import { Notification } from '../notifications/notification.model.js';
import { ApiError } from '../../utils/apiError.js';
import { env } from '../../config/env.js';

export class PaymentsService {
  /**
   * Generates monthly contribution payment records for all active families.
   * If a family has a custom `monthlyContribution` set, it uses that; otherwise defaults to 250.
   */
  static async generateMonthlyContributions(month?: string, defaultAmount: number = 250) {
    const currentMonth = month || new Date().toISOString().slice(0, 7);
    const families = await Family.find({ status: 'ACTIVE' });
    let createdCount = 0;

    for (const fam of families) {
      const existing = await Payment.findOne({
        familyId: fam._id,
        month: currentMonth,
        type: 'MONTHLY',
      });

      if (!existing) {
        const familyContribution =
          fam.monthlyContribution && fam.monthlyContribution > 0
            ? fam.monthlyContribution
            : defaultAmount;
        const paymentNumber = `PAY-${currentMonth.replace('-', '')}-${fam.familyCode}`;
        await Payment.create({
          paymentNumber,
          familyId: fam._id,
          amount: familyContribution,
          month: currentMonth,
          type: 'MONTHLY',
          status: 'PENDING',
          paymentMethod: 'ONLINE',
        });
        createdCount++;
      }
    }

    return { generated: createdCount, month: currentMonth };
  }

  /**
   * Automated check for 28th of every month:
   * Adds a pending payment for all active families based on their contribution.
   */
  static async checkAndTriggerMonthlyDues(targetDate: Date = new Date()) {
    const day = targetDate.getDate();
    // Rule: Every month 28th, add a payment for all families based on their contribution
    if (day >= 28) {
      const month = targetDate.toISOString().slice(0, 7);
      return await this.generateMonthlyContributions(month);
    }
    return { generated: 0, skipped: true, day };
  }

  static async listPayments(query: {
    page?: number;
    limit?: number;
    status?: string;
    month?: string;
    familyId?: string;
    type?: string;
    search?: string;
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

    if (query.search && query.search.trim()) {
      const families = await Family.find({
        name: { $regex: query.search.trim(), $options: 'i' },
      }).select('_id');
      const familyIds = families.map((f) => f._id);
      filter.$or = [
        { familyId: { $in: familyIds } },
        { paymentNumber: { $regex: query.search.trim(), $options: 'i' } },
        { receiptNumber: { $regex: query.search.trim(), $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Payment.find(filter)
        .populate({
          path: 'familyId',
          select: 'familyCode name address area phone monthlyContribution familyHead',
          populate: { path: 'familyHead', select: 'name phone' },
        })
        .populate('memberId', 'name phone')
        .populate('verifiedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(filter),
    ]);

    return { items, page, limit, total };
  }

  static async getMyPayments(userId: string, email?: string, phone?: string) {
    const { findFamilyAndMemberForUser } = await import('../../utils/memberMatcher.js');
    const match = await findFamilyAndMemberForUser({ userId, email, phone });
    if (!match.family) {
      return [];
    }

    // Auto-check for 28th: If today is >= 28th, ensure this month's pending dues exist
    const now = new Date();
    if (now.getDate() >= 28) {
      const currentMonth = now.toISOString().slice(0, 7);
      const existing = await Payment.findOne({
        familyId: match.family._id,
        month: currentMonth,
        type: 'MONTHLY',
      });
      if (!existing) {
        const familyContribution =
          match.family.monthlyContribution && match.family.monthlyContribution > 0
            ? match.family.monthlyContribution
            : 250;
        const paymentNumber = `PAY-${currentMonth.replace('-', '')}-${match.family.familyCode}`;
        await Payment.create({
          paymentNumber,
          familyId: match.family._id,
          amount: familyContribution,
          month: currentMonth,
          type: 'MONTHLY',
          status: 'PENDING',
          paymentMethod: 'ONLINE',
        });
      }
    }

    const payments = await Payment.find({ familyId: match.family._id })
      .populate({
        path: 'familyId',
        select: 'familyCode name address area phone monthlyContribution familyHead',
        populate: { path: 'familyHead', select: 'name phone' },
      })
      .populate('memberId', 'name phone memberCode')
      .sort({ createdAt: -1 });

    return payments;
  }

  /**
   * Creates a Razorpay Order for a pending payment record
   */
  static async createRazorpayOrder(paymentId: string) {
    const payment = await Payment.findById(paymentId).populate('familyId');
    if (!payment) {
      throw ApiError.notFound('Payment record not found');
    }

    if (payment.status === 'PAID') {
      throw ApiError.badRequest('This payment has already been completed and verified');
    }

    const keyId = env.RAZORPAY_KEY_ID || 'rzp_test_SWHZJrawTUZSq9';
    const keySecret = env.RAZORPAY_KEY_SECRET || 'uSpgWfpwaudLUiVPyHTZsLo7';

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const amountInPaise = Math.round(payment.amount * 100);
    const receiptRef = (payment.paymentNumber || `PAY-${payment._id}`).slice(-40);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptRef,
      notes: {
        paymentId: payment._id.toString(),
        familyId: payment.familyId?._id?.toString() || payment.familyId?.toString() || '',
        month: payment.month || '',
        type: payment.type,
      },
    });

    payment.razorpayOrderId = order.id;
    await payment.save();

    return {
      orderId: order.id,
      amount: payment.amount,
      amountInPaise,
      currency: 'INR',
      keyId,
      paymentNumber: payment.paymentNumber,
      payment,
    };
  }

  /**
   * Verifies Razorpay payment signature and updates payment status to PAID
   */
  static async verifyRazorpayPayment(
    paymentId: string,
    data: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
    verifiedByUserId?: string
  ) {
    const payment = await Payment.findById(paymentId).populate('familyId');
    if (!payment) {
      throw ApiError.notFound('Payment record not found');
    }

    if (payment.status === 'PAID') {
      return payment;
    }

    const keySecret = env.RAZORPAY_KEY_SECRET || 'uSpgWfpwaudLUiVPyHTZsLo7';

    // Verify HMAC-SHA256 signature
    const body = `${data.razorpay_order_id}|${data.razorpay_payment_id}`;
    const expectedSignature = crypto.createHmac('sha256', keySecret).update(body).digest('hex');

    if (expectedSignature !== data.razorpay_signature) {
      throw ApiError.badRequest('Razorpay payment signature verification failed');
    }

    const receiptNumber = `RCP-${new Date().getFullYear()}-${String(
      Math.floor(10000 + Math.random() * 90000)
    )}`;

    payment.status = 'PAID';
    payment.paymentMethod = 'ONLINE';
    payment.transactionId = data.razorpay_payment_id;
    payment.razorpayPaymentId = data.razorpay_payment_id;
    payment.receiptNumber = receiptNumber;
    payment.paidAt = new Date();
    if (verifiedByUserId) {
      payment.verifiedBy = verifiedByUserId as any;
    }
    await payment.save();

    // Create notification for family members
    const members = await Member.find({
      familyId: payment.familyId,
      userId: { $exists: true, $ne: null },
    });
    for (const m of members) {
      if (m.userId) {
        await Notification.create({
          recipient: m.userId,
          type: 'PAYMENT',
          title: 'Payment Confirmed',
          message: `Your payment of ₹${payment.amount} for ${payment.month || payment.type} was successfully paid via Razorpay. Official Receipt: ${receiptNumber}`,
        });
      }
    }

    return payment;
  }

  /**
   * Returns official Mahall invoice details for printing/viewing
   */
  static async getPaymentInvoice(paymentId: string) {
    const payment = await Payment.findById(paymentId)
      .populate({
        path: 'familyId',
        select: 'familyCode name address area phone monthlyContribution familyHead',
        populate: { path: 'familyHead', select: 'name phone email memberCode' },
      })
      .populate('memberId', 'name phone memberCode')
      .populate('verifiedBy', 'name email');

    if (!payment) {
      throw ApiError.notFound('Payment record not found');
    }

    return payment;
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
