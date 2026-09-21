"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsService = void 0;
const asset_model_js_1 = require("./asset.model.js");
class AssetsService {
    static async listAssets(query) {
        const filter = {};
        if (query.type)
            filter.type = query.type;
        if (query.status)
            filter.status = query.status;
        return asset_model_js_1.Asset.find(filter).sort({ name: 1 });
    }
    static async getAssetStats() {
        const assets = await asset_model_js_1.Asset.find();
        const totalValuation = assets.reduce((sum, a) => sum + (a.estimatedValue || 0), 0);
        const monthlyRentExpected = assets
            .filter((a) => a.status === 'RENTED')
            .reduce((sum, a) => sum + (a.monthlyRent || 0), 0);
        return {
            totalAssets: assets.length,
            totalValuation,
            monthlyRentExpected,
            rentedUnits: assets.filter((a) => a.status === 'RENTED').length,
            underMaintenance: assets.filter((a) => a.status === 'UNDER_MAINTENANCE').length,
        };
    }
    static async createAsset(data) {
        return asset_model_js_1.Asset.create(data);
    }
    static async updateAsset(id, data) {
        return asset_model_js_1.Asset.findByIdAndUpdate(id, data, { new: true });
    }
}
exports.AssetsService = AssetsService;
