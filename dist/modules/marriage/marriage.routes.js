"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const marriage_model_js_1 = require("./marriage.model.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
const auth_js_1 = require("../../middleware/auth.js");
const authorize_js_1 = require("../../middleware/authorize.js");
const permissions_js_1 = require("../../constants/permissions.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
router.get('/', async (req, res, next) => {
    try {
        const list = await marriage_model_js_1.Marriage.find().sort({ nikahDate: -1 });
        return apiResponse_js_1.ApiResponse.success(res, list);
    }
    catch (error) {
        next(error);
    }
});
router.post('/', async (req, res, next) => {
    try {
        const certificateNumber = `NIK-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
        const item = await marriage_model_js_1.Marriage.create({
            ...req.body,
            certificateNumber,
            status: 'REQUESTED',
        });
        return apiResponse_js_1.ApiResponse.success(res, item, 201, 'Marriage service requested');
    }
    catch (error) {
        next(error);
    }
});
router.patch('/:id/status', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MARRIAGE_MANAGE), async (req, res, next) => {
    try {
        const item = await marriage_model_js_1.Marriage.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        return apiResponse_js_1.ApiResponse.success(res, item, 200, 'Marriage status updated');
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
