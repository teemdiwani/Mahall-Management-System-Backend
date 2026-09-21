"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const payments_service_js_1 = require("./payments.service.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
const auditLogger_js_1 = require("../../middleware/auditLogger.js");
class PaymentsController {
    static async list(req, res, next) {
        try {
            const result = await payments_service_js_1.PaymentsService.listPayments(req.query);
            return apiResponse_js_1.ApiResponse.paginate(res, result.items, result.page, result.limit, result.total);
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyPayments(req, res, next) {
        try {
            const payments = await payments_service_js_1.PaymentsService.getMyPayments(req.user._id.toString());
            return apiResponse_js_1.ApiResponse.success(res, payments);
        }
        catch (error) {
            next(error);
        }
    }
    static async generateMonthly(req, res, next) {
        try {
            const { month, amount } = req.body;
            const currentMonth = month || new Date().toISOString().slice(0, 7);
            const result = await payments_service_js_1.PaymentsService.generateMonthlyContributions(currentMonth, amount || 250);
            await (0, auditLogger_js_1.logAudit)(req, 'MONTHLY_DUES_GENERATED', 'Payment', currentMonth, null, result);
            return apiResponse_js_1.ApiResponse.success(res, result, 201, `Monthly contributions generated for ${currentMonth}`);
        }
        catch (error) {
            next(error);
        }
    }
    static async verify(req, res, next) {
        try {
            const payment = await payments_service_js_1.PaymentsService.verifyPayment(req.params.id, req.body, req.user._id.toString());
            await (0, auditLogger_js_1.logAudit)(req, 'PAYMENT_VERIFIED', 'Payment', payment._id.toString(), { status: 'PENDING' }, { status: 'PAID', receiptNumber: payment.receiptNumber });
            return apiResponse_js_1.ApiResponse.success(res, payment, 200, 'Payment verified and receipt issued');
        }
        catch (error) {
            next(error);
        }
    }
    static async recordDirect(req, res, next) {
        try {
            const payment = await payments_service_js_1.PaymentsService.recordDirectPayment({
                ...req.body,
                verifiedByUserId: req.user._id.toString(),
            });
            await (0, auditLogger_js_1.logAudit)(req, 'DIRECT_PAYMENT_RECORDED', 'Payment', payment._id.toString(), null, { amount: payment.amount, receiptNumber: payment.receiptNumber });
            return apiResponse_js_1.ApiResponse.success(res, payment, 201, 'Payment recorded successfully');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PaymentsController = PaymentsController;
