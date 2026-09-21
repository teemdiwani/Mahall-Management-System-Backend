import { Router } from 'express';
import { FamilyChangeRequestController } from './familyChangeRequest.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';

const router = Router();

router.use(authenticate);

// List & get requests
router.get('/', FamilyChangeRequestController.list);
router.get('/:id', FamilyChangeRequestController.getById);

// Submit request (Family Head or Staff)
router.post('/', FamilyChangeRequestController.create);

// Review & Approval (Secretary / Super Admin)
router.post(
  '/:id/approve',
  requirePermission(PERMISSIONS.FAMILIES_APPROVE_REQUESTS),
  FamilyChangeRequestController.approve
);

router.post(
  '/:id/reject',
  requirePermission(PERMISSIONS.FAMILIES_APPROVE_REQUESTS),
  FamilyChangeRequestController.reject
);

export default router;
