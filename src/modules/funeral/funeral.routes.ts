import { Router } from 'express';
import { Funeral } from './funeral.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const list = await Funeral.find().sort({ dateOfDeath: -1 });
    return ApiResponse.success(res, list);
  } catch (error) {
    next(error);
  }
});

router.post('/', requirePermission(PERMISSIONS.FUNERAL_MANAGE), async (req, res, next) => {
  try {
    const item = await Funeral.create(req.body);
    return ApiResponse.success(res, item, 201, 'Funeral record registered');
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', requirePermission(PERMISSIONS.FUNERAL_MANAGE), async (req, res, next) => {
  try {
    const item = await Funeral.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, cemeteryPlotNumber: req.body.cemeteryPlotNumber },
      { new: true }
    );
    return ApiResponse.success(res, item, 200, 'Funeral record updated');
  } catch (error) {
    next(error);
  }
});

export default router;
