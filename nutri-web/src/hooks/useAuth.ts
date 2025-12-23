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

<<<<<<< HEAD
  // Initialize auth state
  useEffect(() => {
=======
  // Initialize auth state - CORREGIDO PARA EVITAR BUCLES
  useEffect(() => {
    let isMounted = true;
    
>>>>>>> nutri/main
    const initializeAuth = async () => {
      console.log('🔐 useAuth: Initializing authentication...');
      try {
        const isAuth = authService.isAuthenticated();
        console.log('🔐 useAuth: isAuthenticated =', isAuth);
        
<<<<<<< HEAD
        if (isAuth) {
          const storedUser = authService.getCurrentUserFromStorage();
          console.log('🔐 useAuth: storedUser =', storedUser ? 'Found' : 'Not found');
          
          if (storedUser) {
            setUser(storedUser);
            console.log('🔐 useAuth: User set from storage');
          } else {
=======
        if (isAuth && isMounted) {
          const storedUser = authService.getCurrentUserFromStorage();
          console.log('🔐 useAuth: storedUser =', storedUser ? 'Found' : 'Not found');
          
          if (storedUser && isMounted) {
            setUser(storedUser);
            console.log('🔐 useAuth: User set from storage');
          } else if (isMounted) {
>>>>>>> nutri/main
            // Try to fetch current user from API
            try {
              console.log('🔐 useAuth: Fetching current user from API...');
              const currentUser = await authService.getCurrentUser();
<<<<<<< HEAD
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
=======
              if (isMounted) {
                setUser(currentUser);
                console.log('🔐 useAuth: User fetched from API');
              }
            } catch (error) {
              console.error('🔐 useAuth: Failed to fetch current user:', error);
              if (isMounted) {
                // Don't logout immediately on API failure, keep stored user
                console.log('🔐 useAuth: API failed but keeping stored user');
              }
            }
          }
        } else if (isMounted) {
          console.log('🔐 useAuth: Not authenticated, no user set');
          setUser(null);
        }
      } catch (error) {
        console.error('🔐 useAuth: Auth initialization error:', error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          console.log('🔐 useAuth: Initialization complete');
        }
>>>>>>> nutri/main
      }
    };

    initializeAuth();
<<<<<<< HEAD
  }, []);
=======

    return () => {
      isMounted = false;
    };
  }, []); // Sin dependencias para evitar re-ejecución
>>>>>>> nutri/main

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
<<<<<<< HEAD
    refreshUser,
  };
=======
    refreshUser};
>>>>>>> nutri/main
};

export default useAuth; 