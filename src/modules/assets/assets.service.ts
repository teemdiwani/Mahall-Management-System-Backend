import { Asset, type IAsset } from './asset.model.js';

export class AssetsService {
  static async listAssets(query: { type?: string; status?: string }) {
    const filter: Record<string, any> = {};
    if (query.type) filter.type = query.type;
    if (query.status) filter.status = query.status;

    return Asset.find(filter).sort({ name: 1 });
  }

  static async getAssetStats() {
    const assets = await Asset.find();
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

  static async createAsset(data: Partial<IAsset>) {
    return Asset.create(data);
  }

  static async updateAsset(id: string, data: Partial<IAsset>) {
    return Asset.findByIdAndUpdate(id, data, { new: true });
  }
}
