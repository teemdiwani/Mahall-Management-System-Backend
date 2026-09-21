import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type FamilyRequestType =
  | 'ADD_MEMBER'
  | 'REMOVE_MEMBER'
  | 'CHANGE_RELATIONSHIP'
  | 'CHANGE_FAMILY_HEAD'
  | 'UPDATE_FAMILY_INFORMATION'
  | 'TRANSFER_MEMBER';

export type FamilyRequestStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface IStatusHistoryItem {
  oldStatus: string;
  newStatus: string;
  changedBy: mongoose.Types.ObjectId;
  comment?: string;
  timestamp: Date;
}

export interface IFamilyChangeRequest extends Document {
  requestCode: string;
  familyId: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  requestType: FamilyRequestType;
  targetMemberId?: mongoose.Types.ObjectId;
  relationship?: string;
  relatedToMemberId?: mongoose.Types.ObjectId;
  newFamilyHeadId?: mongoose.Types.ObjectId;
  updateData?: Record<string, any>;
  proposedData?: Record<string, any>;
  transferToFamilyId?: mongoose.Types.ObjectId;
  reason?: string;
  status: FamilyRequestStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  statusHistory: IStatusHistoryItem[];
  createdAt: Date;
  updatedAt: Date;
}

const familyChangeRequestSchema = new Schema<IFamilyChangeRequest>(
  {
    requestCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    familyId: {
      type: Schema.Types.ObjectId,
      ref: 'Family',
      required: true,
      index: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    requestType: {
      type: String,
      enum: [
        'ADD_MEMBER',
        'REMOVE_MEMBER',
        'CHANGE_RELATIONSHIP',
        'CHANGE_FAMILY_HEAD',
        'UPDATE_FAMILY_INFORMATION',
        'TRANSFER_MEMBER',
      ],
      required: true,
      index: true,
    },
    targetMemberId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
    },
    relationship: {
      type: String,
    },
    relatedToMemberId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
    },
    newFamilyHeadId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
    },
    updateData: {
      type: Schema.Types.Mixed,
    },
    proposedData: {
      type: Schema.Types.Mixed,
    },
    transferToFamilyId: {
      type: Schema.Types.ObjectId,
      ref: 'Family',
    },
    reason: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    statusHistory: [
      {
        oldStatus: { type: String, required: true },
        newStatus: { type: String, required: true },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        comment: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const FamilyChangeRequest: Model<IFamilyChangeRequest> = mongoose.model<IFamilyChangeRequest>(
  'FamilyChangeRequest',
  familyChangeRequestSchema
);
