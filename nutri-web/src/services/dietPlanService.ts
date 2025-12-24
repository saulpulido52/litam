import apiService from './api';
import type { DietPlan, CreateDietPlanDto } from '../types/diet';
import axios from 'axios';

class DietPlanService {
  // Obtener todos los planes de dieta
  static async getAllDietPlans(): Promise<DietPlan[]> {
    const response = await apiService.get<DietPlan[]>('/diet-plans');
    if (!response.data) {
      throw new Error('No se recibieron datos del servidor');
    }
    return response.data;
  }

  // Obtener un plan de dieta por ID
  static async getDietPlanById(planId: string): Promise<DietPlan> {
    const response = await apiService.get<DietPlan>(`/diet-plans/${planId}`);
    if (!response.data) {
      throw new Error('No se recibieron datos del servidor');
    }
    return response.data;
  }

  // Crear un nuevo plan de dieta
  static async createDietPlan(planData: CreateDietPlanDto): Promise<DietPlan> {
    const response = await apiService.post<DietPlan>('/diet-plans', planData);
    if (!response.data) {
      throw new Error('No se recibieron datos del servidor');
    }
    return response.data;
  }

  // Actualizar un plan de dieta
  static async updateDietPlan(planId: string, planData: Partial<CreateDietPlanDto>): Promise<DietPlan> {
    const response = await apiService.put<DietPlan>(`/diet-plans/${planId}`, planData);
    if (!response.data) {
      throw new Error('No se recibieron datos del servidor');
    }
    return response.data;
  }

  // Eliminar un plan de dieta
  static async deleteDietPlan(planId: string): Promise<void> {
    await apiService.delete(`/diet-plans/${planId}`);
  }

  // 📋 Descargar PDF del planificador de comidas usando Axios directamente
  static async downloadMealPlannerPDF(planId: string): Promise<Blob> {
    try {
      const envUrl = import.meta.env.VITE_API_URL;
      const apiUrl = envUrl || (import.meta.env.MODE === 'production'
        ? 'https://litam.onrender.com/api'
        : 'http://localhost:4000/api');
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `${apiUrl}/diet-plans/${planId}/generate-meal-planner-pdf`,
        {
          responseType: 'blob',
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error en downloadMealPlannerPDF:', error);
      throw error;
    }
  }
}

export default DietPlanService; 