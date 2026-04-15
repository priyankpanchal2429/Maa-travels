import mongoose, { Document, Schema } from 'mongoose';

export type BusStatus = 'idle' | 'running' | 'maintenance';

export interface IBus extends Document {
  busNumber: string;
  plateNumber: string;
  capacity: number;
  status: BusStatus;
  currentDriverId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const busSchema = new Schema<IBus>(
  {
    busNumber: { type: String, required: true, unique: true, trim: true },
    plateNumber: { type: String, required: true, unique: true, trim: true },
    capacity: { type: Number, required: true },
    status: {
      type: String,
      enum: ['idle', 'running', 'maintenance'],
      default: 'idle',
    },
    currentDriverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
  },
  { timestamps: true, versionKey: false }
);

export const Bus = mongoose.model<IBus>('Bus', busSchema);
