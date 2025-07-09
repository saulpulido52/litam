import { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';
import type { 
  AdminUser, 
  AdminUserSubscription, 
  SystemHealth, 
  DataIntegrityReport,
  AdminUpdateUserDto,
  AdminVerifyNutritionistDto,
  AdminUpdateUserSubscriptionDto,
  AdminUpdateSettingsDto,
  EliminacionesResponse,
  EliminacionData
} from '../services/adminService';

interface AdminState {
  users: AdminUser[];
  subscriptions: AdminUserSubscription[];
  systemHealth: SystemHealth | null;
  dataIntegrity: DataIntegrityReport | null;
  loading: boolean;
  error: string | null;
  stats: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalSubscriptions: number;
    activeSubscriptions: number;
    expiredSubscriptions: number;
  };
}

export const useAdmin = () => {
  const [state, setState] = useState<AdminState>({
    users: [],
    subscriptions: [],
    systemHealth: null,
    dataIntegrity: null,
    loading: false,
    error: null,
    stats: {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      expiredSubscriptions: 0,
    }
  });

  // --- Gestión de Usuarios ---

  const loadUsers = useCallback(async (params?: {
    role?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await adminService.getAllUsers(params);
      const data = response as any;
      setState(prev => ({
        ...prev,
        users: data.data.users,
        stats: {
          ...prev.stats,
          totalUsers: data.data.total,
          activeUsers: data.data.users.filter((u: AdminUser) => u.is_active).length,
          inactiveUsers: data.data.users.filter((u: AdminUser) => !u.is_active).length,
        },
        loading: false
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al cargar usuarios',
        loading: false
      }));
    }
  }, []);

  const updateUser = useCallback(async (userId: string, updateData: AdminUpdateUserDto) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await adminService.updateUser(userId, updateData);
      // Recargar usuarios después de actualizar
      await loadUsers();
      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al actualizar usuario',
        loading: false
      }));
      throw error;
    }
  }, [loadUsers]);

  const deleteUser = useCallback(async (userId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await adminService.deleteUser(userId);
      // Recargar usuarios después de eliminar
      await loadUsers();
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al eliminar usuario',
        loading: false
      }));
      throw error;
    }
  }, [loadUsers]);

  const verifyNutritionist = useCallback(async (nutritionistId: string, verifyData: AdminVerifyNutritionistDto) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await adminService.verifyNutritionist(nutritionistId, verifyData);
      // Recargar usuarios después de verificar
      await loadUsers();
      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al verificar nutriólogo',
        loading: false
      }));
      throw error;
    }
  }, [loadUsers]);

  // --- Gestión de Suscripciones ---

  const loadSubscriptions = useCallback(async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await adminService.getAllUserSubscriptions(params);
      const data = response as any;
      setState(prev => ({
        ...prev,
        subscriptions: data.data.subscriptions,
        stats: {
          ...prev.stats,
          totalSubscriptions: data.data.total,
          activeSubscriptions: data.data.subscriptions.filter((s: AdminUserSubscription) => s.status === 'active').length,
          expiredSubscriptions: data.data.subscriptions.filter((s: AdminUserSubscription) => s.status === 'expired').length,
        },
        loading: false
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al cargar suscripciones',
        loading: false
      }));
    }
  }, []);

  const updateSubscription = useCallback(async (subscriptionId: string, updateData: AdminUpdateUserSubscriptionDto) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await adminService.updateUserSubscription(subscriptionId, updateData);
      // Recargar suscripciones después de actualizar
      await loadSubscriptions();
      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al actualizar suscripción',
        loading: false
      }));
      throw error;
    }
  }, [loadSubscriptions]);

  const deleteSubscription = useCallback(async (subscriptionId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await adminService.deleteUserSubscription(subscriptionId);
      // Recargar suscripciones después de eliminar
      await loadSubscriptions();
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al eliminar suscripción',
        loading: false
      }));
      throw error;
    }
  }, [loadSubscriptions]);

  // --- Salud del Sistema ---

  const loadSystemHealth = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const health = await adminService.getSystemHealth();
      setState(prev => ({
        ...prev,
        systemHealth: health,
        loading: false
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al cargar salud del sistema',
        loading: false
      }));
    }
  }, []);

  // --- Integridad de Datos ---

  const loadDataIntegrity = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const integrity = await adminService.diagnosisDataIntegrity();
      setState(prev => ({
        ...prev,
        dataIntegrity: integrity,
        loading: false
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al cargar diagnóstico de integridad',
        loading: false
      }));
    }
  }, []);

  const repairDataIntegrity = useCallback(async (dryRun: boolean = true) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await adminService.repairDataIntegrity(dryRun);
      setState(prev => ({ ...prev, loading: false }));
      return result;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al reparar integridad de datos',
        loading: false
      }));
      throw error;
    }
  }, []);

  // --- Configuraciones ---

  const updateSettings = useCallback(async (settings: AdminUpdateSettingsDto) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await adminService.updateGeneralSettings(settings);
      setState(prev => ({ ...prev, loading: false }));
      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al actualizar configuraciones',
        loading: false
      }));
      throw error;
    }
  }, []);

  // --- Carga inicial ---

  const loadAllData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await Promise.all([
        loadUsers(),
        loadSubscriptions(),
        loadSystemHealth(),
        loadDataIntegrity()
      ]);
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al cargar datos del admin',
        loading: false
      }));
    }
  }, [loadUsers, loadSubscriptions, loadSystemHealth, loadDataIntegrity]);

  // --- Limpiar error ---

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    loadUsers,
    updateUser,
    deleteUser,
    verifyNutritionist,
    loadSubscriptions,
    updateSubscription,
    deleteSubscription,
    loadSystemHealth,
    loadDataIntegrity,
    repairDataIntegrity,
    updateSettings,
    loadAllData,
    clearError
  };
}; 

// ===============================================
// AUDITORÍA DE ELIMINACIONES
// ===============================================

export const useEliminaciones = () => {
    const [eliminaciones, setEliminaciones] = useState<EliminacionData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [pagination, setPagination] = useState<any>(null);

    const fetchEliminaciones = useCallback(async (params?: {
        fechaDesde?: string;
        fechaHasta?: string;
        nutriologoId?: string;
        pacienteId?: string;
        page?: number;
        limit?: number;
    }) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await adminService.getEliminaciones(params);
            setEliminaciones(response.eliminaciones);
            setStats(response.stats);
            setPagination(response.pagination);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al obtener eliminaciones');
            console.error('Error fetching eliminaciones:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const exportarEliminaciones = useCallback(async (
        format: 'csv' | 'pdf',
        params?: {
            fechaDesde?: string;
            fechaHasta?: string;
            nutriologoId?: string;
            pacienteId?: string;
        }
    ) => {
        try {
            const blob = await adminService.exportEliminaciones(format, params);
            
            // Crear URL del blob y descargar
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `eliminaciones_${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            return true;
        } catch (err: any) {
            console.error('Error exportando eliminaciones:', err);
            throw err;
        }
    }, []);

    return {
        eliminaciones,
        loading,
        error,
        stats,
        pagination,
        fetchEliminaciones,
        exportarEliminaciones
    };
}; 