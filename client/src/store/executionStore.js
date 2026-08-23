import { create } from 'zustand';
import { api } from '../utils/api.js';
import { getSocket } from '../utils/socket.js';

export const useExecutionStore = create((set, get) => ({
  executions: [],
  activeExecution: null,
  timeline: [],
  isLoading: false,
  error: null,
  activeSubscriptionId: null,

  fetchExecutions: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/executions', { params });
      set({ executions: res.data.data.executions || [], isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchExecutionDetails: async (executionId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/api/executions/${executionId}/timeline`);
      const { execution, timeline } = res.data.data;
      set({ activeExecution: execution, timeline: timeline || [], isLoading: false });
      get().subscribeToExecution(executionId);
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  subscribeToExecution: (executionId) => {
    const socket = getSocket();
    if (!socket || !executionId) return;

    const currentSub = get().activeSubscriptionId;
    if (currentSub && currentSub !== executionId) {
      socket.emit('unsubscribe:execution', currentSub);
    }

    socket.emit('subscribe:execution', executionId);
    set({ activeSubscriptionId: executionId });

    // Handle agent events
    socket.off('agent:event');
    socket.on('agent:event', (eventData) => {
      if (eventData.executionId === executionId) {
        set({
          timeline: [...get().timeline, eventData],
        });
      }
    });

    // Handle execution status changes
    socket.off('execution:status');
    socket.on('execution:status', (statusData) => {
      if (statusData.executionId === executionId) {
        set({
          activeExecution: {
            ...get().activeExecution,
            ...statusData,
          },
        });
      }
    });
  },

  unsubscribe: () => {
    const currentSub = get().activeSubscriptionId;
    const socket = getSocket();
    if (socket && currentSub) {
      socket.emit('unsubscribe:execution', currentSub);
    }
    set({ activeSubscriptionId: null });
  },

  pauseExecution: async (executionId) => {
    try {
      await api.post(`/api/executions/${executionId}/pause`);
    } catch (err) {
      console.error('Pause execution error:', err);
    }
  },

  resumeExecution: async (executionId) => {
    try {
      await api.post(`/api/executions/${executionId}/resume`);
    } catch (err) {
      console.error('Resume execution error:', err);
    }
  },

  cancelExecution: async (executionId) => {
    try {
      await api.post(`/api/executions/${executionId}/cancel`);
    } catch (err) {
      console.error('Cancel execution error:', err);
    }
  },
}));
