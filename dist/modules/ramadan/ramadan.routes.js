"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
const payment_model_js_1 = require("../payments/payment.model.js");
const router = (0, express_1.Router)();
router.get('/', async (_req, res, next) => {
    try {
        const [iftarPayments, zakatPayments, fitrahPayments] = await Promise.all([
            payment_model_js_1.Payment.find({
                status: 'PAID',
                $or: [{ type: 'IFTAR' }, { notes: { $regex: /iftar/i } }],
            })
                .populate('familyId', 'name familyCode')
                .populate('memberId', 'name')
                .sort({ paidAt: -1 })
                .limit(20),
            payment_model_js_1.Payment.aggregate([
                { $match: { type: 'ZAKAT', status: 'PAID' } },
                { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
            ]),
            payment_model_js_1.Payment.aggregate([
                { $match: { type: 'FITRAH', status: 'PAID' } },
                { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
            ]),
        ]);
        const totalIftarRaised = iftarPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
        const totalZakatRaised = zakatPayments[0]?.total || 0;
        const totalFitrahRaised = fitrahPayments[0]?.total || 0;
        // Build dynamic iftar programs merging seeded days and live sponsors
        const iftarPrograms = [
            {
                date: 'Day 1',
                sponsor: 'Al-Noor Mahall Youth Wing',
                venue: 'Mahall Hall',
                menu: 'Dates, Traditional Malabar Kanji, Fruit Salad & Juice',
                count: 350,
                status: 'BOOKED',
            },
            {
                date: 'Day 2',
                sponsor: 'Bavu Haji Memorial Trust',
                venue: 'Mosque Grounds',
                menu: 'Dates, Kanji, Samosa, Cutlet & Tea',
                count: 300,
                status: 'BOOKED',
            },
            ...iftarPayments.map((p, idx) => {
                const donorMatch = p.notes?.match(/Donor:\s*([^|]+)/);
                const donor = donorMatch
                    ? donorMatch[1].trim()
                    : p.familyId?.name || p.memberId?.name || 'Community Donor';
                return {
                    date: `Special Day ${idx + 3}`,
                    sponsor: donor,
                    venue: 'Mahall Dining Hall',
                    menu: 'Grand Community Iftar & Special Beverages',
                    count: Math.max(150, Math.floor(p.amount / 20)),
                    status: 'BOOKED',
                    amount: p.amount,
                    receiptNumber: p.receiptNumber,
                };
            }),
            {
                date: 'Day 27 (Lailatul Qadr)',
                sponsor: 'Grand Mahall Community Sponsorship',
                venue: 'Central Juma Masjid Grounds',
                menu: 'Special Biryani & Dessert',
                count: 650,
                status: 'OPEN',
            },
        ];
        const data = {
            year: 2026,
            hijriYear: '1447 AH',
            expectedStart: '2026-02-18',
            expectedEnd: '2026-03-19',
            fitrahRate: 100, // INR per head
            stats: {
                totalIftarRaised,
                iftarSponsorsCount: iftarPayments.length,
                totalZakatRaised,
                totalFitrahRaised,
                activePrograms: iftarPrograms.length,
            },
            dailyTimetable: [
                { date: '2026-02-18', suhoorEnd: '05:12 AM', fajr: '05:17 AM', iftar: '06:36 PM' },
                { date: '2026-02-19', suhoorEnd: '05:12 AM', fajr: '05:17 AM', iftar: '06:36 PM' },
                { date: '2026-02-20', suhoorEnd: '05:11 AM', fajr: '05:16 AM', iftar: '06:37 PM' },
                { date: '2026-02-21', suhoorEnd: '05:11 AM', fajr: '05:16 AM', iftar: '06:37 PM' },
                { date: '2026-02-22', suhoorEnd: '05:10 AM', fajr: '05:15 AM', iftar: '06:38 PM' },
                { date: '2026-02-23', suhoorEnd: '05:10 AM', fajr: '05:15 AM', iftar: '06:38 PM' },
                { date: '2026-02-24', suhoorEnd: '05:09 AM', fajr: '05:14 AM', iftar: '06:39 PM' },
            ],
            taraweehInfo: {
                rakaats: 20,
                startTime: '08:15 PM',
                hafizNames: ['Hafiz Salman Faizy', 'Hafiz Bilal Ahmed'],
            },
            iftarPrograms,
            recentSponsors: iftarPayments.slice(0, 5),
        };
        return apiResponse_js_1.ApiResponse.success(res, data);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
