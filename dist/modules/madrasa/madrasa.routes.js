"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const madrasa_controller_js_1 = require("./madrasa.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const authorize_js_1 = require("../../middleware/authorize.js");
const permissions_js_1 = require("../../constants/permissions.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// ─── Parent Portal (Accessible to Parents / Members) ─────────────────────────
router.get('/parent-portal', madrasa_controller_js_1.MadrasaController.getParentPortal);
// ─── Desk Dashboard ─────────────────────────────────────────────────────────
router.get('/dashboard', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.getDashboard);
// ─── Madrasa Institutions ───────────────────────────────────────────────────
router.get('/madrasas', madrasa_controller_js_1.MadrasaController.listMadrasas);
router.get('/madrasas/:id', madrasa_controller_js_1.MadrasaController.getMadrasaById);
router.post('/madrasas', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.createMadrasa);
router.patch('/madrasas/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.updateMadrasa);
router.delete('/madrasas/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.deleteMadrasa);
// ─── Classes (1-10 or 1-12 Standards) ───────────────────────────────────────
router.get('/classes', madrasa_controller_js_1.MadrasaController.listClasses);
router.post('/classes', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.createClass);
router.patch('/classes/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.updateClass);
router.delete('/classes/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.deleteClass);
// ─── Timetables (Secretary Uploads & Manages Class-wise) ─────────────────────
router.get('/timetables', madrasa_controller_js_1.MadrasaController.listTimetables);
router.get('/timetables/class/:classId', madrasa_controller_js_1.MadrasaController.getTimetableByClass);
router.post('/timetables', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.saveTimetable);
router.delete('/timetables/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.deleteTimetable);
// ─── Exam Results (Entered by Madrasa Manager) ──────────────────────────────
router.get('/results', madrasa_controller_js_1.MadrasaController.listResults);
router.post('/results', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_GRADES), madrasa_controller_js_1.MadrasaController.createResult);
router.patch('/results/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_GRADES), madrasa_controller_js_1.MadrasaController.updateResult);
router.delete('/results/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_GRADES), madrasa_controller_js_1.MadrasaController.deleteResult);
// ─── Monthly Student Fees & Fee Alerts ───────────────────────────────────────
router.get('/fees', madrasa_controller_js_1.MadrasaController.listFees);
router.post('/fees', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.recordFeePayment);
router.patch('/fees/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.updateFeeStatus);
router.post('/fees/:id/razorpay-order', madrasa_controller_js_1.MadrasaController.createRazorpayOrder);
router.post('/fees/:id/verify-razorpay', madrasa_controller_js_1.MadrasaController.verifyRazorpayPayment);
router.get('/fees/:id/invoice', madrasa_controller_js_1.MadrasaController.getFeeInvoice);
// ─── Student Attendance ─────────────────────────────────────────────────────
router.get('/attendance', madrasa_controller_js_1.MadrasaController.listAttendance);
router.post('/attendance', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_ATTENDANCE), madrasa_controller_js_1.MadrasaController.recordAttendance);
// ─── Official Madrasa Announcements (Parent / Student Notices) ───────────────
router.get('/announcements', madrasa_controller_js_1.MadrasaController.listAnnouncements);
router.post('/announcements', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.createAnnouncement);
router.delete('/announcements/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.deleteAnnouncement);
// ─── Students Roster ─────────────────────────────────────────────────────────
router.get('/students', madrasa_controller_js_1.MadrasaController.listStudents);
router.post('/students', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.createStudent);
router.patch('/students/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.updateStudent);
router.delete('/students/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.deleteStudent);
// ─── Usthad Faculty ─────────────────────────────────────────────────────────
router.get('/teachers', madrasa_controller_js_1.MadrasaController.listTeachers);
router.post('/teachers', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.createTeacher);
router.patch('/teachers/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.updateTeacher);
router.delete('/teachers/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.deleteTeacher);
exports.default = router;
