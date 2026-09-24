"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MadrasaService = void 0;
const madrasa_model_js_1 = require("./madrasa.model.js");
const member_model_js_1 = require("../members/member.model.js");
const roles_js_1 = require("../../constants/roles.js");
const madrasa_extra_model_js_1 = require("./madrasa.extra.model.js");
class MadrasaService {
    static async getMadrasaDashboard() {
        const [totalMadrasasCount, totalStudents, maleStudents, femaleStudents, activeTeachers, madrasas] = await Promise.all([
            madrasa_model_js_1.Madrasa.countDocuments({ status: 'ACTIVE' }),
            madrasa_model_js_1.MadrasaStudent.countDocuments({ status: 'ACTIVE' }),
            madrasa_model_js_1.MadrasaStudent.countDocuments({ status: 'ACTIVE', gender: 'MALE' }),
            madrasa_model_js_1.MadrasaStudent.countDocuments({ status: 'ACTIVE', gender: 'FEMALE' }),
            madrasa_extra_model_js_1.MadrasaTeacher.countDocuments({ status: 'ACTIVE' }),
            madrasa_model_js_1.Madrasa.find().sort({ name: 1 }),
        ]);
        // Per-madrasa aggregates
        const [studentCounts, teacherCounts] = await Promise.all([
            madrasa_model_js_1.MadrasaStudent.aggregate([
                { $match: { status: 'ACTIVE' } },
                { $group: { _id: '$madrasaId', count: { $sum: 1 } } },
            ]),
            madrasa_extra_model_js_1.MadrasaTeacher.aggregate([
                { $match: { status: 'ACTIVE' } },
                { $group: { _id: '$madrasaId', count: { $sum: 1 } } },
            ]),
        ]);
        const studentCountMap = new Map(studentCounts.map((s) => [s._id ? s._id.toString() : 'unassigned', s.count]));
        const teacherCountMap = new Map(teacherCounts.map((t) => [t._id ? t._id.toString() : 'unassigned', t.count]));
        // Enrich madrasas with stats
        const enrichedMadrasas = madrasas.map((m) => {
            const mId = m._id.toString();
            const sCount = studentCountMap.get(mId) || 0;
            const tCount = teacherCountMap.get(mId) || 0;
            return {
                ...m.toObject(),
                studentCount: sCount,
                usthadCount: tCount,
            };
        });
        const madrasaBreakdown = enrichedMadrasas.map((m) => ({
            madrasaName: m.name,
            code: m.code,
            studentsCount: m.studentCount,
            usthadCount: m.usthadCount,
        }));
        return {
            cards: {
                totalMadrasas: totalMadrasasCount || madrasas.length,
                totalStudents,
                maleStudents,
                femaleStudents,
                activeTeachers,
            },
            madrasas: enrichedMadrasas,
            madrasaBreakdown,
        };
    }
    // --- Madrasa Management ---
    static async listMadrasas() {
        const madrasas = await madrasa_model_js_1.Madrasa.find().sort({ name: 1 });
        const [studentCounts, teacherCounts] = await Promise.all([
            madrasa_model_js_1.MadrasaStudent.aggregate([
                { $match: { status: 'ACTIVE' } },
                { $group: { _id: '$madrasaId', count: { $sum: 1 } } },
            ]),
            madrasa_extra_model_js_1.MadrasaTeacher.aggregate([
                { $match: { status: 'ACTIVE' } },
                { $group: { _id: '$madrasaId', count: { $sum: 1 } } },
            ]),
        ]);
        const studentMap = new Map(studentCounts.map((s) => [s._id?.toString(), s.count]));
        const teacherMap = new Map(teacherCounts.map((t) => [t._id?.toString(), t.count]));
        return madrasas.map((m) => {
            const id = m._id.toString();
            return {
                ...m.toObject(),
                studentCount: studentMap.get(id) || 0,
                usthadCount: teacherMap.get(id) || 0,
            };
        });
    }
    static async getMadrasaById(id) {
        const madrasa = await madrasa_model_js_1.Madrasa.findById(id);
        if (!madrasa)
            return null;
        const [students, teachers] = await Promise.all([
            madrasa_model_js_1.MadrasaStudent.find({ madrasaId: id }).sort({ admissionNumber: 1 }),
            madrasa_extra_model_js_1.MadrasaTeacher.find({ madrasaId: id }).sort({ name: 1 }),
        ]);
        return {
            madrasa,
            students,
            teachers,
            stats: {
                studentCount: students.filter(s => s.status === 'ACTIVE').length,
                teacherCount: teachers.filter(t => t.status === 'ACTIVE').length,
            },
        };
    }
    static async createMadrasa(data) {
        return madrasa_model_js_1.Madrasa.create(data);
    }
    static async updateMadrasa(id, data) {
        return madrasa_model_js_1.Madrasa.findByIdAndUpdate(id, data, { new: true });
    }
    static async deleteMadrasa(id) {
        return madrasa_model_js_1.Madrasa.findByIdAndDelete(id);
    }
    // --- Students ---
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
        if (query.madrasaId)
            filter.madrasaId = query.madrasaId;
        if (query.status)
            filter.status = query.status;
        if (query.gender)
            filter.gender = query.gender;
        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { admissionNumber: { $regex: query.search, $options: 'i' } },
                { guardianName: { $regex: query.search, $options: 'i' } },
            ];
        }
        const [items, total] = await Promise.all([
            madrasa_model_js_1.MadrasaStudent.find(filter)
                .populate('madrasaId', 'name code')
                .populate('familyId', 'familyCode name')
                .sort({ admissionNumber: 1 })
                .skip(skip)
                .limit(limit),
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
        return madrasa_model_js_1.MadrasaStudent.create({ ...data, admissionNumber: admNo, status: data.status || 'ACTIVE' });
    }
    static async updateStudent(id, data) {
        return madrasa_model_js_1.MadrasaStudent.findByIdAndUpdate(id, data, { new: true });
    }
    static async deleteStudent(id) {
        return madrasa_model_js_1.MadrasaStudent.findByIdAndDelete(id);
    }
    // --- Teachers (Usthad) ---
    static async listTeachers(query) {
        const filter = {};
        if (query?.madrasaId)
            filter.madrasaId = query.madrasaId;
        return madrasa_extra_model_js_1.MadrasaTeacher.find(filter)
            .populate('madrasaId', 'name code')
            .sort({ name: 1 });
    }
    static async createTeacher(data) {
        return madrasa_extra_model_js_1.MadrasaTeacher.create(data);
    }
    static async updateTeacher(id, data) {
        return madrasa_extra_model_js_1.MadrasaTeacher.findByIdAndUpdate(id, data, { new: true });
    }
    static async deleteTeacher(id) {
        return madrasa_extra_model_js_1.MadrasaTeacher.findByIdAndDelete(id);
    }
}
exports.MadrasaService = MadrasaService;
