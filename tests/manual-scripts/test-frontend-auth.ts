import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

async function testFrontendAuth() {
  console.log('🧪 Probando autenticación y expedientes desde el frontend...');

  try {
    // Test 1: Login como nutriólogo
    console.log('\n1️⃣ Iniciando sesión como nutriólogo...');
    
    const loginData = {
      email: 'nutritionist@demo.com',
      password: 'password123'
    };

    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
    console.log('✅ Login exitoso:', loginResponse.data.status);
    
    const token = loginResponse.data.data.token;
    console.log('🔑 Token obtenido:', token ? `${token.substring(0, 20)}...` : 'No token');

    // Test 2: Obtener expedientes con token
    console.log('\n2️⃣ Obteniendo expedientes con token...');
    
    const testPatientId = '5ce326e6-1b80-423e-86cc-404928acffd2';
    
    const recordsResponse = await axios.get(`${API_BASE_URL}/clinical-records/patient/${testPatientId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Expedientes obtenidos exitosamente');
    console.log(`   - Total de expedientes: ${recordsResponse.data.data?.records?.length || 0}`);
    
    if (recordsResponse.data.data?.records?.length > 0) {
      const firstRecord = recordsResponse.data.data.records[0];
      console.log('   - Primer expediente:');
      console.log(`     * ID: ${firstRecord.id}`);
      console.log(`     * Fecha: ${firstRecord.record_date}`);
      console.log(`     * Número: ${firstRecord.expedient_number}`);
      console.log(`     * Motivo: ${firstRecord.consultation_reason}`);
      console.log(`     * Diagnóstico: ${firstRecord.nutritional_diagnosis}`);
      console.log(`     * Plan: ${firstRecord.nutritional_plan_and_management}`);
      
      // Verificar datos específicos que se ingresaron
      if (firstRecord.current_problems) {
        console.log('   - Problemas actuales:');
        console.log(`     * Diarrea: ${firstRecord.current_problems.diarrhea}`);
        console.log(`     * Úlcera: ${firstRecord.current_problems.ulcer}`);
        console.log(`     * Vómito: ${firstRecord.current_problems.vomiting}`);
        console.log(`     * Mecánicos boca: ${firstRecord.current_problems.mouthMechanics}`);
      }
      
      if (firstRecord.anthropometric_measurements) {
        console.log('   - Mediciones:');
        console.log(`     * Peso: ${firstRecord.anthropometric_measurements.currentWeightKg} kg`);
        console.log(`     * Altura: ${firstRecord.anthropometric_measurements.heightM} m`);
        console.log(`     * Cintura: ${firstRecord.anthropometric_measurements.waistCircCm} cm`);
        console.log(`     * Cadera: ${firstRecord.anthropometric_measurements.hipCircCm} cm`);
      }
      
      if (firstRecord.dietary_history) {
        console.log('   - Historia dietética:');
        console.log(`     * Orientación previa: ${firstRecord.dietary_history.receivedNutritionalGuidance}`);
        console.log(`     * Adherencia: ${firstRecord.dietary_history.adherenceLevel}`);
        console.log(`     * Suplementos: ${firstRecord.dietary_history.takesSupplements}`);
      }
    }

    // Test 3: Obtener conteo de expedientes
    console.log('\n3️⃣ Obteniendo conteo de expedientes...');
    
    const countResponse = await axios.get(`${API_BASE_URL}/clinical-records/patient/${testPatientId}/count`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Conteo obtenido:', countResponse.data.data.count);

    // Test 4: Obtener estadísticas
    console.log('\n4️⃣ Obteniendo estadísticas...');
    
    const statsResponse = await axios.get(`${API_BASE_URL}/clinical-records/patient/${testPatientId}/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Estadísticas obtenidas:', statsResponse.data.data.stats.total_records, 'expedientes totales');

    console.log('\n🎉 Todos los tests de autenticación y expedientes pasaron exitosamente!');

  } catch (error: any) {
    console.error('❌ Error en los tests:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Ejecutar el test
testFrontendAuth(); 