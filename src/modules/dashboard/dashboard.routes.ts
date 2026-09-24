import { Router } from 'express';
import { DashboardController } from './dashboard.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/authorize.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

router.use(authenticate);

// Admin Dashboard - Super Admin & Secretary
router.get('/admin', requireRole(ROLES.SUPER_ADMIN, ROLES.SECRETARY), DashboardController.getAdminDashboard);
router.get('/stats', requireRole(ROLES.SUPER_ADMIN, ROLES.SECRETARY, ROLES.TREASURER), DashboardController.getDashboardStats);
router.get('/charts', requireRole(ROLES.SUPER_ADMIN, ROLES.SECRETARY, ROLES.TREASURER), DashboardController.getDashboardCharts);

// Member Dashboard - All authenticated members
router.get('/member', DashboardController.getMemberDashboard);

// Treasurer Dashboard
router.get('/treasurer', requireRole(ROLES.SUPER_ADMIN, ROLES.TREASURER), DashboardController.getTreasurerDashboard);

// Secretary Dashboard
router.get('/secretary', requireRole(ROLES.SUPER_ADMIN, ROLES.SECRETARY), DashboardController.getSecretaryDashboard);

// Welfare Dashboard
router.get('/welfare', requireRole(ROLES.SUPER_ADMIN, ROLES.WELFARE_OFFICER), DashboardController.getWelfareDashboard);

// Madrasa Dashboard
router.get('/madrasa', requireRole(ROLES.SUPER_ADMIN, ROLES.SECRETARY, ROLES.MADRASA_ADMIN), DashboardController.getMadrasaDashboard);

// Imam Dashboard
router.get('/imam', requireRole(ROLES.SUPER_ADMIN, ROLES.IMAM), DashboardController.getImamDashboard);

export default router;
