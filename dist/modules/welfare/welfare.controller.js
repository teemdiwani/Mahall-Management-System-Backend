"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WelfareController = void 0;
const welfare_service_js_1 = require("./welfare.service.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
class WelfareController {
    static async getDashboard(req, res, next) {
        try {
            const result = await welfare_service_js_1.WelfareService.getWelfareDashboard();
            return apiResponse_js_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async listCases(req, res, next) {
        try {
            const result = await welfare_service_js_1.WelfareService.listCases(req.query);
            return apiResponse_js_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async createCase(req, res, next) {
        try {
            const result = await welfare_service_js_1.WelfareService.createCase({ ...req.body, applicant: req.user._id });
            return apiResponse_js_1.ApiResponse.success(res, result, 201, 'Welfare case created');
        }
        catch (error) {
            next(error);
        }
    }
    static async updateCaseStatus(req, res, next) {
        try {
            const result = await welfare_service_js_1.WelfareService.updateCaseStatus(req.params.id, req.body.status, req.user._id.toString(), req.body.note);
            return apiResponse_js_1.ApiResponse.success(res, result, 200, 'Case status updated');
        }
        catch (error) {
            next(error);
        }
    }
    static async listBeneficiaries(req, res, next) {
        try {
            const result = await welfare_service_js_1.WelfareService.listBeneficiaries(req.query);
            return apiResponse_js_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getZakatSummary(_req, res, next) {
        try {
            const result = await welfare_service_js_1.WelfareService.getZakatSummary();
            return apiResponse_js_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async distributeZakat(req, res, next) {
        try {
            const result = await welfare_service_js_1.WelfareService.distributeZakat({ ...req.body, distributedBy: req.user._id });
            return apiResponse_js_1.ApiResponse.success(res, result, 201, 'Zakat distribution recorded');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.WelfareController = WelfareController;
