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
exports.MadrasaStudent = exports.Madrasa = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const madrasaSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    regNumber: { type: String, trim: true },
    board: { type: String, default: 'Samastha Kerala Islam Matha Vidyabhyasa Board' },
    location: { type: String, required: true },
    establishedYear: { type: Number },
    sadarUsthad: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: { type: String, trim: true },
    timings: { type: String, default: '06:30 AM – 08:30 AM' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },
    description: { type: String },
}, { timestamps: true });
exports.Madrasa = mongoose_1.default.model('Madrasa', madrasaSchema);
const madrasaStudentSchema = new mongoose_1.Schema({
    madrasaId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Madrasa', required: true, index: true },
    admissionNumber: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    memberId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Member' },
    familyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Family' },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['MALE', 'FEMALE'], required: true },
    guardianName: { type: String, required: true },
    guardianPhone: { type: String, required: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'GRADUATED'], default: 'ACTIVE', index: true },
}, { timestamps: true });
exports.MadrasaStudent = mongoose_1.default.model('MadrasaStudent', madrasaStudentSchema);
