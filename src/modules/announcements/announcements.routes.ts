import { Router } from 'express';
import { AnnouncementsController } from './announcements.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';

const router = Router();

// Publicly viewable or authenticated
router.get('/', AnnouncementsController.list);

router.post(
  '/',
  authenticate,
  requirePermission(PERMISSIONS.ANNOUNCEMENTS_MANAGE),
  AnnouncementsController.create
);

router.patch(
  '/:id/archive',
  authenticate,
  requirePermission(PERMISSIONS.ANNOUNCEMENTS_MANAGE),
  AnnouncementsController.archive
);

export default router;
