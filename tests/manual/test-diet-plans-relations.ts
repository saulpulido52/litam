import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

// Datos de prueba
const testNutritionist = {
  email: 'dr.maria.gonzalez@demo.com',
  password: 'demo123'
};

let authToken = '';

async function login() {
  try {
    console.log('🔐 Iniciando sesión...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testNutritionist.email,
      password: testNutritionist.password
    });

    authToken = response.data.data.token;
    console.log('✅ Login exitoso');
    return true;
  } catch (error: any) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    return false;
  }
}

async function getMyPatients() {
  try {
    console.log('\n👥 Obteniendo mis pacientes...');
    const response = await axios.get(`${API_BASE_URL}/patients/my-patients`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ Pacientes obtenidos:', response.data.data.patients.length);
    return response.data.data.patients;
  } catch (error: any) {
    console.error('❌ Error obteniendo pacientes:', error.response?.data || error.message);
    return [];
  }
}

async function getAllPatients() {
  try {
    console.log('\n👥 Obteniendo todos los pacientes...');
    const response = await axios.get(`${API_BASE_URL}/patients`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ Todos los pacientes obtenidos:', response.data.data.patients.length);
    return response.data.data.patients;
  } catch (error: any) {
    console.error('❌ Error obteniendo todos los pacientes:', error.response?.data || error.message);
    return [];
  }
}

async function createRelation(patientId: string) {
  try {
    console.log(`\n🔗 Creando relación con paciente ${patientId}...`);
    const response = await axios.post(`${API_BASE_URL}/relations`, {
      patientId: patientId,
      status: 'pending'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ Relación creada:', response.data.data.relation.id);
    return response.data.data.relation;
  } catch (error: any) {
    console.error('❌ Error creando relación:', error.response?.data || error.message);
    return null;
  }
}

async function acceptRelation(relationId: string) {
  try {
    console.log(`\n✅ Aceptando relación ${relationId}...`);
    const response = await axios.patch(`${API_BASE_URL}/relations/${relationId}/accept`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ Relación aceptada');
    return response.data.data.relation;
  } catch (error: any) {
    console.error('❌ Error aceptando relación:', error.response?.data || error.message);
    return null;
  }
}

async function runRelationsTest() {
  console.log('🚀 Verificando relaciones nutricionista-paciente...\n');

  // 1. Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ No se pudo iniciar sesión. Abortando.');
    return;
  }

  // 2. Obtener mis pacientes actuales
  const myPatients = await getMyPatients();
  console.log(`📊 Pacientes vinculados actualmente: ${myPatients.length}`);

  if (myPatients.length === 0) {
    console.log('⚠️ No hay pacientes vinculados. Obteniendo todos los pacientes...');
    
    // 3. Obtener todos los pacientes disponibles
    const allPatients = await getAllPatients();
    
    if (allPatients.length > 0) {
      // 4. Crear relación con el primer paciente
      const firstPatient = allPatients[0];
      console.log(`\n👤 Paciente seleccionado: ${firstPatient.first_name} ${firstPatient.last_name} (${firstPatient.id})`);
      
      const relation = await createRelation(firstPatient.id);
      if (relation) {
        // 5. Aceptar la relación
        await acceptRelation(relation.id);
        
        // 6. Verificar que ahora tengo pacientes
        const updatedPatients = await getMyPatients();
        console.log(`📊 Pacientes vinculados después: ${updatedPatients.length}`);
        
        if (updatedPatients.length > 0) {
          console.log('✅ Relación creada y aceptada exitosamente');
          return updatedPatients[0]; // Retornar el primer paciente vinculado
        }
      }
    } else {
      console.log('❌ No hay pacientes disponibles en el sistema');
    }
  } else {
    console.log('✅ Ya tienes pacientes vinculados');
    return myPatients[0]; // Retornar el primer paciente vinculado
  }

  return null;
}

// Ejecutar la prueba
runRelationsTest().catch(console.error); 