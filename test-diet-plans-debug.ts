import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

// Datos de prueba
const testNutritionist = {
  email: 'dr.maria.gonzalez@demo.com',
  password: 'demo123'
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

async function getMyPatients() {
  try {
    console.log('\n👥 Obteniendo mis pacientes...');
    const response = await axios.get(`${API_BASE_URL}/patients/my-patients`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const result = response.data.data;
    const patients = result.patients || [];
    console.log(`✅ Pacientes obtenidos: ${patients.length}`);
    console.log(`📊 Total de pacientes: ${result.total}`);
    
    patients.forEach((patient: any, index: number) => {
      console.log(`\n${index + 1}. Paciente:`);
      console.log(`   ID: ${patient.id}`);
      console.log(`   Nombre: ${patient.user.first_name} ${patient.user.last_name}`);
      console.log(`   Email: ${patient.user.email}`);
      console.log(`   Peso: ${patient.current_weight || 'N/A'} kg`);
      console.log(`   Altura: ${patient.height || 'N/A'} cm`);
    });

    return patients;
  } catch (error: any) {
    console.error('❌ Error obteniendo pacientes:', error.response?.data || error.message);
    return [];
  }
}

async function testCreateDietPlan(patientId: string) {
  try {
    console.log(`\n➕ Creando plan de dieta para paciente ${patientId}...`);
    
    const dietPlanData = {
      patientId: patientId,
      name: 'Plan de Prueba - Pérdida de Peso',
      description: 'Plan de prueba para verificar funcionalidad',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      dailyCaloriesTarget: 1800,
      dailyMacrosTarget: {
        protein: 150,
        carbohydrates: 200,
        fats: 60
      },
      notes: 'Plan de prueba creado automáticamente',
      isWeeklyPlan: false
    };

    const response = await axios.post(`${API_BASE_URL}/diet-plans`, dietPlanData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ Plan de dieta creado exitosamente');
    console.log('📋 Plan creado:', response.data.data);
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Error creando plan:', error.response?.data || error.message);
    return null;
  }
}

async function testGetDietPlans(patientId: string) {
  try {
    console.log(`\n📋 Obteniendo planes de dieta para paciente ${patientId}...`);
    
    const response = await axios.get(`${API_BASE_URL}/diet-plans/patient/${patientId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const plans = response.data.data;
    console.log(`✅ Planes obtenidos: ${plans.length}`);
    
    plans.forEach((plan: any, index: number) => {
      console.log(`\n${index + 1}. Plan:`);
      console.log(`   ID: ${plan.id}`);
      console.log(`   Nombre: ${plan.name}`);
      console.log(`   Estado: ${plan.status}`);
      console.log(`   Fecha inicio: ${plan.start_date}`);
      console.log(`   Fecha fin: ${plan.end_date}`);
      console.log(`   Calorías objetivo: ${plan.daily_calories_target || 'N/A'}`);
    });

    return plans;
  } catch (error: any) {
    console.error('❌ Error obteniendo planes:', error.response?.data || error.message);
    return [];
  }
}

async function runDebugTest() {
  console.log('🚀 Iniciando debug de Diet Plans...\n');

  // 1. Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ No se pudo hacer login. Abortando...');
    return;
  }

  // 2. Obtener pacientes
  const patients = await getMyPatients();
  if (patients.length === 0) {
    console.log('❌ No hay pacientes disponibles. Abortando...');
    return;
  }

  // 3. Usar el primer paciente para las pruebas
  const firstPatient = patients[0];
  console.log(`\n🎯 Usando paciente: ${firstPatient.user.first_name} ${firstPatient.user.last_name} (ID: ${firstPatient.id})`);

  // 4. Intentar crear un plan de dieta
  const createdPlan = await testCreateDietPlan(firstPatient.id);
  
  // 5. Obtener planes de dieta
  const plans = await testGetDietPlans(firstPatient.id);

  console.log('\n✅ Debug completado');
}

runDebugTest().catch(console.error); 