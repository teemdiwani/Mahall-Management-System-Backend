import type { Request, Response, NextFunction } from 'express';
import { MadrasaService } from './madrasa.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { ApiError } from '../../utils/apiError.js';

export class MadrasaController {
  // ─── Dashboard ─────────────────────────────────────────────────────────────
  static async getDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MadrasaService.getMadrasaDashboard();
      return ApiResponse.success(res, data);
    } catch (error) { next(error); }
  }

  // ─── Parent Portal ─────────────────────────────────────────────────────────
  static async getParentPortal(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const email = req.user!.email;
      const data = await MadrasaService.getParentPortal(userId, email);
      return ApiResponse.success(res, data);
    } catch (error) { next(error); }
  }

  // ─── Madrasas (Institutions) ───────────────────────────────────────────────
  static async listMadrasas(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MadrasaService.listMadrasas();
      return ApiResponse.success(res, data);
    } catch (error) { next(error); }
  }

  static async getMadrasaById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MadrasaService.getMadrasaById(req.params.id as string);
      if (!data) throw ApiError.notFound('Madrasa not found');
      return ApiResponse.success(res, data);
    } catch (error) { next(error); }
  }

  static async createMadrasa(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await MadrasaService.createMadrasa(req.body);
      return ApiResponse.success(res, created, 201, 'Madrasa created successfully');
    } catch (error) { next(error); }
  }

  static async updateMadrasa(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await MadrasaService.updateMadrasa(req.params.id as string, req.body);
      return ApiResponse.success(res, updated, 200, 'Madrasa updated');
    } catch (error) { next(error); }
  }

  static async deleteMadrasa(req: Request, res: Response, next: NextFunction) {
    try {
      await MadrasaService.deleteMadrasa(req.params.id as string);
      return ApiResponse.success(res, null, 200, 'Madrasa deleted');
    } catch (error) { next(error); }
  }

  // ─── Classes (1 to 10 or 12 Standards) ─────────────────────────────────────
  static async listClasses(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MadrasaService.listClasses(req.query);
      return ApiResponse.success(res, data);
    } catch (error) { next(error); }
  }

  static async createClass(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MadrasaService.createClass(req.body);
      return ApiResponse.success(res, data, 201, 'Class created successfully');
    } catch (error) { next(error); }
  }

  static async updateClass(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MadrasaService.updateClass(req.params.id as string, req.body);
      return ApiResponse.success(res, data, 200, 'Class updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteClass(req: Request, res: Response, next: NextFunction) {
    try {
      await MadrasaService.deleteClass(req.params.id as string);
      return ApiResponse.success(res, null, 200, 'Class deleted');
    } catch (error) { next(error); }
  }

  // ─── Timetables (Secretary Uploads / Manages Class-wise) ───────────────────
  static async listTimetables(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MadrasaService.listTimetables(req.query);
      return ApiResponse.success(res, data);
    } catch (error) { next(error); }
  }

  static async getTimetableByClass(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MadrasaService.getTimetableByClass(req.params.classId as string);
      return ApiResponse.success(res, data);
    } catch (error) { next(error); }
  }

  static async saveTimetable(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MadrasaService.saveTimetable({
        ...req.body,
        uploadedBy: req.user!.name || 'Madrasa Secretary',
      });
      return ApiResponse.success(res, data, 200, 'Class timetable saved successfully');
    } catch (error) { next(error); }
  }

  static async deleteTimetable(req: Request, res: Response, next: NextFunction) {
    try {
      await MadrasaService.deleteTimetable(req.params.id as string);
      return ApiResponse.success(res, null, 200, 'Timetable deleted');
    } catch (error) { next(error); }
  }

  // ─── Exam Results (Entered by Madrasa Manager) ────────────────────────────
  static async listResults(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MadrasaService.listResults(req.query);
      return ApiResponse.success(res, data);
    } catch (error) { next(error); }
  }

  static async createResult(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MadrasaService.createResult({
        ...req.body,
        enteredBy: req.user!.name || 'Madrasa Manager',
      });
      return ApiResponse.success(res, data, 201, 'Exam result published successfully');
    } catch (error) { next(error); }
  }

  static async updateResult(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MadrasaService.updateResult(req.params.id as string, req.body);
      return ApiResponse.success(res, data, 200, 'Result updated');
    } catch (error) { next(error); }
  }

  static async deleteResult(req: Request, res: Response, next: NextFunction) {
    try {
      await MadrasaService.deleteResult(req.params.id as string);
      return ApiResponse.success(res, null, 200, 'Result deleted');
    } catch (error) { next(error); }
  }

  // ─── Monthly Student Fees & Fee Alerts ─────────────────────────────────────
  static async listFees(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MadrasaService.listFees(req.query);
      return ApiResponse.success(res, data);
    } catch (error) { next(error); }
  }

  static async recordFeePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MadrasaService.recordFeePayment({
        ...req.body,
        collectedBy: req.user!.name || 'Madrasa Desk',
      });
      return ApiResponse.success(res, data, 201, 'Fee payment recorded successfully');
    } catch (error) { next(error); }
  }

  static async updateFeeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MadrasaService.updateFeeStatus(req.params.id as string, req.body);
      return ApiResponse.success(res, data, 200, 'Fee status updated');
    } catch (error) { next(error); }
  }

  // ─── Student Attendance ───────────────────────────────────────────────────
  static async listAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MadrasaService.listAttendance(req.query);
      return ApiResponse.success(res, data);
    } catch (error) { next(error); }
  }

  static async recordAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MadrasaService.recordAttendance(req.body);
      return ApiResponse.success(res, data, 200, 'Attendance recorded');
    } catch (error) { next(error); }
  }

  // ─── Madrasa Announcements (Parent / Student Notices) ──────────────────────
  static async listAnnouncements(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MadrasaService.listAnnouncements(req.query);
      return ApiResponse.success(res, data);
    } catch (error) { next(error); }
  }

  static async createAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MadrasaService.createAnnouncement({
        ...req.body,
        publishedBy: req.user!.name || 'Madrasa Office',
      });
      return ApiResponse.success(res, data, 201, 'Announcement published successfully');
    } catch (error) { next(error); }
  }

  static async deleteAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      await MadrasaService.deleteAnnouncement(req.params.id as string);
      return ApiResponse.success(res, null, 200, 'Announcement removed');
    } catch (error) { next(error); }
  }

  // ─── Students Roster ───────────────────────────────────────────────────────
  static async listStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MadrasaService.listStudents(req.user!.role, req.user!._id.toString(), req.query);
      return ApiResponse.paginate(res, result.items, result.page, result.limit, result.total);
    } catch (error) { next(error); }
  }

  static async createStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await MadrasaService.createStudent(req.body);
      return ApiResponse.success(res, student, 201, 'Student enrolled successfully');
    } catch (error) { next(error); }
  }

  static async updateStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await MadrasaService.updateStudent(req.params.id as string, req.body);
      return ApiResponse.success(res, updated, 200, 'Student updated');
    } catch (error) { next(error); }
  }

  static async deleteStudent(req: Request, res: Response, next: NextFunction) {
    try {
      await MadrasaService.deleteStudent(req.params.id as string);
      return ApiResponse.success(res, null, 200, 'Student deleted');
    } catch (error) { next(error); }
  }

  // ─── Usthad Faculty Teachers ──────────────────────────────────────────────
  static async listTeachers(req: Request, res: Response, next: NextFunction) {
    try {
      const teachers = await MadrasaService.listTeachers(req.query);
      return ApiResponse.success(res, teachers);
    } catch (error) { next(error); }
  }

  static async createTeacher(req: Request, res: Response, next: NextFunction) {
    try {
      const teacher = await MadrasaService.createTeacher(req.body);
      return ApiResponse.success(res, teacher, 201, 'Teacher added');
    } catch (error) { next(error); }
  }

  static async updateTeacher(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await MadrasaService.updateTeacher(req.params.id as string, req.body);
      return ApiResponse.success(res, updated, 200, 'Teacher updated');
    } catch (error) { next(error); }
  }

  static async deleteTeacher(req: Request, res: Response, next: NextFunction) {
    try {
      await MadrasaService.deleteTeacher(req.params.id as string);
      return ApiResponse.success(res, null, 200, 'Teacher deleted');
    } catch (error) { next(error); }
  }
}
