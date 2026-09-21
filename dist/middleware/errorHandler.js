"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const apiError_js_1 = require("../utils/apiError.js");
const logger_js_1 = require("../utils/logger.js");
const env_js_1 = require("../config/env.js");
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof apiError_js_1.ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                details: err.details,
            },
        });
    }
    // Handle Mongoose duplicate key error
    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            error: {
                code: 'CONFLICT',
                message: 'Duplicate record already exists',
            },
        });
    }
    // Handle Mongoose ValidationError
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: err.message,
            },
        });
    }
    logger_js_1.logger.error(err, 'Unhandled Server Error:');
    return res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: env_js_1.env.NODE_ENV === 'production'
                ? 'An internal error occurred. Please try again later.'
                : err.message || 'Internal server error',
        },
    });
};
exports.errorHandler = errorHandler;
