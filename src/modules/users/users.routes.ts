import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/authorize.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

router.use(authenticate);

// View users - Super Admin & Secretary
router.get('/', requireRole(ROLES.SUPER_ADMIN, ROLES.SECRETARY), UsersController.list);
router.get('/:id', requireRole(ROLES.SUPER_ADMIN, ROLES.SECRETARY), UsersController.getById);

// Update Role - ONLY SUPER ADMIN (RULE 3)
router.patch('/:id/role', requireRole(ROLES.SUPER_ADMIN), UsersController.updateRole);

// Update Status - ONLY SUPER ADMIN
router.patch('/:id/status', requireRole(ROLES.SUPER_ADMIN), UsersController.updateStatus);

export default router;
