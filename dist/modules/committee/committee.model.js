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
exports.CommitteeMeeting = exports.CommitteeMember = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const committeeMemberSchema = new mongoose_1.Schema({
    memberId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Member' },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    designation: {
        type: String,
        enum: ['PRESIDENT', 'VICE_PRESIDENT', 'SECRETARY', 'JOINT_SECRETARY', 'TREASURER', 'MEMBER'],
        required: true,
        index: true,
    },
    phone: { type: String, required: true },
    termStart: { type: Date, required: true },
    termEnd: { type: Date, required: true },
    status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'RESIGNED'], default: 'ACTIVE' },
}, { timestamps: true });
exports.CommitteeMember = mongoose_1.default.model('CommitteeMember', committeeMemberSchema);
const committeeMeetingSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    meetingDate: { type: Date, required: true, index: true },
    location: { type: String, default: 'Mahall Committee Hall' },
    agenda: [{ type: String }],
    minutes: { type: String },
    resolutions: [{ type: String }],
    status: {
        type: String,
        enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
        default: 'SCHEDULED',
    },
}, { timestamps: true });
exports.CommitteeMeeting = mongoose_1.default.model('CommitteeMeeting', committeeMeetingSchema);
