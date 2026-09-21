import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IHajjUmrahPost extends Document {
  title: string;
  type: 'HAJJ' | 'UMRAH';
  travelsName: string;
  contactPerson?: string;
  contactPhone: string;
  contactEmail?: string;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  estimatedPrice?: string;
  departureDate?: Date;
  returnDate?: Date;
  registrationDeadline?: Date;
  description: string;
  features: string[];
  status: 'OPEN' | 'FULL' | 'CLOSED';
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const hajjUmrahPostSchema = new Schema<IHajjUmrahPost>(
  {
    title: {
      type: String,
      required: [true, 'Package title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['HAJJ', 'UMRAH'],
      default: 'HAJJ',
      index: true,
    },
    travelsName: {
      type: String,
      required: [true, 'Travel agency name is required'],
      trim: true,
      index: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      required: [true, 'Travel agency phone number is required'],
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    totalSlots: {
      type: Number,
      required: [true, 'Total slots count is required'],
      min: [1, 'Must have at least 1 slot'],
      default: 20,
    },
    bookedSlots: {
      type: Number,
      default: 0,
      min: 0,
    },
    estimatedPrice: {
      type: String,
      trim: true,
    },
    departureDate: {
      type: Date,
    },
    returnDate: {
      type: Date,
    },
    registrationDeadline: {
      type: Date,
    },
    description: {
      type: String,
      required: [true, 'Package description is required'],
      trim: true,
    },
    features: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['OPEN', 'FULL', 'CLOSED'],
      default: 'OPEN',
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for remaining slots
hajjUmrahPostSchema.virtual('availableSlots').get(function (this: IHajjUmrahPost) {
  return Math.max(0, (this.totalSlots || 0) - (this.bookedSlots || 0));
});

export const HajjUmrahPost: Model<IHajjUmrahPost> = mongoose.model<IHajjUmrahPost>(
  'HajjUmrahPost',
  hajjUmrahPostSchema
);
