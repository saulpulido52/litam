import { apiService } from './api';

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
  recent_activities: Array<{
    id: string;
    type: 'appointment' | 'patient' | 'diet_plan' | 'clinical_record';
    title: string;
    description: string;
    date: string;
    patient_name?: string;
  }>;
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
}

class DashboardService {
  // Obtener estadísticas del dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiService.get<DashboardStats>('/dashboard/stats');
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error al obtener estadísticas del dashboard');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      const message = error.response?.data?.message || 'Error al obtener estadísticas del dashboard';
      throw new Error(message);
    }
  }

  // Obtener perfil del nutriólogo
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

  // Obtener actividades recientes
  async getRecentActivities(limit: number = 10): Promise<DashboardStats['recent_activities']> {
    try {
      const response = await apiService.get<{ activities: DashboardStats['recent_activities'] }>(`/dashboard/recent-activities?limit=${limit}`);
      
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

  // Obtener resumen de ingresos (para futura integración de pagos)
  async getIncomeSummary(period: 'week' | 'month' | 'year' = 'month'): Promise<{
    total_income: number;
    total_consultations: number;
    average_per_consultation: number;
    period: string;
  }> {
    try {
      const response = await apiService.get<{
        total_income: number;
        total_consultations: number;
        average_per_consultation: number;
        period: string;
      }>(`/dashboard/income-summary?period=${period}`);
      
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
}

export const dashboardService = new DashboardService(); 