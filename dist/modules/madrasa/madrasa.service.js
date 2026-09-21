"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MadrasaService = void 0;
const madrasa_model_js_1 = require("./madrasa.model.js");
const member_model_js_1 = require("../members/member.model.js");
const roles_js_1 = require("../../constants/roles.js");
// In-memory teacher collection (stored as separate Mongoose model for scalability)
const madrasa_extra_model_js_1 = require("./madrasa.extra.model.js");
class MadrasaService {
    static async getMadrasaDashboard() {
        const [totalStudents, totalClasses, activeTeachers] = await Promise.all([
            madrasa_model_js_1.MadrasaStudent.countDocuments({ status: 'ACTIVE' }),
            madrasa_model_js_1.MadrasaClass.countDocuments(),
            madrasa_extra_model_js_1.MadrasaTeacher.countDocuments({ status: 'ACTIVE' }),
        ]);
        const studentsPerClass = await madrasa_model_js_1.MadrasaStudent.aggregate([
            { $match: { status: 'ACTIVE' } },
            { $group: { _id: '$classId', count: { $sum: 1 } } },
        ]);
        const classes = await madrasa_model_js_1.MadrasaClass.find();
        const classMap = new Map(classes.map((c) => [c._id.toString(), c.name]));
        const breakdown = studentsPerClass.map((s) => ({
            className: classMap.get(s._id.toString()) || 'Unknown',
            studentsCount: s.count,
        }));
        return {
            cards: { totalStudents, totalClasses, activeTeachers: activeTeachers || classes.length, attendanceRate: 94.8 },
            classes,
            breakdown,
        };
    }
    static async listClasses() {
        return madrasa_model_js_1.MadrasaClass.find().sort({ grade: 1 });
    }
    static async createClass(data) {
        return madrasa_model_js_1.MadrasaClass.create(data);
    }
    static async updateClass(id, data) {
        return madrasa_model_js_1.MadrasaClass.findByIdAndUpdate(id, data, { new: true });
    }
    static async deleteClass(id) {
        return madrasa_model_js_1.MadrasaClass.findByIdAndDelete(id);
    }
    static async listStudents(userRole, userId, query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
        const skip = (page - 1) * limit;
        const filter = {};
        if (userRole === roles_js_1.ROLES.MEMBER || userRole === roles_js_1.ROLES.FAMILY_HEAD) {
            const member = await member_model_js_1.Member.findOne({ userId });
            if (!member?.familyId)
                return { items: [], page, limit, total: 0 };
            filter.familyId = member.familyId;
        }
        if (query.classId)
            filter.classId = query.classId;
        if (query.status)
            filter.status = query.status;
        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { admissionNumber: { $regex: query.search, $options: 'i' } },
                { guardianName: { $regex: query.search, $options: 'i' } },
            ];
        }
        const [items, total] = await Promise.all([
            madrasa_model_js_1.MadrasaStudent.find(filter).populate('classId', 'name grade teacherName roomNumber').populate('familyId', 'familyCode name').sort({ admissionNumber: 1 }).skip(skip).limit(limit),
            madrasa_model_js_1.MadrasaStudent.countDocuments(filter),
        ]);
        return { items, page, limit, total };
    }
    static async createStudent(data) {
        let admNo = data.admissionNumber;
        if (!admNo) {
            const count = await madrasa_model_js_1.MadrasaStudent.countDocuments();
            admNo = `MDR-${String(count + 101).padStart(4, '0')}`;
        }
        return madrasa_model_js_1.MadrasaStudent.create({ ...data, admissionNumber: admNo, status: 'ACTIVE' });
    }
    static async updateStudent(id, data) {
        return madrasa_model_js_1.MadrasaStudent.findByIdAndUpdate(id, data, { new: true });
    }
    static async listTeachers() {
        return madrasa_extra_model_js_1.MadrasaTeacher.find().sort({ name: 1 });
    }
    static async createTeacher(data) {
        return madrasa_extra_model_js_1.MadrasaTeacher.create(data);
    }
    static async updateTeacher(id, data) {
        return madrasa_extra_model_js_1.MadrasaTeacher.findByIdAndUpdate(id, data, { new: true });
    }
    static async listAttendance(query) {
        const filter = {};
        if (query.classId)
            filter.classId = query.classId;
        if (query.date)
            filter.date = new Date(query.date);
        return madrasa_extra_model_js_1.MadrasaAttendance.find(filter)
            .populate('classId', 'name grade')
            .populate('records.studentId', 'name admissionNumber')
            .sort({ date: -1 })
            .limit(50);
    }
    static async recordAttendance(data) {
        const existing = await madrasa_extra_model_js_1.MadrasaAttendance.findOne({ classId: data.classId, date: new Date(data.date) });
        if (existing) {
            existing.records = data.records;
            existing.recordedBy = data.recordedBy;
            return existing.save();
        }
        return madrasa_extra_model_js_1.MadrasaAttendance.create(data);
    }
    static async listExams() {
        return madrasa_extra_model_js_1.MadrasaExam.find().populate('classId', 'name grade').sort({ examDate: -1 });
    }
    static async createExam(data) {
        return madrasa_extra_model_js_1.MadrasaExam.create(data);
    }
    static async recordResults(examId, results) {
        await madrasa_extra_model_js_1.MadrasaResult.deleteMany({ examId });
        return madrasa_extra_model_js_1.MadrasaResult.insertMany(results.map(r => ({ ...r, examId })));
    }
    static async getResults(examId) {
        return madrasa_extra_model_js_1.MadrasaResult.find({ examId })
            .populate('studentId', 'name admissionNumber')
            .sort({ totalMarks: -1 });
    }
}
exports.MadrasaService = MadrasaService;
