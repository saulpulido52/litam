// test-diet-plans-debug-detailed.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

interface LoginResponse {
  status: string;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      role: string;
    };
    token: string;
  };
}

interface CreateDietPlanDto {
  patientId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  dailyCaloriesTarget?: number;
  dailyMacrosTarget?: {
    protein?: number;
    carbohydrates?: number;
    fats?: number;
  };
  notes?: string;
  isWeeklyPlan?: boolean;
  totalWeeks?: number;
  weeklyPlans?: any[];
}

async function getAuthToken(credentials: { email: string; password: string }): Promise<string> {
  console.log('🔑 Iniciando login con:', credentials.email);
  
  const response = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/login`, credentials);
  
  if (response.data.status !== 'success' || !response.data.data.token) {
    throw new Error('Login failed: ' + response.data.message);
  }
  
  console.log('✅ Login exitoso, token obtenido');
  return response.data.data.token;
}

async function getMyPatients(token: string) {
  console.log('👥 Obteniendo pacientes del nutriólogo...');
  
  const response = await axios.get(`${API_BASE_URL}/patients/my-patients`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  console.log('✅ Respuesta completa:', JSON.stringify(response.data, null, 2));
  
  const patients = response.data.data?.patients || [];
  console.log('✅ Pacientes obtenidos:', patients.length);
  
  patients.forEach((patient: any, index: number) => {
    console.log(`\n👤 Paciente ${index + 1}:`);
    console.log('  Profile ID:', patient.id);
    console.log('  User ID:', patient.user?.id);
    console.log('  Nombre:', patient.user?.first_name, patient.user?.last_name);
    console.log('  Email:', patient.user?.email);
    console.log('  Teléfono:', patient.user?.phone);
    console.log('  Peso actual:', patient.current_weight);
    console.log('  Altura:', patient.height);
    console.log('  Nivel de actividad:', patient.activity_level);
    console.log('  Condiciones médicas:', patient.medical_conditions);
    console.log('  Alergias:', patient.allergies);
  });
  
  return patients;
}

async function testCreateDietPlan(token: string, userPatientId: string) {
  console.log('📝 Probando creación de plan de dieta...');
  console.log('🎯 Usando User ID del paciente:', userPatientId);
  
  const dietPlanData: CreateDietPlanDto = {
    patientId: userPatientId, // Usar el ID del usuario, no el del perfil
    name: 'Plan de Prueba Debug',
    description: 'Plan creado para depurar el problema',
    startDate: '2024-01-15',
    endDate: '2024-01-22',
    dailyCaloriesTarget: 1800,
    dailyMacrosTarget: {
      protein: 135,
      carbohydrates: 202,
      fats: 50
    },
    notes: 'Plan de prueba para depuración',
    isWeeklyPlan: true,
    totalWeeks: 1,
    weeklyPlans: []
  };
  
  console.log('📤 Datos a enviar:', JSON.stringify(dietPlanData, null, 2));
  
  try {
    const response = await axios.post(`${API_BASE_URL}/diet-plans`, dietPlanData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Plan creado exitosamente:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al crear plan:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Response Data:', error.response?.data);
    console.error('Request Data:', error.config?.data);
    console.error('Request Headers:', error.config?.headers);
    throw error;
  }
}

async function runDetailedDebugTest() {
  try {
    console.log('🚀 Iniciando prueba detallada de depuración...\n');
    
    // 1. Login
    const token = await getAuthToken({
      email: 'dr.maria.gonzalez@demo.com',
      password: 'demo123'
    });
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 2. Obtener pacientes
    const patients = await getMyPatients(token);
    
    if (patients.length === 0) {
      console.error('❌ No hay pacientes disponibles');
      return;
    }
    
    const testPatient = patients[0];
    console.log('👤 Paciente seleccionado para prueba:', {
      profileId: testPatient.id,
      userId: testPatient.user?.id,
      name: `${testPatient.user?.first_name} ${testPatient.user?.last_name}`,
      email: testPatient.user?.email
    });
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 3. Crear plan de dieta usando el User ID
    await testCreateDietPlan(token, testPatient.user.id);
    
    console.log('\n✅ Prueba completada exitosamente');
    
  } catch (error) {
    console.error('\n❌ Prueba falló:', error);
  }
}

// Ejecutar la prueba
runDetailedDebugTest(); 