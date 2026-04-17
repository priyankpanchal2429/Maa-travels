import mongoose, { Document, Schema } from 'mongoose';

export type ActivityType = 'student' | 'payment' | 'fleet' | 'expense' | 'system';

export interface IActivityLog extends Document {
  collegeId?: mongoose.Types.ObjectId;
  type: ActivityType;
  message: string;
  metadata?: any;
  timestamp: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College' },
    type: {
      type: String,
      enum: ['student', 'payment', 'fleet', 'expense', 'system'],
      required: true,
    },
    message: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false }
);

activityLogSchema.index({ collegeId: 1, timestamp: -1 });

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
