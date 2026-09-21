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
exports.HajjUmrahRegistration = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const hajjUmrahRegistrationSchema = new mongoose_1.Schema({
    postId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'HajjUmrahPost',
        required: true,
        index: true,
    },
    applicantName: {
        type: String,
        required: [true, 'Applicant name is required'],
        trim: true,
    },
    applicantPhone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        index: true,
    },
    applicantEmail: {
        type: String,
        required: [true, 'Email address is required'],
        trim: true,
        lowercase: true,
        index: true,
    },
    seats: {
        type: Number,
        default: 1,
        min: [1, 'Must register at least 1 seat'],
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },
    familyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Family',
    },
    passportNumber: {
        type: String,
        trim: true,
    },
    notes: {
        type: String,
        trim: true,
    },
    registrationRef: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    status: {
        type: String,
        enum: ['REGISTERED', 'CONFIRMED', 'CANCELLED'],
        default: 'REGISTERED',
        index: true,
    },
    emailSent: {
        type: Boolean,
        default: false,
    },
    emailSentAt: {
        type: Date,
    },
    travelsContactShared: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
exports.HajjUmrahRegistration = mongoose_1.default.model('HajjUmrahRegistration', hajjUmrahRegistrationSchema);
