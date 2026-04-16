import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  name: string;
  role: string;
  profilePhoto?: string;
  settings: {
    darkMode: boolean;
    notifications: boolean;
  };
}

const AdminSchema: Schema = new Schema(
  {
    name: { type: String, default: 'Administrator' },
    role: { type: String, default: 'Proprietor' },
    profilePhoto: { type: String, default: '' },
    settings: {
      darkMode: { type: Boolean, default: true },
      notifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);
