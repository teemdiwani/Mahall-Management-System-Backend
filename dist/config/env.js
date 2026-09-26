"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('5000').transform(Number),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    MONGODB_URI: zod_1.z.string().default('mongodb://127.0.0.1:27017/mahall_system'),
    JWT_SECRET: zod_1.z.string().default('mahall_jwt_secret_development_key_default_32chars'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    COOKIE_SECRET: zod_1.z.string().default('mahall_cookie_secret_key_default'),
    CLIENT_URL: zod_1.z.string().default('http://localhost:5173'),
    SERVER_URL: zod_1.z.string().default('http://localhost:5000'),
    GOOGLE_CLIENT_ID: zod_1.z.string().optional().default('').transform((s) => s.trim()),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().optional().default('').transform((s) => s.trim()),
    SMTP_HOST: zod_1.z.string().optional().default('smtp.gmail.com'),
    SMTP_PORT: zod_1.z.string().default('465').transform(Number),
    SMTP_USER: zod_1.z.string().optional().default('teemdiwani@gmail.com'),
    SMTP_PASS: zod_1.z.string().optional().default(''),
    GMAIL_APP_PASSWORD: zod_1.z.string().optional().default(''),
    SMTP_SECURE: zod_1.z.string().optional().default('true').transform(val => val === 'true'),
    SMTP_FROM: zod_1.z.string().optional().default('MahallConnect <teemdiwani@gmail.com>'),
    RAZORPAY_KEY_ID: zod_1.z.string().optional().default('rzp_test_TgVDlY3IsjDcYp'),
    RAZORPAY_KEY_SECRET: zod_1.z.string().optional().default('6OTIZgl34SR0qj7S6x0PUO1t'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    process.exit(1);
}
exports.env = parsed.data;
