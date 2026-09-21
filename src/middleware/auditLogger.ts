import type { Request } from 'express';
import { AuditLog } from '../modules/auditLogs/auditLog.model.js';
import { logger } from '../utils/logger.js';

export const logAudit = async (
  req: Request,
  action: string,
  resource: string,
  resourceId?: string,
  oldValue?: unknown,
  newValue?: unknown
) => {
  try {
    await AuditLog.create({
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
  } catch (err) {
    logger.error(err, 'Failed to write audit log:');
  }
};
