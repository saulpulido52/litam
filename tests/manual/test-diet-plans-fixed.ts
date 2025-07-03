import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

async function testDietPlansFixed() {
  console.log('🧪 Iniciando pruebas corregidas de Diet Plans...\n');

  try {
    // 1. Verificar que el backend está funcionando
    console.log('1️⃣ Verificando conexión con el backend...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend funcionando en puerto 4000\n');

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
      name: 'Plan de Prueba - Botones Completos',
      description: 'Plan para probar todos los botones',
      startDate: '2024-01-01',
      endDate: '2024-01-07',
      dailyCaloriesTarget: 1800,
      dailyMacrosTarget: {
        protein: 150,
        carbohydrates: 200,
        fats: 60
      },
      notes: 'Plan de prueba para verificar funcionalidad completa',
      isWeeklyPlan: true,
      totalWeeks: 1,
      weeklyPlans: []
    };

    const createResponse = await axios.post(`${API_BASE_URL}/diet-plans`, planData, {
      headers: authHeader
    });
    const plan = createResponse.data;
    console.log(`✅ Plan creado: ${plan.name} (ID: ${plan.id})\n`);

    // 6. Probar todas las funcionalidades
    console.log('6️⃣ Probando todas las funcionalidades...\n');
    
    // Ver detalles
    console.log('👁️ Probando "Ver detalles"...');
    const getResponse = await axios.get(`${API_BASE_URL}/diet-plans/${plan.id}`, {
      headers: authHeader
    });
    console.log('   ✅ Ver detalles: Funciona\n');

    // Editar plan
    console.log('✏️ Probando "Editar plan"...');
    const updateData = {
      name: 'Plan Editado - Botones Completos',
      description: 'Plan modificado exitosamente',
      notes: 'Plan editado para probar funcionalidad'
    };
    const updateResponse = await axios.put(`${API_BASE_URL}/diet-plans/${plan.id}`, updateData, {
      headers: authHeader
    });
    console.log('   ✅ Editar plan: Funciona\n');

    // Agregar semana
    console.log('➕ Probando "Agregar semana"...');
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
      notes: 'Segunda semana agregada exitosamente'
    };
    const weekResponse = await axios.post(`${API_BASE_URL}/diet-plans/${plan.id}/weeks`, weekData, {
      headers: authHeader
    });
    console.log('   ✅ Agregar semana: Funciona\n');

    // Eliminar plan
    console.log('🗑️ Probando "Eliminar plan"...');
    await axios.delete(`${API_BASE_URL}/diet-plans/${plan.id}`, {
      headers: authHeader
    });
    console.log('   ✅ Eliminar plan: Funciona\n');

    console.log('🎉 ¡Todas las pruebas completadas exitosamente!');
    console.log('\n📋 Resumen de funcionalidades probadas:');
    console.log('   ✅ Ver detalles (GET) - Funciona');
    console.log('   ✅ Editar plan (PUT) - Funciona');
    console.log('   ✅ Agregar semana (POST) - Funciona');
    console.log('   ✅ Eliminar plan (DELETE) - Funciona');
    console.log('   📄 Descargar PDF - Simulado');
    console.log('   🤖 Generar con IA - Simulado');

  } catch (error: any) {
    console.error('❌ Error durante las pruebas:', error.response?.data || error.message);
  }
}

testDietPlansFixed(); 