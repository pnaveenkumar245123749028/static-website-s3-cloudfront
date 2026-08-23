import { create } from 'zustand';
import { api } from '../utils/api.js';
import { getSocket } from '../utils/socket.js';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isOpen: false,
  isLoading: false,

  setIsOpen: (isOpen) => set({ isOpen }),

  toggleOpen: () => set({ isOpen: !get().isOpen }),

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/api/notifications');
      const list = res.data.data.notifications || [];
      const unread = list.filter((n) => !n.read).length;
      set({ notifications: list, unreadCount: unread, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setupSocketListener: (token) => {
    const socket = getSocket(token);
    if (!socket) return;

    socket.on('notification:new', (notification) => {
      set({
        notifications: [notification, ...get().notifications],
        unreadCount: get().unreadCount + 1,
      });
    });

    socket.on('notification:broadcast', (notification) => {
      set({
        notifications: [notification, ...get().notifications],
        unreadCount: get().unreadCount + 1,
      });
    });
  },

  markAsRead: async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      set({
        notifications: get().notifications.map((n) => (n._id === id || n.id === id ? { ...n, read: true } : n)),
        unreadCount: Math.max(0, get().unreadCount - 1),
      });
    } catch {}
  },

  markAllAsRead: async () => {
    try {
      await api.put('/api/notifications/read-all');
      set({
        notifications: get().notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      });
    } catch {}
  },
}));
