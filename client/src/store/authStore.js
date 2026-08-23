import { create } from 'zustand';
import { api } from '../utils/api.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('agentflow_auth');
    if (stored) {
      try {
        const { state } = JSON.parse(stored);
        if (state?.token && state?.user) {
          set({ user: state.user, token: state.token });
          // verify session with /api/auth/me
          try {
            const res = await api.get('/api/auth/me');
            if (res.data?.data?.user) {
              set({ user: res.data.data.user, isInitialized: true });
              get().saveToStorage();
              return;
            }
          } catch {
            get().logout();
          }
        }
      } catch {}
    }
    set({ isInitialized: true });
  },

  saveToStorage: () => {
    const { user, token } = get();
    if (typeof window !== 'undefined') {
      localStorage.setItem('agentflow_auth', JSON.stringify({ state: { user, token } }));
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const { user, token } = res.data.data;
      set({ user, token, isLoading: false });
      get().saveToStorage();
      return user;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  register: async (name, email, password, role = 'operator') => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/api/auth/register', { name, email, password, role });
      const { user, token } = res.data.data;
      set({ user, token, isLoading: false });
      get().saveToStorage();
      return user;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Registration failed';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  logout: () => {
    set({ user: null, token: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agentflow_auth');
    }
  },
}));
