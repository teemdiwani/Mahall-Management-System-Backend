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
exports.MadrasaResult = exports.MadrasaExam = exports.MadrasaAttendance = exports.MadrasaTeacher = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const madrasaTeacherSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: { type: String },
    qualification: { type: String, required: true },
    subjects: [{ type: String }],
    assignedClass: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MadrasaClass' },
    joiningDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },
}, { timestamps: true });
exports.MadrasaTeacher = mongoose_1.default.model('MadrasaTeacher', madrasaTeacherSchema);
const madrasaAttendanceSchema = new mongoose_1.Schema({
    classId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MadrasaClass', required: true, index: true },
    date: { type: Date, required: true, index: true },
    records: [
        {
            studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MadrasaStudent', required: true },
            present: { type: Boolean, required: true },
            note: { type: String },
        },
    ],
    recordedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
exports.MadrasaAttendance = mongoose_1.default.model('MadrasaAttendance', madrasaAttendanceSchema);
const madrasaExamSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    classId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MadrasaClass', required: true, index: true },
    subject: { type: String, required: true },
    examDate: { type: Date, required: true },
    totalMarks: { type: Number, required: true, default: 100 },
    passingMarks: { type: Number, required: true, default: 40 },
    type: { type: String, enum: ['MONTHLY', 'MIDTERM', 'FINAL', 'UNIT_TEST'], default: 'MONTHLY' },
}, { timestamps: true });
exports.MadrasaExam = mongoose_1.default.model('MadrasaExam', madrasaExamSchema);
const madrasaResultSchema = new mongoose_1.Schema({
    examId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MadrasaExam', required: true, index: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MadrasaStudent', required: true },
    marksObtained: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    grade: { type: String },
    passed: { type: Boolean, default: false },
    remarks: { type: String },
}, { timestamps: true });
exports.MadrasaResult = mongoose_1.default.model('MadrasaResult', madrasaResultSchema);
