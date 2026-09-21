import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  category: 'GENERAL' | 'PRAYER' | 'EVENT' | 'EMERGENCY' | 'FINANCE' | 'WELFARE';
  targetAudience: 'ALL' | 'MEMBERS' | 'FAMILY_HEADS' | 'VOLUNTEERS' | 'COMMITTEE' | 'STAFF';
  author: string;
  isPinned: boolean;
  publishedAt: Date;
  expiresAt?: Date;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ['GENERAL', 'PRAYER', 'EVENT', 'EMERGENCY', 'FINANCE', 'WELFARE'],
      default: 'GENERAL',
      index: true,
    },
    targetAudience: {
      type: String,
      enum: ['ALL', 'MEMBERS', 'FAMILY_HEADS', 'VOLUNTEERS', 'COMMITTEE', 'STAFF'],
      default: 'ALL',
      index: true,
    },
    author: { type: String, required: true, default: 'Mahall Secretary' },
    isPinned: { type: Boolean, default: false },
    publishedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE', index: true },
  },
  { timestamps: true }
);

export const Announcement: Model<IAnnouncement> =
  mongoose.model<IAnnouncement>('Announcement', announcementSchema);
