import mongoose, { Document, Schema } from 'mongoose';

export type BusStatus = 'idle' | 'running' | 'maintenance';

export interface IBus extends Document {
  collegeId: mongoose.Types.ObjectId;
  busNumber: string;
  plateNumber: string;
  capacity: number;
  status: BusStatus;
  currentDriverId?: mongoose.Types.ObjectId;
  insuranceExpiry?: Date;
  permitExpiry?: Date;
  fitnessExpiry?: Date;
  rcExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const busSchema = new Schema<IBus>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
    busNumber: { type: String, required: true, unique: true, trim: true },
    plateNumber: { type: String, required: true, unique: true, trim: true },
    capacity: { type: Number, required: true },
    status: {
      type: String,
      enum: ['idle', 'running', 'maintenance'],
      default: 'idle',
    },
    currentDriverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
    insuranceExpiry: { type: Date },
    permitExpiry: { type: Date },
    fitnessExpiry: { type: Date },
    rcExpiry: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

export const Bus = mongoose.model<IBus>('Bus', busSchema);
