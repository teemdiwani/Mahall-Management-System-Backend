import mongoose, { Schema, type Document, type Model } from 'mongoose';

// ─── 1. Teacher Model ──────────────────────────────────────────────────────────
export interface IMadrasaTeacher extends Document {
  madrasaId?: mongoose.Types.ObjectId;
  name: string;
  designation: string;
  phone: string;
  email?: string;
  qualification: string;
  subjects: string[];
  joiningDate: Date;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const madrasaTeacherSchema = new Schema<IMadrasaTeacher>(
  {
    madrasaId: { type: Schema.Types.ObjectId, ref: 'Madrasa', index: true },
    name: { type: String, required: true, trim: true },
    designation: { type: String, default: 'Mudarris (Usthad)', trim: true },
    phone: { type: String, required: true },
    email: { type: String },
    qualification: { type: String, required: true },
    subjects: [{ type: String }],
    joiningDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },
  },
  { timestamps: true }
);

export const MadrasaTeacher: Model<IMadrasaTeacher> = mongoose.model<IMadrasaTeacher>(
  'MadrasaTeacher',
  madrasaTeacherSchema
);

// ─── 2. Class Model (Madrasas can have 1-10 or 1-12 Standards) ───────────────────
export interface IMadrasaClass extends Document {
  madrasaId: mongoose.Types.ObjectId;
  name: string; // e.g. "Class 5 - A", "Class 10", "Class 12"
  standard: number; // 1 to 12
  division: string; // 'A', 'B', 'C'
  academicYear: string; // e.g. "2026-2027"
  usthadInCharge?: string;
  usthadId?: mongoose.Types.ObjectId;
  roomNumber?: string;
  maxCapacity: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const madrasaClassSchema = new Schema<IMadrasaClass>(
  {
    madrasaId: { type: Schema.Types.ObjectId, ref: 'Madrasa', required: true, index: true },
    name: { type: String, required: true, trim: true },
    standard: { type: Number, required: true, min: 1, max: 12, index: true },
    division: { type: String, default: 'A', uppercase: true, trim: true },
    academicYear: { type: String, default: '2026-2027' },
    usthadInCharge: { type: String, trim: true },
    usthadId: { type: Schema.Types.ObjectId, ref: 'MadrasaTeacher' },
    roomNumber: { type: String, trim: true },
    maxCapacity: { type: Number, default: 35 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },
  },
  { timestamps: true }
);

// Compound unique index per madrasa, standard, division, academicYear
madrasaClassSchema.index({ madrasaId: 1, standard: 1, division: 1, academicYear: 1 }, { unique: true });

export const MadrasaClass: Model<IMadrasaClass> = mongoose.model<IMadrasaClass>(
  'MadrasaClass',
  madrasaClassSchema
);

// ─── 3. Class Timetable Model (Uploaded & Managed Class-wise by Secretary) ──────
export interface ITimetablePeriod {
  day: string; // 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  periodNumber: number; // 1, 2, 3, 4
  timeSlot: string; // "06:30 AM – 07:15 AM"
  subject: string; // "Quran & Tajweed", "Fiqh", "Thareekh", "Akhlaq", "Arabic", "Aqeedah"
  usthadName: string;
}

export interface IMadrasaTimetable extends Document {
  madrasaId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  className: string;
  academicYear: string;
  title: string;
  uploadedBy: string; // e.g. "Madrasa Secretary"
  schedule: ITimetablePeriod[];
  notes?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

const timetablePeriodSchema = new Schema<ITimetablePeriod>(
  {
    day: { type: String, required: true },
    periodNumber: { type: Number, required: true },
    timeSlot: { type: String, required: true },
    subject: { type: String, required: true },
    usthadName: { type: String, required: true },
  },
  { _id: false }
);

const madrasaTimetableSchema = new Schema<IMadrasaTimetable>(
  {
    madrasaId: { type: Schema.Types.ObjectId, ref: 'Madrasa', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'MadrasaClass', required: true, index: true },
    className: { type: String, required: true },
    academicYear: { type: String, default: '2026-2027' },
    title: { type: String, default: 'Standard Class Timetable' },
    uploadedBy: { type: String, default: 'Madrasa Secretary' },
    schedule: [timetablePeriodSchema],
    notes: { type: String },
    status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

export const MadrasaTimetable: Model<IMadrasaTimetable> = mongoose.model<IMadrasaTimetable>(
  'MadrasaTimetable',
  madrasaTimetableSchema
);

// ─── 4. Exam Results Model (Entered by Madrasa Manager) ─────────────────────────
export interface IExamSubjectScore {
  subject: string;
  maxMarks: number;
  marksObtained: number;
  grade: string; // 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D'
}

export interface IMadrasaExamResult extends Document {
  madrasaId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  classId?: mongoose.Types.ObjectId;
  standard?: number;
  examName: string; // e.g. "First Term Examination", "Annual Board Exam"
  academicYear: string;
  examDate: Date;
  enteredBy: string; // e.g. "Madrasa Manager"
  subjects: IExamSubjectScore[];
  totalMaxMarks: number;
  totalMarksObtained: number;
  percentage: number;
  overallGrade: string; // e.g. "A+ Distinction", "First Class"
  resultStatus: 'PASSED' | 'FAILED' | 'WITHHELD';
  rank?: number;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const examSubjectScoreSchema = new Schema<IExamSubjectScore>(
  {
    subject: { type: String, required: true },
    maxMarks: { type: Number, required: true, default: 100 },
    marksObtained: { type: Number, required: true },
    grade: { type: String, required: true },
  },
  { _id: false }
);

const madrasaExamResultSchema = new Schema<IMadrasaExamResult>(
  {
    madrasaId: { type: Schema.Types.ObjectId, ref: 'Madrasa', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'MadrasaStudent', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'MadrasaClass' },
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
  },
  { timestamps: true }
);

export const MadrasaExamResult: Model<IMadrasaExamResult> = mongoose.model<IMadrasaExamResult>(
  'MadrasaExamResult',
  madrasaExamResultSchema
);

// ─── 5. Monthly Student Fees & Fee Alert Model ─────────────────────────────────
export interface IMadrasaFee extends Document {
  madrasaId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  familyId?: mongoose.Types.ObjectId;
  month: string; // YYYY-MM e.g. "2026-09"
  academicYear: string;
  feeType: 'MONTHLY_TUITION' | 'ADMISSION' | 'EXAM_FEE' | 'BOOKS';
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  paymentMethod?: 'CASH' | 'ONLINE' | 'UPI' | 'BANK_TRANSFER';
  receiptNumber?: string;
  collectedBy?: string;
  notes?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  transactionId?: string;
  paymentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const madrasaFeeSchema = new Schema<IMadrasaFee>(
  {
    madrasaId: { type: Schema.Types.ObjectId, ref: 'Madrasa', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'MadrasaStudent', required: true, index: true },
    familyId: { type: Schema.Types.ObjectId, ref: 'Family', index: true },
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
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    transactionId: { type: String },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
  },
  { timestamps: true }
);

madrasaFeeSchema.index({ studentId: 1, month: 1, feeType: 1 }, { unique: true });

export const MadrasaFee: Model<IMadrasaFee> = mongoose.model<IMadrasaFee>(
  'MadrasaFee',
  madrasaFeeSchema
);

// ─── 6. Student Attendance Model ──────────────────────────────────────────────
export interface IMadrasaAttendance extends Document {
  madrasaId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  classId?: mongoose.Types.ObjectId;
  date: Date;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const madrasaAttendanceSchema = new Schema<IMadrasaAttendance>(
  {
    madrasaId: { type: Schema.Types.ObjectId, ref: 'Madrasa', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'MadrasaStudent', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'MadrasaClass', index: true },
    date: { type: Date, required: true, index: true },
    status: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'], default: 'PRESENT', index: true },
    remarks: { type: String },
  },
  { timestamps: true }
);

madrasaAttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

export const MadrasaAttendance: Model<IMadrasaAttendance> = mongoose.model<IMadrasaAttendance>(
  'MadrasaAttendance',
  madrasaAttendanceSchema
);

// ─── 7. Official Madrasa Announcements for Parents/Students ───────────────────
export interface IMadrasaAnnouncement extends Document {
  madrasaId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  category: 'CIRCULAR' | 'EXAM' | 'HOLIDAY' | 'PARENT_MEETING' | 'FEE_ALERT' | 'GENERAL';
  targetAudience: 'PARENTS' | 'STUDENTS' | 'ALL';
  classTarget: string; // 'All Classes' or 'Class 5', etc.
  publishedBy: string; // e.g. "Madrasa Secretary"
  publishedAt: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

const madrasaAnnouncementSchema = new Schema<IMadrasaAnnouncement>(
  {
    madrasaId: { type: Schema.Types.ObjectId, ref: 'Madrasa', required: true, index: true },
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
  },
  { timestamps: true }
);

export const MadrasaAnnouncement: Model<IMadrasaAnnouncement> = mongoose.model<IMadrasaAnnouncement>(
  'MadrasaAnnouncement',
  madrasaAnnouncementSchema
);
