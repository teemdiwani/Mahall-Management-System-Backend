import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env.js';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error: any) {
    if (error?.message?.includes('ECONNREFUSED') && env.MONGODB_URI.startsWith('mongodb+srv://')) {
      try {
        console.warn('⚠️ Retrying MongoDB Atlas connection using Google public DNS (8.8.8.8)...');
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        const conn = await mongoose.connect(env.MONGODB_URI);
        console.log(`✅ MongoDB Connected with fallback DNS: ${conn.connection.host}/${conn.connection.name}`);
        return;
      } catch (retryError) {
        console.error('❌ MongoDB Connection Error after DNS retry:', retryError);
        process.exit(1);
      }
    }
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected.');
});
