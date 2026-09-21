import { Router } from 'express';
import { VolunteersController } from './volunteers.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';

const router = Router();

router.use(authenticate);

router.get('/', VolunteersController.list);
router.post('/register', VolunteersController.register);
router.patch('/:id/availability', requirePermission(PERMISSIONS.VOLUNTEERS_MANAGE), VolunteersController.updateAvailability);
router.patch('/:id/status', requirePermission(PERMISSIONS.VOLUNTEERS_MANAGE), VolunteersController.updateStatus);

export default router;
