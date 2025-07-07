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
    try {
      console.log('ProfileService - Fetching profile...');
      const response = await api.get<any>('/users/me');
      console.log('ProfileService - Response:', response.data);
      
      const responseData = response.data;
      
      // Manejar ambos formatos de respuesta
      if (responseData?.status === 'success' && responseData?.data?.user) {
        // Formato: { status: 'success', data: { user } }
        console.log('ProfileService - Extracted user from data.user:', responseData.data.user);
        return responseData.data.user;
      } else if (responseData?.user) {
        // Formato: { user }
        console.log('ProfileService - Extracted user directly:', responseData.user);
        return responseData.user;
      } else {
        console.error('ProfileService - Invalid response structure:', responseData);
        throw new Error('Estructura de respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('ProfileService - Error fetching profile:', error);
      throw error;
    }
  }

  async updateProfile(data: ProfileData) {
    try {
      const response = await api.patch<any>('/users/me', data);
      const responseData = response.data;
      
      // Manejar ambos formatos de respuesta
      if (responseData?.status === 'success' && responseData?.data?.user) {
        // Formato: { status: 'success', data: { user } }
        return responseData.data.user;
      } else if (responseData?.user) {
        // Formato: { user }
        return responseData.user;
      } else {
        throw new Error('Estructura de respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async updatePassword(data: PasswordUpdateData) {
    const response = await api.patch<ApiResponse<{ message: string }>>('/users/me/password', data);
    // El backend devuelve: { status: 'success', data: { message } }
    if (response.data?.status === 'success' && response.data?.data) {
      return response.data.data;
    } else {
      throw new Error('Estructura de respuesta inválida del servidor');
    }
  }

  async getProfileStats(): Promise<ProfileStats> {
    try {
      const response = await api.get<any>('/users/me/stats');
      const responseData = response.data;
      
      // Manejar ambos formatos de respuesta
      if (responseData?.status === 'success' && responseData?.data) {
        // Formato: { status: 'success', data: { ...stats } }
        return responseData.data;
      } else if (responseData && typeof responseData === 'object') {
        // Formato: { ...stats } directamente
        return responseData;
      } else {
        console.error('ProfileService - Invalid stats response structure:', responseData);
        // Retornar estadísticas por defecto en caso de estructura inválida
        return {
          total_patients: 0,
          total_appointments: 0,
          experience_years: 0,
          completion_rate: 0,
          average_rating: 0,
          total_reviews: 0
        };
      }
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
    // El backend devuelve: { status: 'success', data: { message } }
    if (response.data?.status === 'success' && response.data?.data) {
      return response.data.data;
    } else {
      throw new Error('Estructura de respuesta inválida del servidor');
    }
  }

  async deleteAccount(confirmPassword: string) {
    const response = await api.delete<ApiResponse<{ message: string }>>('/users/me');
    // El backend devuelve: { status: 'success', data: { message } }
    if (response.data?.status === 'success' && response.data?.data) {
      return response.data.data;
    } else {
      throw new Error('Estructura de respuesta inválida del servidor');
    }
  }

  // Métodos específicos por rol
  async getNutritionistProfile() {
    const response = await api.get<ApiResponse<{ user: NutritionistProfile }>>('/users/me');
    // El backend devuelve: { status: 'success', data: { user } }
    if (response.data?.status === 'success' && response.data?.data?.user) {
      return response.data.data.user;
    } else {
      throw new Error('Estructura de respuesta inválida del servidor');
    }
  }

  async updateNutritionistProfile(data: NutritionistProfile) {
    const response = await api.patch<ApiResponse<{ user: NutritionistProfile }>>('/users/me', data);
    // El backend devuelve: { status: 'success', data: { user } }
    if (response.data?.status === 'success' && response.data?.data?.user) {
      return response.data.data.user;
    } else {
      throw new Error('Estructura de respuesta inválida del servidor');
    }
  }

  async getPatientProfile() {
    const response = await api.get<ApiResponse<{ user: PatientProfile }>>('/users/me');
    // El backend devuelve: { status: 'success', data: { user } }
    if (response.data?.status === 'success' && response.data?.data?.user) {
      return response.data.data.user;
    } else {
      throw new Error('Estructura de respuesta inválida del servidor');
    }
  }

  async updatePatientProfile(data: PatientProfile) {
    const response = await api.patch<ApiResponse<{ user: PatientProfile }>>('/users/me', data);
    // El backend devuelve: { status: 'success', data: { user } }
    if (response.data?.status === 'success' && response.data?.data?.user) {
      return response.data.data.user;
    } else {
      throw new Error('Estructura de respuesta inválida del servidor');
    }
  }

  async getAdminProfile() {
    const response = await api.get<ApiResponse<{ user: AdminProfile }>>('/users/me');
    // El backend devuelve: { status: 'success', data: { user } }
    if (response.data?.status === 'success' && response.data?.data?.user) {
      return response.data.data.user;
    } else {
      throw new Error('Estructura de respuesta inválida del servidor');
    }
  }

  async updateAdminProfile(data: AdminProfile) {
    const response = await api.patch<ApiResponse<{ user: AdminProfile }>>('/users/me', data);
    // El backend devuelve: { status: 'success', data: { user } }
    if (response.data?.status === 'success' && response.data?.data?.user) {
      return response.data.data.user;
    } else {
      throw new Error('Estructura de respuesta inválida del servidor');
    }
  }

  async uploadProfileImage(file: File): Promise<{ profile_image: string }> {
    try {
      const response = await api.uploadFile<ApiResponse<{ profile_image: string }>>('/users/me/profile-image', file, 'profile_image');
      
      if (response.data?.status === 'success' && response.data?.data) {
        return response.data.data;
      } else {
        throw new Error('Estructura de respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  }
}

export default new ProfileService(); 