import { Member } from '../members/member.model.js';
import { Family } from '../families/family.model.js';
import { Payment } from '../payments/payment.model.js';
import { Expense } from '../finance/expense.model.js';
import { Application } from '../applications/application.model.js';
import { MadrasaStudent } from '../madrasa/madrasa.model.js';
import { Event } from '../events/event.model.js';
import { Funeral } from '../funeral/funeral.model.js';
import { Mosque } from '../mosque/mosque.model.js';
import { Announcement } from '../announcements/announcement.model.js';
import { CommitteeMeeting } from '../committee/committee.model.js';
import { Volunteer } from '../volunteers/volunteer.model.js';
import { MadrasaService } from '../madrasa/madrasa.service.js';
import { ROLES, type UserRole } from '../../constants/roles.js';

export class DashboardService {
  static async getAdminDashboard() {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const [
      totalMembers,
      totalFamilies,
      welfareCases,
      madrasaStudents,
      upcomingEvents,
      pendingApplications,
      recentDeaths,
      allPayments,
      allExpenses,
    ] = await Promise.all([
      Member.countDocuments({ membershipStatus: 'ACTIVE' }),
      Family.countDocuments({ status: 'ACTIVE' }),
      Application.countDocuments({ type: { $in: ['WELFARE', 'ZAKAT'] }, status: { $in: ['PENDING', 'UNDER_REVIEW'] } }),
      MadrasaStudent.countDocuments({ status: 'ACTIVE' }),
      Event.countDocuments({ status: 'UPCOMING', startDate: { $gte: new Date() } }),
      Application.countDocuments({ status: 'PENDING' }),
      Funeral.countDocuments(),
      Payment.find({ status: 'PAID' }),
      Expense.find(),
    ]);

    // Financial aggregates
    const expectedCollection = totalFamilies * 250;
    const monthlyCollected = allPayments
      .filter((p) => p.month === currentMonth && p.type === 'MONTHLY')
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingMonthly = Math.max(0, expectedCollection - monthlyCollected);
    const totalDonations = allPayments
      .filter((p) => p.type === 'DONATION')
      .reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = allExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0);

    // Population by gender
    const genderDist = await Member.aggregate([
      { $match: { membershipStatus: 'ACTIVE' } },
      { $group: { _id: '$gender', count: { $sum: 1 } } },
    ]);

