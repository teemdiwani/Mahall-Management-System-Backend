"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceController = void 0;
const finance_service_js_1 = require("./finance.service.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
const auditLogger_js_1 = require("../../middleware/auditLogger.js");
class FinanceController {
    static async getOverview(req, res, next) {
        try {
            const overview = await finance_service_js_1.FinanceService.getFinancialOverview(req.query.month);
            return apiResponse_js_1.ApiResponse.success(res, overview);
        }
        catch (error) {
            next(error);
        }
    }
    static async listExpenses(req, res, next) {
        try {
            const result = await finance_service_js_1.FinanceService.listExpenses(req.query);
            return apiResponse_js_1.ApiResponse.paginate(res, result.items, result.page, result.limit, result.total);
        }
        catch (error) {
            next(error);
        }
    }
    static async recordExpense(req, res, next) {
        try {
            const expense = await finance_service_js_1.FinanceService.recordExpense({
                ...req.body,
                recordedBy: req.user._id.toString(),
            });
            await (0, auditLogger_js_1.logAudit)(req, 'EXPENSE_RECORDED', 'Expense', expense._id.toString(), null, { amount: expense.amount, category: expense.category });
            return apiResponse_js_1.ApiResponse.success(res, expense, 201, 'Expense recorded successfully');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.FinanceController = FinanceController;
