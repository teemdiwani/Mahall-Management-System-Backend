import { Router } from 'express';
import { ApiResponse } from '../../utils/apiResponse.js';

const router = Router();

// Static rich schedule and sponsorship program
const ramadanSchedule = {
  year: 2026,
  hijriYear: '1447 AH',
  expectedStart: '2026-02-18',
  expectedEnd: '2026-03-19',
  dailyTimetable: [
    { day: 1, date: '2026-02-18', sehriEnd: '05:12 AM', fajr: '05:17 AM', iftar: '06:36 PM' },
    { day: 2, date: '2026-02-19', sehriEnd: '05:12 AM', fajr: '05:17 AM', iftar: '06:36 PM' },
    { day: 3, date: '2026-02-20', sehriEnd: '05:11 AM', fajr: '05:16 AM', iftar: '06:37 PM' },
    { day: 4, date: '2026-02-21', sehriEnd: '05:11 AM', fajr: '05:16 AM', iftar: '06:37 PM' },
    { day: 5, date: '2026-02-22', sehriEnd: '05:10 AM', fajr: '05:15 AM', iftar: '06:38 PM' },
  ],
  taraweehInfo: {
    rakaats: 20,
    startTime: '08:15 PM',
    hafizNames: ['Hafiz Salman Faizy', 'Hafiz Bilal Ahmed'],
  },
  iftarPrograms: [
    {
      date: 'Day 1 (Feb 18)',
      sponsor: 'Al-Noor Mahall Youth Wing',
      menu: 'Dates, Kanji, Fruit Salad, Samosa & Juice',
      expectedAttendees: 350,
      status: 'BOOKED',
    },
    {
      date: 'Day 2 (Feb 19)',
      sponsor: 'Bavu Haji Memorial Trust',
      menu: 'Traditional Malabar Kanji & Snacks',
      expectedAttendees: 300,
      status: 'BOOKED',
    },
    {
      date: 'Day 3 (Feb 20)',
      sponsor: 'Available for Sponsorship',
      menu: 'Open menu',
      expectedAttendees: 300,
      status: 'OPEN',
    },
  ],
};

router.get('/', (_req, res) => {
  return ApiResponse.success(res, ramadanSchedule);
});

export default router;
