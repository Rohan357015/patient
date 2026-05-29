import { create } from 'zustand';
import api from '../utils/api';

const getInitialUser = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

export const useAuthStore = create((set) => ({
  user: getInitialUser(),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;
      localStorage.setItem('userInfo', JSON.stringify(data));
      set({ user: data, loading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check credentials.';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  register: async (name, email, password, role) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const data = response.data;
      localStorage.setItem('userInfo', JSON.stringify(data));
      set({ user: data, loading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed.';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  logout: () => {
    localStorage.removeItem('userInfo');
    set({ user: null, error: null });
  },

  clearError: () => set({ error: null })
}));
