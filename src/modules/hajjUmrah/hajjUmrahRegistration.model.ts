import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IHajjUmrahRegistration extends Document {
  postId: mongoose.Types.ObjectId;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  seats: number;
  userId?: mongoose.Types.ObjectId;
  familyId?: mongoose.Types.ObjectId;
  passportNumber?: string;
  notes?: string;
  registrationRef: string;
  status: 'REGISTERED' | 'CONFIRMED' | 'CANCELLED';
  emailSent: boolean;
  emailSentAt?: Date;
  travelsContactShared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const hajjUmrahRegistrationSchema = new Schema<IHajjUmrahRegistration>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'HajjUmrahPost',
      required: true,
      index: true,
    },
    applicantName: {
      type: String,
      required: [true, 'Applicant name is required'],
      trim: true,
    },
    applicantPhone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      index: true,
    },
    applicantEmail: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    seats: {
      type: Number,
      default: 1,
      min: [1, 'Must register at least 1 seat'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    familyId: {
      type: Schema.Types.ObjectId,
      ref: 'Family',
    },
    passportNumber: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    registrationRef: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['REGISTERED', 'CONFIRMED', 'CANCELLED'],
      default: 'REGISTERED',
      index: true,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
    },
    travelsContactShared: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const HajjUmrahRegistration: Model<IHajjUmrahRegistration> =
  mongoose.model<IHajjUmrahRegistration>(
    'HajjUmrahRegistration',
    hajjUmrahRegistrationSchema
  );
