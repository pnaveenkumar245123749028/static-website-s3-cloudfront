import { io } from 'socket.io-client';

let socketInstance = null;

export function getSocket(token = null) {
  if (typeof window === 'undefined') return null;

  if (!socketInstance) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    socketInstance = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected to Agentflow real-time event bus.');
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket] Disconnected from real-time bus.');
    });
  }

  return socketInstance;
}
