import mongoose, { Document, Schema } from 'mongoose';

export interface IStop {
  name: string;
  order: number;
}

export interface IRoute extends Document {
  collegeId: mongoose.Types.ObjectId;
  routeName: string;
  stops: IStop[];
  assignedBusId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const routeSchema = new Schema<IRoute>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
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
