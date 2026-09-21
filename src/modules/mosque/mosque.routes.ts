import { Router } from 'express';
import { MosqueController } from './mosque.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';

const router = Router();

// Mosque info is publicly viewable
router.get('/', MosqueController.getInfo);

// Updating timings requires authentication & permission
router.patch('/timings', authenticate, requirePermission(PERMISSIONS.MOSQUE_MANAGE), MosqueController.updateTimings);

// Updating programs requires authentication & permission
router.put('/programs', authenticate, requirePermission(PERMISSIONS.MOSQUE_MANAGE), MosqueController.updatePrograms);

export default router;

