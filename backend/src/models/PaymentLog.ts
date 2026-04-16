import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentLog extends Document {
  collegeId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  amountPaid: number;
  paymentDate: Date;
  recordedBy: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentLogSchema = new Schema<IPaymentLog>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    amountPaid: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    recordedBy: { type: String, default: 'System' },
    notes: { type: String },
  },
  { timestamps: true, versionKey: false }
);

export const PaymentLog = mongoose.model<IPaymentLog>('PaymentLog', paymentLogSchema);
