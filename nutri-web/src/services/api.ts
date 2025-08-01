import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { ApiResponse } from '../types';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;
  private requestQueue: Map<string, Promise<any>> = new Map();

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'}});

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        // **SIEMPRE INTENTAR CARGAR TOKEN ANTES DE ENVIAR REQUEST**
        if (!this.token) {
          try {
            this.loadToken();
          } catch (error) {
            console.error('🔑 Error loading token in request interceptor:', error);
          }
        }
        
        // **FORZAR RECARGA SI AÚN NO HAY TOKEN PERO EXISTE EN LOCALSTORAGE**
        if (!this.token) {
          const storageToken = localStorage.getItem('access_token');
          if (storageToken) {
            console.log('🔄 Token found in localStorage during request, force loading...');
            this.token = storageToken;
          }
        }
        
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
          // Log only critical requests for debugging (reduced logging)
          if (config.url?.includes('/auth/') || config.url?.includes('/dashboard/stats')) {
            console.log('🚀 Request with token:', config.method?.toUpperCase(), config.url, `Token: ${this.token.substring(0, 20)}...`);
          }
        } else {
          // Log only requests to protected endpoints without token
          if (config.url?.includes('/auth/') || config.url?.includes('/dashboard/') || config.url?.includes('/patients/') || config.url?.includes('/appointments/')) {
            console.group('❌ Request without token:');
            console.log('Method:', config.method?.toUpperCase());
            console.log('URL:', config.url);
            console.log('localStorage access_token:', localStorage.getItem('access_token') ? `EXISTS: ${localStorage.getItem('access_token')?.substring(0, 20)}...` : 'NOT FOUND');
            console.log('ApiService token:', this.token || 'NULL');
            console.groupEnd();
          }
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
        const originalRequest = error.config;
        
        // Solo loggear errores críticos o cuando sea necesario
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.group('🚨 API Error Details');
          console.log('Status:', error.response?.status);
          console.log('URL:', error.config?.url);
          console.log('Method:', error.config?.method?.toUpperCase());
          console.log('Request Data:', error.config?.data);
          console.log('Response Data:', error.response?.data);
          console.log('Error Message:', error.message);
          console.log('Authorization Header:', error.config?.headers?.Authorization ? 'PRESENT' : 'MISSING');
          console.groupEnd();
        } else if (error.response?.status === 500) {
          console.log('🚨 Server error (500) on:', error.config?.url);
        }
        
        // **RETRY AUTOMÁTICO PARA 401 CON TOKEN REFRESH**
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          console.log('🔄 401 detected, attempting token refresh...');
          
          try {
            // Intentar refresh del token
            const refreshResponse = await this.api.post('/auth/refresh-token');
            
            if (refreshResponse.data?.data?.token) {
              const newToken = refreshResponse.data.data.token;
              console.log('🔄 Token refreshed successfully');
              this.setToken(newToken);
              
              // Retry con el nuevo token
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            console.log('🚨 Token refresh failed:', refreshError);
          }
          
          // Si llegamos aquí, el refresh falló
          console.log('🚨 Token refresh failed, redirecting to login...');
          this.clearToken();
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        
        // **MANEJO MEJORADO PARA ERRORES 500 Y OTROS**
        if (error.response?.status === 500) {
          console.log('🚨 Server error (500), checking token validity...');
          // Verificar si el token existe pero el servidor está fallando
          if (this.token) {
            console.log('🔍 Token exists but server error, this might be a backend issue');
          }
        }
        
        return Promise.reject(error);
      }
    );

    // Load token from localStorage
    try {
      this.loadToken();
    } catch (error) {
      console.error('🔑 Error initializing token:', error);
    }
  }

  private loadToken(): void {
    try {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken && storedToken !== this.token) {
        this.token = storedToken;
        console.log('🔑 ApiService loadToken: Token refreshed from localStorage:', this.token.substring(0, 20) + '...');
      } else if (!storedToken && this.token) {
        this.token = null;
        console.log('🔑 ApiService loadToken: Token cleared (not in localStorage)');
      } else if (!storedToken) {
        console.log('🔑 ApiService loadToken: No token found in localStorage');
      } else if (storedToken && this.token && storedToken === this.token) {
        console.log('🔑 ApiService loadToken: Token already loaded and matches localStorage');
      }
    } catch (error) {
      console.error('🔑 Error loading token:', error);
      this.token = null;
    }
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

  public forceTokenReload(): void {
    console.log('🔄 Force reloading token from localStorage...');
    try {
      this.loadToken();
    } catch (error) {
      console.error('🔑 Error force reloading token:', error);
    }
  }

  public debugAuthState(): void {
    console.group('🔍 [API DEBUG] Authentication State:');
    console.log('ApiService token:', this.token ? `${this.token.substring(0, 20)}...` : 'NO TOKEN');
    console.log('localStorage access_token:', localStorage.getItem('access_token') ? `${localStorage.getItem('access_token')?.substring(0, 20)}...` : 'NO TOKEN');
    console.log('localStorage user:', localStorage.getItem('user') ? 'EXISTS' : 'NO USER');
    console.groupEnd();
  }

  // Generic API methods
  async get<T>(url: string, params?: object): Promise<ApiResponse<T>> {
    const requestKey = `GET:${url}:${JSON.stringify(params || {})}`;
    
    // Si ya hay una petición idéntica en progreso, esperarla
    if (this.requestQueue.has(requestKey)) {
      console.log('🔄 Reusing existing request for:', requestKey);
      return this.requestQueue.get(requestKey)!;
    }
    
    // Crear nueva petición
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
        'Content-Type': 'multipart/form-data'}});
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService; 