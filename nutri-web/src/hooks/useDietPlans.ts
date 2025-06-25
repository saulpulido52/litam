import { useState, useEffect, useCallback } from 'react';
import dietPlansService from '../services/dietPlansService';
import type { 
  DietPlan, 
  CreateDietPlanDto, 
  GenerateAIDietDto,
  WeeklyPlanDto 
} from '../types/diet';

interface UseDietPlansReturn {
  dietPlans: DietPlan[];
  loading: boolean;
  error: string | null;
  stats: {
    total: number;
    active: number;
    completed: number;
    draft: number;
  };
  fetchDietPlans: (patientId: string) => Promise<void>;
  fetchAllDietPlans: () => Promise<void>;
  createDietPlan: (data: CreateDietPlanDto) => Promise<DietPlan>;
  generateDietPlanWithAI: (data: GenerateAIDietDto) => Promise<DietPlan>;
  updateDietPlan: (id: string, data: Partial<DietPlan>) => Promise<DietPlan>;
  updateDietPlanStatus: (id: string, status: string) => Promise<DietPlan>;
  deleteDietPlan: (id: string) => Promise<void>;
  addWeekToPlan: (dietPlanId: string, weekData: WeeklyPlanDto) => Promise<DietPlan>;
  refreshStats: () => Promise<void>;
  clearError: () => void;
  setError: (error: string) => void;
}

export const useDietPlans = (): UseDietPlansReturn => {
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    draft: 0,
  });

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchDietPlans = useCallback(async (patientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const plans = await dietPlansService.getDietPlansForPatient(patientId);
      setDietPlans(Array.isArray(plans) ? plans : []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los planes de dieta');
      setDietPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllDietPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const plans = await dietPlansService.getAllDietPlans();
      setDietPlans(Array.isArray(plans) ? plans : []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los planes de dieta');
      setDietPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createDietPlan = useCallback(async (data: CreateDietPlanDto): Promise<DietPlan> => {
    setLoading(true);
    setError(null);
    try {
      console.log('🟢 useDietPlans - Datos recibidos para crear plan:', data);
      
      const newPlan = await dietPlansService.createDietPlan(data);
      
      console.log('🟢 useDietPlans - Plan creado exitosamente:', newPlan);
      
      await fetchAllDietPlans();
      
      return newPlan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating diet plan';
      console.error('🔴 useDietPlans - Error en createDietPlan:', err);
      
      if (err && typeof err === 'object' && 'response' in err) {
        console.error('🔴 useDietPlans - Error response:', (err as any).response?.data);
        console.error('🔴 useDietPlans - Error status:', (err as any).response?.status);
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchAllDietPlans]);

  const generateDietPlanWithAI = useCallback(async (data: GenerateAIDietDto): Promise<DietPlan> => {
    setLoading(true);
    setError(null);
    try {
      const generatedPlan = await dietPlansService.generateDietPlanWithAI(data);
      setDietPlans(prev => [...prev, generatedPlan]);
      return generatedPlan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error generating diet plan with AI';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDietPlan = useCallback(async (id: string, data: Partial<DietPlan>): Promise<DietPlan> => {
    setLoading(true);
    setError(null);
    try {
      const updatedPlan = await dietPlansService.updateDietPlan(id, data);
      
      // Refrescar la lista completa desde el backend
      await fetchAllDietPlans();
      
      return updatedPlan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating diet plan';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchAllDietPlans]);

  const updateDietPlanStatus = useCallback(async (id: string, status: string): Promise<DietPlan> => {
    setLoading(true);
    setError(null);
    try {
      const updatedPlan = await dietPlansService.updateDietPlanStatus(id, status);
      
      // Refrescar la lista completa desde el backend
      await fetchAllDietPlans();
      
      return updatedPlan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating diet plan status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchAllDietPlans]);

  const deleteDietPlan = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await dietPlansService.deleteDietPlan(id);
      
      // Refrescar la lista completa desde el backend
      await fetchAllDietPlans();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting diet plan';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchAllDietPlans]);

  const addWeekToPlan = useCallback(async (dietPlanId: string, weekData: WeeklyPlanDto): Promise<DietPlan> => {
    setLoading(true);
    setError(null);
    try {
      const updatedPlan = await dietPlansService.addWeekToPlan(dietPlanId, weekData);
      
      // Refrescar la lista completa desde el backend
      await fetchAllDietPlans();
      
      return updatedPlan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error adding week to diet plan';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchAllDietPlans]);

  const refreshStats = useCallback(async () => {
    try {
      const newStats = await dietPlansService.getDietPlansStats();
      setStats(newStats);
    } catch (err) {
      console.error('Error refreshing stats:', err);
    }
  }, []);

  // Calcular estadísticas cuando cambian los dietPlans
  useEffect(() => {
    const safeDietPlans = Array.isArray(dietPlans) ? dietPlans : [];
    const newStats = {
      total: safeDietPlans.length,
      active: safeDietPlans.filter(plan => plan.status === 'active').length,
      completed: safeDietPlans.filter(plan => plan.status === 'completed').length,
      draft: safeDietPlans.filter(plan => plan.status === 'draft').length,
    };
    setStats(newStats);
  }, [dietPlans]);

  return {
    dietPlans,
    loading,
    error,
    stats,
    fetchDietPlans,
    fetchAllDietPlans,
    createDietPlan,
    generateDietPlanWithAI,
    updateDietPlan,
    updateDietPlanStatus,
    deleteDietPlan,
    addWeekToPlan,
    refreshStats,
    clearError,
    setError,
  };
}; 