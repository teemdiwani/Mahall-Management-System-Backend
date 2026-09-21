import { Router } from 'express';
import { AuditLog } from './auditLog.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/authorize.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

router.use(authenticate);

// View audit logs - ONLY SUPER ADMIN
router.get('/', requireRole(ROLES.SUPER_ADMIN), async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      AuditLog.find()
        .populate('actorId', 'name email role')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(),
    ]);

    return ApiResponse.paginate(res, items, page, limit, total);
  } catch (error) {
    next(error);
  }
});

export default router;
