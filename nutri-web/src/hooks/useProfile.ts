import { useState, useEffect, useCallback } from 'react';
import profileService from '../services/profileService';
import type { ProfileData, PasswordUpdateData, NotificationSettings, ProfileStats } from '../services/profileService';

export const useProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profileData = await profileService.getProfile();
      setProfile(profileData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const statsData = await profileService.getProfileStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('Error al cargar estadísticas:', err);
    }
  }, []);

  const updateProfile = async (data: ProfileData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedProfile = await profileService.updateProfile(data);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el perfil');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (data: PasswordUpdateData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await profileService.updatePassword(data);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la contraseña');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationSettings = async (settings: NotificationSettings) => {
    setLoading(true);
    setError(null);
    try {
      const result = await profileService.updateNotificationSettings(settings);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar configuraciones');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (confirmPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await profileService.deleteAccount(confirmPassword);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la cuenta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    loadProfile();
    loadStats();
  }, [loadProfile, loadStats]);

  return {
    profile,
    stats,
    loading,
    error,
    loadProfile,
    loadStats,
    updateProfile,
    updatePassword,
    updateNotificationSettings,
    deleteAccount,
    clearError,
    reloadProfile: loadProfile,
    reloadStats: loadStats
  };
}; 