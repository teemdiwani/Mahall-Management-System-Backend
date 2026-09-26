"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_js_1 = require("./auth.controller.js");
const validate_js_1 = require("../../middleware/validate.js");
const auth_js_1 = require("../../middleware/auth.js");
const rateLimiter_js_1 = require("../../middleware/rateLimiter.js");
const auth_validation_js_1 = require("./auth.validation.js");
const router = (0, express_1.Router)();
router.post('/register', rateLimiter_js_1.authLimiter, (0, validate_js_1.validateRequest)({ body: auth_validation_js_1.registerSchema }), auth_controller_js_1.AuthController.register);
router.post('/login', rateLimiter_js_1.authLimiter, (0, validate_js_1.validateRequest)({ body: auth_validation_js_1.loginSchema }), auth_controller_js_1.AuthController.login);
router.post('/google', rateLimiter_js_1.authLimiter, (0, validate_js_1.validateRequest)({ body: auth_validation_js_1.googleAuthSchema }), auth_controller_js_1.AuthController.googleAuth);
router.post('/forgot-password', rateLimiter_js_1.authLimiter, (0, validate_js_1.validateRequest)({ body: auth_validation_js_1.forgotPasswordSchema }), auth_controller_js_1.AuthController.forgotPassword);
router.post('/verify-reset-otp', rateLimiter_js_1.authLimiter, (0, validate_js_1.validateRequest)({ body: auth_validation_js_1.verifyResetOtpSchema }), auth_controller_js_1.AuthController.verifyResetOtp);
router.post('/reset-password', rateLimiter_js_1.authLimiter, (0, validate_js_1.validateRequest)({ body: auth_validation_js_1.resetPasswordSchema }), auth_controller_js_1.AuthController.resetPassword);
router.get('/me', auth_js_1.authenticate, auth_controller_js_1.AuthController.getMe);
router.post('/logout', auth_controller_js_1.AuthController.logout);
router.get('/debug-smtp', async (_req, res) => {
    try {
        const { mailService } = await import('../../utils/mailService.js');
        const result = await mailService.sendPasswordResetOtpEmail({
            email: 'nafihkottankodan@gmail.com',
            name: 'Nafi (Debug Test)',
            otp: '999888',
        });
        res.json({ debug: true, result });
    }
    catch (err) {
        res.status(500).json({ debug: false, error: err.message, stack: err.stack });
    }
});
router.get('/config', auth_controller_js_1.AuthController.getConfig);
exports.default = router;
