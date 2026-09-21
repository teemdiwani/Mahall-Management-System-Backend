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
exports.Member = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const memberSchema = new mongoose_1.Schema({
    memberCode: {
        type: String,
        unique: true,
        sparse: true,
        uppercase: true,
        trim: true,
        index: true,
    },
    name: {
        type: String,
        required: [true, 'Member name is required'],
        trim: true,
        index: true,
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required'],
    },
    gender: {
        type: String,
        enum: ['MALE', 'FEMALE', 'OTHER'],
        required: true,
    },
    phone: {
        type: String,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        index: true,
    },
    familyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Family',
        required: false,
        index: true,
    },
    relationship: {
        type: String,
        enum: ['HEAD', 'SPOUSE', 'SON', 'DAUGHTER', 'FATHER', 'MOTHER', 'BROTHER', 'SISTER', 'GRANDFATHER', 'GRANDMOTHER', 'OTHER'],
        default: 'OTHER',
    },
    occupation: {
        type: String,
        trim: true,
    },
    education: {
        type: String,
        trim: true,
    },
    membershipStatus: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'DECEASED'],
        default: 'ACTIVE',
        index: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        sparse: true,
        index: true,
    },
}, {
    timestamps: true,
});
exports.Member = mongoose_1.default.model('Member', memberSchema);
