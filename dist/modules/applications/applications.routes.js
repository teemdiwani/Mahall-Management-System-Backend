"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const applications_controller_js_1 = require("./applications.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const authorize_js_1 = require("../../middleware/authorize.js");
const permissions_js_1 = require("../../constants/permissions.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// List applications (scoped to user role)
router.get('/', applications_controller_js_1.ApplicationsController.list);
// Get application by ID with timeline history
router.get('/:id', applications_controller_js_1.ApplicationsController.getById);
// Submit new application
router.post('/', applications_controller_js_1.ApplicationsController.submit);
// Update status (review / approve / reject / complete)
router.patch('/:id/status', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.APPLICATIONS_REVIEW), applications_controller_js_1.ApplicationsController.updateStatus);
exports.default = router;
