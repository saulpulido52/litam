/**
 * Script para probar la conectividad del backend pediátrico
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api';

async function testPediatricBackend() {
  try {
    console.log('🔐 Haciendo login...');
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'nutritionist@demo.com',
      password: 'demo123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login exitoso');
    
    console.log('\n🔍 Probando endpoint de pacientes...');
    
    const patientsResponse = await axios.get(`${BASE_URL}/patients/my-patients`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Endpoint de pacientes funciona');
    console.log('📊 Datos recibidos:', {
      status: patientsResponse.status,
      dataLength: patientsResponse.data?.data?.length || 0,
      firstPatient: patientsResponse.data?.data?.[0]?.first_name || 'No hay pacientes'
    });
    
    console.log('\n🔍 Probando endpoint de growth-charts...');
    
    const growthResponse = await axios.get(`${BASE_URL}/growth-charts/chart-data`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Endpoint de growth-charts funciona');
    console.log('📊 Datos de growth-charts:', {
      status: growthResponse.status,
      hasData: !!growthResponse.data?.data
    });
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('📄 Respuesta del error:', error.response.data);
    }
  }
}

console.log('🚀 Iniciando prueba de conectividad del backend pediátrico...');
testPediatricBackend(); 