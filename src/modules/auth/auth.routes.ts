import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  googleAuthSchema,
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

router.get('/me', authenticate, AuthController.getMe);
router.post('/logout', AuthController.logout);

export default router;
