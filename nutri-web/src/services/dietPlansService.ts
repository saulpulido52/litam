import apiService from './api';
import type { 
  DietPlan, 
  CreateDietPlanDto, 
  GenerateAIDietDto,
  WeeklyPlanDto 
} from '../types/diet';

class DietPlansService {
  // Obtener todos los planes de dieta del nutriólogo logueado
  async getAllDietPlans(): Promise<DietPlan[]> {
    try {
      const response = await apiService.get<{ dietPlans: any[] }>('/diet-plans');
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error fetching diet plans');
      }
      
      // Extraer dietPlans de la estructura anidada y transformar
      const backendPlans = response.data.dietPlans || [];
      return backendPlans.map(plan => this.transformBackendPlan(plan));
    } catch (error) {
      console.error('Error fetching all diet plans:', error);
      throw error;
    }
  }

  // Obtener todos los planes de dieta para un paciente
  async getDietPlansForPatient(patientId: string): Promise<DietPlan[]> {
    try {
      const response = await apiService.get<{ dietPlans: any[] }>(`/diet-plans/patient/${patientId}`);
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error fetching patient diet plans');
      }
      
      // Extraer dietPlans de la estructura anidada y transformar
      const backendPlans = response.data.dietPlans || [];
      return backendPlans.map(plan => this.transformBackendPlan(plan));
    } catch (error) {
      console.error('Error fetching patient diet plans:', error);
      throw error;
    }
  }

  // Obtener un plan de dieta específico
  async getDietPlanById(dietPlanId: string): Promise<DietPlan> {
    try {
      const response = await apiService.get<{ dietPlan: any }>(`/diet-plans/${dietPlanId}`);
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error fetching diet plan');
      }
      
      // Extraer dietPlan de la estructura anidada y transformar
      return this.transformBackendPlan(response.data.dietPlan);
    } catch (error) {
      console.error('Error fetching diet plan:', error);
      throw error;
    }
  }

  // Crear un nuevo plan de dieta
  async createDietPlan(dietPlanData: CreateDietPlanDto): Promise<DietPlan> {
    try {
      console.log('🟢 dietPlansService - Enviando datos al backend:', dietPlanData);
      
      const response = await apiService.post<{ dietPlan: any }>('/diet-plans', dietPlanData);
      
      console.log('🟢 dietPlansService - Respuesta del backend:', response);
      
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error creating diet plan');
      }
      
      // Extraer dietPlan de la estructura anidada y transformar
      return this.transformBackendPlan(response.data.dietPlan);
    } catch (error) {
      console.error('Error creating diet plan:', error);
      throw error;
    }
  }

  // Transformar plan del backend al formato del frontend
  private transformBackendPlan(backendPlan: any): DietPlan {
    return {
      id: backendPlan.id,
      patient_id: backendPlan.patient?.id || backendPlan.patient_id || backendPlan.patient_user_id,
      nutritionist_id: backendPlan.nutritionist?.id || backendPlan.nutritionist_id || backendPlan.nutritionist_user_id,
      name: backendPlan.name,
      description: backendPlan.description,
      status: backendPlan.status,
      start_date: backendPlan.start_date,
      end_date: backendPlan.end_date,
      target_calories: backendPlan.daily_calories_target ? parseFloat(backendPlan.daily_calories_target) : undefined,
      target_protein: backendPlan.daily_macros_target?.protein,
      target_carbs: backendPlan.daily_macros_target?.carbohydrates,
      target_fats: backendPlan.daily_macros_target?.fats,
      notes: backendPlan.notes,
      created_at: backendPlan.created_at,
      updated_at: backendPlan.updated_at,
      meals: backendPlan.meals || [],
      patient: backendPlan.patient,
      nutritionist: backendPlan.nutritionist,
      is_weekly_plan: backendPlan.is_weekly_plan,
      total_weeks: backendPlan.total_weeks,
      weekly_plans: backendPlan.weekly_plans || []
    };
  }

  // Generar plan de dieta con IA
  async generateDietPlanWithAI(generateData: GenerateAIDietDto): Promise<DietPlan> {
    try {
      const response = await apiService.post<{ dietPlan: any }>('/diet-plans/generate-ai', generateData);
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error generating diet plan with AI');
      }
      
      return this.transformBackendPlan(response.data.dietPlan);
    } catch (error) {
      console.error('Error generating diet plan with AI:', error);
      throw error;
    }
  }

  // Transformar datos del formulario a formato de actualización
  private transformFormDataToUpdateData(formData: any): any {
    const updateData: any = {
      name: formData.name,
      description: formData.description || '',
      notes: formData.notes || '',
      startDate: formData.startDate,
      endDate: formData.endDate,
      dailyCaloriesTarget: formData.dailyCaloriesTarget,
      dailyMacrosTarget: formData.dailyMacrosTarget,
      totalWeeks: formData.totalWeeks,
      isWeeklyPlan: formData.isWeeklyPlan,
      weeklyPlans: formData.weeklyPlans,
      status: formData.status
    };

    // Solo incluir campos que tienen valor para evitar sobrescribir con undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    return updateData;
  }

  // Actualizar un plan de dieta existente
  async updateDietPlan(dietPlanId: string, updateData: any): Promise<DietPlan> {
    try {
      console.log('🟢 dietPlansService - Actualizando plan con ID:', dietPlanId);
      console.log('🟢 dietPlansService - Datos recibidos:', updateData);
      
      // Si los datos vienen del formulario (CreateDietPlanDto), transformarlos
      const transformedData = this.transformFormDataToUpdateData(updateData);
      console.log('🟢 dietPlansService - Datos transformados para actualización:', transformedData);
      
      const response = await apiService.patch<{ dietPlan: any }>(`/diet-plans/${dietPlanId}`, transformedData);
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error updating diet plan');
      }
      
      console.log('🟢 dietPlansService - Respuesta de actualización:', response);
      return this.transformBackendPlan(response.data.dietPlan);
    } catch (error) {
      console.error('🔴 dietPlansService - Error updating diet plan:', error);
      throw error;
    }
  }

  // Actualizar el estado de un plan de dieta
  async updateDietPlanStatus(dietPlanId: string, status: string): Promise<DietPlan> {
    try {
      const response = await apiService.patch<{ dietPlan: any }>(`/diet-plans/${dietPlanId}/status`, { status });
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error updating diet plan status');
      }
      
      return this.transformBackendPlan(response.data.dietPlan);
    } catch (error) {
      console.error('Error updating diet plan status:', error);
      throw error;
    }
  }

  // Eliminar un plan de dieta
  async deleteDietPlan(dietPlanId: string): Promise<void> {
    try {
      const response = await apiService.delete(`/diet-plans/${dietPlanId}`);
      if (response.status !== 'success') {
        throw new Error(response.message || 'Error deleting diet plan');
      }
    } catch (error) {
      console.error('Error deleting diet plan:', error);
      throw error;
    }
  }

  // Agregar una semana a un plan de dieta
  async addWeekToPlan(dietPlanId: string, weekData: WeeklyPlanDto): Promise<DietPlan> {
    try {
      const response = await apiService.post<{ dietPlan: any }>(`/diet-plans/${dietPlanId}/add-week`, { weeklyPlan: weekData });
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error adding week to diet plan');
      }
      
      return this.transformBackendPlan(response.data.dietPlan);
    } catch (error) {
      console.error('Error adding week to diet plan:', error);
      throw error;
    }
  }

  // Obtener estadísticas de planes de dieta
  async getDietPlansStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    draft: number;
  }> {
    try {
      // Obtener todos los planes del nutriólogo
      const allPlans = await this.getAllDietPlans();
      
      return {
        total: allPlans.length,
        active: allPlans.filter(plan => plan.status === 'active').length,
        completed: allPlans.filter(plan => plan.status === 'completed').length,
        draft: allPlans.filter(plan => plan.status === 'draft').length,
      };
    } catch (error) {
      console.error('Error fetching diet plans stats:', error);
      throw error;
    }
  }

  // Utilidades para manejar fechas semanales
  static calculateWeekDates(startDate: string, weekNumber: number): { startDate: string; endDate: string } {
    const start = new Date(startDate);
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + (weekNumber - 1) * 7);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return {
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0]
    };
  }

  // Generar estructura semanal básica
  static generateWeeklyStructure(weekNumber: number, startDate: string, dailyCalories: number): WeeklyPlanDto {
    const weekDates = this.calculateWeekDates(startDate, weekNumber);
    
    return {
      weekNumber,
      startDate: weekDates.startDate,
      endDate: weekDates.endDate,
      dailyCaloriesTarget: dailyCalories,
      dailyMacrosTarget: {
        protein: Math.round(dailyCalories * 0.3 / 4), // 30% proteínas
        carbohydrates: Math.round(dailyCalories * 0.45 / 4), // 45% carbohidratos
        fats: Math.round(dailyCalories * 0.25 / 9) // 25% grasas
      },
      meals: [],
      notes: `Semana ${weekNumber} del plan nutricional`
    };
  }
}

export default new DietPlansService(); 