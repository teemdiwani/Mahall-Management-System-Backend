"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const events_controller_js_1 = require("./events.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const authorize_js_1 = require("../../middleware/authorize.js");
const permissions_js_1 = require("../../constants/permissions.js");
const router = (0, express_1.Router)();
// Public / Member event listing
router.get('/', events_controller_js_1.EventsController.list);
router.get('/:id', events_controller_js_1.EventsController.getById);
// Register for event requires authenticated user
router.post('/:id/register', auth_js_1.authenticate, events_controller_js_1.EventsController.register);
// Create event requires events.manage
router.post('/', auth_js_1.authenticate, (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.EVENTS_MANAGE), events_controller_js_1.EventsController.create);
exports.default = router;
