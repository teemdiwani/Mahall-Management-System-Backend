"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_js_1 = require("./dashboard.service.js");
const welfare_service_js_1 = require("../welfare/welfare.service.js");
const madrasa_service_js_1 = require("../madrasa/madrasa.service.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
const apiError_js_1 = require("../../utils/apiError.js");
class DashboardController {
    static async getAdminDashboard(_req, res, next) {
        try {
            const data = await dashboard_service_js_1.DashboardService.getAdminDashboard();
            return apiResponse_js_1.ApiResponse.success(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getDashboardStats(_req, res, next) {
        try {
            const data = await dashboard_service_js_1.DashboardService.getDashboardStats();
            return apiResponse_js_1.ApiResponse.success(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getDashboardCharts(_req, res, next) {
        try {
            const data = await dashboard_service_js_1.DashboardService.getDashboardCharts();
            return apiResponse_js_1.ApiResponse.success(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getMemberDashboard(req, res, next) {
        try {
            const searchNumber = req.query.number || req.query.phone || undefined;
            const data = await dashboard_service_js_1.DashboardService.getMemberDashboard(req.user._id.toString(), req.user.email, req.user.phone, searchNumber);
            return apiResponse_js_1.ApiResponse.success(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async linkFamilyByPhone(req, res, next) {
        try {
            const { phone } = req.body;
            if (!phone || typeof phone !== 'string' || !phone.trim()) {
                throw apiError_js_1.ApiError.badRequest('Please provide a valid phone number');
            }
            const data = await dashboard_service_js_1.DashboardService.getMemberDashboard(req.user._id.toString(), req.user.email, req.user.phone, phone.trim());
            if (!data.family) {
                throw apiError_js_1.ApiError.notFound('No family household found matching this number. Please check the number or contact the Mahall Secretary office.');
            }
            return apiResponse_js_1.ApiResponse.success(res, data, 200, 'Household connected successfully!');
        }
        catch (error) {
            next(error);
        }
    }
    static async getTreasurerDashboard(_req, res, next) {
        try {
            const data = await dashboard_service_js_1.DashboardService.getTreasurerDashboard();
            return apiResponse_js_1.ApiResponse.success(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getSecretaryDashboard(_req, res, next) {
        try {
            const data = await dashboard_service_js_1.DashboardService.getSecretaryDashboard();
            return apiResponse_js_1.ApiResponse.success(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getWelfareDashboard(_req, res, next) {
        try {
            const data = await welfare_service_js_1.WelfareService.getWelfareDashboard();
            return apiResponse_js_1.ApiResponse.success(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getMadrasaDashboard(_req, res, next) {
        try {
            const data = await madrasa_service_js_1.MadrasaService.getMadrasaDashboard();
            return apiResponse_js_1.ApiResponse.success(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    static async getImamDashboard(_req, res, next) {
        try {
            const data = await dashboard_service_js_1.DashboardService.getImamDashboard();
            return apiResponse_js_1.ApiResponse.success(res, data);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DashboardController = DashboardController;
