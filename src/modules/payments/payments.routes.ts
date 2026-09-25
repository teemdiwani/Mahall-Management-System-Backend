import { Router } from 'express';
import { PaymentsController } from './payments.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';

const router = Router();

router.use(authenticate);

// Member's own payments
router.get('/my-payments', PaymentsController.getMyPayments);

// Automated 28th monthly dues trigger (checks date >= 28 or can be called explicitly)
router.post('/trigger-28th-dues', PaymentsController.trigger28thDues);

// Razorpay Online Payment Integration
router.post('/:id/razorpay-order', PaymentsController.createRazorpayOrder);
router.post('/:id/verify-razorpay', PaymentsController.verifyRazorpayPayment);

// Official Mahallu Invoice
router.get('/:id/invoice', PaymentsController.getInvoice);

// All payments listing (Treasurer, Admin)
router.get('/', requirePermission(PERMISSIONS.FINANCE_VIEW), PaymentsController.list);

// Batch generate monthly contributions
router.post('/generate-monthly', requirePermission(PERMISSIONS.FINANCE_CREATE_PAYMENT), PaymentsController.generateMonthly);

// Verify pending payment
router.patch('/:id/verify', requirePermission(PERMISSIONS.FINANCE_VERIFY_PAYMENT), PaymentsController.verify);

// Record direct/offline payment
router.post('/record', requirePermission(PERMISSIONS.FINANCE_CREATE_PAYMENT), PaymentsController.recordDirect);

export default router;
