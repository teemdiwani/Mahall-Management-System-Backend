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
exports.Payment = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const paymentSchema = new mongoose_1.Schema({
    paymentNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    familyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Family',
        required: false,
        index: true,
    },
    memberId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Member',
        index: true,
    },
    studentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'MadrasaStudent',
        index: true,
    },
    madrasaFeeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'MadrasaFee',
        index: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    month: {
        type: String, // format YYYY-MM
        index: true,
    },
    type: {
        type: String,
        enum: ['MONTHLY', 'DONATION', 'ZAKAT', 'FITRAH', 'IFTAR', 'EVENT', 'TUITION', 'OTHER'],
        default: 'MONTHLY',
        index: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED'],
        default: 'PENDING',
        index: true,
    },
    paymentMethod: {
        type: String,
        enum: ['CASH', 'BANK_TRANSFER', 'ONLINE', 'UPI'],
        default: 'ONLINE',
    },
    transactionId: {
        type: String,
    },
    receiptNumber: {
        type: String,
        sparse: true,
        index: true,
    },
    verifiedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    notes: {
        type: String,
    },
    paidAt: {
        type: Date,
    },
    razorpayOrderId: {
        type: String,
        index: true,
    },
    razorpayPaymentId: {
        type: String,
        index: true,
    },
}, {
    timestamps: true,
});
exports.Payment = mongoose_1.default.model('Payment', paymentSchema);
