import { Router } from 'express';
import { MembersController } from './members.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';

const router = Router();

router.use(authenticate);

// View members & search
router.get('/search', MembersController.search);
router.get('/', requirePermission(PERMISSIONS.MEMBERS_VIEW), MembersController.list);
router.get('/:id', requirePermission(PERMISSIONS.MEMBERS_VIEW), MembersController.getById);

// Create member
router.post('/', requirePermission(PERMISSIONS.MEMBERS_CREATE), MembersController.create);

// Update member
router.patch('/:id', requirePermission(PERMISSIONS.MEMBERS_UPDATE), MembersController.update);

// Transfer member
router.post('/:id/transfer', requirePermission(PERMISSIONS.MEMBERS_UPDATE), MembersController.transfer);

// Deactivate member
router.delete('/:id', requirePermission(PERMISSIONS.MEMBERS_DELETE), MembersController.delete);

export default router;