    // Families by area
    const familiesByArea = await Family.aggregate([
      { $match: { status: 'ACTIVE' } },
      { $group: { _id: '$area', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    // Monthly revenue trend (last 12 months)
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'PAID', month: { $exists: true, $ne: null } } },
      { $group: { _id: '$month', amount: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);

    // Monthly expenses trend
    const monthlyExpenses = await Expense.aggregate([
      {
        $group: {
          _id: { $substr: ['$date', 0, 7] },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);

    // Merged Monthly Trends (collections vs expenses)
    const expenseMap = new Map(monthlyExpenses.map((e) => [e._id, e.amount]));
    const allMonths = Array.from(new Set([...monthlyRevenue.map((r) => r._id), ...monthlyExpenses.map((e) => e._id)])).sort();
    const monthlyTrends = allMonths.map((m) => ({
      month: m,
      collections: monthlyRevenue.find((r) => r._id === m)?.amount || 0,
      expenses: expenseMap.get(m) || 0,
    }));

    // Expenses by Category
    const expensesByCategory = await Expense.aggregate([
      { $group: { _id: '$category', amount: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { amount: -1 } },
    ]);

    // Membership Growth by Month
    const membershipGrowth = await Member.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' },
          },
          members: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Real Recent Activities from live collections
    const [recentPayments, recentMembersList, recentApplicationsList, activeAnnouncements] = await Promise.all([
      Payment.find({ status: 'PAID' })
        .populate('familyId', 'familyCode name')
        .sort({ paidAt: -1, createdAt: -1 })
        .limit(5)
        .lean(),
      Member.find({ membershipStatus: 'ACTIVE' })
        .populate('familyId', 'name familyCode')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Application.find()
        .populate('applicant', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Announcement.find({ status: 'ACTIVE' })
        .sort({ publishedAt: -1 })
        .limit(3)
        .lean(),
    ]);

    return {
      cards: {
        totalMembers,
        totalFamilies,
        monthlyCollection: monthlyCollected,
        expectedMonthly: expectedCollection,
        pendingPayments: pendingMonthly,
        welfareCases,
        madrasaStudents,
        upcomingEvents,
        pendingApplications,
        recentDeaths,
        totalRevenue,
        totalExpenses,
        netBalance: totalRevenue - totalExpenses,
      },
      charts: {
        genderDist: genderDist.map((g) => ({ gender: g._id, count: g.count })),
        familiesByArea: familiesByArea.map((a) => ({ area: a._id || 'General', count: a.count })),
        monthlyRevenue: monthlyRevenue.map((r) => ({ month: r._id, amount: r.amount, count: r.count })),
        monthlyTrends,
        expensesByCategory: expensesByCategory.map((c) => ({ category: c._id, amount: c.amount, count: c.count })),
        membershipGrowth: membershipGrowth.map((g) => ({ month: g._id, members: g.members })),
      },
      recentActivities: [
        ...recentPayments.map((p: any) => ({
          id: `pay-${p._id}`,
          type: 'PAYMENT',
          title: `Payment Received: ₹${p.amount}`,
          subtitle: `${p.familyId?.name || 'Family'} (${p.type}) • Receipt ${p.receiptNumber || p.paymentNumber}`,
          timestamp: p.paidAt || p.createdAt,
        })),
        ...recentMembersList.map((m: any) => ({
          id: `mem-${m._id}`,
          type: 'MEMBER',
          title: `New Member Registered: ${m.name}`,
          subtitle: `${m.familyId?.name || 'Family'} • ${m.relationship} • ${m.occupation || 'Member'}`,
          timestamp: m.createdAt,
        })),
        ...recentApplicationsList.map((a: any) => ({
          id: `app-${a._id}`,
          type: 'APPLICATION',
          title: `Application: ${a.type}`,
          subtitle: `Status: ${a.status} • Applicant: ${a.applicant?.name || 'User'}`,
          timestamp: a.createdAt,
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10),
      announcements: activeAnnouncements,
    };
  }

  static async getDashboardStats() {
    const adminData = await DashboardService.getAdminDashboard();
    return adminData.cards;
  }

  static async getDashboardCharts() {
    const adminData = await DashboardService.getAdminDashboard();
    return adminData.charts;
  }

  static async getMemberDashboard(
    userId: string,
    email?: string,
    phone?: string,
    searchNumber?: string
  ) {
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Dynamic import to prevent circular dependency
    const { findFamilyAndMemberForUser } = await import('../../utils/memberMatcher.js');

    // Flexible matching: matches user credentials, ANY member's phone number, or family phone/code
    const match = await findFamilyAndMemberForUser({
      userId,
      email,
      phone,
      searchNumber,
    });

    const member = match.currentMember;
    const family = match.family;
    const familyHead = match.familyHead;
    const familyMembers = match.familyMembers;
    const familyMembersCount = match.familyMembersCount;

    let myPayments: any[] = [];
    if (family?._id) {
      myPayments = await Payment.find({ familyId: family._id }).sort({ createdAt: -1 }).limit(5);
    }

    const myApplications = await Application.find({
      $or: [
        { applicant: userId },
        ...(family?._id ? [{ familyId: family._id }] : []),
      ],
    }).sort({ createdAt: -1 }).limit(5);

    const mosque = await Mosque.findOne();
    const announcements = await Announcement.find({
      status: 'ACTIVE',
      targetAudience: { $in: ['ALL', 'MEMBERS'] },
    })
      .sort({ publishedAt: -1 })
      .limit(4);

    const upcomingEvents = await Event.find({ status: 'UPCOMING', startDate: { $gte: new Date() } })
      .sort({ startDate: 1 })
      .limit(3);

    // Dues calculation
    const hasPaidCurrentMonth = myPayments.some(
      (p) => p.month === currentMonth && p.type === 'MONTHLY' && p.status === 'PAID'
    );

    const madrasaParentPortal = await MadrasaService.getParentPortal(userId, email, phone).catch(() => ({
      hasChildrenInMadrasa: false,
      students: [],
      announcements: [],
      stats: null,
    }));

    return {
      member,
      family,
      familyHead,
      familyMembers, // Full details of all members in the family
      familyMembersCount,
      currentMonthDuesStatus: hasPaidCurrentMonth ? 'PAID' : 'PENDING',
      duesAmount: family?.monthlyContribution || 250,
      recentPayments: myPayments,
      recentApplications: myApplications,
      mosquePrayerTimings: mosque?.prayerTimings || null,
      jumahDetails: mosque?.jumahDetails || null,
      announcements,
      upcomingEvents,
      madrasaParentPortal,
    };
  }

  static async getTreasurerDashboard() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const activeFamilies = await Family.find({ status: 'ACTIVE' }, 'monthlyContribution');
    const expected = activeFamilies.reduce((sum, f) => sum + (f.monthlyContribution || 250), 0);

    const [paidMonthlyAgg, allIncomeAgg, allExpensesAgg, pendingCount, recentPayments, recentExpenses, monthlyIncomeAgg, monthlyExpensesAgg] =
      await Promise.all([
        Payment.aggregate([
          { $match: { month: currentMonth, type: 'MONTHLY', status: 'PAID' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Payment.aggregate([
          { $match: { status: 'PAID' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
        Payment.countDocuments({ status: 'PENDING' }),
        Payment.find().populate('familyId', 'familyCode name').sort({ createdAt: -1 }).limit(8),
        Expense.find().sort({ date: -1 }).limit(8),
        Payment.aggregate([
          { $match: { status: 'PAID', month: { $exists: true, $ne: null } } },
          { $group: { _id: '$month', amount: { $sum: '$amount' } } },
          { $sort: { _id: 1 } },
        ]),
        Expense.aggregate([
          {
            $group: {
              _id: { $substr: ['$date', 0, 7] },
              amount: { $sum: '$amount' },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

    const collected = paidMonthlyAgg[0]?.total || 0;
    const totalIncome = allIncomeAgg[0]?.total || 0;
    const totalExpenses = allExpensesAgg[0]?.total || 0;

    const expenseMap = new Map(monthlyExpensesAgg.map((e) => [e._id, e.amount]));
    const allMonths = Array.from(
      new Set([
        ...monthlyIncomeAgg.map((r) => r._id),
        ...monthlyExpensesAgg.map((e) => e._id),
        currentMonth,
      ])
    ).sort();

    const monthlyTrend = allMonths.slice(-6).map((m) => {
      const inc = monthlyIncomeAgg.find((r) => r._id === m)?.amount || 0;
      const exp = expenseMap.get(m) || 0;
      return {
        month: m,
        amount: inc,
        income: inc,
        expenses: exp,
      };
    });

    return {
      cards: {
        expectedCollection: expected,
        collectedMonthly: collected,
        pendingMonthly: Math.max(0, expected - collected),
        pendingCount,
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
      },
      charts: {
        monthlyTrend,
      },
      recentPayments,
      recentExpenses,
    };
  }

  static async getSecretaryDashboard() {
    const [
      totalMembers,
      totalFamilies,
      pendingApplications,
      upcomingEvents,
      upcomingMeetings,
      totalVolunteers,
      recentAnnouncements,
      recentApplications,
    ] = await Promise.all([
      Member.countDocuments({ membershipStatus: 'ACTIVE' }),
      Family.countDocuments({ status: 'ACTIVE' }),
      Application.countDocuments({ status: 'PENDING' }),
      Event.countDocuments({ status: 'UPCOMING', startDate: { $gte: new Date() } }),
      CommitteeMeeting.countDocuments({ status: 'SCHEDULED', meetingDate: { $gte: new Date() } }),
      Volunteer.countDocuments({ status: 'ACTIVE' }),
      Announcement.find({ status: 'ACTIVE' }).sort({ publishedAt: -1 }).limit(5),
      Application.find({ status: 'PENDING' })
        .populate('applicant', 'name email')
        .populate('family', 'familyCode name')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    return {
      cards: {
        totalMembers,
        totalFamilies,
        pendingApplications,
        upcomingEvents,
        upcomingMeetings,
        totalVolunteers,
      },
      recentAnnouncements,
      recentApplications,
    };
  }

  static async getImamDashboard() {
    const mosque = await Mosque.findOne();
    const upcomingEvents = await Event.find({ status: 'UPCOMING', category: 'RELIGIOUS' })
      .sort({ startDate: 1 })
      .limit(5);
    const recentFunerals = await Funeral.find().sort({ dateOfDeath: -1 }).limit(4);

    return {
      mosque,
      upcomingEvents,
      recentFunerals,
    };
  }
}
