import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IMarriage extends Document {
  groomName: string;
  brideName: string;
  groomFamilyId?: mongoose.Types.ObjectId;
  brideFamilyId?: mongoose.Types.ObjectId;
  nikahDate: Date;
  nikahVenue: string;
  officiatedBy: string;
  certificateNumber?: string;
  status: 'REQUESTED' | 'APPROVED' | 'CONDUCTED';
  createdAt: Date;
  updatedAt: Date;
}

const marriageSchema = new Schema<IMarriage>(
  {
    groomName: { type: String, required: true, trim: true },
    brideName: { type: String, required: true, trim: true },
    groomFamilyId: { type: Schema.Types.ObjectId, ref: 'Family' },
    brideFamilyId: { type: Schema.Types.ObjectId, ref: 'Family' },
    nikahDate: { type: Date, required: true },
    nikahVenue: { type: String, required: true },
    officiatedBy: { type: String, required: true },
    certificateNumber: { type: String, unique: true, sparse: true },
    status: {
      type: String,
      enum: ['REQUESTED', 'APPROVED', 'CONDUCTED'],
      default: 'REQUESTED',
      index: true,
    },
  },
  { timestamps: true }
);

export const Marriage: Model<IMarriage> = mongoose.model<IMarriage>('Marriage', marriageSchema);
