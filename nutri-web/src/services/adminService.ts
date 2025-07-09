import api from './api';

// Tipos para el servicio de administración
export interface AdminUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  role: {
    id: string;
    name: string;
  };
  patient_profile?: any;
  nutritionist_profile?: any;
}

export interface AdminUserSubscription {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  user: AdminUser;
  subscription_plan: {
    id: string;
    name: string;
    price: number;
    duration: number;
    duration_type: string;
  };
}

export interface SystemHealth {
  database: {
    status: string;
    connection_time: number;
    active_connections: number;
  };
  api: {
    status: string;
    response_time: number;
    uptime: number;
  };
  users: {
    total: number;
    active: number;
    inactive: number;
    by_role: Record<string, number>;
  };
  subscriptions: {
    total: number;
    active: number;
    expired: number;
    cancelled: number;
  };
  system: {
    memory_usage: number;
    cpu_usage: number;
    disk_usage: number;
  };
}

export interface DataIntegrityReport {
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affected_records: number;
    suggested_fix: string;
  }>;
  summary: {
    total_issues: number;
    critical_issues: number;
    high_issues: number;
    medium_issues: number;
    low_issues: number;
  };
}

export interface AdminUpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive?: boolean;
  roleName?: string;
  newPassword?: string;
}

export interface AdminVerifyNutritionistDto {
  isVerified: boolean;
}

export interface AdminUpdateUserSubscriptionDto {
  planId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface AdminUpdateSettingsDto {
  aiSettings?: {
    model: string;
    temperature: number;
    maxTokens: number;
  };
  systemSettings?: {
    maxFileSize: number;
    allowedFileTypes: string[];
    sessionTimeout: number;
  };
  notificationSettings?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
  };
}

// ===============================================
// AUDITORÍA DE ELIMINACIONES
// ===============================================

export interface EliminacionData {
    id: string;
    patient: {
        id: string;
        name: string;
        email: string;
    };
    nutritionist: {
        id: string;
        name: string;
        email: string;
    };
    status: string;
    elimination_reason: string | null;
    notes: string | null;
    requested_at: string;
    updated_at: string;
    created_at: string;
}

export interface EliminacionesResponse {
    eliminaciones: EliminacionData[];
    stats: {
        total: number;
        pacientesUnicos: number;
        nutriologosInvolucrados: number;
        conMotivo: number;
        sinMotivo: number;
    };
    pagination: {
        page: number;
        limit: number;
        totalPages: number;
        totalItems: number;
    };
}



class AdminService {
  // --- Gestión de Usuarios ---

  async getAllUsers(params?: {
    role?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append('role', params.role);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/admin/users?${queryParams.toString()}`);
    return response.data as { data: { users: AdminUser[]; total: number } };
  }

  async getUserById(userId: string) {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  }

  async updateUser(userId: string, updateData: AdminUpdateUserDto) {
    const response = await api.patch(`/admin/users/${userId}`, updateData);
    return response.data;
  }

  async deleteUser(userId: string) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  }

  async verifyNutritionist(nutritionistId: string, verifyData: AdminVerifyNutritionistDto) {
    const response = await api.patch(`/admin/users/${nutritionistId}/verify-nutritionist`, verifyData);
    return response.data;
  }

  // --- Gestión de Suscripciones ---

  async getAllUserSubscriptions(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/admin/subscriptions?${queryParams.toString()}`);
    return response.data;
  }

  async updateUserSubscription(subscriptionId: string, updateData: AdminUpdateUserSubscriptionDto) {
    const response = await api.patch(`/admin/subscriptions/${subscriptionId}`, updateData);
    return response.data;
  }

  async deleteUserSubscription(subscriptionId: string) {
    const response = await api.delete(`/admin/subscriptions/${subscriptionId}`);
    return response.data;
  }

  // --- Configuraciones del Sistema ---

  async updateGeneralSettings(settings: AdminUpdateSettingsDto) {
    const response = await api.patch('/admin/settings', settings);
    return response.data;
  }

  // --- Herramientas de Integridad de Datos ---

  async getSystemHealth(): Promise<SystemHealth> {
    const response = await api.get('/admin/system/health');
    return response.data.data;
  }

  async diagnosisDataIntegrity(): Promise<DataIntegrityReport> {
    const response = await api.get('/admin/system/integrity/diagnosis');
    return response.data.data;
  }

  async repairDataIntegrity(dryRun: boolean = true) {
    const response = await api.post('/admin/system/integrity/repair', { dryRun });
    return response.data;
  }

  // --- Métodos de Utilidad ---

  async getUsersByRole(role: string) {
    return this.getAllUsers({ role, limit: 1000 });
  }

  async getActiveUsers() {
    return this.getAllUsers({ isActive: true, limit: 1000 });
  }

  async getInactiveUsers() {
    return this.getAllUsers({ isActive: false, limit: 1000 });
  }

  async getActiveSubscriptions() {
    return this.getAllUserSubscriptions({ status: 'active', limit: 1000 });
  }

  async getExpiredSubscriptions() {
    return this.getAllUserSubscriptions({ status: 'expired', limit: 1000 });
  }

  async getAllNutritionists() {
    const data = await this.getUsersByRole('nutritionist');
    return (data as any).data.users || (data as any).users || [];
  }
  async getAllPatients() {
    try {
      const response = await api.get('/admin/patients');
      return response.data as { users: AdminUser[] };
    } catch (error) {
      console.error('Error getting all patients:', error);
      throw error;
    }
  }

  async getEliminaciones(params?: {
    fechaDesde?: string;
    fechaHasta?: string;
    nutriologoId?: string;
    pacienteId?: string;
    page?: number;
    limit?: number;
  }): Promise<EliminacionesResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde);
      if (params?.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta);
      if (params?.nutriologoId) queryParams.append('nutriologoId', params.nutriologoId);
      if (params?.pacienteId) queryParams.append('pacienteId', params.pacienteId);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await api.get(`/admin/eliminaciones?${queryParams.toString()}`);
      return response.data as EliminacionesResponse;
    } catch (error) {
      console.error('Error obteniendo eliminaciones:', error);
      throw error;
    }
  }

  async exportEliminaciones(
    format: 'csv' | 'pdf',
    params?: {
      fechaDesde?: string;
      fechaHasta?: string;
      nutriologoId?: string;
      pacienteId?: string;
    }
  ): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('format', format);
      
      if (params?.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde);
      if (params?.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta);
      if (params?.nutriologoId) queryParams.append('nutriologoId', params.nutriologoId);
      if (params?.pacienteId) queryParams.append('pacienteId', params.pacienteId);

      const response = await api.get(`/admin/eliminaciones/export?${queryParams.toString()}`, {
        responseType: 'blob'
      });
      return response.data as Blob;
    } catch (error) {
      console.error('Error exportando eliminaciones:', error);
      throw error;
    }
  }
}

export const getAllNutritionists = () => adminService.getAllNutritionists();
export const getAllPatients = () => adminService.getAllPatients();

const adminService = new AdminService();
export default adminService; 