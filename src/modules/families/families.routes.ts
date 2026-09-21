import { Router } from 'express';
import { FamiliesController } from './families.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';

const router = Router();

router.use(authenticate);

// Member self route
router.get('/my-family', FamiliesController.getMyFamily);

// List families - requires families.view
router.get('/', requirePermission(PERMISSIONS.FAMILIES_VIEW), FamiliesController.list);

// Get specific family
router.get('/:id', FamiliesController.getById);

// Create family - requires families.create
router.post('/', requirePermission(PERMISSIONS.FAMILIES_CREATE), FamiliesController.create);

// Update family - requires families.update
router.patch('/:id', requirePermission(PERMISSIONS.FAMILIES_UPDATE), FamiliesController.update);

// Archive family - requires families.delete
router.delete('/:id', requirePermission(PERMISSIONS.FAMILIES_DELETE), FamiliesController.archive);

// Family Members CRUD
router.get('/:id/members', FamiliesController.getMembers);
router.post('/:id/members', requirePermission(PERMISSIONS.FAMILIES_MANAGE_MEMBERS), FamiliesController.addMember);
router.patch('/:id/members/:memberId', requirePermission(PERMISSIONS.FAMILIES_MANAGE_MEMBERS), FamiliesController.updateMember);
router.delete('/:id/members/:memberId', requirePermission(PERMISSIONS.FAMILIES_MANAGE_MEMBERS), FamiliesController.removeMember);

export default router;
