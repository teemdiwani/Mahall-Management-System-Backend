"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const welfare_controller_js_1 = require("./welfare.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const authorize_js_1 = require("../../middleware/authorize.js");
const permissions_js_1 = require("../../constants/permissions.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// Dashboard summary
router.get('/dashboard', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.WELFARE_VIEW), welfare_controller_js_1.WelfareController.getDashboard);
// Welfare Cases (backed by Application model with type WELFARE/ZAKAT/SCHOLARSHIP/MEDICAL)
router.get('/cases', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.WELFARE_VIEW), welfare_controller_js_1.WelfareController.listCases);
router.post('/cases', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.WELFARE_MANAGE), welfare_controller_js_1.WelfareController.createCase);
router.patch('/cases/:id/status', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.WELFARE_MANAGE), welfare_controller_js_1.WelfareController.updateCaseStatus);
// Beneficiaries — approved/completed welfare recipients
router.get('/beneficiaries', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.WELFARE_VIEW), welfare_controller_js_1.WelfareController.listBeneficiaries);
// Zakat fund summary and distribution records
router.get('/zakat', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.WELFARE_VIEW), welfare_controller_js_1.WelfareController.getZakatSummary);
router.post('/zakat/distribute', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.WELFARE_DISTRIBUTE), welfare_controller_js_1.WelfareController.distributeZakat);
exports.default = router;
