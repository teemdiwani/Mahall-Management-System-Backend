"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const razorpay_1 = __importDefault(require("razorpay"));
const payment_model_js_1 = require("./payment.model.js");
const family_model_js_1 = require("../families/family.model.js");
const member_model_js_1 = require("../members/member.model.js");
const notification_model_js_1 = require("../notifications/notification.model.js");
const apiError_js_1 = require("../../utils/apiError.js");
const env_js_1 = require("../../config/env.js");
class PaymentsService {
    /**
     * Generates monthly contribution payment records for all active families.
     * If a family has a custom `monthlyContribution` set, it uses that; otherwise defaults to 250.
     */
    static async generateMonthlyContributions(month, defaultAmount = 250) {
        const currentMonth = month || new Date().toISOString().slice(0, 7);
        const families = await family_model_js_1.Family.find({ status: 'ACTIVE' });
        let createdCount = 0;
        for (const fam of families) {
            const existing = await payment_model_js_1.Payment.findOne({
                familyId: fam._id,
                month: currentMonth,
                type: 'MONTHLY',
            });
            if (!existing) {
                const familyContribution = fam.monthlyContribution && fam.monthlyContribution > 0
                    ? fam.monthlyContribution
                    : defaultAmount;
                const paymentNumber = `PAY-${currentMonth.replace('-', '')}-${fam.familyCode}`;
                await payment_model_js_1.Payment.create({
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
    static async checkAndTriggerMonthlyDues(targetDate = new Date()) {
        const day = targetDate.getDate();
        // Rule: Every month 28th, add a payment for all families based on their contribution
        if (day >= 28) {
            const month = targetDate.toISOString().slice(0, 7);
            return await this.generateMonthlyContributions(month);
        }
        return { generated: 0, skipped: true, day };
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
        if (query.search && query.search.trim()) {
            const families = await family_model_js_1.Family.find({
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
            payment_model_js_1.Payment.find(filter)
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
            payment_model_js_1.Payment.countDocuments(filter),
        ]);
        return { items, page, limit, total };
    }
    static async getMyPayments(userId, email, phone) {
        const { findFamilyAndMemberForUser } = await import('../../utils/memberMatcher.js');
        const match = await findFamilyAndMemberForUser({ userId, email, phone });
        if (!match.family) {
            return [];
        }
        // Auto-check for 28th: If today is >= 28th, ensure this month's pending dues exist
        const now = new Date();
        if (now.getDate() >= 28) {
            const currentMonth = now.toISOString().slice(0, 7);
            const existing = await payment_model_js_1.Payment.findOne({
                familyId: match.family._id,
                month: currentMonth,
                type: 'MONTHLY',
            });
            if (!existing) {
                const familyContribution = match.family.monthlyContribution && match.family.monthlyContribution > 0
                    ? match.family.monthlyContribution
                    : 250;
                const paymentNumber = `PAY-${currentMonth.replace('-', '')}-${match.family.familyCode}`;
                await payment_model_js_1.Payment.create({
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
        // Sync any pending Madrasa tuition fees for family students into Payment records
        try {
            const { MadrasaFee } = await import('../madrasa/madrasa.extra.model.js');
            const pendingFees = await MadrasaFee.find({
                familyId: match.family._id,
                status: 'PENDING',
            }).populate('studentId', 'name admissionNumber');
            for (const fee of pendingFees) {
                const existingFeePayment = await payment_model_js_1.Payment.findOne({ madrasaFeeId: fee._id });
                if (!existingFeePayment) {
                    const studentName = fee.studentId?.name || 'Student';
                    const admNo = fee.studentId?.admissionNumber || fee._id.toString().slice(-4);
                    await payment_model_js_1.Payment.create({
                        paymentNumber: `PAY-MDR-${fee.month.replace('-', '')}-${admNo}`,
                        familyId: match.family._id,
                        studentId: fee.studentId?._id || fee.studentId,
                        madrasaFeeId: fee._id,
                        amount: fee.amount,
                        month: fee.month,
                        type: 'TUITION',
                        status: 'PENDING',
                        paymentMethod: 'ONLINE',
                        notes: `Madrasa Tuition Fee for ${studentName} (${fee.month})`,
                    });
                }
            }
        }
        catch (e) {
            // ignore
        }
        const payments = await payment_model_js_1.Payment.find({ familyId: match.family._id })
            .populate({
            path: 'familyId',
            select: 'familyCode name address area phone monthlyContribution familyHead',
            populate: { path: 'familyHead', select: 'name phone' },
        })
            .populate('memberId', 'name phone memberCode')
            .populate('studentId', 'name admissionNumber standard division')
            .sort({ createdAt: -1 });
        return payments;
    }
    /**
     * Creates a Razorpay Order for a pending payment record
     */
    static async createRazorpayOrder(paymentId) {
        const payment = await payment_model_js_1.Payment.findById(paymentId).populate('familyId');
        if (!payment) {
            throw apiError_js_1.ApiError.notFound('Payment record not found');
        }
        if (payment.status === 'PAID') {
            throw apiError_js_1.ApiError.badRequest('This payment has already been completed and verified');
        }
        const keyId = env_js_1.env.RAZORPAY_KEY_ID || 'rzp_test_TgVDlY3IsjDcYp';
        const keySecret = env_js_1.env.RAZORPAY_KEY_SECRET || '6OTIZgl34SR0qj7S6x0PUO1t';
        const razorpay = new razorpay_1.default({
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
     * Creates a direct online contribution (Zakat, Fitrah, Iftar, Donation) and initializes a Razorpay order
     */
    static async createOnlineContribution(data) {
        if (!data.amount || data.amount <= 0) {
            throw apiError_js_1.ApiError.badRequest('Contribution amount must be greater than zero');
        }
        let familyId = undefined;
        let memberId = undefined;
        if (data.userId) {
            try {
                const { findFamilyAndMemberForUser } = await import('../../utils/memberMatcher.js');
                const match = await findFamilyAndMemberForUser({
                    userId: data.userId,
                    email: data.userEmail,
                    phone: data.userPhone || data.phone,
                });
                if (match.family)
                    familyId = match.family._id;
                if (match.currentMember)
                    memberId = match.currentMember._id;
            }
            catch {
                // ignore
            }
        }
        const typePrefix = data.type === 'ZAKAT'
            ? 'ZKT'
            : data.type === 'FITRAH'
                ? 'FTR'
                : data.type === 'IFTAR'
                    ? 'IFT'
                    : 'DON';
        const paymentNumber = `PAY-${typePrefix}-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
        const notesParts = [];
        if (data.donorName)
            notesParts.push(`Donor: ${data.donorName}`);
        if (data.phone)
            notesParts.push(`Phone: ${data.phone}`);
        if (data.notes)
            notesParts.push(data.notes);
        const payment = await payment_model_js_1.Payment.create({
            paymentNumber,
            familyId,
            memberId,
            amount: data.amount,
            type: data.type,
            status: 'PENDING',
            paymentMethod: 'ONLINE',
            notes: notesParts.length > 0 ? notesParts.join(' | ') : `${data.type} Contribution`,
        });
        return await this.createRazorpayOrder(payment._id.toString());
    }
    /**
     * Verifies Razorpay payment signature and updates payment status to PAID
     */
    static async verifyRazorpayPayment(paymentId, data, verifiedByUserId) {
        const payment = await payment_model_js_1.Payment.findById(paymentId).populate('familyId');
        if (!payment) {
            throw apiError_js_1.ApiError.notFound('Payment record not found');
        }
        if (payment.status === 'PAID') {
            return payment;
        }
        const keySecret = env_js_1.env.RAZORPAY_KEY_SECRET || '6OTIZgl34SR0qj7S6x0PUO1t';
        // Verify HMAC-SHA256 signature
        const body = `${data.razorpay_order_id}|${data.razorpay_payment_id}`;
        const expectedSignature = crypto_1.default.createHmac('sha256', keySecret).update(body).digest('hex');
        if (expectedSignature !== data.razorpay_signature) {
            throw apiError_js_1.ApiError.badRequest('Razorpay payment signature verification failed');
        }
        const receiptNumber = `RCP-${new Date().getFullYear()}-${String(Math.floor(10000 + Math.random() * 90000))}`;
        payment.status = 'PAID';
        payment.paymentMethod = 'ONLINE';
        payment.transactionId = data.razorpay_payment_id;
        payment.razorpayPaymentId = data.razorpay_payment_id;
        payment.receiptNumber = receiptNumber;
        payment.paidAt = new Date();
        if (verifiedByUserId) {
            payment.verifiedBy = verifiedByUserId;
        }
        await payment.save();
        // If this payment is linked to a Madrasa tuition fee, sync and mark the MadrasaFee as PAID
        if (payment.madrasaFeeId) {
            try {
                const { MadrasaFee } = await import('../madrasa/madrasa.extra.model.js');
                await MadrasaFee.findByIdAndUpdate(payment.madrasaFeeId, {
                    status: 'PAID',
                    paidDate: new Date(),
                    paymentMethod: 'ONLINE',
                    receiptNumber: receiptNumber,
                    razorpayPaymentId: data.razorpay_payment_id,
                    transactionId: data.razorpay_payment_id,
                    paymentId: payment._id,
                });
            }
            catch (err) {
                // ignore
            }
        }
        // Create notification for family members
        const members = await member_model_js_1.Member.find({
            familyId: payment.familyId,
            userId: { $exists: true, $ne: null },
        });
        for (const m of members) {
            if (m.userId) {
                await notification_model_js_1.Notification.create({
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
    static async getPaymentInvoice(paymentId) {
        let payment = await payment_model_js_1.Payment.findById(paymentId)
            .populate({
            path: 'familyId',
            select: 'familyCode name address area phone monthlyContribution familyHead',
            populate: { path: 'familyHead', select: 'name phone email memberCode' },
        })
            .populate('memberId', 'name phone memberCode')
            .populate('studentId', 'name admissionNumber standard division rollNumber')
            .populate('verifiedBy', 'name email');
        if (!payment) {
            // Check if it's a MadrasaFee ID
            const { MadrasaFee } = await import('../madrasa/madrasa.extra.model.js');
            const fee = await MadrasaFee.findById(paymentId)
                .populate('studentId')
                .populate('madrasaId')
                .populate({
                path: 'familyId',
                select: 'familyCode name address area phone monthlyContribution familyHead',
                populate: { path: 'familyHead', select: 'name phone email memberCode' },
            });
            if (fee) {
                return {
                    _id: fee._id,
                    paymentNumber: `PAY-MDR-${fee.month.replace('-', '')}-${fee.studentId?.admissionNumber || fee._id.toString().slice(-4)}`,
                    familyId: fee.familyId,
                    amount: fee.amount,
                    month: fee.month,
                    type: 'TUITION',
                    status: fee.status,
                    paymentMethod: fee.paymentMethod || 'ONLINE',
                    receiptNumber: fee.receiptNumber,
                    transactionId: fee.transactionId || fee.razorpayPaymentId,
                    razorpayPaymentId: fee.razorpayPaymentId,
                    razorpayOrderId: fee.razorpayOrderId,
                    paidAt: fee.paidDate || fee.createdAt,
                    createdAt: fee.createdAt,
                    notes: fee.notes || `Madrasa Tuition Fee for ${fee.studentId?.name || 'Student'} (${fee.month})`,
                    studentId: fee.studentId,
                };
            }
            throw apiError_js_1.ApiError.notFound('Payment or tuition fee record not found');
        }
        return payment;
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
