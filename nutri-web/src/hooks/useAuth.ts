import { useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import type { User, LoginCredentials } from '../types';

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔐 useAuth: Initializing authentication...');
      try {
        const isAuth = authService.isAuthenticated();
        console.log('🔐 useAuth: isAuthenticated =', isAuth);
        
        if (isAuth) {
          const storedUser = authService.getCurrentUserFromStorage();
          console.log('🔐 useAuth: storedUser =', storedUser ? 'Found' : 'Not found');
          
          if (storedUser) {
            setUser(storedUser);
            console.log('🔐 useAuth: User set from storage');
          } else {
            // Try to fetch current user from API
            try {
              console.log('🔐 useAuth: Fetching current user from API...');
              const currentUser = await authService.getCurrentUser();
              setUser(currentUser);
              console.log('🔐 useAuth: User fetched from API');
            } catch (error) {
              console.error('🔐 useAuth: Failed to fetch current user:', error);
              authService.logout();
            }
          }
        } else {
          console.log('🔐 useAuth: Not authenticated, no user set');
        }
      } catch (error) {
        console.error('🔐 useAuth: Auth initialization error:', error);
      } finally {
        setIsLoading(false);
        console.log('🔐 useAuth: Initialization complete');
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      
      if (response.status === 'success') {
        setUser(response.data.user);
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al iniciar sesión' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!authService.isAuthenticated()) return;
    
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
    }
  }, [logout]);

  return {
    user,
    isAuthenticated: !!user && authService.isAuthenticated(),
    isLoading,
    login,
    logout,
    refreshUser,
  };
};

export default useAuth; 