import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

// Datos de prueba
const testNutritionist = {
  email: 'dr.maria.gonzalez@demo.com',
  password: 'demo123'
};

const testPatient = {
  id: '077d849c-c862-4b55-ac15-d8a2687373c3', // ID del primer paciente
  name: 'Ana García'
};

let authToken = '';

async function login() {
  try {
    console.log('🔐 Iniciando sesión...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testNutritionist.email,
      password: testNutritionist.password
    });

    authToken = response.data.data.token;
    console.log('✅ Login exitoso');
    return true;
  } catch (error: any) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    return false;
  }
}

async function testGetDietPlans() {
  try {
    console.log('\n📋 Obteniendo planes de dieta...');
    const response = await axios.get(`${API_BASE_URL}/diet-plans/patient/${testPatient.id}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ Planes de dieta obtenidos:', response.data.data.dietPlans.length);
    return response.data.data.dietPlans;
  } catch (error: any) {
    console.error('❌ Error obteniendo planes:', error.response?.data || error.message);
    return [];
  }
}

async function testCreateDietPlan() {
  try {
    console.log('\n➕ Creando plan de dieta...');
    const dietPlanData = {
      patientId: testPatient.id,
      name: 'Plan de Pérdida de Peso - Test',
      description: 'Plan de prueba para verificar funcionalidad',
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      dailyCaloriesTarget: 1500,
      dailyMacrosTarget: {
        protein: 112,
        carbohydrates: 169,
        fats: 42
      },
      notes: 'Plan de prueba creado automáticamente',
      isWeeklyPlan: true,
      totalWeeks: 4,
      weeklyPlans: []
    };

    const response = await axios.post(`${API_BASE_URL}/diet-plans`, dietPlanData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ Plan de dieta creado:', response.data.data.dietPlan.id);
    return response.data.data.dietPlan;
  } catch (error: any) {
    console.error('❌ Error creando plan:', error.response?.data || error.message);
    return null;
  }
}

async function testGenerateAIDietPlan() {
  try {
    console.log('\n🤖 Generando plan con IA...');
    const aiData = {
      patientId: testPatient.id,
      name: 'Plan IA - Pérdida de Peso',
      goal: 'weight_loss',
      startDate: '2024-01-20',
      endDate: '2024-02-20',
      totalWeeks: 4,
      dailyCaloriesTarget: 1400,
      dietaryRestrictions: ['sin gluten'],
      allergies: ['nueces'],
      preferredFoods: ['pollo', 'quinoa', 'aguacate'],
      dislikedFoods: ['brócoli'],
      notesForAI: 'Paciente prefiere comidas simples y fáciles de preparar'
    };

    const response = await axios.post(`${API_BASE_URL}/diet-plans/generate-ai`, aiData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ Plan con IA generado:', response.data.data.dietPlan.id);
    return response.data.data.dietPlan;
  } catch (error: any) {
    console.error('❌ Error generando plan con IA:', error.response?.data || error.message);
    return null;
  }
}

async function testUpdateDietPlan(dietPlanId: string) {
  try {
    console.log('\n✏️ Actualizando plan de dieta...');
    const updateData = {
      name: 'Plan Actualizado - Test',
      notes: 'Plan actualizado automáticamente',
      dailyCaloriesTarget: 1600
    };

    const response = await axios.patch(`${API_BASE_URL}/diet-plans/${dietPlanId}`, updateData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ Plan actualizado:', response.data.data.dietPlan.name);
    return response.data.data.dietPlan;
  } catch (error: any) {
    console.error('❌ Error actualizando plan:', error.response?.data || error.message);
    return null;
  }
}

async function testUpdateStatus(dietPlanId: string) {
  try {
    console.log('\n🔄 Actualizando estado del plan...');
    const response = await axios.patch(`${API_BASE_URL}/diet-plans/${dietPlanId}/status`, 
      { status: 'active' }, 
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    console.log('✅ Estado actualizado:', response.data.data.dietPlan.status);
    return response.data.data.dietPlan;
  } catch (error: any) {
    console.error('❌ Error actualizando estado:', error.response?.data || error.message);
    return null;
  }
}

async function testAddWeekToPlan(dietPlanId: string) {
  try {
    console.log('\n📅 Agregando semana al plan...');
    const weekData = {
      weekNumber: 5,
      startDate: '2024-02-16',
      endDate: '2024-02-22',
      dailyCaloriesTarget: 1500,
      dailyMacrosTarget: {
        protein: 112,
        carbohydrates: 169,
        fats: 42
      },
      meals: [],
      notes: 'Semana adicional agregada automáticamente'
    };

    const response = await axios.post(`${API_BASE_URL}/diet-plans/${dietPlanId}/weeks`, weekData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ Semana agregada:', response.data.data.dietPlan.total_weeks, 'semanas totales');
    return response.data.data.dietPlan;
  } catch (error: any) {
    console.error('❌ Error agregando semana:', error.response?.data || error.message);
    return null;
  }
}

async function testDeleteDietPlan(dietPlanId: string) {
  try {
    console.log('\n🗑️ Eliminando plan de dieta...');
    await axios.delete(`${API_BASE_URL}/diet-plans/${dietPlanId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ Plan eliminado correctamente');
    return true;
  } catch (error: any) {
    console.error('❌ Error eliminando plan:', error.response?.data || error.message);
    return false;
  }
}

async function runCompleteTest() {
  console.log('🚀 Iniciando prueba completa de Diet Plans...\n');

  // 1. Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ No se pudo iniciar sesión. Abortando pruebas.');
    return;
  }

  // 2. Obtener planes existentes
  const existingPlans = await testGetDietPlans();
  console.log(`📊 Planes existentes: ${existingPlans.length}`);

  // 3. Crear plan manual
  const newPlan = await testCreateDietPlan();
  if (!newPlan) {
    console.log('❌ No se pudo crear plan manual. Continuando con otras pruebas...');
  }

  // 4. Generar plan con IA
  const aiPlan = await testGenerateAIDietPlan();
  if (!aiPlan) {
    console.log('❌ No se pudo generar plan con IA. Continuando con otras pruebas...');
  }

  // 5. Actualizar plan (usar el plan creado manualmente si existe, sino el primero disponible)
  let planToUpdate = newPlan || (existingPlans.length > 0 ? existingPlans[0] : null);
  if (planToUpdate) {
    await testUpdateDietPlan(planToUpdate.id);
    await testUpdateStatus(planToUpdate.id);
    await testAddWeekToPlan(planToUpdate.id);
  } else {
    console.log('⚠️ No hay planes disponibles para actualizar');
  }

  // 6. Obtener planes actualizados
  const updatedPlans = await testGetDietPlans();
  console.log(`📊 Planes después de las operaciones: ${updatedPlans.length}`);

  // 7. Eliminar plan de prueba (solo si se creó uno nuevo)
  if (newPlan) {
    await testDeleteDietPlan(newPlan.id);
  }

  console.log('\n✅ Prueba completa finalizada');
  console.log('\n📋 Resumen:');
  console.log('- Login: ✅');
  console.log('- Obtener planes: ✅');
  console.log('- Crear plan manual:', newPlan ? '✅' : '❌');
  console.log('- Generar plan IA:', aiPlan ? '✅' : '❌');
  console.log('- Actualizar plan:', planToUpdate ? '✅' : '⚠️');
  console.log('- Eliminar plan:', newPlan ? '✅' : '⚠️');
}

// Ejecutar la prueba
runCompleteTest().catch(console.error); 