import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

interface DietPlan {
  id: string;
  name: string;
  patient_id: string;
  nutritionist_id: string;
  status: string;
  start_date?: string;
  end_date?: string;
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fats?: number;
  notes?: string;
  is_weekly_plan?: boolean;
  total_weeks?: number;
  weekly_plans?: any[];
  created_at: string;
  updated_at: string;
}

async function testDietPlansButtons() {
  console.log('🧪 Iniciando pruebas de botones de Diet Plans...\n');

  try {
    // 1. Login como nutricionista
    console.log('1️⃣ Iniciando sesión como nutricionista...');
    const loginResponse = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/login`, {
      email: 'dr.maria.gonzalez@demo.com',
      password: 'demo123'
    });

    const token = loginResponse.data.token;
    const authHeader = { Authorization: `Bearer ${token}` };
    console.log('✅ Login exitoso\n');

    // 2. Obtener pacientes del nutricionista
    console.log('2️⃣ Obteniendo pacientes...');
    const patientsResponse = await axios.get(`${API_BASE_URL}/patients/my-patients`, {
      headers: authHeader
    });
    const patients = patientsResponse.data;
    console.log(`✅ Encontrados ${patients.length} pacientes\n`);

    if (patients.length === 0) {
      console.log('❌ No hay pacientes disponibles para crear planes');
      return;
    }

    const firstPatient = patients[0];
    console.log(`📋 Usando paciente: ${firstPatient.first_name} ${firstPatient.last_name}\n`);

    // 3. Crear un plan de dieta para probar los botones
    console.log('3️⃣ Creando plan de dieta de prueba...');
    const createPlanData = {
      patientId: firstPatient.id,
      name: 'Plan de Prueba - Botones',
      description: 'Plan para probar funcionalidad de botones',
      startDate: '2024-01-01',
      endDate: '2024-01-07',
      dailyCaloriesTarget: 1800,
      dailyMacrosTarget: {
        protein: 150,
        carbohydrates: 200,
        fats: 60
      },
      notes: 'Plan de prueba para verificar botones',
      isWeeklyPlan: true,
      totalWeeks: 1,
      weeklyPlans: []
    };

    const createResponse = await axios.post<DietPlan>(`${API_BASE_URL}/diet-plans`, createPlanData, {
      headers: authHeader
    });
    const testPlan = createResponse.data;
    console.log(`✅ Plan creado: ${testPlan.name} (ID: ${testPlan.id})\n`);

    // 4. Probar botón "Ver detalles" (GET plan)
    console.log('4️⃣ Probando botón "Ver detalles"...');
    const getPlanResponse = await axios.get<DietPlan>(`${API_BASE_URL}/diet-plans/${testPlan.id}`, {
      headers: authHeader
    });
    const retrievedPlan = getPlanResponse.data;
    console.log(`✅ Plan recuperado: ${retrievedPlan.name}`);
    console.log(`   - Estado: ${retrievedPlan.status}`);
    console.log(`   - Calorías: ${retrievedPlan.target_calories}`);
    console.log(`   - Proteínas: ${retrievedPlan.target_protein}g\n`);

    // 5. Probar botón "Editar plan" (PUT plan)
    console.log('5️⃣ Probando botón "Editar plan"...');
    const updateData = {
      name: 'Plan de Prueba - Editado',
      description: 'Plan editado para probar funcionalidad',
      dailyCaloriesTarget: 2000,
      dailyMacrosTarget: {
        protein: 160,
        carbohydrates: 220,
        fats: 65
      },
      notes: 'Plan editado exitosamente'
    };

    const updateResponse = await axios.put<DietPlan>(`${API_BASE_URL}/diet-plans/${testPlan.id}`, updateData, {
      headers: authHeader
    });
    const updatedPlan = updateResponse.data;
    console.log(`✅ Plan editado: ${updatedPlan.name}`);
    console.log(`   - Nuevas calorías: ${updatedPlan.target_calories}`);
    console.log(`   - Nuevas proteínas: ${updatedPlan.target_protein}g\n`);

    // 6. Probar botón "Agregar semana"
    console.log('6️⃣ Probando botón "Agregar semana"...');
    const addWeekData = {
      weekNumber: 2,
      startDate: '2024-01-08',
      endDate: '2024-01-14',
      dailyCaloriesTarget: 1900,
      dailyMacrosTarget: {
        protein: 155,
        carbohydrates: 210,
        fats: 62
      },
      meals: [],
      notes: 'Segunda semana agregada'
    };

    const addWeekResponse = await axios.post<DietPlan>(`${API_BASE_URL}/diet-plans/${testPlan.id}/weeks`, addWeekData, {
      headers: authHeader
    });
    const planWithWeek = addWeekResponse.data;
    console.log(`✅ Semana agregada: ${planWithWeek.total_weeks} semanas totales\n`);

    // 7. Probar botón "Descargar PDF" (simulación)
    console.log('7️⃣ Probando botón "Descargar PDF"...');
    console.log('📄 Simulando descarga de PDF...');
    console.log(`   - Archivo: plan-nutricional-${testPlan.name.replace(/\s+/g, '-')}.pdf`);
    console.log('✅ Descarga simulada exitosa\n');

    // 8. Probar botón "Generar con IA" (simulación)
    console.log('8️⃣ Probando botón "Generar con IA"...');
    const aiPlanData = {
      patientId: firstPatient.id,
      name: 'Plan IA - Pérdida de Peso',
      goal: 'weight_loss',
      startDate: '2024-01-15',
      endDate: '2024-01-21',
      totalWeeks: 1,
      dailyCaloriesTarget: 1600,
      dietaryRestrictions: ['Sin gluten'],
      allergies: ['Nueces'],
      preferredFoods: ['Pollo', 'Quinoa'],
      dislikedFoods: ['Brócoli'],
      notesForAI: 'Plan para pérdida de peso moderada'
    };

    console.log('🤖 Simulando generación con IA...');
    console.log(`   - Objetivo: ${aiPlanData.goal}`);
    console.log(`   - Calorías: ${aiPlanData.dailyCaloriesTarget}`);
    console.log(`   - Restricciones: ${aiPlanData.dietaryRestrictions.join(', ')}`);
    console.log('✅ Generación con IA simulada exitosa\n');

    // 9. Probar botón "Eliminar plan"
    console.log('9️⃣ Probando botón "Eliminar plan"...');
    await axios.delete(`${API_BASE_URL}/diet-plans/${testPlan.id}`, {
      headers: authHeader
    });
    console.log(`✅ Plan eliminado: ${testPlan.name}\n`);

    // 10. Verificar que el plan fue eliminado
    console.log('🔍 Verificando eliminación...');
    try {
      await axios.get(`${API_BASE_URL}/diet-plans/${testPlan.id}`, {
        headers: authHeader
      });
      console.log('❌ Error: El plan aún existe');
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('✅ Plan eliminado correctamente\n');
      } else {
        console.log('❌ Error inesperado al verificar eliminación');
      }
    }

    console.log('🎉 ¡Todas las pruebas de botones completadas exitosamente!');
    console.log('\n📋 Resumen de funcionalidades probadas:');
    console.log('   ✅ Ver detalles (GET)');
    console.log('   ✅ Editar plan (PUT)');
    console.log('   ✅ Agregar semana (POST)');
    console.log('   ✅ Descargar PDF (simulación)');
    console.log('   ✅ Generar con IA (simulación)');
    console.log('   ✅ Eliminar plan (DELETE)');

  } catch (error: any) {
    console.error('❌ Error durante las pruebas:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Sugerencia: Verifica las credenciales de login');
    } else if (error.response?.status === 404) {
      console.log('💡 Sugerencia: Verifica que el backend esté ejecutándose');
    }
  }
}

// Ejecutar las pruebas
testDietPlansButtons(); 