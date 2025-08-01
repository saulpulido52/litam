import apiService from './api';
import type { LoginCredentials, AuthResponse, User} from '../types';

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse['data']>('/auth/login', credentials);
    
    console.log('🔐 Login response:', response);
    
    if (response.status === 'success' && response.data) {
      console.log('🔐 Setting token:', response.data.token ? `${response.data.token.substring(0, 20)}...` : 'NO TOKEN');
      apiService.setToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return {
      status: response.status,
      message: response.message,
      data: response.data!};
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiService.clearToken();
      localStorage.removeItem('user');
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiService.get<User>('/users/me');
      
      if (response.status === 'success' && response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      }
      
      throw new Error('Failed to get current user');
    } catch (error) {
      console.error('🔐 getCurrentUser error:', error);
      // Return stored user if API fails
      const storedUser = this.getCurrentUserFromStorage();
      if (storedUser) {
        console.log('🔐 Returning stored user due to API failure');
        return storedUser;
      }
      throw error;
    }
  }

  getCurrentUserFromStorage(): User | null {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        localStorage.removeItem('user');
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = apiService.getToken();
    const isAuth = !!token;
    // Only log when state changes or for important checks
    console.log('🔐 authService.isAuthenticated:', isAuth);
    return isAuth;
  }

  isNutritionist(): boolean {
    const user = this.getCurrentUserFromStorage();
    return user?.role?.name === 'nutritionist';
  }

  async refreshToken(): Promise<boolean> {
    try {
      const response = await apiService.post<{ token: string }>('/auth/refresh-token');
      
      if (response.status === 'success' && response.data?.token) {
        apiService.setToken(response.data.token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      return false;
    }
  }
}

export const authService = new AuthService();
export default authService; 