import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IMosque extends Document {
  name: string;
  address: string;
  phone: string;
  email?: string;
  imamName: string;
  khatibName?: string;
  muezzinName?: string;
  capacity: number;
  prayerTimings: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    jumah: string;
  };
  jumahDetails: {
    khatib: string;
    topic: string;
    khutbahTime: string;
    prayerTime: string;
  };
  programs: {
    title: string;
    dayTime: string;
    instructor: string;
    description: string;
  }[];
}

const mosqueSchema = new Schema<IMosque>(
  {
    name: { type: String, required: true, default: 'Al-Noor Central Juma Masjid' },
    address: { type: String, required: true, default: 'Mosque Road, North Ward, Mahall District' },
    phone: { type: String, required: true, default: '+91 495 2345678' },
    email: { type: String, default: 'masjid@mahallconnect.org' },
    imamName: { type: String, required: true, default: 'Usthad Abdullah Faizy' },
    khatibName: { type: String, default: 'Usthad Abdullah Faizy' },
    muezzinName: { type: String, default: 'Bilal Ahmed' },
    capacity: { type: Number, default: 1200 },
    prayerTimings: {
      fajr: { type: String, default: '05:15 AM' },
      dhuhr: { type: String, default: '12:35 PM' },
      asr: { type: String, default: '04:15 PM' },
      maghrib: { type: String, default: '06:35 PM' },
      isha: { type: String, default: '08:00 PM' },
      jumah: { type: String, default: '12:45 PM' },
    },
    jumahDetails: {
      khatib: { type: String, default: 'Usthad Abdullah Faizy' },
      topic: { type: String, default: 'Strengthening Mahall Brotherhood & Mutual Support' },
      khutbahTime: { type: String, default: '12:30 PM' },
      prayerTime: { type: String, default: '01:00 PM' },
    },
    programs: [
      {
        title: { type: String, required: true },
        dayTime: { type: String, required: true },
        instructor: { type: String, required: true },
        description: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const Mosque: Model<IMosque> = mongoose.model<IMosque>('Mosque', mosqueSchema);
