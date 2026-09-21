"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_js_1 = require("./dashboard.service.js");
const welfare_service_js_1 = require("../welfare/welfare.service.js");
const madrasa_service_js_1 = require("../madrasa/madrasa.service.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
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
            const data = await dashboard_service_js_1.DashboardService.getMemberDashboard(req.user._id.toString(), req.user.email);
            return apiResponse_js_1.ApiResponse.success(res, data);
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
