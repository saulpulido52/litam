import api from './api';

export interface ProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  birth_date?: string;
  age?: number;
  gender?: string;
  license_number?: string;
  specialties?: string[];
  experience_years?: number;
  education?: string;
  bio?: string;
}

export interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
}

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  appointment_reminders: boolean;
  new_patient_alerts: boolean;
  system_updates: boolean;
}

export interface ProfileStats {
  total_patients: number;
  total_appointments: number;
  experience_years: number;
  completion_rate: number;
  average_rating: number;
  total_reviews: number;
}

// Interfaces específicas por rol
export interface NutritionistProfile extends ProfileData {
  license_number?: string;
  specialties?: string[];
  experience_years?: number;
  education?: string;
  bio?: string;
  clinic_address?: string;
  consultation_hours?: string;
  certifications?: string[];
}

export interface PatientProfile extends ProfileData {
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  medical_history?: string[];
  allergies?: string[];
  current_medications?: string[];
  insurance_info?: {
    provider: string;
    policy_number: string;
  };
}

export interface AdminProfile extends ProfileData {
  department?: string;
  permissions?: string[];
  system_access_level?: string;
}

interface ApiResponse<T> {
  status: string;
  data: T;
}

class ProfileService {
  async getProfile() {
    const response = await api.get<ApiResponse<{ user: any }>>('/users/me');
    return response.data?.data.user;
  }

  async updateProfile(data: ProfileData) {
    const response = await api.patch<ApiResponse<{ user: any }>>('/users/me', data);
    return response.data?.data.user;
  }

  async updatePassword(data: PasswordUpdateData) {
    const response = await api.patch<ApiResponse<{ message: string }>>('/users/me/password', data);
    return response.data?.data;
  }

  async getProfileStats(): Promise<ProfileStats> {
    try {
      const response = await api.get<ApiResponse<{ stats: ProfileStats }>>('/users/me/stats');
      return response.data?.data?.stats || {
        total_patients: 0,
        total_appointments: 0,
        experience_years: 0,
        completion_rate: 0,
        average_rating: 0,
        total_reviews: 0
      };
    } catch (error) {
      console.error('Error fetching profile stats:', error);
      // Retornar estadísticas por defecto en caso de error
      return {
        total_patients: 0,
        total_appointments: 0,
        experience_years: 0,
        completion_rate: 0,
        average_rating: 0,
        total_reviews: 0
      };
    }
  }

  async updateNotificationSettings(settings: NotificationSettings) {
    const response = await api.patch<ApiResponse<{ message: string }>>('/users/me/notifications', settings);
    return response.data?.data;
  }

  async deleteAccount(confirmPassword: string) {
    const response = await api.delete<ApiResponse<{ message: string }>>('/users/me');
    return response.data?.data;
  }

  // Métodos específicos por rol
  async getNutritionistProfile() {
    const response = await api.get<ApiResponse<{ user: NutritionistProfile }>>('/users/me');
    return response.data?.data.user;
  }

  async updateNutritionistProfile(data: NutritionistProfile) {
    const response = await api.patch<ApiResponse<{ user: NutritionistProfile }>>('/users/me', data);
    return response.data?.data.user;
  }

  async getPatientProfile() {
    const response = await api.get<ApiResponse<{ user: PatientProfile }>>('/users/me');
    return response.data?.data.user;
  }

  async updatePatientProfile(data: PatientProfile) {
    const response = await api.patch<ApiResponse<{ user: PatientProfile }>>('/users/me', data);
    return response.data?.data.user;
  }

  async getAdminProfile() {
    const response = await api.get<ApiResponse<{ user: AdminProfile }>>('/users/me');
    return response.data?.data.user;
  }

  async updateAdminProfile(data: AdminProfile) {
    const response = await api.patch<ApiResponse<{ user: AdminProfile }>>('/users/me', data);
    return response.data?.data.user;
  }
}

export default new ProfileService(); 