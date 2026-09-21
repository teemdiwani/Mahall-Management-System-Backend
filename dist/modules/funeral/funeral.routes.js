"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const funeral_model_js_1 = require("./funeral.model.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
const auth_js_1 = require("../../middleware/auth.js");
const authorize_js_1 = require("../../middleware/authorize.js");
const permissions_js_1 = require("../../constants/permissions.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
router.get('/', async (req, res, next) => {
    try {
        const list = await funeral_model_js_1.Funeral.find().sort({ dateOfDeath: -1 });
        return apiResponse_js_1.ApiResponse.success(res, list);
    }
    catch (error) {
        next(error);
    }
});
router.post('/', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.FUNERAL_MANAGE), async (req, res, next) => {
    try {
        const item = await funeral_model_js_1.Funeral.create(req.body);
        return apiResponse_js_1.ApiResponse.success(res, item, 201, 'Funeral record registered');
    }
    catch (error) {
        next(error);
    }
});
router.patch('/:id/status', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.FUNERAL_MANAGE), async (req, res, next) => {
    try {
        const item = await funeral_model_js_1.Funeral.findByIdAndUpdate(req.params.id, { status: req.body.status, cemeteryPlotNumber: req.body.cemeteryPlotNumber }, { new: true });
        return apiResponse_js_1.ApiResponse.success(res, item, 200, 'Funeral record updated');
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
