import { useState, useEffect, useCallback } from 'react';
import appointmentsService from '../services/appointmentsService';
import type { AppointmentType, CreateAppointmentDto, CreateAppointmentForPatientDto, UpdateAppointmentStatusDto } from '../services/appointmentsService';

export interface UseAppointmentsReturn {
  appointments: AppointmentType[];
  loading: boolean;
  error: string | null;
  loadAppointments: () => Promise<void>;
  createAppointment: (data: CreateAppointmentDto) => Promise<void>;
  createAppointmentForPatient: (data: CreateAppointmentForPatientDto) => Promise<void>;
  updateAppointmentStatus: (id: string, data: UpdateAppointmentStatusDto) => Promise<void>;
  clearError: () => void;
}

export const useAppointments = (): UseAppointmentsReturn => {
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const clearError = useCallback(() => setError(null), []);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar autenticación antes de hacer la petición
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const data = await appointmentsService.getMyAppointments();
      setAppointments(data);
    } catch (err: any) {
      console.error('Error loading appointments:', err);
      setError(err.message || 'Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAppointment = useCallback(async (data: CreateAppointmentDto) => {
    try {
      setLoading(true);
      setError(null);
      await appointmentsService.scheduleAppointment(data);
      await loadAppointments(); // Recargar después de crear
    } catch (err: any) {
      console.error('Error creating appointment:', err);
      setError(err.message || 'Error al crear la cita');
      throw err; // Re-throw para que el componente pueda manejar específicamente
    } finally {
      setLoading(false);
    }
  }, [loadAppointments]);

  const createAppointmentForPatient = useCallback(async (data: CreateAppointmentForPatientDto) => {
    try {
      setLoading(true);
      setError(null);
      await appointmentsService.scheduleAppointmentForPatient(data);
      await loadAppointments(); // Recargar después de crear
    } catch (err: any) {
      console.error('Error creating appointment for patient:', err);
      setError(err.message || 'Error al crear la cita para el paciente');
      throw err; // Re-throw para que el componente pueda manejar específicamente
    } finally {
      setLoading(false);
    }
  }, [loadAppointments]);

  const updateAppointmentStatus = useCallback(async (id: string, data: UpdateAppointmentStatusDto) => {
    try {
      setLoading(true);
      setError(null);
      await appointmentsService.updateAppointmentStatus(id, data);
      await loadAppointments(); // Recargar después de actualizar
    } catch (err: any) {
      console.error('Error updating appointment status:', err);
      setError(err.message || 'Error al actualizar el estado de la cita');
      throw err; // Re-throw para que el componente pueda manejar específicamente
    } finally {
      setLoading(false);
    }
  }, [loadAppointments]);

  useEffect(() => {
    // Carga inicial simple
    if (!hasInitialized) {
      setHasInitialized(true);
      loadAppointments();
    }
  }, [hasInitialized, loadAppointments]);

  return {
    appointments,
    loading,
    error,
    loadAppointments,
    createAppointment,
    createAppointmentForPatient,
    updateAppointmentStatus,
    clearError,
  };
};
