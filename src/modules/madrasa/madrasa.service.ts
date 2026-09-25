import mongoose from 'mongoose';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { Madrasa, MadrasaStudent } from './madrasa.model.js';
import { Member } from '../members/member.model.js';
import { User } from '../auth/user.model.js';
import { Payment } from '../payments/payment.model.js';
import { Notification } from '../notifications/notification.model.js';
import { ApiError } from '../../utils/apiError.js';
import { env } from '../../config/env.js';
import { ROLES, type UserRole } from '../../constants/roles.js';
import {
  MadrasaTeacher,
  MadrasaClass,
  MadrasaTimetable,
  MadrasaExamResult,
  MadrasaFee,
  MadrasaAttendance,
  MadrasaAnnouncement,
} from './madrasa.extra.model.js';

export class MadrasaService {
  // ─── Dashboard ─────────────────────────────────────────────────────────────
  static async getMadrasaDashboard() {
    const [
      totalMadrasasCount,
      totalStudents,
      maleStudents,
      femaleStudents,
      activeTeachers,
      totalClasses,
      madrasas,
    ] = await Promise.all([
      Madrasa.countDocuments({ status: 'ACTIVE' }),
      MadrasaStudent.countDocuments({ status: 'ACTIVE' }),
      MadrasaStudent.countDocuments({ status: 'ACTIVE', gender: 'MALE' }),
      MadrasaStudent.countDocuments({ status: 'ACTIVE', gender: 'FEMALE' }),
      MadrasaTeacher.countDocuments({ status: 'ACTIVE' }),
      MadrasaClass.countDocuments({ status: 'ACTIVE' }),
      Madrasa.find().sort({ name: 1 }),
    ]);

    // Per-madrasa aggregates
    const [studentCounts, teacherCounts, classCounts] = await Promise.all([
      MadrasaStudent.aggregate([
        { $match: { status: 'ACTIVE' } },
        { $group: { _id: '$madrasaId', count: { $sum: 1 } } },
      ]),
      MadrasaTeacher.aggregate([
        { $match: { status: 'ACTIVE' } },
        { $group: { _id: '$madrasaId', count: { $sum: 1 } } },
      ]),
      MadrasaClass.aggregate([
        { $match: { status: 'ACTIVE' } },
        { $group: { _id: '$madrasaId', count: { $sum: 1 } } },
      ]),
    ]);

    const studentCountMap = new Map(studentCounts.map((s) => [s._id ? s._id.toString() : 'unassigned', s.count]));
    const teacherCountMap = new Map(teacherCounts.map((t) => [t._id ? t._id.toString() : 'unassigned', t.count]));
    const classCountMap = new Map(classCounts.map((c) => [c._id ? c._id.toString() : 'unassigned', c.count]));

    // Enrich madrasas with stats
    const enrichedMadrasas = madrasas.map((m) => {
      const mId = m._id.toString();
      const sCount = studentCountMap.get(mId) || 0;
      const tCount = teacherCountMap.get(mId) || 0;
      const cCount = classCountMap.get(mId) || 0;
      return {
        ...m.toObject(),
        studentCount: sCount,
        usthadCount: tCount,
        classCount: cCount,
      };
    });

    const madrasaBreakdown = enrichedMadrasas.map((m) => ({
      madrasaName: m.name,
      code: m.code,
      studentsCount: m.studentCount,
      usthadCount: m.usthadCount,
      classCount: m.classCount,
    }));

    // Recent announcements for madrasa desk
    const recentAnnouncements = await MadrasaAnnouncement.find({ status: 'ACTIVE' })
      .populate('madrasaId', 'name code')
      .sort({ publishedAt: -1 })
      .limit(4);

    return {
      cards: {
        totalMadrasas: totalMadrasasCount || madrasas.length,
        totalStudents,
        maleStudents,
        femaleStudents,
        activeTeachers,
        totalClasses,
      },
      madrasas: enrichedMadrasas,
      madrasaBreakdown,
      recentAnnouncements,
    };
  }

