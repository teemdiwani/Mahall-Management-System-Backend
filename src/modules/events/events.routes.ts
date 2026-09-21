import { Router } from 'express';
import { EventsController } from './events.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';

const router = Router();

// Public / Member event listing
router.get('/', EventsController.list);
router.get('/:id', EventsController.getById);

// Register for event requires authenticated user
router.post('/:id/register', authenticate, EventsController.register);

// Create event requires events.manage
router.post('/', authenticate, requirePermission(PERMISSIONS.EVENTS_MANAGE), EventsController.create);

export default router;
