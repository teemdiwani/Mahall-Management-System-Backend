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
exports.Application = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const applicationSchema = new mongoose_1.Schema({
    applicationNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    applicant: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    member: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Member',
        index: true,
    },
    family: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Family',
        index: true,
    },
    type: {
        type: String,
        enum: [
            'ZAKAT',
            'WELFARE',
            'MARRIAGE',
            'FUNERAL',
            'HAJJ',
            'UMRAH',
            'CERTIFICATE',
            'FACILITY_BOOKING',
            'EDUCATION_AID',
            'GENERAL_REQUEST',
            'OTHER',
        ],
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED'],
        default: 'PENDING',
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    requestedAmount: {
        type: Number,
        min: 0,
    },
    documents: [
        {
            fileName: { type: String, required: true },
            fileUrl: { type: String, required: true },
            uploadedAt: { type: Date, default: Date.now },
        },
    ],
    reviewer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    reviewNotes: {
        type: String,
    },
    decision: {
        type: String,
    },
    decisionAt: {
        type: Date,
    },
    completedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});
exports.Application = mongoose_1.default.model('Application', applicationSchema);
