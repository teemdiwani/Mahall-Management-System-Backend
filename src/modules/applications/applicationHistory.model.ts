import mongoose, { Schema, type Document, type Model } from 'mongoose';
import type { ApplicationStatus } from './application.model.js';

export interface IApplicationHistory extends Document {
  applicationId: mongoose.Types.ObjectId;
  changedBy: mongoose.Types.ObjectId;
  oldStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
  comment?: string;
  timestamp: Date;
}

const applicationHistorySchema = new Schema<IApplicationHistory>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    oldStatus: {
      type: String,
      required: true,
    },
    newStatus: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

export const ApplicationHistory: Model<IApplicationHistory> =
  mongoose.model<IApplicationHistory>(
    'ApplicationHistory',
    applicationHistorySchema
  );
