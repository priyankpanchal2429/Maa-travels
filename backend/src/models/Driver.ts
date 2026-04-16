import mongoose, { Document, Schema } from 'mongoose';

export interface IDriver extends Document {
  collegeId: mongoose.Types.ObjectId;
  driverId: string;
  name: string;
  phone: string;
  address: string;
  assignedBusId?: mongoose.Types.ObjectId;
  salary: number;
  photo?: string; // Base64
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const driverSchema = new Schema<IDriver>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
    driverId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    assignedBusId: { type: Schema.Types.ObjectId, ref: 'Bus' },
    salary: { type: Number, default: 0 },
    photo: { type: String }, // Base64 compressed image
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

export const Driver = mongoose.model<IDriver>('Driver', driverSchema);
