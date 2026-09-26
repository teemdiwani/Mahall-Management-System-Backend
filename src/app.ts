import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { ApiError } from './utils/apiError.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import familiesRoutes from './modules/families/families.routes.js';
import familyChangeRequestRoutes from './modules/families/familyChangeRequest.routes.js';
import membersRoutes from './modules/members/members.routes.js';
import paymentsRoutes from './modules/payments/payments.routes.js';
import financeRoutes from './modules/finance/finance.routes.js';
import applicationsRoutes from './modules/applications/applications.routes.js';
import welfareRoutes from './modules/welfare/welfare.routes.js';
import madrasaRoutes from './modules/madrasa/madrasa.routes.js';
import mosqueRoutes from './modules/mosque/mosque.routes.js';
import eventsRoutes from './modules/events/events.routes.js';
import volunteersRoutes from './modules/volunteers/volunteers.routes.js';
import assetsRoutes from './modules/assets/assets.routes.js';
import committeeRoutes from './modules/committee/committee.routes.js';
import funeralRoutes from './modules/funeral/funeral.routes.js';
import marriageRoutes from './modules/marriage/marriage.routes.js';
import ramadanRoutes from './modules/ramadan/ramadan.routes.js';
import announcementsRoutes from './modules/announcements/announcements.routes.js';
import hajjUmrahRoutes from './modules/hajjUmrah/hajjUmrah.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import auditLogsRoutes from './modules/auditLogs/auditLogs.routes.js';

export const createApp = (): Express => {
  const app = express();

  // Security Headers (configured to allow Google OAuth popup)
  app.use(
    helmet({
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS Configuration
  app.use(
    cors({
      origin: (requestOrigin, callback) => {
        const allowedOrigins = [
          env.CLIENT_URL,
          'https://mahallmanager-theta.vercel.app',
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'http://localhost:5174',
          'http://127.0.0.1:5174',
        ];
        if (!requestOrigin) return callback(null, true);
        if (
          allowedOrigins.includes(requestOrigin) ||
          requestOrigin.endsWith('.vercel.app') ||
          requestOrigin.includes('localhost')
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Parsers & Rate Limiter
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
  }

  app.use(generalLimiter);

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'mahall-backend', timestamp: new Date() });
  });

  // Domain API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/families', familiesRoutes);
  app.use('/api/family-change-requests', familyChangeRequestRoutes);
  app.use('/api/members', membersRoutes);
  app.use('/api/payments', paymentsRoutes);
  app.use('/api/finance', financeRoutes);
  app.use('/api/applications', applicationsRoutes);
  app.use('/api/welfare', welfareRoutes);
  app.use('/api/madrasa', madrasaRoutes);
  app.use('/api/mosque', mosqueRoutes);
  app.use('/api/events', eventsRoutes);
  app.use('/api/volunteers', volunteersRoutes);
  app.use('/api/assets', assetsRoutes);
  app.use('/api/committee', committeeRoutes);
  app.use('/api/funeral', funeralRoutes);
  app.use('/api/marriage', marriageRoutes);
  app.use('/api/ramadan', ramadanRoutes);
  app.use('/api/announcements', announcementsRoutes);
  app.use('/api/hajj-umrah', hajjUmrahRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/audit-logs', auditLogsRoutes);

  // 404 Handler
  app.use((_req, _res, next) => {
    next(ApiError.notFound('Requested API route does not exist'));
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};
