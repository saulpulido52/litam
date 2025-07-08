import { useState } from 'react';
import appointmentsService from '../services/appointmentsService';
import type { AvailabilitySlot, ManageAvailabilityDto } from '../services/appointmentsService';

export interface UseAvailabilityReturn {
  availability: AvailabilitySlot[];
  loading: boolean;
  error: string | null;
  loadAvailability: () => Promise<void>;
  updateAvailability: (data: ManageAvailabilityDto) => Promise<void>;
  searchNutritionistAvailability: (nutritionistId: string, date?: string) => Promise<AvailabilitySlot[]>;
  clearError: () => void;
}

export const useAvailability = (): UseAvailabilityReturn => {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await appointmentsService.getMyAvailability();
      setAvailability(data);
    } catch (err: any) {
      console.error('Error loading availability:', err);
      setError(err.message || 'Error al cargar la disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = async (data: ManageAvailabilityDto) => {
    try {
      setLoading(true);
      setError(null);
      const updatedData = await appointmentsService.manageAvailability(data);
      setAvailability(updatedData);
    } catch (err: any) {
      console.error('Error updating availability:', err);
      setError(err.message || 'Error al actualizar la disponibilidad');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchNutritionistAvailability = async (nutritionistId: string, date?: string) => {
    try {
      setLoading(true);
      setError(null);
      const searchParams = date ? { date } : undefined;
      const data = await appointmentsService.searchNutritionistAvailability(nutritionistId, searchParams);
      return data;
    } catch (err: any) {
      console.error('Error searching nutritionist availability:', err);
      setError(err.message || 'Error al buscar disponibilidad del nutriólogo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    availability,
    loading,
    error,
    loadAvailability,
    updateAvailability,
    searchNutritionistAvailability,
    clearError,
  };
};
