import mongoose, { Schema, type Document, type Model } from 'mongoose';

// Class Model
export interface IMadrasaClass extends Document {
  name: string;
  grade: string;
  academicYear: string;
  teacherName: string;
  capacity: number;
  roomNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const madrasaClassSchema = new Schema<IMadrasaClass>(
  {
    name: { type: String, required: true, trim: true },
    grade: { type: String, required: true },
    academicYear: { type: String, required: true, default: '2026-2027' },
    teacherName: { type: String, required: true },
    capacity: { type: Number, default: 30 },
    roomNumber: { type: String },
  },
  { timestamps: true }
);

export const MadrasaClass: Model<IMadrasaClass> =
  mongoose.model<IMadrasaClass>('MadrasaClass', madrasaClassSchema);

// Student Model
export interface IMadrasaStudent extends Document {
  admissionNumber: string;
  name: string;
  memberId?: mongoose.Types.ObjectId;
  familyId?: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
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
    admissionNumber: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    memberId: { type: Schema.Types.ObjectId, ref: 'Member' },
    familyId: { type: Schema.Types.ObjectId, ref: 'Family' },
    classId: { type: Schema.Types.ObjectId, ref: 'MadrasaClass', required: true, index: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['MALE', 'FEMALE'], required: true },
    guardianName: { type: String, required: true },
    guardianPhone: { type: String, required: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'GRADUATED'], default: 'ACTIVE', index: true },
  },
  { timestamps: true }
);

export const MadrasaStudent: Model<IMadrasaStudent> =
  mongoose.model<IMadrasaStudent>('MadrasaStudent', madrasaStudentSchema);
