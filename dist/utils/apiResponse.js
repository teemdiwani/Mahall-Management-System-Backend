"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    static success(res, data, statusCode = 200, message) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    }
    static paginate(res, items, page, limit, total) {
        return res.status(200).json({
            success: true,
            data: {
                items,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit) || 1,
                },
            },
        });
    }
}
exports.ApiResponse = ApiResponse;
