import mongoose, { Schema, type Document, type Model } from 'mongoose';

// Teacher Model
export interface IMadrasaTeacher extends Document {
  name: string;
  phone: string;
  email?: string;
  qualification: string;
  subjects: string[];
  assignedClass?: mongoose.Types.ObjectId;
  joiningDate: Date;
  status: 'ACTIVE' | 'INACTIVE';
}

const madrasaTeacherSchema = new Schema<IMadrasaTeacher>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: { type: String },
    qualification: { type: String, required: true },
    subjects: [{ type: String }],
    assignedClass: { type: Schema.Types.ObjectId, ref: 'MadrasaClass' },
    joiningDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },
  },
  { timestamps: true }
);

export const MadrasaTeacher: Model<IMadrasaTeacher> = mongoose.model<IMadrasaTeacher>('MadrasaTeacher', madrasaTeacherSchema);

// Attendance Model
export interface IMadrasaAttendance extends Document {
  classId: mongoose.Types.ObjectId;
  date: Date;
  records: { studentId: mongoose.Types.ObjectId; present: boolean; note?: string }[];
  recordedBy: mongoose.Types.ObjectId;
}

const madrasaAttendanceSchema = new Schema<IMadrasaAttendance>(
  {
    classId: { type: Schema.Types.ObjectId, ref: 'MadrasaClass', required: true, index: true },
    date: { type: Date, required: true, index: true },
    records: [
      {
        studentId: { type: Schema.Types.ObjectId, ref: 'MadrasaStudent', required: true },
        present: { type: Boolean, required: true },
        note: { type: String },
      },
    ],
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const MadrasaAttendance: Model<IMadrasaAttendance> = mongoose.model<IMadrasaAttendance>('MadrasaAttendance', madrasaAttendanceSchema);

// Exam Model
export interface IMadrasaExam extends Document {
  title: string;
  classId: mongoose.Types.ObjectId;
  subject: string;
  examDate: Date;
  totalMarks: number;
  passingMarks: number;
  type: 'MONTHLY' | 'MIDTERM' | 'FINAL' | 'UNIT_TEST';
}

const madrasaExamSchema = new Schema<IMadrasaExam>(
  {
    title: { type: String, required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'MadrasaClass', required: true, index: true },
    subject: { type: String, required: true },
    examDate: { type: Date, required: true },
    totalMarks: { type: Number, required: true, default: 100 },
    passingMarks: { type: Number, required: true, default: 40 },
    type: { type: String, enum: ['MONTHLY', 'MIDTERM', 'FINAL', 'UNIT_TEST'], default: 'MONTHLY' },
  },
  { timestamps: true }
);

export const MadrasaExam: Model<IMadrasaExam> = mongoose.model<IMadrasaExam>('MadrasaExam', madrasaExamSchema);

// Results Model
export interface IMadrasaResult extends Document {
  examId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  marksObtained: number;
  totalMarks: number;
  grade: string;
  passed: boolean;
  remarks?: string;
}

const madrasaResultSchema = new Schema<IMadrasaResult>(
  {
    examId: { type: Schema.Types.ObjectId, ref: 'MadrasaExam', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'MadrasaStudent', required: true },
    marksObtained: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    grade: { type: String },
    passed: { type: Boolean, default: false },
    remarks: { type: String },
  },
  { timestamps: true }
);

export const MadrasaResult: Model<IMadrasaResult> = mongoose.model<IMadrasaResult>('MadrasaResult', madrasaResultSchema);
