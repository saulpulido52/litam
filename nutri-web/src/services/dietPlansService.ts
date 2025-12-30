import apiService from './api';
import type {
  DietPlan,
  CreateDietPlanDto,
  GenerateAIDietDto,
  WeeklyPlanDto
} from '../types/diet';
import { cacheService, CACHE_KEYS, CACHE_TTL } from './cacheService';

class DietPlansService {
  // **OPTIMIZACIÓN**: Helper para obtener ID del nutriólogo actual
  private async getCurrentNutritionistId(): Promise<string> {
    // En una implementación real, esto vendría del token JWT o estado de autenticación
    // Por ahora, asumimos que está disponible en localStorage o mediante el authService
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    return userData.id || '';
  }

  // **OPTIMIZACIÓN**: Invalidar caché cuando se realizan operaciones que modifican datos
  private invalidateRelatedCache(planId?: string, nutritionistId?: string, patientId?: string) {
    if (planId) {
      cacheService.delete(CACHE_KEYS.DIET_PLAN_BY_ID(planId));
    }
    if (nutritionistId) {
      cacheService.invalidatePattern(`diet_plans:nutritionist:${nutritionistId}`);
    }
    if (patientId) {
      cacheService.invalidatePattern(`diet_plans:patient:${patientId}`);
    }
  }

  // **OPTIMIZACIÓN**: Obtener todos los planes de dieta del nutriólogo logueado con caché
  async getAllDietPlans(): Promise<DietPlan[]> {
    // Obtener ID del nutriólogo del token (asumiendo que está disponible)
    const nutritionistId = await this.getCurrentNutritionistId();
    const cacheKey = CACHE_KEYS.DIET_PLANS_NUTRITIONIST(nutritionistId);

    return await cacheService.memoize(
      cacheKey,
      async () => {
        const response = await apiService.get<{ dietPlans: any[] }>('/diet-plans');
        if (response.status !== 'success' || !response.data) {
          throw new Error(response.message || 'Error fetching diet plans');
        }

        // Extraer dietPlans de la estructura anidada y transformar
        const backendPlans = response.data.dietPlans || [];
        return backendPlans.map(plan => this.transformBackendPlan(plan));
      },
      CACHE_TTL.MEDIUM // 15 minutos
    );
  }

  // **OPTIMIZACIÓN**: Obtener todos los planes de dieta para un paciente con caché
  async getDietPlansForPatient(patientId: string): Promise<DietPlan[]> {
    const cacheKey = CACHE_KEYS.DIET_PLANS_PATIENT(patientId);

    return await cacheService.memoize(
      cacheKey,
      async () => {
        const response = await apiService.get<{ dietPlans: any[] }>(`/diet-plans/patient/${patientId}`);
        if (response.status !== 'success' || !response.data) {
          throw new Error(response.message || 'Error fetching patient diet plans');
        }

        // Extraer dietPlans de la estructura anidada y transformar
        const backendPlans = response.data.dietPlans || [];
        return backendPlans.map(plan => this.transformBackendPlan(plan));
      },
      CACHE_TTL.MEDIUM // 15 minutos
    );
  }

  // **OPTIMIZACIÓN**: Obtener un plan de dieta específico con caché
  async getDietPlanById(dietPlanId: string): Promise<DietPlan> {
    const cacheKey = CACHE_KEYS.DIET_PLAN_BY_ID(dietPlanId);

    return await cacheService.memoize(
      cacheKey,
      async () => {
        const response = await apiService.get<{ dietPlan: any }>(`/diet-plans/${dietPlanId}`);
        if (response.status !== 'success' || !response.data) {
          throw new Error(response.message || 'Error fetching diet plan');
        }

        // Extraer dietPlan de la estructura anidada y transformar
        return this.transformBackendPlan(response.data.dietPlan);
      },
      CACHE_TTL.SHORT // 5 minutos para datos específicos
    );
  }

