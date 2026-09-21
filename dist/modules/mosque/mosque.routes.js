"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mosque_controller_js_1 = require("./mosque.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const authorize_js_1 = require("../../middleware/authorize.js");
const permissions_js_1 = require("../../constants/permissions.js");
const router = (0, express_1.Router)();
// Mosque info is publicly viewable
router.get('/', mosque_controller_js_1.MosqueController.getInfo);
// Updating timings requires authentication & permission
router.patch('/timings', auth_js_1.authenticate, (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MOSQUE_MANAGE), mosque_controller_js_1.MosqueController.updateTimings);
// Updating programs requires authentication & permission
router.put('/programs', auth_js_1.authenticate, (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MOSQUE_MANAGE), mosque_controller_js_1.MosqueController.updatePrograms);
exports.default = router;
