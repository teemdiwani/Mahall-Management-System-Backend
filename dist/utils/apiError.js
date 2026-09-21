"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    statusCode;
    code;
    details;
    constructor(statusCode, message, code = 'ERROR', details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(message = 'Bad request', code = 'BAD_REQUEST', details) {
        return new ApiError(400, message, code, details);
    }
    static unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED') {
        return new ApiError(401, message, code);
    }
    static forbidden(message = 'Forbidden - Insufficient permissions', code = 'FORBIDDEN') {
        return new ApiError(403, message, code);
    }
    static notFound(message = 'Resource not found', code = 'NOT_FOUND') {
        return new ApiError(404, message, code);
    }
    static conflict(message = 'Resource conflict', code = 'CONFLICT') {
        return new ApiError(409, message, code);
    }
    static internal(message = 'Internal server error', code = 'INTERNAL_ERROR') {
        return new ApiError(500, message, code);
    }
}
exports.ApiError = ApiError;
