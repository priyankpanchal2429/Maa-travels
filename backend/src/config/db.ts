import mongoose from 'mongoose';
import { env } from './env';

let isConnected = false;

/**
 * Connects to MongoDB Atlas.
 * Idempotent — safe to call multiple times.
 */
export const connectDB = async (): Promise<void> => {
  if (isConnected) return;

  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log('✅  MongoDB connected');
  } catch (error) {
    console.error('❌  MongoDB connection failed:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️   MongoDB disconnected — will reconnect on next request');
});
