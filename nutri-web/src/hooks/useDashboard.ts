import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';
import type { SimpleDashboardStats } from '../services/dashboardService';

export const useDashboard = () => {
  const [stats, setStats] = useState<SimpleDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Solo cargar estadísticas básicas que están disponibles
      const statsData = await dashboardService.getSimpleDashboardStats();
      setStats(statsData);

    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);

      const statsData = await dashboardService.getSimpleDashboardStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('Error refreshing stats:', err);
      setError(err.message || 'Error al actualizar estadísticas');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    // State
    stats,
    loading,
    refreshing,
    error,
    
    // Actions
    refreshStats,
    reloadData: loadDashboardData,
    clearError,
    
    // Funcionalidades no disponibles (retornan null/empty para evitar errores)
    profile: null,
    user: null,
    incomeSummary: null,
    patientAnalytics: null,
    alerts: [],
    
    // Funciones que no están disponibles en el backend simplificado
    refreshProfile: () => Promise.resolve(),
    refreshIncomeSummary: () => Promise.resolve(),
    refreshPatientAnalytics: () => Promise.resolve(),
    markAlertAsRead: () => Promise.resolve(),
    getUpcomingAppointments: () => Promise.resolve([]),
    getRecentPatients: () => Promise.resolve([]),
    getPerformanceMetrics: () => Promise.resolve(null),
    getClinicalRecordsSummary: () => Promise.resolve(null),
    getDietPlansSummary: () => Promise.resolve(null),
  };
}; 