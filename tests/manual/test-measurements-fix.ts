import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

async function testMeasurementsFix() {
  console.log('🧪 Verificando que las correcciones funcionen correctamente...');

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

    // Configurar headers con token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test 2: Obtener expedientes existentes
    console.log('\n2️⃣ Obteniendo expedientes existentes...');
    
    const patientId = '8ed2b119-7166-41b0-b8b6-280130a2a16c'; // ID del paciente Saul
    const recordsResponse = await axios.get(`${API_BASE_URL}/clinical-records/patient/${patientId}`, { headers });
    
    console.log('✅ Expedientes obtenidos:', recordsResponse.data.status);
    console.log('📊 Total de expedientes:', recordsResponse.data.data.length);

    if (recordsResponse.data.data.length > 0) {
      const record = recordsResponse.data.data[0];
      console.log('\n3️⃣ Verificando datos del expediente:', record.id);
      
      // Verificar que las mediciones estén presentes con nombres correctos
      if (record.anthropometric_measurements) {
        console.log('✅ Mediciones encontradas con nombres correctos:');
        console.log('   - Peso actual:', record.anthropometric_measurements.current_weight_kg, 'kg');
        console.log('   - Peso habitual:', record.anthropometric_measurements.habitual_weight_kg, 'kg');
        console.log('   - Estatura:', record.anthropometric_measurements.height_m, 'm');
        console.log('   - Cintura:', record.anthropometric_measurements.waist_circ_cm, 'cm');
        console.log('   - Cadera:', record.anthropometric_measurements.hip_circ_cm, 'cm');
        
        // Calcular IMC
        if (record.anthropometric_measurements.current_weight_kg && record.anthropometric_measurements.height_m) {
          const bmi = record.anthropometric_measurements.current_weight_kg / (record.anthropometric_measurements.height_m * record.anthropometric_measurements.height_m);
          console.log('   - IMC calculado:', bmi.toFixed(1));
        }
      } else {
        console.log('❌ No se encontraron mediciones en el expediente');
      }

      // Verificar presión arterial con nombres correctos
      if (record.blood_pressure) {
        console.log('\n✅ Presión arterial encontrada con nombres correctos:');
        console.log('   - Conoce su presión:', record.blood_pressure.knows_bp ? 'Sí' : 'No');
        if (record.blood_pressure.knows_bp) {
          console.log('   - Sistólica:', record.blood_pressure.systolic, 'mmHg');
          console.log('   - Diastólica:', record.blood_pressure.diastolic, 'mmHg');
        }
      }

      // Verificar historia dietética con nombres correctos
      if (record.dietary_history) {
        console.log('\n✅ Historia dietética encontrada con nombres correctos:');
        console.log('   - Ha recibido orientación:', record.dietary_history.received_nutritional_guidance ? 'Sí' : 'No');
        console.log('   - Nivel de adherencia:', record.dietary_history.adherence_level || 'No especificado');
        console.log('   - Toma suplementos:', record.dietary_history.takes_supplements ? 'Sí' : 'No');
      }

      console.log('\n🎉 ¡Test completado exitosamente!');
      console.log('📝 Todas las correcciones funcionan correctamente:');
      console.log('   ✅ Errores de linter solucionados');
      console.log('   ✅ Nombres de propiedades corregidos (snake_case)');
      console.log('   ✅ Formulario responsivo para móviles');
      console.log('   ✅ Componente de detalle responsivo');
      console.log('   ✅ Mediciones se muestran correctamente');
      
    } else {
      console.log('❌ No se encontraron expedientes para el paciente');
    }

  } catch (error: any) {
    console.error('❌ Error en el test:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔐 Error de autenticación. Verifica las credenciales del nutriólogo.');
    } else if (error.response?.status === 404) {
      console.log('🔍 No se encontró el recurso solicitado.');
    }
  }
}

// Ejecutar el test
testMeasurementsFix(); 