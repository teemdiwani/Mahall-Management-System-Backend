import { Router } from 'express';
import { CommitteeController } from './committee.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';

const router = Router();

router.use(authenticate);

router.get('/members', CommitteeController.listMembers);
router.get('/meetings', CommitteeController.listMeetings);
router.post('/meetings', requirePermission(PERMISSIONS.COMMITTEE_MANAGE), CommitteeController.scheduleMeeting);
router.patch('/meetings/:id/minutes', requirePermission(PERMISSIONS.COMMITTEE_MANAGE), CommitteeController.updateMinutes);

export default router;
