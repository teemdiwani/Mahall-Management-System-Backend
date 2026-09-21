"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = void 0;
const auditLog_model_js_1 = require("../modules/auditLogs/auditLog.model.js");
const logger_js_1 = require("../utils/logger.js");
const logAudit = async (req, action, resource, resourceId, oldValue, newValue) => {
    try {
        await auditLog_model_js_1.AuditLog.create({
            actorId: req.user?._id,
            actorEmail: req.user?.email || 'SYSTEM',
            action,
            resource,
            resourceId,
            oldValue,
            newValue,
            ip: req.ip || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'],
            timestamp: new Date(),
        });
    }
    catch (err) {
        logger_js_1.logger.error(err, 'Failed to write audit log:');
    }
};
exports.logAudit = logAudit;
