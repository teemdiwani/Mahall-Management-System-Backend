"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const payment_model_js_1 = require("./payment.model.js");
const family_model_js_1 = require("../families/family.model.js");
const member_model_js_1 = require("../members/member.model.js");
const notification_model_js_1 = require("../notifications/notification.model.js");
const apiError_js_1 = require("../../utils/apiError.js");
class PaymentsService {
    static async generateMonthlyContributions(month, amountPerFamily = 250) {
        const families = await family_model_js_1.Family.find({ status: 'ACTIVE' });
        let createdCount = 0;
        for (const fam of families) {
            const existing = await payment_model_js_1.Payment.findOne({
                familyId: fam._id,
                month,
                type: 'MONTHLY',
            });
            if (!existing) {
                const paymentNumber = `PAY-${month.replace('-', '')}-${fam.familyCode}`;
                await payment_model_js_1.Payment.create({
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
    static async listPayments(query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
        const skip = (page - 1) * limit;
        const filter = {};
        if (query.status && query.status !== 'all') {
            filter.status = query.status.toUpperCase();
        }
        if (query.month)
            filter.month = query.month;
        if (query.familyId)
            filter.familyId = query.familyId;
        if (query.type && query.type !== 'all') {
            filter.type = query.type.toUpperCase();
        }
        const [items, total] = await Promise.all([
            payment_model_js_1.Payment.find(filter)
                .populate('familyId', 'familyCode name address area phone')
                .populate('memberId', 'name phone')
                .populate('verifiedBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            payment_model_js_1.Payment.countDocuments(filter),
        ]);
        return { items, page, limit, total };
    }
    static async getMyPayments(userId) {
        const member = await member_model_js_1.Member.findOne({ userId });
        if (!member || !member.familyId) {
            return [];
        }
        const payments = await payment_model_js_1.Payment.find({ familyId: member.familyId })
            .populate('familyId', 'familyCode name')
            .sort({ createdAt: -1 });
        return payments;
    }
    static async verifyPayment(paymentId, data, verifiedByUserId) {
        const payment = await payment_model_js_1.Payment.findById(paymentId);
        if (!payment) {
            throw apiError_js_1.ApiError.notFound('Payment record not found');
        }
        if (payment.status === 'PAID') {
            throw apiError_js_1.ApiError.badRequest('Payment has already been marked as PAID');
        }
        const receiptNumber = `RCP-${new Date().getFullYear()}-${String(Math.floor(10000 + Math.random() * 90000))}`;
        payment.status = 'PAID';
        payment.paymentMethod = data.paymentMethod;
        payment.transactionId = data.transactionId || `TXN-${Date.now()}`;
        payment.receiptNumber = receiptNumber;
        payment.verifiedBy = verifiedByUserId;
        payment.notes = data.notes;
        payment.paidAt = new Date();
        await payment.save();
        // Create notification for the family members if users exist
        const members = await member_model_js_1.Member.find({ familyId: payment.familyId, userId: { $exists: true, $ne: null } });
        for (const m of members) {
            if (m.userId) {
                await notification_model_js_1.Notification.create({
                    recipient: m.userId,
                    type: 'PAYMENT',
                    title: 'Payment Confirmed',
                    message: `Your payment of ₹${payment.amount} for ${payment.month || payment.type} has been successfully verified. Receipt: ${receiptNumber}`,
                });
            }
        }
        return payment;
    }
    static async recordDirectPayment(data) {
        const receiptNumber = `RCP-${new Date().getFullYear()}-${String(Math.floor(10000 + Math.random() * 90000))}`;
        const paymentNumber = `PAY-${Date.now()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
        const payment = await payment_model_js_1.Payment.create({
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
exports.PaymentsService = PaymentsService;
