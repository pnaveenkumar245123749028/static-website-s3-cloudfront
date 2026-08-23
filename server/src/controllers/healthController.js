import { isDbConnected } from '../config/db.js';
import { getIsRedisAvailable } from '../config/queue.js';
import { config } from '../config/env.js';

export const healthController = {
  getHealth(req, res) {
    const memory = process.memoryUsage();
    res.status(200).json({
      success: true,
      status: 'healthy',
      service: 'agentflow-backend',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      checks: {
        database: isDbConnected() ? 'connected-mongo' : 'active-in-memory-fallback',
        redis: getIsRedisAvailable() ? 'connected-redis' : 'active-in-memory-queue',
        langGraph: 'available',
        openRouter: config.OPENROUTER_API_KEY ? 'configured' : 'fallback-gemini',
        gemini: config.GEMINI_API_KEY ? 'configured' : 'fallback-deterministic',
        credentialEncryption: config.CREDENTIAL_ENCRYPTION_KEY ? 'active-aes-256' : 'default-key',
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        heapUsedMb: (memory.heapUsed / 1024 / 1024).toFixed(2),
      },
    });
  },
};
