import { Router } from 'express';
import { MadrasaController } from './madrasa.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';

const router = Router();

router.use(authenticate);

// Dashboard
router.get('/dashboard', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.getDashboard);

// Classes
router.get('/classes', MadrasaController.listClasses);
router.post('/classes', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.createClass);
router.patch('/classes/:id', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.updateClass);
router.delete('/classes/:id', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.deleteClass);

// Students
router.get('/students', MadrasaController.listStudents);
router.post('/students', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.createStudent);
router.patch('/students/:id', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.updateStudent);

// Teachers (stored on MadrasaClass.teacherName — virtual teacher directory)
router.get('/teachers', MadrasaController.listTeachers);
router.post('/teachers', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.createTeacher);
router.patch('/teachers/:id', requirePermission(PERMISSIONS.MADRASA_MANAGE), MadrasaController.updateTeacher);

// Attendance
router.get('/attendance', requirePermission(PERMISSIONS.MADRASA_ATTENDANCE), MadrasaController.listAttendance);
router.post('/attendance', requirePermission(PERMISSIONS.MADRASA_ATTENDANCE), MadrasaController.recordAttendance);

// Exams & Results
router.get('/exams', MadrasaController.listExams);
router.post('/exams', requirePermission(PERMISSIONS.MADRASA_GRADES), MadrasaController.createExam);
router.post('/exams/:id/results', requirePermission(PERMISSIONS.MADRASA_GRADES), MadrasaController.recordResults);
router.get('/exams/:id/results', MadrasaController.getResults);

export default router;
