"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const madrasa_controller_js_1 = require("./madrasa.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const authorize_js_1 = require("../../middleware/authorize.js");
const permissions_js_1 = require("../../constants/permissions.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// Dashboard
router.get('/dashboard', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.getDashboard);
// Classes
router.get('/classes', madrasa_controller_js_1.MadrasaController.listClasses);
router.post('/classes', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.createClass);
router.patch('/classes/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.updateClass);
router.delete('/classes/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.deleteClass);
// Students
router.get('/students', madrasa_controller_js_1.MadrasaController.listStudents);
router.post('/students', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.createStudent);
router.patch('/students/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.updateStudent);
// Teachers (stored on MadrasaClass.teacherName — virtual teacher directory)
router.get('/teachers', madrasa_controller_js_1.MadrasaController.listTeachers);
router.post('/teachers', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.createTeacher);
router.patch('/teachers/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.updateTeacher);
// Attendance
router.get('/attendance', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_ATTENDANCE), madrasa_controller_js_1.MadrasaController.listAttendance);
router.post('/attendance', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_ATTENDANCE), madrasa_controller_js_1.MadrasaController.recordAttendance);
// Exams & Results
router.get('/exams', madrasa_controller_js_1.MadrasaController.listExams);
router.post('/exams', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_GRADES), madrasa_controller_js_1.MadrasaController.createExam);
router.post('/exams/:id/results', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_GRADES), madrasa_controller_js_1.MadrasaController.recordResults);
router.get('/exams/:id/results', madrasa_controller_js_1.MadrasaController.getResults);
exports.default = router;
