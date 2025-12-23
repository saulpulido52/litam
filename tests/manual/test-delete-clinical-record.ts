import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

async function testDeleteClinicalRecord() {
  try {
    console.log('🧪 Probando endpoint DELETE de expedientes clínicos...');
    
    // Primero necesitamos crear un expediente para luego eliminarlo
    console.log('1. Creando expediente de prueba...');
    
    // Crear nutriólogo
    const nutritionistData = {
      email: 'test.nutri@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'Nutri'
    };
    
    const nutriRes = await axios.post(`${API_BASE_URL}/auth/register/nutritionist`, nutritionistData);
    const nutritionistToken = nutriRes.data.data.token;
    
    // Crear paciente
    const patientData = {
      email: 'test.patient@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'Patient'
    };
    
    const patientRes = await axios.post(`${API_BASE_URL}/auth/register/patient`, patientData);
    const patientId = patientRes.data.data.user.id;
    
    // Crear expediente clínico
    const clinicalData = {
      patientId,
      recordDate: '2024-01-15',
      consultationReason: 'Test consultation'
    };
    
    const createRes = await axios.post(`${API_BASE_URL}/clinical-records`, clinicalData, {
      headers: { Authorization: `Bearer ${nutritionistToken}` }
    });
    
    const recordId = createRes.data.data.record.id;
    console.log(`✅ Expediente creado con ID: ${recordId}`);
    
    // Ahora probar la eliminación
    console.log('2. Probando eliminación del expediente...');
    
    const deleteRes = await axios.delete(`${API_BASE_URL}/clinical-records/${recordId}`, {
      headers: { Authorization: `Bearer ${nutritionistToken}` }
    });
    
    console.log('📊 Respuesta del endpoint DELETE:');
    console.log(`   Status: ${deleteRes.status}`);
    console.log(`   Status Text: ${deleteRes.statusText}`);
    console.log(`   Data:`, deleteRes.data);
    
    // Verificar que la respuesta sea correcta
    if (deleteRes.status === 200) {
      console.log('✅ SUCCESS: El endpoint ahora retorna status 200');
      
      if (deleteRes.data && deleteRes.data.status === 'success') {
        console.log('✅ SUCCESS: La respuesta incluye JSON con status: success');
        console.log('✅ SUCCESS: El mensaje es:', deleteRes.data.message);
      } else {
        console.log('❌ ERROR: La respuesta no incluye el JSON esperado');
      }
    } else {
      console.log(`❌ ERROR: Status inesperado: ${deleteRes.status}`);
    }
    
    // Verificar que el expediente ya no existe
    console.log('3. Verificando que el expediente fue eliminado...');
    
    try {
      await axios.get(`${API_BASE_URL}/clinical-records/${recordId}`, {
        headers: { Authorization: `Bearer ${nutritionistToken}` }
      });
      console.log('❌ ERROR: El expediente aún existe después de la eliminación');
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('✅ SUCCESS: El expediente fue eliminado correctamente (404 Not Found)');
      } else {
        console.log('⚠️  WARNING: Error inesperado al verificar eliminación:', error.response?.status);
      }
    }
    
  } catch (error: any) {
    console.error('❌ ERROR en el test:', error.response?.data || error.message);
  }
}

// Ejecutar el test
testDeleteClinicalRecord(); 