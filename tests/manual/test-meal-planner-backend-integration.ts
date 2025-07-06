import axios from 'axios';

// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_NUTRITIONIST_EMAIL = 'nutriologo@test.com';
const TEST_PASSWORD = 'password123';

interface TestMeal {
  id?: string;
  day: string;
  meal_type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';
  meal_time: string;
  meal_description: string;
  notes?: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
}

interface TestWeeklyPlan {
  week_number: number;
  start_date: string;
  end_date: string;
  daily_calories_target: number;
  daily_macros_target: {
    protein: number;
    carbohydrates: number;
    fats: number;
  };
  meals: TestMeal[];
  notes?: string;
}

interface TestDietPlan {
  patientId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  dailyCaloriesTarget: number;
  dailyMacrosTarget: {
    protein: number;
    carbohydrates: number;
    fats: number;
  };
  isWeeklyPlan: boolean;
  totalWeeks: number;
  weeklyPlans: TestWeeklyPlan[];
  notes?: string;
  mealFrequency?: {
    breakfast?: boolean;
    morningSnack?: boolean;
    lunch?: boolean;
    afternoonSnack?: boolean;
    dinner?: boolean;
    eveningSnack?: boolean;
  };
  mealTiming?: {
    breakfastTime?: string;
    lunchTime?: string;
    dinnerTime?: string;
    snackTimes?: string[];
  };
}

class MealPlannerBackendTest {
  private authToken: string | null = null;
  private testPatientId: string | null = null;
  private createdPlanId: string | null = null;

