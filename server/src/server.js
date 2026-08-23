import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config, validateConfigOrThrow } from './config/env.js';
import logger from './config/logger.js';
import { connectDB } from './config/db.js';
import { initSocket } from './config/socket.js';
import { initRedis } from './config/queue.js';
import { initExecutionQueue } from './queues/executionQueue.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';

// Route imports
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import workflowRoutes from './routes/workflowRoutes.js';
import executionRoutes from './routes/executionRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();
const server = http.createServer(app);

// 1. Security & Core Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: [config.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global API rate limiting
app.use('/api', apiRateLimiter);

// 2. Initialize Real-Time & Background Subsystems
initSocket(server);
initRedis();
initExecutionQueue();

// 3. API Routes Mounting
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/notifications', notificationRoutes);

// Root fallback handler
app.get('/', (req, res) => {
  res.json({
    name: 'Agentflow_AI API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// 4. Centralized Error Handler
app.use(errorHandler);

// 5. Connect Database and Start Server
async function startServer() {
  // Validate critical env vars for production
  try {
    validateConfigOrThrow();
  } catch (err) {
    logger.error({ err: err.message }, 'Configuration validation failed');
    process.exit(1);
  }

  await connectDB();

  if (process.env.NODE_ENV !== 'test') {
    server.listen(config.PORT, () => {
      logger.info('======================================================');
      logger.info({ port: config.PORT, client: config.CLIENT_URL }, 'Agentflow_AI Server running');
      logger.info({ health: `http://localhost:${config.PORT}/api/health` }, 'Health check');
      logger.info('======================================================');
    });
  }
}

if (process.argv[1]?.endsWith('server.js')) {
  startServer().catch((err) => {
    console.error('Fatal server boot error:', err);
    process.exit(1);
  });
}

export { app, server, startServer };
