import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IFuneral extends Document {
  deceasedName: string;
  dateOfDeath: Date;
  age: number;
  familyId?: mongoose.Types.ObjectId;
  contactPerson: string;
  contactPhone: string;
  janaazahTime: string;
  janaazahPlace: string;
  cemeteryPlotNumber?: string;
  status: 'REPORTED' | 'ARRANGED' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
}

const funeralSchema = new Schema<IFuneral>(
  {
    deceasedName: { type: String, required: true, trim: true },
    dateOfDeath: { type: Date, required: true, default: Date.now },
    age: { type: Number, required: true },
    familyId: { type: Schema.Types.ObjectId, ref: 'Family' },
    contactPerson: { type: String, required: true },
    contactPhone: { type: String, required: true },
    janaazahTime: { type: String, required: true },
    janaazahPlace: { type: String, default: 'Al-Noor Central Masjid' },
    cemeteryPlotNumber: { type: String },
    status: {
      type: String,
      enum: ['REPORTED', 'ARRANGED', 'COMPLETED'],
      default: 'REPORTED',
      index: true,
    },
  },
  { timestamps: true }
);

export const Funeral: Model<IFuneral> = mongoose.model<IFuneral>('Funeral', funeralSchema);