  // ─── Parent Portal (Child Connection & Dashboard) ──────────────────────────
  static async getParentPortal(userId: string, email?: string, phone?: string) {
    const user = await User.findById(userId);
    const { findFamilyAndMemberForUser } = await import('../../utils/memberMatcher.js');
    const match = await findFamilyAndMemberForUser({
      userId,
      email: email || user?.email,
      phone: phone || user?.phone,
    });
    const member = match.currentMember;
    const family = match.family;

    const orConditions: any[] = [];
    if (member?._id) orConditions.push({ memberId: member._id });
    if (family?._id) orConditions.push({ familyId: family._id });
    if (member?.phone) orConditions.push({ guardianPhone: member.phone });
    if (family?.phone) orConditions.push({ guardianPhone: family.phone });
    if (user?.phone) orConditions.push({ guardianPhone: user.phone });
    if (phone) orConditions.push({ guardianPhone: phone });

    if (orConditions.length === 0) {
      return {
        hasChildrenInMadrasa: false,
        students: [],
        announcements: [],
        stats: null,
      };
    }

    const students = await MadrasaStudent.find({
      $or: orConditions,
      status: 'ACTIVE',
    })
      .populate('madrasaId', 'name code regNumber location phone sadarUsthad timings board email')
      .populate('classId', 'name standard division academicYear usthadInCharge roomNumber')
      .sort({ standard: 1, name: 1 });

    if (students.length === 0) {
      return {
        hasChildrenInMadrasa: false,
        students: [],
        announcements: [],
        stats: null,
      };
    }

    // Enrich each student with timetable, exam results, fees & alerts, attendance
    const enrichedStudents = await Promise.all(
      students.map(async (student) => {
        const studentId = student._id;
        const madrasaId = (student.madrasaId as any)?._id || student.madrasaId;
        const standard = student.standard;
        const classId = (student.classId as any)?._id || student.classId;

        // Fetch Timetable: match by classId or standard in that madrasa
        let timetable = null;
        if (classId) {
          timetable = await MadrasaTimetable.findOne({ classId, status: 'ACTIVE' });
        }
        if (!timetable && standard && madrasaId) {
          const matchingClass = await MadrasaClass.findOne({ madrasaId, standard, status: 'ACTIVE' });
          if (matchingClass) {
            timetable = await MadrasaTimetable.findOne({ classId: matchingClass._id, status: 'ACTIVE' });
          }
        }

        // Fetch Exam Results
        const examResults = await MadrasaExamResult.find({ studentId }).sort({ examDate: -1 });

        // Fetch Fees
        const fees = await MadrasaFee.find({ studentId }).sort({ month: -1 });
        const pendingFees = fees.filter((f) => f.status === 'PENDING' || f.status === 'OVERDUE');
        const totalPendingAmount = pendingFees.reduce((acc, f) => acc + f.amount, 0);

        const feeAlert = {
          hasPending: pendingFees.length > 0,
          pendingCount: pendingFees.length,
          totalPending: totalPendingAmount,
          pendingMonths: pendingFees.map((f) => f.month),
          latestPendingMonth: pendingFees[0]?.month,
          message:
            pendingFees.length > 0
              ? `Monthly Madrasa Fee of ₹${totalPendingAmount} (${pendingFees.map((f) => f.month).join(', ')}) is pending.`
              : 'All madrasa fees are up to date.',
        };

        // Fetch Attendance
        const recentAttendance = await MadrasaAttendance.find({ studentId }).sort({ date: -1 }).limit(14);
        const totalSessions = await MadrasaAttendance.countDocuments({ studentId });
        const presentSessions = await MadrasaAttendance.countDocuments({ studentId, status: 'PRESENT' });
        const attendanceRate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 96;

        return {
          student: student.toObject(),
          timetable: timetable ? timetable.toObject() : null,
          examResults,
          fees,
          feeAlert,
          attendance: {
            attendanceRate,
            totalSessions: totalSessions || 30,
            presentSessions: presentSessions || 29,
            recent: recentAttendance,
          },
        };
      })
    );

    // Fetch official Madrasa Announcements for parents/students
    const madrasaIds = Array.from(new Set(students.map((s) => (s.madrasaId as any)?._id || s.madrasaId)));
    const announcements = await MadrasaAnnouncement.find({
      madrasaId: { $in: madrasaIds },
      status: 'ACTIVE',
      targetAudience: { $in: ['ALL', 'PARENTS', 'STUDENTS'] },
    })
      .populate('madrasaId', 'name code')
      .sort({ priority: -1, publishedAt: -1 })
      .limit(6);

    const totalFeesDue = enrichedStudents.reduce((sum, s) => sum + s.feeAlert.totalPending, 0);
    const avgAttendance = Math.round(
      enrichedStudents.reduce((sum, s) => sum + s.attendance.attendanceRate, 0) / (enrichedStudents.length || 1)
    );

    return {
      hasChildrenInMadrasa: true,
      students: enrichedStudents,
      announcements,
      stats: {
        totalEnrolled: students.length,
        totalFeesDue,
        hasPendingFeeAlert: totalFeesDue > 0,
        avgAttendance,
      },
    };
  }

