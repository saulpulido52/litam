import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

async function testBackendConnection() {
  console.log('🧪 Probando conexión con el backend...');

  try {
    // Test 1: Verificar que el servidor está funcionando
    console.log('\n1️⃣ Verificando que el servidor está funcionando...');
    
    const healthCheck = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Servidor funcionando:', healthCheck.status);

    // Test 2: Verificar que hay expedientes en la base de datos
    console.log('\n2️⃣ Verificando expedientes en la base de datos...');
    
    // Usar un ID de paciente de prueba que sabemos que existe
    const testPatientId = '5ce326e6-1b80-423e-86cc-404928acffd2';
    
    try {
      const recordsResponse = await axios.get(`${API_BASE_URL}/clinical-records/patient/${testPatientId}`);
      console.log('✅ Expedientes obtenidos:', recordsResponse.data);
      console.log(`   - Total de expedientes: ${recordsResponse.data.data?.records?.length || 0}`);
      
      if (recordsResponse.data.data?.records?.length > 0) {
        const firstRecord = recordsResponse.data.data.records[0];
        console.log('   - Primer expediente:');
        console.log(`     * ID: ${firstRecord.id}`);
        console.log(`     * Fecha: ${firstRecord.record_date}`);
        console.log(`     * Motivo: ${firstRecord.consultation_reason}`);
        console.log(`     * Diagnóstico: ${firstRecord.nutritional_diagnosis}`);
      }
    } catch (error: any) {
      console.log('⚠️ Error al obtener expedientes:', error.response?.status, error.response?.data?.message);
    }

    // Test 3: Verificar endpoint de conteo
    console.log('\n3️⃣ Verificando endpoint de conteo...');
    
    try {
      const countResponse = await axios.get(`${API_BASE_URL}/clinical-records/patient/${testPatientId}/count`);
      console.log('✅ Conteo de expedientes:', countResponse.data);
    } catch (error: any) {
      console.log('⚠️ Error al obtener conteo:', error.response?.status, error.response?.data?.message);
    }

    // Test 4: Verificar endpoint de estadísticas
    console.log('\n4️⃣ Verificando endpoint de estadísticas...');
    
    try {
      const statsResponse = await axios.get(`${API_BASE_URL}/clinical-records/patient/${testPatientId}/stats`);
      console.log('✅ Estadísticas de expedientes:', statsResponse.data);
    } catch (error: any) {
      console.log('⚠️ Error al obtener estadísticas:', error.response?.status, error.response?.data?.message);
    }

    console.log('\n🎉 Tests de conexión completados!');

  } catch (error: any) {
    console.error('❌ Error en los tests de conexión:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   El servidor no está ejecutándose en http://localhost:4000');
      console.error('   Asegúrate de que el backend esté iniciado con: npm run dev');
    }
  }
}

// Ejecutar el test
testBackendConnection(); 