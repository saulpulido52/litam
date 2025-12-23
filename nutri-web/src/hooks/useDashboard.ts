<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import type { DashboardStats, NutritionistProfile } from '../services/dashboardService';

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [profile, setProfile] = useState<NutritionistProfile | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
=======
import { useState, useCallback, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import type { SimpleDashboardStats } from '../services/dashboardService';

export const useDashboard = () => {
  const [stats, setStats] = useState<SimpleDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
>>>>>>> nutri/main
    try {
      setLoading(true);
      setError(null);

<<<<<<< HEAD
      // Cargar datos en paralelo
      const [statsData, profileData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getNutritionistProfile()
      ]);

      setStats(statsData);
      setProfile(profileData.profile);
      setUser(profileData.user);
=======
      // Solo cargar estadísticas básicas que están disponibles
      const statsData = await dashboardService.getSimpleDashboardStats();
      setStats(statsData);

>>>>>>> nutri/main
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
<<<<<<< HEAD
  };

  const refreshStats = async () => {
    try {
      const statsData = await dashboardService.getDashboardStats();
=======
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);

      const statsData = await dashboardService.getSimpleDashboardStats();
>>>>>>> nutri/main
      setStats(statsData);
    } catch (err: any) {
      console.error('Error refreshing stats:', err);
      setError(err.message || 'Error al actualizar estadísticas');
<<<<<<< HEAD
    }
  };

  const refreshProfile = async () => {
    try {
      const profileData = await dashboardService.getNutritionistProfile();
      setProfile(profileData.profile);
      setUser(profileData.user);
    } catch (err: any) {
      console.error('Error refreshing profile:', err);
      setError(err.message || 'Error al actualizar perfil');
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return {
    stats,
    profile,
    user,
    loading,
    error,
    refreshStats,
    refreshProfile,
    reloadData: loadDashboardData
  };
=======
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
    getDietPlansSummary: () => Promise.resolve(null)};
>>>>>>> nutri/main
}; 