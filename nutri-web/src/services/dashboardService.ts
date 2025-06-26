import { apiService } from './api';

export interface SimpleDashboardStats {
  total_patients: number;
  total_appointments: number;
  total_diet_plans: number;
  total_clinical_records: number;
  recent_activities: Array<{ type: string; id: string; date: string; description: string }>;
  weekly_summary: {
    new_patients: number;
    new_appointments: number;
  };
  performance_metrics: {
    completion_rate: number;
  };
  system_performance: {
    last_patient: string | null;
    last_appointment: string | null;
    last_diet_plan: string | null;
    last_clinical_record: string | null;
  };
}

export interface DashboardStats {
  total_patients: number;
  new_patients_last_month: number;
  patients_with_medical_conditions: number;
  active_relationships: number;
  total_appointments: number;
  appointments_today: number;
  appointments_this_week: number;
  completed_appointments: number;
  pending_appointments: number;
  total_diet_plans: number;
  active_diet_plans: number;
  completed_diet_plans: number;
  total_clinical_records: number;
  recent_clinical_records: number;
  total_income: number;
  monthly_income: number;
  average_consultation_fee: number;
  recent_activities: Array<{
    id: string;
    type: 'appointment' | 'patient' | 'diet_plan' | 'clinical_record' | 'progress' | 'message';
    title: string;
    description: string;
    date: string;
    patient_name?: string;
    icon?: string;
  }>;
  upcoming_appointments: Array<{
    id: string;
    patient_name: string;
    patient_email: string;
    date: string;
    time: string;
    type: string;
    status: string;
  }>;
  recent_patients: Array<{
    id: string;
    name: string;
    email: string;
    joined_date: string;
    status: 'active' | 'inactive' | 'pending';
    last_visit?: string;
    next_appointment?: string;
  }>;
  performance_metrics: {
    completion_rate: number;
    patient_retention_rate: number;
    diet_plan_success_rate: number;
    average_response_time: number;
    patient_satisfaction: number;
  };
}

export interface NutritionistProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  specialties: string[];
  years_of_experience: number;
  consultation_fee: number;
  bio: string;
  is_verified: boolean;
  license_number: string;
  is_available: boolean;
  languages: string[];
  education: string;
  certifications: string[];
  total_consultations: number;
  average_rating: number;
  total_reviews: number;
}

export interface IncomeSummary {
  total_income: number;
  total_consultations: number;
  average_per_consultation: number;
  period: string;
  monthly_trend: Array<{
    month: string;
    income: number;
    consultations: number;
  }>;
  top_services: Array<{
    service: string;
    income: number;
    consultations: number;
  }>;
}

export interface PatientAnalytics {
  total_patients: number;
  new_patients_this_month: number;
  active_patients: number;
  patients_with_conditions: number;
  average_age: number;
  gender_distribution: {
    male: number;
    female: number;
    other: number;
  };
  top_conditions: Array<{
    condition: string;
    count: number;
    percentage: number;
  }>;
  patient_growth: Array<{
    month: string;
    new_patients: number;
    total_patients: number;
  }>;
}

