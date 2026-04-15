import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'admin' | 'driver' | 'staff';

export interface IUser extends Document {
  userId: string;
  name: string;
  password: string;
  role: UserRole;
  mustChangePassword: boolean;
  isActive: boolean;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    /** System-generated ID, e.g. "Bus001" */
    userId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    /** bcrypt hashed — never returned by default */
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'driver', 'staff'] as UserRole[],
      default: 'staff',
    },
    /** Forces password change on next login (set after admin resets) */
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    /** Stored to allow server-side invalidation on logout */
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = mongoose.model<IUser>('User', userSchema);
