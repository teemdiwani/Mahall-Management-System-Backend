"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const announcements_controller_js_1 = require("./announcements.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const authorize_js_1 = require("../../middleware/authorize.js");
const permissions_js_1 = require("../../constants/permissions.js");
const router = (0, express_1.Router)();
// Publicly viewable or authenticated
router.get('/', announcements_controller_js_1.AnnouncementsController.list);
router.post('/', auth_js_1.authenticate, (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.ANNOUNCEMENTS_MANAGE), announcements_controller_js_1.AnnouncementsController.create);
router.patch('/:id/archive', auth_js_1.authenticate, (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.ANNOUNCEMENTS_MANAGE), announcements_controller_js_1.AnnouncementsController.archive);
exports.default = router;
