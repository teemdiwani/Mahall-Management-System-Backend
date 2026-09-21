"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MadrasaController = void 0;
const madrasa_service_js_1 = require("./madrasa.service.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
class MadrasaController {
    static async getDashboard(_req, res, next) {
        try {
            const data = await madrasa_service_js_1.MadrasaService.getMadrasaDashboard();
            return apiResponse_js_1.ApiResponse.success(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async listClasses(_req, res, next) {
        try {
            const classes = await madrasa_service_js_1.MadrasaService.listClasses();
            return apiResponse_js_1.ApiResponse.success(res, classes);
        }
        catch (error) {
            next(error);
        }
    }
    static async createClass(req, res, next) {
        try {
            const created = await madrasa_service_js_1.MadrasaService.createClass(req.body);
            return apiResponse_js_1.ApiResponse.success(res, created, 201, 'Class created successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async updateClass(req, res, next) {
        try {
            const updated = await madrasa_service_js_1.MadrasaService.updateClass(req.params.id, req.body);
            return apiResponse_js_1.ApiResponse.success(res, updated, 200, 'Class updated');
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteClass(req, res, next) {
        try {
            await madrasa_service_js_1.MadrasaService.deleteClass(req.params.id);
            return apiResponse_js_1.ApiResponse.success(res, null, 200, 'Class deleted');
        }
        catch (error) {
            next(error);
        }
    }
    static async listStudents(req, res, next) {
        try {
            const result = await madrasa_service_js_1.MadrasaService.listStudents(req.user.role, req.user._id.toString(), req.query);
            return apiResponse_js_1.ApiResponse.paginate(res, result.items, result.page, result.limit, result.total);
        }
        catch (error) {
            next(error);
        }
    }
    static async createStudent(req, res, next) {
        try {
            const student = await madrasa_service_js_1.MadrasaService.createStudent(req.body);
            return apiResponse_js_1.ApiResponse.success(res, student, 201, 'Student enrolled successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async updateStudent(req, res, next) {
        try {
            const updated = await madrasa_service_js_1.MadrasaService.updateStudent(req.params.id, req.body);
            return apiResponse_js_1.ApiResponse.success(res, updated, 200, 'Student updated');
        }
        catch (error) {
            next(error);
        }
    }
    static async listTeachers(_req, res, next) {
        try {
            const teachers = await madrasa_service_js_1.MadrasaService.listTeachers();
            return apiResponse_js_1.ApiResponse.success(res, teachers);
        }
        catch (error) {
            next(error);
        }
    }
    static async createTeacher(req, res, next) {
        try {
            const teacher = await madrasa_service_js_1.MadrasaService.createTeacher(req.body);
            return apiResponse_js_1.ApiResponse.success(res, teacher, 201, 'Teacher added');
        }
        catch (error) {
            next(error);
        }
    }
    static async updateTeacher(req, res, next) {
        try {
            const updated = await madrasa_service_js_1.MadrasaService.updateTeacher(req.params.id, req.body);
            return apiResponse_js_1.ApiResponse.success(res, updated, 200, 'Teacher updated');
        }
        catch (error) {
            next(error);
        }
    }
    static async listAttendance(req, res, next) {
        try {
            const result = await madrasa_service_js_1.MadrasaService.listAttendance(req.query);
            return apiResponse_js_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async recordAttendance(req, res, next) {
        try {
            const result = await madrasa_service_js_1.MadrasaService.recordAttendance({ ...req.body, recordedBy: req.user._id });
            return apiResponse_js_1.ApiResponse.success(res, result, 201, 'Attendance recorded');
        }
        catch (error) {
            next(error);
        }
    }
    static async listExams(_req, res, next) {
        try {
            const exams = await madrasa_service_js_1.MadrasaService.listExams();
            return apiResponse_js_1.ApiResponse.success(res, exams);
        }
        catch (error) {
            next(error);
        }
    }
    static async createExam(req, res, next) {
        try {
            const exam = await madrasa_service_js_1.MadrasaService.createExam(req.body);
            return apiResponse_js_1.ApiResponse.success(res, exam, 201, 'Exam created');
        }
        catch (error) {
            next(error);
        }
    }
    static async recordResults(req, res, next) {
        try {
            const result = await madrasa_service_js_1.MadrasaService.recordResults(req.params.id, req.body.results);
            return apiResponse_js_1.ApiResponse.success(res, result, 200, 'Results recorded');
        }
        catch (error) {
            next(error);
        }
    }
    static async getResults(req, res, next) {
        try {
            const result = await madrasa_service_js_1.MadrasaService.getResults(req.params.id);
            return apiResponse_js_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MadrasaController = MadrasaController;
