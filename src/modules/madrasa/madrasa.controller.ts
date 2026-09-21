import type { Request, Response, NextFunction } from 'express';
import { MadrasaService } from './madrasa.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class MadrasaController {
  static async getDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MadrasaService.getMadrasaDashboard();
      return ApiResponse.success(res, data);
    } catch (error) { next(error); }
  }

  static async listClasses(_req: Request, res: Response, next: NextFunction) {
    try {
      const classes = await MadrasaService.listClasses();
      return ApiResponse.success(res, classes);
    } catch (error) { next(error); }
  }

  static async createClass(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await MadrasaService.createClass(req.body);
      return ApiResponse.success(res, created, 201, 'Class created successfully');
    } catch (error) { next(error); }
  }

  static async updateClass(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await MadrasaService.updateClass(req.params.id as string, req.body);
      return ApiResponse.success(res, updated, 200, 'Class updated');
    } catch (error) { next(error); }
  }

  static async deleteClass(req: Request, res: Response, next: NextFunction) {
    try {
      await MadrasaService.deleteClass(req.params.id as string);
      return ApiResponse.success(res, null, 200, 'Class deleted');
    } catch (error) { next(error); }
  }

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

  static async listTeachers(_req: Request, res: Response, next: NextFunction) {
    try {
      const teachers = await MadrasaService.listTeachers();
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

  static async listAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MadrasaService.listAttendance(req.query);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }

  static async recordAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MadrasaService.recordAttendance({ ...req.body, recordedBy: req.user!._id });
      return ApiResponse.success(res, result, 201, 'Attendance recorded');
    } catch (error) { next(error); }
  }

  static async listExams(_req: Request, res: Response, next: NextFunction) {
    try {
      const exams = await MadrasaService.listExams();
      return ApiResponse.success(res, exams);
    } catch (error) { next(error); }
  }

  static async createExam(req: Request, res: Response, next: NextFunction) {
    try {
      const exam = await MadrasaService.createExam(req.body);
      return ApiResponse.success(res, exam, 201, 'Exam created');
    } catch (error) { next(error); }
  }

  static async recordResults(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MadrasaService.recordResults(req.params.id as string, req.body.results);
      return ApiResponse.success(res, result, 200, 'Results recorded');
    } catch (error) { next(error); }
  }

  static async getResults(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MadrasaService.getResults(req.params.id as string);
      return ApiResponse.success(res, result);
    } catch (error) { next(error); }
  }
}
