import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from './env.js';

let ioInstance = null;

export function initSocket(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: [config.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  ioInstance.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      // Allow anonymous connection for demo/preview, or attach user if provided
      return next();
    }
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next();
    }
  });

  ioInstance.on('connection', (socket) => {
    const userId = socket.user?.id || socket.handshake.query?.userId;
    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on('subscribe:execution', (executionId) => {
      if (executionId) {
        socket.join(`execution:${executionId}`);
      }
    });

    socket.on('unsubscribe:execution', (executionId) => {
      if (executionId) {
        socket.leave(`execution:${executionId}`);
      }
    });

    socket.on('disconnect', () => {});
  });

  return ioInstance;
}

export function getIO() {
  return ioInstance;
}

export function emitAgentEvent(executionId, eventData) {
  if (!ioInstance) return;
  ioInstance.to(`execution:${executionId}`).emit('agent:event', {
    executionId,
    ...eventData,
    timestamp: new Date().toISOString(),
  });
}

export function emitExecutionStatus(executionId, statusData) {
  if (!ioInstance) return;
  ioInstance.to(`execution:${executionId}`).emit('execution:status', {
    executionId,
    ...statusData,
    timestamp: new Date().toISOString(),
  });
  // Also emit to all connected clients for dashboard execution updates
  ioInstance.emit('execution:update', {
    executionId,
    ...statusData,
    timestamp: new Date().toISOString(),
  });
}

export function emitNotification(userId, notification) {
  if (!ioInstance) return;
  if (userId) {
    ioInstance.to(`user:${userId}`).emit('notification:new', notification);
  }
  // broadcast general notifications
  ioInstance.emit('notification:broadcast', notification);
}
