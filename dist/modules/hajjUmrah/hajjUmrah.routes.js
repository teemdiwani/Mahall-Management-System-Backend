"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hajjUmrah_controller_js_1 = require("./hajjUmrah.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const authorize_js_1 = require("../../middleware/authorize.js");
const permissions_js_1 = require("../../constants/permissions.js");
const router = (0, express_1.Router)();
// Public / General View routes
router.get('/posts', hajjUmrah_controller_js_1.HajjUmrahController.listPosts);
router.get('/posts/:id', hajjUmrah_controller_js_1.HajjUmrahController.getPostById);
router.get('/stats', hajjUmrah_controller_js_1.HajjUmrahController.getStats);
// Member Registration & Self-view (Requires Authenticated Session)
router.post('/posts/:id/register', auth_js_1.authenticate, hajjUmrah_controller_js_1.HajjUmrahController.register);
router.get('/my-registrations', auth_js_1.authenticate, hajjUmrah_controller_js_1.HajjUmrahController.getMyRegistrations);
// Secretary / Super Admin Management Routes (Requires hajj_umrah.manage)
router.post('/posts', auth_js_1.authenticate, (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.HAJJ_UMRAH_MANAGE), hajjUmrah_controller_js_1.HajjUmrahController.createPost);
router.patch('/posts/:id', auth_js_1.authenticate, (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.HAJJ_UMRAH_MANAGE), hajjUmrah_controller_js_1.HajjUmrahController.updatePost);
router.delete('/posts/:id', auth_js_1.authenticate, (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.HAJJ_UMRAH_MANAGE), hajjUmrah_controller_js_1.HajjUmrahController.deletePost);
router.get('/registrations', auth_js_1.authenticate, (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.HAJJ_UMRAH_MANAGE), hajjUmrah_controller_js_1.HajjUmrahController.listRegistrations);
router.patch('/registrations/:id/status', auth_js_1.authenticate, (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.HAJJ_UMRAH_MANAGE), hajjUmrah_controller_js_1.HajjUmrahController.updateRegistrationStatus);
router.post('/registrations/:id/resend-email', auth_js_1.authenticate, (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.HAJJ_UMRAH_MANAGE), hajjUmrah_controller_js_1.HajjUmrahController.resendEmail);
exports.default = router;
