import type { Request, Response, NextFunction } from 'express';
import { PaymentsService } from './payments.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { logAudit } from '../../middleware/auditLogger.js';

export class PaymentsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PaymentsService.listPayments(req.query);
      return ApiResponse.paginate(res, result.items, result.page, result.limit, result.total);
    } catch (error) {
      next(error);
    }
  }

  static async getMyPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await PaymentsService.getMyPayments(req.user!._id.toString());
      return ApiResponse.success(res, payments);
    } catch (error) {
      next(error);
    }
  }

  static async generateMonthly(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, amount } = req.body;
      const currentMonth = month || new Date().toISOString().slice(0, 7);
      const result = await PaymentsService.generateMonthlyContributions(currentMonth, amount || 250);

      await logAudit(
        req,
        'MONTHLY_DUES_GENERATED',
        'Payment',
        currentMonth,
        null,
        result
      );

      return ApiResponse.success(res, result, 201, `Monthly contributions generated for ${currentMonth}`);
    } catch (error) {
      next(error);
    }
  }

  static async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await PaymentsService.verifyPayment(
        req.params.id as string,
        req.body,
        req.user!._id.toString()
      );

      await logAudit(
        req,
        'PAYMENT_VERIFIED',
        'Payment',
        payment._id.toString(),
        { status: 'PENDING' },
        { status: 'PAID', receiptNumber: payment.receiptNumber }
      );

      return ApiResponse.success(res, payment, 200, 'Payment verified and receipt issued');
    } catch (error) {
      next(error);
    }
  }

  static async recordDirect(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await PaymentsService.recordDirectPayment({
        ...req.body,
        verifiedByUserId: req.user!._id.toString(),
      });

      await logAudit(
        req,
        'DIRECT_PAYMENT_RECORDED',
        'Payment',
        payment._id.toString(),
        null,
        { amount: payment.amount, receiptNumber: payment.receiptNumber }
      );

      return ApiResponse.success(res, payment, 201, 'Payment recorded successfully');
    } catch (error) {
      next(error);
    }
  }
}
