"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.verifyResetOtpSchema = exports.forgotPasswordSchema = exports.googleAuthSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    phone: zod_1.z.string().min(10, 'Phone number is required (min 10 digits)'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.googleAuthSchema = zod_1.z.object({
    credential: zod_1.z.string().min(1, 'Google credential token is required'),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Please enter a valid email address'),
});
exports.verifyResetOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email('Please enter a valid email address'),
    otp: zod_1.z.string().length(6, 'Verification code must be exactly 6 digits'),
});
exports.resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Please enter a valid email address'),
    otp: zod_1.z.string().length(6, 'Verification code must be exactly 6 digits'),
    newPassword: zod_1.z.string().min(6, 'New password must be at least 6 characters'),
});
