import { Mosque } from './mosque.model.js';

export class MosqueService {
  static async getMosqueInfo() {
    let mosque = await Mosque.findOne();
    if (!mosque) {
      mosque = await Mosque.create({
        name: 'Al-Noor Central Juma Masjid',
        address: 'Mosque Road, North Ward, Mahall District',
        phone: '+91 495 2345678',
        email: 'masjid@mahallconnect.org',
        imamName: 'Usthad Abdullah Faizy',
        khatibName: 'Usthad Abdullah Faizy',
        muezzinName: 'Bilal Ahmed',
        capacity: 1200,
        prayerTimings: {
          fajr: '05:15 AM',
          dhuhr: '12:35 PM',
          asr: '04:15 PM',
          maghrib: '06:35 PM',
          isha: '08:00 PM',
          jumah: '12:45 PM',
        },
        jumahDetails: {
          khatib: 'Usthad Abdullah Faizy',
          topic: 'Strengthening Mahall Brotherhood & Mutual Support',
          khutbahTime: '12:30 PM',
          prayerTime: '01:00 PM',
        },
        programs: [
          {
            title: 'Daily Darsul Quran',
            dayTime: 'Daily after Fajr (30 mins)',
            instructor: 'Usthad Abdullah Faizy',
            description: 'Tafseer of selected Surahs with practical lessons',
          },
          {
            title: 'Weekly Hadith Majlis',
            dayTime: 'Every Thursday after Maghrib',
            instructor: 'Usthad Abdullah Faizy',
            description: 'Riyad us-Saliheen reading and community du’a',
          },
        ],
      });
    }
    return mosque;
  }

  static async updatePrayerTimings(prayerTimings: any, jumahDetails: any) {
    const mosque = await this.getMosqueInfo();
    if (prayerTimings) mosque.prayerTimings = { ...mosque.prayerTimings, ...prayerTimings };
    if (jumahDetails) mosque.jumahDetails = { ...mosque.jumahDetails, ...jumahDetails };
    await mosque.save();
    return mosque;
  }

  static async updatePrograms(programs: any[]) {
    const mosque = await this.getMosqueInfo();
    mosque.programs = programs;
    await mosque.save();
    return mosque;
  }
}
