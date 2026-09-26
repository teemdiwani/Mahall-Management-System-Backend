"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const member_model_js_1 = require("../members/member.model.js");
const family_model_js_1 = require("../families/family.model.js");
const payment_model_js_1 = require("../payments/payment.model.js");
const expense_model_js_1 = require("../finance/expense.model.js");
const application_model_js_1 = require("../applications/application.model.js");
const madrasa_model_js_1 = require("../madrasa/madrasa.model.js");
const event_model_js_1 = require("../events/event.model.js");
const funeral_model_js_1 = require("../funeral/funeral.model.js");
const mosque_model_js_1 = require("../mosque/mosque.model.js");
const announcement_model_js_1 = require("../announcements/announcement.model.js");
const committee_model_js_1 = require("../committee/committee.model.js");
const volunteer_model_js_1 = require("../volunteers/volunteer.model.js");
const madrasa_service_js_1 = require("../madrasa/madrasa.service.js");
class DashboardService {
    static async getAdminDashboard() {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const [totalMembers, totalFamilies, welfareCases, madrasaStudents, upcomingEvents, pendingApplications, recentDeaths, allPayments, allExpenses,] = await Promise.all([
            member_model_js_1.Member.countDocuments({ membershipStatus: 'ACTIVE' }),
            family_model_js_1.Family.countDocuments({ status: 'ACTIVE' }),
            application_model_js_1.Application.countDocuments({ type: { $in: ['WELFARE', 'ZAKAT'] }, status: { $in: ['PENDING', 'UNDER_REVIEW'] } }),
            madrasa_model_js_1.MadrasaStudent.countDocuments({ status: 'ACTIVE' }),
            event_model_js_1.Event.countDocuments({ status: 'UPCOMING', startDate: { $gte: new Date() } }),
            application_model_js_1.Application.countDocuments({ status: 'PENDING' }),
            funeral_model_js_1.Funeral.countDocuments(),
            payment_model_js_1.Payment.find({ status: 'PAID' }),
            expense_model_js_1.Expense.find(),
        ]);
        // Financial aggregates from real MongoDB data
        const activeFamiliesList = await family_model_js_1.Family.find({ status: 'ACTIVE' }, 'monthlyContribution');
        const expectedCollection = activeFamiliesList.reduce((sum, f) => sum + (f.monthlyContribution || 250), 0);
        const monthlyCollected = allPayments
            .filter((p) => p.type === 'MONTHLY' && (p.month === currentMonth || (p.paidAt && new Date(p.paidAt).toISOString().slice(0, 7) === currentMonth)))
            .reduce((sum, p) => sum + p.amount, 0);
        const pendingMonthly = Math.max(0, expectedCollection - monthlyCollected);
        const totalDonations = allPayments
            .filter((p) => p.type === 'DONATION')
            .reduce((sum, p) => sum + p.amount, 0);
        const totalExpenses = allExpenses.reduce((sum, e) => sum + e.amount, 0);
        const totalRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0);
        // Population by gender
        const genderDist = await member_model_js_1.Member.aggregate([
            { $match: { membershipStatus: 'ACTIVE' } },
            { $group: { _id: '$gender', count: { $sum: 1 } } },
        ]);
        // Families by area
        const familiesByArea = await family_model_js_1.Family.aggregate([
            { $match: { status: 'ACTIVE' } },
            { $group: { _id: '$area', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 },
        ]);
        // Monthly revenue trend (last 12 months)
        const monthlyRevenue = await payment_model_js_1.Payment.aggregate([
            { $match: { status: 'PAID', month: { $exists: true, $ne: null } } },
            { $group: { _id: '$month', amount: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $limit: 12 },
        ]);
        // Monthly expenses trend
        const monthlyExpenses = await expense_model_js_1.Expense.aggregate([
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
        const expensesByCategory = await expense_model_js_1.Expense.aggregate([
            { $group: { _id: '$category', amount: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $sort: { amount: -1 } },
        ]);
        // Membership Growth by Month
        const membershipGrowth = await member_model_js_1.Member.aggregate([
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
            payment_model_js_1.Payment.find({ status: 'PAID' })
                .populate('familyId', 'familyCode name')
                .sort({ paidAt: -1, createdAt: -1 })
                .limit(5)
                .lean(),
            member_model_js_1.Member.find({ membershipStatus: 'ACTIVE' })
                .populate('familyId', 'name familyCode')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            application_model_js_1.Application.find()
                .populate('applicant', 'name email')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            announcement_model_js_1.Announcement.find({ status: 'ACTIVE' })
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
                ...recentPayments.map((p) => ({
                    id: `pay-${p._id}`,
                    type: 'PAYMENT',
                    title: `Payment Received: ₹${p.amount}`,
                    subtitle: `${p.familyId?.name || 'Family'} (${p.type}) • Receipt ${p.receiptNumber || p.paymentNumber}`,
                    timestamp: p.paidAt || p.createdAt,
                })),
                ...recentMembersList.map((m) => ({
                    id: `mem-${m._id}`,
                    type: 'MEMBER',
                    title: `New Member Registered: ${m.name}`,
                    subtitle: `${m.familyId?.name || 'Family'} • ${m.relationship} • ${m.occupation || 'Member'}`,
                    timestamp: m.createdAt,
                })),
                ...recentApplicationsList.map((a) => ({
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
    static async getMemberDashboard(userId, email, phone, searchNumber) {
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
        let myPayments = [];
        if (family?._id) {
            myPayments = await payment_model_js_1.Payment.find({ familyId: family._id }).sort({ createdAt: -1 }).limit(5);
        }
        const myApplications = await application_model_js_1.Application.find({
            $or: [
                { applicant: userId },
                ...(family?._id ? [{ familyId: family._id }] : []),
            ],
        }).sort({ createdAt: -1 }).limit(5);
        const mosque = await mosque_model_js_1.Mosque.findOne();
        const announcements = await announcement_model_js_1.Announcement.find({
            status: 'ACTIVE',
            targetAudience: { $in: ['ALL', 'MEMBERS'] },
        })
            .sort({ publishedAt: -1 })
            .limit(4);
        const upcomingEvents = await event_model_js_1.Event.find({ status: 'UPCOMING', startDate: { $gte: new Date() } })
            .sort({ startDate: 1 })
            .limit(3);
        // Dues calculation
        const hasPaidCurrentMonth = myPayments.some((p) => p.month === currentMonth && p.type === 'MONTHLY' && p.status === 'PAID');
        const madrasaParentPortal = await madrasa_service_js_1.MadrasaService.getParentPortal(userId, email, phone).catch(() => ({
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
        const activeFamilies = await family_model_js_1.Family.find({ status: 'ACTIVE' }, 'monthlyContribution');
        const expected = activeFamilies.reduce((sum, f) => sum + (f.monthlyContribution || 250), 0);
        const [paidMonthlyAgg, allIncomeAgg, allExpensesAgg, pendingCount, recentPayments, recentExpenses, monthlyIncomeAgg, monthlyExpensesAgg] = await Promise.all([
            payment_model_js_1.Payment.aggregate([
                { $match: { month: currentMonth, type: 'MONTHLY', status: 'PAID' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            payment_model_js_1.Payment.aggregate([
                { $match: { status: 'PAID' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            expense_model_js_1.Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
            payment_model_js_1.Payment.countDocuments({ status: 'PENDING' }),
            payment_model_js_1.Payment.find().populate('familyId', 'familyCode name').sort({ createdAt: -1 }).limit(8),
            expense_model_js_1.Expense.find().sort({ date: -1 }).limit(8),
            payment_model_js_1.Payment.aggregate([
                { $match: { status: 'PAID', month: { $exists: true, $ne: null } } },
                { $group: { _id: '$month', amount: { $sum: '$amount' } } },
                { $sort: { _id: 1 } },
            ]),
            expense_model_js_1.Expense.aggregate([
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
        const allMonths = Array.from(new Set([
            ...monthlyIncomeAgg.map((r) => r._id),
            ...monthlyExpensesAgg.map((e) => e._id),
            currentMonth,
        ])).sort();
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
        const [totalMembers, totalFamilies, pendingApplications, upcomingEvents, upcomingMeetings, totalVolunteers, recentAnnouncements, recentApplications,] = await Promise.all([
            member_model_js_1.Member.countDocuments({ membershipStatus: 'ACTIVE' }),
            family_model_js_1.Family.countDocuments({ status: 'ACTIVE' }),
            application_model_js_1.Application.countDocuments({ status: 'PENDING' }),
            event_model_js_1.Event.countDocuments({ status: 'UPCOMING', startDate: { $gte: new Date() } }),
            committee_model_js_1.CommitteeMeeting.countDocuments({ status: 'SCHEDULED', meetingDate: { $gte: new Date() } }),
            volunteer_model_js_1.Volunteer.countDocuments({ status: 'ACTIVE' }),
            announcement_model_js_1.Announcement.find({ status: 'ACTIVE' }).sort({ publishedAt: -1 }).limit(5),
            application_model_js_1.Application.find({ status: 'PENDING' })
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
        const mosque = await mosque_model_js_1.Mosque.findOne();
        const upcomingEvents = await event_model_js_1.Event.find({ status: 'UPCOMING', category: 'RELIGIOUS' })
            .sort({ startDate: 1 })
            .limit(5);
        const recentFunerals = await funeral_model_js_1.Funeral.find().sort({ dateOfDeath: -1 }).limit(4);
        return {
            mosque,
            upcomingEvents,
            recentFunerals,
        };
    }
}
exports.DashboardService = DashboardService;
