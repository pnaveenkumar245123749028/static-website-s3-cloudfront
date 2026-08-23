import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { config } from './env.js';

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
            console.warn('[Redis] Max reconnect attempts reached. Switching to in-memory queue fallback.');
            return null;
          }
          return Math.min(times * 100, 2000);
        },
      });

      redisClient.on('connect', () => {
        isRedisAvailable = true;
        console.log('[Redis] Connected successfully to Redis.');
      });

      redisClient.on('error', (err) => {
        console.warn(`[Redis] Redis connection issue: ${err.message}. Using in-memory queue fallback.`);
        isRedisAvailable = false;
      });
    } catch (err) {
      console.warn(`[Redis] Redis init failed: ${err.message}. Using in-memory queue.`);
      isRedisAvailable = false;
    }
  } else {
    console.log('[Queue] No REDIS_URL provided. Running with built-in asynchronous in-memory job queue.');
    isRedisAvailable = false;
  }
}

export function getRedisClient() {
  return redisClient;
}

export function getIsRedisAvailable() {
  return isRedisAvailable;
}
