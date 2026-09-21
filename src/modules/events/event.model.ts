import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  category: 'RELIGIOUS' | 'YOUTH' | 'COMMUNITY' | 'CHARITY' | 'EDUCATIONAL';
  startDate: Date;
  endDate: Date;
  location: string;
  capacity?: number;
  registeredAttendees: mongoose.Types.ObjectId[];
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['RELIGIOUS', 'YOUTH', 'COMMUNITY', 'CHARITY', 'EDUCATIONAL'],
      default: 'COMMUNITY',
      index: true,
    },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, default: 200 },
    registeredAttendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'],
      default: 'UPCOMING',
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Event: Model<IEvent> = mongoose.model<IEvent>('Event', eventSchema);
