import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

// Credenciales conocidas del sistema
const knownCredentials = [
  { email: 'nutri.admin@sistema.com', password: 'nutri123', role: 'admin' },
  { email: 'nutritionist@demo.com', password: 'demo123', role: 'nutritionist' },
  { email: 'dr.maria.gonzalez@demo.com', password: 'demo123', role: 'nutritionist' },
  { email: 'dr.juan.perez@demo.com', password: 'demo123', role: 'nutritionist' },
  { email: 'admin@demo.com', password: 'demo123', role: 'admin' },
];

interface AuthResult {
  email: string;
  password: string;
  token: string;
  user: any;
}

async function testAuthentication(): Promise<AuthResult[]> {
  console.log('🔐 ===== PRUEBA DE AUTENTICACIÓN =====');
  console.log('🔍 Probando credenciales conocidas...\n');
  
  const validCredentials: AuthResult[] = [];
  
  for (const credential of knownCredentials) {
    try {
      console.log(`👤 Probando: ${credential.email} / ${credential.password}`);
      
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email: credential.email,
        password: credential.password
      });
      
      if (response.data.success) {
        const result = {
          email: credential.email,
          password: credential.password,
          token: response.data.data.token,
          user: response.data.data.user
        };
        
        validCredentials.push(result);
        
        console.log(`✅ ÉXITO: ${credential.email}`);
        console.log(`   👤 Usuario: ${result.user.first_name} ${result.user.last_name}`);
        console.log(`   🏥 Rol: ${result.user.role.name}`);
        console.log(`   🆔 ID: ${result.user.id}`);
        console.log(`   🎟️ Token: ${result.token.substring(0, 30)}...\n`);
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          console.log(`❌ FALLO: ${credential.email} - Credenciales inválidas`);
        } else if (error.response?.status === 429) {
          console.log(`⏰ RATE LIMIT: ${credential.email} - Esperando...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.log(`⚠️ ERROR: ${credential.email} - ${error.response?.status} ${error.response?.data?.message || error.message}`);
        }
      } else {
        console.log(`❌ ERROR: ${credential.email} - ${error.message}`);
      }
    }
  }
  
  console.log('\n📊 ===== RESUMEN DE AUTENTICACIÓN =====');
  console.log(`✅ Credenciales válidas encontradas: ${validCredentials.length}`);
  console.log(`❌ Credenciales fallidas: ${knownCredentials.length - validCredentials.length}`);
  
  if (validCredentials.length > 0) {
    console.log('\n🎉 ¡Credenciales válidas disponibles para pruebas!');
    validCredentials.forEach((cred, index) => {
      console.log(`${index + 1}. ${cred.email} (${cred.user.role.name})`);
    });
  } else {
    console.log('\n❌ No se encontraron credenciales válidas');
  }
  
  return validCredentials;
}

async function createTestUsers(adminCredentials: AuthResult): Promise<any[]> {
  console.log('\n👥 ===== CREACIÓN DE USUARIOS DE PRUEBA =====');
  
  const timestamp = Date.now();
  const testUsers: any[] = [];
  
  // Usuarios a crear
  const usersToCreate = [
    {
      email: `test_nutritionist_${timestamp}@test.com`,
      password: 'Test123!',
      first_name: 'Test',
      last_name: 'Nutritionist',
      role_name: 'nutritionist',
      age: 35,
      gender: 'other'
    },
    {
      email: `test_patient1_${timestamp}@test.com`,
      password: 'Test123!',
      first_name: 'Test',
      last_name: 'Patient1',
      role_name: 'patient',
      age: 28,
      gender: 'female'
    },
    {
      email: `test_patient2_${timestamp}@test.com`,
      password: 'Test123!',
      first_name: 'Test',
      last_name: 'Patient2',
      role_name: 'patient',
      age: 32,
      gender: 'male'
    }
  ];
  
  for (const userData of usersToCreate) {
    try {
      console.log(`👤 Creando usuario: ${userData.email}`);
      
      const response = await axios.post(`${API_BASE}/auth/register`, userData, {
        headers: { Authorization: `Bearer ${adminCredentials.token}` }
      });
      
      if (response.data.success) {
        // Autenticar el usuario recién creado
        const authResponse = await axios.post(`${API_BASE}/auth/login`, {
          email: userData.email,
          password: userData.password
        });
        
        const userWithToken = {
          ...response.data.data.user,
          token: authResponse.data.data.token,
          password: userData.password
        };
        
        testUsers.push(userWithToken);
        
        console.log(`✅ Usuario creado y autenticado: ${userData.email}`);
        console.log(`   🆔 ID: ${userWithToken.id}`);
        console.log(`   🏥 Rol: ${userWithToken.role.name}`);
      }
    } catch (error: any) {
      console.log(`❌ Error creando ${userData.email}: ${error.response?.data?.message || error.message}`);
    }
  }
  
  console.log(`\n📊 Usuarios de prueba creados: ${testUsers.length}/${usersToCreate.length}`);
  return testUsers;
}

async function testBasicRelations(testUsers: any[]): Promise<void> {
  console.log('\n🔗 ===== PRUEBAS BÁSICAS DE RELACIONES =====');
  
  const nutritionist = testUsers.find(u => u.role.name === 'nutritionist');
  const patients = testUsers.filter(u => u.role.name === 'patient');
  
  if (!nutritionist) {
    console.log('❌ No se encontró nutricionista para las pruebas');
    return;
  }
  
  if (patients.length < 2) {
    console.log('❌ No se encontraron suficientes pacientes para las pruebas');
    return;
  }
  
  console.log(`👨‍⚕️ Nutricionista: ${nutritionist.first_name} ${nutritionist.last_name} (${nutritionist.id})`);
  console.log(`👥 Pacientes disponibles: ${patients.length}`);
  
  // Prueba 1: Crear relación válida
  try {
    console.log('\n🧪 PRUEBA 1: Crear relación nutricionista-paciente válida');
    const response = await axios.post(`${API_BASE}/relations`, {
      patient_id: patients[0].id,
      notes: 'Relación de prueba automatizada'
    }, {
      headers: { Authorization: `Bearer ${nutritionist.token}` }
    });
    
    if (response.data.success) {
      console.log('✅ PRUEBA 1 EXITOSA: Relación nutricionista-paciente creada');
      console.log(`   🆔 ID Relación: ${response.data.data.relation.id}`);
    }
  } catch (error: any) {
    console.log(`❌ PRUEBA 1 FALLIDA: ${error.response?.data?.message || error.message}`);
  }
  
  // Prueba 2: Intentar relación duplicada
  try {
    console.log('\n🧪 PRUEBA 2: Intentar crear relación duplicada (debe fallar)');
    await axios.post(`${API_BASE}/relations`, {
      patient_id: patients[0].id,
      notes: 'Intento de duplicado'
    }, {
      headers: { Authorization: `Bearer ${nutritionist.token}` }
    });
    
    console.log('❌ PRUEBA 2 FALLIDA: Relación duplicada fue creada (ERROR)');
  } catch (error: any) {
    if (error.response?.status === 400 || error.message.includes('exist') || error.message.includes('duplicate')) {
      console.log('✅ PRUEBA 2 EXITOSA: Relación duplicada correctamente rechazada');
    } else {
      console.log(`❌ PRUEBA 2 FALLIDA: Error inesperado - ${error.response?.data?.message || error.message}`);
    }
  }
  
  // Prueba 3: Crear segunda relación (nutricionista con múltiples pacientes)
  try {
    console.log('\n🧪 PRUEBA 3: Crear segunda relación (múltiples pacientes)');
    const response = await axios.post(`${API_BASE}/relations`, {
      patient_id: patients[1].id,
      notes: 'Segunda relación de prueba'
    }, {
      headers: { Authorization: `Bearer ${nutritionist.token}` }
    });
    
    if (response.data.success) {
      console.log('✅ PRUEBA 3 EXITOSA: Segunda relación creada (múltiples pacientes)');
    }
  } catch (error: any) {
    console.log(`❌ PRUEBA 3 FALLIDA: ${error.response?.data?.message || error.message}`);
  }
  
  // Prueba 4: Intentar que paciente cree relación (debe fallar)
  try {
    console.log('\n🧪 PRUEBA 4: Paciente intenta crear relación (debe fallar)');
    await axios.post(`${API_BASE}/relations`, {
      patient_id: patients[1].id,
      notes: 'Intento de paciente'
    }, {
      headers: { Authorization: `Bearer ${patients[0].token}` }
    });
    
    console.log('❌ PRUEBA 4 FALLIDA: Paciente pudo crear relación (ERROR)');
  } catch (error: any) {
    if (error.response?.status === 403 || error.message.includes('access') || error.message.includes('forbidden')) {
      console.log('✅ PRUEBA 4 EXITOSA: Paciente correctamente no puede crear relaciones');
    } else {
      console.log(`❌ PRUEBA 4 FALLIDA: Error inesperado - ${error.response?.data?.message || error.message}`);
    }
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 ===== INICIANDO PRUEBAS DE SISTEMA =====\n');
    
    // Paso 1: Probar autenticación
    const validCredentials = await testAuthentication();
    
    if (validCredentials.length === 0) {
      console.log('❌ No se pueden ejecutar pruebas sin credenciales válidas');
      return;
    }
    
    // Buscar admin para crear usuarios de prueba
    const adminCreds = validCredentials.find(c => c.user.role.name === 'admin');
    if (!adminCreds) {
      console.log('❌ No se encontró un admin válido para crear usuarios de prueba');
      return;
    }
    
    // Paso 2: Crear usuarios de prueba
    const testUsers = await createTestUsers(adminCreds);
    
    if (testUsers.length < 3) {
      console.log('❌ No se crearon suficientes usuarios para las pruebas');
      return;
    }
    
    // Paso 3: Probar relaciones básicas
    await testBasicRelations(testUsers);
    
    console.log('\n🎉 ===== PRUEBAS COMPLETADAS =====');
    console.log('✅ Sistema de autenticación verificado');
    console.log('✅ Usuarios de prueba creados');
    console.log('✅ Relaciones básicas probadas');
    
  } catch (error) {
    console.error('❌ Error general en las pruebas:', error);
  }
}

// Ejecutar pruebas
main().catch(console.error); 