"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_js_1 = require("./users.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const authorize_js_1 = require("../../middleware/authorize.js");
const roles_js_1 = require("../../constants/roles.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// View users - Super Admin & Secretary
router.get('/', (0, authorize_js_1.requireRole)(roles_js_1.ROLES.SUPER_ADMIN, roles_js_1.ROLES.SECRETARY), users_controller_js_1.UsersController.list);
router.get('/:id', (0, authorize_js_1.requireRole)(roles_js_1.ROLES.SUPER_ADMIN, roles_js_1.ROLES.SECRETARY), users_controller_js_1.UsersController.getById);
// Update Role - ONLY SUPER ADMIN (RULE 3)
router.patch('/:id/role', (0, authorize_js_1.requireRole)(roles_js_1.ROLES.SUPER_ADMIN), users_controller_js_1.UsersController.updateRole);
// Update Status - ONLY SUPER ADMIN
router.patch('/:id/status', (0, authorize_js_1.requireRole)(roles_js_1.ROLES.SUPER_ADMIN), users_controller_js_1.UsersController.updateStatus);
exports.default = router;
