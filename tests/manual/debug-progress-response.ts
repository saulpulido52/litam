import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api';

async function debugProgressResponse() {
  try {
    console.log('🔐 Iniciando login...');
    
    // Login como nutricionista
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'nutritionist@demo.com',
      password: 'demo123'
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Login exitoso');

    const patientId = '66f1ff30-6075-4fc0-8ceb-a3fd0bf2d90f';
    
    console.log('\n🔍 Probando endpoint de análisis automático...');
    
    // Llamada directa al endpoint
    const response = await axios.post(
      `${BASE_URL}/progress-tracking/patient/${patientId}/generate-automatic`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('\n📦 RESPUESTA COMPLETA:');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('\n📄 DATOS (response.data):');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data?.data) {
      console.log('\n📊 ANÁLISIS (response.data.data.analysis):');
      console.log(JSON.stringify(response.data.data.analysis, null, 2));
      
      console.log('\n📋 LOGS (response.data.data.logs):');
      console.log('Cantidad de logs:', response.data.data.logs?.length || 0);
      if (response.data.data.logs?.length > 0) {
        console.log('Primer log:', JSON.stringify(response.data.data.logs[0], null, 2));
      }
    }

    // Probar también el endpoint de obtener progreso
    console.log('\n🔍 Probando endpoint de obtener progreso...');
    const progressResponse = await axios.get(
      `${BASE_URL}/progress-tracking/patient/${patientId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('\n📦 RESPUESTA DE PROGRESO:');
    console.log('Status:', progressResponse.status);
    console.log('Datos:', JSON.stringify(progressResponse.data, null, 2));

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

debugProgressResponse(); 