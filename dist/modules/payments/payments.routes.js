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
// All payments listing (Treasurer, Admin)
router.get('/', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.FINANCE_VIEW), payments_controller_js_1.PaymentsController.list);
// Batch generate monthly contributions
router.post('/generate-monthly', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.FINANCE_CREATE_PAYMENT), payments_controller_js_1.PaymentsController.generateMonthly);
// Verify pending payment
router.patch('/:id/verify', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.FINANCE_VERIFY_PAYMENT), payments_controller_js_1.PaymentsController.verify);
// Record direct/offline payment
router.post('/record', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.FINANCE_CREATE_PAYMENT), payments_controller_js_1.PaymentsController.recordDirect);
exports.default = router;
