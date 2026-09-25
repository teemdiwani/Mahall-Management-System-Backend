"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MadrasaAnnouncement = exports.MadrasaAttendance = exports.MadrasaFee = exports.MadrasaExamResult = exports.MadrasaTimetable = exports.MadrasaClass = exports.MadrasaTeacher = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const madrasaTeacherSchema = new mongoose_1.Schema({
    madrasaId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Madrasa', index: true },
    name: { type: String, required: true, trim: true },
    designation: { type: String, default: 'Mudarris (Usthad)', trim: true },
    phone: { type: String, required: true },
    email: { type: String },
    qualification: { type: String, required: true },
    subjects: [{ type: String }],
    joiningDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },
}, { timestamps: true });
exports.MadrasaTeacher = mongoose_1.default.model('MadrasaTeacher', madrasaTeacherSchema);
const madrasaClassSchema = new mongoose_1.Schema({
    madrasaId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Madrasa', required: true, index: true },
    name: { type: String, required: true, trim: true },
    standard: { type: Number, required: true, min: 1, max: 12, index: true },
    division: { type: String, default: 'A', uppercase: true, trim: true },
    academicYear: { type: String, default: '2026-2027' },
    usthadInCharge: { type: String, trim: true },
    usthadId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MadrasaTeacher' },
    roomNumber: { type: String, trim: true },
    maxCapacity: { type: Number, default: 35 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },
}, { timestamps: true });
// Compound unique index per madrasa, standard, division, academicYear
madrasaClassSchema.index({ madrasaId: 1, standard: 1, division: 1, academicYear: 1 }, { unique: true });
exports.MadrasaClass = mongoose_1.default.model('MadrasaClass', madrasaClassSchema);
const timetablePeriodSchema = new mongoose_1.Schema({
    day: { type: String, required: true },
    periodNumber: { type: Number, required: true },
    timeSlot: { type: String, required: true },
    subject: { type: String, required: true },
    usthadName: { type: String, required: true },
}, { _id: false });
const madrasaTimetableSchema = new mongoose_1.Schema({
    madrasaId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Madrasa', required: true, index: true },
    classId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MadrasaClass', required: true, index: true },
    className: { type: String, required: true },
    academicYear: { type: String, default: '2026-2027' },
    title: { type: String, default: 'Standard Class Timetable' },
    uploadedBy: { type: String, default: 'Madrasa Secretary' },
    schedule: [timetablePeriodSchema],
    notes: { type: String },
    status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
}, { timestamps: true });
exports.MadrasaTimetable = mongoose_1.default.model('MadrasaTimetable', madrasaTimetableSchema);
const examSubjectScoreSchema = new mongoose_1.Schema({
    subject: { type: String, required: true },
    maxMarks: { type: Number, required: true, default: 100 },
    marksObtained: { type: Number, required: true },
    grade: { type: String, required: true },
}, { _id: false });
const madrasaExamResultSchema = new mongoose_1.Schema({
    madrasaId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Madrasa', required: true, index: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MadrasaStudent', required: true, index: true },
    classId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MadrasaClass' },
    standard: { type: Number },
    examName: { type: String, required: true, trim: true },
    academicYear: { type: String, default: '2026-2027' },
    examDate: { type: Date, default: Date.now },
    enteredBy: { type: String, default: 'Madrasa Manager' },
    subjects: [examSubjectScoreSchema],
    totalMaxMarks: { type: Number, required: true },
    totalMarksObtained: { type: Number, required: true },
    percentage: { type: Number, required: true },
    overallGrade: { type: String, required: true },
    resultStatus: { type: String, enum: ['PASSED', 'FAILED', 'WITHHELD'], default: 'PASSED', index: true },
    rank: { type: Number },
    remarks: { type: String },
}, { timestamps: true });
exports.MadrasaExamResult = mongoose_1.default.model('MadrasaExamResult', madrasaExamResultSchema);
const madrasaFeeSchema = new mongoose_1.Schema({
    madrasaId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Madrasa', required: true, index: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MadrasaStudent', required: true, index: true },
    familyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Family', index: true },
    month: { type: String, required: true, index: true }, // e.g. "2026-09"
    academicYear: { type: String, default: '2026-2027' },
    feeType: {
        type: String,
        enum: ['MONTHLY_TUITION', 'ADMISSION', 'EXAM_FEE', 'BOOKS'],
        default: 'MONTHLY_TUITION',
    },
    amount: { type: Number, required: true, default: 200 },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    status: { type: String, enum: ['PAID', 'PENDING', 'OVERDUE'], default: 'PENDING', index: true },
    paymentMethod: { type: String, enum: ['CASH', 'ONLINE', 'UPI', 'BANK_TRANSFER'] },
    receiptNumber: { type: String },
    collectedBy: { type: String },
    notes: { type: String },
}, { timestamps: true });
madrasaFeeSchema.index({ studentId: 1, month: 1, feeType: 1 }, { unique: true });
exports.MadrasaFee = mongoose_1.default.model('MadrasaFee', madrasaFeeSchema);
const madrasaAttendanceSchema = new mongoose_1.Schema({
    madrasaId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Madrasa', required: true, index: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MadrasaStudent', required: true, index: true },
    classId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MadrasaClass', index: true },
    date: { type: Date, required: true, index: true },
    status: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'], default: 'PRESENT', index: true },
    remarks: { type: String },
}, { timestamps: true });
madrasaAttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });
exports.MadrasaAttendance = mongoose_1.default.model('MadrasaAttendance', madrasaAttendanceSchema);
const madrasaAnnouncementSchema = new mongoose_1.Schema({
    madrasaId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Madrasa', required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: {
        type: String,
        enum: ['CIRCULAR', 'EXAM', 'HOLIDAY', 'PARENT_MEETING', 'FEE_ALERT', 'GENERAL'],
        default: 'CIRCULAR',
    },
    targetAudience: { type: String, enum: ['PARENTS', 'STUDENTS', 'ALL'], default: 'ALL', index: true },
    classTarget: { type: String, default: 'All Classes' },
    publishedBy: { type: String, default: 'Madrasa Secretary' },
    publishedAt: { type: Date, default: Date.now },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
    status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE', index: true },
}, { timestamps: true });
exports.MadrasaAnnouncement = mongoose_1.default.model('MadrasaAnnouncement', madrasaAnnouncementSchema);