  // Crear un nuevo plan de dieta
  async createDietPlan(dietPlanData: CreateDietPlanDto): Promise<DietPlan> {
    try {
      console.log('🔥 === DIETPLANSSERVICE - INICIO CREACIÓN PLAN ===');
      console.log('📨 Datos recibidos del frontend:', dietPlanData);

      // Analizar específicamente pathologicalRestrictions
      if (dietPlanData.pathologicalRestrictions) {
        console.log('🛡️ pathologicalRestrictions detectado - enviando al backend:', {
          tieneRestricciones: true,
          condicionesMedicas: (dietPlanData.pathologicalRestrictions as any).medical_conditions?.length || 0,
          alergias: dietPlanData.pathologicalRestrictions.allergies?.length || 0,
          intolerancias: dietPlanData.pathologicalRestrictions.intolerances?.length || 0,
          medicamentos: dietPlanData.pathologicalRestrictions.medications?.length || 0,
          consideracionesEspeciales: (dietPlanData.pathologicalRestrictions as any).special_considerations?.length || 0,
          contenidoCompleto: dietPlanData.pathologicalRestrictions
        });
      } else {
        console.log('🚫 pathologicalRestrictions NO presente en los datos');
      }

      console.log('🚀 Enviando solicitud POST a /diet-plans...');
      const response = await apiService.post<{ dietPlan: any }>('/diet-plans', dietPlanData);

      console.log('✅ === RESPUESTA DEL BACKEND RECIBIDA ===');
      console.log('📬 Response completa:', response);

      if (response.data?.dietPlan) {
        console.log('🔍 Analizando plan creado en backend:');
        console.log('🆔 ID del plan:', response.data.dietPlan.id);
        console.log('📝 Nombre:', response.data.dietPlan.name);
        console.log('👤 Paciente ID:', response.data.dietPlan.patient_id);

        // **OPTIMIZACIÓN**: Invalidar caché relacionado al crear nuevo plan
        const nutritionistId = await this.getCurrentNutritionistId();
        this.invalidateRelatedCache(response.data.dietPlan.id, nutritionistId, response.data.dietPlan.patient_id);

        // Verificar si se guardaron las restricciones patológicas
        if (response.data.dietPlan.pathological_restrictions) {
          console.log('✅ pathological_restrictions GUARDADO exitosamente en BD:');
          const restrictions = response.data.dietPlan.pathological_restrictions;
          console.log('📊 Contenido guardado:', {
            condicionesMedicas: restrictions.medical_conditions?.length || 0,
            alergias: restrictions.allergies?.length || 0,
            intolerancias: restrictions.intolerances?.length || 0,
            medicamentos: restrictions.medications?.length || 0,
            consideracionesEspeciales: restrictions.special_considerations?.length || 0,
            contenidoCompleto: restrictions
          });
        } else {
          console.warn('⚠️ pathological_restrictions NO se guardó en la BD (campo null/undefined)');
        }
      }

      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error creating diet plan');
      }

      console.log('🎯 Transformando plan del backend al formato frontend...');
      const transformedPlan = this.transformBackendPlan(response.data.dietPlan);
      console.log('✅ Plan transformado exitosamente:', transformedPlan);
      console.log('🔥 === DIETPLANSSERVICE - FIN CREACIÓN PLAN ===');

      return transformedPlan;
    } catch (error) {
      console.error('❌ === ERROR EN DIETPLANSSERVICE ===');
      console.error('🔴 Error creating diet plan:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        console.error('🔴 Error response data:', (error as any).response?.data);
        console.error('🔴 Error status:', (error as any).response?.status);
        console.error('🔴 Error headers:', (error as any).response?.headers);
      }

      throw error;
    }
  }

  // Transformar plan del backend al formato del frontend
  private transformBackendPlan(backendPlan: any): DietPlan {
    console.log('🔄 Transformando plan del backend:', {
      id: backendPlan.id,
      name: backendPlan.name,
      tieneRestricciones: !!backendPlan.pathological_restrictions,
      restrictionsContent: backendPlan.pathological_restrictions
    });

    const transformed = {
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
      weekly_plans: backendPlan.weekly_plans || [],
      pathological_restrictions: backendPlan.pathological_restrictions, // Preservar restricciones patológicas
      // === NUEVOS CAMPOS PARA COMPLETAR TABS ===
      meal_frequency: backendPlan.meal_frequency,
      meal_timing: backendPlan.meal_timing,
      nutritional_goals: backendPlan.nutritional_goals,
      flexibility_settings: backendPlan.flexibility_settings,
      // === DURACIÓN EXPLÍCITA ===
      duration_value: backendPlan.duration_value,
      duration_unit: backendPlan.duration_unit
    };

    console.log('✅ Plan transformado completamente:', {
      ...transformed,
      datosEstructurales: {
        tieneRestricciones: !!transformed.pathological_restrictions,
        tieneFrecuenciaComidas: !!transformed.meal_frequency,
        tieneHorarios: !!transformed.meal_timing,
        tieneObjetivosNutricionales: !!transformed.nutritional_goals,
        tieneFlexibilidad: !!transformed.flexibility_settings,
        planesSemanales: transformed.weekly_plans?.length || 0
      }
    });
    return transformed;
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

      console.log('📡 === SERVICE REQUEST (updateDietPlan) ===');
      console.log('📤 Payload transformado enviado a PATCH /diet-plans:', JSON.stringify(transformedData, null, 2));
      console.log('🔍 Verificando campo weeklyPlans:', transformedData.weeklyPlans ? `Array con ${transformedData.weeklyPlans.length} elementos` : 'UNDEFINED');

      const response = await apiService.patch<{ dietPlan: any }>(`/diet-plans/${dietPlanId}`, transformedData);
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Error updating diet plan');
      }

      console.log('✅ === SERVICE RESPONSE ===');
      console.log('📥 Respuesta raw del backend:', response);
      if (response.data?.dietPlan?.weekly_plans) {
        console.log('🔢 Weekly Plans recibidos del backend:', response.data.dietPlan.weekly_plans.length);
        console.log('📝 Primer plan semanal recibido:', response.data.dietPlan.weekly_plans[0]);
      } else {
        console.warn('⚠️ No se recibieron weekly_plans en la respuesta del backend');
      }

      // **OPTIMIZACIÓN**: Invalidar caché después de actualizar
      const updatedPlan = response.data.dietPlan;
      const nutritionistId = await this.getCurrentNutritionistId();
      this.invalidateRelatedCache(updatedPlan.id, nutritionistId, updatedPlan.patient_id);

      return this.transformBackendPlan(updatedPlan);
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

      const updatedPlan = response.data.dietPlan;

      // **OPTIMIZACIÓN**: Invalidar caché después de cambiar estado
      const nutritionistId = await this.getCurrentNutritionistId();
      this.invalidateRelatedCache(updatedPlan.id, nutritionistId, updatedPlan.patient_id);

      return this.transformBackendPlan(updatedPlan);
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

      // **OPTIMIZACIÓN**: Invalidar caché después de eliminar
      const nutritionistId = await this.getCurrentNutritionistId();
      this.invalidateRelatedCache(dietPlanId, nutritionistId);

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
        draft: allPlans.filter(plan => plan.status === 'draft').length
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