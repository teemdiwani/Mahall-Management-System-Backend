"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payments_controller_js_1 = require("./payments.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const authorize_js_1 = require("../../middleware/authorize.js");
const permissions_js_1 = require("../../constants/permissions.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// Member's own payments
router.get('/my-payments', payments_controller_js_1.PaymentsController.getMyPayments);
// Automated 28th monthly dues trigger (checks date >= 28 or can be called explicitly)
router.post('/trigger-28th-dues', payments_controller_js_1.PaymentsController.trigger28thDues);
// Razorpay Online Payment Integration
router.post('/contribute-online', payments_controller_js_1.PaymentsController.contributeOnline);
router.post('/:id/razorpay-order', payments_controller_js_1.PaymentsController.createRazorpayOrder);
router.post('/:id/verify-razorpay', payments_controller_js_1.PaymentsController.verifyRazorpayPayment);
// Official Mahallu Invoice
router.get('/:id/invoice', payments_controller_js_1.PaymentsController.getInvoice);
// All payments listing (Treasurer, Admin)
router.get('/', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.FINANCE_VIEW), payments_controller_js_1.PaymentsController.list);
// Batch generate monthly contributions
router.post('/generate-monthly', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.FINANCE_CREATE_PAYMENT), payments_controller_js_1.PaymentsController.generateMonthly);
// Verify pending payment
router.patch('/:id/verify', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.FINANCE_VERIFY_PAYMENT), payments_controller_js_1.PaymentsController.verify);
// Record direct/offline payment
router.post('/record', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.FINANCE_CREATE_PAYMENT), payments_controller_js_1.PaymentsController.recordDirect);
exports.default = router;
