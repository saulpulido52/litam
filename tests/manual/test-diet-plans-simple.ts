import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testDietPlansSimple() {
  console.log('🧪 Iniciando pruebas simples de Diet Plans...\n');

  try {
    // 1. Verificar que el backend está funcionando
    console.log('1️⃣ Verificando conexión con el backend...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend funcionando\n');

    // 2. Login simple
    console.log('2️⃣ Iniciando sesión...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'dr.maria.gonzalez@demo.com',
      password: 'demo123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login exitoso\n');

    // 3. Verificar que el token funciona
    console.log('3️⃣ Verificando token...');
    const authHeader = { Authorization: `Bearer ${token}` };
    
    // Probar un endpoint simple
    const profileResponse = await axios.get(`${API_BASE_URL}/users/profile`, {
      headers: authHeader
    });
    console.log(`✅ Token válido - Usuario: ${profileResponse.data.first_name}\n`);

    // 4. Obtener pacientes
    console.log('4️⃣ Obteniendo pacientes...');
    const patientsResponse = await axios.get(`${API_BASE_URL}/patients/my-patients`, {
      headers: authHeader
    });
    const patients = patientsResponse.data;
    console.log(`✅ Encontrados ${patients.length} pacientes\n`);

    if (patients.length === 0) {
      console.log('❌ No hay pacientes disponibles');
      return;
    }

    const firstPatient = patients[0];
    console.log(`📋 Paciente: ${firstPatient.first_name} ${firstPatient.last_name}\n`);

    // 5. Crear un plan simple
    console.log('5️⃣ Creando plan de dieta...');
    const planData = {
      patientId: firstPatient.id,
      name: 'Plan de Prueba Simple',
      description: 'Plan para probar botones',
      startDate: '2024-01-01',
      endDate: '2024-01-07',
      dailyCaloriesTarget: 1800,
      dailyMacrosTarget: {
        protein: 150,
        carbohydrates: 200,
        fats: 60
      },
      notes: 'Plan de prueba',
      isWeeklyPlan: true,
      totalWeeks: 1,
      weeklyPlans: []
    };

    const createResponse = await axios.post(`${API_BASE_URL}/diet-plans`, planData, {
      headers: authHeader
    });
    const plan = createResponse.data;
    console.log(`✅ Plan creado: ${plan.name}\n`);

    // 6. Probar funcionalidades básicas
    console.log('6️⃣ Probando funcionalidades...');
    
    // Ver detalles
    const getResponse = await axios.get(`${API_BASE_URL}/diet-plans/${plan.id}`, {
      headers: authHeader
    });
    console.log('✅ Ver detalles: Funciona');

    // Editar plan
    const updateData = {
      name: 'Plan Editado',
      notes: 'Plan modificado'
    };
    const updateResponse = await axios.put(`${API_BASE_URL}/diet-plans/${plan.id}`, updateData, {
      headers: authHeader
    });
    console.log('✅ Editar plan: Funciona');

    // Agregar semana
    const weekData = {
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
      notes: 'Segunda semana'
    };
    const weekResponse = await axios.post(`${API_BASE_URL}/diet-plans/${plan.id}/weeks`, weekData, {
      headers: authHeader
    });
    console.log('✅ Agregar semana: Funciona');

    // Eliminar plan
    await axios.delete(`${API_BASE_URL}/diet-plans/${plan.id}`, {
      headers: authHeader
    });
    console.log('✅ Eliminar plan: Funciona\n');

    console.log('🎉 ¡Todas las funcionalidades básicas funcionan!');
    console.log('\n📋 Botones implementados:');
    console.log('   ✅ Ver detalles');
    console.log('   ✅ Editar plan');
    console.log('   ✅ Agregar semana');
    console.log('   ✅ Eliminar plan');
    console.log('   📄 Descargar PDF (simulado)');
    console.log('   🤖 Generar con IA (simulado)');

  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Problema de autenticación');
    } else if (error.response?.status === 404) {
      console.log('💡 Endpoint no encontrado');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Backend no está ejecutándose');
    }
  }
}

testDietPlansSimple(); 