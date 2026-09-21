"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const familyChangeRequest_controller_js_1 = require("./familyChangeRequest.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const authorize_js_1 = require("../../middleware/authorize.js");
const permissions_js_1 = require("../../constants/permissions.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// List & get requests
router.get('/', familyChangeRequest_controller_js_1.FamilyChangeRequestController.list);
router.get('/:id', familyChangeRequest_controller_js_1.FamilyChangeRequestController.getById);
// Submit request (Family Head or Staff)
router.post('/', familyChangeRequest_controller_js_1.FamilyChangeRequestController.create);
// Review & Approval (Secretary / Super Admin)
router.post('/:id/approve', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.FAMILIES_APPROVE_REQUESTS), familyChangeRequest_controller_js_1.FamilyChangeRequestController.approve);
router.post('/:id/reject', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.FAMILIES_APPROVE_REQUESTS), familyChangeRequest_controller_js_1.FamilyChangeRequestController.reject);
exports.default = router;
