import { Router } from 'express';
import { PaymentsController } from './payments.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';

const router = Router();

router.use(authenticate);

// Member's own payments
router.get('/my-payments', PaymentsController.getMyPayments);

// All payments listing (Treasurer, Admin)
router.get('/', requirePermission(PERMISSIONS.FINANCE_VIEW), PaymentsController.list);

// Batch generate monthly contributions
router.post('/generate-monthly', requirePermission(PERMISSIONS.FINANCE_CREATE_PAYMENT), PaymentsController.generateMonthly);

// Verify pending payment
router.patch('/:id/verify', requirePermission(PERMISSIONS.FINANCE_VERIFY_PAYMENT), PaymentsController.verify);

// Record direct/offline payment
router.post('/record', requirePermission(PERMISSIONS.FINANCE_CREATE_PAYMENT), PaymentsController.recordDirect);

export default router;
