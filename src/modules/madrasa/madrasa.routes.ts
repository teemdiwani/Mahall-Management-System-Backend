import { Router } from 'express';
import { MadrasaController } from './madrasa.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';

const router = Router();

router.use(authenticate);

// ─── Parent Portal (Accessible to Parents / Members) ─────────────────────────
router.get('/parent-portal', MadrasaController.getParentPortal);

// ─── Desk Dashboard ─────────────────────────────────────────────────────────
router.get('/dashboard', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.getDashboard);

// ─── Madrasa Institutions ───────────────────────────────────────────────────
router.get('/madrasas', MadrasaController.listMadrasas);
router.get('/madrasas/:id', MadrasaController.getMadrasaById);
router.post('/madrasas', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.createMadrasa);
router.patch('/madrasas/:id', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.updateMadrasa);
router.delete('/madrasas/:id', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.deleteMadrasa);

// ─── Classes (1-10 or 1-12 Standards) ───────────────────────────────────────
router.get('/classes', MadrasaController.listClasses);
router.post('/classes', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.createClass);
router.patch('/classes/:id', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.updateClass);
router.delete('/classes/:id', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.deleteClass);

// ─── Timetables (Secretary Uploads & Manages Class-wise) ─────────────────────
router.get('/timetables', MadrasaController.listTimetables);
router.get('/timetables/class/:classId', MadrasaController.getTimetableByClass);
router.post('/timetables', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.saveTimetable);
router.delete('/timetables/:id', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.deleteTimetable);

// ─── Exam Results (Entered by Madrasa Manager) ──────────────────────────────
router.get('/results', MadrasaController.listResults);
router.post('/results', requirePermission(PERMISSIONS.MADRASA_GRADES), MadrasaController.createResult);
router.patch('/results/:id', requirePermission(PERMISSIONS.MADRASA_GRADES), MadrasaController.updateResult);
router.delete('/results/:id', requirePermission(PERMISSIONS.MADRASA_GRADES), MadrasaController.deleteResult);

// ─── Monthly Student Fees & Fee Alerts ───────────────────────────────────────
router.get('/fees', MadrasaController.listFees);
router.post('/fees', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.recordFeePayment);
router.patch('/fees/:id', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.updateFeeStatus);

// ─── Student Attendance ─────────────────────────────────────────────────────
router.get('/attendance', MadrasaController.listAttendance);
router.post('/attendance', requirePermission(PERMISSIONS.MADRASA_ATTENDANCE), MadrasaController.recordAttendance);

// ─── Official Madrasa Announcements (Parent / Student Notices) ───────────────
router.get('/announcements', MadrasaController.listAnnouncements);
router.post('/announcements', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.createAnnouncement);
router.delete('/announcements/:id', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.deleteAnnouncement);

// ─── Students Roster ─────────────────────────────────────────────────────────
router.get('/students', MadrasaController.listStudents);
router.post('/students', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.createStudent);
router.patch('/students/:id', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.updateStudent);
router.delete('/students/:id', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.deleteStudent);

// ─── Usthad Faculty ─────────────────────────────────────────────────────────
router.get('/teachers', MadrasaController.listTeachers);
router.post('/teachers', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.createTeacher);
router.patch('/teachers/:id', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.updateTeacher);
router.delete('/teachers/:id', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.deleteTeacher);

export default router;
