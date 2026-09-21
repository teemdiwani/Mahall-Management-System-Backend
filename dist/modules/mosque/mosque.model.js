"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mosque = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const mosqueSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
exports.Mosque = mongoose_1.default.model('Mosque', mosqueSchema);
