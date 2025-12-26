import api from './api';

export interface ProfileData {
  id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  birth_date?: string;
  age?: number;
  gender?: string;
  role?: string | any;
  profile_image?: string | null;

  // Professional / Nutritionist Fields
  license_number?: string;
  license_issuing_authority?: string | null;
  professional_id?: string | null;
  professional_id_issuer?: string | null;
  university?: string | null;
  degree_title?: string | null;
  graduation_date?: string | null;
  verification_status?: 'pending' | 'approved' | 'rejected' | 'under_review';
  is_verified?: boolean;
  specialties?: string[];
  years_of_experience?: number;
  education?: string | string[];
  bio?: string;
  certifications?: string[];
  areas_of_interest?: string[];
  treatment_approach?: string;
  languages?: string[];
  consultation_fee?: number;
  professional_summary?: string;

  // Clinic Fields
  clinic_name?: string;
  clinic_address?: string;
  clinic_city?: string;
  clinic_state?: string;
  clinic_phone?: string;
  clinic_country?: string;
  clinic_zip_code?: string;
  clinic_notes?: string;
  latitude?: number;
  longitude?: number;

  // Social Media
  social_media?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
    website?: string;
  };

  // Availability
  im_available?: boolean;
  offers_in_person?: boolean;
  offers_online?: boolean;

  // Nested structure from backend
  nutritionist_profile?: any;
  nutritionist_availabilities?: {
    day_of_week: string;
    start_time_minutes: number;
    end_time_minutes: number;
    is_active: boolean;
  }[];
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
  appointments_today: number;
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
  degree_title?: string; // Add this too for NutritionistProfile
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

      // Helper to flatten profile
      const flattenProfile = (userData: any) => {
        if (!userData) return userData;
        const flat = { ...userData };
        if (userData.nutritionist_profile) {
          Object.assign(flat, userData.nutritionist_profile);
          // ensure camelCase to snake_case if needed, but entity uses snake_case:
          // nutritionist_profile has: license_number, certifications, etc.
          // ProfileData interface matches these snake_case names.
        }
        return flat;
      };

      // Manejar ambos formatos de respuesta
      if (responseData?.status === 'success' && responseData?.data?.user) {
        // Formato: { status: 'success', data: { user } }
        console.log('ProfileService - Extracted user from data.user:', responseData.data.user);
        return flattenProfile(responseData.data.user);
      } else if (responseData?.user) {
        // Formato: { user }
        console.log('ProfileService - Extracted user directly:', responseData.user);
        return flattenProfile(responseData.user);
      } else {
        console.error('ProfileService - Invalid response structure:', responseData);
        throw new Error('Estructura de respuesta inválida del servidor');
      }
    } catch (error: any) {
      console.error('ProfileService - Error fetching profile:', error);

      // Intentar obtener datos del localStorage como fallback
      const cachedProfile = localStorage.getItem('cached_profile');
      if (cachedProfile) {
        console.log('ProfileService - Using cached profile data');
        try {
          return JSON.parse(cachedProfile);
        } catch (e) {
          console.error('ProfileService - Error parsing cached profile');
        }
      }

      // Si no hay caché, retornar un perfil básico con datos del authService
      const authData = localStorage.getItem('auth_user');
      if (authData) {
        try {
          const user = JSON.parse(authData);
          console.log('ProfileService - Using auth data as fallback');
          return {
            id: user.id || '',
            email: user.email || '',
            first_name: user.first_name || 'Usuario',
            last_name: user.last_name || '',
            role: user.role || { name: 'nutritionist' },
            phone: '',
            birth_date: '',
            gender: '',
            profile_image: null,
            nutritionist_profile: null
          };
        } catch (e) {
          console.error('ProfileService - Error parsing auth data');
        }
      }

      // Último recurso: perfil mínimo
      console.warn('ProfileService - Returning minimal profile');
      return {
        id: '',
        email: 'usuario@ejemplo.com',
        first_name: 'Usuario',
        last_name: '',
        role: { name: 'nutritionist' },
        phone: '',
        birth_date: '',
        gender: '',
        profile_image: null,
        nutritionist_profile: null
      };
    }
  }

  async updateProfile(data: ProfileData) {
    try {
      console.log('ProfileService - Updating profile with data:', data);

      // Determinar si es un nutricionista
      const isNutritionist = data.role === 'nutritionist' ||
        data.role?.name === 'nutritionist' ||
        data.license_number ||
        data.specialties ||
        data.years_of_experience;

      const promises: Promise<any>[] = [];

      // 1. Actualizar datos básicos de usuario (/users/me)
      const userPayload: any = {};
      // Mapear explícitamente solo los campos permitidos en User
      if (data.first_name) userPayload.first_name = data.first_name;
      if (data.last_name) userPayload.last_name = data.last_name;
      if (data.phone) userPayload.phone = data.phone;
      // Bio NO pertenece a User, solo a NutritionistProfile. Eliminado para evitar crash 500.

      // Si hay datos de usuario para actualizar, agregamos la petición
      if (Object.keys(userPayload).length > 0) {
        console.log('ProfileService - Updating basic user info:', userPayload);
        promises.push(api.patch('/users/me', userPayload));
      }

      // 2. Actualizar datos de perfil profesional (/nutritionists/me/profile)
      if (isNutritionist) {

        const nutritionistPayload: any = {
          // Campos directos del DTO (CamelCase)
          licenseNumber: data.license_number,
          yearsOfExperience: data.years_of_experience,
          specialties: data.specialties,
          bio: data.bio, // Bio también en perfil para redundancia/seguridad
          education: Array.isArray(data.education) ? data.education : (data.education ? [data.education] : []),
          certifications: data.certifications,
          consultationFee: data.consultation_fee,

          // Clinic
          clinicName: data.clinic_name,
          clinicAddress: data.clinic_address,
          clinicCity: data.clinic_city,
          clinicState: data.clinic_state,
          clinicPhone: data.clinic_phone,
          clinicZipCode: data.clinic_zip_code,
          clinicCountry: data.clinic_country,

          // Availability inputs (snake_case -> camelCase)
          offersInPerson: data.offers_in_person,
          offersOnline: data.offers_online,
          isAvailable: data.im_available
        };

        // Limpieza estricta: Eliminar claves undefined/null
        Object.keys(nutritionistPayload).forEach(key => {
          if (nutritionistPayload[key] === undefined || nutritionistPayload[key] === null) {
            delete nutritionistPayload[key];
          }
        });

        if (Object.keys(nutritionistPayload).length > 0) {
          console.log('ProfileService - Updating nutritionist profile:', nutritionistPayload);
          promises.push(api.patch('/nutritionists/me/profile', nutritionistPayload));
        }
      }

      // Ejecutar todas las peticiones
      if (promises.length === 0) {
        console.warn('ProfileService - No updates to send');
        return data;
      }

      const results = await Promise.all(promises);

      // Combinar resultados para devolver al frontend
      let combinedUser = { ...data };

      results.forEach(res => {
        if (res.data?.status === 'success' && res.data?.data?.user) {
          combinedUser = { ...combinedUser, ...res.data.data.user };
        } else if (res.data?.status === 'success' && res.data?.data?.profile) {
          combinedUser = { ...combinedUser, ...res.data.data.profile };
        } else if (res && !res.data) {
          // Si el result es directo (por la forma en que api.patch devuelve cosas a veces)
          combinedUser = { ...combinedUser, ...res };
        }
      });

      return combinedUser;

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
          total_reviews: 0,
          appointments_today: 0
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
        total_reviews: 0,
        appointments_today: 0
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

  async deleteAccount() {
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
      // Create FormData with the correct field name
      const formData = new FormData();
      formData.append('profile_image', file);

      const response = await api.uploadFile<{ profile_image: string; user: any }>('/users/me/profile-image', formData);

      console.log('📤 Upload response:', response);

      if (response.data && response.data.data) {
        return { profile_image: response.data.data.profile_image };
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