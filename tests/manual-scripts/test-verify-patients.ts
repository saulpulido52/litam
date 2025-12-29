// test-verify-patients.ts
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
    console.log('  ID:', patient.id);
    console.log('  User ID:', patient.user_id);
    console.log('  Nombre:', patient.first_name, patient.last_name);
    console.log('  Email:', patient.email);
    console.log('  Teléfono:', patient.phone);
    console.log('  Peso actual:', patient.current_weight);
    console.log('  Altura:', patient.height);
    console.log('  Nivel de actividad:', patient.activity_level);
    console.log('  Condiciones médicas:', patient.medical_conditions);
    console.log('  Alergias:', patient.allergies);
  });
  
  return patients;
}

async function verifyPatientExists(token: string, patientId: string) {
  console.log(`🔍 Verificando si el paciente ${patientId} existe...`);
  
  try {
    const response = await axios.get(`${API_BASE_URL}/patients/${patientId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Paciente encontrado:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al verificar paciente:', error.response?.data);
    return null;
  }
}

async function runPatientVerification() {
  try {
    console.log('🚀 Iniciando verificación de pacientes...\n');
    
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
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 3. Verificar cada paciente individualmente
    for (const patient of patients) {
      await verifyPatientExists(token, patient.id);
      console.log('\n' + '-'.repeat(30) + '\n');
    }
    
    console.log('✅ Verificación completada');
    
  } catch (error) {
    console.error('\n❌ Verificación falló:', error);
  }
}

// Ejecutar la verificación
runPatientVerification(); 