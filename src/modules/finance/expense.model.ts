import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IExpense extends Document {
  expenseNumber: string;
  title: string;
  category: 'UTILITIES' | 'MAINTENANCE' | 'SALARIES' | 'WELFARE' | 'EVENTS' | 'MADRASA' | 'OTHER';
  amount: number;
  description?: string;
  recordedBy: mongoose.Types.ObjectId;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    expenseNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['UTILITIES', 'MAINTENANCE', 'SALARIES', 'WELFARE', 'EVENTS', 'MADRASA', 'OTHER'],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Expense: Model<IExpense> = mongoose.model<IExpense>('Expense', expenseSchema);
