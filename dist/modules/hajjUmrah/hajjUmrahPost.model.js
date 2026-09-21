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
exports.HajjUmrahPost = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const hajjUmrahPostSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Package title is required'],
        trim: true,
    },
    type: {
        type: String,
        enum: ['HAJJ', 'UMRAH'],
        default: 'HAJJ',
        index: true,
    },
    travelsName: {
        type: String,
        required: [true, 'Travel agency name is required'],
        trim: true,
        index: true,
    },
    contactPerson: {
        type: String,
        trim: true,
    },
    contactPhone: {
        type: String,
        required: [true, 'Travel agency phone number is required'],
        trim: true,
    },
    contactEmail: {
        type: String,
        trim: true,
        lowercase: true,
    },
    totalSlots: {
        type: Number,
        required: [true, 'Total slots count is required'],
        min: [1, 'Must have at least 1 slot'],
        default: 20,
    },
    bookedSlots: {
        type: Number,
        default: 0,
        min: 0,
    },
    estimatedPrice: {
        type: String,
        trim: true,
    },
    departureDate: {
        type: Date,
    },
    returnDate: {
        type: Date,
    },
    registrationDeadline: {
        type: Date,
    },
    description: {
        type: String,
        required: [true, 'Package description is required'],
        trim: true,
    },
    features: {
        type: [String],
        default: [],
    },
    status: {
        type: String,
        enum: ['OPEN', 'FULL', 'CLOSED'],
        default: 'OPEN',
        index: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Virtual for remaining slots
hajjUmrahPostSchema.virtual('availableSlots').get(function () {
    return Math.max(0, (this.totalSlots || 0) - (this.bookedSlots || 0));
});
exports.HajjUmrahPost = mongoose_1.default.model('HajjUmrahPost', hajjUmrahPostSchema);
