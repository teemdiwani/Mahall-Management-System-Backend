"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MadrasaController = void 0;
const madrasa_service_js_1 = require("./madrasa.service.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
const apiError_js_1 = require("../../utils/apiError.js");
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
    static async listMadrasas(_req, res, next) {
        try {
            const data = await madrasa_service_js_1.MadrasaService.listMadrasas();
            return apiResponse_js_1.ApiResponse.success(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getMadrasaById(req, res, next) {
        try {
            const data = await madrasa_service_js_1.MadrasaService.getMadrasaById(req.params.id);
            if (!data)
                throw apiError_js_1.ApiError.notFound('Madrasa not found');
            return apiResponse_js_1.ApiResponse.success(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async createMadrasa(req, res, next) {
        try {
            const created = await madrasa_service_js_1.MadrasaService.createMadrasa(req.body);
            return apiResponse_js_1.ApiResponse.success(res, created, 201, 'Madrasa created successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async updateMadrasa(req, res, next) {
        try {
            const updated = await madrasa_service_js_1.MadrasaService.updateMadrasa(req.params.id, req.body);
            return apiResponse_js_1.ApiResponse.success(res, updated, 200, 'Madrasa updated');
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteMadrasa(req, res, next) {
        try {
            await madrasa_service_js_1.MadrasaService.deleteMadrasa(req.params.id);
            return apiResponse_js_1.ApiResponse.success(res, null, 200, 'Madrasa deleted');
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
    static async deleteStudent(req, res, next) {
        try {
            await madrasa_service_js_1.MadrasaService.deleteStudent(req.params.id);
            return apiResponse_js_1.ApiResponse.success(res, null, 200, 'Student deleted');
        }
        catch (error) {
            next(error);
        }
    }
    static async listTeachers(req, res, next) {
        try {
            const teachers = await madrasa_service_js_1.MadrasaService.listTeachers(req.query);
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
    static async deleteTeacher(req, res, next) {
        try {
            await madrasa_service_js_1.MadrasaService.deleteTeacher(req.params.id);
            return apiResponse_js_1.ApiResponse.success(res, null, 200, 'Teacher deleted');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MadrasaController = MadrasaController;
