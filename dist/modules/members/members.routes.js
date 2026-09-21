"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const members_controller_js_1 = require("./members.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const authorize_js_1 = require("../../middleware/authorize.js");
const permissions_js_1 = require("../../constants/permissions.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// View members & search
router.get('/search', members_controller_js_1.MembersController.search);
router.get('/', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MEMBERS_VIEW), members_controller_js_1.MembersController.list);
router.get('/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MEMBERS_VIEW), members_controller_js_1.MembersController.getById);
// Create member
router.post('/', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MEMBERS_CREATE), members_controller_js_1.MembersController.create);
// Update member
router.patch('/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MEMBERS_UPDATE), members_controller_js_1.MembersController.update);
// Transfer member
router.post('/:id/transfer', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MEMBERS_UPDATE), members_controller_js_1.MembersController.transfer);
// Deactivate member
router.delete('/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MEMBERS_DELETE), members_controller_js_1.MembersController.delete);
exports.default = router;
