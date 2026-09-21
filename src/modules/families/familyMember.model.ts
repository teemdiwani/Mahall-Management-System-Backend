import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type FamilyRelationship =
  | 'HEAD'
  | 'SPOUSE'
  | 'SON'
  | 'DAUGHTER'
  | 'FATHER'
  | 'MOTHER'
  | 'GRANDFATHER'
  | 'GRANDMOTHER'
  | 'BROTHER'
  | 'SISTER'
  | 'OTHER';

export interface IFamilyMember extends Document {
  familyId: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId;
  relationship: FamilyRelationship;
  relatedToMemberId?: mongoose.Types.ObjectId;
  isFamilyHead: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  joinedAt: Date;
  leftAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const familyMemberSchema = new Schema<IFamilyMember>(
  {
    familyId: {
      type: Schema.Types.ObjectId,
      ref: 'Family',
      required: true,
      index: true,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
      index: true,
    },
    relationship: {
      type: String,
      enum: [
        'HEAD',
        'SPOUSE',
        'SON',
        'DAUGHTER',
        'FATHER',
        'MOTHER',
        'GRANDFATHER',
        'GRANDMOTHER',
        'BROTHER',
        'SISTER',
        'OTHER',
      ],
      required: true,
      default: 'OTHER',
    },
    relatedToMemberId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
    },
    isFamilyHead: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      index: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    leftAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate active assignment of same member to same family
familyMemberSchema.index({ familyId: 1, memberId: 1, status: 1 });

export const FamilyMember: Model<IFamilyMember> = mongoose.model<IFamilyMember>('FamilyMember', familyMemberSchema);
