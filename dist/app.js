"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const env_js_1 = require("./config/env.js");
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const rateLimiter_js_1 = require("./middleware/rateLimiter.js");
const apiError_js_1 = require("./utils/apiError.js");
// Route imports
const auth_routes_js_1 = __importDefault(require("./modules/auth/auth.routes.js"));
const users_routes_js_1 = __importDefault(require("./modules/users/users.routes.js"));
const families_routes_js_1 = __importDefault(require("./modules/families/families.routes.js"));
const familyChangeRequest_routes_js_1 = __importDefault(require("./modules/families/familyChangeRequest.routes.js"));
const members_routes_js_1 = __importDefault(require("./modules/members/members.routes.js"));
const payments_routes_js_1 = __importDefault(require("./modules/payments/payments.routes.js"));
const finance_routes_js_1 = __importDefault(require("./modules/finance/finance.routes.js"));
const applications_routes_js_1 = __importDefault(require("./modules/applications/applications.routes.js"));
const welfare_routes_js_1 = __importDefault(require("./modules/welfare/welfare.routes.js"));
const madrasa_routes_js_1 = __importDefault(require("./modules/madrasa/madrasa.routes.js"));
const mosque_routes_js_1 = __importDefault(require("./modules/mosque/mosque.routes.js"));
const events_routes_js_1 = __importDefault(require("./modules/events/events.routes.js"));
const volunteers_routes_js_1 = __importDefault(require("./modules/volunteers/volunteers.routes.js"));
const assets_routes_js_1 = __importDefault(require("./modules/assets/assets.routes.js"));
const committee_routes_js_1 = __importDefault(require("./modules/committee/committee.routes.js"));
const funeral_routes_js_1 = __importDefault(require("./modules/funeral/funeral.routes.js"));
const marriage_routes_js_1 = __importDefault(require("./modules/marriage/marriage.routes.js"));
const ramadan_routes_js_1 = __importDefault(require("./modules/ramadan/ramadan.routes.js"));
const announcements_routes_js_1 = __importDefault(require("./modules/announcements/announcements.routes.js"));
const hajjUmrah_routes_js_1 = __importDefault(require("./modules/hajjUmrah/hajjUmrah.routes.js"));
const notifications_routes_js_1 = __importDefault(require("./modules/notifications/notifications.routes.js"));
const dashboard_routes_js_1 = __importDefault(require("./modules/dashboard/dashboard.routes.js"));
const reports_routes_js_1 = __importDefault(require("./modules/reports/reports.routes.js"));
const auditLogs_routes_js_1 = __importDefault(require("./modules/auditLogs/auditLogs.routes.js"));
const createApp = () => {
    const app = (0, express_1.default)();
    // Security Headers (configured to allow Google OAuth popup)
    app.use((0, helmet_1.default)({
        crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    // CORS Configuration
    app.use((0, cors_1.default)({
        origin: [env_js_1.env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));
    // Parsers & Rate Limiter
    app.use((0, cookie_parser_1.default)(env_js_1.env.COOKIE_SECRET));
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    if (env_js_1.env.NODE_ENV !== 'test') {
        app.use((0, morgan_1.default)(env_js_1.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
    }
    app.use(rateLimiter_js_1.generalLimiter);
    // Health check
    app.get('/health', (_req, res) => {
        res.status(200).json({ status: 'ok', service: 'mahall-backend', timestamp: new Date() });
    });
    // Domain API Routes
    app.use('/api/auth', auth_routes_js_1.default);
    app.use('/api/users', users_routes_js_1.default);
    app.use('/api/families', families_routes_js_1.default);
    app.use('/api/family-change-requests', familyChangeRequest_routes_js_1.default);
    app.use('/api/members', members_routes_js_1.default);
    app.use('/api/payments', payments_routes_js_1.default);
    app.use('/api/finance', finance_routes_js_1.default);
    app.use('/api/applications', applications_routes_js_1.default);
    app.use('/api/welfare', welfare_routes_js_1.default);
    app.use('/api/madrasa', madrasa_routes_js_1.default);
    app.use('/api/mosque', mosque_routes_js_1.default);
    app.use('/api/events', events_routes_js_1.default);
    app.use('/api/volunteers', volunteers_routes_js_1.default);
    app.use('/api/assets', assets_routes_js_1.default);
    app.use('/api/committee', committee_routes_js_1.default);
    app.use('/api/funeral', funeral_routes_js_1.default);
    app.use('/api/marriage', marriage_routes_js_1.default);
    app.use('/api/ramadan', ramadan_routes_js_1.default);
    app.use('/api/announcements', announcements_routes_js_1.default);
    app.use('/api/hajj-umrah', hajjUmrah_routes_js_1.default);
    app.use('/api/notifications', notifications_routes_js_1.default);
    app.use('/api/dashboard', dashboard_routes_js_1.default);
    app.use('/api/reports', reports_routes_js_1.default);
    app.use('/api/audit-logs', auditLogs_routes_js_1.default);
    // 404 Handler
    app.use((_req, _res, next) => {
        next(apiError_js_1.ApiError.notFound('Requested API route does not exist'));
    });
    // Centralized Error Handler
    app.use(errorHandler_js_1.errorHandler);
    return app;
};
exports.createApp = createApp;
