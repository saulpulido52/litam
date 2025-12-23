import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/api';
import { LoginRequest, RegisterRequest, ApiResponse, LoginResponse } from '../types';
import { MUTATION_KEYS, QUERY_KEYS } from '../constants';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { user, token, isAuthenticated, isLoading, login, logout, setLoading } = useAuthStore();

  // Mutación para login
  const loginMutation = useMutation({
    mutationKey: [MUTATION_KEYS.LOGIN],
    mutationFn: async (credentials: LoginRequest) => {
      setLoading(true);
      const response = await authService.login(credentials);
      return response;
    },
    onSuccess: (response: ApiResponse<LoginResponse>) => {
      if (response.status === 'success' && response.data) {
        login(response.data.user, response.data.token);
        // Invalidar queries relacionadas con el usuario
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.APPOINTMENTS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DIET_PLANS] });
      }
      setLoading(false);
    },
    onError: (error: any) => {
      setLoading(false);
      console.error('Login error:', error);
    },
  });

  // Mutación para registro
  const registerMutation = useMutation({
    mutationKey: [MUTATION_KEYS.REGISTER],
    mutationFn: async (userData: RegisterRequest) => {
      setLoading(true);
      const response = await authService.register(userData);
      return response;
    },
    onSuccess: (response: ApiResponse<LoginResponse>) => {
      if (response.status === 'success' && response.data) {
        login(response.data.user, response.data.token);
        // Invalidar queries relacionadas con el usuario
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
      }
      setLoading(false);
    },
    onError: (error: any) => {
      setLoading(false);
      console.error('Register error:', error);
    },
  });

  // Mutación para logout
  const logoutMutation = useMutation({
    mutationKey: [MUTATION_KEYS.LOGOUT],
    mutationFn: async () => {
      await authService.logout();
    },
    onSuccess: () => {
      logout();
      // Limpiar todas las queries en caché
      queryClient.clear();
    },
    onError: (error: any) => {
      // Hacer logout local incluso si falla el logout en el servidor
      logout();
      queryClient.clear();
      console.error('Logout error:', error);
    },
  });

  // Función para hacer login
  const handleLogin = async (credentials: LoginRequest) => {
    try {
      const result = await loginMutation.mutateAsync(credentials);
      return {
        success: result.status === 'success',
        error: result.status === 'error' ? result.message : null,
      };
    } catch (error: any) {
      let errorMessage = 'Error de conexión';
      
      if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
        errorMessage = 'No se puede conectar al servidor. Verifica tu conexión a internet.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Correo o contraseña incorrectos';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // Función para hacer registro
  const handleRegister = async (userData: RegisterRequest) => {
    try {
      const result = await registerMutation.mutateAsync(userData);
      return {
        success: result.status === 'success',
        error: result.status === 'error' ? result.message : null,
      };
    } catch (error: any) {
      let errorMessage = 'Error de conexión';
      
      if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
        errorMessage = 'No se puede conectar al servidor. Verifica tu conexión a internet.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Datos inválidos';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // Función para hacer logout
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      return { success: true }; // Siempre retornar success para logout local
    }
  };

  return {
    // Estado
    user,
    token,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    
    // Acciones
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    
    // Estados de mutación
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    logoutError: logoutMutation.error,
    
    // Flags de estado
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
  };
}; 