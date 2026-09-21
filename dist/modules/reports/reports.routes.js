"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const member_model_js_1 = require("../members/member.model.js");
const family_model_js_1 = require("../families/family.model.js");
const payment_model_js_1 = require("../payments/payment.model.js");
const expense_model_js_1 = require("../finance/expense.model.js");
const application_model_js_1 = require("../applications/application.model.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
const auth_js_1 = require("../../middleware/auth.js");
const authorize_js_1 = require("../../middleware/authorize.js");
const roles_js_1 = require("../../constants/roles.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// Reports accessible to Super Admin, Secretary, Treasurer
router.get('/summary', (0, authorize_js_1.requireRole)(roles_js_1.ROLES.SUPER_ADMIN, roles_js_1.ROLES.SECRETARY, roles_js_1.ROLES.TREASURER), async (_req, res, next) => {
    try {
        const [membersCount, familiesCount, paymentsAgg, expensesAgg, applicationsAgg] = await Promise.all([
            member_model_js_1.Member.countDocuments(),
            family_model_js_1.Family.countDocuments(),
            payment_model_js_1.Payment.aggregate([
                { $match: { status: 'PAID' } },
                { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
            ]),
            expense_model_js_1.Expense.aggregate([
                { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
            ]),
            application_model_js_1.Application.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
        ]);
        return apiResponse_js_1.ApiResponse.success(res, {
            membersCount,
            familiesCount,
            incomeByType: paymentsAgg,
            expensesByCategory: expensesAgg,
            applicationsByStatus: applicationsAgg,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
