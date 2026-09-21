import { Router } from 'express';
import { Member } from '../members/member.model.js';
import { Family } from '../families/family.model.js';
import { Payment } from '../payments/payment.model.js';
import { Expense } from '../finance/expense.model.js';
import { Application } from '../applications/application.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/authorize.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

router.use(authenticate);

// Reports accessible to Super Admin, Secretary, Treasurer
router.get(
  '/summary',
  requireRole(ROLES.SUPER_ADMIN, ROLES.SECRETARY, ROLES.TREASURER),
  async (_req, res, next) => {
    try {
      const [membersCount, familiesCount, paymentsAgg, expensesAgg, applicationsAgg] =
        await Promise.all([
          Member.countDocuments(),
          Family.countDocuments(),
          Payment.aggregate([
            { $match: { status: 'PAID' } },
            { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
          ]),
          Expense.aggregate([
            { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
          ]),
          Application.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ]),
        ]);

      return ApiResponse.success(res, {
        membersCount,
        familiesCount,
        incomeByType: paymentsAgg,
        expensesByCategory: expensesAgg,
        applicationsByStatus: applicationsAgg,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