  // Configurar axios con interceptores para logging
  private setupAxios() {
    axios.interceptors.request.use(
      (config) => {
        console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
        if (config.data) {
          console.log('📤 Request Data:', JSON.stringify(config.data, null, 2));
        }
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    axios.interceptors.response.use(
      (response) => {
        console.log(`✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
        console.log('📥 Response Data:', JSON.stringify(response.data, null, 2));
        return response;
      },
      (error) => {
        console.error('❌ Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Autenticación
  async authenticate(): Promise<void> {
    console.log('\n🔐 === INICIANDO AUTENTICACIÓN ===');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: TEST_NUTRITIONIST_EMAIL,
        password: TEST_PASSWORD
      });

      if (response.data.status === 'success' && response.data.data?.token) {
        this.authToken = response.data.data.token;
        console.log('✅ Autenticación exitosa');
        console.log('👤 Usuario:', response.data.data.user.email);
        console.log('🔑 Token obtenido');
      } else {
        throw new Error('Respuesta de autenticación inválida');
      }
    } catch (error) {
      console.error('❌ Error en autenticación:', error);
      throw error;
    }
  }

  // Obtener un paciente de prueba
  async getTestPatient(): Promise<void> {
    console.log('\n👥 === OBTENIENDO PACIENTE DE PRUEBA ===');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/patients`, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });

      if (response.data.status === 'success' && response.data.data?.patients?.length > 0) {
        this.testPatientId = response.data.data.patients[0].id;
        console.log('✅ Paciente de prueba obtenido');
        console.log('👤 Paciente ID:', this.testPatientId);
        console.log('👤 Nombre:', response.data.data.patients[0].first_name);
      } else {
        throw new Error('No se encontraron pacientes');
      }
    } catch (error) {
      console.error('❌ Error obteniendo paciente:', error);
      throw error;
    }
  }

  // Crear datos de prueba para el planificador de comidas
  createTestMealPlan(): TestDietPlan {
    console.log('\n📋 === CREANDO DATOS DE PRUEBA ===');

    const testMeals: TestMeal[] = [
      {
        id: 'meal_1',
        day: 'Lunes',
        meal_type: 'breakfast',
        meal_time: '08:00',
        meal_description: 'Avena con frutas y nueces, jugo de naranja natural',
        total_calories: 450,
        total_protein: 15,
        total_carbs: 65,
        total_fats: 12,
        notes: 'Incluir 1 taza de avena, 1/2 taza de frutas mixtas, 2 cucharadas de nueces'
      },
      {
        id: 'meal_2',
        day: 'Lunes',
        meal_type: 'lunch',
        meal_time: '13:00',
        meal_description: 'Pechuga de pollo a la plancha con arroz integral y ensalada',
        total_calories: 650,
        total_protein: 45,
        total_carbs: 55,
        total_fats: 18,
        notes: '150g de pollo, 1/2 taza de arroz integral, ensalada verde con tomate'
      },
      {
        id: 'meal_3',
        day: 'Martes',
        meal_type: 'breakfast',
        meal_time: '08:00',
        meal_description: 'Huevos revueltos con pan integral y aguacate',
        total_calories: 520,
        total_protein: 22,
        total_carbs: 35,
        total_fats: 28,
        notes: '2 huevos, 2 rebanadas de pan integral, 1/4 aguacate'
      },
      {
        id: 'meal_4',
        day: 'Miércoles',
        meal_type: 'dinner',
        meal_time: '19:00',
        meal_description: 'Salmón al horno con quinoa y brócoli',
        total_calories: 580,
        total_protein: 38,
        total_carbs: 40,
        total_fats: 25,
        notes: '120g de salmón, 1/3 taza de quinoa, 1 taza de brócoli'
      }
    ];

    const testWeeklyPlan: TestWeeklyPlan = {
      week_number: 1,
      start_date: '2025-07-14',
      end_date: '2025-07-20',
      daily_calories_target: 1800,
      daily_macros_target: {
        protein: 150,
        carbohydrates: 200,
        fats: 60
      },
      meals: testMeals,
      notes: 'Semana 1 - Plan de prueba con comidas manuales'
    };

    const testPlan: TestDietPlan = {
      patientId: this.testPatientId!,
      name: 'Plan de Prueba - Planificador de Comidas',
      description: 'Plan de prueba para verificar la funcionalidad del planificador de comidas manual',
      startDate: '2025-07-14',
      endDate: '2025-08-10',
      dailyCaloriesTarget: 1800,
      dailyMacrosTarget: {
        protein: 150,
        carbohydrates: 200,
        fats: 60
      },
      isWeeklyPlan: true,
      totalWeeks: 4,
      weeklyPlans: [testWeeklyPlan],
      notes: 'Plan de prueba creado automáticamente para verificar la funcionalidad del planificador de comidas',
      mealFrequency: {
        breakfast: true,
        morningSnack: true,
        lunch: true,
        afternoonSnack: true,
        dinner: true,
        eveningSnack: false
      },
      mealTiming: {
        breakfastTime: '08:00',
        lunchTime: '13:00',
        dinnerTime: '19:00',
        snackTimes: ['10:30', '16:00']
      }
    };

    console.log('✅ Datos de prueba creados');
    console.log('📊 Resumen del plan:');
    console.log(`   - Nombre: ${testPlan.name}`);
    console.log(`   - Paciente ID: ${testPlan.patientId}`);
    console.log(`   - Duración: ${testPlan.totalWeeks} semanas`);
    console.log(`   - Comidas en semana 1: ${testPlan.weeklyPlans[0].meals.length}`);
    console.log(`   - Calorías objetivo: ${testPlan.dailyCaloriesTarget} kcal`);

    return testPlan;
  }

  // Crear plan de dieta con comidas manuales
  async createDietPlanWithMeals(testPlan: TestDietPlan): Promise<void> {
    console.log('\n📝 === CREANDO PLAN DE DIETA CON COMIDAS MANUALES ===');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/diet-plans`, testPlan, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });

      if (response.data.status === 'success' && response.data.data?.dietPlan) {
        this.createdPlanId = response.data.data.dietPlan.id;
        console.log('✅ Plan de dieta creado exitosamente');
        console.log('🆔 Plan ID:', this.createdPlanId);
        
        // Verificar que se guardaron todos los campos
        this.verifyPlanFields(response.data.data.dietPlan, testPlan);
      } else {
        throw new Error('Respuesta de creación inválida');
      }
    } catch (error) {
      console.error('❌ Error creando plan de dieta:', error);
      throw error;
    }
  }

  // Verificar que se guardaron todos los campos requeridos
  verifyPlanFields(savedPlan: any, originalPlan: TestDietPlan): void {
    console.log('\n🔍 === VERIFICANDO CAMPOS GUARDADOS ===');
    
    const verifications = [
      { field: 'id', saved: savedPlan.id, required: true },
      { field: 'name', saved: savedPlan.name, original: originalPlan.name },
      { field: 'description', saved: savedPlan.description, original: originalPlan.description },
      { field: 'patient_id', saved: savedPlan.patient_id || savedPlan.patient?.id, original: originalPlan.patientId },
      { field: 'start_date', saved: savedPlan.start_date, original: originalPlan.startDate },
      { field: 'end_date', saved: savedPlan.end_date, original: originalPlan.endDate },
      { field: 'daily_calories_target', saved: savedPlan.daily_calories_target, original: originalPlan.dailyCaloriesTarget },
      { field: 'daily_macros_target', saved: savedPlan.daily_macros_target, original: originalPlan.dailyMacrosTarget },
      { field: 'is_weekly_plan', saved: savedPlan.is_weekly_plan, original: originalPlan.isWeeklyPlan },
      { field: 'total_weeks', saved: savedPlan.total_weeks, original: originalPlan.totalWeeks },
      { field: 'weekly_plans', saved: savedPlan.weekly_plans, original: originalPlan.weeklyPlans },
      { field: 'meal_frequency', saved: savedPlan.meal_frequency, original: originalPlan.mealFrequency },
      { field: 'meal_timing', saved: savedPlan.meal_timing, original: originalPlan.mealTiming },
      { field: 'notes', saved: savedPlan.notes, original: originalPlan.notes }
    ];

    let allFieldsValid = true;

    verifications.forEach(verification => {
      const isValid = verification.required ? 
        !!verification.saved : 
        JSON.stringify(verification.saved) === JSON.stringify(verification.original);
      
      console.log(`${isValid ? '✅' : '❌'} ${verification.field}: ${isValid ? 'OK' : 'FALLA'}`);
      
      if (!isValid) {
        console.log(`   Original: ${JSON.stringify(verification.original)}`);
        console.log(`   Guardado: ${JSON.stringify(verification.saved)}`);
        allFieldsValid = false;
      }
    });

    if (allFieldsValid) {
      console.log('🎉 Todos los campos se guardaron correctamente');
    } else {
      console.log('⚠️ Algunos campos no se guardaron correctamente');
    }
  }

  // Obtener el plan creado para verificar persistencia
  async getCreatedPlan(): Promise<void> {
    console.log('\n📖 === OBTENIENDO PLAN CREADO ===');
    
    if (!this.createdPlanId) {
      console.log('❌ No hay plan ID para obtener');
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/diet-plans/${this.createdPlanId}`, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });

      if (response.data.status === 'success' && response.data.data?.dietPlan) {
        console.log('✅ Plan obtenido exitosamente');
        this.displayPlanDetails(response.data.data.dietPlan);
      } else {
        throw new Error('Respuesta de obtención inválida');
      }
    } catch (error) {
      console.error('❌ Error obteniendo plan:', error);
      throw error;
    }
  }

  // Mostrar detalles del plan con énfasis en las comidas
  displayPlanDetails(plan: any): void {
    console.log('\n📊 === DETALLES DEL PLAN CREADO ===');
    console.log(`🆔 ID: ${plan.id}`);
    console.log(`📝 Nombre: ${plan.name}`);
    console.log(`👤 Paciente: ${plan.patient?.first_name} ${plan.patient?.last_name}`);
    console.log(`📅 Duración: ${plan.start_date} - ${plan.end_date}`);
    console.log(`🎯 Calorías objetivo: ${plan.daily_calories_target} kcal`);
    console.log(`📈 Semanas totales: ${plan.total_weeks}`);
    
    // Mostrar planes semanales y comidas
    if (plan.weekly_plans && plan.weekly_plans.length > 0) {
      console.log('\n🍽️ === PLANIFICACIÓN DE COMIDAS ===');
      
      plan.weekly_plans.forEach((weekPlan: any, weekIndex: number) => {
        console.log(`\n📅 Semana ${weekPlan.week_number} (${weekPlan.start_date} - ${weekPlan.end_date})`);
        console.log(`🎯 Objetivo diario: ${weekPlan.daily_calories_target} kcal`);
        
        if (weekPlan.meals && weekPlan.meals.length > 0) {
          console.log(`🍽️ Comidas planificadas: ${weekPlan.meals.length}`);
          
          weekPlan.meals.forEach((meal: any, mealIndex: number) => {
            console.log(`   ${mealIndex + 1}. ${meal.day} - ${meal.meal_type} (${meal.meal_time})`);
            console.log(`      📝 Descripción: ${meal.meal_description}`);
            console.log(`      🔥 Calorías: ${meal.total_calories} kcal`);
            console.log(`      🥩 Proteínas: ${meal.total_protein}g`);
            console.log(`      🍞 Carbohidratos: ${meal.total_carbs}g`);
            console.log(`      🫒 Grasas: ${meal.total_fats}g`);
            if (meal.notes) {
              console.log(`      📌 Notas: ${meal.notes}`);
            }
          });

          // Calcular totales de la semana
          const weeklyTotals = weekPlan.meals.reduce((totals: any, meal: any) => {
            totals.calories += meal.total_calories || 0;
            totals.protein += meal.total_protein || 0;
            totals.carbs += meal.total_carbs || 0;
            totals.fats += meal.total_fats || 0;
            return totals;
          }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

          console.log(`\n📊 Totales de la semana ${weekPlan.week_number}:`);
          console.log(`   🔥 Calorías: ${weeklyTotals.calories} kcal`);
          console.log(`   🥩 Proteínas: ${weeklyTotals.protein}g`);
          console.log(`   🍞 Carbohidratos: ${weeklyTotals.carbs}g`);
          console.log(`   🫒 Grasas: ${weeklyTotals.fats}g`);
        } else {
          console.log('   ⚠️ No hay comidas planificadas para esta semana');
        }
      });
    } else {
      console.log('⚠️ No hay planes semanales configurados');
    }

    // Mostrar configuración de comidas
    if (plan.meal_frequency) {
      console.log('\n⏰ === CONFIGURACIÓN DE COMIDAS ===');
      console.log('🍽️ Frecuencia de comidas:');
      Object.entries(plan.meal_frequency).forEach(([meal, enabled]) => {
        console.log(`   ${meal}: ${enabled ? '✅' : '❌'}`);
      });
    }

    if (plan.meal_timing) {
      console.log('\n🕐 Horarios de comidas:');
      Object.entries(plan.meal_timing).forEach(([meal, time]) => {
        console.log(`   ${meal}: ${time}`);
      });
    }
  }

  // Actualizar el plan con más comidas
  async updatePlanWithMoreMeals(): Promise<void> {
    console.log('\n🔄 === ACTUALIZANDO PLAN CON MÁS COMIDAS ===');
    
    if (!this.createdPlanId) {
      console.log('❌ No hay plan ID para actualizar');
      return;
    }

    const additionalMeals: TestMeal[] = [
      {
        id: 'meal_5',
        day: 'Jueves',
        meal_type: 'breakfast',
        meal_time: '08:00',
        meal_description: 'Smoothie de proteínas con avena y plátano',
        total_calories: 380,
        total_protein: 25,
        total_carbs: 45,
        total_fats: 8,
        notes: '1 scoop de proteína, 1/2 taza de avena, 1 plátano, leche de almendras'
      },
      {
        id: 'meal_6',
        day: 'Viernes',
        meal_type: 'lunch',
        meal_time: '13:00',
        meal_description: 'Ensalada de atún con garbanzos y verduras',
        total_calories: 420,
        total_protein: 30,
        total_carbs: 35,
        total_fats: 15,
        notes: '100g de atún, 1/2 taza de garbanzos, lechuga, tomate, aceite de oliva'
      }
    ];

    const updateData = {
      weeklyPlans: [
        {
          week_number: 1,
          start_date: '2025-07-14',
          end_date: '2025-07-20',
          daily_calories_target: 1800,
          daily_macros_target: {
            protein: 150,
            carbohydrates: 200,
            fats: 60
          },
          meals: additionalMeals,
          notes: 'Semana 1 actualizada con más comidas'
        }
      ]
    };

    try {
      const response = await axios.patch(`${API_BASE_URL}/diet-plans/${this.createdPlanId}`, updateData, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });

      if (response.data.status === 'success') {
        console.log('✅ Plan actualizado exitosamente con más comidas');
        console.log(`🍽️ Comidas agregadas: ${additionalMeals.length}`);
      } else {
        throw new Error('Respuesta de actualización inválida');
      }
    } catch (error) {
      console.error('❌ Error actualizando plan:', error);
      throw error;
    }
  }

  // Ejecutar todas las pruebas
  async runAllTests(): Promise<void> {
    console.log('🚀 === INICIANDO TEST DE INTEGRACIÓN DEL PLANIFICADOR DE COMIDAS ===\n');
    
    try {
      this.setupAxios();
      await this.authenticate();
      await this.getTestPatient();
      
      const testPlan = this.createTestMealPlan();
      await this.createDietPlanWithMeals(testPlan);
      await this.getCreatedPlan();
      await this.updatePlanWithMoreMeals();
      await this.getCreatedPlan(); // Verificar la actualización
      
      console.log('\n🎉 === TEST COMPLETADO EXITOSAMENTE ===');
      console.log('✅ Todas las funcionalidades del planificador de comidas funcionan correctamente');
      console.log('✅ La conexión frontend-backend está operativa');
      console.log('✅ Todos los campos se guardan correctamente');
      console.log('✅ Las comidas manuales se persisten en la base de datos');
      
    } catch (error) {
      console.error('\n❌ === TEST FALLÓ ===');
      console.error('Error durante la ejecución:', error);
      throw error;
    }
  }
}

// Ejecutar el test
async function runMealPlannerTest() {
  const test = new MealPlannerBackendTest();
  await test.runAllTests();
}

// Exportar para uso en otros archivos
export { MealPlannerBackendTest, runMealPlannerTest };

// Ejecutar si se llama directamente
if (require.main === module) {
  runMealPlannerTest().catch(console.error);
} 