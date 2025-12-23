import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { ApiResponse } from '../types';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;
  private requestQueue: Map<string, Promise<any>> = new Map();

  constructor() {
    // Configurar la URL base. Priorizar VITE_API_URL.
    // Si no está definida, usar localhost por defecto para desarrollo local.
    // La URL de Supabase encontrada anteriormente se ha movido a .env
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

    this.api = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        // Agregar headers de Supabase solo si existen las variables
        ...(import.meta.env.VITE_SUPABASE_ANON_KEY && {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          // Authorization se maneja dinámicamente en el interceptor, pero esto sirve de fallback
          // 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` 
        })
      }
    });

    // Initialize token from localStorage
    this.initializeToken();

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        // Cargar token si no existe
        if (!this.token) {
          try {
            this.initializeToken();
          } catch (error) {
            console.error('🔑 Error loading token in request interceptor:', error);
          }
        }

        // Agregar token de autenticación si existe
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
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
      async (error) => {
        console.error('🚨 API Error:', error.response?.status, error.config?.url);

        // Manejar errores de autenticación
        if (error.response?.status === 401) {
          console.log('🔑 Unauthorized, clearing token...');
          this.clearToken();
        }

        return Promise.reject(error);
      }
    );
  }

  private initializeToken(): void {
    try {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken && storedToken !== this.token) {
        this.token = storedToken;
        console.log('🔑 Token loaded from localStorage');
      } else if (!storedToken && this.token) {
        this.token = null;
        console.log('🔑 Token cleared (not in localStorage)');
      }
    } catch (error) {
      console.error('🔑 Error initializing token:', error);
      this.token = null;
    }
  }

  public setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
    console.log('🔑 Token set successfully');
  }

  public clearToken() {
    this.token = null;
    localStorage.removeItem('access_token');
    console.log('🔑 Token cleared');
  }

  public getToken(): string | null {
    return this.token;
  }

  public forceTokenReload(): void {
    console.log('🔄 Force reloading token...');
    try {
      this.initializeToken();
    } catch (error) {
      console.error('🔑 Error force reloading token:', error);
    }
  }

  public debugAuthState(): void {
    console.group('🔍 Authentication State:');
    console.log('ApiService token:', this.token ? 'EXISTS' : 'NO TOKEN');
    console.log('localStorage access_token:', localStorage.getItem('access_token') ? 'EXISTS' : 'NO TOKEN');
    console.groupEnd();
  }

  // Generic API methods
  async get<T>(url: string, params?: object): Promise<ApiResponse<T>> {
    const requestKey = `GET:${url}:${JSON.stringify(params || {})}`;

    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey)!;
    }

    const requestPromise = this.api.get(url, { params }).then(response => {
      this.requestQueue.delete(requestKey);
      return response.data;
    }).catch(error => {
      this.requestQueue.delete(requestKey);
      throw error;
    });

    this.requestQueue.set(requestKey, requestPromise);
    return requestPromise;
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
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;