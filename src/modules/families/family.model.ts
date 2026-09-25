import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IFamily extends Document {
  familyCode: string;
  name: string;
  familyHead?: mongoose.Types.ObjectId;
  address: string;
  area: string;
  phone: string;
  email?: string;
  monthlyContribution: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const familySchema = new Schema<IFamily>(
  {
    familyCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    familyHead: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    monthlyContribution: {
      type: Number,
      default: 250,
      min: 0,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const Family: Model<IFamily> = mongoose.model<IFamily>('Family', familySchema);
