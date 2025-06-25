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
    try {
      setLoading(true);
      setError(null);

      // Cargar datos en paralelo
      const [statsData, profileData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getNutritionistProfile()
      ]);

      setStats(statsData);
      setProfile(profileData.profile);
      setUser(profileData.user);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    try {
      const statsData = await dashboardService.getDashboardStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('Error refreshing stats:', err);
      setError(err.message || 'Error al actualizar estadísticas');
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
}; 