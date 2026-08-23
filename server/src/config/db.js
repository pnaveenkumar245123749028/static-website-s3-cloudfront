import mongoose from 'mongoose';
import { config } from './env.js';
import logger from './logger.js';

let isConnected = false;

export async function connectDB() {
  if (config.MONGODB_URI) {
    try {
      const conn = await mongoose.connect(config.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      isConnected = true;
      logger.info({ host: conn.connection.host }, 'DB Connected to MongoDB');
      return true;
    } catch (err) {
      logger.warn({ err: err.message }, 'MongoDB connection failed. Falling back to in-memory store.');
      isConnected = false;
      return false;
    }
  } else {
    logger.info('No MONGODB_URI provided. Running in in-memory mode (dev only).');
    isConnected = false;
    return false;
  }
}

export function isDbConnected() {
  return isConnected;
}
