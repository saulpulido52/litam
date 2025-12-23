import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

async function testRoutineDataExtraction() {
  try {
    console.log('🔍 Probando extracción de datos de rutina diaria...\n');

    // 1. Obtener un plan de dieta existente
    const response = await axios.get(`${API_BASE_URL}/diet-plans`);
    const plans = response.data.data;
    
    if (plans.length === 0) {
      console.log('❌ No hay planes de dieta disponibles para probar');
      return;
    }

    const testPlan = plans[0];
    console.log(`📋 Plan seleccionado: ${testPlan.name} (ID: ${testPlan.id})`);

    // 2. Obtener detalles completos del plan
    const planDetailResponse = await axios.get(`${API_BASE_URL}/diet-plans/${testPlan.id}`);
    const planDetail = planDetailResponse.data.data;
    
    console.log('\n📊 Estructura completa del plan:');
    console.log('Campos disponibles:', Object.keys(planDetail));

    // 3. Buscar campos relacionados con rutina diaria
    const routineFields = Object.keys(planDetail).filter(key => 
      key.includes('meal') || 
      key.includes('schedule') || 
      key.includes('timing') || 
      key.includes('wake') || 
      key.includes('bed') ||
      key.includes('exercise') ||
      key.includes('water') ||
      key.includes('routine')
    );
    
    console.log('\n⏰ Campos relacionados con rutina diaria:', routineFields);

    // 4. Mostrar valores de campos de rutina diaria
    console.log('\n📋 Valores de campos de rutina diaria:');
    routineFields.forEach(field => {
      const value = planDetail[field];
      console.log(`${field}:`, value);
      
      // Si es un objeto, mostrar su estructura
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        console.log(`  └─ Estructura de ${field}:`, Object.keys(value));
      }
    });

    // 5. Probar extracción de datos específicos
    console.log('\n🔍 Análisis detallado de datos de rutina:');
    
    // Buscar mealSchedules (formato nuevo)
    if (planDetail.mealSchedules) {
      console.log('✅ Encontrado mealSchedules (formato nuevo):');
      console.log('  - wakeUpTime:', planDetail.mealSchedules.wakeUpTime);
      console.log('  - bedTime:', planDetail.mealSchedules.bedTime);
      console.log('  - exerciseTime:', planDetail.mealSchedules.exerciseTime);
      console.log('  - exerciseDuration:', planDetail.mealSchedules.exerciseDuration);
      console.log('  - waterReminders:', planDetail.mealSchedules.waterReminders);
      
      if (planDetail.mealSchedules.mealsSchedule) {
        console.log('  - mealsSchedule:', planDetail.mealSchedules.mealsSchedule.length, 'comidas');
        planDetail.mealSchedules.mealsSchedule.forEach((meal: any, index: number) => {
          console.log(`    ${index + 1}. ${meal.mealName} - ${meal.scheduledTime} (${meal.duration}min)`);
        });
      }
    }

    // Buscar meal_timing (formato antiguo)
    if (planDetail.meal_timing) {
      console.log('✅ Encontrado meal_timing (formato antiguo):');
      console.log('  - breakfast:', planDetail.meal_timing.breakfast);
      console.log('  - lunch:', planDetail.meal_timing.lunch);
      console.log('  - dinner:', planDetail.meal_timing.dinner);
      console.log('  - morning_snack:', planDetail.meal_timing.morning_snack);
      console.log('  - afternoon_snack:', planDetail.meal_timing.afternoon_snack);
      console.log('  - wakeUpTime:', planDetail.meal_timing.wakeUpTime);
      console.log('  - bedTime:', planDetail.meal_timing.bedTime);
    }

    // Buscar meal_frequency
    if (planDetail.meal_frequency) {
      console.log('✅ Encontrado meal_frequency:');
      console.log('  - breakfast:', planDetail.meal_frequency.breakfast);
      console.log('  - morning_snack:', planDetail.meal_frequency.morning_snack);
      console.log('  - lunch:', planDetail.meal_frequency.lunch);
      console.log('  - afternoon_snack:', planDetail.meal_frequency.afternoon_snack);
      console.log('  - dinner:', planDetail.meal_frequency.dinner);
      console.log('  - evening_snack:', planDetail.meal_frequency.evening_snack);
    }

    // 6. Simular la función getMealSchedules del frontend
    console.log('\n🧪 Simulando función getMealSchedules del frontend:');
    
    function getPlanField(plan: any, field: string) {
      if (plan[field] !== undefined) return plan[field];
      if (plan.dietPlan && plan.dietPlan[field] !== undefined) return plan.dietPlan[field];
      return undefined;
    }

    function getMealSchedules(plan: any) {
      return getPlanField(plan, 'mealSchedules') || 
             getPlanField(plan, 'meal_schedules') || 
             getPlanField(plan, 'meal_timing') || 
             null;
    }

    const extractedData = getMealSchedules(planDetail);
    console.log('Resultado de getMealSchedules:', extractedData ? '✅ Datos encontrados' : '❌ No hay datos');

    if (extractedData) {
      console.log('Estructura de datos extraídos:', Object.keys(extractedData));
      
      // Verificar si tiene formato nuevo o antiguo
      if (extractedData.mealsSchedule) {
        console.log('📅 Formato NUEVO detectado (mealSchedules)');
        console.log('  - Rutina diaria:', extractedData.wakeUpTime, 'a', extractedData.bedTime);
        console.log('  - Comidas configuradas:', extractedData.mealsSchedule.length);
      } else if (extractedData.breakfast || extractedData.lunch || extractedData.dinner) {
        console.log('📅 Formato ANTIGUO detectado (meal_timing)');
        console.log('  - Desayuno:', extractedData.breakfast);
        console.log('  - Almuerzo:', extractedData.lunch);
        console.log('  - Cena:', extractedData.dinner);
      }
    }

    // 7. Verificar si los datos están anidados en dietPlan
    if (planDetail.dietPlan) {
      console.log('\n🔍 Verificando datos anidados en dietPlan:');
      const dietPlanFields = Object.keys(planDetail.dietPlan).filter(key => 
        key.includes('meal') || key.includes('schedule') || key.includes('timing')
      );
      console.log('Campos de rutina en dietPlan:', dietPlanFields);
      
      dietPlanFields.forEach(field => {
        console.log(`  ${field}:`, planDetail.dietPlan[field]);
      });
    }

    console.log('\n✅ Prueba de extracción completada');

  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testRoutineDataExtraction(); 