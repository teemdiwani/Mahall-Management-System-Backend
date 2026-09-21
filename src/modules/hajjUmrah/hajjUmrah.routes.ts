import { Router } from 'express';
import { HajjUmrahController } from './hajjUmrah.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';

const router = Router();

// Public / General View routes
router.get('/posts', HajjUmrahController.listPosts);
router.get('/posts/:id', HajjUmrahController.getPostById);
router.get('/stats', HajjUmrahController.getStats);

// Member Registration & Self-view (Requires Authenticated Session)
router.post('/posts/:id/register', authenticate, HajjUmrahController.register);
router.get('/my-registrations', authenticate, HajjUmrahController.getMyRegistrations);

// Secretary / Super Admin Management Routes (Requires hajj_umrah.manage)
router.post(
  '/posts',
  authenticate,
  requirePermission(PERMISSIONS.HAJJ_UMRAH_MANAGE),
  HajjUmrahController.createPost
);

router.patch(
  '/posts/:id',
  authenticate,
  requirePermission(PERMISSIONS.HAJJ_UMRAH_MANAGE),
  HajjUmrahController.updatePost
);

router.delete(
  '/posts/:id',
  authenticate,
  requirePermission(PERMISSIONS.HAJJ_UMRAH_MANAGE),
  HajjUmrahController.deletePost
);

router.get(
  '/registrations',
  authenticate,
  requirePermission(PERMISSIONS.HAJJ_UMRAH_MANAGE),
  HajjUmrahController.listRegistrations
);

router.patch(
  '/registrations/:id/status',
  authenticate,
  requirePermission(PERMISSIONS.HAJJ_UMRAH_MANAGE),
  HajjUmrahController.updateRegistrationStatus
);

router.post(
  '/registrations/:id/resend-email',
  authenticate,
  requirePermission(PERMISSIONS.HAJJ_UMRAH_MANAGE),
  HajjUmrahController.resendEmail
);

export default router;
