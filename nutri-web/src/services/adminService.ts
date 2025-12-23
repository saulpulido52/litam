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

export interface AdminCreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleName: string;
  isActive?: boolean;
  phone?: string;
  birthDate?: string;
}

export interface AdminAppointment {
  id: string;
  appointment_date: string;
  status: string;
  notes?: string;
  patient: AdminUser;
  nutritionist: AdminUser;
  created_at: string;
  updated_at: string;
}

export interface AdminCreateAppointmentDto {
  patientId: string;
  nutritionistId: string;
  appointmentDate: string;
  status?: string;
  notes?: string;
}

export interface AdminFood {
  id: string;
  name: string;
  description?: string;
  category?: string;
  calories_per_100g?: number;
  protein_per_100g?: number;
  carbs_per_100g?: number;
  fat_per_100g?: number;
  fiber_per_100g?: number;
  created_at: string;
  updated_at: string;
}

export interface AdminCreateFoodDto {
  name: string;
  description?: string;
  category?: string;
  caloriesPer100g?: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
  fiberPer100g?: number;
}

export interface AdminRecipe {
  id: string;
  name: string;
  description?: string;
  instructions?: string;
  prep_time_minutes?: number;
  servings?: number;
  difficulty_level?: string;
  category?: string;
  created_by?: AdminUser;
  created_at: string;
  updated_at: string;
}

export interface AdminCreateRecipeDto {
  name: string;
  description?: string;
  instructions?: string;
  prepTimeMinutes?: number;
  servings?: number;
  difficultyLevel?: string;
  category?: string;
}

export interface AdminEducationalContent {
  id: string;
  title: string;
  content: string;
  type: string;
  target_audience?: string;
  tags?: string[];
  is_published: boolean;
  created_by?: AdminUser;
  created_at: string;
  updated_at: string;
}

export interface AdminCreateEducationalContentDto {
  title: string;
  content: string;
  type: string;
  targetAudience?: string;
  tags?: string[];
  isPublished?: boolean;
}

export interface AdminTransaction {
  id: string;
  amount: number;
  status: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  user: AdminUser;
  subscription?: AdminUserSubscription;
}

export interface AdminReview {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  patient: AdminUser;
  nutritionist: AdminUser;
}

export interface AdminTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  is_public: boolean;
  usage_count: number;
  rating?: number;
  created_by: AdminUser;
  created_at: string;
  updated_at: string;
}

export interface AdminConversation {
  id: string;
  created_at: string;
  updated_at: string;
  patient: AdminUser;
  nutritionist: AdminUser;
}

export interface AdminMessage {
  id: string;
  content: string;
  created_at: string;
  sender: AdminUser;
  conversation: AdminConversation;
}

export interface AdminClinicalRecord {
  id: string;
  created_at: string;
  updated_at: string;
  patient: AdminUser;
  nutritionist: AdminUser;
}

export interface AdvancedSystemMetrics {
  timestamp: string;
  users: {
    total: number;
    active: number;
    nutritionists: number;
    patients: number;
    admins: number;
    newLastMonth: number;
    activePercentage: number;
  };
  appointments: {
    total: number;
    completed: number;
    scheduled: number;
    canceled: number;
    today: number;
    completionRate: number;
  };
  financial: {
    totalTransactions: number;
    successfulTransactions: number;
    totalRevenue: number;
    successRate: number;
  };
  content: {
    foods: number;
    recipes: number;
    educationalContent: number;
    publishedContent: number;
    templates: number;
    publicTemplates: number;
    contentPublishRate: number;
  };
  activity: {
    clinicalRecords: number;
    conversations: number;
    messages: number;
    reviews: number;
    dietPlans: number;
    avgMessagesPerConversation: number;
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
    return (response as any).data?.data || (response as any).data;
  }

