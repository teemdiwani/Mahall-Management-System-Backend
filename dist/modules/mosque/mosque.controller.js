"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MosqueController = void 0;
const mosque_service_js_1 = require("./mosque.service.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
class MosqueController {
    static async getInfo(_req, res, next) {
        try {
            const mosque = await mosque_service_js_1.MosqueService.getMosqueInfo();
            return apiResponse_js_1.ApiResponse.success(res, mosque);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateTimings(req, res, next) {
        try {
            const { prayerTimings, jumahDetails } = req.body;
            const updated = await mosque_service_js_1.MosqueService.updatePrayerTimings(prayerTimings, jumahDetails);
            return apiResponse_js_1.ApiResponse.success(res, updated, 200, 'Prayer timings updated');
        }
        catch (error) {
            next(error);
        }
    }
    static async updatePrograms(req, res, next) {
        try {
            const { programs } = req.body;
            const updated = await mosque_service_js_1.MosqueService.updatePrograms(programs);
            return apiResponse_js_1.ApiResponse.success(res, updated, 200, 'Programs updated');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MosqueController = MosqueController;
