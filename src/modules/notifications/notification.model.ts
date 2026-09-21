import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId; // User
  type: 'PAYMENT' | 'APPLICATION' | 'ANNOUNCEMENT' | 'EVENT' | 'GENERAL';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['PAYMENT', 'APPLICATION', 'ANNOUNCEMENT', 'EVENT', 'GENERAL'],
      default: 'GENERAL',
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const Notification: Model<INotification> =
  mongoose.model<INotification>('Notification', notificationSchema);
