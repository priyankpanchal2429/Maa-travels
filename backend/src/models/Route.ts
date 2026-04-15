import mongoose, { Document, Schema } from 'mongoose';

export interface IStop {
  name: string;
  order: number;
}

export interface IRoute extends Document {
  routeName: string;
  stops: IStop[];
  assignedBusId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const routeSchema = new Schema<IRoute>(
  {
    routeName: { type: String, required: true, unique: true, trim: true },
    stops: [
      {
        name: { type: String, required: true, trim: true },
        order: { type: Number, required: true },
      },
    ],
    assignedBusId: { type: Schema.Types.ObjectId, ref: 'Bus' },
  },
  { timestamps: true, versionKey: false }
);

export const Route = mongoose.model<IRoute>('Route', routeSchema);