  async diagnosisDataIntegrity(): Promise<DataIntegrityReport> {
    const response = await api.get('/admin/system/integrity/diagnosis');
    return (response as any).data?.data || (response as any).data;
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

  // --- NUEVAS FUNCIONALIDADES COMPLETAS ---

  // Crear usuarios
  async createUser(userData: AdminCreateUserDto) {
    const response = await api.post('/admin/users', userData);
    return response.data;
  }

  // --- Gestión de Citas ---

  async getAllAppointments(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/admin/appointments?${queryParams.toString()}`);
    return response.data;
  }

  async createAppointment(appointmentData: AdminCreateAppointmentDto) {
    const response = await api.post('/admin/appointments', appointmentData);
    return response.data;
  }

  async updateAppointment(appointmentId: string, updateData: Partial<AdminCreateAppointmentDto>) {
    const response = await api.patch(`/admin/appointments/${appointmentId}`, updateData);
    return response.data;
  }

  async deleteAppointment(appointmentId: string) {
    const response = await api.delete(`/admin/appointments/${appointmentId}`);
    return response.data;
  }

  // --- Gestión de Expedientes Clínicos ---

  async getAllClinicalRecords(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/admin/clinical-records?${queryParams.toString()}`);
    return response.data;
  }

  async deleteClinicalRecord(recordId: string) {
    const response = await api.delete(`/admin/clinical-records/${recordId}`);
    return response.data;
  }

  // --- Gestión de Alimentos ---

  async getAllFoods(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/admin/foods?${queryParams.toString()}`);
    return response.data;
  }

  async createFood(foodData: AdminCreateFoodDto) {
    const response = await api.post('/admin/foods', foodData);
    return response.data;
  }

  async updateFood(foodId: string, updateData: Partial<AdminCreateFoodDto>) {
    const response = await api.patch(`/admin/foods/${foodId}`, updateData);
    return response.data;
  }

  async deleteFood(foodId: string) {
    const response = await api.delete(`/admin/foods/${foodId}`);
    return response.data;
  }

  // --- Gestión de Recetas ---

  async getAllRecipes(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/admin/recipes?${queryParams.toString()}`);
    return response.data;
  }

  async createRecipe(recipeData: AdminCreateRecipeDto) {
    const response = await api.post('/admin/recipes', recipeData);
    return response.data;
  }

  async deleteRecipe(recipeId: string) {
    const response = await api.delete(`/admin/recipes/${recipeId}`);
    return response.data;
  }

  // --- Gestión de Contenido Educativo ---

  async getAllEducationalContent(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/admin/educational-content?${queryParams.toString()}`);
    return response.data;
  }

  async createEducationalContent(contentData: AdminCreateEducationalContentDto) {
    const response = await api.post('/admin/educational-content', contentData);
    return response.data;
  }

  async deleteEducationalContent(contentId: string) {
    const response = await api.delete(`/admin/educational-content/${contentId}`);
    return response.data;
  }

  // --- Gestión de Transacciones ---

  async getAllTransactions(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/admin/transactions?${queryParams.toString()}`);
    return response.data;
  }

  // --- Gestión de Reseñas ---

  async getAllReviews(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/admin/reviews?${queryParams.toString()}`);
    return response.data;
  }

  async deleteReview(reviewId: string) {
    const response = await api.delete(`/admin/reviews/${reviewId}`);
    return response.data;
  }

  // --- Gestión de Plantillas ---

  async getAllTemplates(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/admin/templates?${queryParams.toString()}`);
    return response.data;
  }

  async deleteTemplate(templateId: string) {
    const response = await api.delete(`/admin/templates/${templateId}`);
    return response.data;
  }

  // --- Gestión de Conversaciones y Mensajes ---

  async getAllConversations(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/admin/conversations?${queryParams.toString()}`);
    return response.data;
  }

  async getAllMessages(params?: { conversationId?: string; page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.conversationId) queryParams.append('conversationId', params.conversationId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/admin/messages?${queryParams.toString()}`);
    return response.data;
  }

  // --- Métricas Avanzadas ---

  async getAdvancedSystemMetrics(): Promise<AdvancedSystemMetrics> {
    const response = await api.get('/admin/metrics/advanced');
    return (response as any).data?.data || (response as any).data;
  }
}

export const getAllNutritionists = () => adminService.getAllNutritionists();
export const getAllPatients = () => adminService.getAllPatients();

const adminService = new AdminService();
export default adminService; 