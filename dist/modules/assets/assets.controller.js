"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsController = void 0;
const assets_service_js_1 = require("./assets.service.js");
const apiResponse_js_1 = require("../../utils/apiResponse.js");
class AssetsController {
    static async list(req, res, next) {
        try {
            const assets = await assets_service_js_1.AssetsService.listAssets(req.query);
            return apiResponse_js_1.ApiResponse.success(res, assets);
        }
        catch (error) {
            next(error);
        }
    }
    static async getStats(_req, res, next) {
        try {
            const stats = await assets_service_js_1.AssetsService.getAssetStats();
            return apiResponse_js_1.ApiResponse.success(res, stats);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const created = await assets_service_js_1.AssetsService.createAsset(req.body);
            return apiResponse_js_1.ApiResponse.success(res, created, 201, 'Asset registered');
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const updated = await assets_service_js_1.AssetsService.updateAsset(req.params.id, req.body);
            return apiResponse_js_1.ApiResponse.success(res, updated, 200, 'Asset updated');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AssetsController = AssetsController;
