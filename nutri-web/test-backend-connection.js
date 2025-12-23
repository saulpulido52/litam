// Script de prueba para verificar la conexión con el backend
const axios = require('axios');

const API_BASE_URL = 'http://localhost:4000/api';

async function testBackendConnection() {
  console.log('🔍 Probando conexión con el backend...');
  
  try {
    // 1. Probar conexión básica
    console.log('\n1. Probando conexión básica...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend respondiendo:', healthResponse.status);
    
    // 2. Probar autenticación
    console.log('\n2. Probando autenticación...');
    const loginData = {
      email: 'nutri.admin@sistema.com',
      password: 'nutri123'
    };
    
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
    console.log('✅ Login exitoso:', loginResponse.data);
    
    const token = loginResponse.data.data.token;
    
    // 3. Probar obtener pacientes
    console.log('\n3. Probando obtener pacientes...');
    const patientsResponse = await axios.get(`${API_BASE_URL}/patients/my-patients`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Pacientes obtenidos:', {
      count: patientsResponse.data.data?.patients?.length || 0,
      patients: patientsResponse.data.data?.patients?.map(p => ({
        id: p.id,
        name: `${p.user?.first_name || p.first_name} ${p.user?.last_name || p.last_name}`,
        email: p.user?.email || p.email
      }))
    });
    
    // 4. Probar estadísticas
    console.log('\n4. Probando estadísticas...');
    const statsResponse = await axios.get(`${API_BASE_URL}/patients/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Estadísticas obtenidas:', statsResponse.data);
    
  } catch (error) {
    console.error('❌ Error en la prueba:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

testBackendConnection(); 