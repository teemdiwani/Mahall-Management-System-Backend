import { Router } from 'express';
import { FinanceController } from './finance.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';

const router = Router();

router.use(authenticate);

router.get('/overview', requirePermission(PERMISSIONS.FINANCE_VIEW), FinanceController.getOverview);
router.get('/expenses', requirePermission(PERMISSIONS.FINANCE_VIEW), FinanceController.listExpenses);
router.post('/expenses', requirePermission(PERMISSIONS.FINANCE_CREATE_EXPENSE), FinanceController.recordExpense);

export default router;
