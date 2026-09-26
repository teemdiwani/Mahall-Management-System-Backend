import { Payment } from '../payments/payment.model.js';
import { Expense } from './expense.model.js';
import { Family } from '../families/family.model.js';

export class FinanceService {
  static async getFinancialOverview(month?: string) {
    const currentMonth = month || new Date().toISOString().slice(0, 7);

    // Active families expected contribution
    const activeFamilies = await Family.find({ status: 'ACTIVE' }, 'monthlyContribution');
    const expectedCollection = activeFamilies.reduce((sum, f) => sum + (f.monthlyContribution || 250), 0);

    // Monthly payments collected
    const collectedMonthlyAgg = await Payment.aggregate([
      { $match: { month: currentMonth, type: 'MONTHLY', status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const collectedMonthly = collectedMonthlyAgg[0]?.total || 0;

    // Pending payments for the month
    const pendingMonthly = Math.max(0, expectedCollection - collectedMonthly);

    // Donations for the month
    const donationsAgg = await Payment.aggregate([
      { $match: { type: 'DONATION', status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalDonations = donationsAgg[0]?.total || 0;

    // Zakat collections
    const zakatAgg = await Payment.aggregate([
      { $match: { type: { $in: ['ZAKAT', 'FITRAH'] }, status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalZakat = zakatAgg[0]?.total || 0;

    // Total income
    const allIncomeAgg = await Payment.aggregate([
      { $match: { status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalIncome = allIncomeAgg[0]?.total || 0;

    // Total expenses
    const allExpensesAgg = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalExpenses = allExpensesAgg[0]?.total || 0;

    const netBalance = totalIncome - totalExpenses;

    // Monthly collection trend (last 6 months)
    const monthlyTrend = await Payment.aggregate([
      { $match: { status: 'PAID', month: { $exists: true, $ne: null } } },
      { $group: { _id: '$month', amount: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
      { $limit: 6 },
    ]);

    // Expenses category breakdown
    const expensesByCategory = await Expense.aggregate([
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

  static async listExpenses(query: { page?: number; limit?: number; category?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (query.category) filter.category = query.category;

    const [items, total] = await Promise.all([
      Expense.find(filter)
        .populate('recordedBy', 'name email')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Expense.countDocuments(filter),
    ]);

    return { items, page, limit, total };
  }

  static async recordExpense(data: {
    title?: string;
    description?: string;
    category: any;
    amount: number;
    recordedBy: string;
    date?: Date;
    vendor?: string;
  }) {
    const expenseNumber = `EXP-${Date.now().toString().slice(-6)}`;
    const title = data.title || data.description || 'General Mahall Expense';
    let category = (data.category || 'OTHER').toString().toUpperCase();
    if (category === 'SALARY') category = 'SALARIES';

    const expense = await Expense.create({
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