class DashboardService {
  // Obtener estadísticas simplificadas del dashboard (datos directos del backend)
  async getSimpleDashboardStats(): Promise<SimpleDashboardStats> {
    try {
      const response = await apiService.get<SimpleDashboardStats>('/dashboard/stats');
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al obtener estadísticas del dashboard');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching simple dashboard stats:', error);
      const message = error.response?.data?.message || 'Error al obtener estadísticas del dashboard';
      throw new Error(message);
    }
  }

  // Obtener estadísticas completas del dashboard (con transformación)
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiService.get<SimpleDashboardStats>('/dashboard/stats');
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al obtener estadísticas del dashboard');
      }
      
      // Transformar la respuesta simplificada al formato esperado por el frontend
      const simpleStats = response.data;
      
      return {
        total_patients: simpleStats.total_patients,
        new_patients_last_month: simpleStats.weekly_summary.new_patients,
        patients_with_medical_conditions: 0, // No disponible en la versión simplificada
        active_relationships: simpleStats.total_patients,
        total_appointments: simpleStats.total_appointments,
        appointments_today: 0, // No disponible en la versión simplificada
        appointments_this_week: simpleStats.weekly_summary.new_appointments,
        completed_appointments: Math.round(simpleStats.total_appointments * (simpleStats.performance_metrics.completion_rate / 100)),
        pending_appointments: Math.round(simpleStats.total_appointments * ((100 - simpleStats.performance_metrics.completion_rate) / 100)),
        total_diet_plans: simpleStats.total_diet_plans,
        active_diet_plans: simpleStats.total_diet_plans,
        completed_diet_plans: 0, // No disponible en la versión simplificada
        total_clinical_records: simpleStats.total_clinical_records,
        recent_clinical_records: simpleStats.total_clinical_records,
        total_income: 0, // No disponible en la versión simplificada
        monthly_income: 0, // No disponible en la versión simplificada
        average_consultation_fee: 0, // No disponible en la versión simplificada
        recent_activities: simpleStats.recent_activities.map(activity => ({
          id: activity.id,
          type: activity.type as any,
          title: activity.description,
          description: activity.description,
          date: activity.date,
          patient_name: activity.type === 'patient' ? activity.description : undefined,
          icon: this.getActivityIcon(activity.type)
        })),
        upcoming_appointments: [], // No disponible en la versión simplificada
        recent_patients: [], // No disponible en la versión simplificada
        performance_metrics: {
          completion_rate: simpleStats.performance_metrics.completion_rate,
          patient_retention_rate: 0, // No disponible en la versión simplificada
          diet_plan_success_rate: 0, // No disponible en la versión simplificada
          average_response_time: 0, // No disponible en la versión simplificada
          patient_satisfaction: 0, // No disponible en la versión simplificada
        }
      };
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      const message = error.response?.data?.message || 'Error al obtener estadísticas del dashboard';
      throw new Error(message);
    }
  }

  private getActivityIcon(type: string): string {
    switch (type) {
      case 'patient': return 'fas fa-user';
      case 'appointment': return 'fas fa-calendar';
      case 'diet_plan': return 'fas fa-utensils';
      case 'clinical_record': return 'fas fa-clipboard-list';
      default: return 'fas fa-info-circle';
    }
  }

  // Obtener perfil completo del nutriólogo
  async getNutritionistProfile(): Promise<{ user: any; profile: NutritionistProfile }> {
    try {
      const response = await apiService.get<{ user: any; profile: NutritionistProfile }>('/nutritionists/me/profile');
      
      if (response.status !== 'success' || !response.data?.user || !response.data?.profile) {
        throw new Error(response.message || 'Error al obtener perfil del nutriólogo');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching nutritionist profile:', error);
      const message = error.response?.data?.message || 'Error al obtener perfil del nutriólogo';
      throw new Error(message);
    }
  }

  // Obtener actividades recientes con filtros
  async getRecentActivities(limit: number = 10, type?: string): Promise<DashboardStats['recent_activities']> {
    try {
      let url = `/dashboard/recent-activities?limit=${limit}`;
      if (type) {
        url += `&type=${type}`;
      }
      
      const response = await apiService.get<{ activities: DashboardStats['recent_activities'] }>(url);
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al obtener actividades recientes');
      }
      
      return response.data.activities;
    } catch (error: any) {
      console.error('Error fetching recent activities:', error);
      const message = error.response?.data?.message || 'Error al obtener actividades recientes';
      throw new Error(message);
    }
  }

  // Obtener resumen de ingresos detallado
  async getIncomeSummary(period: 'week' | 'month' | 'year' = 'month'): Promise<IncomeSummary> {
    try {
      const response = await apiService.get<IncomeSummary>(`/dashboard/income-summary?period=${period}`);
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al obtener resumen de ingresos');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching income summary:', error);
      const message = error.response?.data?.message || 'Error al obtener resumen de ingresos';
      throw new Error(message);
    }
  }

  // Obtener análisis de pacientes
  async getPatientAnalytics(): Promise<PatientAnalytics> {
    try {
      const response = await apiService.get<PatientAnalytics>('/dashboard/patient-analytics');
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al obtener análisis de pacientes');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching patient analytics:', error);
      const message = error.response?.data?.message || 'Error al obtener análisis de pacientes';
      throw new Error(message);
    }
  }

  // Obtener próximas citas
  async getUpcomingAppointments(limit: number = 10): Promise<DashboardStats['upcoming_appointments']> {
    try {
      const response = await apiService.get<{ appointments: DashboardStats['upcoming_appointments'] }>(`/dashboard/upcoming-appointments?limit=${limit}`);
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al obtener próximas citas');
      }
      
      return response.data.appointments;
    } catch (error: any) {
      console.error('Error fetching upcoming appointments:', error);
      const message = error.response?.data?.message || 'Error al obtener próximas citas';
      throw new Error(message);
    }
  }

  // Obtener pacientes recientes
  async getRecentPatients(limit: number = 5): Promise<DashboardStats['recent_patients']> {
    try {
      const response = await apiService.get<{ patients: DashboardStats['recent_patients'] }>(`/dashboard/recent-patients?limit=${limit}`);
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al obtener pacientes recientes');
      }
      
      return response.data.patients;
    } catch (error: any) {
      console.error('Error fetching recent patients:', error);
      const message = error.response?.data?.message || 'Error al obtener pacientes recientes';
      throw new Error(message);
    }
  }

  // Obtener métricas de rendimiento
  async getPerformanceMetrics(): Promise<DashboardStats['performance_metrics']> {
    try {
      const response = await apiService.get<{ metrics: DashboardStats['performance_metrics'] }>('/dashboard/performance-metrics');
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al obtener métricas de rendimiento');
      }
      
      return response.data.metrics;
    } catch (error: any) {
      console.error('Error fetching performance metrics:', error);
      const message = error.response?.data?.message || 'Error al obtener métricas de rendimiento';
      throw new Error(message);
    }
  }

  // Obtener estadísticas por período
  async getStatsByPeriod(period: 'week' | 'month' | 'year'): Promise<Partial<DashboardStats>> {
    try {
      const response = await apiService.get<Partial<DashboardStats>>(`/dashboard/stats-by-period?period=${period}`);
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al obtener estadísticas por período');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching stats by period:', error);
      const message = error.response?.data?.message || 'Error al obtener estadísticas por período';
      throw new Error(message);
    }
  }

  // Obtener alertas y notificaciones
  async getAlerts(): Promise<Array<{
    id: string;
    type: 'warning' | 'info' | 'success' | 'danger';
    title: string;
    message: string;
    date: string;
    action_required: boolean;
    action_url?: string;
  }>> {
    try {
      const response = await apiService.get<{ alerts: Array<any> }>('/dashboard/alerts');
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al obtener alertas');
      }
      
      return response.data.alerts;
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
      const message = error.response?.data?.message || 'Error al obtener alertas';
      throw new Error(message);
    }
  }

  // Marcar alerta como leída
  async markAlertAsRead(alertId: string): Promise<void> {
    try {
      const response = await apiService.put(`/dashboard/alerts/${alertId}/read`);
      
      if (response.status !== 'success') {
        throw new Error(response.message || 'Error al marcar alerta como leída');
      }
    } catch (error: any) {
      console.error('Error marking alert as read:', error);
      const message = error.response?.data?.message || 'Error al marcar alerta como leída';
      throw new Error(message);
    }
  }

  // Obtener resumen de expedientes clínicos
  async getClinicalRecordsSummary(): Promise<{
    total_records: number;
    records_this_month: number;
    pending_reviews: number;
    recent_records: Array<{
      id: string;
      patient_name: string;
      record_date: string;
      consultation_reason: string;
    }>;
  }> {
    try {
      const response = await apiService.get<{
        total_records: number;
        records_this_month: number;
        pending_reviews: number;
        recent_records: Array<any>;
      }>('/dashboard/clinical-records-summary');
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al obtener resumen de expedientes');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching clinical records summary:', error);
      const message = error.response?.data?.message || 'Error al obtener resumen de expedientes';
      throw new Error(message);
    }
  }

  // Obtener estadísticas de planes nutricionales
  async getDietPlansSummary(): Promise<{
    total_plans: number;
    active_plans: number;
    completed_plans: number;
    success_rate: number;
    recent_plans: Array<{
      id: string;
      patient_name: string;
      plan_name: string;
      created_date: string;
      status: string;
    }>;
  }> {
    try {
      const response = await apiService.get<{
        total_plans: number;
        active_plans: number;
        completed_plans: number;
        success_rate: number;
        recent_plans: Array<any>;
      }>('/dashboard/diet-plans-summary');
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al obtener resumen de planes nutricionales');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching diet plans summary:', error);
      const message = error.response?.data?.message || 'Error al obtener resumen de planes nutricionales';
      throw new Error(message);
    }
  }
}

export const dashboardService = new DashboardService(); 