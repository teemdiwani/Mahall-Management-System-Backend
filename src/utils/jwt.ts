import jwt from 'jsonwebtoken';
import type { CookieOptions } from 'express';
import { env } from '../config/env.js';
import type { UserRole } from '../constants/roles.js';

export interface TokenPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};

export const getCookieOptions = (): CookieOptions => {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
};
