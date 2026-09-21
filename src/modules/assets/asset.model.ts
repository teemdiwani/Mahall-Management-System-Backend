import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IAsset extends Document {
  name: string;
  type: 'BUILDING' | 'LAND' | 'RENTAL_SHOP' | 'EQUIPMENT' | 'VEHICLE' | 'OTHER';
  description?: string;
  location: string;
  estimatedValue: number;
  monthlyRent?: number;
  tenantName?: string;
  tenantPhone?: string;
  status: 'OPERATIONAL' | 'RENTED' | 'UNDER_MAINTENANCE';
  purchaseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema = new Schema<IAsset>(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['BUILDING', 'LAND', 'RENTAL_SHOP', 'EQUIPMENT', 'VEHICLE', 'OTHER'],
      required: true,
      index: true,
    },
    description: { type: String },
    location: { type: String, required: true },
    estimatedValue: { type: Number, required: true, min: 0 },
    monthlyRent: { type: Number, min: 0 },
    tenantName: { type: String },
    tenantPhone: { type: String },
    status: {
      type: String,
      enum: ['OPERATIONAL', 'RENTED', 'UNDER_MAINTENANCE'],
      default: 'OPERATIONAL',
      index: true,
    },
    purchaseDate: { type: Date },
  },
  { timestamps: true }
);

export const Asset: Model<IAsset> = mongoose.model<IAsset>('Asset', assetSchema);
