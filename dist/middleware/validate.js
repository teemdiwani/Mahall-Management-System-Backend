"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const apiError_js_1 = require("../utils/apiError.js");
const validateRequest = (schema) => {
    return async (req, _res, next) => {
        try {
            if (schema.body) {
                req.body = await schema.body.parseAsync(req.body);
            }
            if (schema.query) {
                req.query = await schema.query.parseAsync(req.query);
            }
            if (schema.params) {
                req.params = await schema.params.parseAsync(req.params);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const issues = error.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                return next(new apiError_js_1.ApiError(400, 'Validation failed', 'VALIDATION_ERROR', issues));
            }
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
