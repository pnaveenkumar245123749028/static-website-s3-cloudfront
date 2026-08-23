import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { config } from './env.js';
import logger from './logger.js';

let redisClient = null;
let isRedisAvailable = false;

export function initRedis() {
  if (config.REDIS_URL) {
    try {
      redisClient = new Redis(config.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        retryStrategy(times) {
          if (times > 3) {
            logger.warn('Max Redis reconnect attempts reached. Switching to in-memory queue fallback.');
            return null;
          }
          return Math.min(times * 100, 2000);
        },
      });

      redisClient.on('connect', () => {
        isRedisAvailable = true;
        logger.info('Connected to Redis.');
      });

      redisClient.on('error', (err) => {
        logger.warn({ err: err.message }, 'Redis connection issue. Falling back to in-memory queue.');
        isRedisAvailable = false;
      });
    } catch (err) {
      logger.warn({ err: err.message }, 'Redis init failed. Using in-memory queue fallback.');
      isRedisAvailable = false;
    }
  } else {
    logger.info('No REDIS_URL provided. Using in-memory job queue (dev only).');
    isRedisAvailable = false;
  }
}

export function getRedisClient() {
  return redisClient;
}

export function getIsRedisAvailable() {
  return isRedisAvailable;
}
