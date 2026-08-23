import mongoose from 'mongoose';
import { config } from './env.js';

let isConnected = false;

export async function connectDB() {
  if (config.MONGODB_URI) {
    try {
      const conn = await mongoose.connect(config.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      isConnected = true;
      console.log(`[DB] Connected to MongoDB: ${conn.connection.host}`);
      return true;
    } catch (err) {
      console.warn(`[DB] MongoDB connection failed (${err.message}). Falling back to robust in-memory store.`);
      isConnected = false;
      return false;
    }
  } else {
    console.log('[DB] No MONGODB_URI provided. Running in high-performance In-Memory Mode with full persistence emulation.');
    isConnected = false;
    return false;
  }
}

export function isDbConnected() {
  return isConnected;
}
