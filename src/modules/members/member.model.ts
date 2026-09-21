import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IMember extends Document {
  memberCode?: string;
  name: string;
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone?: string;
  email?: string;
  familyId?: mongoose.Types.ObjectId;
  relationship: 'HEAD' | 'SPOUSE' | 'SON' | 'DAUGHTER' | 'FATHER' | 'MOTHER' | 'BROTHER' | 'SISTER' | 'GRANDFATHER' | 'GRANDMOTHER' | 'OTHER';
  occupation?: string;
  education?: string;
  membershipStatus: 'ACTIVE' | 'INACTIVE' | 'DECEASED';
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new Schema<IMember>(
  {
    memberCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
      index: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    familyId: {
      type: Schema.Types.ObjectId,
      ref: 'Family',
      required: false,
      index: true,
    },
    relationship: {
      type: String,
      enum: ['HEAD', 'SPOUSE', 'SON', 'DAUGHTER', 'FATHER', 'MOTHER', 'BROTHER', 'SISTER', 'GRANDFATHER', 'GRANDMOTHER', 'OTHER'],
      default: 'OTHER',
    },
    occupation: {
      type: String,
      trim: true,
    },
    education: {
      type: String,
      trim: true,
    },
    membershipStatus: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'DECEASED'],
      default: 'ACTIVE',
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Member: Model<IMember> = mongoose.model<IMember>('Member', memberSchema);