  // ─── Madrasa Institutions Management ───────────────────────────────────────
  static async listMadrasas() {
    const madrasas = await Madrasa.find().sort({ name: 1 });
    const [studentCounts, teacherCounts, classCounts] = await Promise.all([
      MadrasaStudent.aggregate([
        { $match: { status: 'ACTIVE' } },
        { $group: { _id: '$madrasaId', count: { $sum: 1 } } },
      ]),
      MadrasaTeacher.aggregate([
        { $match: { status: 'ACTIVE' } },
        { $group: { _id: '$madrasaId', count: { $sum: 1 } } },
      ]),
      MadrasaClass.aggregate([
        { $match: { status: 'ACTIVE' } },
        { $group: { _id: '$madrasaId', count: { $sum: 1 } } },
      ]),
    ]);

    const studentMap = new Map(studentCounts.map((s) => [s._id?.toString(), s.count]));
    const teacherMap = new Map(teacherCounts.map((t) => [t._id?.toString(), t.count]));
    const classMap = new Map(classCounts.map((c) => [c._id?.toString(), c.count]));

    return madrasas.map((m) => {
      const id = m._id.toString();
      return {
        ...m.toObject(),
        studentCount: studentMap.get(id) || 0,
        usthadCount: teacherMap.get(id) || 0,
        classCount: classMap.get(id) || 0,
      };
    });
  }

  static async getMadrasaById(id: string) {
    const madrasa = await Madrasa.findById(id);
    if (!madrasa) return null;

    const [students, teachers, classes] = await Promise.all([
      MadrasaStudent.find({ madrasaId: id }).populate('classId', 'name standard division').sort({ admissionNumber: 1 }),
      MadrasaTeacher.find({ madrasaId: id }).sort({ name: 1 }),
      MadrasaClass.find({ madrasaId: id }).sort({ standard: 1, division: 1 }),
    ]);

    return {
      madrasa,
      students,
      teachers,
      classes,
      stats: {
        studentCount: students.filter((s) => s.status === 'ACTIVE').length,
        teacherCount: teachers.filter((t) => t.status === 'ACTIVE').length,
        classCount: classes.filter((c) => c.status === 'ACTIVE').length,
      },
    };
  }

  static async createMadrasa(data: any) {
    return Madrasa.create(data);
  }

