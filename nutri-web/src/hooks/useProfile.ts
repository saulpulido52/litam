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
      console.log('useProfile - Loading profile...');
      const profileData = await profileService.getProfile();
      console.log('useProfile - Profile loaded successfully:', profileData);
      setProfile(profileData);
    } catch (err: any) {
      console.error('useProfile - Error loading profile:', err);
      const errorMessage = err.message || 'Error al cargar el perfil';
      setError(errorMessage);
      console.error('useProfile - Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      console.log('useProfile - Loading stats...');
      const statsData = await profileService.getProfileStats();
      console.log('useProfile - Stats loaded successfully:', statsData);
      setStats(statsData);
    } catch (err: any) {
      console.error('useProfile - Error loading stats:', err);
      // No establecer error global para stats, solo log
    }
  }, []);

  const updateProfile = async (data: ProfileData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('useProfile - Updating profile with data:', data);
      const updatedProfile = await profileService.updateProfile(data);
      console.log('useProfile - Profile updated successfully:', updatedProfile);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err: any) {
      console.error('useProfile - Error updating profile:', err);
      const errorMessage = err.message || 'Error al actualizar el perfil';
      setError(errorMessage);
      console.error('useProfile - Update error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
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