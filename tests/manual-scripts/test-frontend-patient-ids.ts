// test-frontend-patient-ids.ts
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

async function getAuthToken(credentials: { email: string; password: string }): Promise<string> {
  console.log('🔑 Iniciando login con:', credentials.email);
  
  const response = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/login`, credentials);
  
  if (response.data.status !== 'success' || !response.data.data.token) {
    throw new Error('Login failed: ' + response.data.message);
  }
  
  console.log('✅ Login exitoso, token obtenido');
  return response.data.data.token;
}

async function testFrontendPatientTransformation(token: string) {
  console.log('🔄 Probando transformación de pacientes como en el frontend...');
  
  // Simular la llamada que hace el frontend
  const response = await axios.get(`${API_BASE_URL}/patients/my-patients`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const rawPatients = response.data.data?.patients || [];
  console.log('📥 Pacientes crudos del backend:', rawPatients.length);
  
  // Simular la transformación que hace el frontend
  const transformBackendPatient = (backendPatient: any) => {
    console.log('🔄 Transformando paciente:', backendPatient.id);
    
    if (backendPatient.user) {
      const transformed = {
        id: backendPatient.user.id, // User ID
        userId: backendPatient.user.id, // User ID
        first_name: backendPatient.user.first_name || '',
        last_name: backendPatient.user.last_name || '',
        email: backendPatient.user.email || '',
        phone: backendPatient.user.phone || backendPatient.phone,
        birth_date: backendPatient.user.birth_date || backendPatient.birth_date,
        age: backendPatient.user.age || backendPatient.age,
        gender: backendPatient.user.gender || backendPatient.gender,
        role: backendPatient.user.role || { id: '', name: 'patient' },
        is_active: backendPatient.user.is_active !== undefined ? backendPatient.user.is_active : true,
        created_at: backendPatient.created_at || backendPatient.user.created_at,
        updated_at: backendPatient.updated_at || backendPatient.user.updated_at,
        profile: {
          id: backendPatient.id, // Profile ID
          height: backendPatient.height,
          current_weight: backendPatient.current_weight,
          target_weight: backendPatient.target_weight,
          activity_level: backendPatient.activity_level,
          medical_conditions: backendPatient.medical_conditions,
          allergies: backendPatient.allergies,
          objectives: backendPatient.objectives,
          emergency_contact_name: backendPatient.emergency_contact_name,
          emergency_contact_phone: backendPatient.emergency_contact_phone
        }
      };
      
      console.log('✅ Paciente transformado:', {
        id: transformed.id, // User ID
        profileId: transformed.profile.id, // Profile ID
        name: `${transformed.first_name} ${transformed.last_name}`,
        email: transformed.email
      });
      
      return transformed;
    }
    
    return backendPatient;
  };
  
  const transformedPatients = rawPatients.map((patient: any) => transformBackendPatient(patient));
  
  console.log('\n📋 Resumen de transformación:');
  transformedPatients.forEach((patient: any, index: number) => {
    console.log(`👤 Paciente ${index + 1}:`);
    console.log('  User ID (patient.id):', patient.id);
    console.log('  Profile ID (patient.profile.id):', patient.profile.id);
    console.log('  Nombre:', `${patient.first_name} ${patient.last_name}`);
    console.log('  Email:', patient.email);
  });
  
  return transformedPatients;
}

async function testDietPlanCreation(token: string, patients: any[]) {
  if (patients.length === 0) {
    console.error('❌ No hay pacientes para probar');
    return;
  }
  
  const testPatient = patients[0];
  console.log('\n🧪 Probando creación de plan con paciente transformado...');
  console.log('🎯 Usando patient.id (User ID):', testPatient.id);
  
  const dietPlanData = {
    patientId: testPatient.id, // User ID
    name: 'Plan de Prueba Frontend',
    description: 'Plan creado para probar la transformación del frontend',
    startDate: '2024-01-15',
    endDate: '2024-01-22',
    dailyCaloriesTarget: 1800,
    dailyMacrosTarget: {
      protein: 135,
      carbohydrates: 202,
      fats: 50
    },
    notes: 'Plan de prueba para verificar transformación',
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
    
    console.log('✅ Plan creado exitosamente con transformación del frontend');
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al crear plan con transformación del frontend:');
    console.error('Status:', error.response?.status);
    console.error('Response Data:', error.response?.data);
    throw error;
  }
}

async function runFrontendTest() {
  try {
    console.log('🚀 Iniciando prueba de transformación del frontend...\n');
    
    // 1. Login
    const token = await getAuthToken({
      email: 'dr.maria.gonzalez@demo.com',
      password: 'demo123'
    });
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 2. Probar transformación
    const transformedPatients = await testFrontendPatientTransformation(token);
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 3. Probar creación de plan
    await testDietPlanCreation(token, transformedPatients);
    
    console.log('\n✅ Prueba del frontend completada exitosamente');
    
  } catch (error) {
    console.error('\n❌ Prueba del frontend falló:', error);
  }
}

// Ejecutar la prueba
runFrontendTest(); 