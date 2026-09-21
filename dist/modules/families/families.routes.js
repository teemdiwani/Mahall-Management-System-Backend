"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const families_controller_js_1 = require("./families.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const authorize_js_1 = require("../../middleware/authorize.js");
const permissions_js_1 = require("../../constants/permissions.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// Member self route
router.get('/my-family', families_controller_js_1.FamiliesController.getMyFamily);
// List families - requires families.view
router.get('/', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.FAMILIES_VIEW), families_controller_js_1.FamiliesController.list);
// Get specific family
router.get('/:id', families_controller_js_1.FamiliesController.getById);
// Create family - requires families.create
router.post('/', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.FAMILIES_CREATE), families_controller_js_1.FamiliesController.create);
// Update family - requires families.update
router.patch('/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.FAMILIES_UPDATE), families_controller_js_1.FamiliesController.update);
// Archive family - requires families.delete
router.delete('/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.FAMILIES_DELETE), families_controller_js_1.FamiliesController.archive);
// Family Members CRUD
router.get('/:id/members', families_controller_js_1.FamiliesController.getMembers);
router.post('/:id/members', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.FAMILIES_MANAGE_MEMBERS), families_controller_js_1.FamiliesController.addMember);
router.patch('/:id/members/:memberId', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.FAMILIES_MANAGE_MEMBERS), families_controller_js_1.FamiliesController.updateMember);
router.delete('/:id/members/:memberId', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.FAMILIES_MANAGE_MEMBERS), families_controller_js_1.FamiliesController.removeMember);
exports.default = router;
