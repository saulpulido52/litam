import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { ApiResponse } from '../types';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;
  private requestQueue: Map<string, Promise<any>> = new Map();

  constructor() {
<<<<<<< HEAD
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'https://litam.onrender.com/api',
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
=======
    // Configurar la URL base para Supabase
    const baseURL = import.meta.env.VITE_API_URL || 'https://zmetgcekjpxcboyrnhat.supabase.co/rest/v1';
    
    this.api = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`
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
        
>>>>>>> nutri/main
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
<<<<<<< HEAD
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
=======
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
>>>>>>> nutri/main
  }

  public setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
<<<<<<< HEAD
    console.log('🔑 ApiService setToken:', token ? `Token set: ${token.substring(0, 20)}...` : 'Token cleared');
=======
    console.log('🔑 Token set successfully');
>>>>>>> nutri/main
  }

  public clearToken() {
    this.token = null;
    localStorage.removeItem('access_token');
<<<<<<< HEAD
=======
    console.log('🔑 Token cleared');
>>>>>>> nutri/main
  }

  public getToken(): string | null {
    return this.token;
  }

<<<<<<< HEAD
  // Generic API methods
  async get<T>(url: string, params?: object): Promise<ApiResponse<T>> {
    const requestKey = `GET:${url}:${JSON.stringify(params || {})}`;

    // Si ya hay una petición idéntica en progreso, esperarla
    if (this.requestQueue.has(requestKey)) {
      console.log('🔄 Reusing existing request for:', requestKey);
      return this.requestQueue.get(requestKey)!;
    }

    // Crear nueva petición
=======
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
    
>>>>>>> nutri/main
    const requestPromise = this.api.get(url, { params }).then(response => {
      this.requestQueue.delete(requestKey);
      return response.data;
    }).catch(error => {
      this.requestQueue.delete(requestKey);
      throw error;
    });
<<<<<<< HEAD

=======
    
>>>>>>> nutri/main
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
<<<<<<< HEAD

    const response: AxiosResponse<ApiResponse<T>> = await this.api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
=======
    
    const response: AxiosResponse<ApiResponse<T>> = await this.api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
>>>>>>> nutri/main
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService; 