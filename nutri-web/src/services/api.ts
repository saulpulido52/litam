import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { ApiResponse } from '../types';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
          // Only log important requests, not every single one
          if (config.url?.includes('/auth/') || config.url?.includes('/patients/')) {
            console.log('🚀 Request with token:', config.method?.toUpperCase(), config.url);
          }
        } else {
          console.log('❌ Request without token:', config.method?.toUpperCase(), config.url);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.log('🚨 API Error Response:', error.response?.status, error.response?.data);
        if (error.response?.status === 401) {
          console.log('🚨 401 Unauthorized - Token may be invalid or missing');
          this.clearToken();
          // Solo redirigir si no estamos ya en la página de login
          if (window.location.pathname !== '/login') {
            console.log('🚨 Redirecting to login due to 401 error...');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    // Load token from localStorage
    this.loadToken();
  }

  private loadToken() {
    this.token = localStorage.getItem('access_token');
    // Commenting out noisy log: console.log('🔑 ApiService loadToken:', this.token ? `Token loaded: ${this.token.substring(0, 20)}...` : 'No token found');
  }

  public setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
    console.log('🔑 ApiService setToken:', token ? `Token set: ${token.substring(0, 20)}...` : 'Token cleared');
  }

  public clearToken() {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  public getToken(): string | null {
    return this.token;
  }

  // Generic API methods
  async get<T>(url: string, params?: object): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: object): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: object): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.put(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: object): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.patch(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.delete(url);
    return response.data;
  }

  // File upload
  async uploadFile<T>(url: string, file: File, fieldName = 'file'): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    const response: AxiosResponse<ApiResponse<T>> = await this.api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService; 