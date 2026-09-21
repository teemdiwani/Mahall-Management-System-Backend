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
exports.FamilyChangeRequest = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const familyChangeRequestSchema = new mongoose_1.Schema({
    requestCode: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    familyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Family',
        required: true,
        index: true,
    },
    requestedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    requestType: {
        type: String,
        enum: [
            'ADD_MEMBER',
            'REMOVE_MEMBER',
            'CHANGE_RELATIONSHIP',
            'CHANGE_FAMILY_HEAD',
            'UPDATE_FAMILY_INFORMATION',
            'TRANSFER_MEMBER',
        ],
        required: true,
        index: true,
    },
    targetMemberId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Member',
    },
    relationship: {
        type: String,
    },
    relatedToMemberId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Member',
    },
    newFamilyHeadId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Member',
    },
    updateData: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    proposedData: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    transferToFamilyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Family',
    },
    reason: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'],
        default: 'PENDING',
        index: true,
    },
    reviewedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    reviewedAt: {
        type: Date,
    },
    rejectionReason: {
        type: String,
        trim: true,
    },
    statusHistory: [
        {
            oldStatus: { type: String, required: true },
            newStatus: { type: String, required: true },
            changedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            comment: { type: String },
            timestamp: { type: Date, default: Date.now },
        },
    ],
}, {
    timestamps: true,
});
exports.FamilyChangeRequest = mongoose_1.default.model('FamilyChangeRequest', familyChangeRequestSchema);
