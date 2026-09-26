import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
} from './auth.validation.js';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validateRequest({ body: registerSchema }),
  AuthController.register
);

router.post(
  '/login',
  authLimiter,
  validateRequest({ body: loginSchema }),
  AuthController.login
);

router.post(
  '/google',
  authLimiter,
  validateRequest({ body: googleAuthSchema }),
  AuthController.googleAuth
);

router.post(
  '/forgot-password',
  authLimiter,
  validateRequest({ body: forgotPasswordSchema }),
  AuthController.forgotPassword
);

router.post(
  '/verify-reset-otp',
  authLimiter,
  validateRequest({ body: verifyResetOtpSchema }),
  AuthController.verifyResetOtp
);

router.post(
  '/reset-password',
  authLimiter,
  validateRequest({ body: resetPasswordSchema }),
  AuthController.resetPassword
);

router.get('/me', authenticate, AuthController.getMe);
router.post('/logout', AuthController.logout);
router.get('/config', AuthController.getConfig);

export default router;
