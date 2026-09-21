import { Router } from 'express';
import { ApplicationsController } from './applications.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';

const router = Router();

router.use(authenticate);

// List applications (scoped to user role)
router.get('/', ApplicationsController.list);

// Get application by ID with timeline history
router.get('/:id', ApplicationsController.getById);

// Submit new application
router.post('/', ApplicationsController.submit);

// Update status (review / approve / reject / complete)
router.patch(
  '/:id/status',
  requirePermission(PERMISSIONS.APPLICATIONS_REVIEW),
  ApplicationsController.updateStatus
);

export default router;
