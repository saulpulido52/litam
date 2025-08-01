import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG } from '../constants';
import { useAuthStore } from '../store/authStore';
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  Appointment,
  DietPlan,
  ProgressLog,
  Message,
} from '../types';

// Crear instancia de axios
const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el token expiró, hacer logout
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    // Manejo de errores de red
    if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
      return Promise.reject({
        ...error,
        message: 'Error de conexión. Verifica tu conexión a internet.',
      });
    }

    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
};

// Servicios de usuario
export const userService = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> => {
    const response = await api.put('/users/change-password', passwordData);
    return response.data;
  },

  uploadProfileImage: async (imageData: FormData): Promise<ApiResponse<{ imageUrl: string }>> => {
    const response = await api.post('/users/upload-image', imageData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Servicios de citas
export const appointmentService = {
  getAppointments: async (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<Appointment[]>> => {
    const response = await api.get('/appointments', { params });
    return response.data;
  },

  getAppointmentById: async (id: string): Promise<ApiResponse<Appointment>> => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  createAppointment: async (appointmentData: {
    nutritionist_id: string;
    start_time: string;
    end_time: string;
    notes?: string;
  }): Promise<ApiResponse<Appointment>> => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  updateAppointment: async (
    id: string,
    appointmentData: Partial<Appointment>
  ): Promise<ApiResponse<Appointment>> => {
    const response = await api.put(`/appointments/${id}`, appointmentData);
    return response.data;
  },

  cancelAppointment: async (id: string, reason?: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/appointments/${id}`, {
      data: { reason },
    });
    return response.data;
  },

  rescheduleAppointment: async (
    id: string,
    newDateTime: {
      start_time: string;
      end_time: string;
    }
  ): Promise<ApiResponse<Appointment>> => {
    const response = await api.put(`/appointments/${id}/reschedule`, newDateTime);
    return response.data;
  },
};

// Servicios de planes de dieta
export const dietPlanService = {
  getDietPlans: async (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<DietPlan[]>> => {
    const response = await api.get('/diet-plans', { params });
    return response.data;
  },

  getDietPlanById: async (id: string): Promise<ApiResponse<DietPlan>> => {
    const response = await api.get(`/diet-plans/${id}`);
    return response.data;
  },

  getActiveDietPlan: async (): Promise<ApiResponse<DietPlan>> => {
    const response = await api.get('/diet-plans/active');
    return response.data;
  },

  updateDietPlan: async (
    id: string,
    planData: Partial<DietPlan>
  ): Promise<ApiResponse<DietPlan>> => {
    const response = await api.put(`/diet-plans/${id}`, planData);
    return response.data;
  },
};

// Servicios de progreso
export const progressService = {
  getProgress: async (params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<ApiResponse<ProgressLog[]>> => {
    const response = await api.get('/progress', { params });
    return response.data;
  },

  addProgress: async (progressData: {
    weight: number;
    body_fat_percentage?: number;
    muscle_mass?: number;
    notes?: string;
  }): Promise<ApiResponse<ProgressLog>> => {
    const response = await api.post('/progress', progressData);
    return response.data;
  },

  updateProgress: async (
    id: string,
    progressData: Partial<ProgressLog>
  ): Promise<ApiResponse<ProgressLog>> => {
    const response = await api.put(`/progress/${id}`, progressData);
    return response.data;
  },

  deleteProgress: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/progress/${id}`);
    return response.data;
  },
};

// Servicios de mensajes
export const messageService = {
  getMessages: async (params?: {
    conversationId?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Message[]>> => {
    const response = await api.get('/messages', { params });
    return response.data;
  },

  sendMessage: async (messageData: {
    receiver_id: string;
    content: string;
  }): Promise<ApiResponse<Message>> => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },

  markAsRead: async (messageId: string): Promise<ApiResponse<void>> => {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  },

  getConversations: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },
};

// Servicios de alimentos
export const foodService = {
  searchFoods: async (query: string): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/foods/search', { params: { q: query } });
    return response.data;
  },

  getFoodById: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/foods/${id}`);
    return response.data;
  },
};

// Servicios de dashboard
export const dashboardService = {
  getDashboardData: async (): Promise<ApiResponse<{
    nextAppointment: Appointment | null;
    todaysMeals: any[];
    weeklyProgress: any[];
    recentMessages: Message[];
  }>> => {
    const response = await api.get('/dashboard');
    return response.data;
  },
};

export default api; 