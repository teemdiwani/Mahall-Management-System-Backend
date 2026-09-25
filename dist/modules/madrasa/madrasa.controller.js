"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MadrasaController = void 0;
const madrasa_service_js_1 = require("./madrasa.service.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
const apiError_js_1 = require("../../utils/apiError.js");
class MadrasaController {
    // ─── Dashboard ─────────────────────────────────────────────────────────────
    static async getDashboard(_req, res, next) {
        try {
            const data = await madrasa_service_js_1.MadrasaService.getMadrasaDashboard();
            return apiResponse_js_1.ApiResponse.success(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    // ─── Parent Portal ─────────────────────────────────────────────────────────
    static async getParentPortal(req, res, next) {
        try {
            const userId = req.user._id.toString();
            const email = req.user.email;
            const data = await madrasa_service_js_1.MadrasaService.getParentPortal(userId, email);
            return apiResponse_js_1.ApiResponse.success(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    // ─── Madrasas (Institutions) ───────────────────────────────────────────────
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
    // ─── Classes (1 to 10 or 12 Standards) ─────────────────────────────────────
    static async listClasses(req, res, next) {
        try {
            const data = await madrasa_service_js_1.MadrasaService.listClasses(req.query);
            return apiResponse_js_1.ApiResponse.success(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async createClass(req, res, next) {
        try {
            const data = await madrasa_service_js_1.MadrasaService.createClass(req.body);
            return apiResponse_js_1.ApiResponse.success(res, data, 201, 'Class created successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async updateClass(req, res, next) {
        try {
            const data = await madrasa_service_js_1.MadrasaService.updateClass(req.params.id, req.body);
            return apiResponse_js_1.ApiResponse.success(res, data, 200, 'Class updated successfully');
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
    // ─── Timetables (Secretary Uploads / Manages Class-wise) ───────────────────
    static async listTimetables(req, res, next) {
        try {
            const data = await madrasa_service_js_1.MadrasaService.listTimetables(req.query);
            return apiResponse_js_1.ApiResponse.success(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getTimetableByClass(req, res, next) {
        try {
            const data = await madrasa_service_js_1.MadrasaService.getTimetableByClass(req.params.classId);
            return apiResponse_js_1.ApiResponse.success(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async saveTimetable(req, res, next) {
        try {
            const data = await madrasa_service_js_1.MadrasaService.saveTimetable({
                ...req.body,
                uploadedBy: req.user.name || 'Madrasa Secretary',
            });
            return apiResponse_js_1.ApiResponse.success(res, data, 200, 'Class timetable saved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteTimetable(req, res, next) {
        try {
            await madrasa_service_js_1.MadrasaService.deleteTimetable(req.params.id);
            return apiResponse_js_1.ApiResponse.success(res, null, 200, 'Timetable deleted');
        }
        catch (error) {
            next(error);
        }
    }
    // ─── Exam Results (Entered by Madrasa Manager) ────────────────────────────
    static async listResults(req, res, next) {
        try {
            const data = await madrasa_service_js_1.MadrasaService.listResults(req.query);
            return apiResponse_js_1.ApiResponse.success(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async createResult(req, res, next) {
        try {
            const data = await madrasa_service_js_1.MadrasaService.createResult({
                ...req.body,
                enteredBy: req.user.name || 'Madrasa Manager',
            });
            return apiResponse_js_1.ApiResponse.success(res, data, 201, 'Exam result published successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async updateResult(req, res, next) {
        try {
            const data = await madrasa_service_js_1.MadrasaService.updateResult(req.params.id, req.body);
            return apiResponse_js_1.ApiResponse.success(res, data, 200, 'Result updated');
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteResult(req, res, next) {
        try {
            await madrasa_service_js_1.MadrasaService.deleteResult(req.params.id);
            return apiResponse_js_1.ApiResponse.success(res, null, 200, 'Result deleted');
        }
        catch (error) {
            next(error);
        }
    }
    // ─── Monthly Student Fees & Fee Alerts ─────────────────────────────────────
    static async listFees(req, res, next) {
        try {
            const data = await madrasa_service_js_1.MadrasaService.listFees(req.query);
            return apiResponse_js_1.ApiResponse.success(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async recordFeePayment(req, res, next) {
        try {
            const data = await madrasa_service_js_1.MadrasaService.recordFeePayment({
                ...req.body,
                collectedBy: req.user.name || 'Madrasa Desk',
            });
            return apiResponse_js_1.ApiResponse.success(res, data, 201, 'Fee payment recorded successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async updateFeeStatus(req, res, next) {
        try {
            const data = await madrasa_service_js_1.MadrasaService.updateFeeStatus(req.params.id, req.body);
            return apiResponse_js_1.ApiResponse.success(res, data, 200, 'Fee status updated');
        }
        catch (error) {
            next(error);
        }
    }
    // ─── Student Attendance ───────────────────────────────────────────────────
    static async listAttendance(req, res, next) {
        try {
            const data = await madrasa_service_js_1.MadrasaService.listAttendance(req.query);
            return apiResponse_js_1.ApiResponse.success(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async recordAttendance(req, res, next) {
        try {
            const data = await madrasa_service_js_1.MadrasaService.recordAttendance(req.body);
            return apiResponse_js_1.ApiResponse.success(res, data, 200, 'Attendance recorded');
        }
        catch (error) {
            next(error);
        }
    }
    // ─── Madrasa Announcements (Parent / Student Notices) ──────────────────────
    static async listAnnouncements(req, res, next) {
        try {
            const data = await madrasa_service_js_1.MadrasaService.listAnnouncements(req.query);
            return apiResponse_js_1.ApiResponse.success(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async createAnnouncement(req, res, next) {
        try {
            const data = await madrasa_service_js_1.MadrasaService.createAnnouncement({
                ...req.body,
                publishedBy: req.user.name || 'Madrasa Office',
            });
            return apiResponse_js_1.ApiResponse.success(res, data, 201, 'Announcement published successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteAnnouncement(req, res, next) {
        try {
            await madrasa_service_js_1.MadrasaService.deleteAnnouncement(req.params.id);
            return apiResponse_js_1.ApiResponse.success(res, null, 200, 'Announcement removed');
        }
        catch (error) {
            next(error);
        }
    }
    // ─── Students Roster ───────────────────────────────────────────────────────
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
    // ─── Usthad Faculty Teachers ──────────────────────────────────────────────
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
