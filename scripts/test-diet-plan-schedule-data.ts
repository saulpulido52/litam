import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

async function testDietPlanScheduleData() {
  try {
    // 1. Login como nutriólogo
    console.log('🔐 Iniciando sesión como nutriólogo...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'dr.maria.gonzalez@demo.com',
      password: 'demo123'
    });

    const authToken = loginResponse.data.data.token;
    const headers = { Authorization: `Bearer ${authToken}` };

    console.log('✅ Login exitoso');

    // 2. Obtener todos los planes de dieta del nutriólogo
    console.log('\n📋 Obteniendo planes de dieta...');
    const plansResponse = await axios.get(`${API_BASE_URL}/diet-plans`, { headers });
    const plans = plansResponse.data.data.dietPlans;
    console.log('✅ Planes obtenidos:', plans.length);

    if (plans.length === 0) {
      console.log('❌ No hay planes de dieta disponibles');
      return;
    }

    // 3. Seleccionar el primer plan para analizar
    const plan = plans[0];
    console.log('\n🔍 Analizando plan:', plan.id);
    console.log('Plan name:', plan.name);
    console.log('Plan status:', plan.status);

    // 4. Verificar datos de horarios
    console.log('\n📅 Datos de horarios:');
    console.log('mealSchedules:', plan.mealSchedules);
    console.log('meal_timing:', plan.meal_timing);

    // 5. Obtener el plan completo por ID
    console.log('\n🔍 Obteniendo plan completo por ID...');
    const planDetailResponse = await axios.get(`${API_BASE_URL}/diet-plans/${plan.id}`, { headers });
    const planDetail = planDetailResponse.data.data;
    
    console.log('\n📅 Datos de horarios del plan completo:');
    console.log('mealSchedules:', planDetail.mealSchedules);
    console.log('meal_timing:', planDetail.meal_timing);

    // 6. Verificar estructura completa del plan
    console.log('\n📋 Estructura completa del plan:');
    console.log('Campos disponibles:', Object.keys(planDetail));

    // 7. Buscar campos relacionados con horarios
    const scheduleFields = Object.keys(planDetail).filter(key => 
      key.includes('meal') || key.includes('schedule') || key.includes('timing') || key.includes('wake') || key.includes('bed')
    );
    console.log('\n⏰ Campos relacionados con horarios:', scheduleFields);

    // 8. Mostrar valores de campos de horarios
    console.log('\n📊 Valores de campos de horarios:');
    scheduleFields.forEach(field => {
      console.log(`${field}:`, planDetail[field]);
    });

  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testDietPlanScheduleData(); 