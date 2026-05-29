import { create } from 'zustand';
import api from '../utils/api';

export const useAppointmentStore = create((set) => ({
  appointments: [],
  loading: false,
  error: null,

  bookAppointment: async (doctorId, date, time) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/appointments', { doctorId, date, time });
      set((state) => ({
        appointments: [response.data, ...state.appointments],
        loading: false
      }));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to book appointment.';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  fetchPatientHistory: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/appointments/patient');
      set({ appointments: response.data, loading: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to retrieve appointment history.';
      set({ error: message, loading: false });
    }
  },

  fetchDoctorSchedule: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/appointments/doctor');
      set({ appointments: response.data, loading: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to retrieve schedule.';
      set({ error: message, loading: false });
    }
  },

  updateStatus: async (appointmentId, status) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/appointments/${appointmentId}`, { status });
      
      // Update local state list
      set((state) => ({
        appointments: state.appointments.map((appt) =>
          appt._id === appointmentId ? response.data : appt
        ),
        loading: false
      }));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update appointment status.';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  }
}));
