import { Router } from 'express';
import { NotificationsController } from './notifications.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', NotificationsController.getMy);
router.patch('/:id/read', NotificationsController.markRead);
router.post('/mark-all-read', NotificationsController.markAllRead);

export default router;