  static async updateMadrasa(id: string, data: any) {
    return Madrasa.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteMadrasa(id: string) {
    return Madrasa.findByIdAndDelete(id);
  }

  // ─── Classes Management (1 to 10 or 12 Standards) ──────────────────────────
  static async listClasses(query?: any) {
    const filter: Record<string, any> = {};
    if (query?.madrasaId) filter.madrasaId = query.madrasaId;
    if (query?.status) filter.status = query.status;
    if (query?.standard) filter.standard = Number(query.standard);

    const classes = await MadrasaClass.find(filter)
      .populate('madrasaId', 'name code')
      .populate('usthadId', 'name phone designation')
      .sort({ standard: 1, division: 1 });

    // Aggregate student counts per class
    const studentCounts = await MadrasaStudent.aggregate([
      { $match: { status: 'ACTIVE' } },
      { $group: { _id: '$classId', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(studentCounts.map((s) => [s._id ? s._id.toString() : '', s.count]));

    return classes.map((c) => ({
      ...c.toObject(),
      studentCount: countMap.get(c._id.toString()) || 0,
    }));
  }

  static async createClass(data: any) {
    const standard = Number(data.standard);
    const division = (data.division || 'A').toUpperCase();
    const name = data.name || `Class ${standard} - ${division}`;
    return MadrasaClass.create({
      ...data,
      standard,
      division,
      name,
      academicYear: data.academicYear || '2026-2027',
    });
  }

  static async updateClass(id: string, data: any) {
    return MadrasaClass.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteClass(id: string) {
    return MadrasaClass.findByIdAndDelete(id);
  }

  // ─── Timetables (Secretary Uploads / Manages Class-wise) ───────────────────
  static async listTimetables(query?: any) {
    const filter: Record<string, any> = {};
    if (query?.madrasaId) filter.madrasaId = query.madrasaId;
    if (query?.classId) filter.classId = query.classId;

    return MadrasaTimetable.find(filter)
      .populate('madrasaId', 'name code')
      .populate('classId', 'name standard division usthadInCharge')
      .sort({ createdAt: -1 });
  }

  static async getTimetableByClass(classId: string) {
    return MadrasaTimetable.findOne({ classId, status: 'ACTIVE' })
      .populate('madrasaId', 'name code')
      .populate('classId', 'name standard division usthadInCharge');
  }

  static async saveTimetable(data: any) {
    if (data._id) {
      return MadrasaTimetable.findByIdAndUpdate(data._id, data, { new: true });
    }
    // Upsert by classId
    if (data.classId) {
      const existing = await MadrasaTimetable.findOne({ classId: data.classId });
      if (existing) {
        return MadrasaTimetable.findByIdAndUpdate(existing._id, data, { new: true });
      }
    }
    return MadrasaTimetable.create(data);
  }

  static async deleteTimetable(id: string) {
    return MadrasaTimetable.findByIdAndDelete(id);
  }

  // ─── Exam Results (Entered by Madrasa Manager) ────────────────────────────
  static async listResults(query?: any) {
    const filter: Record<string, any> = {};
    if (query?.madrasaId) filter.madrasaId = query.madrasaId;
    if (query?.studentId) filter.studentId = query.studentId;
    if (query?.classId) filter.classId = query.classId;
    if (query?.examName) filter.examName = query.examName;

    return MadrasaExamResult.find(filter)
      .populate('studentId', 'admissionNumber name gender standard division guardianName guardianPhone')
      .populate('madrasaId', 'name code')
      .populate('classId', 'name standard division')
      .sort({ examDate: -1 });
  }

  static async createResult(data: any) {
    // Calculate total marks and percentage
    const subjects = data.subjects || [];
    const totalMaxMarks = subjects.reduce((sum: number, s: any) => sum + (Number(s.maxMarks) || 100), 0);
    const totalMarksObtained = subjects.reduce((sum: number, s: any) => sum + (Number(s.marksObtained) || 0), 0);
    const percentage = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 1000) / 10 : 0;

    let overallGrade = data.overallGrade;
    if (!overallGrade) {
      if (percentage >= 90) overallGrade = 'A+ Distinction';
      else if (percentage >= 80) overallGrade = 'A First Class';
      else if (percentage >= 70) overallGrade = 'B+ Second Class';
      else if (percentage >= 60) overallGrade = 'B Second Class';
      else if (percentage >= 50) overallGrade = 'C+ Pass';
      else if (percentage >= 40) overallGrade = 'C Pass';
      else overallGrade = 'D Needs Improvement';
    }

    const resultStatus = percentage >= 40 ? 'PASSED' : 'FAILED';

    return MadrasaExamResult.create({
      ...data,
      totalMaxMarks,
      totalMarksObtained,
      percentage,
      overallGrade,
      resultStatus,
    });
  }

  static async updateResult(id: string, data: any) {
    if (data.subjects) {
      const subjects = data.subjects;
      const totalMaxMarks = subjects.reduce((sum: number, s: any) => sum + (Number(s.maxMarks) || 100), 0);
      const totalMarksObtained = subjects.reduce((sum: number, s: any) => sum + (Number(s.marksObtained) || 0), 0);
      const percentage = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 1000) / 10 : 0;
      data.totalMaxMarks = totalMaxMarks;
      data.totalMarksObtained = totalMarksObtained;
      data.percentage = percentage;
    }
    return MadrasaExamResult.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteResult(id: string) {
    return MadrasaExamResult.findByIdAndDelete(id);
  }

  // ─── Monthly Student Fees ──────────────────────────────────────────────────
  static async listFees(query?: any) {
    const filter: Record<string, any> = {};
    if (query?.madrasaId) filter.madrasaId = query.madrasaId;
    if (query?.studentId) filter.studentId = query.studentId;
    if (query?.month) filter.month = query.month;
    if (query?.status) filter.status = query.status;

    return MadrasaFee.find(filter)
      .populate('studentId', 'admissionNumber name standard division guardianName guardianPhone')
      .populate('madrasaId', 'name code')
      .populate('familyId', 'familyCode name')
      .sort({ month: -1, createdAt: -1 });
  }

  static async recordFeePayment(data: any) {
    const student = await MadrasaStudent.findById(data.studentId);
    return MadrasaFee.create({
      ...data,
      familyId: data.familyId || student?.familyId,
      status: data.status || 'PAID',
      paidDate: data.status === 'PAID' ? new Date() : undefined,
      receiptNumber: data.receiptNumber || `MDR-FEE-${Date.now().toString().slice(-6)}`,
    });
  }

  static async updateFeeStatus(id: string, data: any) {
    const update: any = { ...data };
    if (data.status === 'PAID' && !data.paidDate) {
      update.paidDate = new Date();
    }
    return MadrasaFee.findByIdAndUpdate(id, update, { new: true });
  }

  /**
   * Creates a Razorpay Order for a pending Madrasa Tuition Fee
   */
  static async createFeeRazorpayOrder(feeId: string) {
    const fee = await MadrasaFee.findById(feeId)
      .populate('studentId')
      .populate('madrasaId')
      .populate('familyId');

    if (!fee) {
      throw ApiError.notFound('Madrasa tuition fee record not found');
    }

    if (fee.status === 'PAID') {
      throw ApiError.badRequest('This tuition fee has already been paid and verified');
    }

    const keyId = env.RAZORPAY_KEY_ID || 'rzp_test_SWHZJrawTUZSq9';
    const keySecret = env.RAZORPAY_KEY_SECRET || 'uSpgWfpwaudLUiVPyHTZsLo7';

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const amountInPaise = Math.round(fee.amount * 100);
    const studentName = (fee.studentId as any)?.name || 'Student';
    const receiptRef = (fee.receiptNumber || `MDR-${fee._id}`).slice(-40);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptRef,
      notes: {
        feeId: fee._id.toString(),
        studentId: (fee.studentId as any)?._id?.toString() || fee.studentId?.toString() || '',
        studentName,
        month: fee.month,
        feeType: fee.feeType,
      },
    });

    fee.razorpayOrderId = order.id;
    await fee.save();

    return {
      orderId: order.id,
      amount: fee.amount,
      amountInPaise,
      currency: 'INR',
      keyId,
      fee,
      studentName,
    };
  }

  /**
   * Verifies Razorpay payment signature for Madrasa Tuition Fee and updates to PAID
   */
  static async verifyFeeRazorpayPayment(
    feeId: string,
    data: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
    verifiedByUserId?: string
  ) {
    const fee = await MadrasaFee.findById(feeId)
      .populate('studentId')
      .populate('madrasaId')
      .populate('familyId');

    if (!fee) {
      throw ApiError.notFound('Madrasa tuition fee record not found');
    }

    if (fee.status === 'PAID') {
      return { fee, payment: await Payment.findOne({ madrasaFeeId: fee._id }) };
    }

    const keySecret = env.RAZORPAY_KEY_SECRET || 'uSpgWfpwaudLUiVPyHTZsLo7';

    // Verify HMAC-SHA256 signature
    const body = `${data.razorpay_order_id}|${data.razorpay_payment_id}`;
    const expectedSignature = crypto.createHmac('sha256', keySecret).update(body).digest('hex');

    if (expectedSignature !== data.razorpay_signature) {
      throw ApiError.badRequest('Razorpay payment signature verification failed');
    }

    const receiptNumber = `MDR-RCP-${new Date().getFullYear()}-${String(
      Math.floor(10000 + Math.random() * 90000)
    )}`;

    fee.status = 'PAID';
    fee.paidDate = new Date();
    fee.paymentMethod = 'ONLINE';
    fee.razorpayPaymentId = data.razorpay_payment_id;
    fee.transactionId = data.razorpay_payment_id;
    fee.receiptNumber = receiptNumber;

    // Create or update central Payment record for accounting and member portal
    let payment = await Payment.findOne({ madrasaFeeId: fee._id });
    if (!payment) {
      payment = await Payment.create({
        paymentNumber: `PAY-MDR-${fee.month.replace('-', '')}-${String(
          Math.floor(1000 + Math.random() * 9000)
        )}`,
        familyId: fee.familyId || (fee.studentId as any)?.familyId,
        amount: fee.amount,
        month: fee.month,
        type: 'TUITION',
        status: 'PAID',
        paymentMethod: 'ONLINE',
        receiptNumber,
        transactionId: data.razorpay_payment_id,
        razorpayOrderId: data.razorpay_order_id,
        razorpayPaymentId: data.razorpay_payment_id,
        studentId: (fee.studentId as any)?._id || fee.studentId,
        madrasaFeeId: fee._id,
        notes: `Madrasa Tuition Fee for ${(fee.studentId as any)?.name || 'Student'} (${fee.month})`,
        paidAt: new Date(),
        verifiedBy: verifiedByUserId as any,
      });
    } else {
      payment.status = 'PAID';
      payment.paymentMethod = 'ONLINE';
      payment.transactionId = data.razorpay_payment_id;
      payment.razorpayPaymentId = data.razorpay_payment_id;
      payment.receiptNumber = receiptNumber;
      payment.paidAt = new Date();
      await payment.save();
    }

    fee.paymentId = payment._id as any;
    await fee.save();

    // Notify family members
    const targetFamilyId = fee.familyId || (fee.studentId as any)?.familyId;
    if (targetFamilyId) {
      const members = await Member.find({
        familyId: targetFamilyId,
        userId: { $exists: true, $ne: null },
      });
      for (const m of members) {
        if (m.userId) {
          await Notification.create({
            recipient: m.userId,
            type: 'PAYMENT',
            title: 'Madrasa Tuition Fee Paid',
            message: `Tuition fee of ₹${fee.amount} for ${(fee.studentId as any)?.name || 'Student'} (${fee.month}) was successfully paid via Razorpay. Receipt: ${receiptNumber}`,
          });
        }
      }
    }

    return { fee, payment };
  }

  /**
   * Returns official Madrasa Fee invoice details
   */
  static async getFeeInvoice(feeId: string) {
    const fee = await MadrasaFee.findById(feeId)
      .populate('studentId')
      .populate('madrasaId')
      .populate({
        path: 'familyId',
        select: 'familyCode name address area phone monthlyContribution familyHead',
        populate: { path: 'familyHead', select: 'name phone email memberCode' },
      })
      .populate('paymentId');

    if (!fee) {
      throw ApiError.notFound('Madrasa fee record not found');
    }

    return fee;
  }

  // ─── Student Attendance ───────────────────────────────────────────────────
  static async listAttendance(query?: any) {
    const filter: Record<string, any> = {};
    if (query?.madrasaId) filter.madrasaId = query.madrasaId;
    if (query?.studentId) filter.studentId = query.studentId;
    if (query?.classId) filter.classId = query.classId;
    if (query?.date) {
      const d = new Date(query.date);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    return MadrasaAttendance.find(filter)
      .populate('studentId', 'admissionNumber name standard division rollNumber')
      .populate('classId', 'name standard division')
      .sort({ date: -1 });
  }

  static async recordAttendance(data: any) {
    // If array of records (bulk daily marking for a class)
    if (Array.isArray(data)) {
      const ops = data.map((record) => ({
        updateOne: {
          filter: { studentId: record.studentId, date: new Date(record.date) },
          update: { $set: record },
          upsert: true,
        },
      }));
      return MadrasaAttendance.bulkWrite(ops);
    }
    return MadrasaAttendance.findOneAndUpdate(
      { studentId: data.studentId, date: new Date(data.date) },
      data,
      { upsert: true, new: true }
    );
  }

  // ─── Madrasa Announcements ────────────────────────────────────────────────
  static async listAnnouncements(query?: any) {
    const filter: Record<string, any> = {};
    if (query?.madrasaId) filter.madrasaId = query.madrasaId;
    if (query?.status) filter.status = query.status;
    if (query?.targetAudience) filter.targetAudience = { $in: [query.targetAudience, 'ALL'] };

    return MadrasaAnnouncement.find(filter)
      .populate('madrasaId', 'name code')
      .sort({ publishedAt: -1 });
  }

  static async createAnnouncement(data: any) {
    return MadrasaAnnouncement.create(data);
  }

  static async deleteAnnouncement(id: string) {
    return MadrasaAnnouncement.findByIdAndDelete(id);
  }

  // ─── Students Roster ───────────────────────────────────────────────────────
  static async listStudents(userRole: UserRole, userId: string, query: any) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
    const skip = (page - 1) * limit;
    const filter: Record<string, any> = {};

    if (userRole === ROLES.MEMBER || userRole === ROLES.FAMILY_HEAD) {
      const member = await Member.findOne({ userId });
      if (!member?.familyId) return { items: [], page, limit, total: 0 };
      filter.familyId = member.familyId;
    }

    if (query.madrasaId) filter.madrasaId = query.madrasaId;
    if (query.classId) filter.classId = query.classId;
    if (query.standard) filter.standard = Number(query.standard);
    if (query.status) filter.status = query.status;
    if (query.gender) filter.gender = query.gender;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { admissionNumber: { $regex: query.search, $options: 'i' } },
        { guardianName: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      MadrasaStudent.find(filter)
        .populate('madrasaId', 'name code')
        .populate('classId', 'name standard division')
        .populate('familyId', 'familyCode name')
        .sort({ standard: 1, admissionNumber: 1 })
        .skip(skip)
        .limit(limit),
      MadrasaStudent.countDocuments(filter),
    ]);
    return { items, page, limit, total };
  }

  static async createStudent(data: any) {
    let admNo = data.admissionNumber;
    if (!admNo) {
      const count = await MadrasaStudent.countDocuments();
      admNo = `MDR-${String(count + 101).padStart(4, '0')}`;
    }

    // Auto link class if standard provided and classId is missing
    let classId = data.classId;
    if (!classId && data.standard && data.madrasaId) {
      const matchingClass = await MadrasaClass.findOne({
        madrasaId: data.madrasaId,
        standard: Number(data.standard),
        division: (data.division || 'A').toUpperCase(),
      });
      if (matchingClass) classId = matchingClass._id;
    }

    return MadrasaStudent.create({
      ...data,
      classId,
      admissionNumber: admNo,
      status: data.status || 'ACTIVE',
    });
  }

  static async updateStudent(id: string, data: any) {
    return MadrasaStudent.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteStudent(id: string) {
    return MadrasaStudent.findByIdAndDelete(id);
  }

  // ─── Usthad Faculty Teachers ──────────────────────────────────────────────
  static async listTeachers(query?: any) {
    const filter: Record<string, any> = {};
    if (query?.madrasaId) filter.madrasaId = query.madrasaId;
    return MadrasaTeacher.find(filter)
      .populate('madrasaId', 'name code')
      .sort({ name: 1 });
  }

  static async createTeacher(data: any) {
    return MadrasaTeacher.create(data);
  }

  static async updateTeacher(id: string, data: any) {
    return MadrasaTeacher.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteTeacher(id: string) {
    return MadrasaTeacher.findByIdAndDelete(id);
  }
}
