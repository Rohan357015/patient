import { create } from 'zustand';
import api from '../utils/api';

export const useDoctorStore = create((set, get) => ({
  doctors: [],
  myProfile: null,
  loading: false,
  error: null,

  fetchDoctors: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/doctors');
      set({ doctors: response.data, loading: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch doctors.';
      set({ error: message, loading: false });
    }
  },

  fetchMyProfile: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/doctors/profile');
      set({ myProfile: response.data, loading: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch profile.';
      set({ error: message, loading: false });
    }
  },

  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put('/doctors/profile', profileData);
      set({ myProfile: response.data, loading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile.';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  addSlot: async (date, time) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/doctors/slots', { date, time });
      set({ myProfile: response.data, loading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add slot.';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  removeSlot: async (slotId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.delete(`/doctors/slots/${slotId}`);
      set({ myProfile: response.data, loading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete slot.';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  }
}));
