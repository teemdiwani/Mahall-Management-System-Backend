"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceService = void 0;
const payment_model_js_1 = require("../payments/payment.model.js");
const expense_model_js_1 = require("./expense.model.js");
const family_model_js_1 = require("../families/family.model.js");
class FinanceService {
    static async getFinancialOverview(month) {
        const currentMonth = month || new Date().toISOString().slice(0, 7);
        // Active families expected contribution
        const activeFamilies = await family_model_js_1.Family.find({ status: 'ACTIVE' }, 'monthlyContribution');
        const expectedCollection = activeFamilies.reduce((sum, f) => sum + (f.monthlyContribution || 250), 0);
        // Monthly payments collected
        const collectedMonthlyAgg = await payment_model_js_1.Payment.aggregate([
            { $match: { month: currentMonth, type: 'MONTHLY', status: 'PAID' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const collectedMonthly = collectedMonthlyAgg[0]?.total || 0;
        // Pending payments for the month
        const pendingMonthly = Math.max(0, expectedCollection - collectedMonthly);
        // Donations for the month
        const donationsAgg = await payment_model_js_1.Payment.aggregate([
            { $match: { type: 'DONATION', status: 'PAID' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const totalDonations = donationsAgg[0]?.total || 0;
        // Zakat collections
        const zakatAgg = await payment_model_js_1.Payment.aggregate([
            { $match: { type: { $in: ['ZAKAT', 'FITRAH'] }, status: 'PAID' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const totalZakat = zakatAgg[0]?.total || 0;
        // Total income
        const allIncomeAgg = await payment_model_js_1.Payment.aggregate([
            { $match: { status: 'PAID' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const totalIncome = allIncomeAgg[0]?.total || 0;
        // Total expenses
        const allExpensesAgg = await expense_model_js_1.Expense.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const totalExpenses = allExpensesAgg[0]?.total || 0;
        const netBalance = totalIncome - totalExpenses;
        // Monthly collection trend (last 6 months)
        const monthlyTrend = await payment_model_js_1.Payment.aggregate([
            { $match: { status: 'PAID', month: { $exists: true, $ne: null } } },
            { $group: { _id: '$month', amount: { $sum: '$amount' } } },
            { $sort: { _id: 1 } },
            { $limit: 6 },
        ]);
        // Expenses category breakdown
        const expensesByCategory = await expense_model_js_1.Expense.aggregate([
            { $group: { _id: '$category', total: { $sum: '$amount' } } },
        ]);
        return {
            currentMonth,
            totalIncome,
            collectedMonthly,
            pendingMonthly,
            expectedCollection,
            totalExpenses,
            balance: netBalance,
            cards: {
                expectedCollection,
                collected: collectedMonthly,
                collectedMonthly,
                pending: pendingMonthly,
                pendingMonthly,
                donations: totalDonations,
                zakat: totalZakat,
                totalIncome,
                expenses: totalExpenses,
                totalExpenses,
                balance: netBalance,
            },
            charts: {
                monthlyTrend: monthlyTrend.map((m) => ({ month: m._id, amount: m.amount })),
                expensesByCategory: expensesByCategory.map((e) => ({ category: e._id, amount: e.total })),
            },
        };
    }
    static async listExpenses(query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
        const skip = (page - 1) * limit;
        const filter = {};
        if (query.category)
            filter.category = query.category;
        const [items, total] = await Promise.all([
            expense_model_js_1.Expense.find(filter)
                .populate('recordedBy', 'name email')
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit),
            expense_model_js_1.Expense.countDocuments(filter),
        ]);
        return { items, page, limit, total };
    }
    static async recordExpense(data) {
        const expenseNumber = `EXP-${Date.now().toString().slice(-6)}`;
        const title = data.title || data.description || 'General Mahall Expense';
        let category = (data.category || 'OTHER').toString().toUpperCase();
        if (category === 'SALARY')
            category = 'SALARIES';
        const expense = await expense_model_js_1.Expense.create({
            expenseNumber,
            title,
            description: data.description || data.title,
            category,
            amount: Number(data.amount),
            recordedBy: data.recordedBy,
            date: data.date || new Date(),
        });
        return expense;
    }
}
exports.FinanceService = FinanceService;
