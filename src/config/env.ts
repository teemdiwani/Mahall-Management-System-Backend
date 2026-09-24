import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/mahall_system'),
  JWT_SECRET: z.string().default('mahall_jwt_secret_development_key_default_32chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().default('mahall_cookie_secret_key_default'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  SERVER_URL: z.string().default('http://localhost:5000'),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  SMTP_HOST: z.string().optional().default('smtp.gmail.com'),
  SMTP_PORT: z.string().default('465').transform(Number),
  SMTP_USER: z.string().optional().default('teemdiwani@gmail.com'),
  SMTP_PASS: z.string().optional().default(''),
  GMAIL_APP_PASSWORD: z.string().optional().default(''),
  SMTP_SECURE: z.string().optional().default('true').transform(val => val === 'true'),
  SMTP_FROM: z.string().optional().default('MahallConnect <teemdiwani@gmail.com>'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
