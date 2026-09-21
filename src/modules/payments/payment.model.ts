import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IPayment extends Document {
  paymentNumber: string;
  familyId: mongoose.Types.ObjectId;
  memberId?: mongoose.Types.ObjectId;
  amount: number;
  month?: string; // YYYY-MM
  type: 'MONTHLY' | 'DONATION' | 'ZAKAT' | 'FITRAH' | 'EVENT' | 'OTHER';
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'ONLINE' | 'UPI';
  transactionId?: string;
  receiptNumber?: string;
  verifiedBy?: mongoose.Types.ObjectId;
  notes?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    paymentNumber: {
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
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    month: {
      type: String, // format YYYY-MM
      index: true,
    },
    type: {
      type: String,
      enum: ['MONTHLY', 'DONATION', 'ZAKAT', 'FITRAH', 'EVENT', 'OTHER'],
      default: 'MONTHLY',
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'BANK_TRANSFER', 'ONLINE', 'UPI'],
      default: 'ONLINE',
    },
    transactionId: {
      type: String,
    },
    receiptNumber: {
      type: String,
      sparse: true,
      index: true,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment', paymentSchema);
