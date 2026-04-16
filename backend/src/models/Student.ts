import mongoose, { Document, Schema } from 'mongoose';

export type SubscriptionDuration = '6m' | '1y';
export type PaymentStatus = 'paid' | 'unpaid' | 'bypassed';

export interface IStudent extends Document {
  collegeId: mongoose.Types.ObjectId;
  studentId: string;
  name: string;
  parentPhone: string;
  duration: SubscriptionDuration;
  routeId: mongoose.Types.ObjectId;
  stopId: string;
  paymentStatus: PaymentStatus;
  expiryDate: Date;
  photo?: string; // Base64
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
    studentId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    parentPhone: { type: String, required: true, trim: true },
    duration: { type: String, enum: ['6m', '1y'], required: true },
    routeId: { type: Schema.Types.ObjectId, ref: 'Route', required: true },
    stopId: { type: String, required: true }, // Name of the stop
    paymentStatus: { type: String, enum: ['paid', 'unpaid', 'bypassed'], default: 'unpaid' },
    expiryDate: { type: Date, required: true },
    photo: { type: String }, // Base64 compressed image
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

export const Student = mongoose.model<IStudent>('Student', studentSchema);
