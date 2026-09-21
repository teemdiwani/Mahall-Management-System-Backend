import { Router } from 'express';
import { AssetsController } from './assets.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';

const router = Router();

router.use(authenticate);

router.get('/', AssetsController.list);
router.get('/stats', AssetsController.getStats);
router.post('/', requirePermission(PERMISSIONS.ASSETS_MANAGE), AssetsController.create);
router.patch('/:id', requirePermission(PERMISSIONS.ASSETS_MANAGE), AssetsController.update);

export default router;
