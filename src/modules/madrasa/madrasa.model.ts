import mongoose, { Schema, type Document, type Model } from 'mongoose';

// Madrasa Institution Model
export interface IMadrasa extends Document {
  name: string;
  code: string;
  regNumber?: string;
  board: string;
  location: string;
  establishedYear?: number;
  sadarUsthad: string;
  phone: string;
  email?: string;
  timings?: string;
  status: 'ACTIVE' | 'INACTIVE';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const madrasaSchema = new Schema<IMadrasa>(
  {
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
  },
  { timestamps: true }
);

export const Madrasa: Model<IMadrasa> = mongoose.model<IMadrasa>('Madrasa', madrasaSchema);

// Student Model
export interface IMadrasaStudent extends Document {
  madrasaId: mongoose.Types.ObjectId;
  admissionNumber: string;
  name: string;
  memberId?: mongoose.Types.ObjectId;
  familyId?: mongoose.Types.ObjectId;
  classId?: mongoose.Types.ObjectId;
  standard?: number;
  division?: string;
  academicYear?: string;
  rollNumber?: string;
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE';
  guardianName: string;
  guardianPhone: string;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED';
  createdAt: Date;
  updatedAt: Date;
}

const madrasaStudentSchema = new Schema<IMadrasaStudent>(
  {
    madrasaId: { type: Schema.Types.ObjectId, ref: 'Madrasa', required: true, index: true },
    admissionNumber: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    memberId: { type: Schema.Types.ObjectId, ref: 'Member' },
    familyId: { type: Schema.Types.ObjectId, ref: 'Family', index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'MadrasaClass', index: true },
    standard: { type: Number, index: true },
    division: { type: String, default: 'A', trim: true },
    academicYear: { type: String, default: '2026-2027' },
    rollNumber: { type: String, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['MALE', 'FEMALE'], required: true },
    guardianName: { type: String, required: true },
    guardianPhone: { type: String, required: true, index: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'GRADUATED'], default: 'ACTIVE', index: true },
  },
  { timestamps: true }
);

export const MadrasaStudent: Model<IMadrasaStudent> =
  mongoose.model<IMadrasaStudent>('MadrasaStudent', madrasaStudentSchema);

