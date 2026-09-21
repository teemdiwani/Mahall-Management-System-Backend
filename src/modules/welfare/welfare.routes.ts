import { Router } from 'express';
import { WelfareController } from './welfare.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';

const router = Router();

router.use(authenticate);

// Dashboard summary
router.get('/dashboard', requirePermission(PERMISSIONS.WELFARE_VIEW), WelfareController.getDashboard);

// Welfare Cases (backed by Application model with type WELFARE/ZAKAT/SCHOLARSHIP/MEDICAL)
router.get('/cases', requirePermission(PERMISSIONS.WELFARE_VIEW), WelfareController.listCases);
router.post('/cases', requirePermission(PERMISSIONS.WELFARE_MANAGE), WelfareController.createCase);
router.patch('/cases/:id/status', requirePermission(PERMISSIONS.WELFARE_MANAGE), WelfareController.updateCaseStatus);

// Beneficiaries — approved/completed welfare recipients
router.get('/beneficiaries', requirePermission(PERMISSIONS.WELFARE_VIEW), WelfareController.listBeneficiaries);

// Zakat fund summary and distribution records
router.get('/zakat', requirePermission(PERMISSIONS.WELFARE_VIEW), WelfareController.getZakatSummary);
router.post('/zakat/distribute', requirePermission(PERMISSIONS.WELFARE_DISTRIBUTE), WelfareController.distributeZakat);

export default router;
