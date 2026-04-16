import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅  MongoDB connected');
  } catch (error) {
    console.error('❌  MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Automatically attempt to reconnect if MongoDB drops the idle connection
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️   MongoDB disconnected. Attempting to seamlessly reconnect...');
  setTimeout(() => {
    mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }).catch(err => {
      console.error('❌  MongoDB reconnection failed:', err);
    });
  }, 5000); // 5 second backoff
});
