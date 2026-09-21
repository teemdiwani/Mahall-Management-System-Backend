import type { Request, Response, NextFunction } from 'express';
import { FinanceService } from './finance.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { logAudit } from '../../middleware/auditLogger.js';

export class FinanceController {
  static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const overview = await FinanceService.getFinancialOverview(req.query.month as string);
      return ApiResponse.success(res, overview);
    } catch (error) {
      next(error);
    }
  }

  static async listExpenses(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FinanceService.listExpenses(req.query);
      return ApiResponse.paginate(res, result.items, result.page, result.limit, result.total);
    } catch (error) {
      next(error);
    }
  }

  static async recordExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const expense = await FinanceService.recordExpense({
        ...req.body,
        recordedBy: req.user!._id.toString(),
      });

      await logAudit(
        req,
        'EXPENSE_RECORDED',
        'Expense',
        expense._id.toString(),
        null,
        { amount: expense.amount, category: expense.category }
      );

      return ApiResponse.success(res, expense, 201, 'Expense recorded successfully');
    } catch (error) {
      next(error);
    }
  }
}
