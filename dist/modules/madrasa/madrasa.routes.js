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
// Madrasas (Institutions in this Mahallu)
router.get('/madrasas', madrasa_controller_js_1.MadrasaController.listMadrasas);
router.get('/madrasas/:id', madrasa_controller_js_1.MadrasaController.getMadrasaById);
router.post('/madrasas', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.createMadrasa);
router.patch('/madrasas/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.updateMadrasa);
router.delete('/madrasas/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.deleteMadrasa);
// Students Roster
router.get('/students', madrasa_controller_js_1.MadrasaController.listStudents);
router.post('/students', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.createStudent);
router.patch('/students/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.updateStudent);
router.delete('/students/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.deleteStudent);
// Teachers (Faculty Usthads)
router.get('/teachers', madrasa_controller_js_1.MadrasaController.listTeachers);
router.post('/teachers', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.createTeacher);
router.patch('/teachers/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.updateTeacher);
router.delete('/teachers/:id', (0, authorize_js_1.requirePermission)(permissions_js_1.PERMISSIONS.MADRASA_MANAGE), madrasa_controller_js_1.MadrasaController.deleteTeacher);
exports.default = router;
