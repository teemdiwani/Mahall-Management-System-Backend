"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_js_1 = require("./dashboard.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const authorize_js_1 = require("../../middleware/authorize.js");
const roles_js_1 = require("../../constants/roles.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// Admin Dashboard - Super Admin & Secretary
router.get('/admin', (0, authorize_js_1.requireRole)(roles_js_1.ROLES.SUPER_ADMIN, roles_js_1.ROLES.SECRETARY), dashboard_controller_js_1.DashboardController.getAdminDashboard);
router.get('/stats', (0, authorize_js_1.requireRole)(roles_js_1.ROLES.SUPER_ADMIN, roles_js_1.ROLES.SECRETARY, roles_js_1.ROLES.TREASURER), dashboard_controller_js_1.DashboardController.getDashboardStats);
router.get('/charts', (0, authorize_js_1.requireRole)(roles_js_1.ROLES.SUPER_ADMIN, roles_js_1.ROLES.SECRETARY, roles_js_1.ROLES.TREASURER), dashboard_controller_js_1.DashboardController.getDashboardCharts);
// Member Dashboard - All authenticated members
router.get('/member', dashboard_controller_js_1.DashboardController.getMemberDashboard);
router.post('/member/link-family', dashboard_controller_js_1.DashboardController.linkFamilyByPhone);
// Treasurer Dashboard
router.get('/treasurer', (0, authorize_js_1.requireRole)(roles_js_1.ROLES.SUPER_ADMIN, roles_js_1.ROLES.TREASURER), dashboard_controller_js_1.DashboardController.getTreasurerDashboard);
// Secretary Dashboard
router.get('/secretary', (0, authorize_js_1.requireRole)(roles_js_1.ROLES.SUPER_ADMIN, roles_js_1.ROLES.SECRETARY), dashboard_controller_js_1.DashboardController.getSecretaryDashboard);
// Welfare Dashboard
router.get('/welfare', (0, authorize_js_1.requireRole)(roles_js_1.ROLES.SUPER_ADMIN, roles_js_1.ROLES.WELFARE_OFFICER), dashboard_controller_js_1.DashboardController.getWelfareDashboard);
// Madrasa Dashboard
router.get('/madrasa', (0, authorize_js_1.requireRole)(roles_js_1.ROLES.SUPER_ADMIN, roles_js_1.ROLES.SECRETARY, roles_js_1.ROLES.MADRASA_ADMIN), dashboard_controller_js_1.DashboardController.getMadrasaDashboard);
// Imam Dashboard
router.get('/imam', (0, authorize_js_1.requireRole)(roles_js_1.ROLES.SUPER_ADMIN, roles_js_1.ROLES.IMAM), dashboard_controller_js_1.DashboardController.getImamDashboard);
exports.default = router;
