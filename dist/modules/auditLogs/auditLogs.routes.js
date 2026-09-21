"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auditLog_model_js_1 = require("./auditLog.model.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
const auth_js_1 = require("../../middleware/auth.js");
const authorize_js_1 = require("../../middleware/authorize.js");
const roles_js_1 = require("../../constants/roles.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// View audit logs - ONLY SUPER ADMIN
router.get('/', (0, authorize_js_1.requireRole)(roles_js_1.ROLES.SUPER_ADMIN), async (req, res, next) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30));
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            auditLog_model_js_1.AuditLog.find()
                .populate('actorId', 'name email role')
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit),
            auditLog_model_js_1.AuditLog.countDocuments(),
        ]);
        return apiResponse_js_1.ApiResponse.paginate(res, items, page, limit, total);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
