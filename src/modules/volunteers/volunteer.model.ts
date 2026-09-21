import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IVolunteer extends Document {
  memberId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  bloodGroup?: string;
  categories: ('EMERGENCY' | 'EVENT' | 'WELFARE' | 'BLOOD_DONATION' | 'GENERAL')[];
  skills?: string;
  availability: 'WEEKENDS' | 'EVENINGS' | 'ANYTIME' | 'ON_CALL';
  emergencyVolunteer: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const volunteerSchema = new Schema<IVolunteer>(
  {
    memberId: { type: Schema.Types.ObjectId, ref: 'Member' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    bloodGroup: { type: String },
    categories: [
      {
        type: String,
        enum: ['EMERGENCY', 'EVENT', 'WELFARE', 'BLOOD_DONATION', 'GENERAL'],
      },
    ],
    skills: { type: String },
    availability: {
      type: String,
      enum: ['WEEKENDS', 'EVENINGS', 'ANYTIME', 'ON_CALL'],
      default: 'ANYTIME',
    },
    emergencyVolunteer: { type: Boolean, default: false },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },
  },
  { timestamps: true }
);

export const Volunteer: Model<IVolunteer> = mongoose.model<IVolunteer>(
  'Volunteer',
  volunteerSchema
);
