import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface ICommitteeMember extends Document {
  memberId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  name: string;
  designation: 'PRESIDENT' | 'VICE_PRESIDENT' | 'SECRETARY' | 'JOINT_SECRETARY' | 'TREASURER' | 'MEMBER';
  phone: string;
  termStart: Date;
  termEnd: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'RESIGNED';
}

const committeeMemberSchema = new Schema<ICommitteeMember>(
  {
    memberId: { type: Schema.Types.ObjectId, ref: 'Member' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    designation: {
      type: String,
      enum: ['PRESIDENT', 'VICE_PRESIDENT', 'SECRETARY', 'JOINT_SECRETARY', 'TREASURER', 'MEMBER'],
      required: true,
      index: true,
    },
    phone: { type: String, required: true },
    termStart: { type: Date, required: true },
    termEnd: { type: Date, required: true },
    status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'RESIGNED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

export const CommitteeMember: Model<ICommitteeMember> =
  mongoose.model<ICommitteeMember>('CommitteeMember', committeeMemberSchema);

export interface ICommitteeMeeting extends Document {
  title: string;
  meetingDate: Date;
  location: string;
  agenda: string[];
  minutes?: string;
  resolutions: string[];
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
}

const committeeMeetingSchema = new Schema<ICommitteeMeeting>(
  {
    title: { type: String, required: true },
    meetingDate: { type: Date, required: true, index: true },
    location: { type: String, default: 'Mahall Committee Hall' },
    agenda: [{ type: String }],
    minutes: { type: String },
    resolutions: [{ type: String }],
    status: {
      type: String,
      enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
    },
  },
  { timestamps: true }
);

export const CommitteeMeeting: Model<ICommitteeMeeting> =
  mongoose.model<ICommitteeMeeting>('CommitteeMeeting', committeeMeetingSchema);
