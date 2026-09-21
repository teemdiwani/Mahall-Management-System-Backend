import { Router } from 'express';
import { Marriage } from './marriage.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const list = await Marriage.find().sort({ nikahDate: -1 });
    return ApiResponse.success(res, list);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const certificateNumber = `NIK-${new Date().getFullYear()}-${String(
      Math.floor(1000 + Math.random() * 9000)
    )}`;
    const item = await Marriage.create({
      ...req.body,
      certificateNumber,
      status: 'REQUESTED',
    });
    return ApiResponse.success(res, item, 201, 'Marriage service requested');
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', requirePermission(PERMISSIONS.MARRIAGE_MANAGE), async (req, res, next) => {
  try {
    const item = await Marriage.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    return ApiResponse.success(res, item, 200, 'Marriage status updated');
  } catch (error) {
    next(error);
  }
});

export default router;
