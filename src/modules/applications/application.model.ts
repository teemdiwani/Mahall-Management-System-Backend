import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type ApplicationType =
  | 'ZAKAT'
  | 'WELFARE'
  | 'MARRIAGE'
  | 'FUNERAL'
  | 'HAJJ'
  | 'UMRAH'
  | 'CERTIFICATE'
  | 'FACILITY_BOOKING'
  | 'EDUCATION_AID'
  | 'GENERAL_REQUEST'
  | 'OTHER';

export type ApplicationStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED';

export interface IApplication extends Document {
  applicationNumber: string;
  applicant: mongoose.Types.ObjectId; // User
  member?: mongoose.Types.ObjectId; // Member
  family?: mongoose.Types.ObjectId; // Family
  type: ApplicationType;
  status: ApplicationStatus;
  title: string;
  description: string;
  requestedAmount?: number;
  documents: {
    fileName: string;
    fileUrl: string;
    uploadedAt: Date;
  }[];
  reviewer?: mongoose.Types.ObjectId; // User
  reviewNotes?: string;
  decision?: string;
  decisionAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    applicationNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    member: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      index: true,
    },
    family: {
      type: Schema.Types.ObjectId,
      ref: 'Family',
      index: true,
    },
    type: {
      type: String,
      enum: [
        'ZAKAT',
        'WELFARE',
        'MARRIAGE',
        'FUNERAL',
        'HAJJ',
        'UMRAH',
        'CERTIFICATE',
        'FACILITY_BOOKING',
        'EDUCATION_AID',
        'GENERAL_REQUEST',
        'OTHER',
      ],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED'],
      default: 'PENDING',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    requestedAmount: {
      type: Number,
      min: 0,
    },
    documents: [
      {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewNotes: {
      type: String,
    },
    decision: {
      type: String,
    },
    decisionAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Application: Model<IApplication> = mongoose.model<IApplication>(
  'Application',
  applicationSchema
);
